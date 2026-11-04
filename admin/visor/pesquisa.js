/* Fossil Tone · painel: código de exibição da pesquisa de concorrentes.
   Gerado por ferramentas/pesquisa-para-admin.py a partir de concorrentes.html.
   Não tem dados: eles vêm do Supabase, só para admin. */
/* t: p = pedal, a = amplificador, pa = pedal + amp, r = revenda
   s: massa | boutique | clone | arte | revenda | intl
   v: M = Megalodon, K = Kraken, L = Laboratório Âmbar, S = Manutenção
   l: 3 alta, 2 média, 1 baixa, 0 referência */
const D = JSON.parse(document.getElementById("dados").textContent);
const B = D.marcas;

const LBL = {
  o: { BR: "Brasil", EX: "Exterior" },
  t: { p: "Pedal", a: "Amplificador", pa: "Pedal + amp", r: "Revenda" },
  s: { boutique: "Boutique", clone: "Clone / custo-benefício", arte: "Arte / custom", massa: "Fábrica / massa", revenda: "Revenda", intl: "Referência internacional" },
  v: { M: "Megalodon", K: "Kraken", L: "Laboratório Âmbar", S: "Manutenção" },
  l: { 3: "Alta", 2: "Média", 1: "Baixa", 0: "Referência" },
};
const LVLCOLOR = { 3: "var(--ember)", 2: "var(--amber)", 1: "var(--moss)", 0: "#6f8fb0" };
const SEGINFO = {
  boutique: "Handmade e boutique brasileiras. É onde está a concorrência direta.",
  clone: "Releituras baratas de clássicos. Disputam quem quer o som por menos.",
  arte: "Marcas em que a arte e o custom vendem tanto quanto o circuito.",
  massa: "Fábricas e varejo grande. Pano de fundo de preço.",
  revenda: "Quem revende equipamento. Pode virar canal de venda.",
  intl: "Benchmark de marca, nicho e preço.",
};

B.forEach((b, i) => { b.id = i; b.vs = (b.v || "").split("").filter(Boolean); });

const st = { q: "", o: new Set(), t: new Set(), s: new Set(), v: new Set(), l: new Set(), ig: false, site: false, sort: "lvl", view: "cards", dir: 1 };

const norm = s => (s || "").toString().normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const esc = s => (s ?? "").toString().replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const host = u => u.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

function matches(b, skip) {
  if (st.q) {
    const hay = norm([b.n, b.c, b.p, b.d, b.w, b.ig, LBL.s[b.s], LBL.t[b.t]].join(" "));
    if (!norm(st.q).split(/\s+/).every(w => hay.includes(w))) return false;
  }
  if (skip !== "o" && st.o.size && !st.o.has(b.o)) return false;
  if (skip !== "t" && st.t.size && !st.t.has(b.t)) return false;
  if (skip !== "s" && st.s.size && !st.s.has(b.s)) return false;
  if (skip !== "v" && st.v.size && !b.vs.some(x => st.v.has(x))) return false;
  if (skip !== "l" && st.l.size && !st.l.has(String(b.l))) return false;
  if (st.ig && !b.ig) return false;
  if (st.site && !b.site) return false;
  if (st.price && !PRICE_TXT[b.n]) return false;
  return true;
}

function buildChips() {
  document.querySelectorAll(".fgroup").forEach(g => {
    const key = g.dataset.key;
    const keys = key === "l" ? ["3", "2", "1", "0"] : Object.keys(LBL[key]);
    keys.forEach(k => {
      const b = document.createElement("button");
      b.className = "chip"; b.type = "button"; b.dataset.k = k; b.setAttribute("aria-pressed", "false");
      b.innerHTML = (key === "l" ? `<span class="dot" style="background:${LVLCOLOR[k]}"></span>` : "") + esc(LBL[key][k]) + `<span class="n"></span>`;
      b.onclick = () => { st[key].has(k) ? st[key].delete(k) : st[key].add(k); render(); };
      g.appendChild(b);
    });
  });
}

