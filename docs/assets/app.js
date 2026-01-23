// ===== i18n =====
const I18N = {
  pt: {
    nav_github: "GitHub",
    nav_feedback: "Feedback",

    hero_title: "Kyren ",
    hero_title_em: "official",
    hero_desc:
      "Site oficial da source Kyren — guia rápido, patch notes e uma área pra pedidos/sugestões/bugs (tudo rastreável no GitHub).",

    cta_how: "Como usar",
    cta_patch: "Patch notes",
    cta_feedback: "Feedback",

    sec_whats: "O que tem aqui",

    card_quick_title: "Quick setup",
    card_quick_desc: "Passo a passo curto e direto pra importar a source no Hydra.",
    card_quick_link: "Abrir guia →",

    card_updates_title: "Updates",
    card_updates_desc: "Mudanças organizadas: o que entrou, o que mudou e o que foi corrigido.",
    card_updates_link: "Ver patch notes →",

    card_tickets_title: "Tickets",
    card_tickets_desc: "Pedidos, sugestões e bugs viram tickets — dá pra acompanhar e comentar.",
    card_tickets_link: "Abrir feedback →",

    sec_latest: "Último patch",
    link_view_patch: "Ver patch notes",

    shortcuts: "Atalhos",
    shortcut_forms: "Abrir formulários",
    shortcut_repo: "Ver repo",

    latest_desc_default: "Atualização mais recente.",
    err_patch: "Erro carregando patch notes 😵",

    // pages
    patch_heading_html: "Patch <em>notes</em>",
    patch_subtitle: "Histórico de mudanças organizadas por versão.",
    back_home: "← Home",

    how_heading_html: "Como <em>usar</em>",
    how_subtitle: "Guia rápido.",
    how_steps_html:
      "1) Abra o launcher<br/>2) Vá em <b>Sources</b><br/>3) Clique em <b>Add source</b><br/>4) Siga as instruções do próprio app",

    feedback_heading_html: "<em>Feedback</em>",
    feedback_subtitle:
      "Tudo via GitHub Issues pra ficar rastreável. Escolhe um tipo e abre o ticket 👇",
    fb_bug: "Bug",
    fb_bug_desc: "Algo quebrou? Link caiu? Explica e manda prints.",
    fb_request: "Pedido",
    fb_request_desc: "Pede algo específico com detalhes.",
    fb_suggest: "Sugestão",
    fb_suggest_desc: "Ideias pro site/source, melhorias e etc.",
    fb_all: "🧾 Ver todos os tickets"
  },

  en: {
    nav_github: "GitHub",
    nav_feedback: "Feedback",

    hero_title: "Kyren ",
    hero_title_em: "official",
    hero_desc:
      "Official Kyren source hub — quick guide, patch notes and a place for requests/suggestions/bugs (everything tracked on GitHub).",

    cta_how: "How to use",
    cta_patch: "Patch notes",
    cta_feedback: "Feedback",

    sec_whats: "What’s here",

    card_quick_title: "Quick setup",
    card_quick_desc: "Short step-by-step to add the source.",
    card_quick_link: "Open guide →",

    card_updates_title: "Updates",
    card_updates_desc: "Organized changes: what’s new, what changed, what got fixed.",
    card_updates_link: "View patch notes →",

    card_tickets_title: "Tickets",
    card_tickets_desc: "Requests, suggestions and bugs become tickets — you can follow and comment.",
    card_tickets_link: "Open feedback →",

    sec_latest: "Latest patch",
    link_view_patch: "View patch notes",

    shortcuts: "Shortcuts",
    shortcut_forms: "Open forms",
    shortcut_repo: "View repo",

    latest_desc_default: "Most recent update.",
    err_patch: "Error loading patch notes 😵",

    // pages
    patch_heading_html: "Patch <em>notes</em>",
    patch_subtitle: "Change log organized by version.",
    back_home: "← Home",

    how_heading_html: "How to <em>use</em>",
    how_subtitle: "Quick guide.",
    how_steps_html:
      "1) Open the launcher<br/>2) Go to <b>Sources</b><br/>3) Click <b>Add source</b><br/>4) Follow the app instructions",

    feedback_heading_html: "<em>Feedback</em>",
    feedback_subtitle:
      "Everything via GitHub Issues so it’s trackable. Pick a type and open a ticket 👇",
    fb_bug: "Bug",
    fb_bug_desc: "Something broke? Link down? Explain it and add screenshots.",
    fb_request: "Request",
    fb_request_desc: "Request something specific with details.",
    fb_suggest: "Suggestion",
    fb_suggest_desc: "Ideas for the site/source, improvements, etc.",
    fb_all: "🧾 View all tickets"
  }
};

