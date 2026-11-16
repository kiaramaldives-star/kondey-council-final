/* Sample content shown in DEMO MODE (before Supabase is connected).
   Once Supabase is set up, all content comes from the staff page instead. */
(function () {
  const P = (seed, w, h) => `https://picsum.photos/seed/${seed}/${w || 1200}/${h || 700}`;
  const rows = [];
  let n = 0;
  const add = (type, data, extra) => rows.push(Object.assign({
    id: type + "-" + (++n), type, status: "published", data,
    published_on: data.date || "2026-11-01", created_at: "2026-11-01T08:00:00Z", updated_at: "2026-11-16T08:00:00Z", note: ""
  }, extra || {}));

  /* ---------- site settings ---------- */
  add("setting", {
    key: "site",
    hero_title_dv: "ގއ. ކޮނޑޭ ކައުންސިލްގެ ރަސްމީ ވެބްސައިޓަށް މަރުޙަބާ",
    hero_title_en: "Welcome to the official website of GA. Kondey Council",
    hero_sub_dv: "ރަށުގެ ޚަބަރު، އިޢުލާނާއި ކައުންސިލުގެ ޚިދުމަތްތައް އެއް ތަނަކުން",
    hero_sub_en: "Island news, announcements and council services in one place",
    hero_photos: [P("kondey-island", 1600, 900), P("kondey-harbour", 1600, 900), P("kondey-reef", 1600, 900)].join("\n"),
    population: "1200", area: "85", households: "240",
    phone: "+960 682-0019", hotline: "+960 723-0019",
    email: "info@kondey.gov.mv", website: "kondey.gov.mv",
    address_dv: "ކައުންސިލް އިދާރާ، ގއ. ކޮނޑޭ، ދިވެހިރާއްޖެ",
    address_en: "Council Office, GA. Kondey, Maldives",
    hours_dv: "އާދިއްތަ - ހޯމަ: 08:00 - 14:00\nހުކުރު، ހޮނިހިރު: ބަންދު",
    hours_en: "Sunday - Thursday: 08:00 - 14:00\nFriday, Saturday: Closed",
    facebook: "", instagram: "", x: "",
    map_query: "Kondey, Gaafu Alifu Atoll, Maldives"
  });

  /* ---------- pages ---------- */
  add("page", {
    slug: "council",
    title_dv: "ކައުންސިލާ ބެހޭ", title_en: "About the Council",
    body_dv: "ގއ. ކޮނޑޭ ކައުންސިލަކީ ރަށުގެ ރައްޔިތުންގެ ޚިދުމަތުގައި ރަށު ތަރައްގީއާއި އާންމު ޚިދުމަތްތައް ހިންގުމުގެ ޒިންމާ އުފުލާ މުއައްސަސާއެވެ.\n\nކައުންސިލް ހިމެނެނީ ރައްޔިތުންގެ ވޯޓުން ހޮވާ 3 މެންބަރުންނެވެ. ކައުންސިލުގެ ޖަލްސާތައް މަހަކު އެއްފަހަރު މަދުވެގެން ބާއްވައެވެ.",
    body_en: "GA. Kondey Council serves the people of the island, leading local development and running public services.\n\nThe council has 3 members elected by residents. Council meetings are held at least once a month.",
    photo: P("kondey-office", 900, 680)
  });
  add("page", {
    slug: "island",
    title_dv: "ގއ. ކޮނޑޭ", title_en: "GA. Kondey",
    body_dv: "ކޮނޑޭއަކީ ގއ. އަތޮޅުގައި އޮންނަ ރީތި ރަށެކެވެ. ރަށުގެ ރައްޔިތުންގެ މައިގަނޑު ދިރިއުޅުމަކީ މަސްވެރިކަމާއި ދަނޑުވެރިކަމެވެ.\n\nރަށުގެ ތާރީޚާއި ސަގާފަތާއި ރަށުގެ ދިރިއުޅުމާ ބެހޭ މަޢުލޫމާތު މިތަނުން ލިބިވަޑައިގަންނަވާނެއެވެ.",
    body_en: "Kondey is a beautiful island in Gaafu Alifu Atoll. Fishing and farming are the main livelihoods on the island.\n\nFind information here about the island's history, culture and community life.",
    land_use_url: "",
    photo: P("kondey-about", 900, 680)
  });

  /* ---------- council members ---------- */
  add("member", { sort: 1, name_dv: "ނަސްރު މުޙައްމަދު ދީދީ", name_en: "Nasru Mohamed Didi", role_dv: "ރައީސް", role_en: "President",
    phone: "682-1050", mobile: "777-0630", email: "nasru.mohameddidi@kondey.gov.mv", photo: "images/president.jpg" });
  add("member", { sort: 2, name_dv: "ޢާއިޝަތު ޝިފްޒާ އިބްރާޙީމް", name_en: "Aishath Shifza Ibrahim", role_dv: "ނައިބު ރައީސް", role_en: "Vice President",
    phone: "682-1051", mobile: "772-5584", email: "aishath.shifza@kondey.gov.mv", photo: "images/vice-president.jpg" });
  add("member", { sort: 3, name_dv: "މުޙައްމަދު ޝާވިން ސަޢީދު", name_en: "Mohamed Shavin Saeed", role_dv: "މެންބަރު", role_en: "Member",
    phone: "682-1053", mobile: "956-7968", email: "mohamed.shavinsaeed@kondey.gov.mv", photo: "" });

  /* ---------- services ---------- */
  const svc = (sort, icon, name_dv, name_en, desc_dv, desc_en, req_dv, req_en, fee, dur_dv, dur_en) =>
    add("service", { sort, icon, name_dv, name_en, desc_dv, desc_en, requirements_dv: req_dv, requirements_en: req_en, fee, duration_dv: dur_dv, duration_en: dur_en, form: "" });
  svc(1, "home", "ބިމާއި ގޯތި", "Land and plots", "ގޯތީގެ ހުއްދަ، ބިމުގެ ރަޖިސްޓްރީ", "Plot permits and land registry",
    "ފުރިހަމަކޮށްފައިވާ ފޯމު\nއައިޑީ ކާޑުގެ ކޮޕީ\nބިމުގެ ސާޓިފިކެޓުގެ ކޮޕީ", "Completed form\nCopy of ID card\nCopy of land certificate", "MVR 100", "10 ދުވަސް", "10 days");
  svc(2, "doc", "ސެޓްފިކެޓް ދޫކުރުން", "Certificates", "ދިރިއުޅޭ ތަނުގެ ސެޓްފިކެޓް އަދި ލިޔުންތައް", "Residence certificates and letters",
    "ފުރިހަމަކޮށްފައިވާ ފޯމު\nއައިޑީ ކާޑުގެ ކޮޕީ", "Completed form\nCopy of ID card", "MVR 50", "3 ދުވަސް", "3 days");
  svc(3, "person", "އުފަންވުމާއި މަރުވުން", "Births and deaths", "ރަޖިސްޓްރީ ކުރުމާއި ސެޓްފިކެޓް", "Registration and certificates",
    "ހޮސްޕިޓަލުން ދޫކުރާ ލިޔުން\nބެލެނިވެރިންގެ އައިޑީ ކާޑު", "Hospital letter\nParents' ID cards", "ހިލޭ / Free", "1 ދުވަސް", "1 day");
  svc(4, "shop", "ވިޔަފާރީގެ ހުއްދަ", "Business permits", "ފިހާރަ، ކެފޭ އަދި އެހެނިހެން ވިޔަފާރި", "Shops, cafés and other businesses",
    "ފުރިހަމަކޮށްފައިވާ ފޯމު\nވިޔަފާރި ރަޖިސްޓްރީގެ ކޮޕީ\nތަނުގެ ކުއްޔަށް ދިނުމުގެ އެއްބަސްވުން", "Completed form\nBusiness registration copy\nTenancy agreement", "MVR 250", "5 ދުވަސް", "5 days");
  svc(5, "boat", "ބަނދަރާއި ފަޅު", "Harbour", "އޮޑި ބެހެއްޓުމާއި ބަނދަރުގެ ޚިދުމަތް", "Vessel mooring and harbour services",
    "އުޅަނދުގެ ރަޖިސްޓްރީ\nވެރިފަރާތުގެ އައިޑީ ކާޑު", "Vessel registration\nOwner's ID card", "MVR 150 / month", "2 ދުވަސް", "2 days");
  svc(6, "bin", "ކުނި މެނޭޖްކުރުން", "Waste management", "ކުނި އުކާލުމާއި ސާފުތާހިރުކަން", "Waste collection and cleanliness",
    "ގޭގެ ނަމްބަރު\nފޯނު ނަމްބަރު", "House name\nPhone number", "MVR 75 / month", "1 ދުވަސް", "1 day");
  svc(7, "calendar", "ތަންތަން ބުކްކުރުން", "Venue booking", "ހޯލް، ދަނޑު އަދި އާންމު ތަންތަން", "Hall, field and public spaces",
    "ފުރިހަމަކޮށްފައިވާ ފޯމު\nހަރަކާތުގެ ތަފްޞީލް", "Completed form\nDetails of the event", "MVR 200", "3 ދުވަސް", "3 days");
  svc(8, "chat", "ޝަކުވާ ހުށަހެޅުން", "Complaints and suggestions", "ޚިޔާލާއި ޝަކުވާ ފޮނުވާލައްވާ", "Send us your ideas and complaints",
    "ވެބްސައިޓުގެ ފޯމު ފުރިހަމަކުރައްވާ", "Fill in the form on the Contact page", "ހިލޭ / Free", "5 ދުވަސް", "5 days");

  /* ---------- news ---------- */
  const news = (date, seed, cat_dv, cat_en, t_dv, t_en, b_dv, b_en) =>
    add("news", { date, photo: P(seed), category_dv: cat_dv, category_en: cat_en, title_dv: t_dv, title_en: t_en, body_dv: b_dv, body_en: b_en });
  news("2026-11-16", "kondey-news1", "ތަރައްގީ", "Development", "ރަށުގެ އާ ބަނދަރުގެ މަސައްކަތް ފަށައިފި", "Work begins on the island's new harbour",
    "ކޮނޑޭގެ އާ ބަނދަރު ހެދުމުގެ މަސައްކަތް މިއަދު ރަސްމީކޮށް ފަށައިފިއެވެ. މި މަޝްރޫޢު ނިމުމުން ރަށުގެ ރައްޔިތުންނަށާއި ރަށަށް ދަތުރުކުރާ މީހުންނަށް ވަރަށް ބޮޑު ލުއިފަސޭހައެއް ލިބިގެންދާނެއެވެ.\n\nމަސައްކަތް ފެށުމުގެ ރަސްމިއްޔާތުގައި ކައުންސިލުގެ ރައީސް ވިދާޅުވީ، މިއީ ރަށުގެ ރައްޔިތުން ދިގު މުއްދަތެއްގެ ތެރޭގައި އެދެމުން އައި މަޝްރޫޢެއް ކަމަށެވެ.",
    "Work on Kondey's new harbour officially began today. Once complete, the project will make travel much easier for residents and visitors.\n\nSpeaking at the opening ceremony, the council president said the harbour is a project the community has wanted for a long time.");
  news("2026-11-14", "kondey-news2", "ކައުންސިލް", "Council", "ކައުންސިލުގެ 12 ވަނަ ޖަލްސާ ބާއްވައިފި", "Council holds its 12th meeting",
    "ކޮނޑޭ ކައުންސިލުގެ 12 ވަނަ ޖަލްސާ ކައުންސިލް އިދާރާގައި ބާއްވައިފިއެވެ. ޖަލްސާގައި ރަށުގެ މަގުތައް މަރާމާތުކުރުމާއި ކުނި މެނޭޖްކުރުމާ ގުޅޭ ނިންމުންތަކެއް ނިންމިއެވެ.",
    "Kondey Council held its 12th meeting at the council office. Decisions were made on road repairs and waste management.");
  news("2026-11-10", "kondey-news3", "މުޖުތަމަޢު", "Community", "ރަށު ސާފުކުރުމުގެ ޙަރަކާތެއް ބާއްވައިފި", "Island clean-up event held",
    "ރަށު ސާފުކުރުމުގެ ޙަރަކާތެއް ކައުންސިލާއި ރަށުގެ ޖަމްޢިއްޔާތަކުން ގުޅިގެން ބާއްވައިފިއެވެ. ޙަރަކާތުގެ ތެރެއިން ގޮނޑުދޮށާއި މަގުތަކާއި އާންމު ތަންތަން ސާފުކުރެވުނެވެ.",
    "The council and local associations held an island clean-up. Volunteers cleaned the beach, roads and public areas.");
  news("2026-11-05", "kondey-news4", "ޒުވާނުން", "Youth", "ޒުވާނުންނަށް ހުނަރު ދަސްކޮށްދިނުމުގެ ޕްރޮގްރާމެއް", "Skills training programme for youth",
    "ރަށުގެ ޒުވާނުންނަށް ހުނަރު ދަސްކޮށްދިނުމުގެ ޕްރޮގްރާމެއް ކައުންސިލުން ފަށައިފިއެވެ. ބައިވެރިވުމަށް ކައުންސިލް އިދާރާއާ ގުޅުއްވުން އެދެމެވެ.",
    "The council has launched a skills training programme for young people. To take part, please contact the council office.");
  news("2026-11-01", "kondey-news5", "ތައުލީމު", "Education", "ސްކޫލުގެ ކުދިންނަށް ކައުންސިލުން އެހީތެރިކަން", "Council supports school students",
    "ރަށުގެ ސްކޫލުގެ ދަރިވަރުންނަށް ބޭނުންވާ ތަކެތި ކައުންސިލުން ސްކޫލާ ހަވާލުކޮށްފިއެވެ.",
    "The council has handed over supplies needed by students to the island school.");

  /* ---------- vacancies ---------- */
  const job = (date, deadline, t_dv, t_en, posts, salary, d_dv, d_en) =>
    add("vacancy", { date, deadline, title_dv: t_dv, title_en: t_en, posts, salary, details_dv: d_dv, details_en: d_en, form: "" });
  job("2026-11-12", "2026-11-28", "އެޑްމިނިސްޓްރޭޓިވް އޮފިސަރ", "Administrative Officer", "1", "MVR 9,500",
    "ސާނަވީ ތައުލީމު ފުރިހަމަކޮށްފައިވުން\nކޮމްޕިއުޓަރު ބޭނުންކުރުމުގެ ހުނަރު\nދިވެހި އަދި އިނގިރޭސި ބަހުން ލިޔުމުގެ ޤާބިލުކަން",
    "Completed secondary education\nComputer skills\nWritten Dhivehi and English");
  job("2026-11-14", "2026-11-18", "ސާފުކުރާ މުވައްޒަފު", "Cleaner", "2", "MVR 6,000",
    "18 އަހަރުން މަތި\nހެޔޮ އަޚްލާޤު", "Aged 18 or over\nGood conduct");
  job("2026-10-15", "2026-11-01", "ފައިނޭންސް އޮފިސަރ", "Finance Officer", "1", "MVR 11,000",
    "އެކައުންޓިންގ ސެޓްފިކެޓް 4", "Certificate 4 in Accounting");

  /* ---------- procurement ---------- */
  const tender = (date, deadline, ref, t_dv, t_en, d_dv, d_en, r_dv, r_en) =>
    add("tender", { date, deadline, ref_no: ref, title_dv: t_dv, title_en: t_en, details_dv: d_dv, details_en: d_en, document: "", result_dv: r_dv || "", result_en: r_en || "" });
  tender("2026-11-10", "2026-11-25", "(IUL)315-PR/2026/14", "ކައުންސިލް އިދާރާއަށް ކޮމްޕިއުޓަރު ގަތުން", "Purchase of computers for the council office",
    "ކައުންސިލް އިދާރާއަށް ޑެސްކްޓޮޕް ކޮމްޕިއުޓަރު 4 ސެޓް ގަތުމަށް އަގު ހުށަހެޅުމަށް ހުޅުވާލަމެވެ.", "Quotations are invited for 4 desktop computer sets for the council office.");
  tender("2026-11-12", "2026-11-30", "(IUL)315-PR/2026/15", "މަގުތަކަށް ބައްތި ހަރުކުރުން", "Installation of street lights",
    "ރަށުގެ މައިގަނޑު މަގުތަކަށް ސޯލާ ބައްތި 30 ހަރުކުރުމުގެ މަސައްކަތް.", "Supply and installation of 30 solar street lights on main roads.");
  tender("2026-10-20", "2026-11-02", "(IUL)315-PR/2026/12", "ޖަނަރޭޓަރު މަރާމާތުކުރުން", "Generator repair works",
    "ކައުންސިލުގެ ޖަނަރޭޓަރު މަރާމާތުކުރުމުގެ މަސައްކަތް.", "Repair of the council generator.",
    "މި މަސައްކަތް ހަވާލުކުރެވުނީ ކޮނޑޭ ޓެކްނިކަލް ސަރވިސަސްއަށް", "Awarded to Kondey Technical Services");

  /* ---------- documents ---------- */
  const doc = (date, doc_type, year, t_dv, t_en) => add("document", { date, doc_type, year, title_dv: t_dv, title_en: t_en, file: "" });
  doc("2026-01-10", "budget", "2026", "2026 ވަނަ އަހަރުގެ ބަޖެޓް", "Budget 2026");
  doc("2026-03-30", "report", "2025", "2025 ވަނަ އަހަރުގެ އަހަރީ ރިޕޯޓު", "Annual Report 2025");
  doc("2025-06-01", "regulation", "2025", "ބިމުގެ ޤަވާއިދު", "Land Regulation");
  doc("2025-08-15", "form", "2025", "ގޯތީގެ ހުއްދައަށް އެދޭ ފޯމު", "Plot permit application form");
  doc("2025-08-15", "form", "2025", "ވިޔަފާރީގެ ހުއްދައަށް އެދޭ ފޯމު", "Business permit application form");
  doc("2026-02-01", "plan", "2026", "ރަށު ތަރައްގީގެ ޕްލޭން 2026-2030", "Island Development Plan 2026-2030");

  /* ---------- meetings ---------- */
  const meet = (date, no, a_dv, a_en, d_dv, d_en) => add("meeting", { date, meeting_no: no, agenda_dv: a_dv, agenda_en: a_en, decisions_dv: d_dv, decisions_en: d_en, minutes: "" });
  meet("2026-11-12", "12", "މަގުތައް މަރާމާތުކުރުން\nކުނި މެނޭޖްކުރުން", "Road repairs\nWaste management",
    "މައިގަނޑު މަގުތައް ޑިސެމްބަރު މަހު މަރާމާތުކުރުމަށް ނިންމުން\nކުނި ނަގާ ދުވަސްތައް ހަފްތާއަކު 3 ދުވަހަށް އިތުރުކުރުމަށް ނިންމުން",
    "Repair main roads in December\nIncrease waste collection to 3 days a week");
  meet("2026-10-08", "11", "2027 ވަނަ އަހަރުގެ ބަޖެޓް\nބަނދަރު މަޝްރޫޢު", "Budget 2027\nHarbour project",
    "2027 ވަނަ އަހަރުގެ ބަޖެޓް ފާސްކުރުން\nބަނދަރު މަޝްރޫޢުގެ މަސައްކަތް ނޮވެމްބަރުގައި ފެށުމަށް ނިންމުން",
    "Budget 2027 approved\nHarbour work to start in November");

  /* ---------- gallery ---------- */
  ["beach", "harbour", "school", "mosque", "sunset", "boats"].forEach((s, i) =>
    add("gallery", { sort: i + 1, photo: P("kondey-g-" + s, 900, 675), caption_dv: "", caption_en: "" }));

  /* one item waiting for approval, to show how approval works */
  add("news", { date: "2026-11-16", photo: P("kondey-news6"), category_dv: "ކައުންސިލް", category_en: "Council",
    title_dv: "ކައުންސިލް އިދާރާ ހުޅުވާ ގަޑި ބަދަލުވެއްޖެ", title_en: "Council office hours change",
    body_dv: "ޑިސެމްބަރު 1 އިން ފެށިގެން ކައުންސިލް އިދާރާ ހުޅުވާނީ 08:00 ން 15:00 އަށެވެ.", body_en: "From 1 December the council office will be open 08:00 to 15:00." },
    { status: "pending", published_on: null });

  window.KONDEY_SAMPLE = rows;
})();
