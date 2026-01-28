(async function main() {
  const state = {
    internal: null,
    kyrenGamesCount: 0,
    notes: [],
    tasks: [],
    decisions: [],
    activeTab: "tasks",
    filters: { q: "", status: "all", tag: "" }
  };

  const el = {
    lastUpdate: byId("lastUpdate"),
    kpiGames: byId("kpiGames"),
    kpiBroken: byId("kpiBroken"),
    kpiPending: byId("kpiPending"),
    tasksList: byId("tasksList"),
    notesList: byId("notesList"),
    decisionsList: byId("decisionsList"),
    counts: byId("counts"),
    search: byId("search"),
    statusFilter: byId("statusFilter"),
    tagFilter: byId("tagFilter"),
    btnReload: byId("btnReload"),
    btnOpenSite: byId("btnOpenSite"),
    btnOpenRepo: byId("btnOpenRepo")
  };

  function setTab(tab) {
    state.activeTab = tab;

    document.querySelectorAll(".tab").forEach(b => {
      b.classList.toggle("active", b.dataset.tab === tab);
    });
    document.querySelectorAll(".tabview").forEach(v => v.classList.remove("active"));
    byId(`view-${tab}`).classList.add("active");

    render();
  }

  function applyFilters(list) {
    const { q, status, tag } = state.filters;
    return list.filter(item => {
      const okStatus = (status === "all") ? true : norm(item.status) === norm(status);
      return okStatus && hasTag(item, tag) && matchesSearch(item, q);
    });
  }

  function calcKPIs() {
    const pendingTasks = state.tasks.filter(t => norm(t.status) === "pending").length;
    const pendingNotes = state.notes.filter(n => norm(n.status) === "pending").length;
    const brokenTasks = state.tasks.filter(t => norm(t.status) === "broken").length;
    const brokenNotes = state.notes.filter(n => norm(n.status) === "broken").length;

    const broken = brokenTasks + brokenNotes;
    const pending = pendingTasks + pendingNotes;

    el.kpiGames.textContent = String(state.kyrenGamesCount || 0);
    el.kpiBroken.textContent = String(broken);
    el.kpiPending.textContent = String(pending);
  }

  function badge(text, extraClass = "") {
    const span = document.createElement("span");
    span.className = `badge ${extraClass}`.trim();
    span.textContent = text;
    return span;
  }

  function renderItem(container, item, kind) {
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
      const d = item.decision ? `Decisão: ${item.decision}` : "";
      const w = item.why ? `\n\nPor quê: ${item.why}` : "";
      text.textContent = `${d}${w}`.trim() || "—";
    } else {
      text.textContent = (item.text || item.description || "").trim() || "—";
    }

    card.appendChild(text);
    container.appendChild(card);
  }

  function render() {
    calcKPIs();

    const tab = state.activeTab;

    const filteredTasks = applyFilters(state.tasks)
      .sort((a,b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    const filteredNotes = applyFilters(state.notes)
      .sort((a,b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    const filteredDecisions = applyFilters(state.decisions)
      .sort((a,b) => new Date((b.date || b.createdAt || 0)) - new Date((a.date || a.createdAt || 0)));

    el.tasksList.innerHTML = "";
    el.notesList.innerHTML = "";
    el.decisionsList.innerHTML = "";

    filteredTasks.forEach(i => renderItem(el.tasksList, i, "tasks"));
    filteredNotes.forEach(i => renderItem(el.notesList, i, "notes"));
    filteredDecisions.forEach(i => renderItem(el.decisionsList, i, "decisions"));

    const countsText = (() => {
      if (tab === "tasks") return `Mostrando ${filteredTasks.length} tarefa(s) • total: ${state.tasks.length}`;
      if (tab === "notes") return `Mostrando ${filteredNotes.length} nota(s) • total: ${state.notes.length}`;
      return `Mostrando ${filteredDecisions.length} decisão(ões) • total: ${state.decisions.length}`;
    })();
    el.counts.textContent = countsText;
  }

  async function loadAll() {
    // JSON interno
    state.internal = await fetchJson("./internal.json");

    // Links rápidos (opcional)
    const ql = state.internal?.quickLinks || [];
    const repo = ql.find(x => norm(x.label) === "repo")?.url;
    const site = ql.find(x => norm(x.label) === "site")?.url;

    el.btnOpenRepo.href = repo || "https://github.com/";
    el.btnOpenSite.href = site || "../";

    // Data
    el.lastUpdate.textContent = `Última atualização (meta): ${fmtDate(state.internal?.lastUpdate)}`;

    // Notas
    const notesRaw = await fetchJson("./notes.json");
    state.notes = Array.isArray(notesRaw) ? notesRaw : (notesRaw.pt || []);

    // Tasks
    const tasksRaw = await fetchJson("./tasks.json");
    state.tasks = Array.isArray(tasksRaw) ? tasksRaw : [];

    // Decisions
    const decisionsRaw = await fetchJson("./decisions.json");
    state.decisions = Array.isArray(decisionsRaw) ? decisionsRaw : [];

    // Contar jogos do kyren.json (sem quebrar)
    try {
      const kyren = await fetchJson("../kyren.json");
      // tenta pegar lista de jogos (casos comuns)
      if (Array.isArray(kyren)) state.kyrenGamesCount = kyren.length;
      else if (Array.isArray(kyren.games)) state.kyrenGamesCount = kyren.games.length;
      else if (Array.isArray(kyren.items)) state.kyrenGamesCount = kyren.items.length;
      else state.kyrenGamesCount = 0;
    } catch {
      state.kyrenGamesCount = 0;
    }

    render();
  }

  function bindUI() {
    // Tabs
    document.querySelectorAll(".tab").forEach(b => {
      b.addEventListener("click", () => setTab(b.dataset.tab));
    });

    // Filtros
    el.search.addEventListener("input", (e) => {
      state.filters.q = e.target.value || "";
      render();
    });

    el.statusFilter.addEventListener("change", (e) => {
      state.filters.status = e.target.value || "all";
      render();
    });

    el.tagFilter.addEventListener("input", (e) => {
      state.filters.tag = e.target.value || "";
      render();
    });

    el.btnReload.addEventListener("click", async () => {
      el.lastUpdate.textContent = "Recarregando…";
      await loadAll();
    });
  }

  bindUI();
  await loadAll();
})();
