/* Embeds every chart and wires up the two linked pickers.
   Each specification lives in /specs as a human-readable JSON file. */

const FONT = "IBM Plex Sans Condensed, Arial Narrow, Helvetica Neue, Arial, sans-serif";
const SERIF = "Source Serif 4, Georgia, serif";

const sharedConfig = {
  font: FONT,
  background: null,
  view: { stroke: null },
  axis: { labelFont: FONT, titleFont: SERIF, titleFontStyle: "italic", titleFontWeight: 400, labelColor: "#4f5563", titleColor: "#4f5563", labelFontSize: 12, titleFontSize: 12, domainColor: "#b9bbc7", tickColor: "#b9bbc7" },
  legend: { labelFont: FONT, titleFont: SERIF, titleFontStyle: "italic", labelColor: "#23263f", titleColor: "#23263f", titleFontSize: 12, labelFontSize: 12 },
  header: { labelFont: FONT, titleFont: SERIF, labelColor: "#23263f" },
  text: { font: FONT },
  title: { font: FONT }
};
const darkConfig = Object.assign({}, sharedConfig, {
  legend: Object.assign({}, sharedConfig.legend, { labelColor: "#e9e7f2", titleColor: "#e9e7f2" })
});

const charts = [
  { id: "vis-screen",         spec: "specs/01_screen_waffle.vl.json", config: darkConfig },
  { id: "vis-slope",          spec: "specs/02_slopegraph_services.vl.json" },
  { id: "vis-heatmap",        spec: "specs/03_heatmap_reach.vl.json" },
  { id: "vis-waffle",         spec: "specs/04_waffle_weekly_reach.vl.json" },
  { id: "vis-isotype",        spec: "specs/05_isotype_hours.vl.json" },
  { id: "vis-mekko",          spec: "specs/06_marimekko_genres.vl.json" },
  { id: "vis-gf",             spec: "specs/07_afl_gf_history.vl.json" },
  { id: "vis-map-symbols",    spec: "specs/08_map_gf_symbols.vl.json" },
  { id: "vis-map-choropleth", spec: "specs/09_map_footy_divide.vl.json" },
  { id: "vis-scatter",        spec: "specs/10_connected_scatter_drama.vl.json" },
  { id: "vis-treemap",        spec: "specs/11_treemap_drama_finance.vg.json", mode: "vega" },
  { id: "vis-map-spikes",     spec: "specs/12_map_drama_spikes.vl.json" }
];

const VERSION = "20261021c";  // bump to force browsers to fetch fresh chart specs
const views = {};
const embedOptions = { renderer: "svg", actions: false, tooltip: { theme: "light" } };

const ready = Promise.all(charts.map(c => {
  const opts = Object.assign({}, embedOptions, { config: c.config || sharedConfig });
  if (c.mode) opts.mode = c.mode;
  return vegaEmbed("#" + c.id, c.spec + "?v=" + VERSION, opts)
    .then(res => { views[c.id] = res.view; })
    .catch(err => {
      console.error("Could not draw " + c.spec, err);
      document.getElementById(c.id).innerHTML = '<p style="color:#a33">Chart failed to load: ' + c.spec + "</p>";
    });
}));

/* ---------- tiny CSV reader for the picker read-outs ---------- */
function csv(url) {
  return fetch(url).then(r => r.text()).then(t => {
    const lines = t.trim().split(/\r?\n/), head = lines[0].split(",");
    return lines.slice(1).map(l => {
      const cells = l.match(/("([^"]*)"|[^,]*)(,|$)/g).map(c => c.replace(/,$/, "").replace(/^"|"$/g, ""));
      const o = {}; head.forEach((h, i) => (o[h] = cells[i])); return o;
    });
  });
}
const hours = hm => { const [h, m] = hm.split(":").map(Number); return h + m / 60; };

function setSignal(id, name, value) {
  const v = views[id];
  if (v) v.signal(name, value).runAsync();
}

function wirePicker(pickerId, attr, onPick) {
  const buttons = document.querySelectorAll("#" + pickerId + " button");
  buttons.forEach(b => b.addEventListener("click", () => {
    const already = b.getAttribute("aria-pressed") === "true";
    buttons.forEach(x => x.setAttribute("aria-pressed", "false"));
    if (!already) b.setAttribute("aria-pressed", "true");
    onPick(already ? "" : b.dataset[attr]);
  }));
}

/* ---------- Chapter 2: choose a group -> heatmap + TV icons + waffles + sentence ---------- */
Promise.all([ready, csv("data/voz_monthly_h1_2026.csv"), csv("data/voz_weekly_reach_h1_2026.csv")]).then(([, monthly, weekly]) => {
  const out = document.getElementById("group-readout");
  const intro = out.innerHTML;
  wirePicker("group-picker", "group", g => {
    ["vis-heatmap", "vis-isotype", "vis-waffle"].forEach(id => setSignal(id, "sel_group", g));
    if (!g) { out.innerHTML = intro; return; }
    const m = monthly.find(r => r.group === g);
    const tot = hours(m.total_time), app = hours(m.bvod_time);
    const perDay = tot / 30.4 >= 1 ? (tot / 30.4).toFixed(1) + " hours a day" : Math.round(tot * 60 / 30.4) + " minutes a day";
    let s = "<b>" + g + "</b>: free-to-air TV reached <b>" + Math.round(m.total_reach_pct) + "%</b> in an average month " +
      "(<span class='k-broad'>" + Math.round(m.broadcast_reach_pct) + "% via the antenna</span>, <span class='k-apps'>" + Math.round(m.bvod_reach_pct) + "% via apps</span>). " +
      "They watched about <b>" + Math.round(tot) + " hours a month</b> (" + perDay + "), with <span class='k-apps'>" + Math.round(app / tot * 100) + "% of that time in apps</span>.";
    const w = weekly.filter(r => r.group === g);
    if (w.length) {
      const only = w.find(r => r.segment.startsWith("Streaming")), none = w.find(r => r.segment.startsWith("Didn"));
      s += " In a typical week, " + Math.round(only.pct) + "% watched only through apps and " + Math.round(none.pct) + "% didn't watch at all.";
    } else {
      s += " (Weekly habits are only published by age, so the waffles are not highlighted.)";
    }
    out.innerHTML = s;
  });
});

