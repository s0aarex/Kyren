(async function main(){
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
    mode: "loading",
    user: null,
    kyrenGamesCount: 0,
    tasks: [],
    notes: [],
    decisions: [],
    activeTab: "tasks",
    filters: { q:"", status:"all", tag:"" }
  };

  // ===== CONFIG =====
  const SUPABASE_URL = "COLOCA_AQUI";
  const SUPABASE_ANON_KEY = "COLOCA_AQUI";

  const sb = (SUPABASE_URL.includes("COLOCA"))
    ? null
    : window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  window.sb = sb;

  function norm(s){ return (s ?? "").toString().trim().toLowerCase(); }
  function fmtDate(iso){
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString("pt-BR", { dateStyle:"medium", timeStyle:"short" });
  }
  async function fetchJson(path){
    const res = await fetch(path, { cache:"no-store" });
    if (!res.ok) throw new Error(`Falha ${path} (${res.status})`);
    return await res.json();
  }

  function setMode(mode){
    state.mode = mode;
    el.modeBanner.textContent = mode === "supabase"
      ? "🟢 Online (Supabase)"
      : "🟡 Backup (JSON)";
  }

  async function loadMeta(){
    const meta = await fetchJson("./internal.json");
    const ql = meta.quickLinks || [];
    const repo = ql.find(x => norm(x.label) === "repo")?.url;
    const site = ql.find(x => norm(x.label) === "site")?.url;
    el.btnOpenRepo.href = repo || "https://github.com/";
    el.btnOpenSite.href = site || "../";
    el.lastUpdate.textContent = `Última atualização (meta): ${fmtDate(meta.lastUpdate)}`;
  }

  async function loadKyrenCount(){
    try{
      const kyren = await fetchJson("../kyren.json");
      if (Array.isArray(kyren)) state.kyrenGamesCount = kyren.length;
      else if (Array.isArray(kyren.games)) state.kyrenGamesCount = kyren.games.length;
      else if (Array.isArray(kyren.items)) state.kyrenGamesCount = kyren.items.length;
      else state.kyrenGamesCount = 0;
    }catch{
      state.kyrenGamesCount = 0;
    }
  }

  async function refreshAuthUI(){
    if (!sb){
      el.btnLogin.style.display = "none";
      el.btnLogout.style.display = "none";
      return;
    }
    const { data } = await sb.auth.getUser();
    state.user = data?.user || null;
    el.btnLogin.style.display = state.user ? "none" : "inline-flex";
    el.btnLogout.style.display = state.user ? "inline-flex" : "none";
  }

  async function login(){
    if (!sb) return;
    const redirectTo = `${location.origin}${location.pathname}`;
    await sb.auth.signInWithOAuth({ provider:"github", options:{ redirectTo } });
  }

  async function logout(){
    if (!sb) return;
    await sb.auth.signOut();
    await refreshAuthUI();
    await loadAll();
  }

  async function loadBackup(){
    const tasks = await fetchJson("./tasks.json");
    const notes = await fetchJson("./notes.json");
    const decisions = await fetchJson("./decisions.json");
    state.tasks = Array.isArray(tasks) ? tasks : [];
    state.notes = Array.isArray(notes) ? notes : [];
    state.decisions = Array.isArray(decisions) ? decisions : [];
    setMode("backup");
  }

  async function loadSupabase(){
    const { data } = await sb.auth.getUser();
    state.user = data?.user || null;
    if (!state.user) throw new Error("Sem login");

    const [tasks, notes, decisions] = await Promise.all([
      sb.from("tasks").select("*").order("created_at",{ascending:false}),
      sb.from("notes").select("*").order("created_at",{ascending:false}),
      sb.from("decisions").select("*").order("created_at",{ascending:false}),
    ]);

    if (tasks.error || notes.error || decisions.error){
      console.error("Supabase errors:", { tasks: tasks.error, notes: notes.error, decisions: decisions.error });
      throw new Error("Erro Supabase");
    }

    state.tasks = (tasks.data || []).map(t => ({
      id: t.id, title: t.title, description: t.description,
      tags: t.tags || [], status: t.status, priority: t.priority,
      createdAt: t.created_at, dueAt: t.due_at
    }));

    state.notes = (notes.data || []).map(n => ({
      id: n.id, title: n.title, text: n.text,
      tags: n.tags || [], status: n.status, createdAt: n.created_at
    }));

    state.decisions = (decisions.data || []).map(d => ({
      id: d.id, title: d.title, decision: d.decision, why: d.why,
      date: d.date, createdAt: d.created_at
    }));

    setMode("supabase");
  }

  function hasTag(item, tag){
    if (!tag) return true;
    const t = norm(tag);
    return (item.tags || []).map(norm).some(x => x.includes(t));
  }
  function matchesSearch(item, q){
    if (!q) return true;
    const s = norm(q);
    const hay = [
      item.title, item.text, item.description, item.decision, item.why,
      ...(item.tags || [])
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

  function calcKPIs(){
    const pendingTasks = state.tasks.filter(t => norm(t.status)==="pending").length;
    const pendingNotes = state.notes.filter(n => norm(n.status)==="pending").length;
    const brokenTasks = state.tasks.filter(t => norm(t.status)==="broken").length;
    const brokenNotes = state.notes.filter(n => norm(n.status)==="broken").length;

    el.kpiGames.textContent = String(state.kyrenGamesCount || 0);
    el.kpiBroken.textContent = String(brokenTasks + brokenNotes);
    el.kpiPending.textContent = String(pendingTasks + pendingNotes);
  }

  function badge(text){
    const b = document.createElement("span");
    b.className = "badge";
    b.textContent = text;
    return b;
  }

  function renderItem(container, item, kind){
    const card = document.createElement("div");
    card.className = "item";

    const top = document.createElement("div");
    top.className = "item-top";

    const title = document.createElement("div");
    title.className = "item-title";
    title.textContent = item.title || "(sem título)";

    const meta = document.createElement("div");
    meta.className = "item-meta";
    if (item.status) meta.appendChild(badge(item.status));
    if (item.priority) meta.appendChild(badge(`prio: ${item.priority}`));
    if (item.tags?.length) meta.appendChild(badge(`#${item.tags.join(" #")}`));
    const dateRaw = item.createdAt || item.date;
    if (dateRaw) meta.appendChild(badge(fmtDate(dateRaw)));

    top.appendChild(title);
    top.appendChild(meta);
    card.appendChild(top);

    const text = document.createElement("div");
    text.className = "item-text";
    if (kind==="decisions") text.textContent = `Decisão: ${item.decision || "—"}\n\nPor quê: ${item.why || "—"}`;
    else if (kind==="tasks") text.textContent = item.description || "—";
    else text.textContent = item.text || "—";
    card.appendChild(text);

    container.appendChild(card);
  }

  function setTab(tab){
    state.activeTab = tab;
    document.querySelectorAll(".tab").forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
    document.querySelectorAll(".view").forEach(v => v.classList.remove("active"));
    document.getElementById(`view-${tab}`).classList.add("active");
    render();
  }

  function render(){
    calcKPIs();

    const tasks = applyFilters(state.tasks);
    const notes = applyFilters(state.notes);
    const decisions = applyFilters(state.decisions);

    el.tasksList.innerHTML = "";
    el.notesList.innerHTML = "";
    el.decisionsList.innerHTML = "";

    tasks.forEach(i=>renderItem(el.tasksList, i, "tasks"));
    notes.forEach(i=>renderItem(el.notesList, i, "notes"));
    decisions.forEach(i=>renderItem(el.decisionsList, i, "decisions"));

    const tab = state.activeTab;
    el.counts.textContent =
      tab==="tasks" ? `Mostrando ${tasks.length} tarefa(s) • total: ${state.tasks.length}` :
      tab==="notes" ? `Mostrando ${notes.length} nota(s) • total: ${state.notes.length}` :
      `Mostrando ${decisions.length} decisão(ões) • total: ${state.decisions.length}`;
  }

  async function loadAll(){
    await loadMeta();
    await loadKyrenCount();

    try{
      await refreshAuthUI();
      if (!sb) throw new Error("Supabase não configurado");
      await loadSupabase();
    }catch(e){
      console.warn("Caindo pro backup:", e);
      await loadBackup();
      await refreshAuthUI();
    }

    render();
  }

  // binds
  document.querySelectorAll(".tab").forEach(b => b.addEventListener("click", () => setTab(b.dataset.tab)));
  el.search.addEventListener("input", e => { state.filters.q = e.target.value || ""; render(); });
  el.statusFilter.addEventListener("change", e => { state.filters.status = e.target.value || "all"; render(); });
  el.tagFilter.addEventListener("input", e => { state.filters.tag = e.target.value || ""; render(); });

  el.btnReload.addEventListener("click", loadAll);
  el.btnLogin.addEventListener("click", login);
  el.btnLogout.addEventListener("click", logout);

  await loadAll();
})();