function updateChipCounts() {
  document.querySelectorAll(".fgroup").forEach(g => {
    const key = g.dataset.key;
    g.querySelectorAll(".chip").forEach(c => {
      const k = c.dataset.k;
      const n = B.filter(b => matches(b, key) && (key === "v" ? b.vs.includes(k) : String(b[key]) === k)).length;
      c.querySelector(".n").textContent = n;
      c.setAttribute("aria-pressed", st[key].has(k));
    });
  });
}

function sorted(list) {
  const by = {
    lvl: (a, b) => b.l - a.l || a.n.localeCompare(b.n),
    name: (a, b) => a.n.localeCompare(b.n),
    year: (a, b) => (a.y || 9999) - (b.y || 9999) || a.n.localeCompare(b.n),
    seg: (a, b) => a.s.localeCompare(b.s) || b.l - a.l,
  }[st.sort];
  return list.slice().sort((a, b) => by(a, b) * st.dir);
}

const ICON_IG = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>';
const ICON_WEB = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/></svg>';
const ICON_FIND = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>';

function links(b) {
  let h = "";
  if (b.ig) h += `<a href="https://www.instagram.com/${esc(b.ig)}/" target="_blank" rel="noopener">${ICON_IG}@${esc(b.ig)}</a>`;
  if (b.site) h += `<a href="${esc(b.site)}" target="_blank" rel="noopener">${ICON_WEB}${esc(b.siteLabel || host(b.site))}</a>`;
  if (!b.ig || !b.site) {
    const q = encodeURIComponent(`${b.n} ${b.t === "a" ? "amplificador" : b.t === "r" ? "" : "pedal"} instagram`);
    h += `<a class="find" href="https://www.google.com/search?q=${q}" target="_blank" rel="noopener" title="Sem ${!b.ig ? "@" : "site"} confirmado">${ICON_FIND}procurar ${!b.ig ? "@" : "site"}</a>`;
  }
  return h;
}

function card(b, i) {
  const loc = [b.c, b.o === "BR" && !b.c ? "Brasil" : "", b.y ? "desde " + b.y : ""].filter(Boolean).join(" · ");
  const vs = b.vs.map(x => `<span class="tag vs">vs ${esc(LBL.v[x])}</span>`).join("");
  return `<article class="card" data-lvl="${b.l}">
    <div class="c-top"><span>FT-R-${String(b.id + 1).padStart(3, "0")}</span><span>${esc(LBL.o[b.o])}</span></div>
    <h3 class="c-name">${esc(b.n)}</h3>
    ${loc ? `<div class="c-loc">${esc(loc)}</div>` : ""}
    <div class="tags"><span class="tag lvl">Ameaça ${esc(LBL.l[b.l])}</span><span class="tag">${esc(LBL.t[b.t])}</span><span class="tag">${esc(LBL.s[b.s])}</span>${vs}</div>
    <p class="c-body">${esc(b.p)}${b.d ? " " + esc(b.d) : ""}</p>
    ${b.w ? `<p class="c-why">${esc(b.w)}</p>` : ""}
    ${PRICE_TXT[b.n] ? `<div class="c-price">Preço · ${esc(PRICE_TXT[b.n])}</div>` : ""}
    <div class="links">${links(b)}</div>
  </article>`;
}

function table(list) {
  const cols = [["name", "Marca"], ["", "Origem"], ["", "Produto"], ["seg", "Segmento"], ["lvl", "Ameaça"], ["", "Concorre com"], ["year", "Desde"], ["", "Preço"], ["", "Por que importa"], ["", "Links"]];
  return `<div class="tablewrap"><table><thead><tr>${cols.map(([k, t]) => `<th ${k ? `data-sort="${k}"` : ""}>${t}${st.sort === k ? (st.dir > 0 ? " ↓" : " ↑") : ""}</th>`).join("")}</tr></thead><tbody>
  ${list.map(b => `<tr>
    <td class="nm">${esc(b.n)}</td>
    <td>${esc(b.c || LBL.o[b.o])}</td>
    <td>${esc(LBL.t[b.t])}</td>
    <td>${esc(LBL.s[b.s])}</td>
    <td style="white-space:nowrap"><span class="dot" style="background:${LVLCOLOR[b.l]}"></span>${esc(LBL.l[b.l])}</td>
    <td>${b.vs.map(x => esc(LBL.v[x])).join(", ") || "—"}</td>
    <td>${b.y || "—"}</td>
    <td style="white-space:nowrap">${esc(PRICE_TXT[b.n] || "—")}</td>
    <td>${esc(b.w || b.d || b.p)}</td>
    <td style="white-space:nowrap">${b.ig ? `<a href="https://www.instagram.com/${esc(b.ig)}/" target="_blank" rel="noopener">@${esc(b.ig)}</a><br>` : ""}${b.site ? `<a href="${esc(b.site)}" target="_blank" rel="noopener">${esc(b.siteLabel || host(b.site))}</a>` : ""}${!b.ig && !b.site ? "—" : ""}</td>
  </tr>`).join("")}
  </tbody></table></div>`;
}

