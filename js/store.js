/* Data layer shared by the public site (index.html) and the staff page (admin.html).
   - LIVE mode: config.js has Supabase details -> reads/writes the real database.
   - DEMO mode: no Supabase details -> uses sample content kept in this browser (localStorage). */
(function () {
  const CFG = window.KONDEY_CONFIG || {};
  const KEY = CFG.supabaseKey || CFG.supabaseAnonKey || "";
  const LIVE = !!(CFG.supabaseUrl && KEY);
  const DEMO_KEY = "kondey-demo-v1";
  const clone = (x) => JSON.parse(JSON.stringify(x));

  /* ---------- demo storage ---------- */
  function demoLoad() {
    try {
      const s = localStorage.getItem(DEMO_KEY);
      if (s) return JSON.parse(s);
    } catch (e) { /* storage blocked: fall through to fresh sample */ }
    return { content: clone(window.KONDEY_SAMPLE || []), feedback: [], seq: 0 };
  }
  function demoSave(db) {
    try { localStorage.setItem(DEMO_KEY, JSON.stringify(db)); return true; }
    catch (e) { return false; }
  }
  function demoReset() { try { localStorage.removeItem(DEMO_KEY); } catch (e) {} }

  /* ---------- Supabase REST (no library needed for the public site) ---------- */
  async function rest(path, opts) {
    const base = CFG.supabaseUrl.replace(/\/+$/, "");
    const res = await fetch(base + "/rest/v1/" + path, Object.assign({
      headers: Object.assign(
        { apikey: KEY, "Content-Type": "application/json" },
        /^eyJ/.test(KEY) ? { Authorization: "Bearer " + KEY } : {}   // old-style anon keys only
      )
    }, opts || {}));
    if (!res.ok) throw new Error("Server error " + res.status);
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  }

  window.KondeyStore = {
    live: LIVE,
    config: CFG,
    key: KEY,
    demoLoad, demoSave, demoReset,

    /* all published content rows: [{id,type,data,published_on,updated_at}] */
    async published() {
      if (LIVE) return rest("content?select=id,type,data,published_on,updated_at&status=eq.published");
      return demoLoad().content.filter((r) => r.status === "published");
    },

    /* complaint / suggestion form -> returns the reference number */
    async submitFeedback(f) {
      if (LIVE) {
        return rest("rpc/submit_feedback", {
          method: "POST",
          body: JSON.stringify({ p_kind: f.kind, p_name: f.name, p_phone: f.phone, p_email: f.email || "", p_message: f.message })
        });
      }
      const db = demoLoad();
      db.seq = (db.seq || 0) + 1;
      const ref = "KC-" + new Date().getFullYear() + "-" + String(db.seq).padStart(5, "0");
      db.feedback.unshift(Object.assign({ id: db.seq, ref_no: ref, handled: false, staff_note: "", created_at: new Date().toISOString() }, f));
      demoSave(db);
      return ref;
    }
  };
})();
