// Mock Home Assistant registries and states for the screenshots and the tests: scenes of Home Assistant (with the
// lights they set) and of Philips Hue (a scene and a smart scene, by room), scripts (one running) and the lights of
// three areas. Entity ids are in French on purpose (the cards never rely on them); the names shown are neutral English
// ones. Every time is relative to NOW, a fixed instant, so that the captures never change. `mockData(variant)` returns
// everything a card needs for one capture.
export const NOW = Date.parse("2026-11-16T20:00:00Z");
const iso = (ms) => new Date(ms).toISOString();
const MIN = 6e4;
const HOUR = 36e5;

const base = () => {
  const states = {};
  const entities = {};
  const devices = {};
  const areas = {
    salon: { area_id: "salon", name: "Living room" },
    chambre: { area_id: "chambre", name: "Bedroom" },
    cuisine: { area_id: "cuisine", name: "Kitchen" },
  };
  const add = (entity_id, state, attributes, { platform = "homeassistant", area = null, changed = NOW - 2 * HOUR, extra = {} } = {}) => {
    entities[entity_id] = { entity_id, device_id: null, area_id: area, platform, translation_key: null, ...extra };
    states[entity_id] = { entity_id, state, attributes, last_changed: iso(changed), last_updated: iso(changed) };
  };
  // Lights: those of the living room set by the movie scene 40 minutes ago, the bedroom one changed since its scene.
  add("light.salon_plafond", "on", { friendly_name: "Living room ceiling", brightness: 60 }, { platform: "hue", area: "salon", changed: NOW - 40 * MIN });
  add("light.salon_lampe", "on", { friendly_name: "Living room lamp", brightness: 90 }, { platform: "hue", area: "salon", changed: NOW - 40 * MIN });
  add("light.cuisine", "off", { friendly_name: "Kitchen" }, { platform: "hue", area: "cuisine", changed: NOW - 3 * HOUR });
  add("light.chambre", "off", { friendly_name: "Bedroom" }, { platform: "hue", area: "chambre", changed: NOW - 6 * HOUR });
  const scene = (id, name, at, attrs = {}, opts = {}) => add(id, at === null ? "unknown" : iso(at), { friendly_name: name, ...attrs }, opts);
  scene("scene.cinema", "Movie", NOW - 40 * MIN, { entity_id: ["light.salon_plafond", "light.salon_lampe"] }, { area: "salon" });
  scene("scene.diner", "Dinner", NOW - 3 * HOUR, { entity_id: ["light.salon_plafond", "light.cuisine"] }, { area: "cuisine" });
  scene("scene.salon_lecture", "Reading", NOW - 26 * HOUR, { group_name: "Living room", is_dynamic: false }, { platform: "hue", area: "salon" });
  scene("scene.salon_detente", "Relax", NOW - 50 * HOUR, { group_name: "Living room", is_active: false }, { platform: "hue", area: "salon" });
  scene("scene.chambre_reveil", "Wake up", NOW - 13 * HOUR, { entity_id: ["light.chambre"] }, { area: "chambre" });
  scene("scene.chambre_nuit", "Good night", null, { entity_id: ["light.chambre"] }, { area: "chambre" });
  scene("scene.tout_eteindre", "All off", NOW - 30 * HOUR, { entity_id: ["light.salon_plafond", "light.salon_lampe", "light.cuisine", "light.chambre"] });
  const script = (id, name, state, last, attrs = {}, area = null) =>
    add(id, state, { friendly_name: name, last_triggered: last === null ? null : iso(last), mode: "single", current: state === "on" ? 1 : 0, ...attrs }, { platform: "script", area, changed: last ?? NOW - 50 * HOUR });
  script("script.depart", "Leave home", "on", NOW - 1 * MIN);
  script("script.volets", "Close the shutters", "off", NOW - 5 * HOUR, {}, "salon");
  script("script.matin", "Morning routine", "off", NOW - 14 * HOUR, {}, "chambre");
  script("script.cafe", "Coffee", "off", null, {}, "cuisine");
  // Hidden from the cards: a script hidden in Home Assistant.
  script("script.interne", "Internal", "off", null);
  entities["script.interne"].hidden = true;
  return { states, entities, devices, areas, api: {}, ws: {}, subs: {} };
};

// The variants of the captures:
//   default — as above
//   idle    — nothing running, the lights changed since the movie scene: no scene active
export const mockData = (variant = "default") => {
  const d = base();
  if (variant === "idle") {
    d.states["script.depart"] = { ...d.states["script.depart"], state: "off", attributes: { ...d.states["script.depart"].attributes, current: 0 } };
    d.states["light.salon_lampe"] = { ...d.states["light.salon_lampe"], last_updated: iso(NOW - 10 * MIN), last_changed: iso(NOW - 10 * MIN) };
  }
  return d;
};
