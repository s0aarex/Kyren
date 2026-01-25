function byId(id) { return document.getElementById(id); }

function norm(str) {
  return (str ?? "")
    .toString()
    .trim()
    .toLowerCase();
}

function hasTag(item, tag) {
  if (!tag) return true;
  const t = norm(tag);
  const tags = Array.isArray(item.tags) ? item.tags.map(norm) : [];
  return tags.some(x => x.includes(t));
}

function matchesSearch(item, q) {
  if (!q) return true;
  const s = norm(q);
  const hay = [
    item.title, item.text, item.decision, item.why,
    ...(Array.isArray(item.tags) ? item.tags : [])
  ].map(norm).join(" | ");
  return hay.includes(s);
}

function fmtDate(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleString("pt-BR", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return "—";
  }
}

async function fetchJson(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`Falha ao carregar ${path} (${res.status})`);
  return await res.json();
}
