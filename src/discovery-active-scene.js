// ---------------------------------------------------------------------------
// Discovery and the active scene
// ---------------------------------------------------------------------------
import { SETTLE_MS } from "./core.js";
import { areaOf, asList, domainOf, parseTime, shortName, stateIds, valid } from "./helpers.js";

// The colors of the scene icons, by kind: a movie scene in violet, a dinner in orange…
export const TINTS = {
  film: "#5e35b1",
  dinner: "#ef6c00",
  book: "#8d6e63",
  sun: "#f9a825",
  moon: "#3949ab",
  bed: "#5c6bc0",
  away: "#00897b",
  sofa: "#d81b60",
  party: "#e53935",
  work: "#1e88e5",
  bright: "#fbc02d",
  power: "#757575",
  shutter: "#6d4c41",
  music: "#8e24aa",
};

export const _cache = new WeakMap();

// An entry of `scenes` or `scripts`: an entity id, or { entity, name, icon, color }.
export const entries = (list, domain) =>
  asList(list)
    .map((x) => (typeof x === "string" ? { entity: x } : x))
    .filter((x) => x?.entity && domainOf(x.entity) === domain);

// Shown unless hidden in Home Assistant or a configuration / diagnostic entity.
export const visible = (hass, id) => {
  const e = hass.entities?.[id];
  return !e || (!e.hidden && !e.hidden_by && !e.entity_category);
};

// The scenes and scripts of the configuration, else every visible scene and script; `area` keeps those of an area
// (or of several). Each one with its area: { entity, name, icon, color, area }.
export const resolve = (hass, config) => {
  let per = _cache.get(hass.entities);
  if (!per) _cache.set(hass.entities, (per = new Map()));
  const sig = `${JSON.stringify([config.scenes, config.scripts, config.area])}|${stateIds(hass.states).length}`;
  if (per.has(sig)) return per.get(sig);
  const areas = asList(config.area);
  const all = (domain) =>
    stateIds(hass.states)
      .filter((id) => domainOf(id) === domain && visible(hass, id))
      .map((entity) => ({ entity }));
  const take = (list, domain) =>
    (list === undefined ? all(domain) : entries(list, domain))
      .filter((x) => hass.states[x.entity])
      .map((x) => ({ ...x, name: x.name || shortName(hass, x.entity), area: areaOf(hass, x.entity) }))
      .filter((x) => !areas.length || areas.includes(x.area));
  const byName = (a, b) => a.name.localeCompare(b.name);
  const scenes = take(config.scenes, "scene");
  const scripts = take(config.scripts, "script");
  // In the configuration's order when listed there, else by name.
  if (config.scenes === undefined) scenes.sort(byName);
  if (config.scripts === undefined) scripts.sort(byName);
  // The lights a scene sets: its `entity_id` attribute (scenes of Home Assistant); else the lights of its device (Hue
  // scenes belong to their room or zone, whose grouped light is on the same device); else those of the area named as
  // its `group_name` (Hue), else of its own area (deCONZ and the others).
  const lights = stateIds(hass.states).filter((id) => domainOf(id) === "light");
  const areaByName = new Map(Object.values(hass.areas || {}).map((a) => [String(a.name).toLowerCase(), a.area_id]));
  const lightsOf = new Map();
  // The lights counted as "on" for a scene: only those it really sets (listed, or on its device), a light group
  // expanded to its members; null when they come from the area, or a Hue room light that can't be expanded.
  const countOf = new Map();
  const byFriendly = new Map(lights.map((id) => [String(hass.states[id]?.attributes?.friendly_name || ""), id]));
  const expand = (id) => {
    const a = hass.states[id]?.attributes || {};
    const listed = asList(a.entity_id).filter((x) => domainOf(x) === "light" && x !== id);
    if (listed.length) return listed;
    const named = asList(a.lights).map((n) => byFriendly.get(String(n))).filter((x) => x && x !== id);
    if (named.length) return named;
    // Only lights are counted: a switch or a media player set by the scene is not a light.
    if (domainOf(id) !== "light") return [];
    return a.is_hue_group ? null : [id];
  };
  for (const sc of scenes) {
    const attrs = hass.states[sc.entity].attributes || {};
    const listed = asList(attrs.entity_id);
    const device = hass.entities?.[sc.entity]?.device_id;
    const area = sc.area || (attrs.group_name ? areaByName.get(String(attrs.group_name).toLowerCase()) : null) || null;
    let members = listed;
    if (!members.length && device) members = lights.filter((id) => hass.entities?.[id]?.device_id === device);
    const sure = members.length > 0;
    if (!members.length && attrs.group_name) {
      const named = areaByName.get(String(attrs.group_name).toLowerCase());
      if (named) members = lights.filter((id) => areaOf(hass, id) === named);
    }
    if (!members.length && area) members = lights.filter((id) => areaOf(hass, id) === area);
    if (!sc.area && area) sc.area = area;
    lightsOf.set(sc.entity, members);
    if (sure) {
      const parts = members.map(expand);
      countOf.set(sc.entity, parts.some((x) => x === null) ? null : [...new Set(parts.flat())]);
    } else countOf.set(sc.entity, null);
  }
  const out = { scenes, scripts, lightsOf, countOf };
  per.set(sig, out);
  return out;
};

// Relative luminance of a #rrggbb color (0 black … 1 white).
export const luminance = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

// When a scene was last activated: the state of every scene entity, or null (never).
export const activatedAt = (s) => (s && valid(s) ? parseTime(s.state) : null);

// The active scenes: those that say so (Hue smart scenes), else those activated last among the scenes that set the
// same lights, while none of these lights changed since (SETTLE_MS after the activation, for its transitions).
export const activeScenes = (hass, m) => {
  const out = new Set();
  const at = new Map(m.scenes.map((sc) => [sc.entity, activatedAt(hass.states[sc.entity])]));
  // For each light, the last time a scene setting it was activated: one pass over the scenes, not one per pair of
  // scenes (an install with a hundred Hue scenes redraws this on every light change).
  const lastByLight = new Map();
  for (const sc of m.scenes) {
    const t = at.get(sc.entity) ?? -1;
    for (const id of m.lightsOf.get(sc.entity) || []) if (t > (lastByLight.get(id) ?? -1)) lastByLight.set(id, t);
  }
  for (const sc of m.scenes) {
    const s = hass.states[sc.entity];
    if (typeof s?.attributes?.is_active === "boolean") {
      if (s.attributes.is_active) out.add(sc.entity);
      continue;
    }
    const t = at.get(sc.entity);
    const lights = m.lightsOf.get(sc.entity) || [];
    if (t === null || !lights.length) continue;
    // A scene activated later set one of its lights (only another scene can be later than this one).
    const newer = lights.some((id) => (lastByLight.get(id) ?? -1) > t);
    if (newer) continue;
    const changed = lights.some((id) => (parseTime(hass.states[id]?.last_updated) ?? 0) > t + SETTLE_MS);
    if (!changed) out.add(sc.entity);
  }
  return out;
};
