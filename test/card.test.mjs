import assert from "node:assert/strict";
import { test } from "node:test";
import { mockData, NOW } from "../scripts/mock-states.mjs";
import { load } from "./load.mjs";

const sc = load({ names: ["iconFor", "resolve", "activeScenes", "activatedAt", "STRINGS", "LANGUAGES"] });
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
  assert.match(html(), /Movie active/);
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
  assert.doesNotMatch(html(), /Dinner|data-action="stop"/);
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
  assert.doesNotMatch(html(), /data-action="(run|stop)"|data-action="area"/);
  assert.doesNotMatch(html(), /Dinner/);
  click(card, { action: "toggle_section", section: "scenes" });
  assert.match(html(), /Dinner/);
  assert.doesNotMatch(html(), /3 hr\. ago/);
});

test("nothing active: the header says so", async () => {
  const { html } = await mount({}, "idle");
  assert.match(html(), /No active scene/);
  assert.doesNotMatch(html(), /class="chip/);
  assert.doesNotMatch(html(), /class="tile tint"/);
  assert.match(html(), /hero-art off/);
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
  assert.match(html(), /Movie active/);
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
