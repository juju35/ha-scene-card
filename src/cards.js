// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------
import { FIRE_MS, iconFor } from "./core.js";
import { ICONS, clamp, esc, fmtRelative, moreInfo, parseTime, svgIcon } from "./helpers.js";
import { BASE_STYLE, MINI_STYLE, ring } from "./styles.js";
import { CardBase, withMini } from "./card-base.js";
import { TINTS, activatedAt, activeScenes, luminance, resolve } from "./discovery-active-scene.js";
import { ART, BANNER_STYLE, SCENE_STYLE, isNight, sceneSvg } from "./styles-2.js";

export let _scUid = 0;

export class SceneCard extends CardBase {
  constructor() {
    super();
    this._uid = ++_scUid;
  }

  // The illustration is shown unless `illustration: false`.
  get _illustrated() {
    return this._config.illustration !== false;
  }
  static getConfigElement() {
    return document.createElement("scene-card-editor");
  }

  getCardSize() {
    return 6;
  }

  _build() {
    return resolve(this._hass, this._config);
  }

  _entityIds(m) {
    return [...m.scenes.map((x) => x.entity), ...m.scripts.map((x) => x.entity), ...new Set([...m.lightsOf.values(), ...[...m.countOf.values()].filter(Boolean)].flat())];
  }

  _extraDeps() {
    return [this._area, this._fired?.at];
  }

  _emptyKey(m) {
    return m.scenes.length || m.scripts.length ? null : "no_data";
  }

  // The areas to filter on: those of the scenes and scripts shown, when there are two at least.
  _areas(m) {
    if (this._config.show_area_filter === false) return [];
    const ids = [...new Set([...m.scenes, ...m.scripts].map((x) => x.area).filter(Boolean))];
    const list = ids.map((id) => ({ id, name: this._areaName(id) })).sort((a, b) => a.name.localeCompare(b.name));
    return list.length > 1 ? list : [];
  }

  _areaName(id) {
    return this._hass.areas?.[id]?.name || id;
  }

  _inArea(x) {
    return !this._area || x.area === this._area;
  }

  // The icon of a scene or script: the one set in the card or in Home Assistant, else one from its name.
  _icon(x, fallback) {
    // A state icon only when it is an icon name: SmartThings scenes carry a numeric code of their own ("203").
    const own = this._s(x.entity)?.attributes?.icon;
    const icon = x.icon || (typeof own === "string" && own.includes(":") ? own : null);
    if (icon) return { html: `<ha-icon icon="${esc(icon)}"></ha-icon>`, key: null };
    const key = iconFor(x.name, null);
    return { html: svgIcon(ICONS[key || fallback]), key };
  }

  _color(x, key) {
    // SmartThings scenes have a color of their own (a hex code).
    const own = this._s(x.entity)?.attributes?.color;
    const hex = typeof own === "string" && /^#?[0-9a-f]{6}$/i.test(own) ? (own.startsWith("#") ? own : `#${own}`) : null;
    // A very light color (cream, pale yellow) would leave its icon unreadable: darkened.
    const light = hex && luminance(hex) > 0.6;
    return x.color || (hex && (light ? `color-mix(in srgb, ${hex} 55%, #000)` : hex)) || (key && TINTS[key]) || "var(--sc-accent)";
  }

  // The lights a scene set that are on; 0 when the card can't tell which lights the scene sets.
  _lightsOn(m, x) {
    return (m.countOf.get(x.entity) || []).filter((id) => this._s(id)?.state === "on").length;
  }

  _summary(m) {
    const active = activeScenes(this._hass, m);
    // Running scripts are not shown anywhere when the scripts are hidden.
    // The header follows the area chosen in the card, as the hero does.
    const running = this._config.show_scripts === false ? [] : m.scripts.filter((x) => this._inArea(x) && this._s(x.entity)?.state === "on");
    const on = m.scenes.filter((x) => this._inArea(x) && active.has(x.entity));
    // The hero names the active scene (or says there is none): the subtitle then stays empty, so that the pill, the
    // subtitle and the hero never say the same thing. Without the hero, the subtitle names it.
    const heroShown = this._config.show_hero !== false;
    const sub = heroShown ? "" : on.length ? this._t("active_scene", { name: on.map((x) => x.name).join(", ") }) : m.scenes.length ? this._t("no_active") : "";
    const chip = running.length ? { cls: "accent", text: running.length === 1 ? this._t("running") : this._t("running_n", { n: running.length }), entity: running[0].entity } : null;
    return { active, running, on, sub, chip };
  }

