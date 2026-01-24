const CONFIG = {
  repoUrl: "https://github.com/s0aarex/Kyren",
  libraryUrl: "https://library.hydra.wiki/sources/86",
  sourceJsonUrl: "https://s0aarex.github.io/Kyren/kyren.json",
  installDeepLink: "hydralauncher://install-source?urls=https://kyren.pages.dev/kyren.json"
};

// ===== i18n =====
const I18N = {
  pt: {
    nav_github:"GitHub",
    nav_feedback:"Feedback",
    hero_title:"Kyren ",
    hero_title_em:"official",
    hero_desc:"Site oficial da source Kyren — guia rápido, patch notes e uma área pra pedidos/sugestões/bugs (tudo rastreável no GitHub).",
    cta_how:"Como usar",
    cta_patch:"Patch notes",
    cta_feedback:"Feedback",
    sec_whats:"O que tem aqui",
    card_quick_title:"Quick setup",
    card_quick_desc:"Passo a passo curto e direto pra importar a source no Hydra.",
    card_quick_link:"Abrir guia →",
    card_updates_title:"Updates",
    card_updates_desc:"Mudanças organizadas: o que entrou, o que mudou e o que foi corrigido.",
    card_updates_link:"Ver patch notes →",
    card_tickets_title:"Tickets",
    card_tickets_desc:"Pedidos, sugestões e bugs viram tickets — dá pra acompanhar e comentar.",
    card_tickets_link:"Abrir feedback →",
    sec_latest:"Último patch",
    link_view_patch:"Ver patch notes",
    shortcuts:"Atalhos",
    shortcut_forms:"Abrir formulários",
    shortcut_repo:"Ver repo",
    latest_desc_default:"Atualização mais recente.",
    err_patch:"Erro carregando patch notes 😵",

    patch_title_html:"Patch <em>notes</em>",
    patch_subtitle:"Histórico de mudanças organizadas por versão.",
    back_home:"← Home",

    how_title_html:"Como <em>usar</em>",
    how_subtitle:"Guia rápido.",
    how_steps_html:"1) Clique no botao abaixo <b>Instalar no Hydra</b><br/>2) Clique em <b>Abrir Hydra</b><br/>3) Clique em <b>Adicionar Fonte</b>",
    how_open_library:"Instalar no Hydra",

    fb_title_html:"<em>Feedback</em>",
    fb_subtitle:"Tudo via GitHub Issues pra ficar rastreável. Escolhe um tipo e abre o ticket 👇",
    fb_bug:"Bug",
    fb_bug_desc:"Algo quebrou? Link caiu? Explica e manda prints.",
    fb_request:"Pedido de jogo",
    fb_request_desc:"Me diz o nome certinho e infos do que você quer.",
    fb_suggest:"Sugestão",
    fb_suggest_desc:"Ideias pro site/source, melhorias e etc.",
    fb_open:"Abrir →",
    fb_all:"🧾 Ver todos os tickets"
  },
  en: {
    nav_github:"GitHub",
    nav_feedback:"Feedback",
    hero_title:"Kyren ",
    hero_title_em:"official",
    hero_desc:"Official Kyren source hub — quick guide, patch notes and a place for requests/suggestions/bugs (everything tracked on GitHub).",
    cta_how:"How to use",
    cta_patch:"Patch notes",
    cta_feedback:"Feedback",
    sec_whats:"What’s here",
    card_quick_title:"Quick setup",
    card_quick_desc:"Short step-by-step to add the source.",
    card_quick_link:"Open guide →",
    card_updates_title:"Updates",
    card_updates_desc:"Organized changes: what’s new, what changed, what got fixed.",
    card_updates_link:"View patch notes →",
    card_tickets_title:"Tickets",
    card_tickets_desc:"Requests, suggestions and bugs become tickets — you can follow and comment.",
    card_tickets_link:"Open feedback →",
    sec_latest:"Latest patch",
    link_view_patch:"View patch notes",
    shortcuts:"Shortcuts",
    shortcut_forms:"Open forms",
    shortcut_repo:"View repo",
    latest_desc_default:"Most recent update.",
    err_patch:"Error loading patch notes 😵",

    patch_title_html:"Patch <em>notes</em>",
    patch_subtitle:"Change log organized by version.",
    back_home:"← Home",

    how_title_html:"How to <em>use</em>",
    how_subtitle:"Quick guide.",
    how_steps_html:"1) Click in the button <b>Install on Hydra</b><br/>2) Click in <b>Open Hydra</b><br/>3) Click in <b>Add Source</b>",
    how_open_library:"Install on Hydra",

    fb_title_html:"<em>Feedback</em>",
    fb_subtitle:"Everything via GitHub Issues so it’s trackable. Pick a type and open a ticket 👇",
    fb_bug:"Bug",
    fb_bug_desc:"Something broke? Link down? Explain it and add screenshots.",
    fb_request:"Game request",
    fb_request_desc:"Tell the exact game name and details.",
    fb_suggest:"Suggestion",
    fb_suggest_desc:"Ideas for the site/source, improvements, etc.",
    fb_open:"Open →",
    fb_all:"🧾 View all tickets"
  }
};

