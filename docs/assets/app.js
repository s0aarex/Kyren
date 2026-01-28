const CONFIG = {
  // customize if you want
  repoUrl: "https://github.com/s0aarex/Kyren",
  sourceJsonUrl: "./kyren.json",
  installDeepLink: "hydralauncher://install-source?urls=https://kyren.pages.dev/kyren.json", // optional
  cacheVersion: "20260128-2"
};

// ===== i18n =====
const I18N = {
  pt: {
    brand_sub: "hub",

    nav_feedback: "💬 Feedback",
    nav_repo: "📦 Repo",

    hero_title: "Kyren ",
    hero_title_em: "official",
    hero_desc: "🧠 Hub oficial: guia rápido, patch notes e feedback (tudo organizado).",

    cta_how: "📘 Como usar",
    cta_patch: "🧾 Patch notes",
    cta_feedback: "💬 Feedback",

    kpi_games: "🎮 Itens",
    kpi_latest: "🆕 Último patch",

    sec_whats: "📌 O que tem aqui",

    card_quick_title: "⚡ Quick setup",
    card_quick_desc: "Passo a passo curto e direto pra começar.",
    card_quick_link: "📘 Abrir guia →",

    card_updates_title: "🧩 Updates",
    card_updates_desc: "Mudanças organizadas: o que entrou e o que mudou.",
    card_updates_link: "🧾 Ver patch notes →",

    card_tickets_title: "🐛 Tickets",
    card_tickets_desc: "Sugestões e bugs rastreáveis no GitHub.",
    card_tickets_link: "💬 Abrir feedback →",

    sec_latest: "🆕 Último patch",
    link_view_patch: "🧾 Ver patch notes",

    latest_desc_default: "📦 Atualização mais recente.",
    err_patch: "💀 Erro carregando patch notes.",

    patch_title_html: "🧾 Patch <em>notes</em>",
    patch_subtitle: "📚 Histórico do site organizado por versão.",
    back_home: "← 🏠 Home",

    how_title_html: "Como <em>usar</em>",
    how_subtitle: "⚡ Guia rápido.",
    how_steps_html: "1) Clique no Link <b>Instalar no Hydra</b><br/>2) CLique em <b>Abir no Hydra</b><br/>3) Dentro do Hydra, clique em <b>Importar</b>",
    how_open_library: "🚀 Instalar no Hydra",
    how_note: "ℹ️ Nota:",

    fb_title_html: "💬 <em>Feedback</em>",
    fb_subtitle: "🧾 Tudo rastreável em issues (sem bagunça).",

    fb_bug: "🐛 Bug",
    fb_bug_desc: "Algo quebrou? Explica e manda prints.",
    fb_request: "🎮 Pedido",
    fb_request_desc: "Pede algo com detalhes e nome certinho.",
    fb_suggest: "✨ Sugestão",
    fb_suggest_desc: "Ideias e melhorias pro projeto.",

    fb_open: "🚀 Abrir →",
    fb_all: "🧾 Ver todos os tickets",
    fb_note: "⚙️ Configura o repo no app.js (CONFIG.repoUrl)."
  },

  en: {
    brand_sub: "hub",

    nav_feedback: "💬 Feedback",
    nav_repo: "📦 Repo",

    hero_title: "Kyren ",
    hero_title_em: "official",
    hero_desc: "🧠 Official hub: quick guide, patch notes and feedback (all organized).",

    cta_how: "📘 How to use",
    cta_patch: "🧾 Patch notes",
    cta_feedback: "💬 Feedback",

    kpi_games: "🎮 Items",
    kpi_latest: "🆕 Latest patch",

    sec_whats: "📌 What’s here",

    card_quick_title: "⚡ Quick setup",
    card_quick_desc: "Short step-by-step to get started.",
    card_quick_link: "📘 Open guide →",

    card_updates_title: "🧩 Updates",
    card_updates_desc: "Organized changes: what’s new and what changed.",
    card_updates_link: "🧾 View patch notes →",

    card_tickets_title: "🐛 Tickets",
    card_tickets_desc: "Suggestions and bugs tracked on GitHub.",
    card_tickets_link: "💬 Open feedback →",

    sec_latest: "🆕 Latest patch",
    link_view_patch: "🧾 View patch notes",

    latest_desc_default: "📦 Most recent update.",
    err_patch: "💀 Error loading patch notes.",

    patch_title_html: "🧾 Patch <em>notes</em>",
    patch_subtitle: "📚 Site changelog organized by version.",
    back_home: "← 🏠 Home",

    how_title_html: "📘 How to <em>use</em>",
    how_subtitle: "⚡ Quick guide.",
    how_steps_html: "1) 🔎 Do X<br/>2) ✅ Do Y<br/>3) 🚀 Do Z",
    how_open_library: "🚀 Open",
    how_note: "ℹ️ Note:",

    fb_title_html: "💬 <em>Feedback</em>",
    fb_subtitle: "🧾 Everything tracked via issues (no chaos).",

    fb_bug: "🐛 Bug",
    fb_bug_desc: "Something broke? Explain it and add screenshots.",
    fb_request: "🎮 Request",
    fb_request_desc: "Request with details and exact name.",
    fb_suggest: "✨ Suggestion",
    fb_suggest_desc: "Ideas and improvements for the project.",

    fb_open: "🚀 Open →",
    fb_all: "🧾 View all tickets",
    fb_note: "⚙️ Configure repo in app.js (CONFIG.repoUrl)."
  }
};

