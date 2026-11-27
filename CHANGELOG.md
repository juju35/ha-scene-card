# Changelog

## 1.2.6 - 2026-11-27

### Fixes
- Idle states use the theme's secondary text colour (`--secondary-text-color`), like every ha-* card.

## 1.2.5 - 2026-11-24

### Maintenance
- The card source is split into ES modules: `src/` (entry `src/index.js`), cut at its sections, with the translations in one file per language (`i18n/<lang>.js`). `scripts/bundle.mjs` concatenates them back, in their original order, into the same single file and per-language files as before; the tests evaluate that bundle.

## 1.2.4 - 2026-11-22

### Performance
- Card picker: the previews are back (`preview: true`), and light. Each card's preview is drawn only once it scrolls into view of Home Assistant's card picker, which otherwise builds the preview of every card at once: until then it holds Home Assistant's state (no render, no history request, no animation). On a dashboard or in the card editor the card is drawn as before.

## 1.2.3 - 2026-11-22

### Performance
- Card picker: the cards no longer ask Home Assistant for a live preview (`preview: false` in `window.customCards`). The picker drew every card at once (history requests, animations), which made the list slow to open; it now shows each card's description instead.

## 1.2.2 - 2026-11-20

### Fixes
- An unavailable scene reads "Unavailable" and its tile (and its mini-card button) is disabled, instead of offering an activation that could only fail and saying "Never".
- Visual editor: `scenes` / `scripts` written in YAML as objects (`entity`, `name`, `icon`, `color`) are no longer shown in an entity picker that would drop them on the next change; the field is hidden (YAML only) and comes back for plain entity lists.
- Mini card: the scene buttons follow the area picked in the expanded view, like the active-scene lines above them.

### Performance
- The active scene is found in one pass over the scenes (the last activation per light) instead of comparing every pair of scenes, on every light change.
- The entity ids are listed once per state update and shared by every card and call, instead of a full scan of the states each time.

### Maintenance
- CI: npm downloads cached (validate, release, screenshots); the screenshots job no longer installs the unused `gh` package.

## 1.2.1 - 2026-11-18

### Fixes
- Illustrated header: `auto` now follows the Home Assistant theme alone — a light theme keeps the day picture after sunset, a dark theme still shows the night one.

## 1.2.0 - 2026-11-17

### Features
- Illustrated header on the full and the mini card (90 px): a living room on the right — window on the sky, floor lamp and the card's sofa-and-lamp drawing on a 10 px parquet strip edge to edge — lit with a breathing lamp while a scene is active, greyed with its lamps off otherwise; day and night pictures (stars and moon in the window). The header icon's color follows the status: accent with a scene active or a script running, grey at rest, red when every scene and script is unavailable.
- New options `illustration` (`false` keeps the classic header) and `illustration_theme` (`auto`: night when `sun.sun` is below the horizon or with the dark theme, even while the sun is up; `day`, `night`), in both visual editors.
- A status pill right after the title on every header, in the header icon's colour: the scripts running, else *Active* (the subtitle then names the scenes without repeating it), *Unavailable* or *Idle*; it stays beside the title only while the whole title and the pill's whole label fit on that row (measured in the real fonts, so in every language), otherwise it takes its own line under a one-line subtitle, keeping only its dot when even that would not fit above the floor strip and on a card of 200 px or less (banner and classic header). The mini card's detail button is the small frosted round button in the banner's top right corner.

### Fixes
- The header pill, the subtitle and the hero no longer say the same thing: with the hero shown, the subtitle stays empty (the hero names the active scene), and "active" beside the scene's name only while the pill says something else (a script running). Without the hero, the subtitle still names the active scene.

## 1.1.0 - 2026-11-16

### Features
- New look, common to the other cards: a hero with an illustration (the active scene, its area and when it was activated, its lights on, the running scripts), scenes as tiles tinted in their color when active, scripts as rows with a ring while they run and Run / Stop buttons.
- The mini card shows the illustration next to its lines.
- New option `show_hero`.

### Fixes
- SmartThings scenes: their numeric icon codes are no longer shown as icons, and their own color tints the tile.
- Philips Hue scenes on a room or zone without an area: the active scene is found from the lights of the room's device, or of the area named as the group; deCONZ and other scenes without members use the lights of their area.
- Lutron Caséta, Velux and Hunter Douglas PowerView listed among the supported integrations.
- The hero follows the area filter and `show_scripts: false`; a long scene name ends with an ellipsis; the hero uses the scene's own icon.
- The count of lights on only counts the lights a scene sets (a light group by its members), never those of its area.
- The mini card keeps its scene buttons on narrow cards, on a row of their own.
- A running script is shown in the card's accent everywhere; very light SmartThings colors are darkened so their icon stays readable; "No active scene" no longer shown twice.

## 1.0.0 - 2026-11-16

First release.

### Features
- **Scene Card** (`custom:scene-card`): scenes in a grid of tiles launched with a tap, the active scene highlighted, when each was last activated; scripts with their running state, last run and a run or stop button; a filter by area.
- **Scene Mini Card** (`custom:scene-mini-card`): compact view with the active scene, the running scripts and the first scenes as buttons; the detail button switches to the full card.
- Every scene integration (Home Assistant, Philips Hue with its smart scenes, deCONZ, LIFX, SmartThings, Tuya, Overkiz, KNX…); icons from Home Assistant, the card or the scene's name.
- Animations of a scene launched (ripple) and a script running (turning arc).
- Visual editor for both cards; light and dark themes; 22 languages, English in the bundle and every other language in its own file loaded on demand.