  _onDisconnect() {
    clearTimeout(this._fireTimer);
  }

  _firing(id) {
    return this._fired?.id === id && Date.now() - this._fired.at < FIRE_MS;
  }

  _when(t) {
    return fmtRelative(this._hass, this._config, t);
  }

  // The hero: the active scene in big with where and when, its lights on and the running scripts; greyed without.
  _hero(m, sum) {
    // The area filter applies to the hero too.
    const x = sum.on.find((o) => this._inArea(o));
    const running = sum.running.filter((r) => this._inArea(r));
    const lines = [];
    if (x) {
      const t = activatedAt(this._s(x.entity));
      const where = [x.area && this._areaName(x.area), t && this._t("activated", { when: this._when(t) })].filter(Boolean).join(" · ");
      if (where) lines.push(`<div class="line">${svgIcon(ICONS.marker)}<span>${esc(where)}</span></div>`);
      const n = this._lightsOn(m, x);
      if (n) lines.push(`<div class="line">${svgIcon(ICONS.bulb)}<span>${esc(this._t("lights_on", { n }))}</span></div>`);
    }
    for (const r of running.slice(0, 2)) {
      lines.push(`<div class="line accent clickable"${moreInfo(r.entity)}>${svgIcon(ICONS.script)}<span>${esc(`${r.name} · ${this._t("running")}`)}</span></div>`);
    }
    const icon = x && this._icon(x, "palette");
    // "active" beside the name only while the pill says something else (a script running).
    const label = sum.chip ? `<span>${esc(this._t("active").toLowerCase())}</span>` : "";
    const big = x
      ? `<div class="big" style="--c: ${esc(this._color(x, icon.key))}">${icon.html}<b>${esc(x.name)}</b>${label}</div>`
      : `<div class="big none"><b>${esc(this._t("no_active"))}</b></div>`;
    // With the illustrated header, the drawing is in the banner: the hero keeps its text only.
    const art = this._illustrated ? "" : `<div class="hero-art${x ? "" : " off"}">${ART}</div>`;
    return `<div class="hero">${art}<div class="hero-body">${big}${lines.join("")}</div></div>`;
  }

  _scene(m, x, sum) {
    const on = sum.active.has(x.entity);
    const { html, key } = this._icon(x, "palette");
    const color = this._color(x, key);
    const s = this._s(x.entity);
    const t = activatedAt(s);
    // Unavailable (its integration down): said so, and not a button that could only fail.
    const off = s?.state === "unavailable";
    const when = off ? this._t("unavailable") : on ? this._t("active") : this._config.show_last === false ? "" : t ? this._when(t) : this._t("never");
    const n = on ? this._lightsOn(m, x) : 0;
    const cls = `tile${on ? " tint" : ""}${this._firing(x.entity) ? " fire" : ""}`;
    return `<button class="${cls}" data-action="activate" data-entity="${esc(x.entity)}" style="--c: ${esc(color)}" aria-pressed="${on}"${off ? " disabled" : ""} aria-label="${esc(
      `${x.name}${on ? ` · ${this._t("active")}` : off ? ` · ${this._t("unavailable")}` : ""}`,
    )}">
      <span class="ripple" aria-hidden="true"></span>
      <span class="tile-head"><span class="row-icon${on ? "" : " idle"}">${html}${on ? `<span class="badge">${svgIcon(ICONS.check)}</span>` : ""}</span>
        <span class="row-text"><span class="row-name">${esc(x.name)}</span>${when ? `<span class="row-state${on ? " accent" : ""}">${esc(when)}</span>` : ""}</span></span>
      ${n ? `<span class="badges"><span class="pill">${svgIcon(ICONS.bulb)}${n}</span></span>` : ""}
    </button>`;
  }

