// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
import { FIRE_MS } from "./core.js";

// The illustration of the hero: a sofa under a lamp, greyed when no scene is active.
export const ART = `<svg viewBox="0 0 120 100" aria-hidden="true">
  <ellipse cx="60" cy="60" rx="52" ry="36" class="a-bg"/>
  <rect x="22" y="58" width="76" height="22" rx="8" class="a-s1"/><rect x="16" y="54" width="14" height="28" rx="6" class="a-s2"/>
  <rect x="90" y="54" width="14" height="28" rx="6" class="a-s2"/><rect x="30" y="50" width="28" height="14" rx="6" class="a-s3"/>
  <rect x="62" y="50" width="28" height="14" rx="6" class="a-s3"/><rect x="20" y="82" width="4" height="8" class="a-s2"/><rect x="96" y="82" width="4" height="8" class="a-s2"/>
  <path d="M96 14 v20" class="a-cord"/><path d="M86 34 h20 l-4 -10 h-12 z" class="a-lamp"/><path d="M84 36 l-8 14 h40 l-8 -14" class="a-light"/>
  <circle cx="22" cy="24" r="14" class="a-moon2"/><circle cx="22" cy="24" r="8" class="a-moon"/></svg>`;

export const SCENE_STYLE = `
  :host { --sc-art-bg: color-mix(in srgb, #7e57c2 14%, transparent); }
  .a-bg { fill: var(--sc-art-bg); } .a-s1 { fill: #7e57c2; } .a-s2 { fill: #673ab7; } .a-s3 { fill: #9575cd; }
  .a-cord { stroke: var(--secondary-text-color); stroke-width: 2; } .a-lamp { fill: #ffb74d; } .a-light { fill: #ffe082; opacity: .55; }
  .a-moon { fill: #ffd54f; opacity: .9; } .a-moon2 { fill: #ffd54f; opacity: .25; }
  .hero-art.off svg { filter: grayscale(1); opacity: .45; }
  .hero-art.off .a-light { display: none; }
  .areas { display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none; margin: 0 -12px; padding: 0 12px; }
  .areas::-webkit-scrollbar { display: none; }
  .area { font: inherit; font-size: 13px; padding: 4px 10px; border-radius: 14px; cursor: pointer; color: var(--primary-text-color); white-space: nowrap; flex: none;
          border: none; background: var(--secondary-background-color, rgba(127,127,127,.12)); }
  .area.on { color: var(--sc-accent-text); background: color-mix(in srgb, var(--sc-accent) 15%, transparent); font-weight: 500; }
  .area:focus-visible { outline: 2px solid var(--primary-color, var(--sc-accent)); outline-offset: 1px; }
  .tiles { --cols: 3; }
  button.tile { all: unset; position: relative; overflow: hidden; box-sizing: border-box; display: flex; flex-direction: column; gap: 6px; padding: 8px;
                border-radius: 10px; cursor: pointer; min-width: 0; border: 1px solid transparent;
                background: var(--secondary-background-color, rgba(127,127,127,.12)); transition: background-color .3s ease, border-color .3s ease; }
  button.tile.tint { background: color-mix(in srgb, var(--c) 13%, var(--secondary-background-color, rgba(127,127,127,.12)));
                     border-color: color-mix(in srgb, var(--c) 30%, transparent); }
  /* Only with a real pointer (no sticky hover after a tap on WebKit), and never over the active tile's tint. */
  @media (hover: hover) {
    button.tile:not(.tint):hover { background: color-mix(in srgb, var(--c) 8%, var(--secondary-background-color, rgba(127,127,127,.12))); }
  }
  .hero-body .big b { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
  .big ha-icon { --mdc-icon-size: 24px; color: var(--c); align-self: center; flex: none; }
  button.tile:disabled { cursor: default; opacity: .55; }
  button.tile:focus-visible { outline: 2px solid var(--primary-color, var(--sc-accent)); outline-offset: 2px; }
  .tile .row-icon > ha-icon { --mdc-icon-size: 18px; }
  /* The scene just launched: a ripple from its icon. */
  .tile .ripple { position: absolute; top: 24px; left: 24px; width: 30px; height: 30px; margin: -15px; border-radius: 50%; pointer-events: none;
                  background: var(--c); opacity: 0; transform: scale(0); }
  .tile.fire .ripple { animation: sc-ripple ${FIRE_MS}ms ease-out forwards; }
  .tile.fire .row-icon { animation: sc-pop ${FIRE_MS}ms ease-out; }
  @keyframes sc-ripple { 0% { opacity: .35; transform: scale(.6); } 100% { opacity: 0; transform: scale(9); } }
  @keyframes sc-pop { 0%, 100% { transform: scale(1); } 30% { transform: scale(.86); } 60% { transform: scale(1.08); } }
  /* A script running: its ring turns round the icon. */
  .row-icon .ring-svg.spin { animation: sc-spin 1.2s linear infinite; }
  @keyframes sc-spin { from { transform: rotate(-90deg); } to { transform: rotate(270deg); } }
  .row-text.clickable { cursor: pointer; }
  .mini .mini-art { width: 84px; flex: none; } .mini .mini-art svg { width: 100%; height: auto; display: block; }
  .mini .picks { display: flex; gap: 6px; flex: none; }
  .mini .btn.round { --t: var(--c, var(--sc-accent)); background: color-mix(in srgb, var(--t) 16%, transparent); }
  .mini .btn.round.on { box-shadow: inset 0 0 0 2px var(--t); }
  .mini .btn.round .icon, .mini .btn.round ha-icon { color: color-mix(in srgb, var(--t) 70%, var(--primary-text-color)); --mdc-icon-size: 20px; }
  @container (max-width: 340px) {
    .tiles { --cols: 2; }
    .hero-art { width: 84px; }
    .big b { font-size: 24px; }
  }
  .big.none b { font-size: 20px; font-weight: 500; }
  @container (max-width: 300px) {
    .tile-head { flex-direction: column; align-items: flex-start; gap: 6px; }
    .tile .ripple { top: 23px; left: 23px; }
    .hero-art { width: 64px; }
    .big span { display: none; }
    .row { gap: 10px; }
    .row .btn span { display: none; }
    .row .btn { width: 36px; height: 36px; padding: 0; border-radius: 50%; flex: none; }
  }
  @container (max-width: 260px) {
    .mini .mini-art { display: none; }
  }
  @container (max-width: 200px) {
    .hero-art { display: none; }
    .tiles { --cols: 1; }
  }
`;