let lang = localStorage.getItem("lang") || "pt";

function setLang(next){
  lang = next;
  localStorage.setItem("lang", next);
  applyI18n();
  loadLatestPatch();
  loadPatchPageList();
  loadLatestPatchShort();
}

function applyI18n(){
  document.documentElement.lang = (lang === "pt") ? "pt-br" : "en";
  const dict = I18N[lang];

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

  // optional install btn
  const installBtn = document.getElementById("installBtn");
  if (installBtn) installBtn.href = CONFIG.installDeepLink;

  // feedback links
  const issuesAll = document.querySelector("[data-issues-all]");
  if(issuesAll) issuesAll.href = `${CONFIG.repoUrl}/issues`;

  document.querySelectorAll("[data-issue]").forEach(a=>{
    const t = a.getAttribute("data-issue");
    const title = encodeURIComponent(`[${t}] `);
    a.href = `${CONFIG.repoUrl}/issues/new?title=${title}`;
  });
}

// patch notes fetch (stable on GH Pages)
async function getPatchData(){
  const base = window.location.pathname.replace(/\/[^\/]*$/, "/");
  const url = `${base}patch-notes.json?v=${CONFIG.cacheVersion}`;
  const res = await fetch(url, { cache: "no-store" });
  if(!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

function renderPatchType(p){
  if(!p?.type) return "";
  const t = String(p.type).toUpperCase();
  const map = { HOTFIX:"🧯 HOTFIX", MINOR:"✨ MINOR", MAJOR:"🚀 MAJOR" };
  const label = map[t] || t;
  return `<span class="badge">${label}</span>`;
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
          ${renderPatchType(p)}
        </div>
        <div class="date">${p.date || ""}</div>
      </div>

      <div class="patchDesc">${p.summary || I18N[lang].latest_desc_default}</div>

      <ul class="patchList">
        ${bullets.map(c => `<li>${c}</li>`).join("")}
      </ul>

      <div class="patchFoot">
        <span>+${Math.max(0,(p.changes||[]).length - bullets.length)}</span>
        <span>•</span>
        <span>${(p.tags||[]).slice(0,4).join(" • ")}</span>
      </div>
    `;
  }catch(e){
    root.innerHTML = `<div class="patchDesc">${I18N[lang].err_patch}</div>`;
  }
}

async function loadLatestPatchShort(){
  const el = document.getElementById("latestPatchShort");
  if(!el) return;

  try{
    const data = await getPatchData();
    const list = data[lang] || [];
    const p = list[0];
    el.textContent = p ? (p.version || "—") : "—";
  }catch{
    el.textContent = "—";
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
            ${renderPatchType(p)}
          </div>
          <div class="date">${p.date || ""}</div>
        </div>

        ${p.summary ? `<div class="patchDesc">${p.summary}</div>` : ""}

        <ul class="patchList">
          ${(p.changes || []).map(c => `<li>${c}</li>`).join("")}
        </ul>

        ${(p.tags && p.tags.length) ? `
          <div class="patchFoot">
            <span>${p.tags.slice(0,6).join(" • ")}</span>
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

// Game count (expects { downloads: [] })
async function loadGameCount(){
  const el = document.querySelector("[data-game-count]");
  if(!el) return;

  try{
    const base = window.location.pathname.replace(/\/[^\/]*$/, "/");
    const url = `${base}source.json?v=${CONFIG.cacheVersion}`;
    const res = await fetch(url, { cache: "no-store" });
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const n = Array.isArray(data.downloads) ? data.downloads.length : 0;
    el.textContent = String(n);
  }catch{
    el.textContent = "—";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  applyI18n();
  loadLatestPatch();
  loadPatchPageList();
  loadLatestPatchShort();
  loadGameCount();
  setupReveal();
});

window.setLang = setLang;