let lang = localStorage.getItem("lang") || "pt";

function setLang(next) {
  lang = next;
  localStorage.setItem("lang", next);
  applyI18n();
  loadLatestPatch(
    function tagEmoji(tag){
  const map = {
    jogos: "🎮",
    games: "🎮",
    fix: "🛠️",
    fixes: "🛠️",
    reparo: "🛠️",
    json: "📦",
    quality: "✨",
    hotfix: "🚑"
  };
  return map[tag] || "🔹";
}
  );   // home
  loadPatchPageList(
    function tagEmoji(tag){
  const map = {
    jogos: "🎮",
    games: "🎮",
    fix: "🛠️",
    fixes: "🛠️",
    reparo: "🛠️",
    json: "📦",
    quality: "✨",
    hotfix: "🚑"
  };
  return map[tag] || "🔹";
}
  ); // patch-notes.html
}

function applyI18n() {
  document.documentElement.lang = (lang === "pt") ? "pt-br" : "en";
  const dict = I18N[lang];

  // textContent
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (dict[key]) el.textContent = dict[key];
  });

  // innerHTML (quando tem <em>, <br>, <b> etc.)
  document.querySelectorAll("[data-i18n-html]").forEach(el => {
    const key = el.getAttribute("data-i18n-html");
    if (dict[key]) el.innerHTML = dict[key];
  });

  // active language chip
  document.querySelectorAll("[data-lang]").forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute("data-lang") === lang);
  });
}

// ===== patch notes data =====
async function getPatchData() {
  const res = await fetch(`../patch-notes.json?v=${Date.now()}`, { cache: "no-store" })
  return await res.json();
}

// Home: render latest patch into the big card
async function loadLatestPatch() {
  const root = document.getElementById("latestPatch");
  if (!root) return;

  try {
    const data = await getPatchData();
    const list = data[lang] || [];
    const p = list[0];

    if (!p) {
      root.innerHTML = `<div class="patchDesc">${I18N[lang].latest_desc_default}</div>`;
      return;
    }

    const title = p.title ? ` • ${p.title}` : "";
    const bullets = (p.changes || []).slice(0, 4);

    root.innerHTML = `
      <div class="patchHead">
        <div class="patchMeta">
          <div class="line1">
            <span class="badge">${p.version}${title}</span>
          </div>
          <div class="date">${p.date}</div>
        </div>
      </div>

      <div class="patchDesc">${p.summary || I18N[lang].latest_desc_default}</div>

      <ul class="patchList">
  ${(p.changes || []).map(c => `<li>• ${c}</li>`).join("")}
</ul>

      <div class="patchFoot">
  ${(p.tags || []).map(t => `
    <span class="badge">${tagEmoji(t)} ${t}</span>
  `).join("")}
</div>
    `;
  } catch (e) {
    root.innerHTML = `<div class="patchDesc">${I18N[lang].err_patch}</div>`;
  }
}

// Patch page: render list
async function loadPatchPageList() {
  const listEl = document.getElementById("patchList");
  if (!listEl) return;

  try {
    const data = await getPatchData();
    const list = data[lang] || [];
    listEl.innerHTML = list.map(p => `
      <div class="patchCard" style="margin-top:14px;">
        <div class="patchHead">
          <div class="patchMeta">
            <div class="line1">
              <span class="badge">${p.version}${p.title ? ` • ${p.title}` : ""}</span>
            </div>
            <div class="date">${p.date}</div>
          </div>
        </div>

        ${p.summary ? `<div class="patchDesc">${p.summary}</div>` : ""}

        <ul class="patchList">
          ${(p.changes || []).map(c => `<li>${c}</li>`).join("")}
        </ul>
      </div>
    `).join("");
  } catch (e) {
    listEl.innerHTML = `<div class="patchDesc">${I18N[lang].err_patch}</div>`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  applyI18n();
  loadLatestPatch();
  loadPatchPageList();
});

// expose
window.setLang = setLang;

// ===== Scroll reveal =====
function setupReveal() {
  const els = document.querySelectorAll("[data-anim]");
  if (!els.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("reveal");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  els.forEach(el => io.observe(el));
}

document.addEventListener("DOMContentLoaded", setupReveal);