  _script(x) {
    const s = this._s(x.entity);
    const running = s?.state === "on";
    const { html } = this._icon(x, "script");
    const last = parseTime(s?.attributes?.last_triggered);
    const current = Number(s?.attributes?.current) || 0;
    const meta = running
      ? current > 1
        ? this._t("running_n", { n: current })
        : this._t("running")
      : this._config.show_last === false
        ? ""
        : last
          ? this._t("last_run", { when: this._when(last) })
          : this._t("never_run");
    const off = !s || s.state === "unavailable";
    const label = running ? this._t("stop") : this._t("run");
    return `<div class="row">
      <div class="row-icon${running ? " accent" : " idle"}">${running ? ring(44, 3, 0.3).replace('class="ring-svg"', 'class="ring-svg spin"') : ""}${html}</div>
      <div class="row-text clickable" role="button" tabindex="0" data-entity="${esc(x.entity)}"><div class="row-name">${esc(x.name)}</div>${meta ? `<div class="row-state${running ? " accent" : ""}">${esc(meta)}</div>` : ""}</div>
      <button class="btn${running ? " primary" : ""}" data-action="${running ? "stop" : "run"}" data-entity="${esc(x.entity)}" title="${esc(label)}" aria-label="${esc(`${label} · ${x.name}`)}"${off ? " disabled" : ""}>${svgIcon(running ? ICONS.stop : ICONS.play)}<span>${esc(label)}</span></button>
    </div>`;
  }

  // The header's status: accent with a scene on or a script running, red when every scene and script is unavailable,
  // grey at rest.
  _status(m, sum) {
    if (sum.on.length || sum.running.length) return "accent";
    const all = [...m.scenes, ...m.scripts];
    return all.length && all.every((x) => this._s(x.entity)?.state === "unavailable") ? "crit" : "idle";
  }

  // The status pill, in the header icon's colour: the scripts running, else the scene active, else unavailable (every
  // scene and script) or idle.
  _pill(sum, cls) {
    if (sum.chip) return sum.chip;
    if (sum.on.length) return { cls, text: this._t("active"), entity: sum.on[0].entity };
    return { cls, text: this._t(cls === "crit" ? "unavailable" : "idle") };
  }

  _head(m, sum, sub) {
    const title = this._config.title || this._t("scenes");
    const cls = this._status(m, sum);
    const pill = this._pill(sum, cls);
    // The pill says "Active": the subtitle names the scenes without repeating it.
    const text = sub && !sum.chip && sum.on.length ? sum.on.map((x) => x.name).join(", ") : sub;
    if (!this._illustrated) return this._header({ icon: ICONS.palette, cls, title, sub: text, chip: pill });
    const chip = `<span class="chip ${pill.cls}${pill.entity ? " clickable" : ""}"${moreInfo(pill.entity)} title="${esc(pill.text)}" aria-label="${esc(
      pill.text,
    )}"><span class="dot"></span><span class="chip-text">${esc(pill.text)}</span></span>`;
    const banner = `banner${isNight(this._hass, this._config) ? " night" : ""}${sum.on.length ? " on" : ""}`;
    return `<div class="${banner}">${sceneSvg(this._uid)}<div class="sc-ground" aria-hidden="true"></div>
      <div class="htext"><div class="type-icon ${cls}">${svgIcon(ICONS.palette)}</div><div class="titles"><div class="trow"><div class="name">${esc(title)}</div>${chip}</div>${
        text ? `<div class="sub" title="${esc(text)}">${esc(text)}</div>` : ""
      }</div></div>${this._zoomButton()}</div>`;
  }

  // The illustration's styles, only when it is shown.
  _bannerStyle() {
    return this._illustrated ? BANNER_STYLE : "";
  }

