const $ = (id) => document.getElementById(id);

function getLang(){
  return (localStorage.getItem("kyren_lang") || "pt-BR").startsWith("en") ? "en" : "pt";
}
function setLang(next){
  localStorage.setItem("kyren_lang", next);
  applyLang();
  kyrenLoadLatestPatch();
}

const copy = {
  pt: {
    tag: "KYREN — SOURCE HUB",
    heroSub: "Site oficial da source Kyren — guia rápido, patch notes e uma área pra pedidos/sugestões/bugs (tudo rastreável no GitHub).",
    cta1: "🚀 Como usar",
    cta2: "🧾 Patch notes",
    cta3: "💬 Feedback",
    label1: "O QUE TEM AQUI",
    c1t: "Quick setup",
    c1: "Passo a passo curto e direto pra importar a source no Hydra.",
    c1a: "Abrir guia →",
    c2t: "Updates",
    c2: "Mudanças organizadas: o que entrou, o que mudou e o que foi corrigido.",
    c2a: "Ver patch notes →",
    c3t: "Tickets",
    c3: "Pedidos, sugestões e bugs viram tickets — dá pra acompanhar e comentar.",
    c3a: "Abrir feedback →",
    latestLabel: "ÚLTIMO PATCH",
    latestBtn: "🧾 Ver patch notes",
    label2: "ATALHOS",
    formsBtn: "📌 Abrir formulários",
    feedbackTopBtn: "💬 Feedback",
    langToggle: "🌐 PT-BR → EN",
  },
  en: {
    tag: "KYREN — SOURCE HUB",
    heroSub: "Official Kyren source site — quick guide, patch notes, and a place for requests/suggestions/bugs (all trackable on GitHub).",
    cta1: "🚀 How to use",
    cta2: "🧾 Patch notes",
    cta3: "💬 Feedback",
    label1: "WHAT'S HERE",
    c1t: "Quick setup",
    c1: "Short, straight-to-the-point steps to import the source into Hydra.",
    c1a: "Open guide →",
    c2t: "Updates",
    c2: "Organized changes: what was added, changed, and fixed.",
    c2a: "View patch notes →",
    c3t: "Tickets",
    c3: "Requests, suggestions, and bugs become tickets — track and comment.",
    c3a: "Open feedback →",
    latestLabel: "LATEST PATCH",
    latestBtn: "🧾 View patch notes",
    label2: "SHORTCUTS",
    formsBtn: "📌 Open forms",
    feedbackTopBtn: "💬 Feedback",
    langToggle: "🌐 EN → PT-BR",
  }
};

function applyLang(){
  const lang = getLang();
  const d = copy[lang];

  $("tag").textContent = d.tag;
  $("heroSub").textContent = d.heroSub;

  $("cta1").textContent = d.cta1;
  $("cta2").textContent = d.cta2;
  $("cta3").textContent = d.cta3;

  $("label1").textContent = d.label1;

  $("c1t").textContent = d.c1t;
  $("c1").textContent = d.c1;
  $("c1a").textContent = d.c1a;

  $("c2t").textContent = d.c2t;
  $("c2").textContent = d.c2;
  $("c2a").textContent = d.c2a;

  $("c3t").textContent = d.c3t;
  $("c3").textContent = d.c3;
  $("c3a").textContent = d.c3a;

  $("latestLabel").textContent = d.latestLabel;
  $("latestBtn").textContent = d.latestBtn;

  $("label2").textContent = d.label2;
  $("formsBtn").textContent = d.formsBtn;

  $("feedbackTopBtn").textContent = d.feedbackTopBtn;
  $("langToggle").textContent = d.langToggle;

  document.documentElement.lang = (lang === "en" ? "en" : "pt-BR");
}

function safePick(field, lang){
  if(field == null) return "";
  if(typeof field === "object") return field[lang] || field.pt || field.en || "";
  return String(field);
}

async function kyrenLoadLatestPatch(){
  const card = $("latestPatchCard");
  if(!card) return;

  try{
    const res = await fetch("./patch-notes.json", { cache: "no-store" });
    const patches = await res.json();
    const latest = patches?.[0];
    if(!latest) throw new Error("No patches");

    const lang = getLang();
    const title = safePick(latest.title, lang);
    const summary = safePick(latest.summary, lang);

    const highlights = (typeof latest.highlights === "object")
      ? (latest.highlights[lang] || [])
      : (latest.highlights || []);

    card.innerHTML = `
      <div class="patchTop">
        <h3>🚀 ${latest.version} • ${title}</h3>
        <p class="muted">🗓️ ${latest.date}</p>
      </div>

      <p class="muted" style="margin-top:10px">${summary}</p>

      ${highlights.length ? `
        <div class="hi">
          ${highlights.slice(0,3).map(h => `<div class="hi__item">${h}</div>`).join("")}
        </div>
      ` : ""}

      ${latest.stats ? `
        <p class="stats">
          📌 +${latest.stats.added ?? 0}
          • ✏️ ${latest.stats.updated ?? 0}
          • 🧼 ${latest.stats.cleaned ?? 0}
        </p>
      ` : ""}
    `;
  } catch(e){
    console.error(e);
    card.innerHTML = `
      <h3>⚠️ Não carregou</h3>
      <p class="muted" style="margin-top:8px">Checa se <b>./patch-notes.json</b> existe em <b>/docs</b>.</p>
    `;
  }
}

function kyrenReveal(){
  const els = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver((entries) => {
    for (const e of entries){
      if(e.isIntersecting){
        e.target.classList.add("is-on");
        io.unobserve(e.target);
      }
    }
  }, { threshold: 0.12 });

  els.forEach(el => io.observe(el));
}

function kyrenMountScribbles(){
  const host = $("scribbles");
  if(!host) return;

  // leve e discreto (estilo do site)
  for(let i=0;i<10;i++){
    const c = document.createElement("div");
    c.className = "ring";
    c.style.left = `${Math.random()*100}%`;
    c.style.top = `${Math.random()*100}%`;
    c.style.width = `${220 + Math.random()*520}px`;
    c.style.height = c.style.width;
    c.style.opacity = `${0.06 + Math.random()*0.08}`;
    c.style.transform = `translate(-50%,-50%) rotate(${Math.random()*180}deg)`;
    host.appendChild(c);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // background
  kyrenMountScribbles();

  // reveal
  kyrenReveal();

  // lang
  applyLang();
  $("langToggle")?.addEventListener("click", () => {
    const next = getLang() === "en" ? "pt-BR" : "en";
    setLang(next);
  });

  // data
  kyrenLoadLatestPatch();
});
