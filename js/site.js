/* Kondey Council public website — draws every page from the content in the database.
   Pages (web addresses):
     #/                 home            #/news, #/news/<id>          news
     #/jobs, #/jobs/<id>  vacancies     #/procurement, #/procurement/<id>
     #/services, #/services/<id>        #/documents?type=&year=
     #/council          about + members #/meetings, #/meetings/<id>
     #/island           profile+gallery #/contact  contacts, map, complaint form
     #/search?q=        site search
*/
(function () {
  "use strict";
  const S = window.KondeyStore;
  const app = document.getElementById("app");

  /* ================= TEXT (Dhivehi / English) ================= */
  const UI = {
    dv: {
      name: "ގއ. ކޮނޑޭ ކައުންސިލް", short: "ކޮނޑޭ ކައުންސިލް", skip: "މައިގަނޑު ބައިތަކަށް",
      m_council: "ކައުންސިލް", m_council_about: "ކައުންސިލާ ބެހޭ", m_members: "ކައުންސިލް މެންބަރުން", m_meetings: "ޖަލްސާތަކާއި ނިންމުންތައް", m_contact: "ގުޅުއްވާ",
      m_finance: "މާލިއްޔަތު", m_budget: "ބަޖެޓް", m_reports: "ރިޕޯޓުތައް", m_procurement: "ޕްރޮކިއުމަންޓްތައް",
      m_island: "ރަށް", m_island_profile: "ރަށާ ބެހޭ", m_gallery: "ފޮޓޯ ގެލެރީ", m_plans: "ޕްލޭންތައް",
      m_services: "ޚިދުމަތްތައް", m_media: "މީޑިއާ ސެންޓަރ", m_news: "ޚަބަރު", m_jobs: "ވަޒީފާ",
      m_documents: "ޑޮކިއުމަންޓްތައް", m_forms: "ފޯމުތައް", m_regs: "ޤަވާއިދުތައް", m_all_docs: "ހުރިހާ ޑޮކިއުމަންޓެއް",
      home: "މައި ޞަފްޙާ", search: "ހޯދާ...", office_name: "ގއ. ކޮނޑޭ ކައުންސިލްގެ އިދާރާ", island_name: "ގއ. ކޮނޑޭ",
      copy: "© {y} ގއ. ކޮނޑޭ ކައުންސިލް. ހުރިހާ ޙައްޤެއް ލިބިގެންވޭ.",
      welcome: "މަރުޙަބާ", view_services: "ޚިދުމަތްތައް ބައްލަވާ",
      population: "އާބާދީ", area: "ބިމުގެ ބޮޑުމިން (ހެކްޓަރު)", households: "ގޭގޭގެ އަދަދު", members_count: "ކައުންސިލް މެންބަރުން",
      services_sub: "ކައުންސިލުން ރައްޔިތުންނަށް ފޯރުކޮށްދޭ ޚިދުމަތްތައް", all_services: "ހުރިހާ ޚިދުމަތެއް ←",
      latest_news: "ފަހުގެ ޚަބަރުތައް", all_news: "ހުރިހާ ޚަބަރެއް", see_all: "ހުރިހާ ←",
      announcements: "އިޢުލާންތައް", open: "ހުޅުވާލެވިފައި", soon: "އަވަހަށް", closed: "ބަންދު",
      deadline: "ސުންގަޑި", posts: "މަޤާމު", salary: "މުސާރަ", requirements: "ޝަރުތުތައް", details: "ތަފްޞީލް",
      download: "ޑައުންލޯޑް", form: "ފޯމު", no_file: "ފައިލެއް ނެތް",
      ref_no: "ނަމްބަރު", result: "ނަތީޖާ", documents_t: "ލިޔެކިޔުންތައް",
      fee: "ފީ", duration: "ނިމޭނެ މުއްދަތު", docs_needed: "ބޭނުންވާ ލިޔުންތައް", questions: "ސުވާލެއް އެބައޮތްތޯ؟ ގުޅުއްވާ",
      contact_us: "ގުޅުއްވާ", hours: "ހުޅުވާ ގަޑިތައް", address: "އެޑްރެސް", phone: "ފޯނު", hotline: "ހޮޓްލައިން", email: "އީމެއިލް", website: "ވެބްސައިޓް",
      open_map: "ގޫގުލް މެޕްސްގައި ހުޅުވާ",
      feedback_t: "ޝަކުވާ ނުވަތަ ޚިޔާލު", feedback_sub: "ތިރީގައިވާ ފޯމު ފުރިހަމަކޮށް ފޮނުއްވާ. ރިފަރެންސް ނަމްބަރެއް ލިބިވަޑައިގަންނަވާނެއެވެ.",
      kind: "ބާވަތް", complaint: "ޝަކުވާ", suggestion: "ޚިޔާލު",
      f_name: "ނަން", f_phone: "ފޯނު ނަމްބަރު", f_email: "އީމެއިލް (ލާޒިމެއް ނޫން)", f_msg: "ތަފްޞީލް",
      privacy: "ތިޔަ ފޮނުއްވާ މަޢުލޫމާތު ބޭނުންކުރާނީ ހަމައެކަނި މި މައްސަލަ ބެލުމަށެވެ. އާންމުކޮށް ޝާއިޢުކުރެވޭނެ ނުވެއެވެ.",
      send: "ފޮނުވާ", sending: "ފޮނުވަނީ...", sent_ok: "ފޮނުވިއްޖެ. ތިޔަ ރިފަރެންސް ނަމްބަރު:", sent_demo: "(ޑެމޯ: ކައުންސިލަށް ފޮނުވިފައެއް ނުވޭ)",
      send_err: "ފޮނުވިއެއް ނުދިޔަ. އަލުން މަސައްކަތްކުރައްވާ.", required: "މި ބައި ފުރިހަމަކުރައްވާ", msg_short: "ތަފްޞީލު މަދުވެގެން 5 އަކުރު ލިޔުއްވާ",
      meeting: "ޖަލްސާ", agenda: "އެޖެންޑާ", decisions: "ނިންމުންތައް", minutes: "ޔައުމިއްޔާ", latest_meetings: "ފަހުގެ ޖަލްސާތައް", all_meetings: "ހުރިހާ ޖަލްސާއެއް ←",
      no_items: "މިހާރު އެއްވެސް ކަމެއް ނެތް.", last_updated: "ފަހުން އަޕްޑޭޓްކުރީ",
      search_t: "ހޯދުން", no_results: "އެއްވެސް ނަތީޖާއެއް ނުފެނުނު.", type_q: "ހޯދަން ބޭނުންވާ ބަސް ލިޔުއްވާ",
      all: "ހުރިހާ", all_years: "ހުރިހާ އަހަރެއް", year: "އަހަރު", show_open: "ހުޅުވާލެވިފައިވާ", show_all: "ހުރިހާ",
      t_form: "ފޯމުތައް", t_regulation: "ޤަވާއިދުތައް", t_budget: "ބަޖެޓް", t_report: "ރިޕޯޓުތައް", t_plan: "ޕްލޭންތައް", t_other: "އެހެނިހެން",
      share: "ހިއްސާކުރައްވާ:", copied: "ލިންކް ކޮޕީކުރެވިއްޖެ", other_news: "އެހެން ޚަބަރުތައް",
      loading: "ލޯޑުވަނީ...", load_err: "މަޢުލޫމާތު ލޯޑުކުރެވިއެއް ނުދިޔަ. އިންޓަނެޓް ކަނެކްޝަން ޗެކްކޮށް އަލުން މަސައްކަތްކުރައްވާ.", retry: "އަލުން",
      land_use: "ބިންގަނޑުގެ ބޭނުމުގެ ޕްލޭން", how_apply: "ހުށަހަޅާނެ ގޮތް",
      apply_text: "ފޯމު ފުރިހަމަކޮށް ސުންގަޑީގެ ކުރިން ކައުންސިލް އިދާރާއަށް ހުށަހަޅުއްވާ ނުވަތަ އީމެއިލް ކުރައްވާ.",
      about_council: "ކައުންސިލާ ބެހޭ", about_island: "ރަށާ ބެހޭ", read_more: "އިތުރަށް ބައްލަވާ",
      not_found: "މި ޞަފްޙާ ނުފެނުނު.", back_home: "މައި ޞަފްޙާއަށް",
      demo: "ޑެމޯ", demo_tip: "Demo mode — sample content. Connect Supabase in config.js to go live.",
      news_t: "ޚަބަރު", jobs_t: "ވަޒީފާ", tenders_t: "ޕްރޮކިއުމަންޓް", services_t: "ޚިދުމަތްތައް", docs_t: "ޑޮކިއުމަންޓްތައް", meetings_t: "ޖަލްސާތައް", members_t: "ކައުންސިލް މެންބަރުން", gallery_t: "ފޮޓޯ ގެލެރީ",
      result_count: "{n} ނަތީޖާ"
    },
    en: {
      name: "GA. Kondey Council", short: "Kondey Council", skip: "Skip to main content",
      m_council: "Council", m_council_about: "About the council", m_members: "Council members", m_meetings: "Meetings and decisions", m_contact: "Contact",
      m_finance: "Finance", m_budget: "Budget", m_reports: "Reports", m_procurement: "Procurement",
      m_island: "Island", m_island_profile: "About the island", m_gallery: "Photo gallery", m_plans: "Plans",
      m_services: "Services", m_media: "Media Centre", m_news: "News", m_jobs: "Jobs",
      m_documents: "Documents", m_forms: "Forms", m_regs: "Regulations", m_all_docs: "All documents",
      home: "Home", search: "Search...", office_name: "GA. Kondey Council Office", island_name: "GA. Kondey",
      copy: "© {y} GA. Kondey Council. All rights reserved.",
      welcome: "Welcome", view_services: "View services",
      population: "Population", area: "Land area (hectares)", households: "Households", members_count: "Council members",
      services_sub: "Services the council provides to the community", all_services: "All services →",
      latest_news: "Latest News", all_news: "All news", see_all: "View all →",
      announcements: "Announcements", open: "Open", soon: "Closing soon", closed: "Closed",
      deadline: "Deadline", posts: "Posts", salary: "Salary", requirements: "Requirements", details: "Details",
      download: "Download", form: "Form", no_file: "No file",
      ref_no: "Reference", result: "Result", documents_t: "Documents",
      fee: "Fee", duration: "Time taken", docs_needed: "Documents needed", questions: "Questions? Call",
      contact_us: "Contact us", hours: "Opening hours", address: "Address", phone: "Phone", hotline: "Hotline", email: "Email", website: "Website",
      open_map: "Open in Google Maps",
      feedback_t: "Complaints and suggestions", feedback_sub: "Fill in the form below. You will get a reference number.",
      kind: "Type", complaint: "Complaint", suggestion: "Suggestion",
      f_name: "Name", f_phone: "Phone number", f_email: "Email (optional)", f_msg: "Message",
      privacy: "We use these details only to handle your message. They are never published.",
      send: "Send", sending: "Sending...", sent_ok: "Sent. Your reference number:", sent_demo: "(Demo mode: not actually sent to the council)",
      send_err: "Could not send. Please try again.", required: "Please fill this in", msg_short: "Please write at least 5 characters",
      meeting: "Meeting", agenda: "Agenda", decisions: "Decisions", minutes: "Minutes", latest_meetings: "Latest meetings", all_meetings: "All meetings →",
      no_items: "Nothing here yet.", last_updated: "Last updated",
      search_t: "Search", no_results: "No results found.", type_q: "Type a word to search",
      all: "All", all_years: "All years", year: "Year", show_open: "Open", show_all: "All",
      t_form: "Forms", t_regulation: "Regulations", t_budget: "Budgets", t_report: "Reports", t_plan: "Plans", t_other: "Other",
      share: "Share:", copied: "Link copied", other_news: "Other news",
      loading: "Loading...", load_err: "Could not load the content. Check your internet connection and try again.", retry: "Try again",
      land_use: "Land-use plan", how_apply: "How to apply",
      apply_text: "Fill in the form and hand it to the council office, or email it, before the deadline.",
      about_council: "About the council", about_island: "About the island", read_more: "Read more",
      not_found: "Page not found.", back_home: "Back to home",
      demo: "DEMO", demo_tip: "Demo mode — sample content. Connect Supabase in config.js to go live.",
      news_t: "News", jobs_t: "Jobs", tenders_t: "Procurement", services_t: "Services", docs_t: "Documents", meetings_t: "Meetings", members_t: "Council members", gallery_t: "Photo gallery",
      result_count: "{n} results"
    }
  };
  const MONTHS = {
    dv: ["ޖަނަވަރީ", "ފެބުރުވަރީ", "މާރިޗު", "އޭޕްރީލް", "މެއި", "ޖޫން", "ޖުލައި", "އޮގަސްޓު", "ސެޕްޓެމްބަރު", "އޮކްޓޫބަރު", "ނޮވެމްބަރު", "ޑިސެމްބަރު"],
    en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  };
  const DOC_TYPES = ["form", "regulation", "budget", "report", "plan", "other"];

  let LANG = "dv";
  try { if (localStorage.getItem("kondey-lang") === "en") LANG = "en"; } catch (e) {}
  const T = (k) => (UI[LANG][k] != null ? UI[LANG][k] : (UI.dv[k] != null ? UI.dv[k] : k));

  /* ================= HELPERS ================= */
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const tx = (o, f) => (o && (o[f + "_" + LANG] || o[f + "_dv"] || o[f + "_en"])) || "";
  const paras = (t) => String(t || "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
    .map((p) => "<p>" + esc(p).replace(/\n/g, "<br>") + "</p>").join("");
  const bullets = (t) => {
    const a = String(t || "").split("\n").map((s) => s.trim()).filter(Boolean);
    return a.length ? "<ul>" + a.map((x) => "<li>" + esc(x) + "</li>").join("") + "</ul>" : "";
  };
  const firstLine = (t) => String(t || "").split(/\n/).map((s) => s.trim()).filter(Boolean)[0] || "";
  const pad = (n) => String(n).padStart(2, "0");
  const todayIso = () => { const d = new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); };
  function fmtDate(iso) {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || ""));
    if (!m) return esc(iso || "");
    return `<span class="date-txt">${+m[3]} ${MONTHS[LANG][+m[2] - 1]} ${m[1]}</span>`;
  }
  const daysLeft = (d) => (d ? Math.round((Date.parse(d) - Date.parse(todayIso())) / 864e5) : null);
  function stateOf(deadline) {
    const d = daysLeft(deadline);
    if (d === null || isNaN(d)) return "open";
    if (d < 0) return "closed";
    if (d <= 3) return "soon";
    return "open";
  }
  const badge = (deadline) => { const s = stateOf(deadline); return `<span class="badge ${s}">${T(s)}</span>`; };
  function safeUrl(u) {
    u = String(u || "").trim();
    if (!u) return "";
    if (/^(https?:|mailto:|tel:)/i.test(u)) return u;
    if (/^data:(image|application)\//i.test(u)) return u;
    if (/^[\w\-./%]+$/.test(u) && !/^\/\//.test(u)) return u;   // relative file like images/x.jpg
    return "";
  }
  const img = (src, alt, cls) => {
    const u = safeUrl(src);
    return u ? `<img src="${esc(u)}" alt="${esc(alt || "")}" loading="lazy"${cls ? ` class="${cls}"` : ""} onerror="this.style.visibility='hidden'">` : "";
  };
  const tel = (n) => "tel:" + String(n || "").replace(/[^\d+]/g, "").replace(/^(?!\+)/, "+960");
  const ICON = {
    dl: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>',
    phone: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z"/></svg>',
    mobile: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="2" width="12" height="20" rx="2.5"/><line x1="11" y1="18" x2="13" y2="18" stroke-linecap="round"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>',
    headset: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3a9 9 0 0 0-9 9v7a2 2 0 0 0 2 2h2a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1H5v-1a7 7 0 0 1 14 0v1h-2a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2a2 2 0 0 0 2-2v-7a9 9 0 0 0-9-9z"/></svg>',
    globe: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-1 17.9A8 8 0 0 1 4.1 9.6L9 14.5v1a2 2 0 0 0 2 2zm6.9-2.5A2 2 0 0 0 16 16h-1v-3a1 1 0 0 0-1-1H8v-2h2a1 1 0 0 0 1-1V7h2a2 2 0 0 0 2-2v-.4a8 8 0 0 1 2.9 12.8z"/></svg>',
    at: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8"/></svg>',
    fb: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h8.5v-7.5H10v-3h2.5V9.2c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6v2h2.8l-.45 3H15.7V22H20a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/></svg>',
    ig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 3h3.2l-7 8 8.3 10h-6.5l-5-6.2L4.6 21H1.4l7.5-8.6L1 3h6.6l4.6 5.7zm-1.1 16h1.8L6.7 4.9H4.8z"/></svg>',
    viber: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.5 2 3 4.7 3 10c0 3 1 5 3 6.3V21l3.5-3c.8.1 1.6.2 2.5.2 5.5 0 9-2.7 9-8.2S17.5 2 12 2z"/></svg>',
    link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>'
  };
  const SVC = {
    home: '<path d="M3 21h18M5 21V9l7-5 7 5v12M10 21v-6h4v6"/>',
    doc: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
    person: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
    shop: '<path d="M3 7h18l-2 12H5z"/><path d="M8 7V5a4 4 0 0 1 8 0v2"/>',
    boat: '<path d="M3 18c3-2 6-2 9 0s6 2 9 0M5 14l2-8h10l2 8"/>',
    bin: '<path d="M4 7h16M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    water: '<path d="M12 3s7 7.5 7 12a7 7 0 0 1-14 0c0-4.5 7-12 7-12z"/>',
    star: '<path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/>'
  };
  const svcIcon = (k) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">${SVC[k] || SVC.star}</svg>`;
  const dlBtn = (url, label) => {
    const u = safeUrl(url);
    return u ? `<a class="dl" href="${esc(u)}" target="_blank" rel="noopener" download>${ICON.dl}${esc(label || T("download"))}</a>` : "";
  };

  /* ================= DATA ================= */
  let DB = null;
  async function load() {
    const rows = await S.published();
    const g = { news: [], vacancy: [], tender: [], service: [], document: [], meeting: [], gallery: [], member: [], page: {}, setting: {} };
    (rows || []).forEach((r) => {
      const it = Object.assign({}, r.data || {}, { id: String(r.id), _upd: r.updated_at || "" });
      if (!it.date) it.date = r.published_on || String(r.updated_at || "").slice(0, 10);
      if (r.type === "page") g.page[it.slug] = it;
      else if (r.type === "setting") Object.assign(g.setting, it);
      else if (g[r.type]) g[r.type].push(it);
    });
    const byDate = (a, b) => String(b.date).localeCompare(String(a.date)) || String(b._upd).localeCompare(String(a._upd));
    const bySort = (a, b) => (+a.sort || 999) - (+b.sort || 999);
    ["news", "vacancy", "tender", "document", "meeting"].forEach((k) => g[k].sort(byDate));
    ["service", "member", "gallery"].forEach((k) => g[k].sort(bySort));
    DB = g;
  }
  const latestOf = (items) => (items || []).reduce((m, x) => (x && x._upd > m ? x._upd : m), "");

  /* ================= SHARED PIECES ================= */
  const crumbs = (list) => `<nav class="crumbs" aria-label="breadcrumb"><a href="#/">${T("home")}</a>` +
    list.map((c) => `<span aria-hidden="true">/</span>` + (c[1] ? `<a href="${c[1]}">${esc(c[0])}</a>` : `<span>${esc(c[0])}</span>`)).join("") + `</nav>`;
  const head = (title, sub, more) => `<div class="section-head"><div><h1>${esc(title)}</h1>${sub ? `<p>${esc(sub)}</p>` : ""}</div>${more || ""}</div>`;
  const shead = (title, sub, more) => `<div class="section-head"><div><h2>${esc(title)}</h2>${sub ? `<p>${esc(sub)}</p>` : ""}</div>${more || ""}</div>`;
  const page = (title, cr, body, items, sub) =>
    `<section class="page"><div class="container">${crumbs(cr)}${head(title, sub)}${body}${updated(items)}</div></section>`;
  const updated = (items) => { const u = latestOf(items); return u ? `<p class="updated">${T("last_updated")}: ${fmtDate(u.slice(0, 10))}</p>` : ""; };
  const empty = () => `<div class="empty">${T("no_items")}</div>`;

  const newsItem = (n) => `<a href="#/news/${esc(n.id)}" class="news-item">${img(n.photo, tx(n, "title")) || "<span></span>"}<div><h4>${esc(tx(n, "title"))}</h4><span class="date">${fmtDate(n.date)}</span></div></a>`;
  const serviceCard = (s) => `<a href="#/services/${esc(s.id)}" class="service"><div class="ic">${svcIcon(s.icon)}</div><h3>${esc(tx(s, "name"))}</h3><p>${esc(tx(s, "desc"))}</p></a>`;
  function memberCard(m, i) {
    const name = tx(m, "name");
    const photo = safeUrl(m.photo) ? img(m.photo, name) : `<div class="avatar" aria-hidden="true"><svg viewBox="0 0 24 24" width="44%" fill="currentColor"><circle cx="12" cy="8" r="4.2"/><path d="M3.5 21c0-4.6 3.8-7.2 8.5-7.2s8.5 2.6 8.5 7.2z"/></svg></div>`;
    const c = [];
    if (m.mobile) c.push(`<a class="m-phone" href="${tel(m.mobile)}">${ICON.mobile}${esc(m.mobile)}</a>`);
    if (m.phone) c.push(`<a class="m-phone" href="${tel(m.phone)}">${ICON.phone}${esc(m.phone)}</a>`);
    if (m.email) c.push(`<a class="m-phone" href="mailto:${esc(m.email)}">${ICON.mail}${esc(m.email)}</a>`);
    return `<div class="member${i === 0 ? " president" : ""}"><div class="photo">${photo}</div><h4>${esc(name)}</h4><span>${esc(tx(m, "role"))}</span><div class="m-contacts">${c.join("")}</div></div>`;
  }
  const jobRow = (j) => `<a class="row" href="#/jobs/${esc(j.id)}"><div><h3>${esc(tx(j, "title"))}</h3><div class="sub">${j.posts ? `<span>${T("posts")}: <span class="ltr">${esc(j.posts)}</span></span>` : ""}${j.salary ? `<span>${T("salary")}: <span class="ltr">${esc(j.salary)}</span></span>` : ""}<span>${T("deadline")}: ${fmtDate(j.deadline)}</span></div></div><div class="end">${badge(j.deadline)}</div></a>`;
  const tenderRow = (t) => `<a class="row" href="#/procurement/${esc(t.id)}"><div><h3>${esc(tx(t, "title"))}</h3><div class="sub">${t.ref_no ? `<span class="ltr">${esc(t.ref_no)}</span>` : ""}<span>${T("deadline")}: ${fmtDate(t.deadline)}</span>${tx(t, "result") ? `<span>${T("result")}: ${esc(tx(t, "result"))}</span>` : ""}</div></div><div class="end">${badge(t.deadline)}</div></a>`;
  const notice = (href, title, deadline) => `<a class="notice" href="${href}"><div><h4>${esc(title)}</h4><span class="date">${T("deadline")}: ${fmtDate(deadline)}</span></div>${badge(deadline)}</a>`;
  const openFirst = (list) => list.slice().sort((a, b) => (stateOf(a.deadline) === "closed") - (stateOf(b.deadline) === "closed"));

  /* ================= PAGES ================= */
  let timers = [];
  function home() {
    const s = DB.setting;
    const photos = String(s.hero_photos || "").split(/[\n,]/).map((x) => safeUrl(x.trim())).filter(Boolean);
    const island = DB.page.island || {};
    const [first, ...rest] = DB.news;
    const html = `
      <section class="hero" style="padding:0">
        ${(photos.length ? photos : [""]).map((p, i) => `<div class="slide${i === 0 ? " active" : ""}" style="${p ? `background-image:url('${esc(p)}')` : "background:var(--navy-dark)"}"></div>`).join("")}
        <div class="hero-content"><div class="container">
          <span class="tag">${T("welcome")}</span>
          <h1>${esc(tx(s, "hero_title") || T("name"))}</h1>
          <p>${esc(tx(s, "hero_sub"))}</p>
          <a href="#/services" class="btn btn-gold">${T("view_services")}</a>
        </div></div>
        <div class="dots" id="dots"></div>
      </section>
      <div class="stats"><div class="container stats-grid">
        <div class="stat"><strong data-count="${+s.population || 0}">0</strong><span>${T("population")}</span></div>
        <div class="stat"><strong data-count="${+s.area || 0}">0</strong><span>${T("area")}</span></div>
        <div class="stat"><strong data-count="${+s.households || 0}">0</strong><span>${T("households")}</span></div>
        <div class="stat"><strong data-count="${DB.member.length}">0</strong><span>${T("members_count")}</span></div>
      </div></div>

      <section id="services"><div class="container">
        ${shead(T("services_t"), T("services_sub"), `<a href="#/services" class="more">${T("all_services")}</a>`)}
        ${DB.service.length ? `<div class="services">${DB.service.slice(0, 8).map(serviceCard).join("")}</div>` : empty()}
      </div></section>

      <section id="news" class="bg-cream"><div class="container">
        ${shead(T("latest_news"), "", `<a href="#/news" class="more">${T("all_news")} ←</a>`)}
        ${first ? `<div class="news-grid">
          <a href="#/news/${esc(first.id)}" class="news-main">${img(first.photo, tx(first, "title"))}
            <div class="txt">${tx(first, "category") ? `<span class="tag">${esc(tx(first, "category"))}</span>` : ""}<h3>${esc(tx(first, "title"))}</h3><span class="date">${fmtDate(first.date)}</span></div></a>
          <div class="news-list">${rest.slice(0, 4).map(newsItem).join("")}</div>
        </div>` : empty()}
      </div></section>

      <section id="notices"><div class="container">
        ${shead(T("announcements"))}
        <div class="two-col">
          <div class="panel"><div class="panel-title"><h3>${T("tenders_t")}</h3><a href="#/procurement" class="more">${T("see_all")}</a></div>
            ${DB.tender.length ? openFirst(DB.tender).slice(0, 3).map((t) => notice(`#/procurement/${esc(t.id)}`, tx(t, "title"), t.deadline)).join("") : empty()}</div>
          <div class="panel"><div class="panel-title"><h3>${T("jobs_t")}</h3><a href="#/jobs" class="more">${T("see_all")}</a></div>
            ${DB.vacancy.length ? openFirst(DB.vacancy).slice(0, 3).map((j) => notice(`#/jobs/${esc(j.id)}`, tx(j, "title"), j.deadline)).join("") : empty()}</div>
        </div>
      </div></section>

      ${tx(island, "title") ? `<section id="about" class="bg-cream"><div class="container about">
        ${img(island.photo, tx(island, "title")) || "<div></div>"}
        <div><h2>${esc(tx(island, "title"))}</h2>${paras(String(tx(island, "body")).split(/\n\s*\n/)[0])}
          <div class="btns"><a href="#/island" class="btn btn-gold">${T("about_island")}</a><a href="#/council#members" class="btn btn-outline">${T("members_t")}</a></div></div>
      </div></section>` : ""}

      <section id="members"><div class="container">
        ${shead(T("members_t"))}
        ${DB.member.length ? `<div class="members">${DB.member.map(memberCard).join("")}</div>` : empty()}
      </div></section>`;
    return {
      html, title: T("name"),
      after() { startSlider(); countUp(); }
    };
  }

  function newsList() {
    const cards = DB.news.map((n) => `<a href="#/news/${esc(n.id)}" class="n-card">${img(n.photo, tx(n, "title")) || '<span style="aspect-ratio:16/10;background:var(--cream)"></span>'}
      <div class="b">${tx(n, "category") ? `<span class="tag">${esc(tx(n, "category"))}</span>` : ""}<h3>${esc(tx(n, "title"))}</h3><span class="date">${fmtDate(n.date)}</span><p>${esc(firstLine(tx(n, "body")))}</p></div></a>`).join("");
    return { title: T("all_news"), html: page(T("all_news"), [[T("m_news")]], cards ? `<div class="news-cards">${cards}</div>` : empty(), DB.news) };
  }
  function newsArticle(id) {
    const n = DB.news.find((x) => x.id === id);
    if (!n) return notFound();
    const url = location.href, title = tx(n, "title");
    const others = DB.news.filter((x) => x.id !== id).slice(0, 4);
    const html = `<section class="page"><div class="container article-wrap">
      <article class="article">
        ${crumbs([[T("m_news"), "#/news"]])}
        ${tx(n, "category") ? `<span class="tag">${esc(tx(n, "category"))}</span>` : ""}
        <h1>${esc(title)}</h1><div class="meta">${fmtDate(n.date)}</div>
        ${img(n.photo, title, "cover")}
        <div class="body">${paras(tx(n, "body"))}</div>
        <div class="share"><span>${T("share")}</span>
          <a target="_blank" rel="noopener" href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}" aria-label="Facebook">${ICON.fb}</a>
          <a target="_blank" rel="noopener" href="https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}" aria-label="X">${ICON.x}</a>
          <a href="viber://forward?text=${encodeURIComponent(title + " " + url)}" aria-label="Viber">${ICON.viber}</a>
          <button type="button" id="copyLink" aria-label="Copy link">${ICON.link}</button>
          <span class="copied" id="copiedMsg" hidden>${T("copied")}</span>
        </div>
        ${updated([n])}
      </article>
      <aside class="article-side"><h3>${T("other_news")}</h3>${others.map(newsItem).join("") || empty()}
        <a href="#/news" class="btn btn-outline side-all">${T("all_news")}</a></aside>
    </div></section>`;
    return {
      html, title,
      after() {
        const b = document.getElementById("copyLink");
        if (b) b.onclick = () => {
          const done = () => { const m = document.getElementById("copiedMsg"); if (m) { m.hidden = false; setTimeout(() => (m.hidden = true), 2000); } };
          if (navigator.clipboard) navigator.clipboard.writeText(url).then(done, done); else done();
        };
      }
    };
  }

  function jobsList(q) {
    const showAll = q.show === "all";
    const list = showAll ? DB.vacancy : DB.vacancy.filter((j) => stateOf(j.deadline) !== "closed");
    const filters = `<div class="filters"><a class="chip${showAll ? "" : " on"}" href="#/jobs">${T("show_open")}</a><a class="chip${showAll ? " on" : ""}" href="#/jobs?show=all">${T("show_all")}</a></div>`;
    return { title: T("jobs_t"), html: page(T("jobs_t"), [[T("m_jobs")]], filters + (list.length ? `<div class="rows">${list.map(jobRow).join("")}</div>` : empty()), DB.vacancy) };
  }
  function jobDetail(id) {
    const j = DB.vacancy.find((x) => x.id === id);
    if (!j) return notFound();
    const s = DB.setting, title = tx(j, "title");
    const body = `<div class="detail"><div class="detail-main">
        <h2 style="margin-top:0">${T("requirements")}</h2>${bullets(tx(j, "details")) || "<p>-</p>"}
        <h2>${T("how_apply")}</h2><p>${T("apply_text")}</p>
        ${s.email ? `<p><a class="more ltr" href="mailto:${esc(s.email)}">${esc(s.email)}</a></p>` : ""}
      </div>
      <aside class="facts"><dl>
        <div><dt>${T("deadline")}</dt><dd>${fmtDate(j.deadline)} ${badge(j.deadline)}</dd></div>
        ${j.posts ? `<div><dt>${T("posts")}</dt><dd class="ltr">${esc(j.posts)}</dd></div>` : ""}
        ${j.salary ? `<div><dt>${T("salary")}</dt><dd class="ltr">${esc(j.salary)}</dd></div>` : ""}
      </dl>${safeUrl(j.form) ? `<a class="btn btn-gold" href="${esc(safeUrl(j.form))}" target="_blank" rel="noopener" download>${ICON.dl} ${T("form")}</a>` : ""}</aside></div>`;
    return { title, html: page(title, [[T("m_jobs"), "#/jobs"], [title]], body, [j]) };
  }

  function tendersList(q) {
    const showAll = q.show === "all";
    const list = showAll ? DB.tender : DB.tender.filter((t) => stateOf(t.deadline) !== "closed");
    const filters = `<div class="filters"><a class="chip${showAll ? "" : " on"}" href="#/procurement">${T("show_open")}</a><a class="chip${showAll ? " on" : ""}" href="#/procurement?show=all">${T("show_all")}</a></div>`;
    return { title: T("tenders_t"), html: page(T("tenders_t"), [[T("m_procurement")]], filters + (list.length ? `<div class="rows">${list.map(tenderRow).join("")}</div>` : empty()), DB.tender) };
  }
  function tenderDetail(id) {
    const t = DB.tender.find((x) => x.id === id);
    if (!t) return notFound();
    const title = tx(t, "title");
    const body = `<div class="detail"><div class="detail-main">
        <h2 style="margin-top:0">${T("details")}</h2>${paras(tx(t, "details")) || "<p>-</p>"}
        ${tx(t, "result") ? `<h2>${T("result")}</h2>${paras(tx(t, "result"))}` : ""}
      </div>
      <aside class="facts"><dl>
        ${t.ref_no ? `<div><dt>${T("ref_no")}</dt><dd class="ltr">${esc(t.ref_no)}</dd></div>` : ""}
        <div><dt>${T("deadline")}</dt><dd>${fmtDate(t.deadline)} ${badge(t.deadline)}</dd></div>
      </dl>${safeUrl(t.document) ? `<a class="btn btn-gold" href="${esc(safeUrl(t.document))}" target="_blank" rel="noopener" download>${ICON.dl} ${T("documents_t")}</a>` : ""}</aside></div>`;
    return { title, html: page(title, [[T("m_procurement"), "#/procurement"], [title]], body, [t]) };
  }

  function servicesList() {
    return { title: T("services_t"), html: page(T("services_t"), [[T("m_services")]], DB.service.length ? `<div class="services">${DB.service.map(serviceCard).join("")}</div>` : empty(), DB.service, T("services_sub")) };
  }
  function serviceDetail(id) {
    const s = DB.service.find((x) => x.id === id);
    if (!s) return notFound();
    const st = DB.setting, title = tx(s, "name");
    const body = `<div class="detail"><div class="detail-main">
        <div class="svc-icon">${svcIcon(s.icon)}</div>
        <p class="lead">${esc(tx(s, "desc"))}</p>
        <h2>${T("docs_needed")}</h2>${bullets(tx(s, "requirements")) || "<p>-</p>"}
        ${st.phone ? `<h2>${T("questions")}</h2><p><a class="m-phone" href="${tel(st.phone)}">${ICON.phone}${esc(st.phone)}</a></p>` : ""}
      </div>
      <aside class="facts"><dl>
        ${s.fee ? `<div><dt>${T("fee")}</dt><dd>${esc(s.fee)}</dd></div>` : ""}
        ${tx(s, "duration") ? `<div><dt>${T("duration")}</dt><dd>${esc(tx(s, "duration"))}</dd></div>` : ""}
      </dl>${safeUrl(s.form) ? `<a class="btn btn-gold" href="${esc(safeUrl(s.form))}" target="_blank" rel="noopener" download>${ICON.dl} ${T("form")}</a>` : ""}</aside></div>`;
    return { title, html: page(title, [[T("m_services"), "#/services"], [title]], body, [s]) };
  }

  function documentsPage(q) {
    const type = DOC_TYPES.includes(q.type) ? q.type : "";
    const year = /^\d{4}$/.test(q.year || "") ? q.year : "";
    const years = [...new Set(DB.document.map((d) => String(d.year || "")).filter(Boolean))].sort().reverse();
    const href = (t, y) => "#/documents" + ((t || y) ? "?" + [t ? "type=" + t : "", y ? "year=" + y : ""].filter(Boolean).join("&") : "");
    const list = DB.document.filter((d) => (!type || (d.doc_type || "other") === type) && (!year || String(d.year) === year));
    const filters = `<div class="filters">
      <a class="chip${type ? "" : " on"}" href="${href("", year)}">${T("all")}</a>
      ${DOC_TYPES.filter((t) => DB.document.some((d) => (d.doc_type || "other") === t)).map((t) => `<a class="chip${type === t ? " on" : ""}" href="${href(t, year)}">${T("t_" + t)}</a>`).join("")}
      ${years.length ? `<select id="yearSel" aria-label="${T("year")}"><option value="">${T("all_years")}</option>${years.map((y) => `<option${y === year ? " selected" : ""}>${esc(y)}</option>`).join("")}</select>` : ""}
    </div>`;
    const rows = list.map((d) => `<div class="row"><div><h3>${esc(tx(d, "title"))}</h3><div class="sub"><span>${T("t_" + (d.doc_type || "other"))}</span>${d.year ? `<span class="ltr">${esc(d.year)}</span>` : ""}</div></div>
      <div class="end">${dlBtn(d.file) || `<span class="dl off">${T("no_file")}</span>`}</div></div>`).join("");
    const title = type ? T("t_" + type) : T("docs_t");
    return {
      title, html: page(title, [[T("m_documents"), type ? "#/documents" : ""]].concat(type ? [[T("t_" + type)]] : []), filters + (rows ? `<div class="rows">${rows}</div>` : empty()), DB.document),
      after() { const s = document.getElementById("yearSel"); if (s) s.onchange = () => (location.hash = href(type, s.value)); }
    };
  }

  function councilPage() {
    const p = DB.page.council || {};
    const meetings = DB.meeting.slice(0, 3);
    const body = `<div class="about" style="margin-bottom:56px">
        ${img(p.photo, tx(p, "title")) || "<div></div>"}
        <div class="prose">${paras(tx(p, "body")) || empty()}</div>
      </div>
      <div id="members">${shead(T("members_t"))}${DB.member.length ? `<div class="members">${DB.member.map(memberCard).join("")}</div>` : empty()}</div>
      <div class="mini-panel">${shead(T("latest_meetings"), "", `<a href="#/meetings" class="more">${T("all_meetings")}</a>`)}
        ${meetings.length ? `<div class="rows">${meetings.map(meetingRow).join("")}</div>` : empty()}</div>`;
    return { title: tx(p, "title") || T("about_council"), html: page(tx(p, "title") || T("about_council"), [[T("m_council")]], body, [p].concat(DB.member)) };
  }
  const meetingTitle = (m) => m.meeting_no ? (LANG === "en" ? `Meeting ${m.meeting_no}` : `${m.meeting_no} ވަނަ ޖަލްސާ`) : T("meeting");
  const meetingRow = (m) => `<a class="row" href="#/meetings/${esc(m.id)}"><div><h3>${esc(meetingTitle(m))}</h3><div class="sub"><span>${fmtDate(m.date)}</span><span>${esc(firstLine(tx(m, "decisions")))}</span></div></div><div class="end">${safeUrl(m.minutes) ? `<span class="dl">${ICON.dl}${T("minutes")}</span>` : ""}</div></a>`;
  function meetingsList() {
    return { title: T("m_meetings"), html: page(T("m_meetings"), [[T("m_council"), "#/council"], [T("m_meetings")]], DB.meeting.length ? `<div class="rows">${DB.meeting.map(meetingRow).join("")}</div>` : empty(), DB.meeting) };
  }
  function meetingDetail(id) {
    const m = DB.meeting.find((x) => x.id === id);
    if (!m) return notFound();
    const title = meetingTitle(m);
    const body = `<div class="detail"><div class="detail-main">
        <h2 style="margin-top:0">${T("decisions")}</h2>${bullets(tx(m, "decisions")) || "<p>-</p>"}
        ${tx(m, "agenda") ? `<h2>${T("agenda")}</h2>${bullets(tx(m, "agenda"))}` : ""}
      </div><aside class="facts"><dl><div><dt>${T("meeting")}</dt><dd>${fmtDate(m.date)}</dd></div></dl>
        ${safeUrl(m.minutes) ? `<a class="btn btn-gold" href="${esc(safeUrl(m.minutes))}" target="_blank" rel="noopener" download>${ICON.dl} ${T("minutes")}</a>` : ""}</aside></div>`;
    return { title, html: page(title, [[T("m_council"), "#/council"], [T("m_meetings"), "#/meetings"], [title]], body, [m]) };
  }

  function islandPage() {
    const p = DB.page.island || {};
    const body = `<div class="about" style="margin-bottom:56px">
        ${img(p.photo, tx(p, "title")) || "<div></div>"}
        <div class="prose">${paras(tx(p, "body")) || empty()}
          ${safeUrl(p.land_use_url) ? `<p>${dlBtn(p.land_use_url, T("land_use"))}</p>` : ""}</div>
      </div>
      <div id="gallery">${shead(T("gallery_t"))}
        ${DB.gallery.length ? `<div class="gallery">${DB.gallery.map((g, i) => `<button type="button" data-i="${i}" aria-label="${esc(tx(g, "caption") || T("gallery_t"))}">${img(g.photo, tx(g, "caption"))}</button>`).join("")}</div>` : empty()}</div>`;
    return {
      title: tx(p, "title") || T("about_island"),
      html: page(tx(p, "title") || T("about_island"), [[T("m_island")]], body, [p].concat(DB.gallery)),
      after() {
        document.querySelectorAll(".gallery button").forEach((b) => (b.onclick = () => {
          const g = DB.gallery[+b.dataset.i];
          document.getElementById("lbImg").src = safeUrl(g.photo);
          document.getElementById("lbCap").textContent = tx(g, "caption");
          document.getElementById("lightbox").classList.add("open");
          document.getElementById("lbClose").focus();
        }));
      }
    };
  }

  function contactPage() {
    const s = DB.setting;
    const card = (label, val, href, cls) => val ? `<div class="ccard${cls ? " " + cls : ""}"><small>${label}</small><strong>${href ? `<a href="${href}" class="ltr">${esc(val)}</a>` : esc(val)}</strong></div>` : "";
    const mapQ = s.map_query || "Kondey, Maldives";
    const body = `<div class="contact-grid">
      <div>
        <div class="cards">
          ${card(T("phone"), s.phone, s.phone ? tel(s.phone) : "")}
          ${card(T("hotline"), s.hotline, s.hotline ? tel(s.hotline) : "")}
          ${card(T("email"), s.email, s.email ? "mailto:" + s.email : "")}
          ${card(T("website"), s.website, s.website ? "https://" + String(s.website).replace(/^https?:\/\//, "") : "")}
          ${card(T("address"), tx(s, "address"), "", "wide")}
          ${card(T("hours"), tx(s, "hours"), "", "wide")}
        </div>
        <iframe class="map" title="Map" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=${encodeURIComponent(mapQ)}&z=14&output=embed"></iframe>
        <p style="margin-top:8px"><a class="more" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQ)}">${T("open_map")}</a></p>
      </div>
      <form class="form" id="fbForm" novalidate>
        <h2>${T("feedback_t")}</h2><p class="hint" style="margin-top:0">${T("feedback_sub")}</p>
        <div class="field"><span class="label">${T("kind")}</span><div class="radios">
          <label><input type="radio" name="kind" value="complaint" checked> ${T("complaint")}</label>
          <label><input type="radio" name="kind" value="suggestion"> ${T("suggestion")}</label></div></div>
        <div class="field"><label for="f_name">${T("f_name")} *</label><input id="f_name" name="name" maxlength="100" autocomplete="name"><div class="err" hidden></div></div>
        <div class="field"><label for="f_phone">${T("f_phone")} *</label><input id="f_phone" name="phone" maxlength="30" inputmode="tel" autocomplete="tel" dir="ltr"><div class="err" hidden></div></div>
        <div class="field"><label for="f_email">${T("f_email")}</label><input id="f_email" name="email" type="email" maxlength="120" autocomplete="email" dir="ltr"></div>
        <div class="field"><label for="f_msg">${T("f_msg")} *</label><textarea id="f_msg" name="message" maxlength="4000"></textarea><div class="err" hidden></div></div>
        <p class="hint">${T("privacy")}</p>
        <button class="btn btn-gold" type="submit" style="margin-top:14px">${T("send")}</button>
        <div id="fbResult" aria-live="polite"></div>
      </form></div>`;
    return { title: T("contact_us"), html: page(T("contact_us"), [[T("m_contact")]], body, [s]), after: bindFeedback };
  }
  function bindFeedback() {
    const f = document.getElementById("fbForm");
    if (!f) return;
    f.onsubmit = async (e) => {
      e.preventDefault();
      const v = (n) => f.elements[n].value.trim();
      let ok = true;
      const check = (n, good, msg) => {
        const err = f.elements[n].parentElement.querySelector(".err");
        err.hidden = good; err.textContent = good ? "" : msg;
        if (!good && ok) f.elements[n].focus();
        ok = ok && good;
      };
      check("name", !!v("name"), T("required"));
      check("phone", !!v("phone"), T("required"));
      check("message", v("message").length >= 5, v("message") ? T("msg_short") : T("required"));
      if (!ok) return;
      const btn = f.querySelector("button[type=submit]"), out = document.getElementById("fbResult");
      btn.disabled = true; btn.textContent = T("sending");
      try {
        const ref = await S.submitFeedback({ kind: f.elements.kind.value, name: v("name"), phone: v("phone"), email: v("email"), message: v("message") });
        out.innerHTML = `<div class="ok-box">${T("sent_ok")} <strong>${esc(ref)}</strong>${S.live ? "" : `<br><small>${T("sent_demo")}</small>`}</div>`;
        ["name", "phone", "email", "message"].forEach((n) => (f.elements[n].value = ""));
      } catch (err) {
        out.innerHTML = `<div class="err-box">${T("send_err")}</div>`;
      }
      btn.disabled = false; btn.textContent = T("send");
    };
  }

  function searchPage(q) {
    const term = String(q.q || "").trim();
    const groups = [
      ["news", T("news_t"), (x) => tx(x, "title"), (x) => "#/news/" + x.id, ["title", "body", "category"]],
      ["vacancy", T("jobs_t"), (x) => tx(x, "title"), (x) => "#/jobs/" + x.id, ["title", "details"]],
      ["tender", T("tenders_t"), (x) => tx(x, "title"), (x) => "#/procurement/" + x.id, ["title", "details", "result"], ["ref_no"]],
      ["service", T("services_t"), (x) => tx(x, "name"), (x) => "#/services/" + x.id, ["name", "desc", "requirements"]],
      ["document", T("docs_t"), (x) => tx(x, "title"), (x) => (safeUrl(x.file) || "#/documents"), ["title"]],
      ["meeting", T("meetings_t"), (x) => meetingTitle(x) + " — " + firstLine(tx(x, "decisions")), (x) => "#/meetings/" + x.id, ["agenda", "decisions"]],
      ["member", T("members_t"), (x) => tx(x, "name") + " — " + tx(x, "role"), () => "#/council#members", ["name", "role"], ["email"]]
    ];
    let html = "", total = 0;
    if (term.length >= 2) {
      const needle = term.toLowerCase();
      groups.forEach(([type, label, titleOf, hrefOf, fields, plain]) => {
        const hits = DB[type].filter((x) => fields.some((f) => (String(x[f + "_dv"] || "") + " " + String(x[f + "_en"] || "")).toLowerCase().includes(needle)) ||
          (plain || []).some((f) => String(x[f] || "").toLowerCase().includes(needle)));
        if (!hits.length) return;
        total += hits.length;
        html += `<div class="result-group"><h2>${esc(label)}</h2><div class="rows">${hits.slice(0, 20).map((x) => `<a class="row" href="${esc(hrefOf(x))}"><div><h3>${mark(titleOf(x), term)}</h3>${x.date && type !== "member" ? `<div class="sub">${fmtDate(x.date)}</div>` : ""}</div></a>`).join("")}</div></div>`;
      });
    }
    const body = `<div class="search-page"><form id="sForm"><input type="search" id="sInput" value="${esc(term)}" placeholder="${T("type_q")}" aria-label="${T("search_t")}"></form>
      ${term.length >= 2 ? `<p class="hint" style="margin:-10px 0 18px">${T("result_count").replace("{n}", total)}</p>` + (html || `<div class="empty">${T("no_results")}</div>`) : ""}</div>`;
    return {
      title: T("search_t"), html: page(T("search_t"), [[T("search_t")]], body, []),
      after() {
        const f = document.getElementById("sForm"), i = document.getElementById("sInput");
        f.onsubmit = (e) => { e.preventDefault(); location.hash = "#/search?q=" + encodeURIComponent(i.value.trim()); };
        if (!term) i.focus();
      }
    };
  }
  function mark(text, term) {
    const s = String(text || ""), i = s.toLowerCase().indexOf(term.toLowerCase());
    if (i < 0) return esc(s);
    return esc(s.slice(0, i)) + "<mark>" + esc(s.slice(i, i + term.length)) + "</mark>" + esc(s.slice(i + term.length));
  }

  function notFound() {
    return { title: T("not_found"), html: `<section class="page"><div class="container"><div class="empty"><p>${T("not_found")}</p><p style="margin-top:16px"><a class="btn btn-gold" href="#/">${T("back_home")}</a></p></div></div></section>` };
  }

  /* ================= HOME WIDGETS ================= */
  function startSlider() {
    const slides = app.querySelectorAll(".slide"), dots = document.getElementById("dots");
    if (!dots || slides.length < 2) return;
    let cur = 0;
    slides.forEach((_, i) => {
      const b = document.createElement("button");
      b.type = "button"; b.setAttribute("aria-label", "Slide " + (i + 1));
      b.onclick = () => { go(i); restart(); };
      dots.appendChild(b);
    });
    const go = (i) => { slides[cur].classList.remove("active"); dots.children[cur].classList.remove("active"); cur = i; slides[cur].classList.add("active"); dots.children[cur].classList.add("active"); };
    let t;
    const restart = () => { clearInterval(t); t = setInterval(() => go((cur + 1) % slides.length), 6000); timers.push(t); };
    go(0); restart();
  }
  function countUp() {
    const els = app.querySelectorAll("[data-count]");
    if (!("IntersectionObserver" in window)) { els.forEach((el) => (el.textContent = (+el.dataset.count).toLocaleString("en"))); return; }
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target, end = +el.dataset.count, start = performance.now();
      (function step(t) {
        const p = Math.min((t - start) / 1500, 1);
        el.textContent = Math.floor(end * (1 - Math.pow(1 - p, 3))).toLocaleString("en");
        if (p < 1) requestAnimationFrame(step);
      })(start);
      io.unobserve(el);
    }), { threshold: 0.4 });
    els.forEach((el) => io.observe(el));
  }

  /* ================= ROUTER ================= */
  function parseHash() {
    let h = decodeURI(location.hash.slice(1) || "/");
    let anchor = "";
    const hashAt = h.indexOf("#");
    if (hashAt >= 0) { anchor = h.slice(hashAt + 1); h = h.slice(0, hashAt); }
    const [path, qs] = h.split("?");
    const q = {};
    (qs || "").split("&").filter(Boolean).forEach((kv) => { const [k, v] = kv.split("="); q[k] = decodeURIComponent((v || "").replace(/\+/g, " ")); });
    const parts = path.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);
    return { parts, q, anchor };
  }
  function route(keepScroll) {
    if (!DB) return;
    timers.forEach(clearInterval); timers = [];
    const { parts, q, anchor } = parseHash();
    const [a, b] = parts;
    let v;
    switch (a || "") {
      case "": v = home(); break;
      case "news": v = b ? newsArticle(b) : newsList(); break;
      case "jobs": v = b ? jobDetail(b) : jobsList(q); break;
      case "procurement": v = b ? tenderDetail(b) : tendersList(q); break;
      case "services": v = b ? serviceDetail(b) : servicesList(); break;
      case "documents": v = documentsPage(q); break;
      case "council": v = councilPage(); break;
      case "meetings": v = b ? meetingDetail(b) : meetingsList(); break;
      case "island": v = islandPage(); break;
      case "contact": v = contactPage(); break;
      case "search": v = searchPage(q); break;
      default: v = notFound();
    }
    app.innerHTML = v.html;
    document.title = v.title === T("name") ? T("name") : v.title.replace(/<[^>]+>/g, "") + " | " + T("name");
    if (v.after) v.after();
    closeMenu();
    if (!keepScroll) {
      const target = anchor && document.getElementById(anchor);
      if (target) target.scrollIntoView(); else window.scrollTo(0, 0);
      app.focus({ preventScroll: true });
    }
  }

  /* ================= STATIC PARTS (header, footer, language) ================= */
  function applyStatic() {
    document.documentElement.lang = LANG;
    document.documentElement.dir = LANG === "en" ? "ltr" : "rtl";
    document.querySelectorAll("[data-i18n]").forEach((el) => (el.textContent = T(el.dataset.i18n)));
    document.querySelectorAll("[data-i18n-ph]").forEach((el) => (el.placeholder = T(el.dataset.i18nPh)));
    document.getElementById("langBtn").textContent = LANG === "en" ? "ދިވެހި" : "EN";
    document.getElementById("langBtn").setAttribute("aria-label", LANG === "en" ? "ދިވެހި" : "English");
    document.getElementById("copy").textContent = T("copy").replace("{y}", new Date().getFullYear());
    renderFooter();
  }
  function renderFooter() {
    if (!DB) return;
    const s = DB.setting;
    const item = (icon, val, href) => val ? `<div class="fc-item">${icon}<a href="${href}">${esc(val)}</a></div>` : "";
    document.getElementById("footContact").innerHTML =
      item(ICON.phone, s.phone, tel(s.phone)) + item(ICON.headset, s.hotline, tel(s.hotline)) +
      item(ICON.globe, s.website, "https://" + String(s.website || "").replace(/^https?:\/\//, "")) + item(ICON.at, s.email, "mailto:" + s.email);
    const soc = [["x", s.x, "X"], ["fb", s.facebook, "Facebook"], ["ig", s.instagram, "Instagram"]]
      .filter((x) => safeUrl(x[1])).map(([k, u, l]) => `<a href="${esc(safeUrl(u))}" target="_blank" rel="noopener" aria-label="${l}">${ICON[k]}</a>`).join("");
    document.getElementById("social").innerHTML = soc;
  }
  function setLang(l) {
    LANG = l;
    try { localStorage.setItem("kondey-lang", l); } catch (e) {}
    applyStatic();
    route(true);
  }

  /* menu, search, lightbox, scroll */
  const menu = document.getElementById("menu"), burger = document.getElementById("burger");
  function closeMenu() { menu.classList.remove("open"); burger.setAttribute("aria-expanded", "false"); menu.querySelectorAll(".expanded").forEach((li) => li.classList.remove("expanded")); }
  burger.onclick = () => { const o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", String(o)); };
  menu.querySelectorAll(":scope > li > a").forEach((a) => a.addEventListener("click", (e) => {
    const li = a.parentElement;
    if (innerWidth <= 960 && li.querySelector(".dropdown") && !li.classList.contains("expanded")) { e.preventDefault(); li.classList.add("expanded"); }
  }));
  const panel = document.getElementById("searchPanel"), sInput = document.getElementById("searchInput");
  document.getElementById("searchBtn").onclick = () => { panel.classList.add("open"); sInput.focus(); };
  document.getElementById("searchClose").onclick = () => panel.classList.remove("open");
  document.getElementById("searchForm").onsubmit = (e) => {
    e.preventDefault(); panel.classList.remove("open");
    location.hash = "#/search?q=" + encodeURIComponent(sInput.value.trim()); sInput.value = "";
  };
  const lb = document.getElementById("lightbox");
  const closeLb = () => lb.classList.remove("open");
  document.getElementById("lbClose").onclick = closeLb;
  lb.onclick = (e) => { if (e.target === lb) closeLb(); };
  addEventListener("keydown", (e) => { if (e.key === "Escape") { panel.classList.remove("open"); closeLb(); closeMenu(); } });
  const header = document.getElementById("header"), toTop = document.getElementById("toTop");
  addEventListener("scroll", () => { header.classList.toggle("scrolled", scrollY > 10); toTop.classList.toggle("show", scrollY > 600); });
  toTop.onclick = () => scrollTo({ top: 0, behavior: "smooth" });
  document.getElementById("langBtn").onclick = () => setLang(LANG === "en" ? "dv" : "en");
  addEventListener("hashchange", () => route(false));

  if (!S.live) {
    const note = document.createElement("p");
    note.className = "demo-note"; note.innerHTML = "<b>DEMO</b>" + UI.en.demo_tip;
    document.querySelector("footer .container").appendChild(note);
  }

  /* ================= START ================= */
  async function start() {
    applyStatic();
    app.innerHTML = `<div class="loading"><div class="spinner"></div>${T("loading")}</div>`;
    try {
      await load();
    } catch (e) {
      app.innerHTML = `<div class="empty"><p>${T("load_err")}</p><p style="margin-top:14px"><button class="btn btn-gold" id="retryBtn" type="button">${T("retry")}</button></p></div>`;
      document.getElementById("retryBtn").onclick = start;
      return;
    }
    renderFooter();
    route(!location.hash || location.hash === "#/");
  }
  start();
})();