  _render() {
    const { m, error } = this._ready();
    if (error) return error;
    const c = this._config;
    const sum = this._summary(m);
    const areas = this._areas(m);
    if (this._area && !areas.some((a) => a.id === this._area)) this._area = null;
    const parts = [];
    if (c.show_hero !== false && m.scenes.length) parts.push(this._hero(m, sum));
    if (areas.length) {
      const chip = (id, name) => `<button class="area${(this._area || null) === id ? " on" : ""}" data-action="area" data-area="${esc(id || "")}" aria-pressed="${(this._area || null) === id}">${esc(name)}</button>`;
      parts.push(`<div class="areas" role="group" aria-label="${esc(this._t("areas"))}">${chip(null, this._t("all"))}${areas.map((a) => chip(a.id, a.name)).join("")}</div>`);
    }
    const before = parts.length;
    const scenes = m.scenes.filter((x) => this._inArea(x));
    const scripts = m.scripts.filter((x) => this._inArea(x));
    if (c.show_scenes !== false && scenes.length) {
      parts.push(this._section("scenes", ICONS.palette, this._t("scenes"), scenes.length, `<div class="tiles">${scenes.map((x) => this._scene(m, x, sum)).join("")}</div>`));
    }
    if (c.show_scripts !== false && scripts.length) {
      parts.push(this._section("scripts", ICONS.script, this._t("scripts"), scripts.length, `<div class="rows">${scripts.map((x) => this._script(x)).join("")}</div>`));
    }
    if (parts.length === before) parts.push(`<div class="empty">${esc(this._t("nothing_here"))}</div>`);
    return `<style>${BASE_STYLE}${SCENE_STYLE}${this._bannerStyle()}</style>
      <ha-card>
        ${this._head(m, sum, sum.sub)}
        <div class="content">${parts.join("")}</div>
      </ha-card>`;
  }

  _action(action, el) {
    const id = el.dataset.entity;
    if (action === "area") {
      this._area = el.dataset.area || null;
      this._update();
      return true;
    }
    if (action === "activate") {
      this._call("scene", "turn_on", { entity_id: id });
      this._fired = { id, at: Date.now() };
      // Drawn again once the ripple is over.
      clearTimeout(this._fireTimer);
      this._fireTimer = setTimeout(() => {
        this._lastDeps = null;
        this._update();
      }, FIRE_MS + 50);
      this._update();
      return true;
    }
    if (action === "run") this._call("script", "turn_on", { entity_id: id });
    else if (action === "stop") this._call("script", "turn_off", { entity_id: id });
    else return false;
    return true;
  }
}

export class SceneMiniCard extends withMini(SceneCard) {
  static getConfigElement() {
    return document.createElement("scene-mini-card-editor");
  }

  _renderMini() {
    const { m, error } = this._ready();
    if (error) return error;
    const sum = this._summary(m);
    const lines = [];
    if (sum.on.length) lines.push(`<div class="line accent clickable"${moreInfo(sum.on[0].entity)}>${svgIcon(ICONS.check)}<span>${esc(this._t("active_scene", { name: sum.on.map((x) => x.name).join(", ") }))}</span></div>`);
    for (const x of sum.running.slice(0, 2)) lines.push(`<div class="line accent clickable"${moreInfo(x.entity)}>${svgIcon(ICONS.script)}<span>${esc(`${x.name} · ${this._t("running")}`)}</span></div>`);
    if (!lines.length) lines.push(`<div class="line">${svgIcon(ICONS.palette)}<span>${esc(this._t("no_active"))}</span></div>`);
    // The first scenes as round buttons (`mini_count`, 3 by default), of the area chosen in the expanded view
    // like the summary lines above.
    const n = clamp(Number(this._config.mini_count ?? 3), 0, 6);
    const picks = m.scenes.filter((x) => this._inArea(x)).slice(0, n).map((x) => {
      const on = sum.active.has(x.entity);
      const { html, key } = this._icon(x, "palette");
      return `<button class="btn round${on ? " on" : ""}" data-action="activate" data-entity="${esc(x.entity)}" style="--c: ${esc(this._color(x, key))}" title="${esc(x.name)}" aria-label="${esc(x.name)}" aria-pressed="${on}"${this._s(x.entity)?.state === "unavailable" ? " disabled" : ""}>${html}</button>`;
    });
    return `<style>${BASE_STYLE}${SCENE_STYLE}${MINI_STYLE}${this._bannerStyle()}</style>
      <ha-card>
        ${this._head(m, sum, "")}
        <div class="content mini">
          ${this._illustrated ? "" : `<div class="mini-art${sum.on.length ? "" : " hero-art off"}">${ART}</div>`}
          <div class="info">${lines.join("")}</div>
          ${picks.length ? `<div class="controls picks">${picks.join("")}</div>` : ""}
        </div>
      </ha-card>`;
  }
}
