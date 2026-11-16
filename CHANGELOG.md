# Changelog

## 1.1.0 - 2026-11-16

### Features
- New look, common to the other cards: a hero with an illustration (the active scene, its area and when it was activated, its lights on, the running scripts), scenes as tiles tinted in their color when active, scripts as rows with a ring while they run and Run / Stop buttons.
- The mini card shows the illustration next to its lines.
- New option `show_hero`.

### Fixes
- SmartThings scenes: their numeric icon codes are no longer shown as icons, and their own color tints the tile.
- Philips Hue scenes on a room or zone without an area: the active scene is found from the lights of the room's device, or of the area named as the group; deCONZ and other scenes without members use the lights of their area.
- Lutron Caséta, Velux and Hunter Douglas PowerView listed among the supported integrations.

## 1.0.0 - 2026-11-16

First release.

### Features
- **Scene Card** (`custom:scene-card`): scenes in a grid of tiles launched with a tap, the active scene highlighted, when each was last activated; scripts with their running state, last run and a run or stop button; a filter by area.
- **Scene Mini Card** (`custom:scene-mini-card`): compact view with the active scene, the running scripts and the first scenes as buttons; the detail button switches to the full card.
- Every scene integration (Home Assistant, Philips Hue with its smart scenes, deCONZ, LIFX, SmartThings, Tuya, Overkiz, KNX…); icons from Home Assistant, the card or the scene's name.
- Animations of a scene launched (ripple) and a script running (turning arc).
- Visual editor for both cards; light and dark themes; 22 languages, English in the bundle and every other language in its own file loaded on demand.