// ---------------------------------------------------------------------------
// The illustrated header: a living room on the right of a 90 px banner (wall, window on the sky, floor lamp and the
// card's own sofa-and-lamp drawing standing on a 10 px parquet strip edge to edge). The left of the banner is plain
// wall: the icon, the title and the subtitle sit there.
// ---------------------------------------------------------------------------

// Night picture: forced by illustration_theme, else Home Assistant's dark mode alone (a light theme keeps the day
// picture after sunset).
export const isNight = (hass, config) => {
  const theme = config.illustration_theme;
  if (theme === "night") return true;
  if (theme === "day") return false;
  return !!hass?.themes?.darkMode;
};

// Stars seen through the window at night (x, y, radius).
export const SC_STARS = [
  [69, 17, 0.55],
  [76, 30, 0.45],
  [84, 15, 0.5],
  [87, 34, 0.4],
  [70, 37, 0.45],
];

// The room, 200 × 80 (the floor is the strip under it). `uid` keeps each card's gradient ids apart on a page.
export const sceneSvg = (uid) => {
  const stars = SC_STARS.map(([x, y, r], i) => `<circle class="sc-star${i % 2 ? " tw" : ""}" cx="${x}" cy="${y}" r="${r}"/>`).join("");
  // The card's drawing (120 × 100, sofa legs down to y 90): 76 px high, its legs on the floor.
  const art = ART.replace("<svg ", '<svg class="sc-art" x="108" y="11.6" width="91.2" height="76" ');
  return `<svg class="sc-scene" viewBox="0 0 200 80" preserveAspectRatio="xMaxYMax meet" aria-hidden="true" focusable="false">
    <defs><radialGradient id="sc-glow-${uid}"><stop offset="0" stop-color="#ffd27a" stop-opacity=".75"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient></defs>
    <rect class="sc-skirting" x="0" y="77.4" width="200" height="2.6"/>
    <g class="sc-window" transform="translate(-16 0)">
      <rect class="sc-sky" x="64" y="11" width="28" height="30" rx="1.5"/>
      <g class="sc-day"><circle class="sc-sun" cx="84" cy="20" r="3.4"/><path class="sc-cloud" d="M67 31a2.4 2.4 0 0 1 3.6-2 3 3 0 0 1 5.6.8 1.8 1.8 0 0 1 .3 3.6H68.4a1.8 1.8 0 0 1-1.4-2.4Z"/></g>
      <g class="sc-night">${stars}<path class="sc-moon" d="M83 16.4a3.6 3.6 0 1 0 3.2 5.4 2.9 2.9 0 1 1-3.2-5.4Z"/></g>
      <rect class="sc-frame" x="64" y="11" width="28" height="30" rx="1.5"/><path class="sc-bar" d="M78 11V41M64 26H92"/>
      <rect class="sc-sill" x="61.5" y="41" width="33" height="2.2" rx="1"/>
      <path class="sc-curtain" d="M58 9h7v36q-4 1-7 0Z"/><path class="sc-curtain" d="M91 9h7v36q-3 1-7 0Z"/><rect class="sc-rod" x="55" y="7.6" width="46" height="1.6" rx=".8"/>
    </g>
    <g class="sc-floorlamp" transform="translate(-12 0)">
      <circle class="sc-halo" cx="113" cy="40" r="15" fill="url(#sc-glow-${uid})"/>
      <path class="sc-lamplight" d="M107.6 45h10.8l7 32h-24.8Z"/>
      <rect class="sc-pole" x="112.3" y="44" width="1.4" height="34"/><ellipse class="sc-pole" cx="113" cy="79" rx="5" ry="1.2"/>
      <path class="sc-shade" d="M108.4 35h9.2l2.6 10h-14.4Z"/>
    </g>
    ${art}
  </svg>`;
};

