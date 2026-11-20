import assert from "node:assert/strict";
import { test } from "node:test";
import { mockData, NOW } from "../scripts/mock-states.mjs";
import { load } from "./load.mjs";

const sc = load({ names: ["iconFor", "resolve", "activeScenes", "activatedAt", "STRINGS", "LANGUAGES", "isNight"] });
const SceneCard = sc.element("scene-card");
const SceneMiniCard = sc.element("scene-mini-card");
// Objects from the sandbox have the sandbox's prototypes: compared as plain JSON.
const same = (a, b, msg) => assert.deepEqual(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(b)), msg);

const makeHass = (variant = "default", { language = "en" } = {}) => {
  const d = mockData(variant);
  const calls = [];
  return { calls, ...d, language, locale: { language }, callService: (...a) => calls.push(a) };
};

const mount = async (config = {}, variant = "default", Card = SceneCard, opts = {}) => {
  const card = new Card();
  card._connected = true;
  card.setConfig(config);
  const hass = makeHass(variant, opts);
  card.hass = hass;
  card.connectedCallback();
  await new Promise((r) => setTimeout(r, 0));
  return { card, hass, html: () => card.shadowRoot.innerHTML.replace(/[   ]/g, " ") };
};

const click = (card, dataset) => card._onClick({ composedPath: () => [{ dataset }], stopPropagation() {}, detail: 1 });

test("icons from the name, in English and French; words inside others do not count", () => {
  assert.equal(sc.iconFor("Movie night", null), "film");
  assert.equal(sc.iconFor("Cinéma", null), "film");
  assert.equal(sc.iconFor("Dîner", null), "dinner");
  assert.equal(sc.iconFor("Reading", null), "book");
  assert.equal(sc.iconFor("Volets fermés", null), "shutter");
  assert.equal(sc.iconFor("All off", null), "power");
  assert.equal(sc.iconFor("Coffee", "script"), "script");
});

test("every visible scene and script is found, by name, with its area; hidden ones are left out", () => {
  const m = sc.resolve(makeHass(), {});
  same(
    m.scenes.map((x) => [x.name, x.area]),
    [
      ["All off", null],
      ["Dinner", "cuisine"],
      ["Good night", "chambre"],
      ["Movie", "salon"],
      ["Reading", "salon"],
      ["Relax", "salon"],
      ["Wake up", "chambre"],
    ],
  );
  same(
    m.scripts.map((x) => x.name),
    ["Close the shutters", "Coffee", "Leave home", "Morning routine"],
  );
  // A Hue scene sets the lights of its room.
  same(m.lightsOf.get("scene.salon_lecture"), ["light.salon_plafond", "light.salon_lampe"]);
});

test("the active scene: the last one on its lights, while none changed since; a smart scene says it itself", () => {
  const hass = makeHass();
  const m = sc.resolve(hass, {});
  same([...sc.activeScenes(hass, m)], ["scene.cinema"]);
  // A light of the movie scene changed after it: no longer active.
  const idle = makeHass("idle");
  same([...sc.activeScenes(idle, sc.resolve(idle, {}))], []);
  // Changes during the transition do not count.
  hass.states["light.salon_lampe"] = { ...hass.states["light.salon_lampe"], last_updated: new Date(NOW - 40 * 6e4 + 5e3).toISOString() };
  same([...sc.activeScenes(hass, m)], ["scene.cinema"]);
  hass.states["scene.salon_detente"].attributes.is_active = true;
  same([...sc.activeScenes(hass, m)].sort(), ["scene.cinema", "scene.salon_detente"]);
  assert.equal(sc.activatedAt(hass.states["scene.chambre_nuit"]), null);
});

test("Hue scenes on a room device without area: the lights of that device, else of the area named as the group", () => {
  const hass = makeHass();
  hass.devices.room = { id: "room", area_id: null, name: "Living room" };
  hass.entities["scene.salon_lecture"] = { ...hass.entities["scene.salon_lecture"], area_id: null, device_id: "room" };
  hass.entities["light.salon_lampe"] = { ...hass.entities["light.salon_lampe"], device_id: "room" };
  const m = sc.resolve(hass, {});
  same(m.lightsOf.get("scene.salon_lecture"), ["light.salon_lampe"]);
  // No light on the room device: the lights of the area named as its group, and the scene takes that area.
  const h2 = makeHass();
  h2.entities["scene.salon_lecture"] = { ...h2.entities["scene.salon_lecture"], area_id: null, device_id: null };
  const m2 = sc.resolve(h2, {});
  same(m2.lightsOf.get("scene.salon_lecture"), ["light.salon_plafond", "light.salon_lampe"]);
  assert.equal(m2.scenes.find((x) => x.entity === "scene.salon_lecture").area, "salon");
});

