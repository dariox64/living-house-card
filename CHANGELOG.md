# Changelog

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
