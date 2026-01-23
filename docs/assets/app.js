// ===== i18n =====
const I18N = {
  pt: {
    nav_github: "GitHub",
    nav_feedback: "Feedback",
    hero_title: "Kyren ",
    hero_title_em: "official",
    hero_desc: "Site oficial da source Kyren — guia rápido, patch notes e uma área pra pedidos/sugestões/bugs (tudo rastreável no GitHub).",
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
  },
  en: {
    nav_github: "GitHub",
    nav_feedback: "Feedback",
    hero_title: "Kyren ",
    hero_title_em: "official",
    hero_desc: "Official Kyren source hub — quick guide, patch notes and a place for requests/suggestions/bugs (everything tracked on GitHub).",
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
  }
};

let lang = localStorage.getItem("lang") || "pt";

function setLang(next){
  lang = next;
  localStorage.setItem("lang", next);
  applyI18n();
  loadLatestPatch();   // home
  loadPatchPageList(); // patch-notes.html
}

function applyI18n(){
  document.documentElement.lang = (lang === "pt") ? "pt-br" : "en";
  const dict = I18N[lang];

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if(dict[key]) el.textContent = dict[key];
  });

  document.querySelectorAll("[data-lang]").forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute("data-lang") === lang);
  });
}

// ===== patch notes data =====
async function getPatchData(){
  const res = await fetch("patch-notes.json", { cache: "no-store" });
  return await res.json();
}

// Home: render latest patch into the big card
async function loadLatestPatch(){
  const root = document.getElementById("latestPatch");
  if(!root) return;

  try{
    const data = await getPatchData();
    const list = data[lang] || [];
    const p = list[0];

    if(!p){
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
        ${bullets.map(c => `<li>${c}</li>`).join("")}
      </ul>

      <div class="patchFoot">
        <span>+${Math.max(0,(p.changes||[]).length - bullets.length)}</span>
        <span>•</span>
        <span>${(p.tags||[]).slice(0,2).join(" • ")}</span>
      </div>
    `;
  }catch(e){
    root.innerHTML = `<div class="patchDesc">Erro carregando patch notes 😵</div>`;
  }
}

// Patch page: render list
async function loadPatchPageList(){
  const listEl = document.getElementById("patchList");
  if(!listEl) return;

  try{
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
  }catch(e){
    listEl.innerHTML = `<div class="patchDesc">Erro carregando patch notes 😵</div>`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  applyI18n();
  loadLatestPatch();
  loadPatchPageList();
});

// expose
window.setLang = setLang;