function render() {
  const list = sorted(B.filter(b => matches(b)));
  const out = document.getElementById("out");
  document.getElementById("count").textContent = `${list.length} de ${B.length} espécies catalogadas`;
  if (!list.length) out.innerHTML = `<div class="empty">Nenhuma espécie neste estrato. Tente afrouxar os filtros.</div>`;
  else out.innerHTML = st.view === "cards" ? `<div class="grid">${list.map(card).join("")}</div>` : table(list);
  out.querySelectorAll("th[data-sort]").forEach(th => th.onclick = () => {
    const k = th.dataset.sort; st.dir = st.sort === k ? -st.dir : 1; st.sort = k; document.getElementById("sort").value = k; render();
  });
  document.querySelectorAll("[data-view]").forEach(b => b.setAttribute("aria-pressed", b.dataset.view === st.view));
  updateChipCounts();
  saveHash();
}

function saveHash() {
  if (window.parent !== window) return;
  const p = new URLSearchParams();
  if (st.q) p.set("q", st.q);
  ["o", "t", "s", "v", "l"].forEach(k => st[k].size && p.set(k, [...st[k]].join(",")));
  if (st.ig) p.set("ig", 1); if (st.site) p.set("site", 1);
  if (st.sort !== "lvl") p.set("sort", st.sort);
  if (st.view !== "cards") p.set("view", st.view);
  const h = p.toString();
  try { history.replaceState(null, "", h ? "#f=" + encodeURIComponent(h) : location.pathname + location.search); } catch (e) {}
}
function loadHash() {
  const m = location.hash.match(/^#f=(.+)$/); if (!m) return;
  const p = new URLSearchParams(decodeURIComponent(m[1]));
  st.q = p.get("q") || ""; document.getElementById("q").value = st.q;
  ["o", "t", "s", "v", "l"].forEach(k => (p.get(k) || "").split(",").filter(Boolean).forEach(x => st[k].add(x)));
  st.ig = p.has("ig"); st.site = p.has("site");
  document.getElementById("hasig").checked = st.ig; document.getElementById("hassite").checked = st.site;
  st.sort = p.get("sort") || "lvl"; document.getElementById("sort").value = st.sort;
  st.view = p.get("view") || "cards";
}

function stats() {
  const c = f => B.filter(f).length;
  const items = [
    [B.length, "marcas catalogadas"],
    [c(b => b.o === "BR"), "brasileiras"],
    [c(b => b.o === "EX"), "de fora"],
    [c(b => b.t === "a" || b.t === "pa"), "fazem amplificador"],
    [c(b => b.l === 3), "ameaça alta"],
    [c(b => b.ig || b.site), "com @ ou site"],
    [c(b => PRICE_TXT[b.n]), "com preço"],
  ];
  document.getElementById("stats").innerHTML = items.map(([n, t]) => `<div class="stat"><b>${n}</b><span>${t}</span></div>`).join("");
}

function segmap() {
  const el = document.getElementById("segmap");
  el.innerHTML = Object.keys(LBL.s).map(k => {
    const list = B.filter(b => b.s === k).sort((a, b) => b.l - a.l);
    return `<button class="segbox" data-seg="${k}"><h3>${esc(LBL.s[k])}</h3><div class="big">${list.length}</div><p>${esc(SEGINFO[k])}</p><div class="who">${list.slice(0, 6).map(b => esc(b.n)).join(" · ")}${list.length > 6 ? " …" : ""}</div></button>`;
  }).join("");
  el.querySelectorAll(".segbox").forEach(b => b.onclick = () => {
    ["o", "t", "s", "v", "l"].forEach(k => st[k].clear()); st.s.add(b.dataset.seg); render();
    document.getElementById("catalogo").scrollIntoView({ behavior: "smooth" });
  });
}

// ---------- preços (coleta 2026-11-04) ----------
// v: preços em R$ (cada valor é um produto; faixas viram o ponto médio)
// usd: preços em US$, convertidos pelo câmbio da página
// old: preço antigo ou de usado; intl: referência de fora
const PRICES = D.precos;

// texto curto de preço para as fichas do catálogo
const PRICE_TXT = D.precoTxt;

const brl = v => "R$ " + Math.round(v).toLocaleString("pt-BR");
const median = a => { const s = a.slice().sort((x, y) => x - y), h = s.length >> 1; return s.length % 2 ? s[h] : (s[h - 1] + s[h]) / 2; };
const mean = a => a.reduce((x, y) => x + y, 0) / a.length;
const fxRate = () => Math.max(1, parseFloat(document.getElementById("fx").value) || 5.5);
const vals = r => r.v ? r.v : r.usd.map(x => x * fxRate());

function ladderHTML(rows, max, step, band) {
  const pct = v => Math.min(100, v / max * 100) + "%";
  let h = "";
  if (band) {
    h += `<div class="prow ft"><div class="nm">${esc(band.label)}<small>${esc(band.sub)}</small><i class="pval">${brl(band.a)}–${brl(band.b)}</i></div><div class="ptrack"><div class="pband" style="left:${pct(band.a)};width:calc(${pct(band.b)} - ${pct(band.a)})"></div></div></div>`;
  }
  rows.forEach(r => {
    const v = vals(r), lo = Math.min(...v), hi = Math.max(...v), md = median(v);
    const cls = ["prow", r.intl ? "intl" : "", r.old ? "old" : ""].join(" ");
    const label = v.length > 1 ? `${brl(lo)}–${brl(hi)} · mediana ${brl(md)}` : brl(lo) + (r.usd ? ` (US$ ${r.usd[0].toLocaleString("en-US")})` : "");
    h += `<div class="${cls}" title="${esc(r.itens)}"><div class="nm">${esc(r.m)}<small>${esc(r.sub)}</small><i class="pval">${label}</i></div><div class="ptrack">
      <div class="prange" style="left:${pct(lo)};width:max(2px, calc(${pct(hi)} - ${pct(lo)}))"></div>
      ${v.map(x => `<span class="pdot" style="left:${pct(x)}"></span>`).join("")}
      ${v.length > 1 ? `<span class="pmed" style="left:${pct(md)}"></span>` : ""}
      </div></div>`;
  });
  let ticks = "";
  for (let t = 0; t <= max; t += step) ticks += `<span style="left:${t / max * 100}%">${t >= 1000 ? (t / 1000).toLocaleString("pt-BR") + " mil" : t}</span>`;
  h += `<div class="axis2"><div></div><div class="ticks">${ticks}</div></div>`;
  return h;
}

function prices() {
  const showIntl = document.getElementById("showintl").checked;
  const showOld = document.getElementById("showold").checked;
  const keep = r => (showIntl || !r.intl) && (showOld || !r.old);

  // médias: grupos de marcas definidos nos dados
  const tiles = D.medias.map(g => {
    const v = PRICES[g.grupo].filter(r => g.marcas.includes(r.m)).flatMap(vals);
    return [g.titulo, brl(mean(v)), `${g.nota} · ${v.length} produtos · mediana ${brl(median(v))} · faixa ${brl(Math.min(...v))}–${brl(Math.max(...v))}`];
  });
  const ref = D.referencia;
  const refAmp = PRICES.amp.find(r => r.m === ref.amp), refPedal = PRICES.pedal.find(r => r.m === ref.pedal);
  if (refAmp && refPedal) {
    const pv = vals(refPedal);
    tiles.push([ref.titulo, brl(vals(refAmp)[0]), `${ref.nota} · ${refPedal.m} ${brl(Math.min(...pv))}–${brl(Math.max(...pv))}`]);
  }
  document.getElementById("ptiles").innerHTML = tiles.map(([k, v, r]) => `<div class="ptile"><div class="k">${esc(k)}</div><div class="v">${v}</div><div class="r">${esc(r)}</div></div>`).join("");

  document.getElementById("lad-pedal").innerHTML = ladderHTML(PRICES.pedal.filter(keep), 3000, 500);
  document.getElementById("lad-amp").innerHTML = ladderHTML(PRICES.amp.filter(keep), 16000, 2000, D.faixaKraken);

  // comparáveis
  const comps = D.comparaveis;
  const cval = v => typeof v === "string" ? v : v.usd.map(x => brl(x * fxRate())).join("–") + (v.sufixo || "");
  document.getElementById("comps").innerHTML = comps.map(c => `<div class="comp"><h4>${esc(c.h)}</h4><p>${esc(c.p)}</p><ul>${c.li.map(([a, b]) => `<li><span>${esc(a)}</span><b>${esc(cval(b))}</b></li>`).join("")}</ul></div>`).join("");

  // tabela bruta
  const rows = [...PRICES.pedal.map(r => ["Pedal", r]), ...PRICES.amp.map(r => ["Amp", r])];
  document.getElementById("ptable").innerHTML = `<thead><tr><th>Tipo</th><th>Marca</th><th>Produtos e preços</th><th>Faixa (R$)</th><th>Condição</th><th>Fonte</th></tr></thead><tbody>${rows.map(([t, r]) => {
    const v = vals(r);
    return `<tr><td>${t}</td><td class="nm">${esc(r.m)}</td><td>${esc(r.itens)}</td><td style="white-space:nowrap">${v.length > 1 ? brl(Math.min(...v)) + "–" + brl(Math.max(...v)) : brl(v[0])}</td><td>${esc(r.tipo)}</td><td><a href="${esc(r.src)}" target="_blank" rel="noopener">${esc(host(r.src).split("/")[0])}</a></td></tr>`;
  }).join("")}</tbody>`;
}
["fx", "showintl", "showold"].forEach(id => document.getElementById(id).addEventListener("input", prices));


// ---- eventos ----
let qt;
document.getElementById("q").addEventListener("input", e => { clearTimeout(qt); qt = setTimeout(() => { st.q = e.target.value.trim(); render(); }, 120); });
document.getElementById("sort").onchange = e => { st.sort = e.target.value; st.dir = 1; render(); };
document.getElementById("hasig").onchange = e => { st.ig = e.target.checked; render(); };
document.getElementById("hassite").onchange = e => { st.site = e.target.checked; render(); };
document.getElementById("hasprice").onchange = e => { st.price = e.target.checked; render(); };
document.querySelectorAll("[data-view]").forEach(b => b.onclick = () => { st.view = b.dataset.view; render(); });
document.getElementById("reset").onclick = () => {
  st.q = ""; document.getElementById("q").value = ""; ["o", "t", "s", "v", "l"].forEach(k => st[k].clear());
  st.ig = st.site = st.price = false; document.getElementById("hasig").checked = document.getElementById("hassite").checked = document.getElementById("hasprice").checked = false;
  st.sort = "lvl"; st.dir = 1; document.getElementById("sort").value = "lvl"; render();
};

// abas: destaca a seção visível
const tabs = [...document.querySelectorAll(".tabs a")];
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) tabs.forEach(a => a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id));
}), { rootMargin: "-45% 0px -50% 0px" });
document.querySelectorAll("main section, footer").forEach(s => io.observe(s));

document.addEventListener("click", e => {
  const a = e.target.closest('a[href^="#"]');
  if (!a || a.getAttribute("href").length < 2) return;
  const alvo = document.getElementById(a.getAttribute("href").slice(1));
  if (alvo) { e.preventDefault(); alvo.scrollIntoView({ behavior: "smooth" }); }
});

buildChips(); loadHash(); stats(); segmap(); prices(); render();