test("SmartThings scenes: their numeric icon code is ignored, their color tints the tile", async () => {
  const card = new SceneCard();
  card._connected = true;
  card.setConfig({ show_area_filter: false });
  const hass = makeHass();
  hass.entities["scene.st_soiree"] = { entity_id: "scene.st_soiree", platform: "smartthings", area_id: "salon" };
  hass.states["scene.st_soiree"] = { entity_id: "scene.st_soiree", state: "unknown", attributes: { friendly_name: "Evening", icon: "203", color: "#ff9900" } };
  card.hass = hass;
  const h = card.shadowRoot.innerHTML;
  assert.doesNotMatch(h, /ha-icon icon="203"/);
  assert.match(h, /--c: #ff9900[^>]*data-entity="scene\.st_soiree"|data-entity="scene\.st_soiree"[^>]*--c: #ff9900/);
});

test("header, scene tiles and script rows: active scene, last activations, running script", async () => {
  const { html } = await mount();
  // The pill says a script runs: the hero names the active scene, "active" beside it, and the subtitle stays empty.
  assert.match(html(), /<b>Movie<\/b><span>active<\/span>/);
  assert.doesNotMatch(html(), /class="sub"/);
  assert.match(html(), /class="chip accent[^"]*"[^>]*data-entity="script\.depart"/);
  assert.match(html(), /class="tile tint"[^>]*data-entity="scene\.cinema"[^>]*aria-pressed="true"/);
  assert.match(html(), /3 hr\. ago/);
  assert.match(html(), /Never<\/span>/);
  assert.match(html(), /Last run 5 hr\. ago/);
  assert.match(html(), /Never run/);
  assert.match(html(), /class="ring-svg spin"/);
  assert.match(html(), /data-action="stop" data-entity="script\.depart"/);
});

test("a scene tile activates its scene, with a ripple; scripts run and stop", async () => {
  const { card, hass, html } = await mount();
  click(card, { action: "activate", entity: "scene.diner" });
  same(hass.calls.at(-1), ["scene", "turn_on", { entity_id: "scene.diner" }]);
  assert.match(html(), /class="tile fire"[^>]*data-entity="scene\.diner"/);
  click(card, { action: "run", entity: "script.cafe" });
  same(hass.calls.at(-1), ["script", "turn_on", { entity_id: "script.cafe" }]);
  click(card, { action: "stop", entity: "script.depart" });
  same(hass.calls.at(-1), ["script", "turn_off", { entity_id: "script.depart" }]);
  clearTimeout(card._fireTimer);
});

test("the area filter shows the scenes and scripts of one area", async () => {
  const { card, html } = await mount();
  assert.match(html(), /data-action="area" data-area="chambre"[^>]*>Bedroom/);
  click(card, { action: "area", area: "chambre" });
  assert.match(html(), /Wake up/);
  assert.doesNotMatch(html(), /Dinner|data-action="stop"|Leave home/);
  // The hero follows the filter: the movie scene of the living room is not shown there.
  const hero = /<div class="hero">[\s\S]*?<div class="areas"/.exec(html())[0];
  assert.doesNotMatch(hero, /Movie|Leave home/);
  assert.match(hero, /No active scene/);
  click(card, { action: "area", area: "" });
  assert.match(html(), /Dinner/);
});

test("configured scenes and scripts in their order; `area` keeps those of an area, without the filter", async () => {
  const { card, html } = await mount({ scenes: ["scene.diner", { entity: "scene.cinema", name: "Cinema", icon: "mdi:movie-roll" }], scripts: [] });
  same(
    card._resolve().scenes.map((x) => x.name),
    ["Dinner", "Cinema"],
  );
  assert.match(html(), /<ha-icon icon="mdi:movie-roll">/);
  assert.doesNotMatch(html(), /SCRIPTS|Leave home/);
  const r = await mount({ area: "chambre" });
  assert.doesNotMatch(r.html(), /data-action="area"/);
  assert.match(r.html(), /Good night/);
  assert.doesNotMatch(r.html(), /Dinner/);
});

test("the hero: the active scene, where and when, its lights on and the running script; hidden by show_hero", async () => {
  const { html } = await mount();
  assert.match(html(), /class="hero"/);
  assert.match(html(), /Living room · Activated 40 min\. ago/);
  assert.match(html(), /Lights on: 2/);
  assert.match(html(), /Leave home · Running/);
  const r = await mount({ show_hero: false });
  assert.doesNotMatch(r.html(), /class="hero"/);
});

test("options: sections hidden, folded, last activations hidden", async () => {
  const { card, html } = await mount({ show_scripts: false, show_last: false, show_area_filter: false, collapsed: ["scenes"] });
  assert.doesNotMatch(html(), /data-action="(run|stop)"|data-action="area"|Leave home/);
  assert.doesNotMatch(html(), /Dinner/);
  click(card, { action: "toggle_section", section: "scenes" });
  assert.match(html(), /Dinner/);
  assert.doesNotMatch(html(), /3 hr\. ago/);
});

test("nothing active: the hero says so, once", async () => {
  const { html } = await mount({}, "idle");
  assert.equal((html().match(/No active scene/g) || []).length, 1);
  const r = await mount({ show_hero: false }, "idle");
  // Once on screen (the subtitle's tooltip, its full text when it is cut, aside).
  assert.equal((r.html().replace(/ title="[^"]*"/g, "").match(/No active scene/g) || []).length, 1);
  // At rest the status pill says so, grey like the header icon.
  assert.match(html(), /class="chip idle" title="Idle" aria-label="Idle"><span class="dot"><\/span><span class="chip-text">Idle<\/span>/);
  assert.doesNotMatch(html(), /class="tile tint"/);
  // The drawing is in the banner, greyed (no `on`) with a grey icon; the hero keeps its text only.
  assert.match(html(), /class="banner"/);
  assert.match(html(), /type-icon idle/);
  assert.doesNotMatch(html(), /class="hero-art/);
  const classic = await mount({ illustration: false }, "idle");
  assert.match(classic.html(), /hero-art off/);
  assert.doesNotMatch(classic.html(), /class="banner/);
});

test("illustrated header: lit with a scene on, night by option, unique ids per card", async () => {
  const a = await mount({});
  assert.match(a.html(), /class="banner on"/);
  // The status pill right after the title: the script running (it wins over the active scene, then named with
  // "active" in the subtitle); with the scripts hidden, "Active" and the scene's name alone under it.
  assert.match(a.html(), /<div class="trow"><div class="name">Scenes<\/div><span class="chip accent clickable"[^>]*><span class="dot"><\/span><span class="chip-text">Running</);
  const active = await mount({ show_scripts: false });
  // The pill says "Active": the hero names the scene without repeating it, the subtitle stays empty.
  assert.match(active.html(), /<span class="chip-text">Active<\/span><\/span><\/div><\/div>/);
  assert.match(active.html(), /<b>Movie<\/b><\/div>/);
  // Without the hero, the subtitle names the scene.
  const noHero = await mount({ show_scripts: false, show_hero: false });
  assert.match(noHero.html(), /<span class="chip-text">Active<\/span><\/span><\/div><div class="sub" title="Movie">Movie<\/div>/);
  assert.match(a.html(), /type-icon accent/);
  assert.match(a.html(), /class="sc-ground"/);
  const b = await mount({ illustration_theme: "night" });
  assert.match(b.html(), /class="banner night on"/);
  const ids = (h) => h.match(/id="sc-glow-\d+"/)[0];
  assert.notEqual(ids(a.html()), ids(b.html()));
  const day = await mount({ illustration_theme: "day" });
  assert.doesNotMatch(day.html(), /banner night/);
});

test("night picture: the dark theme alone, even while the sun is up; a light theme keeps the day after sunset; illustration_theme wins", () => {
  const h = (state, darkMode = false) => ({ states: { "sun.sun": { state } }, themes: { darkMode } });
  assert.equal(sc.isNight(h("above_horizon", true), {}), true);
  assert.equal(sc.isNight(h("above_horizon"), {}), false);
  assert.equal(sc.isNight(h("below_horizon"), {}), false);
  assert.equal(sc.isNight(h("below_horizon", true), {}), true);
  assert.equal(sc.isNight(h("unavailable", true), {}), true);
  assert.equal(sc.isNight(h("unavailable"), {}), false);
  assert.equal(sc.isNight(h("below_horizon", true), { illustration_theme: "day" }), false);
  assert.equal(sc.isNight(h("above_horizon"), { illustration_theme: "night" }), true);
});

test("mini card: the active scene, the running script and the first scenes as buttons; the detail button shows the full card", async () => {
  const { card, hass, html } = await mount({ mini_count: 2 }, "default", SceneMiniCard);
  assert.match(html(), /content mini/);
  assert.match(html(), /Movie/);
  assert.match(html(), /Leave home/);
  assert.equal([...html().matchAll(/class="btn round[^"]*" data-action="activate"/g)].length, 2);
  click(card, { action: "activate", entity: "scene.tout_eteindre" });
  same(hass.calls.at(-1), ["scene", "turn_on", { entity_id: "scene.tout_eteindre" }]);
  clearTimeout(card._fireTimer);
  card._dialogClosedAt = 0;
  click(card, { action: "zoom" });
  assert.match(html(), /class="tiles"/);
  card._unzoom.tap({ composedPath: () => [] });
  assert.match(html(), /content mini/);
});

test("nothing found: a clear message instead of an empty card", () => {
  const card = new SceneCard();
  card.setConfig({});
  card.hass = { states: {}, entities: {}, devices: {}, language: "en" };
  assert.match(card.shadowRoot.innerHTML, /no scene or script found/);
});

test("French: texts in the card's language", async () => {
  const { html } = await mount({ language: "fr" });
  assert.match(html(), /<b>Movie<\/b><span>active<\/span>/);
  assert.match(html(), /Toutes/);
  assert.match(html(), /Jamais lancé/);
});

test("every language has every text, with the same placeholders as English", () => {
  const en = sc.STRINGS.en;
  const ph = (s) => [...String(s).matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
  for (const [l, table] of Object.entries(sc.STRINGS)) {
    assert.deepEqual(Object.keys(table).sort(), Object.keys(en).sort(), l);
    for (const k of Object.keys(en)) assert.deepEqual(ph(table[k]), ph(en[k]), `${l}.${k}`);
  }
  assert.equal(sc.LANGUAGES.length, Object.keys(sc.STRINGS).length);
});

test("visual editor: fields labelled apart from the sections, defaults left out of the YAML; the mini editor adds its options", () => {
  const Editor = sc.element("scene-card-editor");
  const MiniEditor = sc.element("scene-mini-card-editor");
  const doc = sc.window.document;
  const create = doc.createElement;
  let form;
  doc.createElement = (tag) => (form = { tag, listeners: {}, addEventListener(type, fn) { this.listeners[type] = fn; } });
  try {
    const ed = new Editor();
    let out;
    ed.dispatchEvent = (ev) => {
      out = ev.detail.config;
    };
    ed.setConfig({ type: "custom:scene-card" });
    ed.hass = makeHass();
    assert.match(form.computeLabel({ name: "scenes" }), /empty: all/);
    form.listeners["value-changed"]({ stopPropagation() {}, detail: { value: { type: "custom:scene-card", show_scenes: true, show_last: false, scripts: [] } } });
    same(out, { type: "custom:scene-card", show_last: false });
  } finally {
    doc.createElement = create;
  }
  assert.ok(MiniEditor.toggles.some(([n]) => n === "zoom"));
  assert.ok(new MiniEditor()._fields().some((f) => f.name === "mini_count"));
});

test("every clickable element can be reached and used from the keyboard", async () => {
  const { html } = await mount();
  for (const m of html().matchAll(/<(div|span)[^>]*data-(entity|action)=[^>]*>/g)) {
    assert.match(m[0], /role="button"/, m[0]);
    assert.match(m[0], /tabindex="0"/, m[0]);
  }
});

test("lights on: only the lights a scene sets, a light group counted by its members; none from the area", async () => {
  const d = makeHass();
  const m = sc.resolve(d, {});
  same(m.countOf.get("scene.cinema"), ["light.salon_plafond", "light.salon_lampe"]);
  // Reading (Hue) gets its lights from the area: not counted.
  assert.equal(m.countOf.get("scene.salon_lecture"), null);
  // A light group listed by a scene counts its members.
  const g = makeHass();
  g.states["light.groupe"] = { entity_id: "light.groupe", state: "on", attributes: { entity_id: ["light.salon_plafond", "light.salon_lampe"] }, last_updated: g.states["light.salon_plafond"].last_updated };
  g.states["scene.cinema"].attributes.entity_id = ["light.groupe"];
  same(sc.resolve(g, {}).countOf.get("scene.cinema"), ["light.salon_plafond", "light.salon_lampe"]);
  // A Hue room light that can't be expanded: no count.
  const h = makeHass();
  h.states["light.groupe"] = { entity_id: "light.groupe", state: "on", attributes: { is_hue_group: true }, last_updated: h.states["light.salon_plafond"].last_updated };
  h.states["scene.cinema"].attributes.entity_id = ["light.groupe"];
  assert.equal(sc.resolve(h, {}).countOf.get("scene.cinema"), null);
});

test("a long active scene name is cut with an ellipsis, a very light SmartThings color is darkened", async () => {
  const { card, html } = await mount();
  assert.match(html(), /\.hero-body \.big b \{ min-width: 0; overflow: hidden; text-overflow: ellipsis; \}/);
  card._hass.states["scene.cinema"].attributes.color = "#FFF5E0";
  assert.match(card._color({ entity: "scene.cinema" }, null), /color-mix\(in srgb, #FFF5E0 55%, #000\)/);
});

test("lights on: a switch or a media player set by a scene is not counted as a light", () => {
  const d = makeHass();
  d.states["switch.fan"] = { entity_id: "switch.fan", state: "on", attributes: {}, last_updated: d.states["light.salon_plafond"].last_updated };
  d.states["scene.cinema"].attributes.entity_id = ["light.salon_plafond", "switch.fan"];
  same(sc.resolve(d, {}).countOf.get("scene.cinema"), ["light.salon_plafond"]);
});

test("the header follows the area chosen: no active scene of another area in the subtitle", async () => {
  const { card, html } = await mount();
  click(card, { action: "area", area: "chambre" });
  assert.doesNotMatch(html(), /Movie active/);
});

// A measured layout stand-in for _fitPill: the title block (.titles) with its row (title + pill) in a banner whose
// ground strip starts at 80 px. Widths in px; `tall` makes the block run past the strip once the pill drops.
const fitLayout = ({ title, pill, row, tall = false, banner = true }) => {
  const rect = (o) => ({ top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0, ...o });
  const classes = new Set();
  const name = { textContent: "x", width: title, getClientRects: () => [1] };
  const chip = { getBoundingClientRect: () => rect({ width: classes.has("pill-dot") ? 14 : pill }) };
  const trow = { querySelector: (s) => (s.includes(".name") ? name : chip), getBoundingClientRect: () => rect({ width: row }) };
  const ground = { getBoundingClientRect: () => rect({ top: 80 }) };
  const box = { getBoundingClientRect: () => rect({ top: 0, bottom: 90 }), querySelector: () => ground };
  const t = {
    classList: {
      add: (c) => classes.add(c),
      remove: (...c) => {
        for (const x of c) classes.delete(x);
      },
    },
    querySelector: () => trow,
    closest: () => (banner ? box : null),
    getBoundingClientRect: () => rect({ top: 10, bottom: classes.has("below") && tall ? 86 : 70, width: row }),
  };
  return { t, classes };
};

test("the status pill stays beside a whole title, else drops under the subtitle, else keeps its dot (measured)", () => {
  const w = sc.window;
  w.getComputedStyle = () => ({ columnGap: "8px" });
  w.document.createRange = () => {
    let el;
    return { selectNodeContents: (e) => (el = e), getBoundingClientRect: () => ({ width: el.width }) };
  };
  const fit = (opts) => {
    const card = (() => { const c = new SceneCard(); c.setConfig({}); c.hass = makeHass(); return c; })();
    const l = fitLayout(opts);
    card.shadowRoot.querySelectorAll = () => [l.t];
    card._fitPill();
    return [...l.classes].sort().join(" ");
  };
  // Whole title + gap + whole pill fit on the row: the pill stays beside the title.
  assert.equal(fit({ title: 60, pill: 70, row: 140 }), "");
  // One pixel short: never an ellipsised title beside the pill, the pill goes under the subtitle.
  assert.equal(fit({ title: 63, pill: 70, row: 140 }), "below");
  // Long Greek/Cyrillic/German labels: decided by the measure, not by a fixed width.
  assert.equal(fit({ title: 40, pill: 130, row: 160 }), "below");
  assert.equal(fit({ title: 40, pill: 112, row: 160 }), "");
  // Under the subtitle but the block would run into the ground strip, or the label is wider than the line: dot only.
  assert.equal(fit({ title: 90, pill: 70, row: 140, tall: true }), "below pill-dot");
  assert.equal(fit({ title: 90, pill: 150, row: 140 }), "below pill-dot");
  // The classic header (no banner) follows the same rule.
  assert.equal(fit({ title: 90, pill: 70, row: 140, banner: false }), "below");
  delete w.getComputedStyle;
  delete w.document.createRange;
});

test("no fixed width decides the pill's place: only the dot-only rule at 200 px is a width rule", () => {
  const css = ((() => { const c = new SceneCard(); c.setConfig({}); c.hass = makeHass(); return c; })()).shadowRoot.innerHTML;
  assert.doesNotMatch(css, /@container rc-head/);
  assert.match(css, /\.titles\.below \.trow \{ display: contents; \}/);
  assert.match(css, /\.titles\.pill-dot \.chip \.chip-text \{ display: none; \}/);
  assert.match(css, /@container \(max-width: 200px\) \{\s*\.chip \{ padding: 4px; flex: none; \}/);
});

test("an unavailable scene says so and its tile is disabled", async () => {
  const { card, hass, html } = await mount();
  hass.states["scene.diner"] = { ...hass.states["scene.diner"], state: "unavailable" };
  card._lastDeps = null;
  card.hass = { ...hass, states: { ...hass.states } };
  const tile = html().match(/<button class="tile[^"]*" data-action="activate" data-entity="scene\.diner"[^>]*>/)[0];
  assert.match(tile, / disabled/);
  assert.match(tile, /Unavailable/);
});

test("the active scene stays the last one activated on shared lights, with many scenes", () => {
  const hass = makeHass();
  const m = sc.resolve(hass, {});
  // "All off" set every light 30 h ago, the movie 40 min ago: only the movie is active; once "All off" is newer, it is.
  same([...sc.activeScenes(hass, m)], ["scene.cinema"]);
  hass.states["scene.tout_eteindre"] = { ...hass.states["scene.tout_eteindre"], state: new Date(NOW - 60e3).toISOString() };
  same([...sc.activeScenes(hass, m)], ["scene.tout_eteindre"]);
});

test("visual editor: scenes or scripts written as objects stay YAML-only", () => {
  const Editor = sc.element("scene-card-editor");
  const doc = sc.window.document;
  const create = doc.createElement;
  let form;
  doc.createElement = (tag) => (form = { tag, listeners: {}, addEventListener(type, fn) { this.listeners[type] = fn; } });
  try {
    const ed = new Editor();
    ed.setConfig({ type: "custom:scene-card", scenes: [{ entity: "scene.cinema", icon: "mdi:movie" }], scripts: ["script.cafe"] });
    ed.hass = makeHass();
    const names = form.schema.map((s) => s.name);
    assert.ok(!names.includes("scenes"));
    assert.ok(names.includes("scripts"));
    ed.setConfig({ type: "custom:scene-card", scenes: ["scene.cinema"] });
    assert.ok(form.schema.some((s) => s.name === "scenes"));
  } finally {
    doc.createElement = create;
  }
});

test("mini card: the scene buttons follow the area chosen in the expanded view", async () => {
  const { card, hass, html } = await mount({ mini_count: 6 }, "default", SceneMiniCard);
  const picks = () => [...html().matchAll(/data-action="activate" data-entity="([^"]+)"/g)].map((x) => x[1]);
  const all = picks();
  card._dialogClosedAt = 0;
  click(card, { action: "zoom" });
  click(card, { action: "area", area: "chambre" });
  card._unzoom.tap({ composedPath: () => [] });
  assert.match(html(), /content mini/);
  const bedroom = picks();
  assert.ok(bedroom.length > 0 && bedroom.length < all.length, `${bedroom} vs ${all}`);
  for (const id of bedroom) assert.equal(hass.entities[id]?.area_id ?? hass.devices[hass.entities[id]?.device_id]?.area_id, "chambre");
  clearTimeout(card._fireTimer);
});

test("the entity ids are listed once per states object, shared by every caller", () => {
  const t = load({ names: ["stateIds"] });
  const states = { "scene.a": {}, "light.b": {} };
  const ids = t.stateIds(states);
  assert.equal(t.stateIds(states), ids);
  assert.notEqual(t.stateIds({ ...states }), ids);
  assert.equal(t.stateIds(undefined).length, 0);
});
