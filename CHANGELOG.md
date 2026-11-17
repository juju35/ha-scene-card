# Changelog

## 1.2.0 - 2026-11-17

### Features
- Illustrated header on the full and the mini card (90 px): a living room on the right — window on the sky, floor lamp and the card's sofa-and-lamp drawing on a 10 px parquet strip edge to edge — lit with a breathing lamp while a scene is active, greyed with its lamps off otherwise; day and night pictures (stars and moon in the window). The header icon's color follows the status: accent with a scene active or a script running, grey at rest, red when every scene and script is unavailable.
- New options `illustration` (`false` keeps the classic header) and `illustration_theme` (`auto`: night when `sun.sun` is below the horizon or with the dark theme, even while the sun is up; `day`, `night`), in both visual editors.
- A status pill right after the title on every header, in the header icon's colour: the scripts running, else *Active* (the subtitle then names the scenes without repeating it), *Unavailable* or *Idle*; under the subtitle on a narrow card, only its dot below 200 px. The mini card's detail button is the small frosted round button in the banner's top right corner.

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
