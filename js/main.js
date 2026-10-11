/* Embeds every chart on the page.
   Each specification lives in /specs as a human-readable JSON file.
   A shared config keeps fonts and colours consistent across charts. */

const FONT = "IBM Plex Sans Condensed, Arial Narrow, Helvetica Neue, Arial, sans-serif";

const sharedConfig = {
  font: FONT,
  background: null,
  view: { stroke: null },
  axis: {
    labelFont: FONT, titleFont: FONT, labelColor: "#4a525c", titleColor: "#4a525c",
    labelFontSize: 12, titleFontSize: 12, domainColor: "#c9c2b2", tickColor: "#c9c2b2"
  },
  legend: { labelFont: FONT, titleFont: FONT, labelColor: "#3b4148", titleColor: "#3b4148", titleFontSize: 12, labelFontSize: 12 },
  header: { labelFont: FONT, titleFont: FONT, labelColor: "#1d232b" },
  text: { font: FONT },
  title: { font: FONT }
};

const darkConfig = Object.assign({}, sharedConfig, {
  legend: Object.assign({}, sharedConfig.legend, { labelColor: "#e9e6df", titleColor: "#e9e6df" })
});

const charts = [
  { id: "#vis-screen",          spec: "specs/01_screen_waffle.vl.json",          config: darkConfig },
  { id: "#vis-slope",           spec: "specs/02_slopegraph_services.vl.json" },
  { id: "#vis-heatmap",         spec: "specs/03_heatmap_reach.vl.json" },
  { id: "#vis-waffle",          spec: "specs/04_waffle_weekly_reach.vl.json" },
  { id: "#vis-isotype",         spec: "specs/05_isotype_hours.vl.json" },
  { id: "#vis-mekko",           spec: "specs/06_marimekko_genres.vl.json" },
  { id: "#vis-gf",              spec: "specs/07_afl_gf_history.vl.json" },
  { id: "#vis-map-symbols",     spec: "specs/08_map_gf_symbols.vl.json" },
  { id: "#vis-map-choropleth",  spec: "specs/09_map_footy_divide.vl.json" },
  { id: "#vis-scatter",         spec: "specs/10_connected_scatter_drama.vl.json" },
  { id: "#vis-treemap",         spec: "specs/11_treemap_drama_finance.vg.json", mode: "vega" },
  { id: "#vis-map-spikes",      spec: "specs/12_map_drama_spikes.vl.json" }
];

const embedOptions = {
  renderer: "svg",
  actions: false,
  tooltip: { theme: "light" }
};

charts.forEach(c => {
  const opts = Object.assign({}, embedOptions, { config: c.config || sharedConfig });
  if (c.mode) opts.mode = c.mode;
  vegaEmbed(c.id, c.spec, opts).catch(err => {
    console.error("Could not draw " + c.spec, err);
    document.querySelector(c.id).innerHTML =
      '<p style="font-family:sans-serif;color:#a33">Chart failed to load: ' + c.spec + "</p>";
  });
});
