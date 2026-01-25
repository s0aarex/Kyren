(async function main() {
  const el = {
    btnLogin: document.getElementById("btnLogin"),
    btnLogout: document.getElementById("btnLogout"),
    modeBanner: document.getElementById("modeBanner"),
    lastUpdate: document.getElementById("lastUpdate"),

    kpiGames: document.getElementById("kpiGames"),
    kpiBroken: document.getElementById("kpiBroken"),
    kpiPending: document.getElementById("kpiPending"),

    tasksList: document.getElementById("tasksList"),
    notesList: document.getElementById("notesList"),
    decisionsList: document.getElementById("decisionsList"),

    search: document.getElementById("search"),
    statusFilter: document.getElementById("statusFilter"),
    tagFilter: document.getElementById("tagFilter"),

    counts: document.getElementById("counts"),
    btnReload: document.getElementById("btnReload"),
    btnOpenSite: document.getElementById("btnOpenSite"),
    btnOpenRepo: document.getElementById("btnOpenRepo"),
  };

  const state = {
    internal: null,
    kyrenGamesCount: 0,
    notes: [],
    tasks: [],
    decisions: [],
    activeTab: "tasks",
    filters: { q: "", status: "all", tag: "" },
    mode: "loading", // "supabase" | "backup"
    user: null
  };

  // ======= CONFIG: coloca teus dados do Supabase aqui =======
  // ⚠️ NÃO usa service_role key. Só anon.
  const SUPABASE_URL = "https://wlrzpixcgjcjeyjtjgpz.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndscnpwaXhjZ2pjamV5anRqZ3B6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMTk3NTMsImV4cCI6MjA4NDg5NTc1M30.Knw0pVlnPkVE2HDZI9WwODkrS9ab_f7wdL_J9mLl3uw";

  const supabase = (SUPABASE_URL.includes("COLOCA"))
    ? null
    : window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  function norm(str){ return (str ?? "").toString().trim().toLowerCase(); }
  function fmtDate(iso){
    if (!iso) return "—";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString("pt-BR", { dateStyle:"medium", timeStyle:"short" });
  }
  async function fetchJson(path){
    const res = await fetch(path, { cache:"no-store" });
    if (!res.ok) throw new Error(`Falha ao carregar ${path} (${res.status})`);
    return await res.json();
  }
  function hasTag(item, tag){
    if (!tag) return true;
    const t = norm(tag);
    const tags = Array.isArray(item.tags) ? item.tags.map(norm) : [];
    return tags.some(x => x.includes(t));
  }
  function matchesSearch(item, q){
    if (!q) return true;
    const s = norm(q);
    const hay = [
      item.title, item.text, item.description, item.decision, item.why,
      ...(Array.isArray(item.tags) ? item.tags : [])
    ].map(norm).join(" | ");
    return hay.includes(s);
  }
  function applyFilters(list){
    const { q, status, tag } = state.filters;
    return list.filter(item => {
      const okStatus = (status === "all") ? true : norm(item.status) === norm(status);
      return okStatus && hasTag(item, tag) && matchesSearch(item, q);
    });
  }

  function setMode(mode, msg){
    state.mode = mode;
    el.modeBanner.textContent = msg || (mode === "supabase"
      ? "🟢 Modo online (Supabase)"
      : "🟡 Modo backup (JSON local)");
  }

  async function loadKyrenCount(){
    try {
      const kyren = await fetchJson("../kyren.json");
      if (Array.isArray(kyren)) state.kyrenGamesCount = kyren.length;
      else if (Array.isArray(kyren.games)) state.kyrenGamesCount = kyren.games.length;
      else if (Array.isArray(kyren.items)) state.kyrenGamesCount = kyren.items.length;
      else state.kyrenGamesCount = 0;
    } catch { state.kyrenGamesCount = 0; }
  }

  // ======= AUTH =======
  async function refreshAuthUI(){
    if (!supabase) {
      el.btnLogin.style.display = "none";
      el.btnLogout.style.display = "none";
      return;
    }
    const { data } = await supabase.auth.getUser();
    state.user = data?.user || null;

    el.btnLogin.style.display = state.user ? "none" : "inline-flex";
    el.btnLogout.style.display = state.user ? "inline-flex" : "none";
  }

  async function loginGithub(){
    if (!supabase) return;
    // redireciona de volta pro painel
    const redirectTo = `${location.origin}${location.pathname}`;
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo }
    });
  } // API do Supabase JS :contentReference[oaicite:4]{index=4}

  async function logout(){
    if (!supabase) return;
    await supabase.auth.signOut();
    await refreshAuthUI();
    await loadAll();
  }

  // ======= DATA LOAD =======
  async function loadFromBackup(){
    // JSONs locais
    const notesRaw = await fetchJson("./notes.json");
    state.notes = Array.isArray(notesRaw) ? notesRaw : (notesRaw.pt || []);

    const tasksRaw = await fetchJson("./tasks.json");
    state.tasks = Array.isArray(tasksRaw) ? tasksRaw : [];

    const decisionsRaw = await fetchJson("./decisions.json");
    state.decisions = Array.isArray(decisionsRaw) ? decisionsRaw : [];

    setMode("backup", "🟡 Modo backup (sem login / API indisponível)");
  }

  async function loadFromSupabase(){
    const { data: userData } = await supabase.auth.getUser();
    state.user = userData?.user || null;
    if (!state.user) throw new Error("Sem login");

    const [notes, tasks, decisions] = await Promise.all([
      supabase.from("notes").select("*").order("created_at", { ascending:false }),
      supabase.from("tasks").select("*").order("created_at", { ascending:false }),
      supabase.from("decisions").select("*").order("created_at", { ascending:false }),
    ]);

    if (notes.error || tasks.error || decisions.error) {
      throw new Error(`Erro Supabase: ${notes.error?.message || tasks.error?.message || decisions.error?.message}`);
    }

    // normaliza campos pro render antigo
    state.notes = (notes.data || []).map(n => ({
      id: n.id,
      title: n.title,
      text: n.text,
      tags: n.tags || [],
      status: n.status,
      createdAt: n.created_at
    }));

    state.tasks = (tasks.data || []).map(t => ({
      id: t.id,
      title: t.title,
      description: t.description,
      tags: t.tags || [],
      status: t.status,
      priority: t.priority,
      createdAt: t.created_at,
      dueAt: t.due_at
    }));

    state.decisions = (decisions.data || []).map(d => ({
      id: d.id,
      title: d.title,
      decision: d.decision,
      why: d.why,
      date: d.date,
      createdAt: d.created_at
    }));

    setMode("supabase", "🟢 Modo online (Supabase) — editável");
  }

  async function loadAll(){
    // internal.json (links)
    state.internal = await fetchJson("./internal.json");
    const ql = state.internal?.quickLinks || [];
    const repo = ql.find(x => norm(x.label) === "repo")?.url;
    const site = ql.find(x => norm(x.label) === "site")?.url;
    el.btnOpenRepo.href = repo || "https://github.com/";
    el.btnOpenSite.href = site || "../";
    el.lastUpdate.textContent = `Última atualização (meta): ${fmtDate(state.internal?.lastUpdate)}`;

    await loadKyrenCount();

    // tenta supabase, se falhar cai pro backup
    try {
      if (!supabase) throw new Error("Supabase não configurado");
      await refreshAuthUI();
      await loadFromSupabase();
    } catch {
      await loadFromBackup();
      await refreshAuthUI();
    }

    render();
  }

  // ======= KPIs + RENDER =======
  function calcKPIs(){
    const pendingTasks = state.tasks.filter(t => norm(t.status) === "pending").length;
    const pendingNotes = state.notes.filter(n => norm(n.status) === "pending").length;
    const brokenTasks = state.tasks.filter(t => norm(t.status) === "broken").length;
    const brokenNotes = state.notes.filter(n => norm(n.status) === "broken").length;

    el.kpiGames.textContent = String(state.kyrenGamesCount || 0);
    el.kpiBroken.textContent = String(brokenTasks + brokenNotes);
    el.kpiPending.textContent = String(pendingTasks + pendingNotes);
  }

  function badge(text, extra=""){
    const s = document.createElement("span");
    s.className = `badge ${extra}`.trim();
    s.textContent = text;
    return s;
  }

  async function updateRow(table, id, patch){
    if (state.mode !== "supabase") return;
    await supabase.from(table).update(patch).eq("id", id);
    await loadAll();
  }

  async function deleteRow(table, id){
    if (state.mode !== "supabase") return;
    await supabase.from(table).delete().eq("id", id);
    await loadAll();
  }

  async function createRow(table, payload){
    if (state.mode !== "supabase") return;
    await supabase.from(table).insert(payload);
    await loadAll();
  }

  function renderItem(container, item, kind){
    const card = document.createElement("div");
    card.className = "item";

    const top = document.createElement("div");
    top.className = "item-top";

    const left = document.createElement("div");
    const title = document.createElement("div");
    title.className = "item-title";
    title.textContent = item.title || "(sem título)";
    left.appendChild(title);

    const meta = document.createElement("div");
    meta.className = "item-meta";
    if (item.status) meta.appendChild(badge(item.status));
    if (item.priority) meta.appendChild(badge(`prio: ${item.priority}`, "muted"));
    if (item.tags?.length) meta.appendChild(badge(`#${item.tags.join(" #")}`, "muted"));
    const dateRaw = item.createdAt || item.date || null;
    if (dateRaw) meta.appendChild(badge(fmtDate(dateRaw), "muted"));

    top.appendChild(left);
    top.appendChild(meta);
    card.appendChild(top);

    const text = document.createElement("div");
    text.className = "item-text";
    if (kind === "decisions") {
      text.textContent = `Decisão: ${item.decision || "—"}\n\nPor quê: ${item.why || "—"}`;
    } else if (kind === "tasks") {
      text.textContent = (item.description || "").trim() || "—";
    } else {
      text.textContent = (item.text || "").trim() || "—";
    }
    card.appendChild(text);

    // botões só no modo supabase
    if (state.mode === "supabase") {
      const actions = document.createElement("div");
      actions.className = "item-meta";
      actions.style.marginTop = "10px";

      const btnToggle = document.createElement("button");
      btnToggle.className = "btn ghost";
      btnToggle.type = "button";
      btnToggle.textContent = "Toggle status";
      btnToggle.onclick = async () => {
        const next = (norm(item.status) === "done") ? "pending" : "done";
        const table = kind;
        const fieldPatch = { status: next };
        await updateRow(table, item.id, fieldPatch);
      };

      const btnDel = document.createElement("button");
      btnDel.className = "btn ghost";
      btnDel.type = "button";
      btnDel.textContent = "Deletar";
      btnDel.onclick = async () => {
        if (!confirm("Certeza que quer deletar?")) return;
        await deleteRow(kind, item.id);
      };

      actions.appendChild(btnToggle);
      actions.appendChild(btnDel);
      card.appendChild(actions);
    }

    container.appendChild(card);
  }

  function render(){
    calcKPIs();

    const filteredTasks = applyFilters(state.tasks).sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0));
    const filteredNotes = applyFilters(state.notes).sort((a,b)=>new Date(b.createdAt||0)-new Date(a.createdAt||0));
    const filteredDecisions = applyFilters(state.decisions).sort((a,b)=>new Date((b.date||b.createdAt||0))-new Date((a.date||a.createdAt||0)));

    el.tasksList.innerHTML = "";
    el.notesList.innerHTML = "";
    el.decisionsList.innerHTML = "";

    filteredTasks.forEach(i=>renderItem(el.tasksList, i, "tasks"));
    filteredNotes.forEach(i=>renderItem(el.notesList, i, "notes"));
    filteredDecisions.forEach(i=>renderItem(el.decisionsList, i, "decisions"));

    const tab = state.activeTab;
    el.counts.textContent =
      tab === "tasks" ? `Mostrando ${filteredTasks.length} tarefa(s) • total: ${state.tasks.length}` :
      tab === "notes" ? `Mostrando ${filteredNotes.length} nota(s) • total: ${state.notes.length}` :
      `Mostrando ${filteredDecisions.length} decisão(ões) • total: ${state.decisions.length}`;
  }

  // ======= UI binds =======
  function setTab(tab){
    state.activeTab = tab;
    document.querySelectorAll(".tab").forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
    document.querySelectorAll(".tabview").forEach(v => v.classList.remove("active"));
    document.getElementById(`view-${tab}`).classList.add("active");
    render();
  }

  document.querySelectorAll(".tab").forEach(b => b.addEventListener("click", () => setTab(b.dataset.tab)));

  el.search.addEventListener("input", e => { state.filters.q = e.target.value || ""; render(); });
  el.statusFilter.addEventListener("change", e => { state.filters.status = e.target.value || "all"; render(); });
  el.tagFilter.addEventListener("input", e => { state.filters.tag = e.target.value || ""; render(); });

  el.btnReload.addEventListener("click", async () => { el.lastUpdate.textContent = "Recarregando…"; await loadAll(); });

  el.btnLogin?.addEventListener("click", loginGithub);
  el.btnLogout?.addEventListener("click", logout);

  // init
  await loadAll();
})();
