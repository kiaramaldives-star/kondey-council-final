-- =====================================================================
--  KONDEY COUNCIL WEBSITE - DATABASE SETUP
--  Run this whole file ONCE in Supabase:  SQL Editor -> New query -> paste -> Run
--  It is safe to run again (it will not delete your content).
-- =====================================================================

-- ---------- 1. Staff profiles and roles ----------
--  none     : signed up but no access yet (the default)
--  editor   : can write and send items for approval
--  approver : can also publish, unpublish and delete
--  admin    : approver + can change staff roles
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  full_name  text,
  role       text not null default 'none' check (role in ('none','editor','approver','admin')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- staff who already existed before this script
insert into public.profiles (id, email)
select id, email from auth.users
on conflict (id) do nothing;

-- the current user's role (null for the public)
create or replace function public.my_role()
returns text language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;

-- true for editors, approvers and admins
create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.my_role() in ('editor','approver','admin'), false)
$$;

-- older versions of this script made new users editors; keep the constraint up to date
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('none','editor','approver','admin'));
alter table public.profiles alter column role set default 'none';

alter table public.profiles enable row level security;
drop policy if exists "read own profile or admin reads all" on public.profiles;
create policy "read own profile or admin reads all" on public.profiles
  for select to authenticated using (id = auth.uid() or public.my_role() = 'admin');
drop policy if exists "admin changes roles" on public.profiles;
create policy "admin changes roles" on public.profiles
  for update to authenticated using (public.my_role() = 'admin') with check (public.my_role() = 'admin');
grant select, update on public.profiles to authenticated;