let lang = localStorage.getItem("lang") || "pt";

function setLang(next){
  lang = next;
  localStorage.setItem("lang", next);
  applyI18n();
  loadLatestPatch();
  loadPatchPageList();
}

function applyI18n(){
  document.documentElement.lang = (lang === "pt") ? "pt-br" : "en";
  const dict = I18N[lang];
  const installBtn = document.getElementById("installBtn");
if (installBtn) installBtn.href = CONFIG.installDeepLink;

  document.querySelectorAll("[data-i18n]").forEach(el=>{
    const k = el.getAttribute("data-i18n");
    if(dict[k]) el.textContent = dict[k];
  });

  document.querySelectorAll("[data-i18n-html]").forEach(el=>{
    const k = el.getAttribute("data-i18n-html");
    if(dict[k]) el.innerHTML = dict[k];
  });

  document.querySelectorAll("[data-lang]").forEach(btn=>{
    btn.classList.toggle("active", btn.getAttribute("data-lang") === lang);
  });

  document.querySelectorAll("[data-repo-link]").forEach(a => a.href = CONFIG.repoUrl);
  document.querySelectorAll("[data-library-link]").forEach(a => a.href = CONFIG.libraryUrl);
}

// ✅ caminho garantido no GitHub Pages (repo /Kyren/)
async function getPatchData(){
  const base = window.location.pathname.replace(/\/[^\/]*$/, "/"); // /Kyren/
  const url = `${base}patch-notes.json?v=${Date.now()}`;
  const res = await fetch(url, { cache: "no-store" });
  if(!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

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
      <div class="patchMeta">
        <div class="line1">
          <span class="badge">${p.version}${title}</span>
        </div>
        <div class="date">${p.date}</div>
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
    root.innerHTML = `<div class="patchDesc">${I18N[lang].err_patch}</div>`;
  }
}

async function loadPatchPageList(){
  const listEl = document.getElementById("patchList");
  if(!listEl) return;

  try{
    const data = await getPatchData();
    const list = data[lang] || [];

    listEl.innerHTML = list.map(p => `
      <div class="patchCard" style="margin-top:14px;">
        <div class="patchMeta">
          <div class="line1">
            <span class="badge">${p.version}${p.title ? ` • ${p.title}` : ""}</span>
          </div>
          <div class="date">${p.date}</div>
        </div>

        ${p.summary ? `<div class="patchDesc">${p.summary}</div>` : ""}

        <ul class="patchList">
          ${(p.changes || []).map(c => `<li>${c}</li>`).join("")}
        </ul>

        ${(p.tags && p.tags.length) ? `
          <div class="patchFoot">
            <span>${p.tags.slice(0,4).join(" • ")}</span>
          </div>
        ` : ""}
      </div>
    `).join("");
  }catch(e){
    listEl.innerHTML = `<div class="patchDesc">${I18N[lang].err_patch}</div>`;
  }
}

function setupReveal(){
  const els = document.querySelectorAll("[data-anim]");
  if(!els.length) return;

  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add("reveal");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  els.forEach(el => io.observe(el));
}

document.addEventListener("DOMContentLoaded", () => {
  applyI18n();
  loadLatestPatch();
  loadPatchPageList();
  setupReveal();
});

window.setLang = setLang;

const CACHE_VERSION = "20260124-1";

async function loadGameCount() {
  const el = document.querySelector("[data-game-count]");
  if (!el) return;

  try {
    const res = await fetch(`kyren.json?v=${CACHE_VERSION}`);
    const data = await res.json();

    el.textContent = data.downloads.length;
  } catch {
    el.textContent = "—";
  }
}

loadGameCount();
