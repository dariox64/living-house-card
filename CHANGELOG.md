# Changelog

## 0.3.0 – Ready-made houses

### New
- `preset:` option – pick one of 8 ready-made houses (2 or 3 bedrooms, with or without basement and attic) with the picture, labels, room outlines and TV screen already in place. Just add entities to rooms by `id`.
- Visual editor: pick the house from a dropdown and choose lights, temperature, humidity and TV for each room – no YAML needed.
- Rooms in a preset can be renamed, re-iconed or removed (`hide: true`); room names follow the UI language (EN/PL).
- Tall houses are shown bigger: semi-transparent ▲▼ arrows (or mouse wheel / swipe) move the view one floor up or down (`scroll_floors`). Idea: Arkadiusz Piotr Piasecki.
- Demo: switch between all houses (`?house=basement`).

## 0.2.2 – 3D printer

### Fixes
- Printer pause/resume/stop buttons were hidden (button entities report `unknown` until pressed).
- Home status panel compacts itself when space is short, so the last row is never cut off; weather text stays on one line.


### New
- New device `printer` in `living-rooms-card`: glowing progress ring, time left and finish time, layer, task name, nozzle/bed temperatures, model preview ↔ live camera, AMS filament colours, chamber light, pause/resume/stop (stop asks first).
- `living-house-card`: optional `printer:` row in the home status panel ("Printing 45% · 1 h 12 min").
- Rooms tiles show "Printing 45%", "Print done" and a failed-print alert.
- Room `image` can be a `camera.*` or `image.*` entity.
- Rooms without climate put devices in the wide middle column.

## 0.1.0 – first public beta

- `living-house-card`: 3D house with live labels, per-room darkening (light weights), LED colour, TV glow and screen blackout, day/night sky, weather effects with last-known fallback, heat map, room zoom with device panel, frosted glass panels (weather, status, heating, air, energy), configurable scenes (incl. relative temperature), fit-to-screen, tablet screensaver.
- Calibration mode: drag labels, draw room/TV outlines, set zoom point, copy YAML.
- `living-rooms-card`: photo mosaic with automatic layout, live tiles (dim when dark), alerts, room view with lights (brightness, colour, kelvin), thermostat dials, media, sensors, devices (purifier, pet feeder, litter box, washer, dryer), 24 h chart, room tabs, fit-to-screen.
- Polish and English.