export const BANNER_STYLE = `
  .banner { position: relative; overflow: hidden; height: 90px; color: #2a2522; background: #f4ede3; }
  .banner.night { color: #fff; background: #2a2f3d; }
  .sc-scene { position: absolute; right: 0; bottom: 10px; height: 80px; width: min(200px, 62%); }
  /* The floor: a parquet strip edge to edge under the whole banner. */
  .sc-ground { position: absolute; left: 0; right: 0; bottom: 0; height: 10px;
               background: repeating-linear-gradient(90deg, #c99a6b 0 38px, #b98a5c 38px 40px); box-shadow: inset 0 2px 0 #a97c50; }
  .night .sc-ground { background: repeating-linear-gradient(90deg, #4a3a2c 0 38px, #3e3024 38px 40px); box-shadow: inset 0 2px 0 #5c4836; }
  .sc-skirting { fill: #e6d9c6; } .night .sc-skirting { fill: #353b4b; }
  .sc-sky { fill: #bfe0f7; } .night .sc-sky { fill: #1b2f52; }
  .sc-frame { fill: none; stroke: #fff; stroke-width: 1.6; } .night .sc-frame { stroke: #4a5568; }
  .sc-bar { stroke: #fff; stroke-width: 1; } .night .sc-bar { stroke: #4a5568; }
  .sc-sill { fill: #fff; } .night .sc-sill { fill: #4a5568; }
  .sc-curtain { fill: color-mix(in srgb, #7e57c2 30%, #f4ede3); } .night .sc-curtain { fill: color-mix(in srgb, #7e57c2 35%, #2a2f3d); }
  .sc-rod { fill: #b98a5c; } .night .sc-rod { fill: #5c4836; }
  .sc-night, .night .sc-day { display: none; } .night .sc-night { display: inline; }
  .sc-sun { fill: #ffd65a; } .sc-cloud { fill: #fff; opacity: .9; animation: sc-drift 6s ease-in-out infinite alternate; }
  .sc-star { fill: #fff; } .sc-star.tw { animation: sc-twinkle 3s ease-in-out infinite alternate; } .sc-moon { fill: #f3eed2; }
  .sc-pole { fill: #8a8f98; } .night .sc-pole { fill: #6b7280; }
  .sc-shade { fill: #e8e0d0; } .night .sc-shade { fill: #8c8578; }
  .sc-lamplight, .sc-halo { opacity: 0; transition: opacity .4s ease; }
  /* A scene on: the floor lamp shines, the card's pendant light breathes. */
  .banner.on .sc-shade { fill: #ffcf6e; } .banner.on .sc-lamplight { fill: #ffe082; opacity: .35; } .banner.on .sc-halo { opacity: .8; }
  .banner.night.on .sc-lamplight { opacity: .22; } .banner.night.on .sc-halo { opacity: 1; }
  .banner.on .sc-art .a-light { animation: sc-breathe 3.6s ease-in-out infinite alternate; }
  .banner.night.on .sc-art { filter: drop-shadow(0 0 4px rgba(255, 210, 122, .35)); }
  /* No scene on: the room is greyed and its lamps are off, as the hero's drawing. */
  .banner:not(.on) .sc-art { filter: grayscale(1); opacity: .5; } .banner:not(.on) .sc-art .a-light { display: none; }
  .night:not(.on) .sc-art { opacity: .4; }
  /* The icon (40 px), the title and the subtitle, on the wall at the left (over the scene's empty left edge, never its
     window). */
  .htext { position: absolute; left: 12px; top: 6px; bottom: 16px; right: calc(min(200px, 62%) - 8px); display: flex; align-items: center; gap: 10px; min-width: 0; }
  .banner .type-icon { background: rgba(255,255,255,.62); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--sc-tint) 22%, transparent); }
  .banner.night .type-icon { background: rgba(255,255,255,.12); box-shadow: inset 0 0 0 1px rgba(255,255,255,.14); }
  /* The icon's color is the status: accent with a scene on or a script running, grey at rest, red when unavailable. */
  .banner .type-icon .icon { fill: var(--sc-tint); }
  .banner.night .type-icon .icon { fill: color-mix(in srgb, var(--sc-tint) 60%, #fff); }
  .banner .type-icon.idle { --sc-tint: #8a8f98; }
  .htext .titles { display: flex; flex-flow: row wrap; align-items: center; column-gap: 8px; row-gap: 1px; }
  .htext .titles > * { flex: 1 0 100%; min-width: 0; }
  /* The title, then its status pill 8 px after it, centred on it, while the whole title and the pill's whole label
     fit on that row; otherwise (measured by the card, see _fitPill) the pill on its own line under the subtitle
     (.below), its dot alone (.pill-dot) when even then the text would run into the floor strip. */
  .htext .trow { display: flex; align-items: center; gap: 8px; min-width: 0; }
  .htext .name { flex: 0 1 auto; min-width: 0; font-weight: 600; }
  .htext .sub { font-size: 13px; color: #5d544b; } .night .htext .sub { color: rgba(255,255,255,.78); }
  .htext .chip { flex: none; max-width: none; line-height: 16px;
                 background: color-mix(in srgb, var(--c) 18%, rgba(255,255,255,.78)); color: color-mix(in srgb, var(--c) 45%, #0d2a45); }
  .night .htext .chip { background: color-mix(in srgb, var(--c) 30%, rgba(8,18,38,.55)); color: color-mix(in srgb, var(--c) 35%, #ffffff); }
  .htext .chip .dot { width: 7px; height: 7px; }
  .htext .titles.below { display: flex; }
  .htext .titles.below .trow { display: contents; }
  .htext .titles.below .name { flex: 1 0 100%; }
  .htext .titles.below .sub { order: 1; }
  .htext .titles.below .chip { order: 2; max-width: 100%; margin-top: 2px; }
  .htext .titles.pill-dot .chip { padding: 5px; }
  /* Narrower still: only the pill's coloured dot, on the title line (its text stays its tooltip and label). */
  @container (max-width: 200px) { .htext .chip { padding: 5px; } .htext .chip .chip-text { display: none; } }
  /* The detail button of the mini card: round, frosted, in the top right corner of the banner. */
  .banner .zoom { position: absolute; z-index: 2; top: 5px; right: 5px; margin: 0; color: #33506b; background: rgba(255,255,255,.55);
                  box-shadow: inset 0 0 0 1px rgba(255,255,255,.7); backdrop-filter: blur(4px); }
  .banner .zoom:hover { background: rgba(255,255,255,.75); color: #33506b; }
  .banner.night .zoom { color: #fff; background: rgba(255,255,255,.12); box-shadow: inset 0 0 0 1px rgba(255,255,255,.2); }
  .banner.night .zoom:hover { background: rgba(255,255,255,.22); color: #fff; }
  .banner + .content { padding-top: 12px; }
  @keyframes sc-breathe { from { opacity: .4; } to { opacity: .75; } }
  @keyframes sc-twinkle { from { opacity: .3; } to { opacity: 1; } }
  @keyframes sc-drift { to { transform: translateX(2px); } }
  /* Narrow card: no room for the room beside the text, the wall alone stays. */
  @container (max-width: 300px) { .sc-scene { display: none; } .htext { right: 34px; } }
`;
