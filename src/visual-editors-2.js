// ---------------------------------------------------------------------------
// Visual editors
// ---------------------------------------------------------------------------
import { VERSION } from "./core.js";
import { asList, t } from "./helpers.js";
import { EditorBase } from "./visual-editors.js";
import { register } from "./register.js";
import { SceneCard, SceneMiniCard } from "./cards.js";

export class SceneCardEditor extends EditorBase {
  static get toggles() {
    return [
      ["illustration", true],
      ["show_title", true],
      ["show_subtitle", true],
      ["show_hero", true],
      ["show_scenes", true],
      ["show_scripts", true],
      ["show_area_filter", true],
      ["show_last", true],
    ];
  }

  static get sections() {
    return ["scenes", "scripts"];
  }

  static get defaults() {
    return { illustration_theme: "auto" };
  }

  _fields() {
    const tr = (k) => t(this._hass, this._config, k);
    // `scenes` / `scripts` written in YAML with objects ({ entity, name, icon, color }) stay YAML-only: an entity
    // picker would show them empty and drop their names, icons and colours on the first change.
    const plain = (k) => asList(this._config?.[k]).every((x) => typeof x === "string");
    return [
      { name: "illustration_theme", selector: { select: { mode: "dropdown", options: ["auto", "day", "night"].map((value) => ({ value, label: tr(`theme_${value}`) })) } } },
      ...(plain("scenes") ? [{ name: "scenes", selector: { entity: { multiple: true, domain: "scene" } } }] : []),
      ...(plain("scripts") ? [{ name: "scripts", selector: { entity: { multiple: true, domain: "script" } } }] : []),
      { name: "area", selector: { area: { multiple: true } } },
    ];
  }
}

// The mini card's detail view is the full card: its editor offers the full card's options, plus its own.
export class SceneMiniCardEditor extends SceneCardEditor {
  static get toggles() {
    return [...SceneCardEditor.toggles, ["zoom", true]];
  }

  _fields() {
    return [...super._fields(), { name: "mini_count", selector: { number: { min: 0, max: 6, mode: "box" } } }];
  }
}

register(
  [
    ["scene-card", SceneCard, { name: "Scene Card", description: "Scenes in a grid with the active one highlighted, scripts with their running state, filtered by area." }],
    ["scene-mini-card", SceneMiniCard, { name: "Scene Mini Card", description: "Compact scenes: the active scene, the running scripts and buttons for the first scenes." }],
    ["scene-card-editor", SceneCardEditor],
    ["scene-mini-card-editor", SceneMiniCardEditor],
  ],
  "https://github.com/juju35/ha-scene-card",
);

console.info(`%c SCENE-CARD %c v${VERSION} `, "color: white; background: #8e24aa; font-weight: 700;", "color: #8e24aa; background: white; font-weight: 700;");
