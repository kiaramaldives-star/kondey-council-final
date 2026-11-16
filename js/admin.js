/* Kondey Council — staff page (admin.html)
   Staff sign in, write content, and approvers publish it.
   Roles: editor (write + send for approval) · approver (publish, unpublish, delete) · admin (approver + staff roles) */
(function () {
  "use strict";
  const S = window.KondeyStore;
  const root = document.getElementById("root");

  /* ================= HELPERS ================= */
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const pad = (n) => String(n).padStart(2, "0");
  const todayIso = () => { const d = new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); };
  const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const fmt = (iso) => { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(iso || "")); return m ? `${+m[3]} ${MON[+m[2] - 1]} ${m[1]}` : ""; };
  const isApprover = () => me && (me.role === "approver" || me.role === "admin");
  let toastT;
  function toast(msg, bad) {
    let t = document.querySelector(".toast");
    if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
    t.textContent = msg; t.classList.toggle("bad", !!bad); t.hidden = false;
    clearTimeout(toastT); toastT = setTimeout(() => (t.hidden = true), bad ? 6000 : 3000);
  }
  function friendly(m) {
    m = String(m || "");
    if (/Invalid login/i.test(m)) return "Wrong email or password.";
    if (/approvers can publish/i.test(m)) return "Only approvers can publish. Please send it for approval.";
    if (/row-level security|permission denied|PGRST116|0 rows|no\) rows/i.test(m)) return "You do not have permission to do that. Ask an admin to check your staff role.";
    if (/Failed to fetch|NetworkError|Load failed/i.test(m)) return "No connection to the server. Check the internet connection.";
    if (/Email not confirmed/i.test(m)) return "This email address has not been confirmed yet.";
    return m || "Something went wrong.";
  }

  /* ================= DATA ADAPTERS ================= */
  /* DEMO: everything is saved in this browser only */
  function demoAdapter() {
    const USERS = {
      "editor@demo.mv": { id: "u-editor", role: "editor", full_name: "Demo Editor" },
      "approver@demo.mv": { id: "u-approver", role: "approver", full_name: "Demo Approver" },
      "admin@demo.mv": { id: "u-admin", role: "admin", full_name: "Demo Admin" }
    };
    const PASS = "demo1234", SK = "kondey-demo-session";
    let user = null;
    const db = () => S.demoLoad();
    const save = (d) => { if (!S.demoSave(d)) throw new Error("This browser's storage is full. Use smaller files, or reset the demo."); };
    const canPub = () => user && (user.role === "approver" || user.role === "admin");
    function guard(old, row) { /* same rule as the database trigger */
      const changed = !old || JSON.stringify(old.data) !== JSON.stringify(row.data);
      if (row.status === "published" && (!old || old.status !== "published" || changed)) {
        if (!canPub()) throw new Error("Only approvers can publish. Please send it for approval.");
        row.approved_by = user.id; row.note = null; row.pending_data = null;
        if (!row.published_on) row.published_on = /^\d{4}-\d{2}-\d{2}$/.test(row.data.date || "") ? row.data.date : todayIso();
      }
      row.updated_at = new Date().toISOString(); row.updated_by = user.id;
    }
    return {
      demo: true, users: USERS, pass: PASS,
      async getSession() { try { const e = sessionStorage.getItem(SK); if (e && USERS[e]) return (user = Object.assign({ email: e }, USERS[e])); } catch (_) {} return null; },
      async signIn(email, pw) {
        email = String(email).trim().toLowerCase();
        if (!USERS[email] || pw !== PASS) throw new Error("Wrong email or password.");
        user = Object.assign({ email }, USERS[email]);
        try { sessionStorage.setItem(SK, email); } catch (_) {}
        return user;
      },
      async signOut() { user = null; try { sessionStorage.removeItem(SK); } catch (_) {} },
      async resetPassword() { throw new Error("Password reset works once Supabase is connected."); },
      async updatePassword() {},
      onRecovery() {},
      async profile() { return user; },
      async listContent() { return db().content; },
      async saveContent(row) {
        const d = db();
        const i = row.id ? d.content.findIndex((r) => r.id === row.id) : -1;
        const old = i >= 0 ? d.content[i] : null;
        const next = Object.assign({}, old || { id: "x-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), created_at: new Date().toISOString(), created_by: user.id, published_on: null, pending_data: null, note: null }, row);
        guard(old ? JSON.parse(JSON.stringify(old)) : null, next);
        if (i >= 0) d.content[i] = next; else d.content.push(next);
        save(d);
        return next;
      },
      async deleteContent(id) {
        if (!canPub()) throw new Error("Only approvers can delete.");
        const d = db(); d.content = d.content.filter((r) => r.id !== id); save(d);
      },
      async upload(file) {
        if (file.size > 1.5e6) throw new Error("In demo mode files must be smaller than 1.5 MB.");
        return new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = () => rej(new Error("Could not read the file.")); fr.readAsDataURL(file); });
      },
      async listFeedback() { return db().feedback || []; },
      async updateFeedback(id, patch) { const d = db(); const f = (d.feedback || []).find((x) => x.id === id); if (f) Object.assign(f, patch); save(d); },
      async listProfiles() { return Object.entries(USERS).map(([email, u]) => ({ id: u.id, email, full_name: u.full_name, role: u.role })); },
      async updateProfile() { throw new Error("In demo mode the three demo accounts can't be changed."); }
    };
  }

  /* LIVE: Supabase */
  function supabaseAdapter() {
    if (!window.supabase || !window.supabase.createClient) throw new Error("Could not load the Supabase library. Check the internet connection and reload.");
    const sb = window.supabase.createClient(S.config.supabaseUrl, S.key);
    const chk = (r) => { if (r.error) throw new Error(friendly(r.error.message)); return r.data; };
    return {
      demo: false,
      async getSession() { const { data } = await sb.auth.getSession(); return data && data.session ? data.session.user : null; },
      async signIn(email, pw) { return chk(await sb.auth.signInWithPassword({ email: String(email).trim(), password: pw })).user; },
      async signOut() { await sb.auth.signOut(); },
      async resetPassword(email) { chk(await sb.auth.resetPasswordForEmail(String(email).trim(), { redirectTo: location.href.split("#")[0] })); },
      async updatePassword(pw) { chk(await sb.auth.updateUser({ password: pw })); },
      onRecovery(cb) { sb.auth.onAuthStateChange((ev) => { if (ev === "PASSWORD_RECOVERY") cb(); }); },
      async profile() {
        const u = (await sb.auth.getUser()).data.user;
        if (!u) return null;
        const p = chk(await sb.from("profiles").select("*").eq("id", u.id).maybeSingle());
        return p ? Object.assign({}, p, { email: p.email || u.email }) : null;
      },
      async listContent() { return chk(await sb.from("content").select("*").order("updated_at", { ascending: false })); },
      async saveContent(row) {
        const f = { status: row.status, data: row.data };
        if ("pending_data" in row) f.pending_data = row.pending_data;
        if ("note" in row) f.note = row.note;
        if (row.id) return chk(await sb.from("content").update(f).eq("id", row.id).select().single());
        f.type = row.type;
        return chk(await sb.from("content").insert(f).select().single());
      },
      async deleteContent(id) {
        const d = chk(await sb.from("content").delete().eq("id", id).select());
        if (!d || !d.length) throw new Error("Only approvers can delete.");
      },
      async upload(file) {
        if (file.size > 20e6) throw new Error("Files must be smaller than 20 MB.");
        const name = Date.now() + "-" + (file.name || "file").toLowerCase().replace(/[^a-z0-9.\-]+/g, "-").slice(-60);
        chk(await sb.storage.from("media").upload(name, file, { cacheControl: "3600", upsert: false, contentType: file.type || undefined }));
        return sb.storage.from("media").getPublicUrl(name).data.publicUrl;
      },
      async listFeedback() { return chk(await sb.from("feedback").select("*").order("created_at", { ascending: false })); },
      async updateFeedback(id, patch) { chk(await sb.from("feedback").update(patch).eq("id", id)); },
      async listProfiles() { return chk(await sb.from("profiles").select("*").order("email")); },
      async updateProfile(id, patch) {
        const d = chk(await sb.from("profiles").update(patch).eq("id", id).select());
        if (!d || !d.length) throw new Error("Only an admin can change staff roles.");
      }
    };
  }

  /* ================= WHAT EACH CONTENT TYPE CONTAINS ================= */
  const ICONS = [["home", "House / land"], ["doc", "Document"], ["person", "Person"], ["shop", "Shop / business"], ["boat", "Boat / harbour"], ["bin", "Waste"], ["calendar", "Calendar / booking"], ["chat", "Message"], ["water", "Water"], ["star", "Other"]];
  const DOC_TYPES = [["form", "Form"], ["regulation", "Regulation"], ["budget", "Budget"], ["report", "Report"], ["plan", "Plan"], ["other", "Other"]];
  const TYPES = {
    news: { label: "News", one: "news item", route: "news", fields: [
      { key: "title", label: "Title", bi: true, req: "dv" },
      { key: "category", label: "Topic label", bi: true, hint: "Short, e.g. ތަރައްގީ / Development" },
      { key: "date", label: "Date", type: "date", req: true },
      { key: "photo", label: "Photo", type: "image" },
      { key: "body", label: "Story", type: "textarea", tall: true, bi: true, req: "dv", hint: "Leave an empty line between paragraphs." }] },
    vacancy: { label: "Vacancies", one: "vacancy", route: "jobs", fields: [
      { key: "title", label: "Job title", bi: true, req: "dv" },
      { key: "date", label: "Date announced", type: "date", req: true },
      { key: "deadline", label: "Deadline", type: "date", req: true, hint: "Open / Closing soon / Closed is set automatically from this date." },
      { key: "posts", label: "Number of posts" }, { key: "salary", label: "Salary", hint: "e.g. MVR 9,500" },
      { key: "details", label: "Requirements", type: "textarea", bi: true, req: "dv", hint: "One requirement per line." },
      { key: "form", label: "Application form", type: "file" }] },
    tender: { label: "Procurement", one: "tender", route: "procurement", fields: [
      { key: "ref_no", label: "Reference number", hint: "e.g. (IUL)315-PR/2026/14" },
      { key: "title", label: "Title", bi: true, req: "dv" },
      { key: "date", label: "Date announced", type: "date", req: true },
      { key: "deadline", label: "Deadline", type: "date", req: true },
      { key: "details", label: "Details", type: "textarea", bi: true },
      { key: "document", label: "Tender documents", type: "file" },
      { key: "result", label: "Result", type: "textarea", bi: true, hint: "Fill in after the award, e.g. who it was awarded to." }] },
    service: { label: "Services", one: "service", route: "services", fields: [
      { key: "name", label: "Service name", bi: true, req: "dv" },
      { key: "desc", label: "Short description", bi: true, req: "dv" },
      { key: "icon", label: "Icon", type: "select", options: ICONS },
      { key: "requirements", label: "Documents needed", type: "textarea", bi: true, hint: "One per line." },
      { key: "fee", label: "Fee", hint: "e.g. MVR 100, or ހިލޭ / Free" },
      { key: "duration", label: "Time taken", bi: true, hint: "e.g. 3 ދުވަސް / 3 days" },
      { key: "form", label: "Form", type: "file" },
      { key: "sort", label: "Order on the page", type: "number", hint: "1 shows first." }] },
    document: { label: "Documents", one: "document", route: "documents", fields: [
      { key: "title", label: "Title", bi: true, req: "dv" },
      { key: "doc_type", label: "Type", type: "select", options: DOC_TYPES, req: true },
      { key: "year", label: "Year", type: "number", req: true },
      { key: "date", label: "Date", type: "date" },
      { key: "file", label: "File (PDF)", type: "file", req: true }] },
    meeting: { label: "Meetings & decisions", one: "meeting", route: "meetings", fields: [
      { key: "meeting_no", label: "Meeting number", type: "number" },
      { key: "date", label: "Meeting date", type: "date", req: true },
      { key: "decisions", label: "Decisions", type: "textarea", bi: true, req: "dv", hint: "One decision per line." },
      { key: "agenda", label: "Agenda", type: "textarea", bi: true, hint: "One item per line." },
      { key: "minutes", label: "Minutes (PDF)", type: "file" }] },
    gallery: { label: "Photo gallery", one: "photo", route: "island", fields: [
      { key: "photo", label: "Photo", type: "image", req: true },
      { key: "caption", label: "Caption", bi: true },
      { key: "sort", label: "Order", type: "number" }] },
    member: { label: "Council members", one: "member", route: "council", fields: [
      { key: "name", label: "Name", bi: true, req: "dv" },
      { key: "role", label: "Role", bi: true, req: "dv", hint: "e.g. ރައީސް / President" },
      { key: "phone", label: "Office phone" }, { key: "mobile", label: "Mobile" },
      { key: "email", label: "Email", type: "email" },
      { key: "photo", label: "Photo", type: "image", hint: "A square head-and-shoulders photo works best." },
      { key: "sort", label: "Order", type: "number", hint: "1 = President, 2 = Vice President …" }] },
    page: { label: "Pages", one: "page", fields: [
      { key: "title", label: "Title", bi: true, req: "dv" },
      { key: "body", label: "Text", type: "textarea", tall: true, bi: true, req: "dv", hint: "Leave an empty line between paragraphs." },
      { key: "photo", label: "Photo", type: "image" },
      { key: "land_use_url", label: "Land-use plan (PDF)", type: "file", only: "island" }] },
    setting: { label: "Site settings", one: "settings", fields: [
      { key: "hero_title", label: "Home page title", bi: true },
      { key: "hero_sub", label: "Home page subtitle", bi: true },
      { key: "hero_photos", label: "Home page slideshow photos", type: "images", hint: "One photo link per line. Use Upload to add one." },
      { key: "population", label: "Population", type: "number" }, { key: "area", label: "Land area (hectares)", type: "number" },
      { key: "households", label: "Households", type: "number" },
      { key: "phone", label: "Council phone" }, { key: "hotline", label: "Hotline" },
      { key: "email", label: "Email", type: "email" }, { key: "website", label: "Website", hint: "e.g. kondey.gov.mv" },
      { key: "address", label: "Address", bi: true }, { key: "hours", label: "Opening hours", type: "textarea", bi: true },
      { key: "map_query", label: "Map location", hint: "What to search on Google Maps, e.g. Kondey, Gaafu Alifu Atoll, Maldives" },
      { key: "facebook", label: "Facebook link" }, { key: "instagram", label: "Instagram link" }, { key: "x", label: "X (Twitter) link" }] }
  };
  const LIST_TYPES = ["news", "vacancy", "tender", "service", "document", "meeting", "gallery", "member"];
  const PAGES = { council: "About the council", island: "Island profile" };

  const titleOf = (r) => {
    const d = r.pending_data || r.data || {};
    if (r.type === "gallery") return d.caption_dv || d.caption_en || "Photo";
    if (r.type === "meeting") return "Meeting " + (d.meeting_no || "") + (d.date ? " · " + fmt(d.date) : "");
    if (r.type === "setting") return "Site settings";
    return d.title_dv || d.name_dv || d.title_en || d.name_en || "(no title)";
  };
  const titleEn = (r) => { const d = r.pending_data || r.data || {}; return d.title_en || d.name_en || d.caption_en || ""; };
  const statusChip = (r) => {
    const s = { published: "Published", draft: "Draft", pending: "Waiting for approval" }[r.status] || r.status;
    return `<span class="st ${esc(r.status)}">${s}</span>${r.pending_data ? ' <span class="st changes">Changes waiting</span>' : ""}`;
  };
  const isWaiting = (r) => r.status === "pending" || !!r.pending_data;

  /* ================= STATE ================= */
  let A = null;        // adapter
  let me = null;       // profile {email, role, ...}
  let ROWS = [];       // all content
  let FEEDBACK = [];
  async function refresh() {
    ROWS = await A.listContent();
    try { FEEDBACK = await A.listFeedback(); } catch (e) { FEEDBACK = []; }
  }

  /* ================= LOGIN ================= */
  const brand = (sub) => `<div class="brand"><svg><use href="#logo"/></svg><div><b>Kondey Council</b><small>${esc(sub || "Staff page")}</small></div></div>`;
  function loginView(msg) {
    root.innerHTML = `<div class="login"><form class="login-card" id="loginForm">
      ${brand()}
      <h1>Sign in</h1><p class="sub">For council staff only.</p>
      ${msg ? `<div class="banner ${msg.bad ? "bad" : "good"}">${esc(msg.text)}</div>` : ""}
      <div class="form">
        <div class="fld"><label for="em">Email</label><input id="em" type="email" autocomplete="username" required></div>
        <div class="fld"><label for="pw">Password</label><input id="pw" type="password" autocomplete="current-password" required></div>
        <button class="btn pri" type="submit">Sign in</button>
        <a href="#" id="forgot" style="font-size:13.5px">Forgot password?</a>
      </div>
      ${A.demo ? `<div class="banner info" style="margin-top:18px"><b>Demo mode.</b> Try the approval flow with these accounts (password <code>${A.pass}</code>):<br>
        ${Object.keys(A.users).map((e) => `<a href="#" data-demo="${e}">${e}</a> (${A.users[e].role})`).join("<br>")}</div>` : ""}
      <p style="margin-top:16px;font-size:13px"><a href="index.html">← Back to the website</a></p>
    </form></div>`;
    const f = document.getElementById("loginForm");
    document.querySelectorAll("[data-demo]").forEach((a) => (a.onclick = (e) => { e.preventDefault(); f.em.value = a.dataset.demo; f.pw.value = A.pass; f.pw.focus(); }));
    document.getElementById("forgot").onclick = (e) => { e.preventDefault(); resetView(f.em.value); };
    f.onsubmit = async (e) => {
      e.preventDefault();
      const b = f.querySelector("button"); b.disabled = true; b.textContent = "Signing in…";
      try { await A.signIn(f.em.value, f.pw.value); await afterLogin(); }
      catch (err) { loginView({ bad: true, text: friendly(err.message) }); }
    };
    (f.em.value ? f.pw : f.em).focus();
  }
  function resetView(email) {
    root.innerHTML = `<div class="login"><form class="login-card" id="rf">${brand()}
      <h1>Reset password</h1><p class="sub">We'll email you a link to choose a new password.</p>
      <div class="form"><div class="fld"><label for="em">Email</label><input id="em" type="email" value="${esc(email || "")}" required></div>
      <button class="btn pri" type="submit">Send link</button><a href="#" id="back">← Back to sign in</a></div></form></div>`;
    document.getElementById("back").onclick = (e) => { e.preventDefault(); loginView(); };
    document.getElementById("rf").onsubmit = async (e) => {
      e.preventDefault();
      try { await A.resetPassword(e.target.em.value); loginView({ text: "If that email belongs to a staff account, a reset link is on its way." }); }
      catch (err) { toast(friendly(err.message), true); }
    };
  }
  function newPasswordView() {
    root.innerHTML = `<div class="login"><form class="login-card" id="np">${brand()}
      <h1>Choose a new password</h1>
      <div class="form"><div class="fld"><label for="p1">New password</label><input id="p1" type="password" minlength="8" autocomplete="new-password" required>
        <div class="hint">At least 8 characters.</div></div>
      <button class="btn pri" type="submit">Save password</button></div></form></div>`;
    document.getElementById("np").onsubmit = async (e) => {
      e.preventDefault();
      if (e.target.p1.value.length < 8) return toast("Use at least 8 characters.", true);
      try { await A.updatePassword(e.target.p1.value); toast("Password saved."); history.replaceState(null, "", location.pathname); await afterLogin(); }
      catch (err) { toast(friendly(err.message), true); }
    };
  }

  async function afterLogin() {
    me = await A.profile();
    if (!me || !['editor', 'approver', 'admin'].includes(me.role)) {
      root.innerHTML = `<div class="login"><div class="login-card">${brand()}<h1>Not set up yet</h1>
        <p class="sub">You are signed in, but you don't have a staff role yet. Ask the website admin to give you one on the Staff & roles page.</p>
        <button class="btn sec" id="so">Sign out</button></div></div>`;
      document.getElementById("so").onclick = signOut;
      return;
    }
    root.innerHTML = `<div class="loading">Loading content…</div>`;
    try { await refresh(); } catch (err) { root.innerHTML = `<div class="loading">${esc(friendly(err.message))}</div>`; return; }
    shell();
    if (!location.hash || location.hash.length < 3) location.hash = "#/dashboard"; else route();
  }
  async function signOut() { await A.signOut(); me = null; history.replaceState(null, "", location.pathname); loginView({ text: "You have signed out." }); }

  /* ================= SHELL ================= */
  function shell() {
    root.innerHTML = `
      ${A.demo ? `<div class="demo-bar"><b>DEMO MODE</b><span>Changes are saved only in this browser. Fill in config.js to connect the real database.</span><button id="resetDemo" type="button">Reset demo content</button></div>` : ""}
      <header class="top">
        <button class="btn sec sm menu-btn" id="menuBtn" type="button" aria-label="Menu">☰</button>
        ${brand("Staff page")}
        <div class="who"><span class="email">${esc(me.full_name || me.email)}</span><span class="role">${esc(me.role)}</span>
          <a class="btn sec sm" href="index.html" target="_blank" rel="noopener">View website ↗</a>
          <button class="btn sec sm" id="signOut" type="button">Sign out</button></div>
      </header>
      <div class="shell"><nav class="side" id="side" aria-label="Sections"></nav><main class="main" id="main"></main></div>`;
    document.getElementById("signOut").onclick = signOut;
    document.getElementById("menuBtn").onclick = () => document.getElementById("side").classList.toggle("open");
    document.getElementById("main").addEventListener("click", () => document.getElementById("side").classList.remove("open"));
    const rd = document.getElementById("resetDemo");
    if (rd) rd.onclick = async () => { if (confirm("Put back the original sample content? Your demo changes will be lost.")) { S.demoReset(); await refresh(); route(); toast("Demo content reset."); } };
  }
  function nav(active) {
    const waiting = ROWS.filter(isWaiting).length;
    const openFb = FEEDBACK.filter((f) => !f.handled).length;
    const a = (href, label, key, count) => `<a href="${href}" class="${active === key ? "on" : ""}"><span>${label}</span>${count ? `<span class="count">${count}</span>` : ""}</a>`;
    document.getElementById("side").innerHTML =
      a("#/dashboard", "Dashboard", "dashboard") +
      a("#/pending", "Waiting for approval", "pending", waiting) +
      `<div class="grp">Content</div>` + LIST_TYPES.map((t) => a("#/list/" + t, TYPES[t].label, t)).join("") +
      `<div class="grp">Pages & settings</div>` + Object.keys(PAGES).map((p) => a("#/page/" + p, PAGES[p], "page-" + p)).join("") +
      a("#/settings", "Site settings", "settings") +
      `<div class="grp">Inbox</div>` + a("#/feedback", "Complaints & suggestions", "feedback", openFb) +
      `<div class="grp">Help</div>` + (me.role === "admin" ? a("#/staff", "Staff & roles", "staff") : "") + a("#/help", "How it works", "help") +
      `<a href="index.html" target="_blank" rel="noopener"><span>View website ↗</span></a>`;
    document.getElementById("side").classList.remove("open");
  }
  const main = () => document.getElementById("main");

  /* ================= VIEWS ================= */
  function dashboard() {
    nav("dashboard");
    const waiting = ROWS.filter(isWaiting);
    const openFb = FEEDBACK.filter((f) => !f.handled).length;
    const card = (t) => {
      const rs = ROWS.filter((r) => r.type === t);
      return `<a class="stat-card" href="#/list/${t}"><b>${TYPES[t].label}</b><span class="big">${rs.filter((r) => r.status === "published").length}</span> <small>published</small><br><small>${rs.filter((r) => r.status !== "published").length} draft or waiting</small></a>`;
    };
    main().innerHTML = `<div class="ph"><h1>Welcome${me.full_name ? ", " + esc(me.full_name.split(" ")[0]) : ""}</h1>
        <div class="sp"><a class="btn pri" href="#/edit/news/new">+ News</a><a class="btn sec" href="#/edit/vacancy/new">+ Vacancy</a><a class="btn sec" href="#/edit/tender/new">+ Tender</a></div></div>
      <div class="grid" style="margin-bottom:22px">
        <a class="stat-card" href="#/pending" style="${waiting.length ? "border-color:#E8B54A" : ""}"><b>Waiting for approval</b><span class="big">${waiting.length}</span><br><small>${isApprover() ? "Review and publish these" : "Sent to an approver"}</small></a>
        <a class="stat-card" href="#/feedback"><b>New complaints & suggestions</b><span class="big">${openFb}</span><br><small>not yet handled</small></a>
      </div>
      <div class="grid">${LIST_TYPES.map(card).join("")}</div>`;
  }

  function pendingView() {
    nav("pending");
    const list = ROWS.filter(isWaiting).sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)));
    main().innerHTML = `<div class="ph"><h1>Waiting for approval</h1></div>
      ${isApprover() ? `<p style="margin-bottom:14px;color:var(--muted)">Open each item, check it, then press <b>Publish</b> (or <b>Approve changes</b>). You can also send it back with a note.</p>` : `<p style="margin-bottom:14px;color:var(--muted)">These are waiting for an approver. You can still open and edit them.</p>`}
      ${list.length ? table(list, true) : `<div class="card empty">Nothing is waiting. 🎉</div>`}`;
  }

  function table(list, showType) {
    return `<table class="resp"><thead><tr><th>Title</th>${showType ? "<th>Section</th>" : ""}<th>Status</th><th>Date</th><th>Last changed</th></tr></thead><tbody>
      ${list.map((r) => {
        const d = r.pending_data || r.data || {};
        const href = r.type === "page" ? "#/page/" + d.slug : r.type === "setting" ? "#/settings" : `#/edit/${r.type}/${encodeURIComponent(r.id)}`;
        return `<tr><td class="t"><a href="${href}"><span class="dv" dir="rtl">${esc(titleOf(r))}</span></a>${titleEn(r) ? `<span class="en">${esc(titleEn(r))}</span>` : ""}${r.note ? `<span class="en" style="color:#B3261E">Note: ${esc(r.note)}</span>` : ""}</td>
          ${showType ? `<td>${esc((TYPES[r.type] || {}).label || r.type)}</td>` : ""}
          <td>${statusChip(r)}</td><td>${fmt(d.deadline ? d.deadline : d.date) ? (d.deadline ? "Deadline " : "") + fmt(d.deadline || d.date) : "—"}</td><td>${fmt(r.updated_at)}</td></tr>`;
      }).join("")}</tbody></table>`;
  }

  function listView(type) {
    const T = TYPES[type];
    if (!T) return notFound();
    nav(type);
    main().innerHTML = `<div class="ph"><h1>${T.label}</h1><div class="sp"><a class="btn pri" href="#/edit/${type}/new">+ New ${T.one}</a></div></div>
      <div class="tools"><input type="search" id="q" placeholder="Search ${T.label.toLowerCase()}…" aria-label="Search">
        <select id="sf" aria-label="Status"><option value="">All</option><option value="published">Published</option><option value="waiting">Waiting for approval</option><option value="draft">Draft</option></select></div>
      <div id="tbl"></div>`;
    const draw = () => {
      const q = document.getElementById("q").value.trim().toLowerCase(), sf = document.getElementById("sf").value;
      let list = ROWS.filter((r) => r.type === type);
      if (sf === "waiting") list = list.filter(isWaiting); else if (sf) list = list.filter((r) => r.status === sf);
      if (q) list = list.filter((r) => JSON.stringify(r.pending_data || r.data).toLowerCase().includes(q));
      if (["service", "member", "gallery"].includes(type)) list.sort((a, b) => (+a.data.sort || 999) - (+b.data.sort || 999));
      else list.sort((a, b) => String((b.data.date || b.updated_at)).localeCompare(String(a.data.date || a.updated_at)));
      document.getElementById("tbl").innerHTML = list.length ? table(list) : `<div class="card empty">No ${T.label.toLowerCase()} yet. <a href="#/edit/${type}/new">Add the first one</a>.</div>`;
    };
    document.getElementById("q").oninput = draw;
    document.getElementById("sf").onchange = draw;
    draw();
  }

  /* ---------- the editor ---------- */
  function fieldHtml(f, data, slug) {
    if (f.only && f.only !== slug) return "";
    const req = (lang) => (f.req === true || f.req === lang) ? ' <span class="req">*</span>' : "";
    const val = (k) => (data[k] == null ? "" : data[k]);
    const input = (k, dir, labelHtml) => {
      const id = "f_" + k, dv = dir === "rtl" ? ' dir="rtl" class="dv"' : "";
      let ctl;
      if (f.type === "textarea") ctl = `<textarea id="${id}" name="${k}"${dv}${f.tall ? ' class="tall' + (dir === "rtl" ? " dv" : "") + '"' : ""}>${esc(val(k))}</textarea>`;
      else if (f.type === "select") ctl = `<select id="${id}" name="${k}"><option value="">—</option>${f.options.map(([v, l]) => `<option value="${v}"${String(val(k)) === v ? " selected" : ""}>${l}</option>`).join("")}</select>`;
      else ctl = `<input id="${id}" name="${k}" type="${f.type === "date" || f.type === "number" || f.type === "email" ? f.type : "text"}"${dv} value="${esc(val(k))}"${f.type === "number" ? ' min="0" step="1"' : ""}>`;
      return `<div class="fld" data-key="${k}"><label for="${id}">${labelHtml}</label>${ctl}<div class="err" hidden></div></div>`;
    };
    if (f.bi) {
      return `<div><div class="pair">
        ${input(f.key + "_dv", "rtl", `${esc(f.label)} <span class="tag">Dhivehi</span>${req("dv")}`)}
        ${input(f.key + "_en", "ltr", `${esc(f.label)} <span class="tag">English</span>${req("en")}`)}
      </div>${f.hint ? `<div class="fld"><div class="hint">${esc(f.hint)}</div></div>` : ""}</div>`;
    }
    if (f.type === "image" || f.type === "file" || f.type === "images") {
      const k = f.key, v = val(k);
      const prev = f.type === "image" ? `<div class="prev" data-prev="${k}" style="${v ? `background-image:url('${esc(v)}')` : ""}"></div>` : "";
      const ctl = f.type === "images"
        ? `<textarea id="f_${k}" name="${k}" style="min-height:90px">${esc(v)}</textarea>`
        : `<input id="f_${k}" name="${k}" value="${esc(v)}" placeholder="Paste a link, or upload a file">`;
      return `<div class="fld" data-key="${k}"><label for="f_${k}">${esc(f.label)}${req(true)}</label>
        <div class="media">${prev}<div class="col">${ctl}
          <div class="row"><label class="btn sec sm file-btn">Upload…<input type="file" data-up="${k}" data-kind="${f.type}" ${f.type !== "file" ? 'accept="image/*"' : 'accept=".pdf,.doc,.docx,.xls,.xlsx,image/*"'}></label>
          ${f.type === "file" && v ? `<a href="${esc(v)}" target="_blank" rel="noopener" class="btn sec sm">Open current file ↗</a>` : ""}<span class="hint" data-st="${k}"></span></div>
        </div></div>${f.hint ? `<div class="hint">${esc(f.hint)}</div>` : ""}<div class="err" hidden></div></div>`;
    }
    return `<div>${input(f.key, "ltr", esc(f.label) + req(true))}${f.hint ? `<div class="fld"><div class="hint">${esc(f.hint)}</div></div>` : ""}</div>`;
  }

  function readForm(form, T, base) {
    const data = Object.assign({}, base);
    T.fields.forEach((f) => {
      const keys = f.bi ? [f.key + "_dv", f.key + "_en"] : [f.key];
      keys.forEach((k) => { const el = form.elements[k]; if (el) data[k] = el.value.trim(); });
    });
    return data;
  }
  function validate(form, T, data, slug) {
    let ok = true, firstBad = null;
    form.querySelectorAll(".fld.bad").forEach((el) => { el.classList.remove("bad"); const e = el.querySelector(".err"); if (e) e.hidden = true; });
    T.fields.forEach((f) => {
      if (!f.req || (f.only && f.only !== slug)) return;
      const keys = f.bi ? [f.key + "_" + (f.req === "en" ? "en" : "dv")] : [f.key];
      keys.forEach((k) => {
        if (String(data[k] || "").trim()) return;
        ok = false;
        const box = form.querySelector(`.fld[data-key="${k}"]`);
        if (box) { box.classList.add("bad"); const e = box.querySelector(".err"); if (e) { e.hidden = false; e.textContent = "Please fill this in."; } firstBad = firstBad || box; }
      });
    });
    if (firstBad) { firstBad.scrollIntoView({ block: "center" }); const i = firstBad.querySelector("input,textarea,select"); if (i) i.focus(); }
    return ok;
  }

  function editView(type, id, opts) {
    opts = opts || {};
    const T = TYPES[type];
    if (!T) return notFound();
    let row = opts.row || (id === "new" ? null : ROWS.find((r) => String(r.id) === String(id)));
    if (id !== "new" && !row && !opts.singleton) return notFound();
    const isNew = !row;
    const slug = opts.slug || (row && row.data && row.data.slug) || "";
    const base = row ? (row.pending_data || row.data || {}) : (opts.defaults || {});
    nav(opts.navKey || type);
    const live = row && row.status === "published";
    const banners = [];
    if (row && row.note) banners.push(`<div class="banner bad"><b>Sent back by the approver:</b> ${esc(row.note)}</div>`);
    if (row && row.pending_data && isApprover()) banners.push(`<div class="banner info"><b>An editor has proposed changes.</b> The form shows the proposed version. The website still shows the old version until you press <b>Approve changes</b>.</div>`);
    if (row && row.pending_data && !isApprover()) banners.push(`<div class="banner info"><b>Your changes are waiting for approval.</b> The website still shows the published version.</div>`);
    if (live && !row.pending_data && !isApprover()) banners.push(`<div class="banner warn">This is live on the website. Your changes will go to an approver; the live version stays until they approve.</div>`);
    if (row && row.status === "pending" && isApprover()) banners.push(`<div class="banner info">This is waiting for your approval. Check it, then press <b>Publish</b>.</div>`);

    const preview = live && T.route ? (type === "page" ? `index.html#/${slug}` : ["gallery", "member"].includes(type) ? `index.html#/${T.route}` : `index.html#/${T.route}/${encodeURIComponent(row.id)}`) : "";
    const btn = (act, label, cls) => `<button type="button" class="btn ${cls}" data-act="${act}">${label}</button>`;
    let left = [], right = [];
    if (isApprover()) {
      left.push(btn("publish", row && row.pending_data ? "Approve changes" : live ? "Save & publish changes" : "Publish", "pri"));
      if (!live) left.push(btn("draft", "Save draft", "sec"));
      if (row && row.pending_data) left.push(btn("reject", "Reject changes…", "sec"));
      if (row && row.status === "pending") left.push(btn("sendback", "Send back…", "sec"));
      if (live && !opts.singleton) right.push(btn("unpublish", "Unpublish", "sec"));
      if (row && !opts.singleton) right.push(btn("delete", "Delete", "danger"));
    } else if (live) {
      left.push(btn("propose", row.pending_data ? "Update my proposed changes" : "Send changes for approval", "pri"));
      if (row.pending_data) left.push(btn("withdraw", "Withdraw my changes", "sec"));
    } else {
      left.push(btn("submit", "Send for approval", "pri"), btn("draft", "Save draft", "sec"));
    }
    if (preview) right.unshift(`<a class="btn sec" href="${preview}" target="_blank" rel="noopener">View on website ↗</a>`);

    const heading = opts.heading || (isNew ? "New " + T.one : "Edit " + T.one);
    main().innerHTML = `<div class="crumb">${opts.singleton ? "Pages & settings" : `<a href="#/list/${type}">${T.label}</a>`}</div>
      <div class="ph"><h1>${esc(heading)}</h1>${row ? statusChip(row) : ""}</div>
      ${banners.join("")}
      <form class="form card" id="ed" novalidate>${T.fields.map((f) => fieldHtml(f, base, slug)).join("")}</form>
      <div class="actions">${left.join("")}<div class="sp">${right.join("")}</div></div>`;

    const form = document.getElementById("ed");
    form.onsubmit = (e) => e.preventDefault();
    /* uploads */
    form.querySelectorAll("input[data-up]").forEach((inp) => (inp.onchange = async () => {
      const file = inp.files[0]; if (!file) return;
      const k = inp.dataset.up, st = form.querySelector(`[data-st="${k}"]`), target = form.elements[k];
      st.textContent = "Uploading…";
      try {
        const url = await A.upload(file);
        if (inp.dataset.kind === "images") target.value = (target.value.trim() ? target.value.trim() + "\n" : "") + url;
        else target.value = url;
        const pv = form.querySelector(`[data-prev="${k}"]`); if (pv) pv.style.backgroundImage = `url('${url}')`;
        st.textContent = "Uploaded ✓";
      } catch (err) { st.textContent = ""; toast(friendly(err.message), true); }
      inp.value = "";
    }));
    form.querySelectorAll('input[name="photo"]').forEach((el) => (el.oninput = () => { const pv = form.querySelector('[data-prev="photo"]'); if (pv) pv.style.backgroundImage = el.value ? `url('${el.value.replace(/'/g, "%27")}')` : ""; }));

    /* actions */
    document.querySelectorAll(".actions [data-act]").forEach((b) => (b.onclick = async () => {
      const act = b.dataset.act;
      const data = readForm(form, T, Object.assign({}, base, slug ? { slug } : {}, opts.extra || {}));
      let payload;
      try {
        if (act === "delete") {
          if (!confirm(`Delete this ${T.one}? This can't be undone.`)) return;
          await A.deleteContent(row.id); toast("Deleted."); await refresh(); location.hash = "#/list/" + type; return;
        }
        if (act === "reject" || act === "sendback") {
          const note = prompt(act === "reject" ? "Why are these changes rejected? (shown to the editor)" : "What needs to change? (shown to the editor)");
          if (note === null) return;
          payload = act === "reject" ? { id: row.id, status: row.status, data: row.data, pending_data: null, note: note || "Changes rejected." }
                                     : { id: row.id, status: "draft", data, note: note || "Please revise." };
        } else if (act === "withdraw") {
          payload = { id: row.id, status: row.status, data: row.data, pending_data: null };
        } else if (act === "unpublish") {
          if (!confirm("Take this off the website? It will become a draft.")) return;
          payload = { id: row.id, status: "draft", data: row.data, pending_data: null };
        } else {
          const needValid = act !== "draft";
          if (needValid && !validate(form, T, data, slug)) { toast("Some required boxes are empty.", true); return; }
          if (act === "propose") payload = { id: row.id, status: "published", data: row.data, pending_data: data, note: null };
          else payload = { id: row && row.id, type, status: { publish: "published", draft: "draft", submit: "pending" }[act], data, note: null };
          if (act === "publish") payload.pending_data = null;
        }
        Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);
        if (!payload.id) { delete payload.id; payload.type = type; }
        b.disabled = true;
        const saved = await A.saveContent(payload);
        toast({ publish: "Published on the website.", draft: "Saved as draft.", submit: "Sent for approval.", propose: "Changes sent for approval.", withdraw: "Your changes were withdrawn.", unpublish: "Taken off the website.", reject: "Changes rejected.", sendback: "Sent back to the editor." }[act] || "Saved.");
        await refresh();
        if (opts.singleton) route(); else if (isNew) location.hash = `#/edit/${type}/${encodeURIComponent(saved.id)}`; else route();
      } catch (err) { b.disabled = false; toast(friendly(err.message), true); }
    }));
  }

  function pageView(slug) {
    if (!PAGES[slug]) return notFound();
    const row = ROWS.find((r) => r.type === "page" && r.data && r.data.slug === slug);
    editView("page", row ? row.id : "new", { row, singleton: true, slug, navKey: "page-" + slug, heading: PAGES[slug], defaults: { slug } });
  }
  function settingsView() {
    const row = ROWS.find((r) => r.type === "setting");
    editView("setting", row ? row.id : "new", { row, singleton: true, navKey: "settings", heading: "Site settings", extra: { key: "site" } });
  }

  function feedbackView(filter) {
    nav("feedback");
    filter = filter || "open";
    const list = FEEDBACK.filter((f) => filter === "all" || (filter === "open" ? !f.handled : f.handled));
    main().innerHTML = `<div class="ph"><h1>Complaints & suggestions</h1></div>
      <div class="tools">${[["open", "New"], ["done", "Handled"], ["all", "All"]].map(([k, l]) => `<a class="btn ${k === filter ? "pri" : "sec"} sm" href="#/feedback/${k}">${l}</a>`).join("")}</div>
      ${list.length ? list.map((f) => `<div class="fb${f.handled ? " done" : ""}" data-id="${esc(f.id)}">
        <div class="h"><span class="ref">${esc(f.ref_no)}</span><span class="st ${f.kind === "complaint" ? "pending" : "changes"}">${f.kind === "complaint" ? "Complaint" : "Suggestion"}</span>
          <span style="color:var(--muted);font-size:13px">${fmt(f.created_at)}</span>${f.handled ? '<span class="st published">Handled</span>' : ""}</div>
        <div><b>${esc(f.name)}</b> · <a href="tel:${esc(String(f.phone || "").replace(/[^\d+]/g, ""))}">${esc(f.phone)}</a>${f.email ? ` · <a href="mailto:${esc(f.email)}">${esc(f.email)}</a>` : ""}</div>
        <div class="msg" dir="auto">${esc(f.message)}</div>
        <textarea placeholder="Staff note (what was done)" aria-label="Staff note">${esc(f.staff_note || "")}</textarea>
        <div class="tools" style="margin:8px 0 0"><button class="btn ${f.handled ? "sec" : "ok"} sm" data-fb="toggle" type="button">${f.handled ? "Mark as new again" : "Mark as handled"}</button>
          <button class="btn sec sm" data-fb="note" type="button">Save note</button></div>
      </div>`).join("") : `<div class="card empty">Nothing here.</div>`}`;
    main().querySelectorAll("[data-fb]").forEach((b) => (b.onclick = async () => {
      const card = b.closest(".fb"), f = FEEDBACK.find((x) => String(x.id) === card.dataset.id);
      const patch = { staff_note: card.querySelector("textarea").value };
      if (b.dataset.fb === "toggle") patch.handled = !f.handled;
      try { await A.updateFeedback(f.id, patch); Object.assign(f, patch); toast("Saved."); feedbackView(filter); }
      catch (err) { toast(friendly(err.message), true); }
    }));
  }

  async function staffView() {
    nav("staff");
    if (me.role !== "admin") return notFound();
    main().innerHTML = `<div class="loading">Loading staff…</div>`;
    let list;
    try { list = await A.listProfiles(); } catch (err) { main().innerHTML = `<div class="banner bad">${esc(friendly(err.message))}</div>`; return; }
    main().innerHTML = `<div class="ph"><h1>Staff & roles</h1></div>
      <div class="banner info"><b>To add a staff member:</b> in Supabase open <i>Authentication → Users → Add user</i> (or <i>Invite</i>) with their email. They then appear here with <b>no access</b>. Choose their role and press Save.</div>
      <table class="resp"><thead><tr><th>Email</th><th>Name</th><th>Role</th><th></th></tr></thead><tbody>
      ${list.map((p) => `<tr data-id="${esc(p.id)}"><td>${esc(p.email)}</td><td><input class="fld-in" value="${esc(p.full_name || "")}" aria-label="Name" style="border:1.5px solid var(--line);border-radius:8px;padding:6px 10px;width:100%"></td>
        <td><select aria-label="Role" style="border:1.5px solid var(--line);border-radius:8px;padding:6px 10px">${[["none", "no access"], ["editor", "editor"], ["approver", "approver"], ["admin", "admin"]].map(([v, l]) => `<option value="${v}"${p.role === v ? " selected" : ""}>${l}</option>`).join("")}</select></td>
        <td><button class="btn sec sm" type="button">Save</button></td></tr>`).join("")}</tbody></table>
      <div class="help card" style="margin-top:16px"><p><b>no access</b> — can sign in but sees nothing (new accounts start here).<br><b>editor</b> — writes items and sends them for approval.<br><b>approver</b> — can also publish, unpublish and delete.<br><b>admin</b> — approver, plus changes staff roles.</p></div>`;
    main().querySelectorAll("tbody button").forEach((b) => (b.onclick = async () => {
      const tr = b.closest("tr"), id = tr.dataset.id;
      if (id === me.id && tr.querySelector("select").value !== "admin" && !confirm("You are removing your own admin role. Continue?")) return;
      try { await A.updateProfile(id, { full_name: tr.querySelector("input").value.trim(), role: tr.querySelector("select").value }); toast("Saved."); }
      catch (err) { toast(friendly(err.message), true); }
    }));
  }

  function helpView() {
    nav("help");
    main().innerHTML = `<div class="help card"><h1 style="font-size:24px">How the staff page works</h1>
      <h2>1. Write</h2><p>Choose a section on the left (News, Vacancies, …) and press <b>+ New</b>. Fill in the Dhivehi boxes; English is shown when visitors press EN (if English is empty, they see Dhivehi).</p>
      <h2>2. Send for approval</h2><p>Editors press <b>Send for approval</b>. Nothing appears on the website yet. <b>Save draft</b> keeps it private so you can finish later.</p>
      <h2>3. Approve and publish</h2><p>Approvers open <b>Waiting for approval</b>, check the item and press <b>Publish</b>. They can also <b>Send back</b> with a note, which the editor sees at the top of the item.</p>
      <h2>Changing something already on the website</h2><p>If an editor edits a published item, the changes wait for approval and the website keeps showing the old version until an approver presses <b>Approve changes</b>.</p>
      <h2>Photos and files</h2><p>Press <b>Upload…</b> next to a photo or file box. PDFs work best for documents. Use photos under about 1 MB so the site stays fast on phones.</p>
      <h2>Vacancy and tender status</h2><p>Open / Closing soon / Closed is worked out from the deadline automatically: <i>Closing soon</i> in the last 3 days, <i>Closed</i> after the deadline.</p>
      <h2>Complaints and suggestions</h2><p>Messages from the website's Contact page arrive under <b>Complaints & suggestions</b>. Add a note on what was done and press <b>Mark as handled</b>. These are never shown on the website.</p>
      <h2>Rules for every item</h2><ul><li>Always add a date.</li><li>Publish the Dhivehi version first; add English within 2 working days.</li><li>Only use photos of people who agreed to be shown.</li><li>Upload documents as text PDFs, not scanned photos, so search can read them.</li></ul></div>`;
  }

  function notFound() { main().innerHTML = `<div class="card empty">Not found. <a href="#/dashboard">Back to the dashboard</a></div>`; }

  /* ================= ROUTER ================= */
  function route() {
    if (!me || !document.getElementById("main")) return;
    const p = location.hash.replace(/^#\/?/, "").split("/").map(decodeURIComponent);
    window.scrollTo(0, 0);
    switch (p[0]) {
      case "dashboard": case "": return dashboard();
      case "pending": return pendingView();
      case "list": return listView(p[1]);
      case "edit": return editView(p[1], p[2] || "new");
      case "page": return pageView(p[1]);
      case "settings": return settingsView();
      case "feedback": return feedbackView(p[1]);
      case "staff": return staffView();
      case "help": return helpView();
      default: nav(""); return notFound();
    }
  }
  addEventListener("hashchange", route);

  /* ================= START ================= */
  (async function start() {
    try { A = S.live ? supabaseAdapter() : demoAdapter(); }
    catch (err) { root.innerHTML = `<div class="login"><div class="login-card">${brand()}<h1>Can't connect</h1><p class="sub">${esc(err.message)}</p></div></div>`; return; }
    let recovering = /type=recovery/.test(location.hash);
    A.onRecovery(() => { recovering = true; newPasswordView(); });
    let user = null;
    try { user = await A.getSession(); } catch (e) {}
    if (recovering) { if (user) newPasswordView(); return; }
    if (user) await afterLogin(); else loginView();
  })();
})();
