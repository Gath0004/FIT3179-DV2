/* Accessibility helpers: every chart gets a keyboard-reachable "View the data" table,
   so the numbers are available without relying on colour, hover or a mouse. */
(function () {
  const tables = {
    "vis-slope": "data/acma_services_2017_2025.csv",
    "vis-heatmap": "data/voz_monthly_h1_2026.csv",
    "vis-isotype": "data/voz_monthly_h1_2026.csv",
    "vis-waffle": "data/voz_weekly_reach_h1_2026.csv",
    "vis-mekko": "data/voz_genre_h1_2026.csv",
    "vis-gf": "data/afl_grand_final_audiences.csv",
    "vis-map-symbols": "data/grand_finals_by_city_2026.csv",
    "vis-scatter": "data/drama_fta_vs_streaming.csv",
    "vis-treemap": "data/drama_finance_2024_25.csv",
    "vis-map-spikes": "data/drama_spend_by_state.csv"
  };
  const hide = ["lat", "lon", "order", "cells", "group_order", "segment_order", "id", "parent"];
  const pretty = s => s.replace(/_/g, " ").replace(/\bpct\b/, "%").replace(/\bm\b/, "($m)").replace(/^./, c => c.toUpperCase());

  function parseCSV(text) {
    const rows = [];
    text.trim().split(/\r?\n/).forEach(line => {
      const out = []; let cur = "", q = false;
      for (const ch of line) {
        if (ch === '"') q = !q;
        else if (ch === "," && !q) { out.push(cur); cur = ""; }
        else cur += ch;
      }
      out.push(cur); rows.push(out);
    });
    return rows;
  }

  Object.entries(tables).forEach(([id, url]) => {
    const chart = document.getElementById(id);
    if (!chart) return;
    fetch(url).then(r => r.text()).then(text => {
      const rows = parseCSV(text), head = rows[0];
      const keep = head.map((h, i) => (hide.includes(h) ? -1 : i)).filter(i => i >= 0);
      const det = document.createElement("details");
      det.className = "data-table";
      det.innerHTML = "<summary>View the data</summary>";
      const tbl = document.createElement("table");
      tbl.innerHTML = "<thead><tr>" + keep.map(i => "<th scope='col'>" + pretty(head[i]) + "</th>").join("") + "</tr></thead><tbody>" +
        rows.slice(1).map(r => "<tr>" + keep.map(i => "<td>" + (r[i] || "") + "</td>").join("") + "</tr>").join("") + "</tbody>";
      det.appendChild(tbl);
      const fig = chart.closest("figure");
      const cap = fig && fig.querySelector("figcaption");
      (cap ? cap.parentNode : chart.parentNode).insertBefore(det, cap || chart.nextSibling);
    }).catch(() => {});
  });
})();
