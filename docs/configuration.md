# Configuration

Both cards live in one file: `living-house-card.js`. Use them in a **Panel** view (full width) for the best effect.

- [`living-house-card`](#living-house-card) – the 3D house
- [`living-rooms-card`](#living-rooms-card) – room tiles + room views
- [Scenes](#scenes) · [Room geometry](#room-geometry) · [Tablet mode](#tablet-mode)

All positions are **percentages of the picture** (0–100), so they work at any screen size.

---

## living-house-card

| Option | Type | Default | Description |
|---|---|---|---|
| `image` | string | – | **Required.** Your 3D house picture, e.g. `/local/living-house/house.webp`. |
| `title` / `subtitle` | string | `Living House` / `Smart Home` | Header text. |
| `language` | `pl` \| `en` | HA language | UI language. |
| `weather` | entity | – | `weather.*` entity (panel + sky/rain/snow effects). |
| `weather_fallback_temperature` | entity | – | Sensor used when the weather service is down. |
| `sun` | entity | `sun.sun` | Drives day/night. |
| `location` | string | HA location name | Text under the weather. |
| `alarm` | entity | – | `alarm_control_panel.*` for the status panel. |
| `ventilation` | entity | – | Fan/switch shown in the status panel. |
| `purifier` / `purifier_name` | entity / string | – | Air purifier (`fan.*`) with a power button. |
| `pm25` | entity | – | PM2.5 sensor (air quality). |
| `energy` | object | – | `{ power, today, cost, currency }` – power in W or kW, today in kWh. Shows a 24 h sparkline. |
| `printer` | object | – | `{ status, progress, remaining, page, name }` – adds a 3D printer row to the status panel (“Printing 45% · 1 h 12 min”). `page` opens that room on the rooms dashboard. |
| `main_thermostat` | entity | – | Used by the status panel and the screensaver. |
| `heating` | list | `[]` | `- entity: climate.x` + optional `name`, `icon`. |
| `rooms_page` | path | – | Path of your rooms dashboard, e.g. `/my-rooms/rooms`. Adds the *Rooms* tab and *Open room* buttons. |
| `nav` | list | auto | Header tabs: `- name, icon, navigate: /path` or `more_info: entity`, `active: true`. |
| `scenes` | list | `[]` | Scene buttons, see [Scenes](#scenes). |
| `rooms` | list | `[]` | See below. |
| `fit` | bool | `true` | Scale to the window without scrolling (laptop/tablet). |
| `tilt` | bool | `true` | Subtle 3D tilt that follows the mouse. |
| `zoom` | number | `2.1` | Zoom level when a room is opened. |
| `weather_fx` | bool | `true` | Rain, snow, clouds, fog, lightning. |
| `heatmap_range` | `[min, max]` | `[16, 26]` | Temperature range of the heat map. |
| `screensaver_minutes` | number | `0` | `0` = 3 min only when the URL has `?kiosk` or `?tablet`. |
| `editor` | bool | `true` | Show the calibration button (admins only). |

### Rooms (house card)

```yaml
rooms:
  - id: upstairs          # a floor label (just a pill)
    label: true
    name: Upstairs
    chip: { x: 2, y: 10, w: 16, h: 7.5 }

  - id: living
    name: Living room
    icon: mdi:sofa-outline
    chip: { x: 63, y: 72, w: 15, h: 10 }        # label position/size (%)
    temperature: sensor.living_temperature       # sensor.* or climate.* (current_temperature)
    humidity: sensor.living_humidity
    humidity_on_chip: false                      # keep humidity only in the room panel
    heating: [climate.living_room]               # pulsing dot + "heating" while hvac_action = heating
    presence: binary_sensor.living_presence      # shown when there is no temperature
    icon_follows_light: true                     # label icon becomes a bulb (on/off)
    lights:
      - light.living_ceiling                     # weight 1
      - entity: light.living_led
        weight: 0.4                              # LEDs light the room less
    tv:
      entities: [media_player.living_tv]         # glow while on/playing/paused
      glow: { x: 76, y: 66, w: 40, h: 34 }       # centre + size of the glow
      screen: [[73.7, 57.6], [84.3, 62.2], [84.3, 69.5], [73.7, 64.8]]   # TV screen outline (goes black when off)
    shape: [[44, 80], [48, 72], [62, 68], [78, 56], [96, 45], [96, 76], [67, 95]]   # room outline
    focus: { x: 71, y: 67 }                      # zoom target (default: centre of the outline)
    page: living                                 # room id on the rooms dashboard
    entities:                                    # room panel (default: lights, sensors, heating, TV)
      - light.living_ceiling
      - entity: climate.living_room
        name: Thermostat
```

> Tip: you don't have to type coordinates – use the [calibration mode](calibration.md).

---

## living-rooms-card

| Option | Type | Default | Description |
|---|---|---|---|
| `rooms` | list | – | **Required.** |
| `home_path` | path | – | The big *Home* button (your house dashboard). |
| `title` | string | `Rooms` | Header title. |
| `language` | `pl` \| `en` | HA language | |
| `fit` | bool | `true` | No scrolling on laptops/tablets. |

```yaml
type: custom:living-rooms-card
home_path: /my-home/home
rooms:
  - id: living                          # used in the URL: /my-rooms/rooms#living
    name: Living room
    icon: mdi:sofa-outline
    image: /local/living-house/rooms/living.webp   # or a camera.* / image.* entity
    accent: "#f59e0b"                   # tile colour
    size: big                           # big | wide | tall | normal (first room = big)
    subtitle: Warm light. Good rest.
    temperature: sensor.living_temperature   # or climate.*
    humidity: sensor.living_humidity
    lights:
      - light.living_ceiling
      - entity: light.living_led
        name: LED strip
        icon: mdi:led-strip-variant
      - entity: fan.bathroom
        type: fan                       # spinning icon, not counted as a light
    climate:
      - entity: climate.living_room     # first = big dial
        type: main                      # main | ac (dial) · trv | floor (compact row)
      - entity: climate.living_floor
        type: floor
    media:
      - entity: media_player.living_tv
        volume_entity: media_player.lg_tv   # optional: control volume on another entity
      - entity: media_player.echo
        speaker: true                   # speaker: no TV glow/badge
    sensors:                            # type is detected from device_class, or set it:
      - binary_sensor.living_window     # window | leak | co | motion | battery | pm | aq
      - entity: sensor.purifier_pm25
        type: pm
    devices:
      - type: purifier
        entity: fan.air_purifier
        pm25: sensor.air_purifier_pm25
        filter: sensor.air_purifier_filter
      - type: pet_feeder
        status: sensor.feeder_status
        portions: number.feeder_manual_feed       # "Feed now" sets this number (asks first)
        switches: [switch.feeder_fast_mode]
      - type: litter_box
        status: sensor.litter_status
        clean: switch.litter_clean                 # or button.*
        switches: [switch.litter_night_mode]
      - type: washer
        status: sensor.washer_status               # off / standby / running / paused / alarm
        remaining: sensor.washer_remaining_time    # minutes
        temperature: select.washer_temperature
      - type: printer                              # 3D printer (Bambu Lab, or any printer via entity mapping)
        name: Bambu Lab A1
        status: sensor.printer_print_status        # running / pause / finish / failed / idle / prepare
        stage: sensor.printer_current_stage        # optional, e.g. heating_hotend
        progress: sensor.printer_print_progress    # %
        remaining: sensor.printer_remaining_time   # h / min / s
        end_time: sensor.printer_end_time          # optional timestamp
        layer: sensor.printer_current_layer
        total_layers: sensor.printer_total_layer_count
        task: sensor.printer_task_name
        nozzle: sensor.printer_nozzle_temperature
        nozzle_target: sensor.printer_nozzle_target_temperature
        bed: sensor.printer_bed_temperature
        bed_target: sensor.printer_bed_target_temperature
        image: image.printer_cover_image           # model preview
        camera: camera.printer_camera              # live view (refreshes every 8 s)
        light: light.printer_chamber_light
        pause: button.printer_pause
        resume: button.printer_resume
        stop: button.printer_stop                  # asks before stopping
        filaments:                                 # AMS slots – colour from the `color` attribute
          - sensor.printer_ams_1_tray_1
          - sensor.printer_ams_1_tray_2
      - type: dryer
        status: sensor.dryer_phase
        remaining: sensor.dryer_remaining_time
        program: select.dryer_program
        water_full: binary_sensor.dryer_tank_full
        filter: binary_sensor.dryer_clean_filter
```

The mosaic layout is automatic: it fills a 4-column grid and widens the last tiles so there are no gaps.

---

## Scenes

Scene buttons run any Home Assistant actions. `confirm` asks before running.

```yaml
scenes:
  - name: Night
    sub: Lights off
    icon: mdi:bed-outline
    color: "#c7d2fe"
    confirm: Turn off all lights?
    actions:
      - action: light.turn_off
        target: { entity_id: all }
  - name: Boost
    sub: +1 °C
    icon: mdi:fire
    color: "#fb7a3c"
    actions:
      - action: climate.set_temperature
        target: { entity_id: climate.living_room }
        data: { temperature: "+1" }      # relative to the current target
  - name: Movie
    icon: mdi:movie-open-outline
    actions:
      - action: script.movie_mode       # or just call your own script
```

## Room geometry

| Key | What it does |
|---|---|
| `chip` | Label rectangle `{x, y, w, h}` in % of the picture. |
| `shape` | Room outline (list of `[x, y]`, at least 3 points). Needed for darkening and LED colour. |
| `glow` | Warm glow ellipse `{x, y, w, h}` (centre + size). Defaults to the outline box. |
| `focus` | Zoom target `{x, y}`. |
| `tv.screen` | TV screen outline – blacked out when the TV is off. |

## Tablet mode

Open the dashboard with `?kiosk` (needs [kiosk-mode](https://github.com/NemesisRE/kiosk-mode) to hide HA's header and sidebar):

```
http://homeassistant.local:8123/my-home/home?kiosk
```

After 3 minutes without touch a clock screensaver appears (`screensaver_minutes` to change).
