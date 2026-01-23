function kyrenMountScribbles(){
  const host = document.getElementById("bgScribbles");
  if(!host) return;
  host.innerHTML = `
  <svg width="100%" height="100%" viewBox="0 0 1200 800" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" stroke="rgba(255,255,255,.22)" stroke-width="2">
      <path d="M80,120 C220,40 420,80 520,200 C620,320 820,340 980,260" opacity=".45"/>
      <path d="M180,680 C260,540 420,520 560,560 C720,610 860,520 1020,420" opacity=".35"/>
      <path d="M980,90 C900,160 860,260 930,330 C1000,400 1120,410 1160,360" opacity=".30"/>
      <path d="M40,360 C140,300 220,300 320,360 C420,420 520,420 620,360" opacity=".25"/>
      <path d="M720,760 C760,640 860,590 950,610 C1040,630 1120,600 1180,540" opacity=".25"/>
    </g>
    <g fill="none" stroke="rgba(255,255,255,.12)" stroke-width="1">
      <circle cx="1050" cy="140" r="110"/>
      <circle cx="140" cy="620" r="160"/>
      <circle cx="610" cy="120" r="90"/>
    </g>
  </svg>`;
}

function kyrenReveal(){
  const els = document.querySelectorAll(".reveal");
  const obs = new IntersectionObserver((entries)=>{
    for(const e of entries){
      if(e.isIntersecting){
        e.target.classList.add("in");
        obs.unobserve(e.target);
      }
    }
  }, { threshold: 0.12 });
  els.forEach(el=>obs.observe(el));
}

function kyrenInitLang(setUI){
  const saved = localStorage.getItem("kyren_lang") || "pt-BR";
  setUI(saved);

  const toggle = document.getElementById("langToggle");
  if(toggle){
    toggle.addEventListener("click", ()=>{
      const cur = localStorage.getItem("kyren_lang") || "pt-BR";
      const next = cur === "pt-BR" ? "en" : "pt-BR";
      setUI(next);
    });
  }
}
