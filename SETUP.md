# Kondey Council website — setup guide

This folder is the whole website:

| File / folder | What it is |
|---|---|
| `index.html` | The public website |
| `admin.html` | The staff page (sign in, write, approve) |
| `config.js` | Where you paste your Supabase details (step 3) |
| `supabase/schema.sql` | Sets up the database (step 2) |
| `css/`, `js/`, `fonts/`, `images/` | Styles, code, the MV Waheed and Faruma fonts, member photos |
| `docs/` | 14 **sample** PDFs (budget, reports, forms, minutes, tender documents, land-use plan) used only in demo mode. Each is marked SAMPLE. You can delete this folder once you go live. |

Supabase menu names change from time to time. If a button below has a slightly different name, look for the closest match.

---

## Step 0 — Try it first (demo mode, no setup)

While `config.js` is empty, the site runs in **demo mode** with sample content.

1. Double-click `index.html` to see the public website.
2. Double-click `admin.html` to open the staff page. Sign in with one of the demo accounts. The password for all three is `demo1234`.
   - `editor@demo.mv` can write items and send them for approval.
   - `approver@demo.mv` can publish, unpublish and delete.
   - `admin@demo.mv` is an approver who can also change staff roles.
3. Write a news item as the editor and send it for approval. Then sign in as the approver and publish it. Refresh `index.html` and it's there.

Demo changes are saved only in your own browser. Press **Reset demo content** on the staff page to start again.

---

## Step 1 — Create a free Supabase project

1. Go to **supabase.com** and sign up. You can use the council's Google account or an email address.
2. Press **New project**.
   - **Name:** `kondey-council`
   - **Database password:** make a strong one and **write it down somewhere safe**.
   - **Region:** choose the closest one to the Maldives, such as **Singapore** or **Mumbai**.
3. Wait about 2 minutes while it sets up.

## Step 2 — Set up the database

1. In your project, open **SQL Editor** in the left menu, then press **New query**.
2. Open `supabase/schema.sql` in Notepad, select everything (Ctrl+A), copy it, and paste it into the SQL Editor.
3. Press **Run**. You should see "Success". This creates:
   - the content tables
   - the security rules (only approvers can publish, and the public can't see drafts or complaints)
   - the complaint form
   - the photo and file storage
   - the starting content: site settings, the two pages, the 3 council members and 8 services

It is safe to run again later. It never deletes content.

## Step 3 — Connect the website to Supabase

1. In Supabase, open **Project Settings → API Keys**. Some versions call it **Data API**.
2. Copy the **Project URL**. It looks like `https://abcdefghijkl.supabase.co`.
3. Copy the **Publishable key**. It starts with `sb_publishable_`. Never use a key labelled **secret** or **service_role**.
4. Open `config.js` in Notepad and paste them between the quotes:

```js
window.KONDEY_CONFIG = {
  supabaseUrl: "https://abcdefghijkl.supabase.co",
  supabaseKey: "sb_publishable_xxxxxxxxxxxxxxxx"
};
```

5. Save. The DEMO label disappears, and the site now shows the real database.

## Step 4 — Lock sign-ups and make yourself the admin

1. **Turn off public sign-ups.** Go to **Authentication → Sign In / Providers** and switch off **Allow new users to sign up**. Only you will be able to add staff.
2. **Create your own login.** Go to **Authentication → Users → Add user → Create new user**. Enter your email and a password, and tick **Auto confirm user**.
3. **Make yourself admin.** In the SQL Editor, run this line with your own email:

```sql
update public.profiles set role = 'admin' where email = 'your.email@kondey.gov.mv';
```

4. Open `admin.html` and sign in.

## Step 5 — Add the other staff

1. In Supabase, go to **Authentication → Users → Add user**. Use **Send invitation** to email them, or **Create new user** to set a password yourself.
2. On the staff page, open **Staff & roles**. The new person is listed with **no access**. Choose their role and press **Save**:
   - **editor** writes items and sends them for approval.
   - **approver** can also publish, unpublish and delete. Usually this is the Secretary General.
   - **admin** is an approver who can also change staff roles.

New accounts can't see or change anything until an admin gives them a role.

## Step 6 — Put the website online

Any "static" web host works, because the website is just files. Two easy options:

- **Netlify (easiest):** go to **app.netlify.com/drop** and drag the whole `kondey-site` folder onto the page. You get a web address in seconds. To update the site later, drag the folder again.
- **GitHub Pages or Vercel:** upload the folder to a GitHub repository and turn on Pages, or import it into Vercel.

Then:

1. **Password-reset emails:** in Supabase, open **Authentication → URL Configuration**. Set **Site URL** to your website address, and add `https://your-address/admin.html` under **Redirect URLs**.
2. **Your own domain (kondey.gov.mv):** add the domain in Netlify or Vercel. Then ask whoever manages `.gov.mv` domains for the council to point it there. The host shows the exact DNS records to send them.

## Step 7 — Replace the sample content

On the staff page:

- **Site settings:** replace the slideshow photos, and check the population, land area, households, phones, opening hours and social media links.
- **About the council** and **Island profile:** write the real text, add photos, and upload the land-use plan PDF.
- **Council members:** add the photo of Mohamed Shavin Saeed.
- **Before launch:** add the real vacancies, tenders, documents, meeting decisions from the last 3 months, news and gallery photos.

The logo is a placeholder drawing. To use the real logo, save it as `images/logo.png` and ask for the two `<svg><use href="#logo"/></svg>` lines to be swapped for it.

---

## Good to know

- **Approval:** nothing an editor writes appears on the website until an approver publishes it. If an editor changes something that is already live, the old version stays on the website until the change is approved.
- **Vacancy and tender status:** this is worked out from the deadline. A post shows **Closing soon** in its last 3 days and **Closed** after the deadline.
- **Complaints and suggestions:** these arrive on the staff page and are never shown publicly. Each person gets a reference number such as `KC-2026-00012`.
- **Backups:** Supabase's paid plan includes daily backups. On the free plan, export your data now and then: **Database → Backups**, or **Table Editor → content → Export to CSV**. Check Supabase's current plans for details.
- **Free plan pause:** free projects can be paused after a long time with no visitors. Keep an eye on the email Supabase sends if that happens.
