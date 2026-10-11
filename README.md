# Switched On: How Australia Watches TV in 2025–26

FIT3179 Data Visualisation 2 (Semester 2, 2026) · Author: Gathika Athuruliya (33890714) · October 2026

A single scrolling data story about Australian television, built with **Vega-Lite** (and Vega for the treemap).

## Structure
| Folder | Contents |
|---|---|
| `index.html` | The web page (story text, layout, sources) |
| `css/style.css` | Layout, colour and typography |
| `js/main.js` | Embeds each chart with Vega-Embed and a shared font/colour config |
| `js/fx.js` | Decorative motion: live TV static, power-on, tune-in reveals, count-ups, progress bar, switch-off |
| `img/` | Original SVG illustrations (animated) and a static-noise fallback |
| `js/lib/` | Vega 5.33, Vega-Lite 5.23, Vega-Embed 6.29 (bundled so the page never depends on a CDN) |
| `specs/` | **One human-readable JSON spec per chart/map** (12 files) |
| `data/` | Small CSV datasets transcribed from the published sources, plus `aus_states.topojson` (9 KB) |
| `fonts/` | Self-hosted Bebas Neue, Source Serif 4, IBM Plex Sans Condensed (OFL) |
| `sketch/` | Put your scanned hand-drawn sketch here as `sketch.pdf` |

## Charts (12) and idioms
| # | Spec | Idiom | Data |
|---|---|---|---|
| 1 | `01_screen_waffle` | Waffle chart | OzTAM Streamscape Q2 2026 |
| 2 | `02_slopegraph_services` | Slopegraph | ACMA 2017 vs 2025 |
| 3 | `03_heatmap_reach` | Heatmap | OzTAM VOZ H1 2026 |
| 4 | `04_waffle_weekly_reach` | Small-multiple waffles | OzTAM VOZ H1 2026 |
| 5 | `05_isotype_hours` | Isotype / pictogram | OzTAM VOZ H1 2026 |
| 6 | `06_marimekko_genres` | Marimekko (mosaic) | OzTAM VOZ H1 2026 |
| 7 | `07_afl_gf_history` | Line + bar (basic) | Seven / TV Blackbox, Mediaweek |
| 8 | `08_map_gf_symbols` | **Map: proportional symbols** | TV Blackbox, Nine, OzTAM universes |
| 9 | `09_map_footy_divide` | **Map: diverging choropleth** | as above |
| 10 | `10_connected_scatter_drama` | Connected scatterplot | Screen Australia Drama Report 2024/25 |
| 11 | `11_treemap_drama_finance` | Treemap (Vega) | Screen Australia Drama Report 2024/25 |
| 12 | `12_map_drama_spikes` | **Map: spike map** | Screen Australia Drama Report 2024/25 |