/* ---------- Chapter 4: choose a city -> both maps + sentence ---------- */
Promise.all([ready, csv("data/grand_finals_by_city_2026.csv"), csv("data/nrl_gf_city_2025_2026.csv")]).then(([, gf, nrl]) => {
  const out = document.getElementById("city-readout");
  const intro = out.innerHTML;
  const fmt = n => n >= 1e6 ? (n / 1e6).toFixed(2) + " million" : Math.round(n / 1000) + ",000";
  wirePicker("city-picker", "city", c => {
    ["vis-map-symbols", "vis-map-choropleth"].forEach(id => setSignal(id, "sel_city", c));
    if (!c) { out.innerHTML = intro; return; }
    const a = gf.find(r => r.city === c && r.code === "AFL"), n = gf.find(r => r.city === c && r.code === "NRL");
    const A = +a.audience, N = +n.audience, pop = +a.market_population_2026;
    const share = Math.round(A / (A + N) * 100);
    const winner = A > N ? "<span class='k-afl'>AFL</span>" : "<span class='k-nrl'>NRL</span>";
    out.innerHTML = "<b>" + c + "</b>: " + fmt(A) + " watched the <span class='k-afl'>AFL</span> final (" + Math.round(A / pop * 100) + " per 100 residents) and " +
      fmt(N) + " watched the <span class='k-nrl'>NRL</span> final (" + Math.round(N / pop * 100) + " per 100). " +
      "The " + winner + " won the city, with the AFL taking <b>" + share + "%</b> of grand-final viewers.";
    const r = nrl.find(x => x.city === c);
    if (r) { const ch = Math.round((+r.audience_2026 - +r.audience_2025) / +r.audience_2025 * 100);
      out.innerHTML += " Its <span class='k-nrl'>NRL</span> final audience " + (ch < 0 ? "fell <b>" + (-ch) : "rose <b>" + ch) + "%</b> on 2025 (" + fmt(+r.audience_2025) + " to " + fmt(+r.audience_2026) + ")."; }
  });
});

/* ---------- Side-by-side charts: cards share one height, so each chart grows into its
   card's leftover space (e.g. when the other card has a longer subtitle). ---------- */
function fitPairedCharts() {
  const cards = [...document.querySelectorAll(".grid-2 > .card")]
    .map(card => ({ card, box: card.querySelector(".chart") }))
    .filter(c => c.box && views[c.box.id]);
  // reset to the designed heights so the row settles at its natural size
  cards.forEach(({ box }) => {
    const v = views[box.id];
    if (v._baseHeight === undefined) v._baseHeight = v.height();
    v.height(v._baseHeight);
  });
  return Promise.all(cards.map(({ box }) => views[box.id].runAsync())).then(() => {
    const grow = cards.map(({ box }) => {
      const svg = box.querySelector("svg");
      return svg ? Math.floor(box.getBoundingClientRect().height - svg.getBoundingClientRect().height) : 0;
    });
    return Promise.all(cards.map(({ box }, i) => {
      const v = views[box.id];
      return grow[i] > 4 ? v.height(v._baseHeight + grow[i]).runAsync() : null;
    }));
  });
}
let fitTimer;
ready.then(() => document.fonts.ready).then(fitPairedCharts);
window.addEventListener("resize", () => { clearTimeout(fitTimer); fitTimer = setTimeout(fitPairedCharts, 200); });

/* ---------- text + chart rows: size each chart so its card is exactly as tall as the text beside it ---------- */
const FIT_IDS = ["vis-slope", "vis-gf", "vis-scatter", "vis-treemap"];
const FIT_MIN = 200, FIT_MAX = 560;
const baseHeight = {};
async function fitRows() {
  const sideBySide = window.matchMedia("(min-width: 1101px)").matches;
  for (const id of FIT_IDS) {
    const v = views[id], chart = document.getElementById(id);
    if (!v || !chart) continue;
    if (!(id in baseHeight)) baseHeight[id] = v.height();
    const card = chart.closest(".card"), row = card && card.closest(".story");
    const text = row && row.querySelector(":scope > .prose");
    if (!sideBySide || !text) { v.height(baseHeight[id]); await v.runAsync(); continue; }
    for (let i = 0; i < 3; i++) {
      const diff = text.getBoundingClientRect().height - card.getBoundingClientRect().height;
      if (Math.abs(diff) < 2) break;
      const next = Math.round(Math.max(FIT_MIN, Math.min(FIT_MAX, v.height() + diff)));
      if (next === v.height()) break;
      v.height(next);
      await v.runAsync();
    }
  }
}
Promise.all([ready, document.fonts ? document.fonts.ready : null]).then(fitRows);
let rowFitTimer;
window.addEventListener("resize", () => { clearTimeout(rowFitTimer); rowFitTimer = setTimeout(fitRows, 250); });
