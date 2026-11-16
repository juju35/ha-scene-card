// The README screenshots (PNG) and animations (GIF) rendered by scripts/screenshots.mjs.
// Every capture has a twin in the other theme ("-dark" for a light capture) that shows exactly the same state: only
// the theme differs (checked by test/screenshots.test.mjs). `variant` picks the mock data (scripts/mock-states.mjs).
const twins = (list) => list.flatMap((s) => [{ ...s, theme: "light" }, { ...s, file: `${s.file}-dark`, theme: "dark" }]);

export const shots = twins([
  { file: "card", type: "scene-card", width: 460, config: {} },
  { file: "card-area", type: "scene-card", width: 460, config: {}, clicks: ['[data-action="area"][data-area="salon"]'] },
  { file: "card-idle", type: "scene-card", width: 460, config: { show_area_filter: false }, variant: "idle" },
  { file: "mini-card", type: "scene-mini-card", width: 380, config: { scenes: ["scene.cinema", "scene.diner", "scene.chambre_nuit"] } },
  { file: "mini-card-zoom", type: "scene-mini-card", width: 460, config: {}, clicks: [".zoom"] },
  // Narrow cards: the full card at 6 columns of a phone's Sections view and the mini card at its minimum width.
  { file: "card-narrow", type: "scene-card", width: 238, config: { show_area_filter: false } },
  { file: "mini-card-narrow", type: "scene-mini-card", width: 170, config: { scenes: ["scene.cinema", "scene.diner", "scene.chambre_nuit"] } },
]);

// One looping GIF per distinct animated state:
//   activate — a scene launched: a ripple from its icon
//   running  — a script running: an arc turns round its icon
export const gifs = twins([
  { file: "activate", type: "scene-card", width: 460, config: { show_scripts: false, show_area_filter: false }, clicks: ['[data-action="activate"][data-entity="scene.diner"]'], seconds: 0.9 },
  { file: "running", type: "scene-card", width: 460, config: { show_scenes: false, show_area_filter: false, scripts: ["script.depart", "script.volets"] }, seconds: 1 },
]);