-- ---------- 2. Website content (news, jobs, tenders, services, ...) ----------
create table if not exists public.content (
  id           uuid primary key default gen_random_uuid(),
  type         text not null check (type in ('news','vacancy','tender','service','document','meeting','gallery','member','page','setting')),
  status       text not null default 'draft' check (status in ('draft','pending','published')),
  data         jsonb not null default '{}'::jsonb,
  published_on date,
  pending_data jsonb,                      -- an editor's proposed changes to a published item
  note         text,                       -- approver's note when sending back
  created_by   uuid references auth.users(id),
  updated_by   uuid references auth.users(id),
  approved_by  uuid references auth.users(id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists content_type_status on public.content (type, status);
alter table public.content add column if not exists pending_data jsonb;

-- Only approvers/admins may publish. Runs on every save.
create or replace function public.content_guard()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  r text := public.my_role();
begin
  new.updated_at := now();
  if auth.uid() is not null then
    new.updated_by := auth.uid();
    if tg_op = 'INSERT' then new.created_by := auth.uid(); end if;
  end if;

  if new.status = 'published'
     and (tg_op = 'INSERT' or old.status <> 'published' or old.data is distinct from new.data) then
    if auth.uid() is not null and coalesce(r, '') not in ('approver','admin') then
      raise exception 'Only approvers can publish. Please send it for approval.';
    end if;
    new.approved_by := auth.uid();
    new.note := null;
    new.pending_data := null;
    if new.published_on is null then
      if (new.data->>'date') ~ '^\d{4}-\d{2}-\d{2}$' then
        new.published_on := (new.data->>'date')::date;
      else
        new.published_on := current_date;
      end if;
    end if;
  end if;
  return new;
end $$;

drop trigger if exists content_guard on public.content;
create trigger content_guard
  before insert or update on public.content
  for each row execute function public.content_guard();

alter table public.content enable row level security;
drop policy if exists "public reads published, staff read all" on public.content;
create policy "public reads published, staff read all" on public.content
  for select using (status = 'published' or public.is_staff());
drop policy if exists "staff add" on public.content;
create policy "staff add" on public.content
  for insert to authenticated with check (public.is_staff());
drop policy if exists "staff edit" on public.content;
create policy "staff edit" on public.content
  for update to authenticated using (public.is_staff()) with check (public.is_staff());
drop policy if exists "approvers delete" on public.content;
create policy "approvers delete" on public.content
  for delete to authenticated using (public.my_role() in ('approver','admin'));

grant select on public.content to anon, authenticated;
grant insert, update, delete on public.content to authenticated;

-- ---------- 3. Complaints and suggestions ----------
create sequence if not exists public.feedback_seq;
create table if not exists public.feedback (
  id         bigint primary key default nextval('public.feedback_seq'),
  ref_no     text unique,
  kind       text not null check (kind in ('complaint','suggestion')),
  name       text,
  phone      text,
  email      text,
  message    text not null check (char_length(message) between 5 and 4000),
  handled    boolean not null default false,
  staff_note text,
  created_at timestamptz not null default now()
);

alter table public.feedback enable row level security;
drop policy if exists "staff read feedback" on public.feedback;
create policy "staff read feedback" on public.feedback
  for select to authenticated using (public.is_staff());
drop policy if exists "staff update feedback" on public.feedback;
create policy "staff update feedback" on public.feedback
  for update to authenticated using (public.is_staff());
revoke insert, delete on public.feedback from anon, authenticated;
grant select, update on public.feedback to authenticated;

-- The public form calls this; it returns the reference number (e.g. KC-2026-00012).
create or replace function public.submit_feedback(
  p_kind text, p_name text, p_phone text, p_email text, p_message text)
returns text language plpgsql security definer set search_path = public as $$
declare
  v_id  bigint := nextval('public.feedback_seq');
  v_ref text   := 'KC-' || to_char(now(), 'YYYY') || '-' || lpad(v_id::text, 5, '0');
begin
  if p_kind not in ('complaint','suggestion') then raise exception 'Invalid type'; end if;
  if coalesce(trim(p_name), '') = '' or coalesce(trim(p_phone), '') = '' then
    raise exception 'Name and phone are required';
  end if;
  insert into public.feedback (id, ref_no, kind, name, phone, email, message)
  values (v_id, v_ref, p_kind, left(trim(p_name), 100), left(trim(p_phone), 30),
          nullif(left(trim(coalesce(p_email, '')), 120), ''), left(trim(p_message), 4000));
  return v_ref;
end $$;
revoke all on function public.submit_feedback(text,text,text,text,text) from public;
grant execute on function public.submit_feedback(text,text,text,text,text) to anon, authenticated;

-- ---------- 4. File storage for photos and documents ----------
insert into storage.buckets (id, name, public, file_size_limit)
values ('media', 'media', true, 20971520)          -- 20 MB per file
on conflict (id) do nothing;

drop policy if exists "staff upload media" on storage.objects;
create policy "staff upload media" on storage.objects
  for insert to authenticated with check (bucket_id = 'media' and public.is_staff());
drop policy if exists "staff update media" on storage.objects;
create policy "staff update media" on storage.objects
  for update to authenticated using (bucket_id = 'media' and public.is_staff());
drop policy if exists "approvers delete media" on storage.objects;
create policy "approvers delete media" on storage.objects
  for delete to authenticated using (bucket_id = 'media' and public.my_role() in ('approver','admin'));

-- ---------- 5. Starting content (settings, pages, council members, services) ----------
-- Only added if the website has no content yet.
insert into public.content (type, status, data)
select r->>'type', 'published', r->'data'
from jsonb_array_elements('[{"type":"setting","data":{"key":"site","hero_title_dv":"ގއ. ކޮނޑޭ ކައުންސިލްގެ ރަސްމީ ވެބްސައިޓަށް މަރުޙަބާ","hero_title_en":"Welcome to the official website of GA. Kondey Council","hero_sub_dv":"ރަށުގެ ޚަބަރު، އިޢުލާނާއި ކައުންސިލުގެ ޚިދުމަތްތައް އެއް ތަނަކުން","hero_sub_en":"Island news, announcements and council services in one place","hero_photos":"https://picsum.photos/seed/kondey-island/1600/900\nhttps://picsum.photos/seed/kondey-harbour/1600/900\nhttps://picsum.photos/seed/kondey-reef/1600/900","population":"1200","area":"85","households":"240","phone":"+960 682-0019","hotline":"+960 723-0019","email":"info@kondey.gov.mv","website":"kondey.gov.mv","address_dv":"ކައުންސިލް އިދާރާ، ގއ. ކޮނޑޭ، ދިވެހިރާއްޖެ","address_en":"Council Office, GA. Kondey, Maldives","hours_dv":"އާދިއްތަ - ހޯމަ: 08:00 - 14:00\nހުކުރު، ހޮނިހިރު: ބަންދު","hours_en":"Sunday - Thursday: 08:00 - 14:00\nFriday, Saturday: Closed","facebook":"","instagram":"","x":"","map_query":"Kondey, Gaafu Alifu Atoll, Maldives"}},{"type":"page","data":{"slug":"council","title_dv":"ކައުންސިލާ ބެހޭ","title_en":"About the Council","body_dv":"ގއ. ކޮނޑޭ ކައުންސިލަކީ ރަށުގެ ރައްޔިތުންގެ ޚިދުމަތުގައި ރަށު ތަރައްގީއާއި އާންމު ޚިދުމަތްތައް ހިންގުމުގެ ޒިންމާ އުފުލާ މުއައްސަސާއެވެ.\n\nކައުންސިލް ހިމެނެނީ ރައްޔިތުންގެ ވޯޓުން ހޮވާ 3 މެންބަރުންނެވެ. ކައުންސިލުގެ ޖަލްސާތައް މަހަކު އެއްފަހަރު މަދުވެގެން ބާއްވައެވެ.","body_en":"GA. Kondey Council serves the people of the island, leading local development and running public services.\n\nThe council has 3 members elected by residents. Council meetings are held at least once a month.","photo":"https://picsum.photos/seed/kondey-office/900/680"}},{"type":"page","data":{"slug":"island","title_dv":"ގއ. ކޮނޑޭ","title_en":"GA. Kondey","body_dv":"ކޮނޑޭއަކީ ގއ. އަތޮޅުގައި އޮންނަ ރީތި ރަށެކެވެ. ރަށުގެ ރައްޔިތުންގެ މައިގަނޑު ދިރިއުޅުމަކީ މަސްވެރިކަމާއި ދަނޑުވެރިކަމެވެ.\n\nރަށުގެ ތާރީޚާއި ސަގާފަތާއި ރަށުގެ ދިރިއުޅުމާ ބެހޭ މަޢުލޫމާތު މިތަނުން ލިބިވަޑައިގަންނަވާނެއެވެ.","body_en":"Kondey is a beautiful island in Gaafu Alifu Atoll. Fishing and farming are the main livelihoods on the island.\n\nFind information here about the island''s history, culture and community life.","land_use_url":"","photo":"https://picsum.photos/seed/kondey-about/900/680"}},{"type":"member","data":{"sort":1,"name_dv":"ނަސްރު މުޙައްމަދު ދީދީ","name_en":"Nasru Mohamed Didi","role_dv":"ރައީސް","role_en":"President","phone":"682-1050","mobile":"777-0630","email":"nasru.mohameddidi@kondey.gov.mv","photo":"images/president.jpg"}},{"type":"member","data":{"sort":2,"name_dv":"ޢާއިޝަތު ޝިފްޒާ އިބްރާޙީމް","name_en":"Aishath Shifza Ibrahim","role_dv":"ނައިބު ރައީސް","role_en":"Vice President","phone":"682-1051","mobile":"772-5584","email":"aishath.shifza@kondey.gov.mv","photo":"images/vice-president.jpg"}},{"type":"member","data":{"sort":3,"name_dv":"މުޙައްމަދު ޝާވިން ސަޢީދު","name_en":"Mohamed Shavin Saeed","role_dv":"މެންބަރު","role_en":"Member","phone":"682-1053","mobile":"956-7968","email":"mohamed.shavinsaeed@kondey.gov.mv","photo":""}},{"type":"service","data":{"sort":1,"icon":"home","name_dv":"ބިމާއި ގޯތި","name_en":"Land and plots","desc_dv":"ގޯތީގެ ހުއްދަ، ބިމުގެ ރަޖިސްޓްރީ","desc_en":"Plot permits and land registry","requirements_dv":"ފުރިހަމަކޮށްފައިވާ ފޯމު\nއައިޑީ ކާޑުގެ ކޮޕީ\nބިމުގެ ސާޓިފިކެޓުގެ ކޮޕީ","requirements_en":"Completed form\nCopy of ID card\nCopy of land certificate","fee":"MVR 100","duration_dv":"10 ދުވަސް","duration_en":"10 days","form":""}},{"type":"service","data":{"sort":2,"icon":"doc","name_dv":"ސެޓްފިކެޓް ދޫކުރުން","name_en":"Certificates","desc_dv":"ދިރިއުޅޭ ތަނުގެ ސެޓްފިކެޓް އަދި ލިޔުންތައް","desc_en":"Residence certificates and letters","requirements_dv":"ފުރިހަމަކޮށްފައިވާ ފޯމު\nއައިޑީ ކާޑުގެ ކޮޕީ","requirements_en":"Completed form\nCopy of ID card","fee":"MVR 50","duration_dv":"3 ދުވަސް","duration_en":"3 days","form":""}},{"type":"service","data":{"sort":3,"icon":"person","name_dv":"އުފަންވުމާއި މަރުވުން","name_en":"Births and deaths","desc_dv":"ރަޖިސްޓްރީ ކުރުމާއި ސެޓްފިކެޓް","desc_en":"Registration and certificates","requirements_dv":"ހޮސްޕިޓަލުން ދޫކުރާ ލިޔުން\nބެލެނިވެރިންގެ އައިޑީ ކާޑު","requirements_en":"Hospital letter\nParents'' ID cards","fee":"ހިލޭ / Free","duration_dv":"1 ދުވަސް","duration_en":"1 day","form":""}},{"type":"service","data":{"sort":4,"icon":"shop","name_dv":"ވިޔަފާރީގެ ހުއްދަ","name_en":"Business permits","desc_dv":"ފިހާރަ، ކެފޭ އަދި އެހެނިހެން ވިޔަފާރި","desc_en":"Shops, cafés and other businesses","requirements_dv":"ފުރިހަމަކޮށްފައިވާ ފޯމު\nވިޔަފާރި ރަޖިސްޓްރީގެ ކޮޕީ\nތަނުގެ ކުއްޔަށް ދިނުމުގެ އެއްބަސްވުން","requirements_en":"Completed form\nBusiness registration copy\nTenancy agreement","fee":"MVR 250","duration_dv":"5 ދުވަސް","duration_en":"5 days","form":""}},{"type":"service","data":{"sort":5,"icon":"boat","name_dv":"ބަނދަރާއި ފަޅު","name_en":"Harbour","desc_dv":"އޮޑި ބެހެއްޓުމާއި ބަނދަރުގެ ޚިދުމަތް","desc_en":"Vessel mooring and harbour services","requirements_dv":"އުޅަނދުގެ ރަޖިސްޓްރީ\nވެރިފަރާތުގެ އައިޑީ ކާޑު","requirements_en":"Vessel registration\nOwner''s ID card","fee":"MVR 150 / month","duration_dv":"2 ދުވަސް","duration_en":"2 days","form":""}},{"type":"service","data":{"sort":6,"icon":"bin","name_dv":"ކުނި މެނޭޖްކުރުން","name_en":"Waste management","desc_dv":"ކުނި އުކާލުމާއި ސާފުތާހިރުކަން","desc_en":"Waste collection and cleanliness","requirements_dv":"ގޭގެ ނަމްބަރު\nފޯނު ނަމްބަރު","requirements_en":"House name\nPhone number","fee":"MVR 75 / month","duration_dv":"1 ދުވަސް","duration_en":"1 day","form":""}},{"type":"service","data":{"sort":7,"icon":"calendar","name_dv":"ތަންތަން ބުކްކުރުން","name_en":"Venue booking","desc_dv":"ހޯލް، ދަނޑު އަދި އާންމު ތަންތަން","desc_en":"Hall, field and public spaces","requirements_dv":"ފުރިހަމަކޮށްފައިވާ ފޯމު\nހަރަކާތުގެ ތަފްޞީލް","requirements_en":"Completed form\nDetails of the event","fee":"MVR 200","duration_dv":"3 ދުވަސް","duration_en":"3 days","form":""}},{"type":"service","data":{"sort":8,"icon":"chat","name_dv":"ޝަކުވާ ހުށަހެޅުން","name_en":"Complaints and suggestions","desc_dv":"ޚިޔާލާއި ޝަކުވާ ފޮނުވާލައްވާ","desc_en":"Send us your ideas and complaints","requirements_dv":"ވެބްސައިޓުގެ ފޯމު ފުރިހަމަކުރައްވާ","requirements_en":"Fill in the form on the Contact page","fee":"ހިލޭ / Free","duration_dv":"5 ދުވަސް","duration_en":"5 days","form":""}}]'::jsonb) as r
where not exists (select 1 from public.content);

-- ---------- 6. Make yourself the first admin ----------
-- After creating your own login (Authentication -> Users -> Add user),
-- change the email below and run just this line:
-- update public.profiles set role = 'admin' where email = 'your.email@kondey.gov.mv';
