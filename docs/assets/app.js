// --- language toggle (se você já tem, pode manter o seu e só garantir que NÃO aparece como texto) ---
function kyrenLang(){
  return (localStorage.getItem("kyren_lang") || "pt-BR").startsWith("en") ? "en" : "pt";
}

// --- latest patch card ---
async function kyrenLoadLatestPatch(){
  try{
    const res = await fetch("./patch-notes.json", { cache: "no-store" });
    const patches = await res.json();
    const latest = patches?.[0];
    const card = document.getElementById("latestPatchCard");
    if(!latest || !card) return;

    const lang = kyrenLang();

    const title = (typeof latest.title === "object") ? (latest.title[lang] || "") : (latest.title || "");
    const summary = (typeof latest.summary === "object") ? (latest.summary[lang] || "") : (latest.summary || "");
    const highlights = (typeof latest.highlights === "object")
      ? (latest.highlights[lang] || [])
      : (latest.highlights || []);

    card.innerHTML = `
      <h3>🚀 ${latest.version} • ${title}</h3>
      <p style="margin-top:10px; opacity:.75">🗓️ ${latest.date}<br>${summary}</p>

      ${highlights.length ? `
        <div style="margin-top:14px; display:flex; flex-direction:column; gap:8px;">
          ${highlights.slice(0,3).map(h => `
            <div style="padding:10px 12px;border:1px solid rgba(255,255,255,.08);border-radius:14px;background:rgba(255,255,255,.03);">
              ${h}
            </div>
          `).join("")}
        </div>
      ` : ""}

      ${latest.stats ? `
        <p style="margin-top:12px;opacity:.85">
          📌 +${latest.stats.added ?? 0} • ✏️ ${latest.stats.updated ?? 0} • 🧼 ${latest.stats.cleaned ?? 0}
        </p>
      ` : ""}
    `;
  } catch(e){
    console.error(e);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  kyrenLoadLatestPatch();
});
