let lang = localStorage.getItem("lang") || "pt";

function setLang(l){
  lang = l;
  localStorage.setItem("lang", l);
  renderPatchNotes();
}

async function renderPatchNotes(){
  const el = document.getElementById("patch-list");
  if(!el) return;

  const res = await fetch("patch-notes.json");
  const data = await res.json();

  el.innerHTML = "";

  data[lang].forEach(p => {
    el.innerHTML += `
      <div class="patch-card">
        <div class="patch-top">
          <strong>${p.version}</strong>
          <span>${p.date}</span>
        </div>
        <ul>
          ${p.changes.map(c => `<li>${c}</li>`).join("")}
        </ul>
      </div>
    `;
  });
}

document.addEventListener("DOMContentLoaded", renderPatchNotes);
