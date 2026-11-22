/*! Living House Card v0.4.3 | MIT License | https://github.com/krystianokris/living-house-card */
(() => {
"use strict";
/* ---------- Living House Card – shared helpers ---------- */
const LHC_VERSION = "0.4.3";
const LHC_BAD = ["unknown", "unavailable", undefined, null, ""];
const LHC_TV_ON = ["on", "playing", "paused", "buffering"];

const lhcEsc = (x) => String(x ?? "").replace(/[&<>"]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
// `image: lhc:<name>` -> photo embedded in this file (my-house/web/<name>.jpg)
const lhcImg = (s) => { const m = /^lhc:(.+)$/.exec(String(s ?? "")); return m && typeof LHC_EMBEDDED !== "undefined" && LHC_EMBEDDED[m[1]] ? LHC_EMBEDDED[m[1]] : s; };
const lhcArr = (x) => (x == null ? [] : Array.isArray(x) ? x : [x]);
const lhcUniq = (a) => [...new Set(a.filter(Boolean))];

/* "#f59e0b" | "245,158,11" | [245,158,11] -> "245,158,11" */
function lhcRgb(c, fallback = "96,165,250") {
  if (!c) return fallback;
  if (Array.isArray(c)) return c.join(",");
  const s = String(c).trim();
  const m = s.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (m) {
    let h = m[1];
    if (h.length === 3) h = h.split("").map((x) => x + x).join("");
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)).join(",");
  }
  return /^\d+\s*,\s*\d+\s*,\s*\d+$/.test(s) ? s.replace(/\s/g, "") : fallback;
}

/* ---------- i18n ---------- */
const lhcPlPlural = (n, one, few, many) => (n === 1 ? one : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? few : many);

const LHC_I18N = {
  en: {
    floor_up: "Floor up", floor_down: "Floor down",
    nav_home: "Home", nav_rooms: "Rooms", nav_energy: "Energy",
    search: "Search", settings: "Settings", add_scene: "Add scene",
    dn_auto: "Day/night: automatic", dn_day: "Forced day", dn_night: "Forced night",
    status_title: "Home status", all_ok: "All good", alarm_bang: "Alarm!",
    offline: (n) => `${n} ${n === 1 ? "device" : "devices"} offline`,
    lights: "Lights", lights_on: (n) => `${n} on`, all_off: "All off",
    heating: "Heating", heating_active: (n) => `${n} active`, inactive: "Inactive",
    ventilation: "Ventilation", running: "Running", off_f: "Off", no_data: "No data",
    security: "Security", air_quality: "Air quality",
    aq_good: "Good", aq_moderate: "Moderate", aq_unhealthy: "Unhealthy", aq_bad: "Poor",
    off_short: "off", heating_to: (t) => `heating → ${t}°`, target: (t) => `target ${t}°`, idle: "idle",
    air: "Air", purifier_off: "Off", none: "None", toggle_power: "Turn on / off",
    energy: "Energy", home_sfx: "(home)", today: "Today", cost_today: "Cost today",
    stale: "last known", stale_tip: "Weather service is not responding right now",
    occupied: "occupied", free: "free", n_on: (n) => `${n} on`,
    heatmap: "Heat map", lights_on_title: "Lights on", heating_tag: "heating",
    all_off_btn: "Turn all off", all_on_btn: "Turn all on", open_room: "Open room",
    no_entity: "missing entity", on_short: "on", detected: "detected", clear: "clear",
    no_devices: "No devices assigned to this room.",
    at_home: "inside", lights_count: (n) => (n === 1 ? "light" : "lights"), tap_return: "Tap to return",
    configure: "Add an image and rooms in the card configuration – or open the calibration mode.",
    // editor
    ed_title: "Calibration", ed_hint: "Drag labels to move them, drag the corner to resize. Select a room to draw its outline.",
    ed_shape: "Draw outline", ed_focus: "Zoom point", ed_screen: "TV screen", ed_undo: "Undo point", ed_done: "Finish",
    ed_copy: "Copy YAML", ed_copied: "Copied! Paste it into the card config (rooms:)", ed_close: "Close",
    ed_drawing: "Click on the image to add points. Finish when done.", ed_focus_hint: "Click the point the camera should zoom into.",
    ed_yaml_manual: "Copy the YAML below (Ctrl+C) and paste it into the card configuration:",
    // weather
    w: { "clear-night": "Clear", cloudy: "Cloudy", exceptional: "Exceptional", fog: "Fog", hail: "Hail", lightning: "Thunderstorm", "lightning-rainy": "Storm & rain", partlycloudy: "Partly cloudy", pouring: "Pouring", rainy: "Rain", snowy: "Snow", "snowy-rainy": "Sleet", sunny: "Sunny", windy: "Windy", "windy-variant": "Windy" },
    alarm: { armed_home: "Armed (home)", armed_away: "Armed", armed_night: "Armed (night)", armed_vacation: "Armed (vacation)", armed_custom_bypass: "Armed", disarmed: "Disarmed", arming: "Arming…", pending: "Pending…", triggered: "ALARM!" },
    media: { playing: "playing", paused: "paused", buffering: "buffering", on: "on", idle: "idle", off: "off", standby: "standby", unavailable: "offline" },
    // rooms card
    rooms_title: "Rooms", home: "Home", all_rooms: "All rooms",
    lights_n: (n) => `${n} ${n === 1 ? "light" : "lights"} on`, dark: "All dark", everything_ok: "Everything is fine",
    sec_lights: "Lights", sec_climate: "Climate", sec_media: "Media", sec_devices: "Devices", sec_sensors: "Sensors", sec_chart: "Last 24 hours",
    turn_off_all: "Turn all off", turn_on_all: "Turn all on",
    st_on: "On", st_off: "Off", st_running: "Running", st_offline: "offline",
    warm: "Warm", neutral: "Neutral", cool: "Cool",
    hvac: { heat: "Heat", cool: "Cool", auto: "Auto", heat_cool: "Auto", off: "Off", dry: "Dry", fan_only: "Fan" },
    action: { heating: "heating", cooling: "cooling", idle: "idle", off: "off", drying: "drying", fan: "fan" },
    now: (t) => `now ${t}°`, off_big: "Off",
    window_open: (n) => `${n} open`, open: "Open", closed: "Closed", leak: "LEAK!", dry: "Dry", co: "CO!", safe: "Safe",
    motion: "Motion", no_motion: "No motion", water_leak: "Water leak!", waterbox_full: "Water tank full",
    washer_alarm: "Washer: alarm", purifier: "Air purifier", manual: (p) => `Manual · ${p}%`, filter: "Filter",
    pm_unit: "PM2.5 µg/m³", feeder: "Pet feeder", feed_now: "Feed now", portions: (n) => (n === 1 ? "portion" : "portions"),
    feed_confirm: (n) => `Dispense ${n} ${n === 1 ? "portion" : "portions"}?`, litter: "Litter box", clean: "Clean",
    clean_confirm: "Start cleaning the litter box?", washer: "Washer", dryer: "Dryer",
    appl_offline: "Offline – unplugged or no Wi-Fi", min_left: "min left", empty_filter: "Clean the filter",
    loading_history: "Loading history…", no_history: "No history.", no_history_day: "No data from the last 24 h.",
    temperature: "Temperature", humidity: "Humidity", h24: "24 h ago", h18: "18 h", h12: "12 h", h6: "6 h", h0: "now",
    washer_st: { off: "Off", standby: "Standby", running: "Washing", paused: "Paused", alarm: "Alarm!" },
    dryer_st: { idle: "Idle", delay_start_waiting: "Delayed start", running: "Drying", anti_crease: "Anti-crease", finished: "Done" },
    feeder_st: { standby: "Ready", feeding: "Feeding…", feeding_complete: "Fed", fault: "Error" },
    litter_st: { standby: "Clean & ready", cleaning: "Cleaning…", working: "Working", full: "Full!", fault: "Error", caking: "Waiting to clean", occupied: "Cat inside", blocked: "Entrance blocked", off: "Off" },
    preset: { auto: "Auto", sleep: "Sleep", turbo: "Turbo", manual: "Manual" },
    aq_states: { excellent: "Excellent", good: "Good", moderate: "Moderate", poor: "Poor", very_poor: "Very poor" },
    dry_prog: { auto: "Auto", allergy_care: "Allergy care", refresh: "Refresh", sportswear: "Sportswear", towels: "Towels", time: "Timed", cotton: "Cotton", baby_care: "Baby care", synthetic: "Synthetics", wool: "Wool", delicates: "Delicates", quick_30: "Quick 30", shirts: "Shirts", bedding: "Bedding", down: "Down", eco: "Eco" },
    cold: "cold",
    printer: "3D printer", pr_model: "Model", pr_camera: "Camera", pr_layer: "Layer", pr_nozzle: "Nozzle", pr_bed: "Bed",
    pr_ends: (t) => `ends ${t}`, pr_left: "left", pr_pause: "Pause", pr_resume: "Resume", pr_stop: "Stop",
    pr_stop_confirm: "Stop the print? This cannot be undone.", pr_printing: (p) => `Printing ${p}%`, pr_failed: "Print failed!",
    pr_done: "Print done", pr_light: "Chamber light", pr_empty: "empty",
    pr_status: { running: "Printing", pause: "Paused", finish: "Done", failed: "Failed", idle: "Idle", prepare: "Preparing", slicing: "Slicing", init: "Starting", offline: "Offline", unknown: "—" },
    pr_stage: { heating_hotend: "Heating nozzle", heatbed_preheating: "Heating bed", auto_bed_leveling: "Bed levelling", changing_filament: "Changing filament", cleaning_nozzle_tip: "Cleaning nozzle", homing_toolhead: "Homing", filament_loading: "Loading filament", filament_unloading: "Unloading filament", inspecting_first_layer: "Checking first layer", calibrating_extrusion_flow: "Flow calibration", cooling_nozzle: "Cooling nozzle", paused_filament_runout: "Filament ran out!", paused_nozzle_clog: "Nozzle clogged!", paused_user: "Paused by user" },
    tv: "TV", tv_playing: "playing", washing: "Washing", drying: "Drying", clean_air: "Clean air", of_lights: "lights",
    // cats card
    cats_title: "Cat corner", cats_kicker: "Cat corner · live",
    scene_ok: "All good – clean and fed", scene_cleaning: "The litter box is cleaning itself…", scene_litter: (n) => `${n || "The cat"} is in the litter box`,
    scene_eating: (n) => `${n || "The cat"} is eating`, scene_full: "The litter bin is full – empty it", scene_problem: "Litter box problem – check it",
    scene_sleep: "Night mode – quiet", bin_full: "Bin full!", litter_problem: "Litter box problem", visits_today: "Visits today",
    cat_weight: "Cat weight", time_today: "Time today", last_portion: "Last meal", quick_feed: "Quick feed",
    quick_confirm: "Dispense a quick meal?", just_now: "just now", min_ago: (m) => `${m} min ago`, h_ago: (h) => `${h} h ago`,
  },
  pl: {
    floor_up: "Piętro wyżej", floor_down: "Piętro niżej",
    nav_home: "Dom", nav_rooms: "Pomieszczenia", nav_energy: "Energia",
    search: "Szukaj", settings: "Ustawienia", add_scene: "Dodaj scenę",
    dn_auto: "Dzień/noc: automatycznie", dn_day: "Wymuszony dzień", dn_night: "Wymuszona noc",
    status_title: "Status domu", all_ok: "Wszystko OK", alarm_bang: "Alarm!",
    offline: (n) => `${n} ${lhcPlPlural(n, "urządzenie", "urządzenia", "urządzeń")} offline`,
    lights: "Światła", lights_on: (n) => `${n} ${lhcPlPlural(n, "włączone", "włączone", "włączonych")}`, all_off: "Wszystkie wyłączone",
    heating: "Ogrzewanie", heating_active: (n) => `${n} ${lhcPlPlural(n, "aktywne", "aktywne", "aktywnych")}`, inactive: "Nieaktywne",
    ventilation: "Wentylacja", running: "Pracuje", off_f: "Wyłączona", no_data: "Brak danych",
    security: "Bezpieczeństwo", air_quality: "Jakość powietrza",
    aq_good: "Dobra", aq_moderate: "Umiarkowana", aq_unhealthy: "Niezdrowa", aq_bad: "Zła",
    off_short: "wył.", heating_to: (t) => `grzeje → ${t}°`, target: (t) => `cel ${t}°`, idle: "czuwa",
    air: "Powietrze", purifier_off: "Wyłączony", none: "Brak", toggle_power: "Włącz / wyłącz",
    energy: "Energia", home_sfx: "(dom)", today: "Dziś", cost_today: "Koszt dziś",
    stale: "ostatnie dane", stale_tip: "Serwis pogody chwilowo nie odpowiada",
    occupied: "zajęte", free: "wolne", n_on: (n) => `${n} wł.`,
    heatmap: "Mapa ciepła", lights_on_title: "Włączone światła", heating_tag: "grzeje",
    all_off_btn: "Zgaś wszystkie", all_on_btn: "Zapal wszystkie", open_room: "Otwórz pokój",
    no_entity: "brak encji", on_short: "wł.", detected: "wykryto", clear: "brak",
    no_devices: "Brak przypisanych urządzeń w tym pomieszczeniu.",
    at_home: "w domu", lights_count: (n) => lhcPlPlural(n, "światło", "światła", "świateł"), tap_return: "Dotknij, aby wrócić",
    configure: "Dodaj obraz i pokoje w konfiguracji karty – albo otwórz tryb kalibracji.",
    ed_title: "Kalibracja", ed_hint: "Przeciągaj plakietki, róg zmienia rozmiar. Wybierz pokój, żeby narysować jego obrys.",
    ed_shape: "Rysuj obrys", ed_focus: "Punkt przybliżenia", ed_screen: "Ekran TV", ed_undo: "Cofnij punkt", ed_done: "Zakończ",
    ed_copy: "Kopiuj YAML", ed_copied: "Skopiowano! Wklej do konfiguracji karty (rooms:)", ed_close: "Zamknij",
    ed_drawing: "Klikaj na obrazku, żeby dodawać punkty. Na koniec „Zakończ”.", ed_focus_hint: "Kliknij miejsce, które ma być przybliżane.",
    ed_yaml_manual: "Skopiuj YAML poniżej (Ctrl+C) i wklej do konfiguracji karty:",
    w: { "clear-night": "Bezchmurnie", cloudy: "Zachmurzenie", exceptional: "Nietypowo", fog: "Mgła", hail: "Grad", lightning: "Burza", "lightning-rainy": "Burza z deszczem", partlycloudy: "Częściowe zachmurzenie", pouring: "Ulewa", rainy: "Deszcz", snowy: "Śnieg", "snowy-rainy": "Deszcz ze śniegiem", sunny: "Słonecznie", windy: "Wietrznie", "windy-variant": "Wietrznie" },
    alarm: { armed_home: "Uzbrojone (w domu)", armed_away: "Uzbrojone", armed_night: "Uzbrojone (noc)", armed_vacation: "Uzbrojone (urlop)", armed_custom_bypass: "Uzbrojone", disarmed: "Rozbrojone", arming: "Uzbrajanie…", pending: "Oczekiwanie…", triggered: "ALARM!" },
    media: { playing: "odtwarza", paused: "pauza", buffering: "buforuje", on: "włączony", idle: "bezczynny", off: "wyłączony", standby: "czuwanie", unavailable: "offline" },
    rooms_title: "Pomieszczenia", home: "Dom", all_rooms: "Pomieszczenia",
    lights_n: (n) => `${n} ${lhcPlPlural(n, "światło", "światła", "świateł")}`, dark: "Ciemno", everything_ok: "Wszystko w porządku",
    sec_lights: "Światła", sec_climate: "Klimat", sec_media: "Multimedia", sec_devices: "Urządzenia", sec_sensors: "Czujniki", sec_chart: "Ostatnie 24 godziny",
    turn_off_all: "Zgaś wszystkie", turn_on_all: "Zapal wszystkie",
    st_on: "Włączone", st_off: "Wyłączone", st_running: "Pracuje", st_offline: "offline",
    warm: "Ciepłe", neutral: "Neutralne", cool: "Zimne",
    hvac: { heat: "Grzanie", cool: "Chłodzenie", auto: "Auto", heat_cool: "Auto", off: "Wył.", dry: "Osuszanie", fan_only: "Wiatrak" },
    action: { heating: "grzeje", cooling: "chłodzi", idle: "czuwa", off: "wyłączone", drying: "osusza", fan: "wentyluje" },
    now: (t) => `teraz ${t}°`, off_big: "Wył.",
    window_open: (n) => `${n} otwarte`, open: "Otwarte", closed: "Zamknięte", leak: "WYCIEK!", dry: "Sucho", co: "CZAD!", safe: "Bezpiecznie",
    motion: "Wykryto", no_motion: "Brak ruchu", water_leak: "Wyciek wody!", waterbox_full: "Pełny pojemnik",
    washer_alarm: "Pralka: alarm", purifier: "Oczyszczacz", manual: (p) => `Ręczny · ${p}%`, filter: "Filtr",
    pm_unit: "PM2.5 µg/m³", feeder: "Karmnik", feed_now: "Nakarm teraz", portions: (n) => lhcPlPlural(n, "porcja", "porcje", "porcji"),
    feed_confirm: (n) => `Podać ${n} ${lhcPlPlural(n, "porcję", "porcje", "porcji")}?`, litter: "Kuweta", clean: "Sprzątnij",
    clean_confirm: "Uruchomić sprzątanie kuwety?", washer: "Pralka", dryer: "Suszarka",
    appl_offline: "Offline – wyłączona z prądu lub Wi-Fi", min_left: "min do końca", empty_filter: "Wyczyść filtr",
    loading_history: "Wczytywanie historii…", no_history: "Brak historii.", no_history_day: "Brak danych z ostatniej doby.",
    temperature: "Temperatura", humidity: "Wilgotność", h24: "24 h temu", h18: "18 h", h12: "12 h", h6: "6 h", h0: "teraz",
    washer_st: { off: "Wyłączona", standby: "Czuwanie", running: "Pierze", paused: "Pauza", alarm: "Alarm!" },
    dryer_st: { idle: "Bezczynna", delay_start_waiting: "Opóźniony start", running: "Suszy", anti_crease: "Przeciw zagnieceniom", finished: "Gotowe" },
    feeder_st: { standby: "Gotowy", feeding: "Karmi…", feeding_complete: "Nakarmiony", fault: "Błąd" },
    litter_st: { standby: "Czysta, gotowa", cleaning: "Sprzątanie…", working: "Pracuje", full: "Pełna!", fault: "Błąd", caking: "Czeka na sprzątanie", occupied: "Kot w środku", blocked: "Wejście zablokowane", off: "Wyłączona" },
    preset: { auto: "Auto", sleep: "Sen", turbo: "Turbo", manual: "Ręczny" },
    aq_states: { excellent: "Doskonała", good: "Dobra", moderate: "Umiarkowana", poor: "Słaba", very_poor: "Bardzo słaba" },
    dry_prog: { auto: "Auto", allergy_care: "Antyalergiczny", refresh: "Odświeżanie", sportswear: "Sportowe", towels: "Ręczniki", time: "Czasowy", cotton: "Bawełna", baby_care: "Dziecięce", synthetic: "Syntetyki", wool: "Wełna", delicates: "Delikatne", quick_30: "Szybki 30", shirts: "Koszule", bedding: "Pościel", down: "Puch", eco: "Eco" },
    cold: "zimna",
    printer: "Drukarka 3D", pr_model: "Model", pr_camera: "Kamera", pr_layer: "Warstwa", pr_nozzle: "Dysza", pr_bed: "Stół",
    pr_ends: (t) => `koniec ${t}`, pr_left: "do końca", pr_pause: "Pauza", pr_resume: "Wznów", pr_stop: "Stop",
    pr_stop_confirm: "Przerwać wydruk? Tego nie da się cofnąć.", pr_printing: (p) => `Drukuje ${p}%`, pr_failed: "Wydruk nieudany!",
    pr_done: "Wydruk gotowy", pr_light: "Oświetlenie komory", pr_empty: "pusty",
    pr_status: { running: "Drukuje", pause: "Pauza", finish: "Gotowe", failed: "Błąd", idle: "Bezczynna", prepare: "Przygotowanie", slicing: "Przygotowanie pliku", init: "Start", offline: "Offline", unknown: "—" },
    pr_stage: { heating_hotend: "Nagrzewanie dyszy", heatbed_preheating: "Nagrzewanie stołu", auto_bed_leveling: "Poziomowanie stołu", changing_filament: "Zmiana filamentu", cleaning_nozzle_tip: "Czyszczenie dyszy", homing_toolhead: "Bazowanie", filament_loading: "Ładowanie filamentu", filament_unloading: "Wyładowanie filamentu", inspecting_first_layer: "Kontrola 1. warstwy", calibrating_extrusion_flow: "Kalibracja przepływu", cooling_nozzle: "Chłodzenie dyszy", paused_filament_runout: "Skończył się filament!", paused_nozzle_clog: "Zatkana dysza!", paused_user: "Wstrzymane" },
    tv: "TV", tv_playing: "gra", washing: "Pierze", drying: "Suszy", clean_air: "Czyste", of_lights: "świateł",
    cats_title: "Kocia strefa", cats_kicker: "Kocia strefa · na żywo",
    scene_ok: "Wszystko gra – czysto i pełna miska", scene_cleaning: "Kuweta się sprząta…", scene_litter: (n) => `${n || "Kot"} jest w kuwecie`,
    scene_eating: (n) => `${n || "Kot"} je`, scene_full: "Pojemnik kuwety pełny – opróżnij", scene_problem: "Problem z kuwetą – sprawdź",
    scene_sleep: "Tryb nocny – cisza", bin_full: "Pojemnik pełny!", litter_problem: "Problem z kuwetą", visits_today: "Wizyty dziś",
    cat_weight: "Waga kota", time_today: "Czas dziś", last_portion: "Ostatni posiłek", quick_feed: "Szybkie karmienie",
    quick_confirm: "Podać szybki posiłek?", just_now: "przed chwilą", min_ago: (m) => `${m} min temu`, h_ago: (h) => `${h} h temu`,
  },
};

function lhcLang(hass, cfg) {
  const l = String((cfg && cfg.language) || (hass && ((hass.locale && hass.locale.language) || hass.language)) || "en").slice(0, 2).toLowerCase();
  return LHC_I18N[l] ? l : "en";
}
function lhcT(lang, key, arg) {
  const v = (LHC_I18N[lang] && LHC_I18N[lang][key]) ?? LHC_I18N.en[key];
  if (typeof v === "function") return v(arg);
  return v ?? key;
}
function lhcMap(lang, group, key, fallback) {
  const g = (LHC_I18N[lang] && LHC_I18N[lang][group]) || LHC_I18N.en[group] || {};
  return g[key] ?? fallback ?? key;
}

/* ---------- akcje (sceny) ----------
 * actions: [{ action: "light.turn_off", target: { entity_id: [...] }, data: {...} }]
 * data.temperature może być względna: "+1" / "-0.5" (liczona od obecnego celu termostatu).
 */
async function lhcRunActions(hass, actions) {
  for (const a of lhcArr(actions)) {
    const name = a.action || a.service || a.perform_action;
    if (!name || !name.includes(".")) continue;
    const [domain, service] = name.split(".");
    const data = { ...(a.data || a.service_data || {}) };
    const target = a.target ? { ...a.target } : undefined;
    if (typeof data.temperature === "string" && /^[+-]/.test(data.temperature)) {
      const ent = lhcArr((target && target.entity_id) || data.entity_id)[0];
      const st = ent && hass.states[ent];
      const base = Number(st && st.attributes.temperature);
      if (Number.isFinite(base)) {
        let v = base + parseFloat(data.temperature);
        const mn = st.attributes.min_temp, mx = st.attributes.max_temp;
        if (Number.isFinite(mn)) v = Math.max(mn, v);
        if (Number.isFinite(mx)) v = Math.min(mx, v);
        data.temperature = Math.round(v * 10) / 10;
      } else delete data.temperature;
    }
    await hass.callService(domain, service, data, target);
  }
}

function lhcNavigate(path) {
  history.pushState(null, "", path);
  window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace: false } }));
}

/* ---------- prosty generator YAML (dla trybu kalibracji) ---------- */
function lhcScalar(x) {
  if (x === null || x === undefined) return "null";
  if (typeof x === "number" || typeof x === "boolean") return String(x);
  const s = String(x);
  const plain = /^[A-Za-z_/][\w.\-/+:#%]*( [\w.\-/+:#%]+)*$/.test(s) && !/:\s/.test(s) && !/^(true|false|null|yes|no|on|off)$/i.test(s);
  return plain ? s : JSON.stringify(s);
}
function lhcYaml(v, ind = 0) {
  const pad = "  ".repeat(ind);
  const flat = (o) => o && typeof o === "object" && !Array.isArray(o) && Object.values(o).every((y) => typeof y === "number");
  if (Array.isArray(v)) {
    return v.map((x) => {
      if (Array.isArray(x)) return `${pad}- [${x.map(lhcScalar).join(", ")}]`;
      if (x && typeof x === "object") return `${pad}- ${lhcYaml(x, ind + 1).trimStart()}`;
      return `${pad}- ${lhcScalar(x)}`;
    }).join("\n");
  }
  return Object.entries(v).filter(([, x]) => x !== undefined).map(([k, x]) => {
    if (Array.isArray(x)) {
      if (!x.length) return `${pad}${k}: []`;
      if (x.every((y) => y === null || typeof y !== "object")) return `${pad}${k}: [${x.map(lhcScalar).join(", ")}]`;
      return `${pad}${k}:\n${lhcYaml(x, ind + 1)}`;
    }
    if (flat(x)) return `${pad}${k}: {${Object.entries(x).map(([a, b]) => `${a}: ${b}`).join(", ")}}`;
    if (x && typeof x === "object") return `${pad}${k}:\n${lhcYaml(x, ind + 1)}`;
    return `${pad}${k}: ${lhcScalar(x)}`;
  }).join("\n");
}

/* czas pozostały (sensor w h / min / s) -> "1 h 12 min" */
function lhcDuration(st) {
  if (!st || LHC_BAD.includes(st.state)) return null;
  let v = Number(st.state);
  if (!Number.isFinite(v)) return null;
  const u = (st.attributes.unit_of_measurement || "min").toLowerCase();
  let m = u === "h" ? v * 60 : u === "s" ? v / 60 : u === "d" ? v * 1440 : v;
  m = Math.round(m);
  if (m <= 0) return null;
  const h = Math.floor(m / 60);
  return h ? `${h} h ${m % 60} min` : `${m} min`;
}
function lhcRemainingMin(st) {
  if (!st || LHC_BAD.includes(st.state)) return 0;
  const v = Number(st.state), u = (st.attributes.unit_of_measurement || "min").toLowerCase();
  return Number.isFinite(v) ? (u === "h" ? v * 60 : u === "s" ? v / 60 : v) : 0;
}


const LHC_EMBEDDED = {"parter":"data:image/jpeg;base64,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","pietro":"data:image/jpeg;base64,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PPPPPPPPPPPPPPPPPPPPPPPPZa+ctPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPKgnLPx2mb/AH7zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzq0VzkrSIJSd2xP8A6/1888888888888888888888888888888988888888898888fAoLubV+VvGgXJC8nFD98888888888888898888888888888888888888888888r9P516xA+fYeUx2IhU+BV+888888888888888888888888888888888888888886XnjAKRLxkKRwj5c6J89jHV88888888888888888888888888888888888888884kiR+W4RFuiR6MtCChLE0Bf/wDPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPPMV7P8Ap/7u1zdDRDwmWU8+FVTzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzN23k/0AIt8+6RVzm437x017z3zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzyXB3fiH6WpmedQr0vHzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzjzzzzzzzzzzzzzyAhKxQMp8KO9zFw+JrPzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzw/SSAHdTYROpgR4wZP7zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzwwX9B9DCxSn8VtSRzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz6/8DiTjmeI+ec3zzzzzzzzzzzzzzzzzzzzzzzzzzzz3zzzzzzzzzzzzzzzzzzzzzzzzz0Lqdzs1jnbzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzyw1AGh1vzzzzzzzzzzzzzzzzzzzz3zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz3x7/3zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzjzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz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"};

// Ready-made houses: `preset: <name>` gives the image + room positions; the user only adds entities.
// Geometry: chip [x,y,w,h], shape [[x,y]...], focus [x,y], glow [x,y,w,h], screen [[x,y]x4] – all in % of the image.
const LHC_PRESETS = {"2-bedrooms":{"rooms":[{"id":"upstairs","label":1,"chip":[2,10,16.2,7.6]},{"id":"downstairs","label":1,"chip":[2,50.1,16.4,7.7]},{"id":"bathroom","chip":[38.6,17.8,17.7,10.1],"shape":[[38,15],[39,9],[50,3.5],[57.5,6.5],[57.5,32],[52,37.5],[44,37.5],[41,30]]},{"id":"storage","chip":[56.3,13,14.9,7.2],"focus":[62,21]},{"id":"bedroom","chip":[17.8,31.5,16.4,10.7],"shape":[[2.5,24],[26,15],[38,15],[41,30],[44,37.5],[24,51],[2.5,43.5]],"glow":[21,30,34,26]},{"id":"kids","chip":[65.1,27.9,19.9,10.7],"shape":[[57.5,6.5],[70,10.5],[91,13.5],[96.5,17.5],[96.5,35.5],[78,44.5],[59,35.5],[57.5,32]]},{"id":"kitchen","chip":[18.8,53.9,17.3,10],"shape":[[55,40.5],[64,43.5],[78.5,45.5],[78,56],[73,62],[62,68.5],[52.5,64.5],[59.5,45]]},{"id":"wc","chip":[13.6,65.1,11.3,10],"shape":[[4.5,60],[18,55],[33,53],[33,66],[25.5,70],[25.5,89],[4.5,82.5]]},{"id":"hall","chip":[33.3,65.4,15,10.1],"shape":[[24,52],[40,45.5],[55,40.5],[59.5,45],[52.5,64.5],[48,72],[44,80],[48.5,88],[40,94],[30.5,88.5],[25.5,89],[25.5,70],[33,66],[33,53]]},{"id":"living","chip":[62.9,72,15.2,10.2],"focus":[71,67],"shape":[[44,80],[48,72],[52.5,64.5],[62,68.5],[73,62],[78,56],[78.5,45.5],[96.5,45],[96.5,76.5],[67,95.5]],"glow":[76,66,40,34],"screen":[[73.7,57.6],[84.3,62.2],[84.3,69.5],[73.7,64.8]]}]},"3-bedrooms":{"rooms":[{"id":"upstairs","label":1,"chip":[1,2,15,9]},{"id":"downstairs","label":1,"chip":[1,45,15,9]},{"id":"bedroom","chip":[12,27,15,13],"shape":[[4,24],[8,17],[29,10],[31,12],[35,36],[28,41],[21,48],[4,42]]},{"id":"bathroom","chip":[36,15,14,13],"shape":[[31,11],[44,6],[50,8],[51,33],[44,36],[36,37],[35,30]]},{"id":"kids","chip":[54,30,15,13],"shape":[[50,7],[58,5],[70,10],[73,36],[66,40],[52,38],[51,34]]},{"id":"guest","chip":[78,31,15,13],"shape":[[71,12],[79,10],[95,17],[95,37],[84,44],[76,42],[73,36]]},{"id":"wc","chip":[11,57,13,13],"shape":[[8,62],[20,54],[29,50],[30,66],[30,86],[23,90],[8,82]]},{"id":"hall","chip":[31,62,12,13],"shape":[[29,51],[36,47],[49,42],[50,58],[44,66],[41,77],[38,88],[30,88],[30,66]]},{"id":"kitchen","chip":[52,46,14,13],"shape":[[49,44],[56,41],[68,44],[68,58],[62,62],[50,59]]},{"id":"living","chip":[60,78,15,13],"shape":[[68,46],[81,45],[82,74],[60,92],[41,77],[44,66],[50,58],[62,62],[68,58]],"screen":[[64,57.5],[73,61.5],[72.5,67.5],[64,64]]}]},"basement":{"rooms":[{"id":"upstairs","label":1,"chip":[0.5,3,13,8]},{"id":"downstairs","label":1,"chip":[0.5,30,13,8]},{"id":"basement","label":1,"chip":[0.5,62,13,8]},{"id":"bedroom","chip":[14,22,14,11],"shape":[[11,19],[18,13],[39,8],[39,32],[33,37],[29,38],[11,33]]},{"id":"bathroom","chip":[41,13,13,11],"shape":[[39,8],[50,5],[57,9],[58,28],[50,30],[39,32]]},{"id":"kids","chip":[68,21,14,11],"shape":[[57,9],[62,10],[86,14],[88,29],[74,35],[58,30]]},{"id":"wc","chip":[15,46,13,11],"shape":[[12,45],[21,41],[35,38],[35,63],[29,66],[12,61]]},{"id":"hall","chip":[36,47,12,11],"shape":[[35,38],[40,33],[55,30],[57,33],[52,46],[45,50],[41,62],[45,66],[35,64]]},{"id":"kitchen","chip":[56,36,13,11],"shape":[[54,34],[65,34],[70,37],[70,46],[62,50],[54,46]]},{"id":"living","chip":[54,58,14,11],"shape":[[70,37],[89,35],[89,59],[68,70],[45,60],[48,55],[62,50],[70,46]],"screen":[[71.5,45],[80,48],[80,53],[71.5,50]]},{"id":"utility","chip":[25,69,14,10],"shape":[[14,68],[48,67],[48,95],[20,96],[14,93]]},{"id":"workshop","chip":[61,68,15,10],"shape":[[50,67],[73,65],[86,63],[87,92],[78,96],[50,95]]}]},"attic":{"rooms":[{"id":"attic","label":1,"chip":[0.5,12,13,8]},{"id":"upstairs","label":1,"chip":[0.5,36,13,8]},{"id":"downstairs","label":1,"chip":[0.5,62,13,8]},{"id":"attic_bedroom","chip":[28,15,14,10],"shape":[[16,27],[34,13],[50,3],[52,3],[52,27],[30,28]]},{"id":"attic_storage","chip":[57,16,15,10],"shape":[[52,3],[66,14],[86,26],[70,27],[52,27]]},{"id":"bedroom","chip":[16,34,14,11],"shape":[[11,31],[30,30],[39,30],[39,49],[28,55],[11,52]]},{"id":"bathroom","chip":[41,31,13,11],"shape":[[39,30],[57,30],[57,46],[50,48],[39,49]]},{"id":"kids","chip":[68,33,14,11],"shape":[[57,30],[89,30],[89,46],[73,53],[58,47]]},{"id":"wc","chip":[16,64,13,11],"shape":[[12,59],[18,57],[35,56],[35,84],[30,86],[12,81]]},{"id":"hall","chip":[37,68,12,11],"shape":[[35,56],[41,57],[55,50],[56,53],[53,64],[46,70],[43,80],[45,88],[35,86]]},{"id":"kitchen","chip":[55,55,13,11],"shape":[[54,54],[66,53],[70,56],[70,64],[64,66],[54,64]]},{"id":"living","chip":[52,82,14,11],"shape":[[70,56],[89,53],[89,79],[68,92],[44,79],[48,72],[64,66],[70,64]],"screen":[[70,63.5],[79,66.5],[79,72],[70,69]]}]},"3-bedrooms-basement":{"rooms":[{"id":"upstairs","label":1,"chip":[0.5,2,13,8]},{"id":"downstairs","label":1,"chip":[0.5,37,13,8]},{"id":"basement","label":1,"chip":[0.5,70,12,8]},{"id":"bedroom","chip":[13,24,14,10.5],"shape":[[5,21],[10,17],[30,13],[35,34],[30,38],[21,45],[5,38]]},{"id":"bathroom","chip":[37,15,13,10.5],"shape":[[30,13],[46,8],[50,10],[51,34],[44,36],[36,35],[35,34]]},{"id":"kids","chip":[55,24,14,10.5],"shape":[[50,9],[52,9],[70,14],[71,35],[64,37],[51,34]]},{"id":"guest","chip":[78,27,14,10.5],"shape":[[70,14],[80,13],[95,20],[95,33],[84,42],[72,39],[71,35]]},{"id":"wc","chip":[12,51,13,10.5],"shape":[[8,50],[17,45],[30,44],[30,71],[22,72],[8,66]]},{"id":"hall","chip":[31,47,12,10.5],"shape":[[30,44],[34,42],[48,39],[49,45],[44,53],[42,60],[41,66],[38,72],[30,72],[30,60]]},{"id":"kitchen","chip":[50,42,13,10.5],"shape":[[47,40],[56,40],[64,42],[64,51],[57,55],[49,54],[48,46]]},{"id":"living","chip":[60,62,14,10.5],"shape":[[64,42],[92,42],[92,63],[86,66],[61,74],[42,68],[42,60],[44,55],[57,56],[64,52]],"screen":[[65.3,49.5],[74.5,53],[74,59],[65,56]]},{"id":"utility","chip":[27,73,14,9],"shape":[[11,72],[47,72],[47,96],[13,96],[11,92]]},{"id":"workshop","chip":[60,73,15,9],"shape":[[47,73],[85,70],[85,95],[78,97],[47,96]]}]},"3-bedrooms-attic":{"rooms":[{"id":"attic","label":1,"chip":[0.5,14,12,8]},{"id":"upstairs","label":1,"chip":[0.5,40,13,8]},{"id":"downstairs","label":1,"chip":[0.5,66,13,8]},{"id":"attic_bedroom","chip":[30,22,14,9.5],"shape":[[13,34],[28,22],[50,4],[51,4],[51,34]]},{"id":"attic_storage","chip":[57,20,14,9.5],"shape":[[51,4],[70,18],[89,34],[51,34]]},{"id":"bedroom","chip":[14,43,14,10.5],"shape":[[6,38],[34,37],[35,55],[30,58],[21,66],[6,59]]},{"id":"bathroom","chip":[36,40,13,10.5],"shape":[[35,37],[50,37],[51,55],[44,57],[36,57],[35,55]]},{"id":"kids","chip":[55,45,14,10.5],"shape":[[50,37],[70,37],[71,57],[64,60],[51,56]]},{"id":"guest","chip":[78,45,14,10.5],"shape":[[70,37],[95,37],[95,57],[84,64],[72,60],[71,57]]},{"id":"wc","chip":[11,72,13,10.5],"shape":[[8,68],[18,66],[30,64],[30,92],[24,96],[8,88]]},{"id":"hall","chip":[30,66,12,10.5],"shape":[[30,64],[34,63],[48,60],[49,66],[44,74],[42,82],[42,90],[36,96],[30,93]]},{"id":"kitchen","chip":[50,61,13,10.5],"shape":[[47,61],[56,61],[64,63],[64,71],[57,75],[49,74],[48,66]]},{"id":"living","chip":[52,80,14,10.5],"shape":[[64,63],[92,63],[92,84],[86,88],[60,99],[42,90],[42,82],[44,75],[57,76],[64,72]],"screen":[[63,70.5],[72,74],[72,81],[63,77.5]]}]},"basement-attic":{"rooms":[{"id":"attic","label":1,"chip":[0.5,9,13,6]},{"id":"upstairs","label":1,"chip":[0.5,29,13,6]},{"id":"downstairs","label":1,"chip":[0.5,51,13,6]},{"id":"basement","label":1,"chip":[0.5,73,13,6]},{"id":"attic_bedroom","chip":[28,16,16,7],"shape":[[3,27],[25,13],[50,3],[50,27]]},{"id":"attic_storage","chip":[58,13,16,7],"shape":[[50,3],[75,14],[97,27],[50,27]]},{"id":"bedroom","chip":[14,37,16,7],"shape":[[5,28],[38,28],[38,44],[33,46],[22,53],[5,47]]},{"id":"bathroom","chip":[42,35,16,7],"shape":[[38,28],[64,28],[64,43],[56,45],[44,46],[38,44]]},{"id":"kids","chip":[72,33,16,7],"shape":[[64,28],[94,28],[94,46],[80,50],[64,44]]},{"id":"wc","chip":[9,58,15,7],"shape":[[5,52],[18,51],[30,50],[30,74],[22,76],[5,70]]},{"id":"hall","chip":[33,54,15,7],"shape":[[30,50],[35,50],[50,47],[50,53],[45,58],[42,62],[42,72],[36,75],[30,74]]},{"id":"kitchen","chip":[51,50,16,7],"shape":[[50,48],[66,50],[70,52],[70,58],[62,60],[52,61],[50,56]]},{"id":"living","chip":[50,66,16,7],"shape":[[70,50],[95,50],[95,70],[66,78],[44,72],[44,63],[52,62],[62,61],[70,59]],"screen":[[72,57.5],[84,60],[84,66.5],[72,64]]},{"id":"utility","chip":[22,76,16,7],"shape":[[6,75],[49,75],[49,95],[13,96],[6,94]]},{"id":"workshop","chip":[60,76,16,7],"shape":[[49,75],[94,74],[94,94],[86,96],[49,95]]}]},"3-bedrooms-basement-attic":{"rooms":[{"id":"attic","label":1,"chip":[0.5,9,13,6]},{"id":"upstairs","label":1,"chip":[0.5,30,13,6]},{"id":"downstairs","label":1,"chip":[0.5,51,13,6]},{"id":"basement","label":1,"chip":[0.5,72,13,6]},{"id":"attic_bedroom","chip":[28,17,16,7],"shape":[[3,28],[25,15],[50,4],[50,28]]},{"id":"attic_storage","chip":[58,13,16,7],"shape":[[50,4],[75,16],[97,28],[50,28]]},{"id":"bedroom","chip":[12,37,16,7],"shape":[[4,30],[36,30],[37,45],[32,47],[22,53],[4,47]]},{"id":"bathroom","chip":[37,33,16,7],"shape":[[36,30],[53,30],[53,44],[46,46],[37,45]]},{"id":"kids","chip":[55,39,16,7],"shape":[[53,30],[72,30],[72,44],[66,47],[54,44]]},{"id":"guest","chip":[78,36,16,7],"shape":[[72,30],[96,30],[96,46],[85,50],[74,47],[72,44]]},{"id":"wc","chip":[9,58,15,7],"shape":[[5,53],[18,52],[29,51],[29,72],[22,74],[5,68]]},{"id":"hall","chip":[32,53,15,7],"shape":[[29,51],[34,50],[50,47],[50,52],[45,57],[42,62],[42,71],[36,74],[29,72]]},{"id":"kitchen","chip":[50,51,16,7],"shape":[[49,49],[64,50],[67,51],[67,57],[60,59],[50,59],[48,54]]},{"id":"living","chip":[48,66,16,7],"shape":[[67,51],[95,49],[95,66],[62,75],[42,70],[42,63],[50,60],[60,60],[67,58]],"screen":[[66,56.5],[75.5,59.5],[75.5,65],[66,62]]},{"id":"utility","chip":[22,75,16,7],"shape":[[6,73],[46,73],[46,95],[11,96],[6,94]]},{"id":"workshop","chip":[60,74,16,7],"shape":[[47,73],[94,72],[94,94],[86,96],[47,95]]}]}};
const LHC_ROOM_META = {
  upstairs: ["mdi:stairs-up", "Upstairs", "Piętro"], downstairs: ["mdi:home-floor-0", "Ground floor", "Parter"],
  basement: ["mdi:home-floor-negative-1", "Basement", "Piwnica"], attic: ["mdi:home-roof", "Attic", "Poddasze"],
  bedroom: ["mdi:bed-outline", "Bedroom", "Sypialnia"], bathroom: ["mdi:shower-head", "Bathroom", "Łazienka"],
  kids: ["mdi:teddy-bear", "Kids room", "Pokój dziecka"], guest: ["mdi:bed-queen-outline", "Guest room", "Pokój gościnny"],
  storage: ["mdi:package-variant-closed", "Storage", "Garderoba"], wc: ["mdi:toilet", "WC", "WC"],
  hall: ["mdi:walk", "Hall", "Korytarz"], kitchen: ["mdi:chef-hat", "Kitchen", "Kuchnia"], living: ["mdi:sofa-outline", "Living room", "Salon"],
  utility: ["mdi:water-boiler", "Utility room", "Kotłownia"], workshop: ["mdi:hammer-wrench", "Workshop", "Warsztat"],
  attic_bedroom: ["mdi:bed-outline", "Bedroom 2", "Sypialnia 2"], attic_storage: ["mdi:archive-outline", "Storage", "Schowek"],
};
const LHC_PRESET_CDN = "https://cdn.jsdelivr.net/gh/krystianokris/living-house-card@" + (LHC_VERSION.includes("_") ? "main" : "v" + LHC_VERSION) + "/images/houses/";

// Picture of a preset: own `image`, else `image_base` folder (offline HA), else the CDN.
function lhcPresetImage(cfg) {
  if (cfg.image) return cfg.image;
  const base = cfg.image_base ? String(cfg.image_base).replace(/\/?$/, "/") : LHC_PRESET_CDN;
  return base + cfg.preset + ".webp";
}

// Returns a full config: preset rooms (in preset order) merged with the user's rooms by id.
// User keys win; `hide: true` removes a preset room; unknown ids with their own `chip` are appended as custom rooms.
function lhcApplyPreset(cfg, lang) {
  if (!cfg || !cfg.preset) return cfg;
  const p = LHC_PRESETS[cfg.preset];
  if (!p) throw new Error(`Unknown preset "${cfg.preset}". Available: ${Object.keys(LHC_PRESETS).join(", ")}`);
  const pl = lang === "pl" ? 2 : 1;
  const user = {}; lhcArr(cfg.rooms).forEach((r) => { if (r && r.id) user[String(r.id)] = r; });
  const rooms = [];
  p.rooms.forEach((g) => {
    const u = user[g.id] || {}; delete user[g.id];
    if (u.hide) return;
    const m = LHC_ROOM_META[g.id] || ["mdi:home-outline", g.id, g.id];
    const r = { id: g.id, name: m[pl], icon: m[0], chip: { x: g.chip[0], y: g.chip[1], w: g.chip[2], h: g.chip[3] } };
    if (g.label) r.label = true;
    if (g.shape) r.shape = g.shape;
    if (g.focus) r.focus = { x: g.focus[0], y: g.focus[1] };
    const o = { ...r, ...u };
    if (u.tv) {
      const tv = Array.isArray(u.tv) || typeof u.tv === "string" ? { entities: u.tv } : u.tv;
      const gl = g.glow ? { x: g.glow[0], y: g.glow[1], w: g.glow[2], h: g.glow[3] } : undefined;
      o.tv = { ...(gl ? { glow: gl } : {}), ...(g.screen ? { screen: g.screen } : {}), ...tv };
    }
    rooms.push(o);
  });
  // Extra rooms need their own position (chip) – otherwise they are not in this picture.
  Object.values(user).forEach((u) => { if (!u.hide && (u.chip || u.x != null)) rooms.push(u); });
  return { ...cfg, image: lhcPresetImage(cfg), rooms };
}


/* ---------- Living House Card – 3D house dashboard ----------
 * type: custom:living-house-card
 */
const LHC_BASE_W = 1480;
const LHC_BASE_H = 820;

const LHC_DEFAULTS = {
  image: null,
  title: "Living House",
  subtitle: "Smart Home",
  location: null,
  weather: null,
  weather_fallback_temperature: null,
  sun: "sun.sun",
  alarm: null,
  ventilation: null,
  purifier: null,
  purifier_name: null,
  pm25: null,
  energy: null,          // { power, today, cost, currency }
  printer: null,         // { status, progress, remaining, page }
  main_thermostat: null,
  heating: [],
  nav: null,
  rooms_page: null,
  scenes: [],
  rooms: [],
  fit: true,
  scroll_floors: "auto", // tall houses: show bigger + ▲▼ floor arrows (auto | true | false)
  tilt: true,
  zoom: 2.1,
  weather_fx: true,
  heatmap_range: [16, 26],
  screensaver_minutes: 0,
  editor: true,
};

const LHC_WEATHER_ICON = {
  "clear-night": ["mdi:weather-night", "#b9c7ff"], cloudy: ["mdi:weather-cloudy", "#cfdcf2"], exceptional: ["mdi:alert-circle-outline", "#ffb36a"],
  fog: ["mdi:weather-fog", "#cfdcf2"], hail: ["mdi:weather-hail", "#cfe6ff"], lightning: ["mdi:weather-lightning", "#ffd75e"],
  "lightning-rainy": ["mdi:weather-lightning-rainy", "#ffd75e"], partlycloudy: ["mdi:weather-partly-cloudy", "#ffc94a"],
  pouring: ["mdi:weather-pouring", "#7fb6ff"], rainy: ["mdi:weather-rainy", "#7fb6ff"], snowy: ["mdi:weather-snowy", "#e8f2ff"],
  "snowy-rainy": ["mdi:weather-snowy-rainy", "#cfe6ff"], sunny: ["mdi:weather-sunny", "#ffc94a"], windy: ["mdi:weather-windy", "#cfdcf2"],
  "windy-variant": ["mdi:weather-windy-variant", "#cfdcf2"],
};
const LHC_ALARM_COLOR = { triggered: "#f87171", arming: "#facc15", pending: "#facc15", disarmed: "#94a3b8" };
const LHC_CLOUD = { cloudy: 0.85, partlycloudy: 0.6, rainy: 0.85, pouring: 0.95, "lightning-rainy": 0.95, lightning: 0.8, fog: 0.9, snowy: 0.75, "snowy-rainy": 0.85, hail: 0.85, windy: 0.35, "windy-variant": 0.55, exceptional: 0.5 };
const LHC_RAIN = { rainy: 130, pouring: 260, "lightning-rainy": 200, "snowy-rainy": 80, hail: 90 };
const LHC_SNOW = { snowy: 110, "snowy-rainy": 60 };
const LHC_STARS = { "clear-night": 1, sunny: 1, partlycloudy: 0.55, windy: 0.7, "windy-variant": 0.4, cloudy: 0.12, exceptional: 0.5 };
const LHC_DN = ["auto", "day", "night"];
const LHC_DN_ICON = { auto: "mdi:theme-light-dark", day: "mdi:weather-sunny", night: "mdi:weather-night" };

class LivingHouseCard extends HTMLElement {
  static getConfigElement() { return document.createElement("living-house-card-editor"); }
  static getStubConfig() {
    return { preset: "2-bedrooms", title: "Living House", weather: "weather.home", rooms: [] };
  }

  setConfig(config) {
    if (!config) throw new Error("Invalid configuration");
    this._raw = { ...LHC_DEFAULTS, ...config };
    this._cfg = lhcApplyPreset(this._raw, this._lang || lhcLang(this._hass, this._raw));
    this._normalize();
    this._room = null;
    const ls = (k, d) => { try { return localStorage.getItem(k) || d; } catch (e) { return d; } };
    this._scene = ls("lhc-scene", "");
    this._dn = ls("lhc-dn", "auto");
    this._heatmap = ls("lhc-heatmap", "0") === "1";
    this._trackedList = null;
    if (this._root) this._build();
  }
  _save(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } }
  _t(k, a) { return lhcT(this._lang || "en", k, a); }

  /* config -> wewnętrzna struktura pokoi */
  _normalize() {
    const c = this._cfg;
    const rooms = [], lights = {}, weights = {}, page = {};
    lhcArr(c.rooms).forEach((r, i) => {
      const id = String(r.id || `room${i + 1}`);
      const chip = r.chip || { x: r.x, y: r.y, w: r.w, h: r.h };
      const o = {
        id, name: r.name || id, icon: r.icon || (r.label ? "mdi:layers-outline" : "mdi:home-outline"), label: !!r.label,
        x: Number(chip.x) || 0, y: Number(chip.y) || 0, w: Number(chip.w) || 14, h: Number(chip.h) || 8,
      };
      if (o.label) { rooms.push(o); return; }
      const t = r.temperature;
      if (t) { if (String(t).startsWith("climate.")) o.climateTemp = t; else o.temp = t; }
      if (r.humidity) { if (r.humidity_on_chip === false) o.humExtra = r.humidity; else o.hum = r.humidity; }
      o.heat = lhcArr(r.heating);
      o.presence = r.presence || null;
      const L = lhcArr(r.lights).map((x) => (typeof x === "string" ? { entity: x } : x)).filter((x) => x && x.entity);
      lights[id] = L.map((x) => x.entity);
      L.forEach((x) => { if (x.weight != null) weights[x.entity] = Number(x.weight); });
      o.bulbIcon = !!r.icon_follows_light;
      o.shape = Array.isArray(r.shape) && r.shape.length > 2 ? r.shape : null;
      o.glow = r.glow || (o.shape ? this._bbox(o.shape) : null);
      o.focus = r.focus || null;
      if (r.tv) {
        const tv = r.tv;
        const g = tv.glow || o.glow || { x: o.x + o.w / 2, y: o.y + o.h / 2, w: 20, h: 16 };
        o.tv = { ids: lhcArr(tv.entities || tv.entity), x: g.x, y: g.y, w: g.w, h: g.h, screen: Array.isArray(tv.screen) && tv.screen.length > 2 ? tv.screen : null };
      }
      o.wc = !!o.presence && !o.temp && !o.climateTemp;
      o.lightsLine = !o.temp && !o.climateTemp && !o.presence && lights[id].length > 0;
      o.entities = r.entities
        ? lhcArr(r.entities).map((e) => (typeof e === "string" ? [e, null] : [e.entity, e.name || null])).filter((e) => e[0])
        : lhcUniq([...lights[id], o.temp, o.climateTemp, o.hum || o.humExtra, ...o.heat, o.presence, ...(o.tv ? o.tv.ids.slice(0, 1) : [])]).map((e) => [e, null]);
      if (r.page) page[id] = r.page;
      rooms.push(o);
    });
    this._rooms = rooms;
    this._lights = lights;
    this._weights = weights;
    this._roomPage = page;
    this._allLights = lhcUniq(Object.values(lights).flat());
    this._heatingList = lhcArr(c.heating).map((h) => (typeof h === "string" ? { entity: h } : h)).filter((h) => h.entity);
    this._scenes = lhcArr(c.scenes).map((s, i) => ({ id: s.id || `scene${i + 1}`, ...s }));
    const e = c.energy || {};
    this._energy = typeof e === "string" ? { power: e } : e;
  }
  _bbox(pts) {
    const xs = pts.map((p) => Number(p[0])), ys = pts.map((p) => Number(p[1]));
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    return { x: (x0 + x1) / 2, y: (y0 + y1) / 2, w: (x1 - x0) * 0.9, h: (y1 - y0) * 0.9 };
  }
  _navItems() {
    if (Array.isArray(this._cfg.nav)) return this._cfg.nav;
    const n = [{ name: this._t("nav_home"), icon: "mdi:home-outline", active: true }];
    if (this._cfg.rooms_page) n.push({ name: this._t("nav_rooms"), icon: "mdi:floor-plan", navigate: this._cfg.rooms_page });
    if (this._energy.power) n.push({ name: this._t("nav_energy"), icon: "mdi:lightning-bolt-outline", navigate: "/energy" });
    return n;
  }

  getCardSize() { return 14; }
  getGridOptions() { return { columns: "full", rows: "auto" }; }

  connectedCallback() {
    this._onResize = this._onResize || (() => this._fit());
    this._onKey = this._onKey || ((e) => { if (e.key === "Escape" && this._room) this._closePop(); });
    window.addEventListener("resize", this._onResize);
    window.addEventListener("keydown", this._onKey);
    if (!this._ro && window.ResizeObserver) {
      this._ro = new ResizeObserver(() => {
        const w = this.clientWidth;
        if (w !== this._lastW && this._root) { this._lastW = w; this._fit(); }
      });
    }
    if (this._ro) this._ro.observe(this);
    requestAnimationFrame(() => this._fit());
    this._onActivity = this._onActivity || (() => { if (!this._saverOn) this._armSaver(); });
    ["pointerdown", "keydown", "wheel", "touchstart"].forEach((ev) => window.addEventListener(ev, this._onActivity, { passive: true }));
    this._armSaver();
    if (this._root) this._startFx();
  }
  disconnectedCallback() {
    window.removeEventListener("resize", this._onResize);
    window.removeEventListener("keydown", this._onKey);
    ["pointerdown", "keydown", "wheel", "touchstart"].forEach((ev) => window.removeEventListener(ev, this._onActivity));
    if (this._ro) this._ro.disconnect();
    clearTimeout(this._saverT); clearInterval(this._clockI); clearTimeout(this._boltT);
    cancelAnimationFrame(this._fxRaf); this._fxRaf = 0;
  }

  set hass(hass) {
    const old = this._hass;
    this._hass = hass;
    const lang = lhcLang(hass, this._cfg);
    if (lang !== this._lang) {
      this._lang = lang;
      if (this._raw && this._raw.preset) { this._cfg = lhcApplyPreset(this._raw, lang); this._normalize(); this._trackedList = null; }
      if (this._root) this._build();
    }
    if (!this._root) this._build();
    if (!old || this._changed(old, hass)) this._update();
    const now = Date.now();
    if (this._energy.power && (!this._histAt || now - this._histAt > 5 * 60 * 1000)) {
      this._histAt = now;
      this._loadHistory();
    }
  }

  /* ---------- helpers ---------- */
  _tracked() {
    if (this._trackedList) return this._trackedList;
    const c = this._cfg, e = this._energy;
    const pr = c.printer || {};
    const ids = new Set([pr.status, pr.progress, pr.remaining, c.weather, c.weather_fallback_temperature, c.sun, c.alarm, c.ventilation, c.purifier, c.pm25, e.power, e.today, e.cost, c.main_thermostat, ...this._allLights]);
    this._heatingList.forEach((h) => ids.add(h.entity));
    this._rooms.forEach((r) => {
      [r.temp, r.hum, r.humExtra, r.climateTemp, r.presence, ...(r.heat || []), ...((r.tv && r.tv.ids) || [])].forEach((x) => x && ids.add(x));
      (r.entities || []).forEach((x) => ids.add(x[0]));
    });
    ids.delete(null); ids.delete(undefined);
    this._trackedList = [...ids];
    return this._trackedList;
  }
  _changed(a, b) { return this._tracked().some((id) => a.states[id] !== b.states[id]); }
  _s(id) { return id ? this._hass.states[id] : undefined; }
  _ok(id) { const s = this._s(id); return !!s && !LHC_BAD.includes(s.state); }
  _on(id) { const s = this._s(id); return !!s && s.state === "on"; }
  _num(v, d = 1) { const n = Number(v); return v !== null && v !== "" && v !== undefined && Number.isFinite(n) ? n.toFixed(d) : "—"; }
  _val(id, d = 1) { return this._ok(id) ? this._num(this._s(id).state, d) : "—"; }
  _heating(id) { const s = this._s(id); return !!s && s.attributes.hvac_action === "heating"; }
  _name(id, name) { return name || (this._s(id) && this._s(id).attributes.friendly_name) || id; }
  _time(iso) {
    if (!iso) return "—";
    try { return new Date(iso).toLocaleTimeString(this._lang === "pl" ? "pl-PL" : undefined, { hour: "2-digit", minute: "2-digit", timeZone: this._hass.config.time_zone }); } catch (e) { return "—"; }
  }
  _icon(i, extra = "") { return `<ha-icon icon="${i}" ${extra}></ha-icon>`; }
  _roomTemp(r) {
    if (r.temp) return this._val(r.temp);
    if (r.climateTemp) { const s = this._s(r.climateTemp); return this._num(s && s.attributes.current_temperature); }
    return null;
  }
  _roomTempNum(r) { const t = this._roomTemp(r); return t === null || t === "—" ? NaN : Number(t); }
  _focus(r) { return r.focus || (r.glow ? { x: r.glow.x, y: r.glow.y } : { x: r.x + r.w / 2, y: r.y + r.h / 2 }); }
  _isAdmin() { return !!(this._hass && this._hass.user && this._hass.user.is_admin); }

  /* ---------- skalowanie do okna ---------- */
  _fit() {
    const outer = this._root && this._root.querySelector(".outer");
    if (!outer) return;
    const w = this.clientWidth || this.getBoundingClientRect().width;
    const top = Math.max(0, this.getBoundingClientRect().top + (window.scrollY || 0));
    const h = window.innerHeight - top;
    const fit = this._cfg.fit && w >= 900 && h >= 420;
    outer.classList.toggle("fit", fit);
    outer.classList.toggle("fluid", !fit);
    if (fit) {
      const z = Math.min(w / LHC_BASE_W, h / LHC_BASE_H);
      outer.style.height = `${h}px`;
      outer.style.setProperty("--z", z.toFixed(4));
      requestAnimationFrame(() => this._fitStatus());
    } else {
      outer.style.height = "";
      outer.style.removeProperty("--z");
    }
    this._layoutTall(fit);
    this._applyZoom();
  }

  /* ---------- tall houses (basement + attic): bigger view, ▲▼ moves one floor ---------- */
  _layoutTall(fit) {
    const st = this._el && this._el("stage"), house = st && this._el("house");
    if (!house) return;
    const m = this._cfg.scroll_floors;
    const tall = fit && !this._edit && (m === true || (m !== false && this._ratio && this._ratio < 1.05));
    st.classList.toggle("tall", !!tall);
    if (!tall) { house.style.top = ""; this._floors = null; this._panFloor(0); return; }
    if (!this._wheelOn) this._setupFloorInput(st);
    requestAnimationFrame(() => {
      const sh = st.clientHeight, hh = house.offsetHeight, max = Math.max(0, hh - sh);
      const ys = this._rooms.filter((r) => r.label).map((r) => r.y).sort((a, b) => a - b);
      let t = ys.length ? ys.map((y) => Math.min(max, Math.max(0, (y / 100) * hh - sh * 0.05)))
        : Array.from({ length: Math.ceil(max / (sh * 0.6)) + 1 }, (_, i) => Math.min(max, i * sh * 0.6));
      if (t.length) t[0] = 0; // first stop always shows the roof
      t = t.filter((v, i) => i === 0 || v - t[i - 1] > 24);
      if (t.length && max - t[t.length - 1] > 24) t.push(max);
      this._floors = t.length > 1 ? t : null;
      this._panFloor(0);
    });
  }
  _panFloor(step) {
    const st = this._el && this._el("stage"), house = st && this._el("house");
    if (!house) return;
    const up = this._el("fup") || st.querySelector(".fnav.up"), dn = st.querySelector(".fnav.down");
    if (!this._floors) { up.hidden = dn.hidden = true; ["--vtop", "--vh", "--vy"].forEach((k) => house.style.removeProperty(k)); return; }
    const n = this._floors.length;
    this._floorIx = Math.max(0, Math.min(n - 1, (this._floorIx || 0) + step));
    const px = this._floors[this._floorIx], hh = house.offsetHeight, sh = st.clientHeight;
    this._panPx = px;
    house.style.top = `${-px}px`;
    house.style.setProperty("--vtop", `${(px / hh) * 100}%`);
    house.style.setProperty("--vh", `${(sh / hh) * 100}%`);
    house.style.setProperty("--vy", `${((px + sh / 2) / hh) * 100}%`);
    up.hidden = this._floorIx === 0;
    dn.hidden = this._floorIx === n - 1;
    if (step && this._room) this._applyZoom();
  }
  _setupFloorInput(st) {
    this._wheelOn = true;
    let last = 0, y0 = null;
    const go = (dir) => { const now = Date.now(); if (now - last < 450) return; last = now; this._panFloor(dir); };
    st.addEventListener("wheel", (e) => {
      if (!st.classList.contains("tall") || e.ctrlKey || this._room) return;
      e.preventDefault(); if (Math.abs(e.deltaY) > 4) go(e.deltaY > 0 ? 1 : -1);
    }, { passive: false });
    st.addEventListener("touchstart", (e) => { y0 = e.touches[0].clientY; }, { passive: true });
    st.addEventListener("touchend", (e) => {
      if (y0 === null || !st.classList.contains("tall")) return;
      const dy = e.changedTouches[0].clientY - y0; y0 = null;
      if (Math.abs(dy) > 40) go(dy < 0 ? 1 : -1);
    }, { passive: true });
  }

  /* ---------- szkielet ---------- */
  _build() {
    if (!this._root) {
      this._root = this.attachShadow({ mode: "open" });
      this._root.addEventListener("click", (e) => this._click(e));
      this._root.addEventListener("pointerdown", (e) => this._edPointerDown(e));
    }
    const c = this._cfg;
    const img = c.image ? lhcEsc(lhcImg(c.image)) : "";
    const [h0, h1] = c.heatmap_range || [16, 26];
    this._root.innerHTML = `
      <style>${LHC_HOUSE_STYLE}</style>
      <div class="outer fluid" style="--img:url('${img}')">
        <div class="bg">
          <div class="night"></div>
          <div class="blur-img"></div>
          <div class="sky"></div><div class="dusk"></div><div class="sun-glow"></div>
          <i class="orb o1"></i><i class="orb o2"></i><i class="orb o3"></i>
          <div class="clouds"><i class="cl c1"></i><i class="cl c2"></i><i class="cl c3"></i><i class="cl c4"></i><i class="cl c5"></i></div>
          <div class="fog"></div>
          <canvas class="fx" id="fx"></canvas>
          <div class="vignette"></div>
          <div class="flash" id="flash"></div>
        </div>
        <div class="wrap">
          <header class="hd rise" style="--d:0">
            <div class="brand">
              ${this._icon("mdi:home-outline", 'class="logo"')}
              <div><div class="title">${lhcEsc(c.title)}</div><div class="subtitle">${lhcEsc(c.subtitle)}</div></div>
            </div>
            <nav class="nav">
              ${this._navItems().map((n) => `<button class="pill glass ${n.active ? "active" : ""}" ${n.navigate ? `data-nav="${lhcEsc(n.navigate)}"` : ""} ${n.more_info ? `data-more="${lhcEsc(n.more_info)}"` : ""}>${this._icon(n.icon || "mdi:circle-small")}<span>${lhcEsc(n.name)}</span></button>`).join("")}
            </nav>
            <div class="tools">
              ${c.editor && this._isAdmin() ? `<button class="round glass ${this._edit ? "forced" : ""}" id="edbtn" data-edit="1" title="${this._t("ed_title")}">${this._icon("mdi:vector-square-edit")}</button>` : ""}
              <button class="round glass" id="dn" data-dn="1" title="${this._t("dn_" + this._dn)}">${this._icon(LHC_DN_ICON[this._dn])}</button>
              <button class="round glass" data-nav="/config/entities" title="${this._t("search")}">${this._icon("mdi:magnify")}</button>
              <button class="round glass" data-nav="/config/dashboard" title="${this._t("settings")}">${this._icon("mdi:cog-outline")}</button>
            </div>
          </header>

          <aside class="left">
            ${c.weather ? `<section class="panel glass weather rise" style="--d:1" id="weather" data-more="${lhcEsc(c.weather)}"></section>` : ""}
            <section class="panel glass status rise" style="--d:2" id="status"></section>
          </aside>

          <main class="stage" id="stage">
            <div class="house" id="house">
              <div class="tilt" id="tilt">
                <div class="zoomer" id="zoomer">
                  ${img ? `<img src="${img}" alt="" draggable="false" id="himg">` : `<div class="noimg">${this._t("configure")}</div>`}
                  <div class="daylight"></div>
                  ${this._layersHtml()}
                  <div class="glows" id="glows"></div>
                </div>
                <div class="spot" id="spot" data-close></div>
                <div class="chips" id="chips"></div>
                <svg class="edsvg" id="edsvg" viewBox="0 0 100 100" preserveAspectRatio="none"></svg>
              </div>
              <button class="hm-btn glass ${this._heatmap ? "on" : ""}" id="hmbtn" data-heatmap="1" title="${this._t("heatmap")}">${this._icon("mdi:thermometer-lines")}<span>${this._t("heatmap")}</span></button>
              <div class="legend glass" id="legend"><span>${h0}°</span><i></i><span>${h1}°</span></div>
              <div class="pop glass" id="pop" hidden></div>
              <div class="edpanel glass" id="edpanel" hidden></div>
            </div>
            <button class="fnav up glass" data-fnav="-1" hidden title="${this._t("floor_up")}">${this._icon("mdi:chevron-up")}</button>
            <button class="fnav down glass" data-fnav="1" hidden title="${this._t("floor_down")}">${this._icon("mdi:chevron-down")}</button>
          </main>

          <aside class="right">
            ${this._heatingList.length ? `<section class="panel glass heat rise" style="--d:1" id="heat"></section>` : ""}
            ${c.purifier || c.pm25 ? `<section class="panel glass air rise" style="--d:2" id="air"></section>` : ""}
            ${this._energy.power ? `<section class="panel glass energy rise" style="--d:3" id="energy" data-more="${lhcEsc(this._energy.power)}"></section>` : ""}
          </aside>

          <footer class="scenes rise" style="--d:3" id="scenes"></footer>
        </div>
        <div class="saver" id="saver" data-wake="1" hidden></div>
      </div>`;
    this._el = (id) => this._root.getElementById(id);
    const im = this._el("himg");
    if (im) {
      const setRatio = () => { if (!im.naturalWidth) return; this._ratio = im.naturalWidth / im.naturalHeight; this._root.querySelector(".outer").style.setProperty("--ratio", this._ratio.toFixed(5)); this._fit(); };
      if (im.complete) setRatio(); else im.addEventListener("load", setRatio, { once: true });
    }
    this._setupTilt();
    this._renderScenes();
    this._el("house").classList.toggle("heatmap", this._heatmap);
    this._el("house").classList.toggle("editing", !!this._edit);
    if (this._hass) this._update();
    if (this._edit) this._renderEditor();
    this._startFx();
    this._fit();
    requestAnimationFrame(() => this._fit());
    setTimeout(() => this._fit(), 300);
  }

  /* stałe warstwy na obrazie: cień pokoju, kolor LED, poświata TV, ekran TV */
  _layersHtml() {
    const poly = (pts) => `polygon(${pts.map(([x, y]) => `${x}% ${y}%`).join(",")})`;
    const box = (g) => `left:${g.x - g.w / 2}%;top:${g.y - g.h / 2}%;width:${g.w}%;height:${g.h}%`;
    const shaped = this._rooms.filter((r) => r.shape);
    return `
      <div class="shades">${shaped.filter((r) => (this._lights[r.id] || []).length).map((r) => `<div class="shade" data-shade="${r.id}" style="clip-path:${poly(r.shape)}"></div>`).join("")}</div>
      <div class="leds">${shaped.map((r) => `<div class="led" data-led="${r.id}" style="clip-path:${poly(r.shape)}"></div>`).join("")}</div>
      <div class="tvs">${this._rooms.filter((r) => r.tv).map((r) => `
        <div class="tvglow-clip" ${r.shape ? `style="clip-path:${poly(r.shape)}"` : ""}><div class="tvglow" data-tv="${r.id}" style="${box(r.tv)}"></div></div>
        ${r.tv.screen ? `<div class="tvscreen" data-screen="${r.id}" style="clip-path:${poly(r.tv.screen)}"></div>` : ""}`).join("")}</div>`;
  }

  _roomLevel(r) {
    let tot = 0, on = 0;
    for (const id of this._lights[r.id] || []) {
      const s = this._s(id);
      if (!s || LHC_BAD.includes(s.state)) continue;
      const w = this._weights[id] ?? 1;
      tot += w;
      if (s.state === "on") on += w;
    }
    return tot ? on / tot : 1;
  }
  _tvOn(r) { return !!(r.tv && r.tv.ids.some((id) => { const s = this._s(id); return s && LHC_TV_ON.includes(s.state); })); }
  _ledColor(r) {
    for (const id of this._lights[r.id] || []) {
      const s = this._s(id);
      if (s && s.state === "on" && id.startsWith("light.") && Array.isArray(s.attributes.rgb_color)) return s.attributes.rgb_color;
    }
    return null;
  }

  _updateLayers() {
    const root = this._root, day = this._dayFactor();
    this._rooms.forEach((r) => {
      const sh = root.querySelector(`[data-shade="${r.id}"]`);
      if (sh) {
        let dark = 0.84 * Math.pow(1 - this._roomLevel(r), 1.1) * (1 - 0.55 * day);
        if (this._tvOn(r)) dark *= 0.82;
        sh.style.opacity = this._edit ? "0" : dark.toFixed(3);
      }
      const led = root.querySelector(`[data-led="${r.id}"]`);
      if (led) {
        const c = this._ledColor(r);
        led.style.opacity = c ? "1" : "0";
        if (c) led.style.setProperty("--led", c.join(","));
      }
      const tvg = root.querySelector(`[data-tv="${r.id}"]`);
      if (tvg) tvg.classList.toggle("on", this._tvOn(r));
      const scr = root.querySelector(`[data-screen="${r.id}"]`);
      if (scr) scr.classList.toggle("off", !this._tvOn(r));
    });
  }

  _setupTilt() {
    const house = this._el("house"), tilt = this._el("tilt");
    if (!this._cfg.tilt || !house) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    house.addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse" || this._room || this._edit) return;
      const r = house.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => { tilt.style.transform = `rotateY(${(px * 5).toFixed(2)}deg) rotateX(${(-py * 4).toFixed(2)}deg)`; });
    });
    house.addEventListener("pointerleave", () => { cancelAnimationFrame(raf); tilt.style.transform = ""; });
  }

  /* ---------- części dynamiczne ---------- */
  _update() {
    if (!this._hass || !this._root) return;
    this._renderAmbient();
    this._renderWeather();
    this._renderStatus();
    this._renderHeat();
    this._renderAir();
    this._renderEnergy();
    this._renderHouse();
    if (this._room) this._renderPop();
  }

  _weather() {
    const c = this._cfg, w = this._s(c.weather);
    if (w && !LHC_BAD.includes(w.state)) {
      const a = w.attributes;
      const snap = { state: w.state, attributes: { temperature: a.temperature, temperature_unit: a.temperature_unit, humidity: a.humidity, wind_speed: a.wind_speed, wind_speed_unit: a.wind_speed_unit } };
      if (!this._lastW || this._lastW.state !== snap.state || this._lastW.attributes.temperature !== snap.attributes.temperature) this._save("lhc-weather", JSON.stringify(snap));
      this._lastW = snap;
      return { ...snap, stale: false };
    }
    if (!this._lastW) { try { this._lastW = JSON.parse(localStorage.getItem("lhc-weather") || "null"); } catch (e) { this._lastW = null; } }
    const out = this._lastW ? { ...this._lastW, attributes: { ...this._lastW.attributes }, stale: true } : { state: "", attributes: {}, stale: true };
    const t = this._s(c.weather_fallback_temperature);
    if (t && !LHC_BAD.includes(t.state)) out.attributes.temperature = t.state;
    return out;
  }
  _weatherLook(state) {
    let [icon, col] = LHC_WEATHER_ICON[state] || ["mdi:weather-cloudy", "#cfdcf2"];
    let label = state ? lhcMap(this._lang, "w", state, state) : this._t("no_data");
    if (this._dayFactor() < 0.5) {
      if (state === "partlycloudy") { icon = "mdi:weather-night-partly-cloudy"; col = "#c7d2fe"; }
      if (state === "sunny") { label = lhcMap(this._lang, "w", "clear-night"); icon = "mdi:weather-night"; col = "#b9c7ff"; }
    }
    return [label, icon, col];
  }

  _renderWeather() {
    const el = this._el("weather");
    if (!el) return;
    const c = this._cfg, w = this._weather(), sun = this._s(c.sun);
    const [label, icon, col] = this._weatherLook(w.state);
    const a = w.attributes;
    const loc = c.location || this._hass.config.location_name || "";
    el.innerHTML = `
      <div class="w-top">
        <div class="w-icon">${this._icon(icon, `style="color:${col}"`)}</div>
        <div>
          <div class="w-temp">${this._num(a.temperature, 0)}<span>${a.temperature_unit || "°C"}</span></div>
          <div class="w-cond">${lhcEsc(label)}</div>
          <div class="w-loc">${lhcEsc(loc)}${w.stale ? ` <span class="stale" title="${this._t("stale_tip")}">· ${this._t("stale")}</span>` : ""}</div>
        </div>
      </div>
      <div class="w-grid">
        <div>${this._icon("mdi:weather-windy", 'class="ic blue"')}${this._num(a.wind_speed, 0)} ${a.wind_speed_unit || "km/h"}</div>
        <div>${this._icon("mdi:water-outline", 'class="ic blue"')}${this._num(a.humidity, 0)}%</div>
        <div>${this._icon("mdi:weather-sunset-up", 'class="ic amber"')}${this._time(sun && sun.attributes.next_rising)}</div>
        <div>${this._icon("mdi:weather-sunset-down", 'class="ic amber"')}${this._time(sun && sun.attributes.next_setting)}</div>
      </div>`;
  }

  _renderStatus() {
    const c = this._cfg;
    const lightsOn = this._allLights.filter((id) => this._on(id)).length;
    const heatOn = this._heatingList.filter((h) => this._heating(h.entity)).length;
    const al = this._s(c.alarm);
    const vent = this._s(c.ventilation);
    const pm = Number(this._s(c.pm25) && this._s(c.pm25).state);
    const air = !Number.isFinite(pm) ? [this._t("no_data"), "#94a3b8"] : pm <= 12 ? [this._t("aq_good"), "#4ade80"] : pm <= 35 ? [this._t("aq_moderate"), "#facc15"] : pm <= 55 ? [this._t("aq_unhealthy"), "#fb923c"] : [this._t("aq_bad"), "#f87171"];
    const offline = this._tracked().filter((id) => { const s = this._s(id); return s && s.state === "unavailable"; }).length;
    let head = [this._t("all_ok"), "mdi:check-circle", "#22c55e"];
    if (al && al.state === "triggered") head = [this._t("alarm_bang"), "mdi:alert-circle", "#ef4444"];
    else if (offline) head = [this._t("offline", offline), "mdi:alert-circle-outline", "#f59e0b"];
    const row = (icon, col, name, val, attrs = "") => `
      <div class="s-row" ${attrs}>${this._icon(icon, `style="color:${col}" class="s-ic"`)}<div><div class="s-name">${name}</div><div class="s-val">${val}</div></div></div>`;
    const rows = [];
    if (this._allLights.length) rows.push(row("mdi:lightbulb-outline", lightsOn ? "#facc15" : "#64748b", this._t("lights"), lightsOn ? this._t("lights_on", lightsOn) : this._t("all_off"), `data-room="__lights"`));
    if (this._heatingList.length) rows.push(row("mdi:radiator", heatOn ? "#fb923c" : "#64748b", this._t("heating"), heatOn ? this._t("heating_active", heatOn) : this._t("inactive"), c.main_thermostat ? `data-more="${lhcEsc(c.main_thermostat)}"` : ""));
    if (c.ventilation) rows.push(row("mdi:fan", vent && vent.state === "on" ? "#38bdf8" : "#64748b", this._t("ventilation"), vent ? (vent.state === "on" ? this._t("running") : vent.state === "off" ? this._t("off_f") : this._t("no_data")) : "—", `data-more="${lhcEsc(c.ventilation)}"`));
    if (c.alarm) rows.push(row("mdi:shield-check-outline", al ? LHC_ALARM_COLOR[al.state] || "#4ade80" : "#94a3b8", this._t("security"), al ? lhcMap(this._lang, "alarm", al.state, al.state) : this._t("none"), `data-more="${lhcEsc(c.alarm)}"`));
    if (c.pm25) rows.push(row("mdi:leaf", air[1], this._t("air_quality"), air[0], `data-more="${lhcEsc(c.pm25)}"`));
    if (c.printer && c.printer.status) {
      const p = c.printer, ps = this._s(p.status), st = ps ? ps.state : "unknown";
      const prog = Math.round(Number(this._s(p.progress) && this._s(p.progress).state) || 0);
      const left = lhcDuration(this._s(p.remaining));
      const val = st === "running" ? `${this._t("pr_printing", prog)}${left ? ` · ${left}` : ""}` : lhcMap(this._lang, "pr_status", st, st);
      const col = st === "running" ? "#22d3ee" : st === "failed" ? "#f87171" : st === "pause" ? "#facc15" : st === "finish" ? "#4ade80" : "#64748b";
      const go = p.page && c.rooms_page ? `data-nav="${lhcEsc(c.rooms_page)}#${lhcEsc(p.page)}"` : `data-more="${lhcEsc(p.progress || p.status)}"`;
      rows.push(row(st === "failed" ? "mdi:printer-3d-nozzle-alert" : "mdi:printer-3d-nozzle", col, p.name || this._t("printer"), val, go));
    }
    this._el("status").innerHTML = `
      <div class="p-title">${this._t("status_title")}</div>
      <div class="s-head">${this._icon(head[1], `style="color:${head[2]}"`)}<span>${head[0]}</span></div>
      ${rows.join("")}`;
    this._fitStatus();
  }

  /* gdy wiersze statusu się nie mieszczą – zagęść je (najpierw odstępy, potem ukryj opisy) */
  _fitStatus() {
    const el = this._el("status");
    if (!el) return;
    const check = () => {
      el.classList.remove("tight", "tighter");
      if (el.scrollHeight - el.clientHeight > 1) el.classList.add("tight");
      if (el.scrollHeight - el.clientHeight > 1) el.classList.add("tighter");
    };
    check();
    requestAnimationFrame(check);
  }

  _renderHeat() {
    const el = this._el("heat");
    if (!el) return;
    const rows = this._heatingList.map((h) => {
      const s = this._s(h.entity);
      const heating = this._heating(h.entity);
      const off = !s || s.state === "off" || LHC_BAD.includes(s.state);
      const cur = s ? s.attributes.current_temperature : null;
      const tgt = s ? s.attributes.temperature : null;
      const col = heating ? "#fb7a3c" : off ? "#475569" : "#f5a35c";
      const icon = this._icon(h.icon || "mdi:heat-wave", `style="color:${h.icon ? "#60a5fa" : col}"`);
      return `<div class="h-row ${heating ? "on" : ""}" data-more="${lhcEsc(h.entity)}">
        <div class="h-ic">${icon}</div>
        <div class="h-name">${lhcEsc(this._name(h.entity, h.name))}<small>${off ? this._t("off_short") : heating ? this._t("heating_to", this._num(tgt)) : tgt != null ? this._t("target", this._num(tgt)) : this._t("idle")}</small></div>
        <div class="h-val">${cur != null ? this._num(cur) + "°C" : "—"}</div>
      </div>`;
    }).join("");
    el.innerHTML = `<div class="p-title">${this._icon("mdi:radiator", 'class="t-ic amber"')}${this._t("heating")}</div>${rows}`;
  }

  _renderAir() {
    const el = this._el("air");
    if (!el) return;
    const c = this._cfg, f = this._s(c.purifier);
    const on = f && f.state === "on";
    const mode = f ? (f.attributes.preset_mode ? lhcMap(this._lang, "preset", f.attributes.preset_mode, f.attributes.preset_mode) : on ? "Auto" : this._t("purifier_off")) : this._t("none");
    el.innerHTML = `
      <div class="p-title">${this._icon("mdi:weather-windy", 'class="t-ic blue"')}${this._t("air")}</div>
      ${c.purifier ? `<div class="a-row" data-more="${lhcEsc(c.purifier)}">
        ${this._icon("mdi:air-purifier", 'class="a-dev"')}
        <div class="a-name">${lhcEsc(this._name(c.purifier, c.purifier_name))}<small>${lhcEsc(mode)}</small></div>
        <button class="power ${on ? "on" : ""}" data-toggle="${lhcEsc(c.purifier)}" title="${this._t("toggle_power")}">${this._icon("mdi:power")}</button>
      </div>` : ""}
      ${c.pm25 ? `<div class="a-row" data-more="${lhcEsc(c.pm25)}">
        ${this._icon("mdi:leaf", 'class="a-dev green"')}
        <div class="a-name">PM2.5</div>
        <div class="a-val">${this._val(c.pm25, 0)} µg/m³</div>
      </div>` : ""}`;
  }

  _renderEnergy() {
    const el = this._el("energy");
    if (!el) return;
    const e = this._energy;
    const ps = this._s(e.power);
    const unit = ps && ps.attributes.unit_of_measurement;
    let kw = Number(ps && ps.state);
    if (Number.isFinite(kw) && unit !== "kW") kw /= 1000;
    const cost = this._s(e.cost);
    const cur = e.currency ?? (cost && cost.attributes.unit_of_measurement) ?? "";
    el.innerHTML = `
      <div class="p-title">${this._icon("mdi:lightning-bolt", 'class="t-ic yellow"')}${this._t("energy")} <span class="dim">${this._t("home_sfx")}</span></div>
      <div class="e-now">${Number.isFinite(kw) ? kw.toFixed(2) : "—"} <span>kW</span></div>
      <div class="spark">${this._spark || ""}</div>
      ${e.today ? `<div class="e-row"><span>${this._t("today")}</span><b>${this._val(e.today, 1)} kWh</b></div>` : ""}
      ${e.cost ? `<div class="e-row"><span>${this._t("cost_today")}</span><b>${cost && !LHC_BAD.includes(cost.state) ? (e.currency ? lhcEsc(e.currency) + this._num(cost.state, 2) : `${this._num(cost.state, 2)} ${lhcEsc(cur)}`) : "—"}</b></div>` : ""}`;
  }

  _heatHue(t) {
    const [lo, hi] = this._cfg.heatmap_range || [16, 26];
    const stops = [[0, 215], [0.25, 200], [0.45, 165], [0.55, 95], [0.65, 48], [0.8, 30], [1, 8]];
    const f = Math.max(0, Math.min(1, (t - lo) / (hi - lo)));
    for (let i = 1; i < stops.length; i++) {
      if (f <= stops[i][0]) { const [f0, h0] = stops[i - 1], [f1, h1] = stops[i]; return h0 + ((f - f0) / (f1 - f0)) * (h1 - h0); }
    }
    return 8;
  }

  _renderHouse() {
    const box = (g) => `left:${g.x - g.w / 2}%;top:${g.y - g.h / 2}%;width:${g.w}%;height:${g.h}%`;
    if (this._heatmap) {
      this._el("glows").innerHTML = this._rooms.filter((r) => r.glow).map((r) => {
        const t = this._roomTempNum(r);
        return Number.isFinite(t) ? `<div class="glow hm" style="${box(r.glow)};--h:${this._heatHue(t).toFixed(0)}"></div>` : "";
      }).join("");
    } else {
      this._el("glows").innerHTML = this._edit ? "" : this._rooms.filter((r) => r.glow && (this._lights[r.id] || []).length && this._roomLevel(r) > 0.01).map((r) =>
        `<div class="glow lit" style="${box(r.glow)}"></div>`).join("");
    }
    this._updateLayers();

    this._el("chips").innerHTML = this._rooms.map((r) => {
      const pos = `left:${r.x}%;top:${r.y}%;width:${r.w}%;height:${r.h}%`;
      const ed = this._edit ? `<i class="rz" data-rz="${r.id}"></i>` : "";
      const sel = this._edit && this._sel === r.id ? "sel" : "";
      if (r.label) return `<div class="chip glass label ${sel}" style="${pos}" data-chip="${r.id}">${this._icon(r.icon, 'class="c-ic blue"')}<span class="c-name">${lhcEsc(r.name)}</span><span class="dot"></span>${ed}</div>`;
      const L = this._lights[r.id] || [];
      const lit = L.some((id) => this._on(id));
      const heat = (r.heat || []).some((id) => this._heating(id));
      let line = "";
      if (r.hum) {
        line = `${this._icon("mdi:water-outline", 'class="l-ic blue"')}<span>${this._val(r.hum, 0)}%</span>${r.temp || r.climateTemp ? `<span>${this._roomTemp(r)}°C</span>` : ""}`;
      } else if (r.temp || r.climateTemp) {
        line = `${this._icon("mdi:heat-wave", `class="l-ic ${heat ? "hot" : "amber"}"`)}<span>${this._roomTemp(r)}°C</span>`;
      } else if (r.wc) {
        const occ = this._on(r.presence);
        line = `${L.length ? this._icon(lit ? "mdi:lightbulb-on" : "mdi:lightbulb-outline", `class="l-ic ${lit ? "yellow" : "grey"}"`) : ""}${this._icon(occ ? "mdi:account" : "mdi:account-outline", `class="l-ic ${occ ? "mint" : "grey"}"`)}<span class="small">${occ ? this._t("occupied") : this._t("free")}</span>`;
      } else if (r.lightsLine) {
        const n = L.filter((id) => this._on(id)).length;
        line = `${this._icon(n ? "mdi:lightbulb-on" : "mdi:lightbulb-outline", `class="l-ic ${n ? "yellow" : "grey"}"`)}<span>${n ? this._t("n_on", n) : this._t("off_short")}</span>`;
      }
      if (this._tvOn(r)) line += this._icon("mdi:television-play", 'class="l-ic tvc"');
      let icon = r.icon, iconCls = "c-ic";
      if (r.bulbIcon) { icon = lit ? "mdi:lightbulb-on" : "mdi:lightbulb-outline"; iconCls += lit ? " yellow" : " grey"; }
      const occ = r.presence && this._on(r.presence);
      const tNum = this._roomTempNum(r);
      const hmStyle = this._heatmap && Number.isFinite(tNum) ? `;--h:${this._heatHue(tNum).toFixed(0)}` : "";
      return `<button class="chip glass ${lit ? "lit" : ""} ${heat ? "heat" : ""} ${hmStyle ? "hmc" : ""} ${sel}" style="${pos}${hmStyle}" data-room="${r.id}" data-chip="${r.id}">
        ${heat || occ ? `<span class="ping ${heat ? "hot" : "mint"}"></span>` : ""}
        <div class="c-top">${this._icon(icon, `class="${iconCls}"`)}<span class="c-name">${lhcEsc(r.name)}</span></div>
        ${line ? `<div class="c-line">${line}</div>` : ""}${ed}
      </button>`;
    }).join("");
    if (this._edit) this._renderEdSvg();
  }

  _renderScenes() {
    const el = this._el("scenes");
    el.innerHTML = this._scenes.map((s) => `
      <button class="scene glass ${this._scene === s.id ? "active" : ""}" data-scene="${lhcEsc(s.id)}">
        ${this._icon(s.icon || "mdi:palette-outline", `style="color:${lhcEsc(s.color || "#c7d2fe")}"`)}
        <div class="sc-name">${lhcEsc(s.name || s.id)}</div>${s.sub ? `<div class="sc-sub">${lhcEsc(s.sub)}</div>` : ""}
      </button>`).join("") + (this._isAdmin() ? `<button class="scene glass plus" data-nav="/config/script/edit/new" title="${this._t("add_scene")}">${this._icon("mdi:plus")}</button>` : "");
    el.hidden = !this._scenes.length && !this._isAdmin();
  }

  /* ---------- przybliżenie pokoju ---------- */
  _applyZoom() {
    const z = this._el && this._el("zoomer");
    if (!z) return;
    const house = this._el("house");
    const r = this._room && this._rooms.find((x) => x.id === this._room);
    house.classList.toggle("zoomed", !!r);
    if (!r) { z.style.transform = ""; return; }
    const f = this._focus(r);
    const fit = this._root.querySelector(".outer").classList.contains("fit");
    const st = this._el("stage"), tall = st && st.classList.contains("tall") && this._floors;
    const tx = fit ? 31 : 50, ty = tall ? (((this._panPx || 0) + st.clientHeight / 2) / house.offsetHeight) * 100 : fit ? 50 : 30;
    z.style.transformOrigin = `${f.x}% ${f.y}%`;
    z.style.transform = `translate(${tx - f.x}%, ${ty - f.y}%) scale(${this._cfg.zoom})`;
    house.style.setProperty("--sx", `${tx}%`);
    house.style.setProperty("--sy", `${ty}%`);
  }

  _renderPop() {
    const pop = this._el("pop");
    let title, rows, hero = "", sub = "";
    if (this._room === "__lights") {
      title = this._t("lights_on_title");
      const on = this._allLights.filter((id) => this._on(id));
      rows = on.length ? on.map((id) => [id, null]) : null;
      pop.classList.add("center");
    } else {
      const r = this._rooms.find((x) => x.id === this._room);
      if (!r) { this._closePop(); return; }
      pop.classList.remove("center");
      title = lhcEsc(r.name);
      rows = r.entities.length ? r.entities : null;
      const t = this._roomTemp(r);
      const humId = r.hum || r.humExtra;
      const lights = this._lights[r.id] || [];
      const lOn = lights.filter((id) => this._on(id)).length;
      const heat = (r.heat || []).some((id) => this._heating(id));
      const bits = [];
      if (t && t !== "—") bits.push(`<div class="hero-v">${this._icon("mdi:thermometer", 'class="amber"')}<b>${t}</b><span>°C</span></div>`);
      if (humId && this._ok(humId)) bits.push(`<div class="hero-v">${this._icon("mdi:water-outline", 'class="blue"')}<b>${this._val(humId, 0)}</b><span>%</span></div>`);
      if (lights.length) bits.push(`<div class="hero-v">${this._icon(lOn ? "mdi:lightbulb-on" : "mdi:lightbulb-outline", `class="${lOn ? "yellow" : "grey"}"`)}<b>${lOn}</b><span>/${lights.length}</span></div>`);
      hero = bits.length ? `<div class="hero">${bits.join("")}</div>` : "";
      sub = heat ? `<span class="tag hot">${this._icon("mdi:fire")}${this._t("heating_tag")}</span>` : "";
      if (lights.length) sub += `<button class="tag btn" data-roomlights="${r.id}">${this._icon("mdi:lightbulb-group-outline")}${lOn ? this._t("all_off_btn") : this._t("all_on_btn")}</button>`;
      if (this._cfg.rooms_page && this._roomPage[r.id]) sub += `<button class="tag btn open" data-nav="${lhcEsc(this._cfg.rooms_page)}#${lhcEsc(this._roomPage[r.id])}">${this._icon("mdi:arrow-top-right")}${this._t("open_room")}</button>`;
    }
    const body = rows ? rows.map(([id, name]) => {
      const s = this._s(id);
      const dom = id.split(".")[0];
      let val, ctl = "";
      if (!s) val = `<span class="muted">${this._t("no_entity")}</span>`;
      else if (s.state === "unavailable") val = `<span class="muted">offline</span>`;
      else if (["switch", "light", "fan", "input_boolean"].includes(dom)) {
        val = s.state === "on" ? this._t("on_short") : this._t("off_short");
        ctl = `<button class="tog ${s.state === "on" ? "on" : ""}" data-toggle="${lhcEsc(id)}"><i></i></button>`;
      } else if (dom === "climate") {
        val = `${this._num(s.attributes.current_temperature)}°C${s.attributes.temperature != null ? ` → ${this._num(s.attributes.temperature)}°` : ""} · ${s.state === "off" ? this._t("off_short") : s.attributes.hvac_action === "heating" ? this._t("heating_tag") : lhcEsc(s.state)}`;
      } else if (dom === "media_player") {
        const tt = s.attributes.media_title || s.attributes.app_name;
        val = `${lhcMap(this._lang, "media", s.state, lhcEsc(s.state))}${tt && s.state !== "off" ? ` · ${lhcEsc(tt)}` : ""}`;
      } else if (dom === "binary_sensor") val = s.state === "on" ? this._t("detected") : this._t("clear");
      else val = `${lhcEsc(s.state)} ${s.attributes.unit_of_measurement || ""}`;
      const icon = { switch: "mdi:lightbulb-outline", light: "mdi:led-strip-variant", fan: "mdi:fan", climate: "mdi:thermostat", binary_sensor: "mdi:motion-sensor", sensor: "mdi:thermometer", media_player: "mdi:television" }[dom] || "mdi:circle-small";
      const on = s && (s.state === "on" || (dom === "media_player" && LHC_TV_ON.includes(s.state)));
      return `<div class="p-row"><div class="p-main" data-more="${lhcEsc(id)}">${this._icon(icon, `class="p-ic ${on ? "yellow" : ""}"`)}<div><div>${lhcEsc(this._name(id, name))}</div><small>${val}</small></div></div>${ctl}</div>`;
    }).join("") : `<div class="muted pad">${this._t("no_devices")}</div>`;
    pop.innerHTML = `
      <div class="pop-hd"><span>${title}</span><button class="round sm glass" data-close>${this._icon("mdi:close")}</button></div>
      ${hero}${sub ? `<div class="tags">${sub}</div>` : ""}
      <div class="pop-body">${body}</div>`;
    if (pop.hidden) {
      pop.hidden = false;
      pop.classList.remove("show");
      void pop.offsetWidth;
      pop.classList.add("show");
    }
  }

  _openRoom(id) {
    this._room = id;
    const tilt = this._el("tilt");
    if (tilt) tilt.style.transform = "";
    this._applyZoom();
    this._renderPop();
  }
  _closePop() {
    this._room = null;
    const p = this._el("pop");
    if (p) p.hidden = true;
    this._applyZoom();
  }

  /* ---------- wykres energii (24 h) ---------- */
  async _loadHistory() {
    const id = this._energy.power;
    if (!id) return;
    try {
      const start = new Date(Date.now() - 24 * 3600 * 1000);
      const res = await this._hass.callWS({ type: "history/history_during_period", start_time: start.toISOString(), entity_ids: [id], minimal_response: true, no_attributes: true, significant_changes_only: false });
      const pts = (res[id] || []).map((p) => [((p.lu || p.lc) * 1000) || Date.parse(p.last_updated || p.last_changed), Number(p.s ?? p.state)]).filter((p) => Number.isFinite(p[0]) && Number.isFinite(p[1]));
      if (pts.length < 2) return;
      const N = 72, t0 = start.getTime(), step = (24 * 3600 * 1000) / N, buckets = [];
      let j = 0, last = pts[0][1];
      for (let i = 0; i < N; i++) {
        const end = t0 + (i + 1) * step; let sum = 0, cnt = 0;
        while (j < pts.length && pts[j][0] < end) { sum += pts[j][1]; cnt++; last = pts[j][1]; j++; }
        buckets.push(cnt ? sum / cnt : last);
      }
      const W = 220, H = 46, min = Math.min(...buckets), max = Math.max(...buckets), rng = max - min || 1;
      const xy = buckets.map((v, i) => [(i / (N - 1)) * W, H - 4 - ((v - min) / rng) * (H - 10)]);
      let d = `M${xy[0][0].toFixed(1)},${xy[0][1].toFixed(1)}`;
      for (let i = 1; i < xy.length; i++) {
        const [x0, y0] = xy[i - 1], [x1, y1] = xy[i], mx = (x0 + x1) / 2;
        d += ` C${mx.toFixed(1)},${y0.toFixed(1)} ${mx.toFixed(1)},${y1.toFixed(1)} ${x1.toFixed(1)},${y1.toFixed(1)}`;
      }
      const [lx, ly] = xy[xy.length - 1];
      this._spark = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
        <defs><linearGradient id="eg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#34d399" stop-opacity=".35"/><stop offset="1" stop-color="#34d399" stop-opacity="0"/></linearGradient></defs>
        <path d="${d} L${W},${H} L0,${H} Z" fill="url(#eg)"/>
        <path class="line" d="${d}" fill="none" stroke="#34d399" stroke-width="2" vector-effect="non-scaling-stroke" pathLength="1"/>
        <circle class="live" cx="${lx.toFixed(1)}" cy="${ly.toFixed(1)}" r="3" fill="#6ee7b7"/></svg>`;
      this._renderEnergy();
    } catch (e) { /* brak historii */ }
  }

  /* ---------- dzień / noc / pogoda ---------- */
  _dayFactor() {
    if (this._dn === "day") return 1;
    if (this._dn === "night") return 0;
    const s = this._s(this._cfg.sun);
    if (!s) return 0;
    const el = Number(s.attributes.elevation);
    if (!Number.isFinite(el)) return s.state === "above_horizon" ? 1 : 0;
    return Math.max(0, Math.min(1, (el + 5) / 13));
  }

  _renderAmbient() {
    const outer = this._root.querySelector(".outer");
    const d = this._dayFactor();
    const dusk = 1 - Math.abs(2 * d - 1);
    outer.style.setProperty("--day", d.toFixed(3));
    outer.style.setProperty("--dusk", (dusk * dusk).toFixed(3));
    outer.classList.toggle("is-day", d > 0.5);
    const mix = (a, b) => Math.round(a + (b - a) * d);
    const w = this._weather();
    const st = w.state || "";
    const rainy = /rain|pour|lightning|hail/.test(st);
    outer.style.setProperty("--cc", rainy ? `${mix(95, 175)},${mix(105, 185)},${mix(130, 200)}` : `${mix(140, 255)},${mix(155, 255)},${mix(190, 255)}`);
    const fx = this._cfg.weather_fx;
    outer.dataset.weather = st;
    outer.style.setProperty("--cloud", fx ? String(LHC_CLOUD[st] || 0) : "0");
    outer.style.setProperty("--fog", fx && st === "fog" ? "1" : "0");
    const wind = Number(w.attributes.wind_speed) || 0;
    this._fxCfg = { rain: fx ? LHC_RAIN[st] || 0 : 0, snow: fx ? LHC_SNOW[st] || 0 : 0, stars: LHC_STARS[st] ?? 0.3, wind: Math.min(1, wind / 45) + (st.startsWith("windy") ? 0.4 : 0), day: d };
    const bolt = fx && st.startsWith("lightning");
    if (bolt && !this._boltT) this._scheduleBolt();
    if (!bolt && this._boltT) { clearTimeout(this._boltT); this._boltT = null; }
    const dnBtn = this._el("dn");
    if (dnBtn) { dnBtn.title = this._t("dn_" + this._dn); dnBtn.innerHTML = this._icon(LHC_DN_ICON[this._dn]); dnBtn.classList.toggle("forced", this._dn !== "auto"); }
    this._startFx();
  }

  _scheduleBolt() {
    this._boltT = setTimeout(() => {
      const f = this._el && this._el("flash");
      if (f) { f.classList.remove("go"); void f.offsetWidth; f.classList.add("go"); }
      this._scheduleBolt();
    }, 5000 + Math.random() * 10000);
  }

  _startFx() {
    if (this._fxRaf || !this._root || !this.isConnected) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let last = 0;
    const loop = (t) => {
      this._fxRaf = requestAnimationFrame(loop);
      if (t - last < 33) return;
      last = t;
      if (!this._drawFx(t / 1000)) { cancelAnimationFrame(this._fxRaf); this._fxRaf = 0; }
    };
    this._fxRaf = requestAnimationFrame(loop);
  }

  _drawFx(t) {
    const cv = this._el && this._el("fx");
    const cfg = this._fxCfg;
    if (!cv || !cfg) return false;
    const W = cv.clientWidth, H = cv.clientHeight;
    if (!W || !H) return true;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    if (cv.width !== Math.round(W * dpr) || cv.height !== Math.round(H * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); this._parts = null; }
    const ctx = cv.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const starA = cfg.stars * (1 - cfg.day);
    const key = `${cfg.rain}|${cfg.snow}|${W}|${H}`;
    if (!this._parts || this._parts.key !== key) {
      const R = Math.random;
      this._parts = {
        key,
        rain: Array.from({ length: cfg.rain }, () => ({ x: R() * W, y: R() * H, l: 10 + R() * 16, v: 520 + R() * 380 })),
        snow: Array.from({ length: cfg.snow }, () => ({ x: R() * W, y: R() * H, r: 0.8 + R() * 2.2, v: 18 + R() * 30, p: R() * 6.28 })),
        stars: Array.from({ length: 110 }, () => ({ x: R() * W, y: R() * H * 0.75, r: 0.4 + R() * 1.1, s: 0.6 + R() * 2.2, p: R() * 6.28 })),
        t,
      };
    }
    const P = this._parts, dt = Math.min(0.1, t - (P.t || t)); P.t = t;
    if (starA > 0.02) {
      for (const s of P.stars) {
        ctx.globalAlpha = starA * (0.35 + 0.65 * Math.abs(Math.sin(t * s.s + s.p)));
        ctx.fillStyle = "#dbe7ff";
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283); ctx.fill();
      }
    }
    if (P.rain.length) {
      const slant = 0.12 + cfg.wind * 0.35;
      ctx.globalAlpha = 0.32 + 0.15 * (1 - cfg.day);
      ctx.strokeStyle = cfg.day > 0.5 ? "#e6f0ff" : "#9fc2ff";
      ctx.lineWidth = 1; ctx.beginPath();
      for (const d of P.rain) {
        d.y += d.v * dt; d.x += d.v * dt * slant;
        if (d.y > H) { d.y = -d.l; d.x = Math.random() * (W + 200) - 200; }
        if (d.x > W) d.x -= W + 200;
        ctx.moveTo(d.x, d.y); ctx.lineTo(d.x - d.l * slant, d.y - d.l);
      }
      ctx.stroke();
    }
    if (P.snow.length) {
      ctx.fillStyle = "#f4f8ff";
      for (const f of P.snow) {
        f.y += f.v * dt; f.x += (Math.sin(t * 0.8 + f.p) * 18 + cfg.wind * 40) * dt;
        if (f.y > H) { f.y = -4; f.x = Math.random() * W; }
        if (f.x > W) f.x -= W;
        if (f.x < 0) f.x += W;
        ctx.globalAlpha = 0.55 + 0.35 * Math.sin(f.p);
        ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 6.283); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    return P.rain.length > 0 || P.snow.length > 0 || starA > 0.02;
  }

  /* ---------- tablet: wygaszacz ---------- */
  _saverMinutes() {
    const m = Number(this._cfg.screensaver_minutes);
    if (m > 0) return m;
    return /[?&](kiosk|tablet)\b/.test(location.search) ? 3 : 0;
  }
  _armSaver() {
    clearTimeout(this._saverT);
    const m = this._saverMinutes();
    if (!m || !this._root) return;
    this._saverT = setTimeout(() => this._showSaver(), m * 60 * 1000);
  }
  _showSaver() {
    const s = this._el && this._el("saver");
    if (!s || !this.isConnected || this._edit) return;
    if (this._room) this._closePop();
    this._saverOn = true;
    s.hidden = false;
    s.classList.remove("show"); void s.offsetWidth; s.classList.add("show");
    this._renderSaver();
    clearInterval(this._clockI);
    this._clockI = setInterval(() => this._renderSaver(), 10000);
  }
  _hideSaver() {
    const s = this._el && this._el("saver");
    this._saverOn = false;
    clearInterval(this._clockI);
    if (s) s.hidden = true;
    this._armSaver();
  }
  _renderSaver() {
    const s = this._el("saver");
    if (!s || s.hidden || !this._hass) return;
    const tz = this._hass.config.time_zone, now = new Date(), loc = this._lang === "pl" ? "pl-PL" : undefined;
    let time, date;
    try {
      time = new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: false }).format(now);
      date = new Intl.DateTimeFormat(loc, { timeZone: tz, weekday: "long", day: "numeric", month: "long" }).format(now);
    } catch (e) { time = now.toTimeString().slice(0, 5); date = now.toDateString(); }
    const [hh, mm] = time.split(":");
    const c = this._cfg, w = this._weather();
    const [label, icon, col] = this._weatherLook(w.state);
    const th = this._s(c.main_thermostat);
    const n = this._allLights.filter((id) => this._on(id)).length;
    s.innerHTML = `
      <div class="sv-img"></div>
      <div class="sv-body">
        <div class="sv-time">${hh}<span class="sv-colon">:</span>${mm}</div>
        <div class="sv-date">${lhcEsc(date)}</div>
        <div class="sv-row">
          ${c.weather ? `<div>${this._icon(icon, `style="color:${col}"`)}<b>${this._num(w.attributes.temperature, 0)}°</b><span>${lhcEsc(label)}</span></div>` : ""}
          ${th ? `<div>${this._icon("mdi:home-thermometer-outline", 'class="amber"')}<b>${this._num(th.attributes.current_temperature)}°</b><span>${this._t("at_home")}</span></div>` : ""}
          ${this._allLights.length ? `<div>${this._icon(n ? "mdi:lightbulb-on" : "mdi:lightbulb-outline", `class="${n ? "yellow" : "grey"}"`)}<b>${n}</b><span>${this._t("lights_count", n)}</span></div>` : ""}
        </div>
        <div class="sv-hint">${this._t("tap_return")}</div>
      </div>`;
  }

  /* ---------- TRYB KALIBRACJI ---------- */
  _toggleEdit() {
    this._edit = !this._edit;
    this._sel = null; this._draw = null; this._draft = [];
    if (this._room) this._closePop();
    const house = this._el("house");
    house.classList.toggle("editing", this._edit);
    this._el("edbtn") && this._el("edbtn").classList.toggle("forced", this._edit);
    const tilt = this._el("tilt"); if (tilt) tilt.style.transform = "";
    this._fit();
    this._renderHouse();
    this._renderEditor();
  }
  _renderEditor() {
    const p = this._el("edpanel");
    if (!p) return;
    if (!this._edit) { p.hidden = true; this._el("edsvg").innerHTML = ""; return; }
    p.hidden = false;
    const r = this._sel && this._rooms.find((x) => x.id === this._sel);
    const draw = this._draw;
    p.innerHTML = `
      <div class="ed-hd">${this._icon("mdi:vector-square-edit")}<b>${this._t("ed_title")}</b><button class="round sm glass" data-edclose="1">${this._icon("mdi:close")}</button></div>
      <div class="ed-hint">${draw === "focus" ? this._t("ed_focus_hint") : draw ? this._t("ed_drawing") : this._t("ed_hint")}</div>
      <div class="ed-rooms">${this._rooms.map((x) => `<button class="mchip ${this._sel === x.id ? "on" : ""}" data-edsel="${x.id}">${lhcEsc(x.name)}</button>`).join("")}</div>
      ${r && !r.label ? `<div class="ed-acts">
        ${draw ? `<button class="mchip" data-edundo="1">${this._icon("mdi:undo")}${this._t("ed_undo")}</button><button class="mchip on" data-eddone="1">${this._icon("mdi:check")}${this._t("ed_done")}</button>`
        : `<button class="mchip" data-eddraw="shape">${this._icon("mdi:vector-polygon")}${this._t("ed_shape")}</button>
           <button class="mchip" data-eddraw="focus">${this._icon("mdi:crosshairs-gps")}${this._t("ed_focus")}</button>
           ${r.tv ? `<button class="mchip" data-eddraw="screen">${this._icon("mdi:television")}${this._t("ed_screen")}</button>` : ""}`}
      </div>` : ""}
      <div class="ed-foot"><button class="cta" data-edcopy="1">${this._icon("mdi:content-copy")}${this._t("ed_copy")}</button></div>
      <textarea class="ed-yaml" id="edyaml" hidden readonly></textarea>`;
    this._renderEdSvg();
  }
  _renderEdSvg() {
    const svg = this._el("edsvg");
    if (!svg) return;
    const pts = (a) => a.map(([x, y]) => `${x},${y}`).join(" ");
    let out = "";
    this._rooms.filter((r) => r.shape).forEach((r) => {
      out += `<polygon points="${pts(r.shape)}" class="ed-poly ${this._sel === r.id ? "sel" : ""}"/>`;
      if (r.tv && r.tv.screen) out += `<polygon points="${pts(r.tv.screen)}" class="ed-poly scr"/>`;
    });
    const r = this._sel && this._rooms.find((x) => x.id === this._sel);
    if (r && !r.label) {
      const f = this._focus(r);
      out += `<circle cx="${f.x}" cy="${f.y}" r="1.1" class="ed-focus"/>`;
    }
    if (this._draft && this._draft.length) {
      out += `<polyline points="${pts(this._draft)}" class="ed-draft"/>`;
      this._draft.forEach(([x, y]) => { out += `<circle cx="${x}" cy="${y}" r=".7" class="ed-pt"/>`; });
    }
    svg.innerHTML = out;
    svg.classList.toggle("drawing", !!this._draw);
  }
  _houseXY(e) {
    const rect = this._el("tilt").getBoundingClientRect();
    return [Math.round(((e.clientX - rect.left) / rect.width) * 1000) / 10, Math.round(((e.clientY - rect.top) / rect.height) * 1000) / 10];
  }
  _edPointerDown(e) {
    if (!this._edit) return;
    const path = e.composedPath();
    const svg = this._el("edsvg");
    if (this._draw && path.includes(svg)) {
      const p = this._houseXY(e);
      const r = this._rooms.find((x) => x.id === this._sel);
      if (this._draw === "focus") { r.focus = { x: p[0], y: p[1] }; this._draw = null; this._renderEditor(); return; }
      this._draft.push(p);
      this._renderEdSvg();
      return;
    }
    /* przeciąganie panelu kalibracji za nagłówek */
    const hd = path.find((n) => n.classList && n.classList.contains("ed-hd"));
    if (hd && !path.find((n) => n.tagName === "BUTTON")) {
      e.preventDefault();
      const panel = this._el("edpanel"), box = this._el("house").getBoundingClientRect(), pr = panel.getBoundingClientRect();
      const ox = e.clientX - pr.left, oy = e.clientY - pr.top;
      const mv = (ev) => {
        panel.style.left = `${Math.max(0, Math.min(box.width - pr.width, ev.clientX - box.left - ox)) / box.width * 100}%`;
        panel.style.top = `${Math.max(0, Math.min(box.height - 40, ev.clientY - box.top - oy)) / box.height * 100}%`;
      };
      const upP = () => { window.removeEventListener("pointermove", mv); window.removeEventListener("pointerup", upP); };
      window.addEventListener("pointermove", mv);
      window.addEventListener("pointerup", upP);
      return;
    }
    const rz = path.find((n) => n.dataset && n.dataset.rz);
    const chip = path.find((n) => n.dataset && n.dataset.chip);
    if (!chip) return;
    e.preventDefault();
    const r = this._rooms.find((x) => x.id === chip.dataset.chip);
    if (!r) return;
    if (this._sel !== r.id) { this._sel = r.id; this._renderEditor(); }
    const rect = this._el("tilt").getBoundingClientRect();
    const sx = e.clientX, sy = e.clientY, o = { x: r.x, y: r.y, w: r.w, h: r.h };
    const move = (ev) => {
      const dx = ((ev.clientX - sx) / rect.width) * 100, dy = ((ev.clientY - sy) / rect.height) * 100;
      if (rz) { r.w = Math.max(4, Math.round((o.w + dx) * 10) / 10); r.h = Math.max(3, Math.round((o.h + dy) * 10) / 10); }
      else { r.x = Math.round((o.x + dx) * 10) / 10; r.y = Math.round((o.y + dy) * 10) / 10; }
      const el = this._root.querySelector(`[data-chip="${r.id}"]`);
      if (el) { el.style.left = `${r.x}%`; el.style.top = `${r.y}%`; el.style.width = `${r.w}%`; el.style.height = `${r.h}%`; }
    };
    const up = () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); this._renderHouse(); };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }
  _edFinish() {
    const r = this._rooms.find((x) => x.id === this._sel);
    if (r && this._draft.length > 2) {
      if (this._draw === "shape") { r.shape = this._draft; r.glow = this._bbox(r.shape); }
      if (this._draw === "screen" && r.tv) r.tv.screen = this._draft;
    }
    this._draw = null; this._draft = [];
    /* przebuduj warstwy z nowymi obrysami */
    const z = this._el("zoomer");
    z.querySelectorAll(".shades,.leds,.tvs").forEach((n) => n.remove());
    z.querySelector(".daylight").insertAdjacentHTML("afterend", this._layersHtml());
    this._renderHouse();
    this._renderEditor();
  }
  _edYaml() {
    const byId = Object.fromEntries(this._rooms.map((r) => [r.id, r]));
    const r1 = (v) => Math.round(Number(v) * 10) / 10;
    const rooms = lhcArr(this._cfg.rooms).map((src, i) => {
      const id = String(src.id || `room${i + 1}`);
      const r = byId[id];
      const out = { ...src };
      delete out.x; delete out.y; delete out.w; delete out.h;
      if (!src.id) out.id = id;
      if (!r) return out;
      out.chip = { x: r1(r.x), y: r1(r.y), w: r1(r.w), h: r1(r.h) };
      if (r.shape) out.shape = r.shape.map(([x, y]) => [r1(x), r1(y)]);
      if (r.focus) out.focus = { x: r1(r.focus.x), y: r1(r.focus.y) };
      if (r.tv && r.tv.screen) out.tv = { ...(src.tv || {}), screen: r.tv.screen.map(([x, y]) => [r1(x), r1(y)]) };
      return out;
    });
    return `rooms:\n${lhcYaml(rooms, 1)}\n`;
  }
  async _edCopy() {
    const y = this._edYaml();
    const ta = this._el("edyaml");
    try {
      await navigator.clipboard.writeText(y);
      alert(this._t("ed_copied"));
    } catch (e) {
      ta.hidden = false; ta.value = y; ta.focus(); ta.select();
      const hint = document.createElement("div");
      hint.className = "ed-hint"; hint.textContent = this._t("ed_yaml_manual");
      ta.before(hint);
    }
  }

  /* ---------- interakcje ---------- */
  _fire(type, detail) { this.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true })); }
  _more(id) { this._fire("hass-more-info", { entityId: id }); }

  _click(e) {
    const path = e.composedPath();
    const stop = path.indexOf(this._root);
    const keys = ["fnav", "toggle", "more", "nav", "room", "scene", "roomlights", "dn", "heatmap", "wake", "edit", "edsel", "eddraw", "edundo", "eddone", "edcopy", "edclose", "close"];
    const t = (stop >= 0 ? path.slice(0, stop) : path).find((n) => n.dataset && Object.keys(n.dataset).some((k) => keys.includes(k)));
    if (!t) return;
    const d = t.dataset;
    e.stopPropagation();
    if (d.wake) return this._hideSaver();
    if (d.fnav) return this._panFloor(Number(d.fnav));
    if (d.edit || d.edclose) return this._toggleEdit();
    if (this._edit) {
      if (d.edsel) { this._sel = d.edsel; this._draw = null; this._draft = []; this._renderHouse(); return this._renderEditor(); }
      if (d.eddraw) { this._draw = d.eddraw; this._draft = []; return this._renderEditor(); }
      if (d.edundo) { this._draft.pop(); return this._renderEdSvg(); }
      if (d.eddone) return this._edFinish();
      if (d.edcopy) return this._edCopy();
      if (d.room || d.close !== undefined) return;
    }
    if (d.close !== undefined) return this._closePop();
    if (d.dn) {
      this._dn = LHC_DN[(LHC_DN.indexOf(this._dn) + 1) % LHC_DN.length];
      this._save("lhc-dn", this._dn);
      this._renderAmbient();
      return this._updateLayers();
    }
    if (d.heatmap) {
      this._heatmap = !this._heatmap;
      this._save("lhc-heatmap", this._heatmap ? "1" : "0");
      this._el("house").classList.toggle("heatmap", this._heatmap);
      this._el("hmbtn").classList.toggle("on", this._heatmap);
      return this._renderHouse();
    }
    if (d.toggle) {
      const dom = d.toggle.split(".")[0];
      return this._hass.callService(["switch", "light", "fan", "input_boolean"].includes(dom) ? dom : "homeassistant", "toggle", { entity_id: d.toggle });
    }
    if (d.roomlights) {
      const ids = (this._lights[d.roomlights] || []).filter((id) => this._ok(id));
      const anyOn = ids.some((id) => this._on(id));
      return this._hass.callService("homeassistant", anyOn ? "turn_off" : "turn_on", { entity_id: ids });
    }
    if (d.room) {
      if (this._room === d.room) return this._closePop();
      return this._openRoom(d.room);
    }
    if (d.scene) return this._runScene(d.scene);
    if (d.nav) return lhcNavigate(d.nav);
    if (d.more) return this._more(d.more);
  }

  async _runScene(id) {
    const s = this._scenes.find((x) => x.id === id);
    if (!s) return;
    if (s.confirm && !confirm(s.confirm)) return;
    try {
      await lhcRunActions(this._hass, s.actions || s.tap_actions || []);
    } catch (err) {
      console.error("living-house-card scene", err);
      return;
    }
    this._scene = id;
    this._save("lhc-scene", id);
    this._renderScenes();
  }
}

const LHC_HOUSE_STYLE = `:host{display:block;container-type:inline-size;--txt:#eaf2ff;--dim:#9fb0cd;--line:rgba(255,255,255,.12);
  font-family:"Inter","Segoe UI",Roboto,system-ui,sans-serif;color:var(--txt)}
*{box-sizing:border-box}
button{font:inherit;color:inherit;background:none;border:0;padding:0;cursor:pointer}
ha-icon{--mdc-icon-size:20px;display:inline-flex}

/* ---------- tło ---------- */
.outer{position:relative;overflow:hidden;background:#040913;min-height:calc(100vh - var(--header-height,56px))}
.bg{position:absolute;inset:0;pointer-events:none;overflow:hidden}
.bg>*{position:absolute;inset:0}
.night{background:radial-gradient(ellipse at 50% 0%,#0d1730 0%,#040913 65%)}
.blur-img{inset:-12%;background:var(--img) center/cover no-repeat;filter:blur(70px) saturate(1.5) brightness(.42);transform:scale(1.15)}
.sky{opacity:calc(var(--day,0) * .95);transition:opacity 2s;
  background:linear-gradient(180deg,#4a8bd6 0%,#6aa3de 22%,#3d6a9f 52%,#1d3456 78%,#0f1d33 100%);
  filter:brightness(calc(1 - .5 * var(--cloud,0))) saturate(calc(1 - .55 * var(--cloud,0)))}
.dusk{opacity:var(--dusk,0);transition:opacity 2s;
  background:linear-gradient(0deg,rgba(255,138,76,.55) 0%,rgba(244,114,182,.25) 28%,rgba(124,58,237,.12) 48%,transparent 66%)}
.sun-glow{opacity:calc(var(--day,0) * (1 - var(--cloud,0)));transition:opacity 2s;
  background:radial-gradient(circle at 84% 8%,rgba(255,236,170,.75) 0,rgba(255,214,140,.35) 7%,rgba(255,200,120,.08) 22%,transparent 40%)}
.orb{inset:auto;border-radius:50%;filter:blur(60px);animation:drift 22s ease-in-out infinite alternate}
.o1{width:38%;height:48%;left:-6%;top:12%;background:#1d4ed8;opacity:calc(.55 * (1 - var(--day,0) * .7))}
.o2{width:32%;height:42%;right:-6%;top:30%;background:#7c3aed;animation-delay:-8s;opacity:calc(.35 * (1 - var(--day,0) * .7))}
.o3{width:30%;height:35%;left:35%;bottom:-18%;background:#f59e0b;animation-delay:-14s;opacity:.18}
.clouds{opacity:var(--cloud,0);transition:opacity 2s}
.cl{position:absolute;inset:auto;border-radius:50%;filter:blur(26px);
  background:radial-gradient(closest-side,rgba(var(--cc,140,155,190),.7),rgba(var(--cc,140,155,190),.25) 55%,transparent);
  animation:cloud linear infinite}
.c1{width:46%;height:26%;top:2%;left:-50%;animation-duration:95s;animation-delay:-20s}
.c2{width:38%;height:22%;top:16%;left:-50%;animation-duration:130s;animation-delay:-70s}
.c3{width:54%;height:30%;top:-6%;left:-50%;animation-duration:160s;animation-delay:-120s}
.c4{width:34%;height:20%;top:30%;left:-50%;animation-duration:110s;animation-delay:-45s;opacity:.6}
.c5{width:42%;height:24%;top:8%;left:-50%;animation-duration:145s;animation-delay:-5s}
.fog{opacity:calc(var(--fog,0) * .7);filter:blur(30px);animation:fog 40s ease-in-out infinite alternate;
  background:linear-gradient(180deg,transparent 30%,rgba(190,205,225,.35) 55%,rgba(190,205,225,.15) 70%,rgba(190,205,225,.4) 88%)}
.fx{width:100%;height:100%}
.vignette{background:radial-gradient(ellipse 30% 42% at 50% 50%,rgba(6,10,18,.92),rgba(6,10,18,.55) 60%,transparent 100%),radial-gradient(ellipse 80% 70% at 50% 45%,transparent 30%,rgba(3,7,16,calc(.75 - .45 * var(--day,0))) 100%)}
.flash{background:#dfe8ff;opacity:0}
.flash.go{animation:bolt 1.1s ease-out}

/* ---------- szkło (frosted) ---------- */
.glass{position:relative;
  background:linear-gradient(150deg,rgba(255,255,255,.11) 0%,rgba(255,255,255,.035) 45%,rgba(255,255,255,.02) 100%),rgba(12,20,40,.38);
  border:1px solid rgba(255,255,255,.13);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.22),inset 0 -1px 0 rgba(255,255,255,.04),0 14px 44px rgba(0,0,0,.45);
  backdrop-filter:blur(22px) saturate(160%);-webkit-backdrop-filter:blur(22px) saturate(160%)}
.glass::before{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;
  background:radial-gradient(120% 60% at 0% 0%,rgba(255,255,255,.10),transparent 55%)}

/* ---------- układ ---------- */
.wrap{position:relative;display:grid;gap:14px;padding:14px 18px 16px;
  grid-template-columns:260px minmax(0,1fr) 270px;grid-template-rows:auto minmax(0,1fr) auto;
  grid-template-areas:"hd hd hd" "l c r" "sc sc sc"}
.outer.fit{display:flex;align-items:center;justify-content:center;min-height:0}
.outer.fit .wrap{width:${LHC_BASE_W}px;height:${LHC_BASE_H}px;zoom:var(--z,1);grid-template-rows:60px minmax(0,1fr) 98px}
.hd{grid-area:hd;display:flex;align-items:center;gap:18px;min-width:0}
.left{grid-area:l;display:flex;flex-direction:column;gap:12px;min-width:0;min-height:0}
.right{grid-area:r;display:flex;flex-direction:column;gap:12px;min-width:0;min-height:0}
.outer.fit .status,.outer.fit .energy{flex:1;min-height:0}
.stage{grid-area:c;position:relative;min-width:0;min-height:0;display:grid;place-items:center}
.outer.fit .stage{container-type:size}
.house{position:relative;width:100%;max-width:980px;aspect-ratio:var(--ratio,1.11);container-type:inline-size;user-select:none;perspective:1600px}
.outer.fit .house{width:min(100cqw,calc(100cqh * var(--ratio,1.11)));max-width:none}
/* tall houses: bigger, the visible window moves floor by floor */
.outer.fit .stage.tall{overflow:hidden;place-items:start center}
.outer.fit .stage.tall .house{width:min(100cqw,calc(100cqh * 1.3));top:0;transition:top .6s cubic-bezier(.3,.8,.2,1)}
.stage.tall .hm-btn{top:calc(var(--vtop,0%) + 1%)}
.stage.tall .legend{bottom:auto;top:calc(var(--vtop,0%) + var(--vh,100%) - 6%)}
.stage.tall .pop{top:var(--vy,50%);max-height:calc(var(--vh,100%) * .9)}
.stage.tall .pop.center{top:calc(var(--vtop,0%) + var(--vh,100%) - 3%);bottom:auto;transform:translate(-50%,-100%)}
.fnav{position:absolute;z-index:6;width:48px;height:48px;border-radius:50%;display:grid;place-items:center;color:#e0f2fe;cursor:pointer;
  left:min(calc(50% + min(50cqw, 65cqh) + 14px), calc(100% - 54px));
  background:rgba(37,99,235,.28);border:1px solid rgba(147,197,253,.55);box-shadow:0 0 18px rgba(59,130,246,.35);opacity:.85;transition:opacity .25s,transform .25s}
.fnav ha-icon{--mdc-icon-size:30px}
.fnav:hover{opacity:1;transform:scale(1.1)}
.fnav.up{top:calc(50% - 56px)}.fnav.down{top:calc(50% + 8px)}
.fnav[hidden]{visibility:hidden;display:grid}
.house.zoomed ~ .fnav{opacity:0;pointer-events:none}
.scenes{grid-area:sc;display:flex;gap:12px;justify-content:center;align-items:center;overflow-x:auto;padding:4px 2px;scrollbar-width:none}
.scenes::-webkit-scrollbar,.nav::-webkit-scrollbar{display:none}

/* ---------- nagłówek ---------- */
.brand{display:flex;align-items:center;gap:12px;flex:none}
.logo{--mdc-icon-size:42px;color:#5b9dff;filter:drop-shadow(0 0 10px rgba(80,140,255,.75))}
.title{font-size:23px;font-weight:600;letter-spacing:.2px;white-space:nowrap}
.subtitle{font-size:13.5px;color:var(--dim)}
.nav{display:flex;gap:9px;flex:1;justify-content:center;overflow-x:auto;scrollbar-width:none;padding:6px}
.pill{display:flex;align-items:center;gap:8px;padding:9px 16px;border-radius:999px;white-space:nowrap;font-size:14.5px;transition:border-color .2s,box-shadow .2s,transform .2s}
.pill ha-icon{--mdc-icon-size:18px;color:#c8d6f0}
.pill:hover{border-color:rgba(147,197,253,.5);transform:translateY(-1px)}
.pill.active{background:linear-gradient(180deg,rgba(59,130,246,.45),rgba(29,78,216,.22));border-color:#3b82f6;box-shadow:0 0 18px rgba(59,130,246,.55),inset 0 0 12px rgba(59,130,246,.3),inset 0 1px 0 rgba(255,255,255,.3)}
.tools{display:flex;gap:10px;flex:none}
.round{width:48px;height:48px;border-radius:50%;display:grid;place-items:center;transition:border-color .2s}
.round:hover{border-color:rgba(147,197,253,.5)}
.round ha-icon{--mdc-icon-size:22px}
.round.sm{width:32px;height:32px}.round.sm ha-icon{--mdc-icon-size:17px}

/* ---------- panele ---------- */
.panel{border-radius:18px;padding:13px 16px;overflow:hidden}
.p-title{display:flex;align-items:center;gap:9px;font-size:18px;font-weight:600;margin-bottom:6px}
.t-ic{--mdc-icon-size:22px}
.dim{color:var(--dim);font-size:14px;font-weight:400}
.muted{color:var(--dim);font-size:13px}.pad{padding:8px 4px}
.blue{color:#60a5fa}.amber{color:#f59e4c}.yellow{color:#facc15}.green{color:#4ade80}.mint{color:#5eead4}.grey{color:#64748b}.hot{color:#fb7a3c}
[data-more],[data-room]{cursor:pointer}

.w-top{display:flex;align-items:center;gap:12px}
.w-icon ha-icon{--mdc-icon-size:64px;filter:drop-shadow(0 4px 14px rgba(255,220,140,.25));animation:float 6s ease-in-out infinite}
.w-temp{font-size:42px;font-weight:300;line-height:1;color:#dbe9ff}
.w-temp span{font-size:26px}
.w-cond{font-size:14.5px;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:150px}
.w-loc{font-size:12.5px;color:var(--dim);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:150px}
.stale{color:#f59e0b}
.w-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px;font-size:14px}
.w-grid div{display:flex;align-items:center;gap:7px}
.w-grid ha-icon{--mdc-icon-size:18px}

.status{display:flex;flex-direction:column}
.s-head{display:flex;align-items:center;gap:10px;padding-bottom:9px;border-bottom:1px solid var(--line);font-size:14.5px}
.s-head ha-icon{--mdc-icon-size:24px}
.s-row{display:flex;align-items:center;gap:13px;padding:8px 6px;margin:0 -6px;border-bottom:1px solid var(--line);border-radius:10px;transition:background .2s;flex:1}
.s-row:hover{background:rgba(255,255,255,.05)}
.s-row:last-child{border-bottom:0}
.s-ic{--mdc-icon-size:27px;flex:none}
.s-name{font-size:14.5px;font-weight:500}.s-val{font-size:12.8px;color:var(--dim);margin-top:1px}

.h-row{display:flex;align-items:center;gap:10px;padding:2px 6px;margin:0 -6px;border-radius:10px;transition:background .2s}
.h-row:hover{background:rgba(255,255,255,.05)}
.h-ic ha-icon{--mdc-icon-size:22px}
.h-row.on .h-ic ha-icon{filter:drop-shadow(0 0 6px rgba(251,122,60,.8));animation:pulse 2s ease-in-out infinite}
.h-name{flex:1;font-size:14px;line-height:1.15}.h-name small{display:block;font-size:11px;color:var(--dim)}
.h-val{font-size:14px;padding:5px 9px;border-radius:10px;background:rgba(4,9,20,.45);border:1px solid var(--line);min-width:60px;text-align:center}

.a-row{display:flex;align-items:center;gap:12px;padding:6px 0}
.a-row+.a-row{border-top:1px solid var(--line)}
.a-dev{--mdc-icon-size:28px;color:#cbd5e1}
.a-name{flex:1;font-size:14.5px}.a-name small{display:block;font-size:12px;color:var(--dim)}
.a-val{font-size:14.5px}
.power{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;color:#64748b;border:1px solid var(--line);transition:.25s}
.power.on{color:#4ade80;border-color:rgba(74,222,128,.55);box-shadow:0 0 14px rgba(74,222,128,.5),inset 0 0 8px rgba(74,222,128,.25)}

.energy{display:flex;flex-direction:column}
.e-now{font-size:34px;font-weight:500;color:#7cc4ff;line-height:1.1;text-shadow:0 0 18px rgba(96,165,250,.45)}.e-now span{font-size:24px;color:#cfe3ff}
.spark{flex:1 1 0;min-height:18px;max-height:70px;margin:2px 0 4px}.spark svg{width:100%;height:100%;display:block;overflow:visible}
.spark .line{stroke-dasharray:1;stroke-dashoffset:1;animation:draw 1.6s ease-out forwards}
.spark .live{animation:blink 1.6s ease-in-out infinite;filter:drop-shadow(0 0 4px #34d399)}
.e-row{display:flex;justify-content:space-between;font-size:14px;padding:3px 0;color:var(--dim)}.e-row b{color:var(--txt);font-weight:500}

/* ---------- dom ---------- */
.tilt{position:absolute;inset:0;transition:transform .35s ease-out;overflow:hidden;border-radius:24px;
  -webkit-mask-image:radial-gradient(ellipse 62% 60% at 50% 50%,#000 70%,transparent 100%);mask-image:radial-gradient(ellipse 62% 60% at 50% 50%,#000 70%,transparent 100%)}
.house:not(.zoomed) .tilt{-webkit-mask-image:none;mask-image:none;overflow:visible}
.zoomer{position:absolute;inset:0;transition:transform .9s cubic-bezier(.2,.75,.15,1);will-change:transform}
.zoomer img,.daylight{transition:filter 1.5s,opacity 1.5s;
  filter:brightness(calc((1 + .2 * var(--day,0)) * var(--hmb,1))) saturate(calc((1 - .1 * var(--day,0)) * var(--hms,1)))}
.house.heatmap{--hmb:.8;--hms:.4}
.daylight{position:absolute;inset:0;pointer-events:none;mix-blend-mode:soft-light;opacity:calc(var(--day,0) * .9);
  background:linear-gradient(180deg,rgba(200,228,255,.9),rgba(255,240,215,.6));
  -webkit-mask-image:radial-gradient(ellipse 60% 58% at 50% 50%,#000 68%,transparent 100%);mask-image:radial-gradient(ellipse 60% 58% at 50% 50%,#000 68%,transparent 100%)}
.zoomer img{width:100%;height:100%;display:block;border-radius:6px;
  -webkit-mask-image:radial-gradient(ellipse 60% 58% at 50% 50%,#000 68%,transparent 100%);mask-image:radial-gradient(ellipse 60% 58% at 50% 50%,#000 68%,transparent 100%)}
.glows,.chips{position:absolute;inset:0}
.glows{pointer-events:none}
.glow{position:absolute;border-radius:50%;transition:opacity 1.2s ease,background 1.2s ease}
.glow.dark{background:radial-gradient(closest-side,rgba(2,6,18,.55),rgba(2,6,18,0))}
.glow.lit{background:radial-gradient(closest-side,rgba(255,190,110,.18),rgba(255,190,110,0));mix-blend-mode:screen;animation:breathe 6s ease-in-out infinite}
/* światła pokoi, LED, telewizory */
.shades,.leds,.tvs{position:absolute;inset:0;pointer-events:none;transition:opacity .6s}
.shades{filter:blur(5px)}
.shade{position:absolute;inset:0;opacity:0;transition:opacity 1.4s ease;
  background:linear-gradient(170deg,rgb(10,16,38) 0%,rgb(4,8,20) 60%,rgb(3,6,14) 100%)}
.leds{filter:blur(7px);mix-blend-mode:screen}
.led{position:absolute;inset:0;opacity:0;transition:opacity 1.2s ease;
  background:radial-gradient(ellipse at 50% 35%,rgba(var(--led,255,120,200),.45),rgba(var(--led,255,120,200),.14) 60%,transparent 92%)}
.tvglow-clip{position:absolute;inset:0}
.tvglow{position:absolute;border-radius:50%;opacity:0;transition:opacity 1.2s;mix-blend-mode:screen;filter:blur(6px);
  background:radial-gradient(closest-side,rgba(110,150,255,.6),rgba(150,95,255,.28) 55%,transparent)}
.tvglow.on{animation:tv 5.5s ease-in-out infinite}
.tvscreen{position:absolute;inset:0;opacity:0;transition:opacity 1.2s;
  background:linear-gradient(140deg,#06080e 0%,#141a27 42%,#0b0f18 58%,#05070c 100%)}
.tvscreen.off{opacity:.97}
.l-ic.tvc{color:#a78bfa}
.house.heatmap .shades,.house.heatmap .leds,.house.heatmap .tvglow-clip{opacity:0}
.glow.hm{mix-blend-mode:color;background:radial-gradient(closest-side,hsla(var(--h),95%,52%,.95),hsla(var(--h),95%,52%,.6) 55%,hsla(var(--h),95%,52%,0) 100%);animation:none}
.glow.hm::after{content:"";position:absolute;inset:8%;border-radius:50%;mix-blend-mode:screen;background:radial-gradient(closest-side,hsla(var(--h),95%,60%,.28),transparent);animation:breathe 4s ease-in-out infinite}
.chip.hmc{border-color:hsla(var(--h),90%,62%,.75);box-shadow:0 0 1.8cqw hsla(var(--h),90%,55%,.5),inset 0 1px 0 rgba(255,255,255,.2)}
.chip.hmc .c-line span{color:hsl(var(--h),95%,75%);font-weight:600}
.hm-btn{position:absolute;top:1%;right:1%;z-index:4;display:flex;align-items:center;gap:6px;padding:7px 12px;border-radius:999px;font-size:13px;transition:.25s}
.hm-btn ha-icon{--mdc-icon-size:17px;color:#fdba74}
.hm-btn:hover{border-color:rgba(253,186,116,.6)}
.hm-btn.on{border-color:#fb923c;background:linear-gradient(180deg,rgba(251,146,60,.4),rgba(234,88,12,.15));box-shadow:0 0 16px rgba(251,146,60,.5),inset 0 1px 0 rgba(255,255,255,.25)}
.legend{position:absolute;left:50%;bottom:1.5%;transform:translateX(-50%);z-index:4;display:none;align-items:center;gap:8px;padding:6px 12px;border-radius:999px;font-size:12px;color:var(--dim)}
.legend i{width:130px;height:8px;border-radius:4px;background:linear-gradient(90deg,hsl(215,90%,55%),hsl(200,90%,55%),hsl(165,90%,50%),hsl(95,90%,50%),hsl(48,95%,55%),hsl(30,95%,55%),hsl(8,95%,55%))}
.house.heatmap .legend{display:flex}
.house.zoomed .hm-btn,.house.zoomed .legend{opacity:0;pointer-events:none}
#dn.forced{border-color:rgba(251,191,36,.6);box-shadow:0 0 12px rgba(251,191,36,.35),inset 0 1px 0 rgba(255,255,255,.2)}

/* ---------- wygaszacz (tablet) ---------- */
.saver{position:fixed;inset:0;z-index:50;background:radial-gradient(ellipse at 50% 30%,#0b1428,#02050c 70%);display:flex;align-items:center;justify-content:center;cursor:pointer;overflow:hidden}
.saver[hidden]{display:none}
.saver.show{animation:fadein 1.2s ease both}
.sv-img{position:absolute;inset:0;background:var(--img) center/contain no-repeat;opacity:.18;animation:kenburns 50s ease-in-out infinite alternate}
.sv-body{position:relative;text-align:center;animation:wander 90s ease-in-out infinite alternate}
.sv-time{font-size:clamp(90px,17vw,240px);font-weight:200;line-height:1;letter-spacing:-.02em;color:#e8f1ff;text-shadow:0 0 50px rgba(96,165,250,.35)}
.sv-colon{animation:blink 2s steps(1) infinite;padding:0 .02em}
.sv-date{font-size:clamp(18px,2.6vw,32px);color:var(--dim);margin:8px 0 36px}
.sv-date::first-letter{text-transform:uppercase}
.sv-row{display:flex;gap:clamp(20px,5vw,56px);justify-content:center;flex-wrap:wrap}
.sv-row>div{display:flex;align-items:center;gap:10px}
.sv-row ha-icon{--mdc-icon-size:clamp(26px,3vw,38px)}
.sv-row b{font-size:clamp(24px,3.2vw,40px);font-weight:400}
.sv-row span{color:var(--dim);font-size:clamp(13px,1.4vw,17px)}
.sv-hint{margin-top:44px;color:#475569;font-size:14px;letter-spacing:.08em}
.spot{position:absolute;inset:-2px;opacity:0;pointer-events:none;transition:opacity .7s ease;cursor:zoom-out;
  background:radial-gradient(circle at var(--sx,50%) var(--sy,50%),transparent 0,transparent 24%,rgba(3,7,16,.55) 46%,rgba(3,7,16,.82) 75%)}
.house.zoomed .spot{opacity:1;pointer-events:auto}
.house.zoomed .chips{opacity:0;pointer-events:none;transform:scale(.96)}
.chips{transition:opacity .35s ease,transform .35s ease}

.chip{position:absolute;display:flex;flex-direction:column;justify-content:center;gap:.35cqw;padding:.5cqw 1.1cqw;border-radius:1.2cqw;
  background:linear-gradient(150deg,rgba(255,255,255,.14),rgba(255,255,255,.04) 50%),rgba(10,16,30,.55);
  text-align:left;overflow:hidden;white-space:nowrap;font-size:clamp(8px,1.62cqw,17px);
  transition:border-color .3s,box-shadow .3s,transform .2s;backdrop-filter:blur(14px) saturate(150%);-webkit-backdrop-filter:blur(14px) saturate(150%)}
.chip:hover{transform:translateY(-2px) scale(1.03);border-color:rgba(147,197,253,.6);box-shadow:0 0 2.2cqw rgba(59,130,246,.45),inset 0 1px 0 rgba(255,255,255,.25)}
.chip.lit{border-color:rgba(250,204,21,.35)}
.chip.heat{box-shadow:0 0 1.6cqw rgba(251,122,60,.35),inset 0 1px 0 rgba(255,255,255,.2)}
.chip.label{flex-direction:row;align-items:center;gap:.8cqw;border-radius:999px;font-size:clamp(9px,1.95cqw,20px);cursor:default}
.chip.label:hover{transform:none;box-shadow:inset 0 1px 0 rgba(255,255,255,.22);border-color:rgba(255,255,255,.13)}
.chip ha-icon{--mdc-icon-size:clamp(10px,2cqw,21px)}
.chip.label ha-icon{--mdc-icon-size:clamp(11px,2.5cqw,26px)}
.c-top{display:flex;align-items:center;gap:.7cqw;font-weight:600}
.c-line{display:flex;align-items:center;gap:.8cqw;color:#e6eefc}
.c-line .small{color:var(--dim);font-size:.85em}
.dot{width:.5cqw;height:.5cqw;border-radius:50%;background:#94a3b8;margin-left:.2cqw}
.ping{position:absolute;top:.7cqw;right:.8cqw;width:.75cqw;height:.75cqw;border-radius:50%}
.ping.hot{background:#fb7a3c}.ping.mint{background:#5eead4}
.ping::after{content:"";position:absolute;inset:0;border-radius:50%;background:inherit;animation:ping 1.8s cubic-bezier(0,0,.2,1) infinite}

/* ---------- panel pokoju ---------- */
.pop{position:absolute;z-index:5;border-radius:20px;padding:14px 16px;overflow:auto;scrollbar-width:thin;
  right:2%;top:50%;transform:translateY(-50%);width:min(44%,380px);max-height:92%;
  background:linear-gradient(150deg,rgba(255,255,255,.13),rgba(255,255,255,.03) 50%),rgba(8,14,28,.62)}
.pop.center{left:50%;right:auto;top:auto;bottom:3%;transform:translateX(-50%)}
.pop[hidden]{display:none}
.pop.show{animation:popin .55s cubic-bezier(.2,.8,.2,1) both}
.pop.center.show{animation:popinc .45s cubic-bezier(.2,.8,.2,1) both}
.pop-hd{display:flex;justify-content:space-between;align-items:center;font-size:19px;font-weight:600;margin-bottom:8px}
.hero{display:flex;gap:16px;padding:6px 0 10px}
.hero-v{display:flex;align-items:baseline;gap:4px}
.hero-v ha-icon{--mdc-icon-size:20px;align-self:center}
.hero-v b{font-size:26px;font-weight:500}.hero-v span{color:var(--dim);font-size:14px}
.tags{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:6px}
.tag{display:inline-flex;align-items:center;gap:6px;font-size:12.5px;padding:5px 10px;border-radius:999px;border:1px solid var(--line);background:rgba(255,255,255,.05)}
.tag ha-icon{--mdc-icon-size:15px}
.tag.hot{color:#fdba74;border-color:rgba(251,122,60,.4)}
.tag.btn:hover{border-color:rgba(147,197,253,.6);background:rgba(59,130,246,.15)}
.p-row{display:flex;align-items:center;gap:10px;padding:7px 0;border-top:1px solid var(--line)}
.p-main{flex:1;display:flex;align-items:center;gap:12px;font-size:14px}
.p-main small{color:var(--dim);font-size:12px}
.p-ic{--mdc-icon-size:21px;color:#94a3b8}
.tog{width:44px;height:24px;border-radius:12px;background:rgba(100,116,139,.45);position:relative;flex:none;transition:.25s;border:1px solid var(--line)}
.tog i{position:absolute;top:2px;left:2px;width:18px;height:18px;border-radius:50%;background:#cbd5e1;transition:.25s}
.tog.on{background:#2563eb;box-shadow:0 0 12px rgba(59,130,246,.65)}.tog.on i{left:22px;background:#fff}

/* ---------- sceny ---------- */
.scene{flex:none;width:150px;height:90px;border-radius:18px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;transition:transform .2s,border-color .2s,box-shadow .2s}
.scene ha-icon{--mdc-icon-size:30px;margin-bottom:3px;transition:transform .3s}
.scene:hover{transform:translateY(-3px);border-color:rgba(147,197,253,.5)}
.scene:hover ha-icon{transform:scale(1.12)}
.scene:active{transform:translateY(0) scale(.97)}
.scene.active{background:linear-gradient(180deg,rgba(59,130,246,.5),rgba(29,78,216,.2));border:1.5px solid #3b82f6;box-shadow:0 0 22px rgba(59,130,246,.6),inset 0 0 16px rgba(59,130,246,.3),inset 0 1px 0 rgba(255,255,255,.3)}
.sc-name{font-size:15.5px;font-weight:600}.sc-sub{font-size:12px;color:var(--dim)}
.scene.plus{width:70px;height:70px}.scene.plus ha-icon{--mdc-icon-size:30px;margin:0}

/* ---------- animacje ---------- */
.rise{animation:rise .7s cubic-bezier(.2,.8,.2,1) both;animation-delay:calc(var(--d,0) * 90ms)}
.house{animation:appear 1.1s ease-out both}
@keyframes rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes appear{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:none}}
@keyframes popin{from{opacity:0;transform:translate(24px,-50%)}to{opacity:1;transform:translate(0,-50%)}}
@keyframes popinc{from{opacity:0;transform:translate(-50%,18px)}to{opacity:1;transform:translate(-50%,0)}}
@keyframes pulse{50%{opacity:.55}}
@keyframes breathe{50%{opacity:.6}}
@keyframes ping{75%,100%{transform:scale(2.6);opacity:0}}
@keyframes blink{50%{opacity:.35}}
@keyframes draw{to{stroke-dashoffset:0}}
@keyframes float{50%{transform:translateY(-4px)}}
@keyframes drift{to{transform:translate(8%,6%) scale(1.12)}}
@keyframes tv{0%{opacity:.75;filter:blur(6px) hue-rotate(0deg)}11%{opacity:.5}19%{opacity:.88;filter:blur(6px) hue-rotate(35deg)}31%{opacity:.58}
  46%{opacity:.92;filter:blur(6px) hue-rotate(-30deg)}58%{opacity:.52}71%{opacity:.82;filter:blur(6px) hue-rotate(18deg)}84%{opacity:.6}100%{opacity:.75;filter:blur(6px) hue-rotate(0deg)}}
@keyframes cloud{from{transform:translateX(0)}to{transform:translateX(420%)}}
@keyframes fog{to{transform:translateX(6%)}}
@keyframes bolt{0%{opacity:0}4%{opacity:.5}9%{opacity:.05}14%{opacity:.35}35%,100%{opacity:0}}
@keyframes fadein{from{opacity:0}to{opacity:1}}
@keyframes kenburns{from{transform:scale(1)}to{transform:scale(1.12) translate(-2%,1%)}}
@keyframes wander{0%{transform:translate(-3%,-2%)}50%{transform:translate(2%,3%)}100%{transform:translate(3%,-3%)}}
@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important}}

/* ---------- tryb przewijany (telefon / wąskie okno) ---------- */
@container (max-width:1180px){
  .outer.fluid .wrap{grid-template-columns:1fr 1fr;grid-template-areas:"hd hd" "c c" "l r" "sc sc"}
  .outer.fluid .scenes{justify-content:flex-start}
}
@container (max-width:1000px){ .outer.fluid .hd{flex-wrap:wrap}.outer.fluid .nav{order:3;flex-basis:100%;justify-content:flex-start} }
@container (max-width:680px){
  .outer.fluid .wrap{grid-template-columns:minmax(0,1fr);grid-template-areas:"hd" "c" "l" "r" "sc";padding:12px 12px 18px}
  .outer.fluid .title{font-size:20px}.outer.fluid .logo{--mdc-icon-size:36px}.outer.fluid .round{width:42px;height:42px}
  .outer.fluid .scene{width:118px;height:86px}
  .outer.fluid .pop{left:3%;right:3%;width:auto;top:auto;bottom:2%;transform:none;max-height:62%}
  .outer.fluid .pop.center{left:3%;transform:none}
  .outer.fluid .pop.show,.outer.fluid .pop.center.show{animation:popm .45s cubic-bezier(.2,.8,.2,1) both}
}
@keyframes popm{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
@container (max-width:620px){ .c-line .small{display:none} }

/* ---------- brak obrazka ---------- */
.noimg{position:absolute;inset:8%;display:grid;place-items:center;text-align:center;padding:24px;border-radius:24px;border:2px dashed rgba(147,197,253,.35);color:var(--dim);font-size:15px;line-height:1.5}

/* ---------- tryb kalibracji ---------- */
.edsvg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible;z-index:3}
.edsvg.drawing{pointer-events:auto;cursor:crosshair}
.ed-poly{fill:rgba(96,165,250,.08);stroke:rgba(147,197,253,.55);stroke-width:.25;stroke-dasharray:1 .6;vector-effect:non-scaling-stroke}
.ed-poly.sel{fill:rgba(250,204,21,.16);stroke:#facc15;stroke-width:.4;stroke-dasharray:none}
.ed-poly.scr{fill:rgba(167,139,250,.2);stroke:#a78bfa}
.ed-draft{fill:rgba(52,211,153,.12);stroke:#34d399;stroke-width:.4;vector-effect:non-scaling-stroke}
.ed-pt{fill:#34d399;stroke:#fff;stroke-width:.15}
.ed-focus{fill:none;stroke:#f472b6;stroke-width:.45}
.house.editing .chip{cursor:move;outline:1px dashed rgba(147,197,253,.55);outline-offset:2px}
.house.editing .chip:hover{transform:none}
.house.editing .chip.sel{outline:2px solid #facc15;box-shadow:0 0 18px rgba(250,204,21,.45)}
.house.editing .hm-btn,.house.editing .legend{display:none}
.rz{position:absolute;right:-1px;bottom:-1px;width:14px;height:14px;border-radius:4px 0 4px 0;background:#facc15;cursor:nwse-resize;box-shadow:0 0 6px rgba(0,0,0,.5)}
.edpanel{position:absolute;left:1%;top:1%;z-index:6;width:min(46%,360px);border-radius:18px;padding:12px 14px;display:flex;flex-direction:column;gap:10px;font-size:13px}
.edpanel[hidden]{display:none}
.ed-hd{display:flex;align-items:center;gap:8px;font-size:15px;cursor:grab;user-select:none}.ed-hd b{flex:1}
.ed-hd ha-icon{--mdc-icon-size:20px;color:#facc15}
.ed-hint{color:var(--dim);line-height:1.4}
.ed-rooms,.ed-acts{display:flex;gap:6px;flex-wrap:wrap}
.mchip{display:inline-flex;align-items:center;gap:5px;padding:6px 11px;border-radius:999px;font-size:12.5px;border:1px solid var(--line);background:rgba(255,255,255,.05);transition:.2s}
.mchip ha-icon{--mdc-icon-size:15px}
.mchip:hover{border-color:rgba(147,197,253,.6)}
.mchip.on{background:linear-gradient(180deg,rgba(59,130,246,.45),rgba(29,78,216,.2));border-color:#3b82f6;box-shadow:0 0 12px rgba(59,130,246,.45)}
.ed-foot{display:flex;justify-content:flex-end}
.cta{display:inline-flex;align-items:center;gap:7px;padding:9px 15px;border-radius:999px;font-weight:600;font-size:13px;background:linear-gradient(180deg,rgba(59,130,246,.55),rgba(29,78,216,.3));border:1px solid rgba(96,165,250,.7);box-shadow:0 0 16px rgba(59,130,246,.35)}
.cta ha-icon{--mdc-icon-size:16px}
.ed-yaml{width:100%;height:160px;resize:vertical;background:rgba(3,7,16,.7);color:#e2e8f0;border:1px solid var(--line);border-radius:10px;padding:8px;font:12px/1.4 ui-monospace,Consolas,monospace}
.ed-yaml[hidden]{display:none}

/* status: zagęszczanie, gdy brakuje miejsca */
.status.tight .s-row{padding:4px 6px}
.status.tight .s-ic{--mdc-icon-size:22px}
.status.tight .s-name{font-size:13.5px}
.status.tight .s-val{font-size:12px}
.status.tight .s-head{padding-bottom:6px}
.status.tighter .s-val{display:none}
.status.tighter .s-row{padding:3px 6px}
`;

if (!customElements.get("living-house-card")) {
  customElements.define("living-house-card", LivingHouseCard);
  window.customCards = window.customCards || [];
  window.customCards.push({ type: "living-house-card", name: "Living House Card", description: "Living 3D house dashboard: lights, TV glow, weather, day/night, heat map.", preview: true, documentationURL: "https://github.com/krystianokris/living-house-card" });
}


/* ---------- Visual editor for living-house-card ----------
 * Dropdown with ready-made houses + a simple form per room (name, lights, temperature, TV, hide).
 * Uses Home Assistant's own <ha-form>, so entity pickers look and work like in built-in cards.
 */
const LHC_ED_TXT = {
  en: {
    house: "House", own: "My own picture (YAML / calibration)", image: "Picture URL", title: "Title", weather: "Weather",
    main_thermostat: "Main thermostat", heating: "Heating (thermostats / TRVs)", rooms: "Rooms",
    rooms_hint: "Open a room and pick its lights, temperature sensor and TV. Rooms you don't have – switch on \"Hide\".",
    own_hint: "With your own picture, rooms and their positions are set in YAML or with the calibration mode (button on the card).",
    img_warn: "This card has its own picture, so the ready-made house is not shown. Switch to the ready-made house? Your own picture and room positions will be removed from this card (lights and sensors stay).",
    img_btn: "Use the ready-made house",
    name: "Name (optional)", lights: "Lights", temperature: "Temperature (sensor or thermostat)", humidity: "Humidity",
    tv: "TV / media player", hide: "Hide this room", hidden: "hidden", set: "set",
  },
  pl: {
    house: "Dom", own: "Własny obrazek (YAML / kalibracja)", image: "Adres obrazka", title: "Tytuł", weather: "Pogoda",
    main_thermostat: "Główny termostat", heating: "Ogrzewanie (termostaty / głowice)", rooms: "Pokoje",
    rooms_hint: "Rozwiń pokój i wybierz jego światła, czujnik temperatury i TV. Pokoje, których nie masz – włącz „Ukryj”.",
    own_hint: "Przy własnym obrazku pokoje i ich położenie ustawiasz w YAML albo trybem kalibracji (przycisk na karcie).",
    img_warn: "Ta karta ma własny obrazek, więc gotowy dom nie jest pokazywany. Przełączyć na gotowy dom? Własny obrazek i położenie pokoi zostaną usunięte z tej karty (światła i czujniki zostają).",
    img_btn: "Użyj gotowego domu",
    name: "Nazwa (opcjonalnie)", lights: "Światła", temperature: "Temperatura (czujnik lub termostat)", humidity: "Wilgotność",
    tv: "TV / odtwarzacz", hide: "Ukryj ten pokój", hidden: "ukryty", set: "ustawiony",
  },
};
const LHC_PRESET_NAMES = {
  "2-bedrooms": ["2 bedrooms", "2 sypialnie"], "3-bedrooms": ["3 bedrooms", "3 sypialnie"],
  basement: ["2 bedrooms + basement", "2 sypialnie + piwnica"], attic: ["2 bedrooms + attic", "2 sypialnie + poddasze"],
  "3-bedrooms-basement": ["3 bedrooms + basement", "3 sypialnie + piwnica"], "3-bedrooms-attic": ["3 bedrooms + attic", "3 sypialnie + poddasze"],
  "basement-attic": ["2 bedrooms + basement + attic", "2 sypialnie + piwnica + poddasze"],
  "3-bedrooms-basement-attic": ["3 bedrooms + basement + attic", "3 sypialnie + piwnica + poddasze"],
};

class LivingHouseCardEditor extends HTMLElement {
  setConfig(config) { this._config = { ...config }; this._render(); }
  set hass(hass) {
    this._hass = hass;
    if (this._root) this._root.querySelectorAll("ha-form").forEach((f) => { f.hass = hass; });
    else this._render();
  }
  connectedCallback() { this._loadHaForm().then(() => this._render(true)); }

  async _loadHaForm() {
    if (customElements.get("ha-form") && customElements.get("ha-selector")) return;
    try {
      const h = window.loadCardHelpers && (await window.loadCardHelpers());
      if (h) for (const type of ["entities", "tile"]) {
        const c = await h.createCardElement(type === "tile" ? { type, entity: "sun.sun" } : { type, entities: [] });
        if (c && c.constructor.getConfigElement) await c.constructor.getConfigElement();
        if (customElements.get("ha-form")) break;
      }
    } catch (e) { /* ignore – fallback message below */ }
    await Promise.race([customElements.whenDefined("ha-form"), new Promise((r) => setTimeout(r, 3000))]);
  }

  get _lang() { return lhcLang(this._hass, this._config); }
  _tx(k) { return (LHC_ED_TXT[this._lang] || LHC_ED_TXT.en)[k] || LHC_ED_TXT.en[k] || k; }
  _rooms() { return lhcArr(this._config && this._config.rooms); }
  _user(id) { return this._rooms().find((r) => r && String(r.id) === id) || {}; }

  _render(force) {
    if (!this._config || !this._hass) return;
    if (!customElements.get("ha-form")) { if (!this._root) this.innerHTML = "<p>Loading…</p>"; return; }
    const key = `${this._config.preset || ""}|${this._lang}`;
    if (this._root && this._key === key && !force) { this._sync(); return; }
    this._key = key;
    const pl = this._lang === "pl" ? 1 : 0;
    const preset = this._config.preset && LHC_PRESETS[this._config.preset] ? this._config.preset : "";
    this.innerHTML = `
      <style>
        .lhc-ed{display:flex;flex-direction:column;gap:12px}
        .lhc-ed .warn{border:1px solid var(--warning-color,#f59e0b);border-radius:12px;padding:10px 12px;font-size:13px;line-height:1.4}
        .lhc-ed .warn button{margin-top:8px;padding:6px 12px;border-radius:999px;border:0;cursor:pointer;background:var(--primary-color);color:var(--text-primary-color,#fff);font:inherit}
        .lhc-ed img.thumb{width:100%;max-height:220px;object-fit:contain;border-radius:12px;background:#0b1220}
        .lhc-ed h3{margin:8px 0 0;font-size:16px;font-weight:500}
        .lhc-ed .hint{margin:0;color:var(--secondary-text-color);font-size:13px;line-height:1.4}
        .lhc-ed details{border:1px solid var(--divider-color,#ccc);border-radius:12px;padding:0 12px}
        .lhc-ed summary{cursor:pointer;padding:12px 0;display:flex;align-items:center;gap:10px;font-weight:500;list-style:none}
        .lhc-ed summary::-webkit-details-marker{display:none}
        .lhc-ed summary .tag{margin-left:auto;font-size:12px;font-weight:400;color:var(--secondary-text-color)}
        .lhc-ed summary .tag.on{color:var(--primary-color)}
        .lhc-ed details[open] summary{border-bottom:1px solid var(--divider-color,#ccc);margin-bottom:12px}
        .lhc-ed details > ha-form{display:block;padding-bottom:12px}
      </style>
      <div class="lhc-ed">
        <ha-form data-form="top"></ha-form>
        ${preset && this._config.image ? `<div class="warn">${this._tx("img_warn")}<br><button type="button" data-dropimg>${this._tx("img_btn")}</button></div>` : ""}
        ${preset ? `<img class="thumb" src="${lhcEsc(lhcPresetImage({ ...this._config, preset }))}" alt="">` : ""}
        ${preset ? `<h3>${this._tx("rooms")}</h3><p class="hint">${this._tx("rooms_hint")}</p>
          ${LHC_PRESETS[preset].rooms.filter((g) => !g.label).map((g) => {
            const m = LHC_ROOM_META[g.id] || ["mdi:home-outline", g.id, g.id];
            return `<details data-room="${g.id}"><summary><ha-icon icon="${m[0]}"></ha-icon><span class="nm"></span><span class="tag"></span></summary><ha-form data-form="${g.id}"></ha-form></details>`;
          }).join("")}`
        : `<p class="hint">${this._tx("own_hint")}</p>`}
      </div>`;
    this._root = this.querySelector(".lhc-ed");
    const top = this._root.querySelector('[data-form="top"]');
    top.schema = [
      { name: "preset", selector: { select: { mode: "dropdown", options: [
        ...Object.keys(LHC_PRESETS).map((k) => ({ value: k, label: (LHC_PRESET_NAMES[k] || [k, k])[pl] })),
        { value: "own", label: this._tx("own") },
      ] } } },
      ...(preset ? [] : [{ name: "image", selector: { text: {} } }]),
      { name: "title", selector: { text: {} } },
      { name: "weather", selector: { entity: { domain: "weather" } } },
      { name: "main_thermostat", selector: { entity: { domain: "climate" } } },
      { name: "heating", selector: { entity: { domain: "climate", multiple: true } } },
    ];
    top.computeLabel = (s) => this._tx(s.name === "preset" ? "house" : s.name);
    top.addEventListener("value-changed", (e) => this._topChanged(e.detail.value));
    const drop = this._root.querySelector("[data-dropimg]");
    if (drop) drop.addEventListener("click", () => this._usePreset());
    this._root.querySelectorAll("details > ha-form").forEach((f) => {
      const id = f.dataset.form;
      f.schema = [
        { name: "name", selector: { text: {} } },
        { name: "lights", selector: { entity: { domain: "light", multiple: true } } },
        { name: "temperature", selector: { entity: { domain: ["sensor", "climate"] } } },
        { name: "humidity", selector: { entity: { domain: "sensor" } } },
        { name: "tv", selector: { entity: { domain: "media_player", multiple: true } } },
        { name: "hide", selector: { boolean: {} } },
      ];
      f.computeLabel = (s) => this._tx(s.name);
      f.addEventListener("value-changed", (e) => this._roomChanged(id, e.detail.value));
    });
    this._sync();
  }

  _sync() {
    const c = this._config, pl = this._lang === "pl" ? 2 : 1;
    const top = this._root.querySelector('[data-form="top"]');
    top.hass = this._hass;
    top.data = {
      preset: c.preset && LHC_PRESETS[c.preset] ? c.preset : "own", image: c.image || "", title: c.title || "",
      weather: c.weather || "", main_thermostat: c.main_thermostat || "",
      heating: lhcArr(c.heating).map((h) => (typeof h === "string" ? h : h && h.entity)).filter(Boolean),
    };
    this._root.querySelectorAll("details[data-room]").forEach((d) => {
      const id = d.dataset.room, u = this._user(id), m = LHC_ROOM_META[id] || ["", id, id];
      const tv = !u.tv ? [] : Array.isArray(u.tv) ? u.tv : typeof u.tv === "string" ? [u.tv] : lhcArr(u.tv.entities || u.tv.entity);
      const data = {
        name: u.name || "", lights: lhcArr(u.lights).map((x) => (typeof x === "string" ? x : x && x.entity)).filter(Boolean),
        temperature: u.temperature || "", humidity: u.humidity || "", tv, hide: !!u.hide,
      };
      d.querySelector(".nm").textContent = u.name || m[pl];
      const n = data.lights.length + (data.temperature ? 1 : 0) + (data.humidity ? 1 : 0) + tv.length;
      const tag = d.querySelector(".tag");
      tag.textContent = u.hide ? this._tx("hidden") : n ? `✓ ${n}` : "";
      tag.classList.toggle("on", !u.hide && n > 0);
      const f = d.querySelector("ha-form");
      f.hass = this._hass; f.data = data;
    });
  }

  _emit(config) {
    this._config = config;
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
    this._render();
  }

  // Switch a card with its own picture to the ready-made house: drop the picture and room positions, keep entities.
  _usePreset() {
    const c = { ...this._config };
    delete c.image;
    const geo = ["chip", "shape", "focus", "glow", "x", "y", "w", "h"];
    c.rooms = this._rooms().map((r) => {
      const o = { ...r }; geo.forEach((k) => delete o[k]);
      if (o.tv && typeof o.tv === "object" && !Array.isArray(o.tv)) { const t = { ...o.tv }; delete t.glow; delete t.screen; o.tv = t; }
      return o;
    });
    this._emit(c);
    this._render(true);
  }

  _topChanged(v) {
    const c = { ...this._config };
    const set = (k, val) => { if (val === "" || val == null || (Array.isArray(val) && !val.length)) delete c[k]; else c[k] = val; };
    if (v.preset === "own") { delete c.preset; if (!c.image) c.image = "/local/living-house/house.webp"; }
    else if (v.preset) { c.preset = v.preset; if (c.image === "/local/living-house/house.webp") delete c.image; }
    if (!c.preset) set("image", v.image);
    set("title", v.title); set("weather", v.weather); set("main_thermostat", v.main_thermostat);
    const old = lhcArr(this._config.heating);
    set("heating", lhcArr(v.heating).map((id) => old.find((h) => h && typeof h === "object" && h.entity === id) || { entity: id }));
    this._emit(c);
  }

  _roomChanged(id, v) {
    const rooms = this._rooms().map((r) => ({ ...r }));
    let i = rooms.findIndex((r) => r && String(r.id) === id);
    if (i < 0) { rooms.push({ id }); i = rooms.length - 1; }
    const r = rooms[i];
    const set = (k, val) => { if (val === "" || val == null || val === false || (Array.isArray(val) && !val.length)) delete r[k]; else r[k] = val; };
    set("name", v.name);
    const oldL = lhcArr(r.lights);
    set("lights", lhcArr(v.lights).map((e) => oldL.find((x) => x && typeof x === "object" && x.entity === e) || e));
    set("temperature", v.temperature); set("humidity", v.humidity); set("hide", v.hide);
    const tv = lhcArr(v.tv);
    if (!tv.length) delete r.tv;
    else if (r.tv && typeof r.tv === "object" && !Array.isArray(r.tv)) r.tv = { ...r.tv, entities: tv };
    else r.tv = tv;
    if (Object.keys(r).length === 1) rooms.splice(i, 1);
    this._emit({ ...this._config, rooms });
  }
}
if (!customElements.get("living-house-card-editor")) customElements.define("living-house-card-editor", LivingHouseCardEditor);


/* ---------- Living House Card – rooms hub + room views ----------
 * type: custom:living-rooms-card
 */
const LRC_PALETTE = ["245,158,11", "52,211,153", "244,114,182", "236,72,153", "56,189,248", "251,191,36", "167,139,250", "96,165,250", "248,113,113", "45,212,191"];
const LRC_HVAC_ICON = { heat: "mdi:fire", cool: "mdi:snowflake", auto: "mdi:autorenew", heat_cool: "mdi:sun-snowflake-variant", off: "mdi:power", dry: "mdi:water-percent", fan_only: "mdi:fan" };
const LRC_AQ_OK = ["excellent", "good"];
const LRC_SWATCHES = [[255, 180, 110], [255, 244, 229], [255, 92, 170], [168, 85, 247], [59, 130, 246], [16, 185, 129], [250, 204, 21], [239, 68, 68]];
const LRC_KELVIN = [[2700, "warm"], [4000, "neutral"], [6000, "cool"]];
const LRC_SENSOR_KIND = { window: "window", door: "window", opening: "window", garage_door: "window", moisture: "leak", carbon_monoxide: "co", gas: "co", smoke: "co", motion: "motion", occupancy: "motion", presence: "motion", battery: "battery", pm25: "pm", aqi: "aq" };

class LivingRoomsCard extends HTMLElement {
  static getStubConfig() {
    return { home_path: "/lovelace/0", rooms: [{ id: "living", name: "Living room", icon: "mdi:sofa-outline", image: "/local/living-house/rooms/living.webp", lights: [] }] };
  }

  setConfig(config) {
    if (!config || !Array.isArray(config.rooms)) throw new Error("living-rooms-card: add a `rooms:` list");
    this._cfg = { home_path: null, title: null, fit: true, ...config };
    this._pending = {};
    this._busy = {};
    this._hist = {};
    this._normalize();
    this._allIds = null;
    if (this._root) { this._root.innerHTML = ""; this._root = null; this.shadowRoot && (this.shadowRoot.innerHTML = ""); }
  }
  _t(k, a) { return lhcT(this._lang || "en", k, a); }
  _m(g, k, f) { return lhcMap(this._lang || "en", g, k, f); }

  _normalize() {
    const ent = (x) => (typeof x === "string" ? { entity: x } : x || {});
    this._rooms = this._cfg.rooms.map((r, i) => {
      const id = String(r.id || `room${i + 1}`).replace(/[^\w-]/g, "-");
      const t = r.temperature;
      return {
        id, name: r.name || id, icon: r.icon || "mdi:home-outline", image: r.image || "", subtitle: r.subtitle || "", link: r.link || null,
        accent: lhcRgb(r.accent, LRC_PALETTE[i % LRC_PALETTE.length]), size: r.size || (i === 0 ? "big" : "normal"),
        temp: t && !String(t).startsWith("climate.") ? t : null, tempClimate: t && String(t).startsWith("climate.") ? t : null,
        hum: r.humidity || null,
        lights: lhcArr(r.lights).map(ent).filter((x) => x.entity).map((x) => [x.entity, x.name || null, x.icon || null, x.type === "fan" ? "fan" : null]),
        climate: lhcArr(r.climate).map(ent).filter((x) => x.entity).map((x, k) => [x.entity, x.name || null, x.type || (k === 0 ? "main" : "trv")]),
        media: lhcArr(r.media).map(ent).filter((x) => x.entity).map((x) => [x.entity, x.name || null, x.volume_entity || null, !!x.speaker]),
        sensors: lhcArr(r.sensors).map(ent).filter((x) => x.entity).map((x) => [x.entity, x.name || null, x.type || null]),
        devices: lhcArr(r.devices).map((d) => this._normDevice(d)).filter(Boolean),
      };
    });
  }
  _img(r) {
    const v = r.image || "";
    if (/^(camera|image)\./.test(v)) { const st = this._hass && this._hass.states[v]; return st && st.attributes.entity_picture ? st.attributes.entity_picture : ""; }
    return v;
  }
  _normDevice(d) {
    if (!d || !d.type) return null;
    const sw = (l) => lhcArr(l).map((x) => (typeof x === "string" ? { entity: x } : x)).filter((x) => x.entity);
    switch (d.type) {
      case "purifier": return { type: "purifier", fan: d.entity || d.fan, pm: d.pm25, filter: d.filter, name: d.name };
      case "pet_feeder": case "feeder": return { type: "feeder", status: d.status, manual: d.portions || d.manual, switches: sw(d.switches), name: d.name };
      case "litter_box": case "litter": return { type: "litter", status: d.status, clean: d.clean, switches: sw(d.switches), name: d.name };
      case "washer": return { type: "washer", status: d.status, remaining: d.remaining, temp: d.temperature, name: d.name };
      case "printer": case "3d_printer": return {
        type: "printer", name: d.name, status: d.status, stage: d.stage, progress: d.progress, remaining: d.remaining, end_time: d.end_time,
        layer: d.layer, total_layers: d.total_layers, task: d.task, nozzle: d.nozzle, nozzle_target: d.nozzle_target, bed: d.bed, bed_target: d.bed_target,
        image: d.image, camera: d.camera, light: d.light, pause: d.pause, resume: d.resume, stop: d.stop,
        filaments: lhcArr(d.filaments).map((x) => (typeof x === "string" ? x : x && x.entity)).filter(Boolean),
      };
      case "dryer": return { type: "dryer", status: d.status, remaining: d.remaining, program: d.program, water: d.water_full, filter: d.filter, name: d.name };
      default: return null;
    }
  }
  getCardSize() { return 12; }

  connectedCallback() {
    this._onPop = this._onPop || (() => this._route());
    window.addEventListener("popstate", this._onPop);
    window.addEventListener("hashchange", this._onPop);
    this._onKey = this._onKey || ((e) => {
      if (!this._view) return;
      if (e.key === "Escape") this._goHub();
      if (e.key === "ArrowRight") this._step(1);
      if (e.key === "ArrowLeft") this._step(-1);
    });
    window.addEventListener("keydown", this._onKey);
    this._onResize = this._onResize || (() => this._fit());
    window.addEventListener("resize", this._onResize);
    if (!this._ro && window.ResizeObserver) this._ro = new ResizeObserver(() => { const w = this.clientWidth; if (w !== this._lastW && this._root) { this._lastW = w; this._fit(); } });
    if (this._ro) this._ro.observe(this);
    this._clock = setInterval(() => this._renderClock(), 15000);
    clearInterval(this._camT);
    this._camT = setInterval(() => {
      if (!this._view || document.hidden || !this._root) return;
      this._root.querySelectorAll("img[data-cam]").forEach((im) => {
        const st = this._hass && this._hass.states[im.dataset.cam];
        if (st && st.attributes.entity_picture) im.src = `${st.attributes.entity_picture}&_=${Date.now()}`;
      });
    }, 8000);
    if (this._root) { this._route(); this._fit(); }
  }
  disconnectedCallback() {
    window.removeEventListener("popstate", this._onPop);
    window.removeEventListener("hashchange", this._onPop);
    window.removeEventListener("keydown", this._onKey);
    window.removeEventListener("resize", this._onResize);
    if (this._ro) this._ro.disconnect();
    clearInterval(this._clock);
    clearInterval(this._camT);
  }

  set hass(h) {
    const old = this._hass;
    this._hass = h;
    this._lang = lhcLang(h, this._cfg);
    if (!this._root) { this._build(); this._route(); this._update(); return; }
    if (!old || this._changed(old, h)) this._update();
  }

  /* ---------- pomocnicze ---------- */
  _s(id) { return id ? this._hass.states[id] : undefined; }
  _ok(id) { const s = this._s(id); return !!s && !LHC_BAD.includes(s.state); }
  _on(id) { const s = this._s(id); return !!s && s.state === "on"; }
  _num(v, d = 1) { const n = Number(v); return v !== null && v !== "" && v !== undefined && Number.isFinite(n) ? n.toFixed(d) : "—"; }
  _icon(i, extra = "") { return `<ha-icon icon="${i}" ${extra}></ha-icon>`; }
  _call(d, s, data) { return this._hass.callService(d, s, data); }
  _name(id, name) { return lhcEsc(name || (this._s(id) && this._s(id).attributes.friendly_name) || id); }
  _ids(r) {
    const ids = [r.temp, r.hum, r.tempClimate];
    r.lights.forEach((l) => ids.push(l[0]));
    r.climate.forEach((c) => ids.push(c[0]));
    r.media.forEach((m) => ids.push(m[0], m[2]));
    r.sensors.forEach((s) => ids.push(s[0]));
    r.devices.forEach((d) => Object.entries(d).forEach(([k, v]) => {
      if (k === "switches") v.forEach((x) => ids.push(x.entity));
      else if (k === "filaments") v.forEach((x) => ids.push(x));
      else if (!["type", "name"].includes(k)) ids.push(v);
    }));
    return ids.filter(Boolean);
  }
  _changed(a, b) {
    if (!this._allIds) this._allIds = [...new Set(this._rooms.flatMap((r) => this._ids(r)))];
    return this._allIds.some((id) => a.states[id] !== b.states[id]);
  }
  _kind(id, kind) {
    if (kind) return kind;
    const s = this._s(id);
    const dc = s && s.attributes.device_class;
    return LRC_SENSOR_KIND[dc] || (id.startsWith("binary_sensor.") ? "binary" : "value");
  }
  _temp(r) {
    if (r.temp) return this._ok(r.temp) ? this._num(this._s(r.temp).state) : null;
    if (r.tempClimate) { const s = this._s(r.tempClimate); return s ? this._num(s.attributes.current_temperature) : null; }
    return null;
  }
  _lights(r) {
    const avail = r.lights.filter((l) => l[3] !== "fan" && this._ok(l[0]));
    return { on: avail.filter((l) => this._on(l[0])).length, total: avail.length };
  }
  _tvPlaying(r) { return r.media.some((m) => { const s = this._s(m[0]); return s && !m[3] && LHC_TV_ON.includes(s.state); }); }
  _alerts(r) {
    const out = [];
    r.sensors.forEach(([id, name, k]) => {
      const kind = this._kind(id, k), on = this._on(id);
      if (kind === "window" && on) out.push(["mdi:window-open-variant", this._t("window_open", this._name(id, name)), "warn"]);
      if (kind === "leak" && on) out.push(["mdi:water-alert", this._t("water_leak"), "bad"]);
      if (kind === "co" && on) out.push(["mdi:molecule-co", this._t("co"), "bad"]);
    });
    r.devices.forEach((d) => {
      if (d.type === "dryer" && this._on(d.water)) out.push(["mdi:cup-water", this._t("waterbox_full"), "warn"]);
      if (d.type === "washer" && this._s(d.status)?.state === "alarm") out.push(["mdi:alert", this._t("washer_alarm"), "bad"]);
      if (d.type === "printer" && this._s(d.status)?.state === "failed") out.push(["mdi:printer-3d-nozzle-alert", this._t("pr_failed"), "bad"]);
    });
    return out;
  }

  /* ---------- szkielet ---------- */
  _build() {
    this._root = this.shadowRoot || this.attachShadow({ mode: "open" });
    this._root.innerHTML = `<style>${LRC_STYLE}</style>
      <div class="page">
        <div class="bg"><div class="bg-img" id="bgimg"></div><i class="orb o1"></i><i class="orb o2"></i><div class="bg-dim"></div></div>
        <div class="stage">
          <div class="hub" id="hub"></div>
          <div class="room" id="room" hidden></div>
        </div>
      </div>`;
    if (!this._wired) {
      this._root.addEventListener("click", (e) => this._click(e));
      this._root.addEventListener("input", (e) => this._input(e));
      this._root.addEventListener("change", (e) => this._change(e));
      this._wired = true;
    }
    this._el = (id) => this._root.getElementById(id);
    this._view = null;
    this._buildHub();
    this._fit();
    requestAnimationFrame(() => this._fit());
    setTimeout(() => this._fit(), 300);
  }

  _route() {
    const id = decodeURIComponent((location.hash || "").slice(1));
    const r = this._rooms.find((x) => x.id === id && !x.link);
    if (r && this._view !== r.id) this._showRoom(r.id, null);
    else if (!r && this._view) this._showHub();
  }

  /* ---------- HUB ---------- */
  _layout() {
    const span = { big: 4, wide: 2, tall: 2, normal: 1 };
    const sizes = this._rooms.map((r) => (span[r.size] ? r.size : "normal"));
    let cells = sizes.reduce((a, s) => a + span[s], 0);
    const rows = Math.max(1, Math.ceil(cells / 4));
    let empty = rows * 4 - cells;
    for (let i = sizes.length - 1; i >= 0 && empty > 0; i--) if (sizes[i] === "normal") { sizes[i] = "wide"; empty--; }
    return { sizes, rows };
  }
  _buildHub() {
    const hub = this._el("hub");
    const { sizes, rows } = this._layout();
    const home = this._cfg.home_path;
    hub.innerHTML = `
      <header class="hhd rise">
        ${home ? `<button class="back home glass" data-nav="${lhcEsc(home)}" title="${this._t("home")}">${this._icon("mdi:home-outline")}<span>${this._t("home")}</span></button>` : ""}
        <div class="htitle"><div class="kicker" id="clock"></div><h1>${lhcEsc(this._cfg.title || this._t("rooms_title"))}</h1></div>
        <div class="hsum" id="hsum"></div>
      </header>
      <div class="bento" style="--rows:${rows}">
        ${this._rooms.map((r, i) => `
          <article class="tile t-${r.id} sz-${sizes[i]} rise" style="--d:${i + 1};--acc:${r.accent}" ${r.link ? `data-nav="${lhcEsc(r.link)}"` : `data-open="${r.id}"`}>
            <div class="t-img" style="${this._img(r) ? `background-image:url('${lhcEsc(this._img(r))}')` : ""}"></div>
            <div class="t-shade"></div><div class="t-glare"></div>
            <div class="t-top">
              <span class="t-ic glass">${this._icon(r.icon)}</span>
              <span class="t-badges" data-k="badges"></span>
              ${r.lights.length ? `<button class="t-bulb glass" data-roomlights="${r.id}" data-k="bulb">${this._icon("mdi:lightbulb-outline")}</button>` : ""}
            </div>
            <div class="t-bottom">
              <div class="t-name">${lhcEsc(r.name)}</div>
              ${r.subtitle ? `<div class="t-sub">${lhcEsc(r.subtitle)}</div>` : ""}
              <div class="t-chips" data-k="chips"></div>
            </div>
          </article>`).join("")}
      </div>`;
    this._setupTilt(hub);
    this._renderClock();
  }

  _renderClock() {
    const el = this._el && this._el("clock");
    if (!el || !this._hass) return;
    const tz = this._hass.config.time_zone, now = new Date(), loc = this._lang === "pl" ? "pl-PL" : undefined;
    try {
      const d = new Intl.DateTimeFormat(loc, { timeZone: tz, weekday: "long", day: "numeric", month: "long" }).format(now);
      const t = new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: false }).format(now);
      el.textContent = `${d} · ${t}`;
    } catch (e) { el.textContent = now.toLocaleString(); }
  }

  _updateHub() {
    let lightsOn = 0;
    const alerts = [];
    this._rooms.forEach((r) => {
      const t = this._root.querySelector(`.t-${r.id}`);
      if (!t) return;
      const L = this._lights(r);
      lightsOn += L.on;
      const frac = L.total ? L.on / L.total : 1;
      t.style.setProperty("--lit", (r.lights.length ? (L.on ? 0.55 + 0.45 * frac : 0) : 0.8).toFixed(2));
      t.classList.toggle("lit", L.on > 0);
      t.classList.toggle("dark", r.lights.length > 0 && !L.on);
      const temp = this._temp(r), hum = r.hum && this._ok(r.hum) ? this._num(this._s(r.hum).state, 0) : null;
      const al = this._alerts(r);
      al.forEach((a) => alerts.push([r, ...a]));
      const chips = [];
      if (temp && temp !== "—") chips.push(`<span class="chip">${this._icon("mdi:thermometer", 'class="amber"')}${temp}°</span>`);
      if (hum) chips.push(`<span class="chip">${this._icon("mdi:water-outline", 'class="blue"')}${hum}%</span>`);
      if (L.total) chips.push(`<span class="chip ${L.on ? "on" : ""}">${this._icon(L.on ? "mdi:lightbulb-on" : "mdi:lightbulb-outline", `class="${L.on ? "yellow" : "grey"}"`)}${L.on}/${L.total}</span>`);
      if (this._tvPlaying(r)) chips.push(`<span class="chip tv">${this._icon("mdi:television-play")}${this._t("tv")}</span>`);
      r.devices.forEach((d) => {
        if (d.type === "washer" && this._s(d.status)?.state === "running") chips.push(`<span class="chip">${this._icon("mdi:washing-machine", 'class="violet spin"')}${this._t("washing")}</span>`);
        if (d.type === "dryer" && this._s(d.status)?.state === "running") chips.push(`<span class="chip">${this._icon("mdi:tumble-dryer", 'class="violet spin"')}${this._t("drying")}</span>`);
        if (d.type === "printer") {
          const pst = this._s(d.status), st = pst && pst.state, pr = Math.round(Number(this._s(d.progress)?.state) || 0);
          if (st === "running" || st === "prepare") chips.push(`<span class="chip pr">${this._icon("mdi:printer-3d-nozzle", 'class="cyan pulse-ic"')}${this._t("pr_printing", pr)}</span>`);
          if (st === "pause") chips.push(`<span class="chip">${this._icon("mdi:pause-circle-outline", 'class="amber"')}${this._m("pr_status", "pause")}</span>`);
          if (st === "finish" && Date.now() - new Date(pst.last_changed).getTime() < 6 * 3600e3) chips.push(`<span class="chip">${this._icon("mdi:check-circle-outline", 'class="green"')}${this._t("pr_done")}</span>`);
        }
        if (d.type === "purifier" && this._on(d.fan)) chips.push(`<span class="chip">${this._icon("mdi:air-purifier", 'class="green"')}${this._t("clean_air")}</span>`);
      });
      t.querySelector('[data-k="chips"]').innerHTML = chips.join("");
      t.querySelector('[data-k="badges"]').innerHTML = al.map((a) => `<span class="alert ${a[2]}">${this._icon(a[0])}<span>${a[1]}</span></span>`).join("");
      const b = t.querySelector('[data-k="bulb"]');
      if (b) { b.classList.toggle("on", L.on > 0); b.innerHTML = this._icon(L.on ? "mdi:lightbulb-on" : "mdi:lightbulb-outline"); }
    });
    const sum = [];
    sum.push(`<span class="pill glass">${this._icon(lightsOn ? "mdi:lightbulb-on" : "mdi:lightbulb-outline", `class="${lightsOn ? "yellow" : "grey"}"`)}${lightsOn ? this._t("lights_n", lightsOn) : this._t("dark")}</span>`);
    if (alerts.length) alerts.slice(0, 3).forEach(([r, ic, txt, lvl]) => sum.push(`<span class="pill glass ${lvl}" data-open="${r.id}">${this._icon(ic)}${lhcEsc(r.name)}: ${txt}</span>`));
    else sum.push(`<span class="pill glass ok">${this._icon("mdi:check-circle-outline")}${this._t("everything_ok")}</span>`);
    this._el("hsum").innerHTML = sum.join("");
  }

  _setupTilt(scope) {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    scope.addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      const t = e.composedPath().find((n) => n.classList && n.classList.contains("tile"));
      if (!t) return;
      const r = t.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      t.style.setProperty("--rx", `${((0.5 - y) * 7).toFixed(2)}deg`);
      t.style.setProperty("--ry", `${((x - 0.5) * 9).toFixed(2)}deg`);
      t.style.setProperty("--gx", `${(x * 100).toFixed(1)}%`);
      t.style.setProperty("--gy", `${(y * 100).toFixed(1)}%`);
    });
    scope.addEventListener("pointerout", (e) => {
      const t = e.target.closest && e.target.closest(".tile");
      if (t && !t.contains(e.relatedTarget)) { t.style.removeProperty("--rx"); t.style.removeProperty("--ry"); }
    });
  }

  /* ---------- przejścia ---------- */
  _openFromTile(id, tile) {
    history.pushState({ lrc: id }, "", `${location.pathname}${location.search}#${id}`);
    this._showRoom(id, tile);
  }
  _goHub() {
    if (history.state && history.state.lrc) history.back();
    else { history.pushState(null, "", `${location.pathname}${location.search}`); this._showHub(); }
  }
  _step(dir) {
    const list = this._rooms.filter((r) => !r.link);
    const i = list.findIndex((r) => r.id === this._view);
    const n = list[(i + dir + list.length) % list.length];
    history.replaceState({ lrc: n.id }, "", `${location.pathname}${location.search}#${n.id}`);
    this._showRoom(n.id, null, dir);
  }

  _showHub() {
    const from = this._view;
    this._view = null;
    const room = this._el("room"), hub = this._el("hub");
    room.classList.add("leaving");
    setTimeout(() => {
      room.hidden = true; room.classList.remove("leaving"); room.innerHTML = "";
      hub.hidden = false; void hub.offsetWidth; hub.classList.add("back-in");
      this._el("bgimg").style.backgroundImage = "";
      this._updateHub();
      const t = from && this._root.querySelector(`.t-${from}`);
      if (t) { t.classList.add("pulse"); setTimeout(() => t.classList.remove("pulse"), 1200); }
      if (!this._isFit()) window.scrollTo({ top: 0 });
    }, 260);
  }

  _showRoom(id, tile, dir = 0) {
    const r = this._rooms.find((x) => x.id === id);
    if (!r) return;
    const hub = this._el("hub"), room = this._el("room");
    const startRect = tile ? tile.getBoundingClientRect() : null;
    this._view = id;
    this._lastStates = null;
    this._widgets = this._roomWidgets(r);
    room.innerHTML = this._roomHtml(r);
    room.hidden = false;
    hub.hidden = true;
    hub.classList.remove("back-in");
    this._el("bgimg").style.backgroundImage = this._img(r) ? `url('${lhcEsc(this._img(r))}')` : "";
    if (!this._isFit()) window.scrollTo({ top: 0 });
    room.classList.remove("enter", "slide-l", "slide-r");
    void room.offsetWidth;
    const hero = room.querySelector(".hero-img");
    if (startRect && hero && this._img(r) && !(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)) {
      const end = hero.getBoundingClientRect();
      const ghost = document.createElement("div");
      ghost.className = "ghost";
      ghost.style.backgroundImage = `url('${lhcEsc(this._img(r))}')`;
      this._root.querySelector(".page").appendChild(ghost);
      room.classList.add("enter-flip");
      const anim = ghost.animate([
        { left: `${startRect.left}px`, top: `${startRect.top}px`, width: `${startRect.width}px`, height: `${startRect.height}px`, borderRadius: "26px", filter: "brightness(.85)" },
        { left: `${end.left}px`, top: `${end.top}px`, width: `${end.width}px`, height: `${end.height}px`, borderRadius: "26px", filter: "brightness(1)" },
      ], { duration: 650, easing: "cubic-bezier(.2,.8,.2,1)", fill: "forwards" });
      anim.onfinish = () => {
        room.classList.remove("enter-flip");
        room.classList.add("enter");
        ghost.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: "forwards" }).onfinish = () => ghost.remove();
      };
    } else {
      room.classList.add(dir > 0 ? "slide-l" : dir < 0 ? "slide-r" : "enter");
    }
    this._loadHistory(r);
    requestAnimationFrame(() => this._balance());
    setTimeout(() => this._balance(), 700);
  }

  /* przenosi sekcje z przepełnionej kolumny do kolumny z wolnym miejscem */
  _balance() {
    if (!this._isFit() || !this._view) return;
    const cols = [...this._root.querySelectorAll(".rgrid .col")];
    const used = (c) => [...c.children].reduce((sum, ch) => sum + ch.offsetHeight, 0) + 10 * Math.max(0, c.children.length - 1);
    const free = (c) => { const ch = c.querySelector(":scope > .s-chart"); return ch ? ch.offsetHeight - 190 : c.clientHeight - used(c); };
    for (let i = 0; i < 4; i++) {
      const o = cols.find((c) => c.scrollHeight - c.clientHeight > 4);
      if (!o) break;
      const secs = [...o.querySelectorAll(":scope > .sec:not(.s-chart)")];
      const s = secs[secs.length - 1];
      if (!s) break;
      const h = s.offsetHeight;
      const tgt = cols.filter((c) => c !== o).map((c) => ({ c, f: free(c) })).sort((a, b) => b.f - a.f)[0];
      if (!tgt || tgt.f < h + 12) break;
      const ch = tgt.c.querySelector(":scope > .s-chart");
      if (ch) tgt.c.insertBefore(s, ch); else tgt.c.appendChild(s);
    }
  }

  /* ---------- POKÓJ ---------- */
  _roomWidgets(r) {
    const w = [];
    w.push({ key: "stats", ids: [r.temp, r.hum, r.tempClimate, ...r.lights.map((l) => l[0]), ...r.sensors.map((s) => s[0]), ...r.media.map((m) => m[0])], render: () => this._wStats(r) });
    r.lights.forEach((l) => w.push({ key: `l:${l[0]}`, ids: [l[0]], render: () => this._wLight(l) }));
    r.climate.forEach((c) => w.push({ key: `c:${c[0]}`, ids: [c[0]], render: () => this._wClimate(c) }));
    r.media.forEach((m) => w.push({ key: `m:${m[0]}`, ids: [m[0], m[2]], render: () => this._wMedia(m) }));
    r.devices.forEach((d, i) => w.push({ key: `d:${i}`, ids: this._ids({ ...r, temp: null, hum: null, tempClimate: null, lights: [], climate: [], media: [], sensors: [], devices: [d] }), render: () => this._wDevice(d) }));
    if (r.sensors.length) w.push({ key: "sensors", ids: r.sensors.map((s) => s[0]), render: () => this._wSensors(r) });
    return w;
  }
  _slot(key) { const w = this._widgets.find((x) => x.key === key); return `<div class="slot" data-w="${lhcEsc(key)}">${w ? w.render() : ""}</div>`; }

  _roomHtml(r) {
    const ORDER = { lights: 1, climate: 2, media: 3, devices: 4, sensors: 5, chart: 6 };
    const sec = (k, title, icon, body, extra = "") => body ? `<section class="sec rise2 s-${k}" style="order:${ORDER[k]}"><div class="sec-hd">${this._icon(icon)}<span>${title}</span>${extra}</div>${body}</section>` : "";
    const L = this._lights(r);
    const mains = r.climate.filter((c) => c[2] === "main" || c[2] === "ac").length;
    const S = {
      lights: sec("lights", this._t("sec_lights"), "mdi:lightbulb-group-outline", r.lights.length ? `<div class="lgrid">${r.lights.map((l) => this._slot(`l:${l[0]}`)).join("")}</div>` : "",
        r.lights.length ? `<button class="mini glass" data-roomlights="${r.id}">${L.on ? this._t("turn_off_all") : this._t("turn_on_all")}</button>` : ""),
      climate: sec("climate", this._t("sec_climate"), "mdi:thermostat", r.climate.length ? `<div class="cgrid n${Math.min(mains, 2)} ${r.climate.length === 1 ? "c1" : ""}">${r.climate.map((c) => this._slot(`c:${c[0]}`)).join("")}</div>` : ""),
      media: sec("media", this._t("sec_media"), "mdi:play-box-multiple-outline", r.media.length ? `<div class="mgrid">${r.media.map((m) => this._slot(`m:${m[0]}`)).join("")}</div>` : ""),
      devices: sec("devices", this._t("sec_devices"), "mdi:devices", r.devices.length ? `<div class="dgrid">${r.devices.map((d, k) => this._slot(`d:${k}`)).join("")}</div>` : ""),
      sensors: sec("sensors", this._t("sec_sensors"), "mdi:access-point", r.sensors.length ? this._slot("sensors") : ""),
      chart: sec("chart", this._t("sec_chart"), "mdi:chart-bell-curve-cumulative", r.temp || r.hum ? `<div class="chart glass" id="chart"><div class="muted pad">${this._t("loading_history")}</div></div>` : ""),
    };
    let A = ["chart"], B = ["lights", "climate"], C = ["media", "devices", "sensors"];
    if (!S.climate && S.devices) { B = ["lights", "devices"]; C = ["media", "sensors"]; }
    if (!S.chart) { A = ["sensors"]; B = B.filter((k) => k !== "sensors"); C = C.filter((k) => k !== "sensors"); }
    const col = (keys) => keys.map((k) => S[k]).join("");
    const cC = col(C);
    const home = this._cfg.home_path;
    return `
      <div class="rtop" style="--acc:${r.accent}">
        ${home ? `<button class="back home glass" data-nav="${lhcEsc(home)}">${this._icon("mdi:home-outline")}<span>${this._t("home")}</span></button>` : ""}
        <button class="back glass" data-hub="1">${this._icon("mdi:view-grid-outline")}<span>${lhcEsc(this._cfg.title || this._t("all_rooms"))}</span></button>
        <nav class="rtabs">${this._rooms.filter((x) => !x.link).map((x) => `<button class="rtab ${x.id === r.id ? "on" : ""}" data-goto="${x.id}" style="--acc:${x.accent}">${this._icon(x.icon)}<span>${lhcEsc(x.name)}</span></button>`).join("")}</nav>
      </div>
      <div class="rgrid ${cC ? "" : "two"}">
        <div class="col colA">
          <div class="hero" style="--acc:${r.accent};order:0">
            <div class="hero-img" style="${this._img(r) ? `background-image:url('${lhcEsc(this._img(r))}')` : ""}"></div>
            <div class="hero-shade"></div>
            <div class="hero-body">
              <div class="hero-ic">${this._icon(r.icon)}</div>
              <h2>${lhcEsc(r.name)}</h2>
              ${r.subtitle ? `<p>${lhcEsc(r.subtitle)}</p>` : ""}
              ${this._slot("stats")}
            </div>
          </div>
          ${col(A)}
        </div>
        <div class="col colB">${col(B)}</div>
        ${cC ? `<div class="col colC">${cC}</div>` : ""}
      </div>`;
  }

  _fit() {
    const page = this._root && this._root.querySelector(".page");
    if (!page) return;
    const w = this.clientWidth || this.getBoundingClientRect().width;
    const top = Math.max(0, this.getBoundingClientRect().top + (window.scrollY || 0));
    const h = window.innerHeight - top;
    const fit = w >= 900 && h >= 460 && this._cfg.fit !== false;
    page.classList.toggle("fit", fit);
    if (fit) {
      const BW = 1440;
      const BH = Math.round(Math.max(760, Math.min(1000, BW * (h / w))));
      page.style.height = `${h}px`;
      page.style.setProperty("--z", Math.min(w / BW, h / BH).toFixed(4));
      page.style.setProperty("--bh", `${BH}px`);
      if (this._view) requestAnimationFrame(() => this._balance());
    } else {
      page.style.height = "";
      page.style.removeProperty("--z");
      page.style.removeProperty("--bh");
    }
  }
  _isFit() { const p = this._root && this._root.querySelector(".page"); return !!p && p.classList.contains("fit"); }

  _update() {
    if (!this._allIds) this._allIds = [...new Set(this._rooms.flatMap((r) => this._ids(r)))];
    if (!this._view) { this._updateHub(); this._lastStates = null; return; }
    const changed = new Set(this._lastStates ? this._allIds.filter((id) => this._lastStates[id] !== this._hass.states[id]) : this._allIds);
    this._lastStates = this._hass.states;
    (this._widgets || []).forEach((w) => {
      if (this._busy[w.key] && Date.now() < this._busy[w.key]) return;
      if (!w.ids.some((id) => changed.has(id))) return;
      const el = this._root.querySelector(`.slot[data-w="${CSS.escape(w.key)}"]`);
      if (el) el.innerHTML = w.render();
    });
    const r = this._rooms.find((x) => x.id === this._view);
    const btn = this._root.querySelector(".sec .mini[data-roomlights]");
    if (btn && r) btn.textContent = this._lights(r).on ? this._t("turn_off_all") : this._t("turn_on_all");
  }

  _wStats(r) {
    const t = this._temp(r), hum = r.hum && this._ok(r.hum) ? this._num(this._s(r.hum).state, 0) : null;
    const L = this._lights(r);
    const out = [];
    if (t && t !== "—") out.push(`<div class="stat">${this._icon("mdi:thermometer", 'class="amber"')}<b>${t}</b><span>°C</span></div>`);
    if (hum) out.push(`<div class="stat">${this._icon("mdi:water-outline", 'class="blue"')}<b>${hum}</b><span>%</span></div>`);
    if (L.total) out.push(`<div class="stat">${this._icon(L.on ? "mdi:lightbulb-on" : "mdi:lightbulb-outline", `class="${L.on ? "yellow" : "grey"}"`)}<b>${L.on}</b><span>/${L.total} ${this._t("of_lights")}</span></div>`);
    if (this._tvPlaying(r)) out.push(`<div class="stat tv">${this._icon("mdi:television-play")}<b>${this._t("tv")}</b><span>${this._t("tv_playing")}</span></div>`);
    this._alerts(r).forEach((a) => out.push(`<div class="stat ${a[2]}">${this._icon(a[0])}<span>${a[1]}</span></div>`));
    return `<div class="stats">${out.join("")}</div>`;
  }

  _wLight([id, nm, ic, kind]) {
    const s = this._s(id);
    const icon = ic || (id.startsWith("light.") ? "mdi:lightbulb-outline" : id.startsWith("fan.") ? "mdi:fan" : "mdi:ceiling-light-outline");
    const name = this._name(id, nm);
    if (!s) return `<div class="lt glass off-line">${this._icon(icon)}<div class="lt-name">${name}</div><div class="lt-state">${this._t("no_entity")}</div></div>`;
    const avail = !LHC_BAD.includes(s.state);
    const on = s.state === "on";
    const isLight = id.startsWith("light.");
    const modes = s.attributes.supported_color_modes || [];
    const dim = isLight && modes.some((m) => m !== "onoff");
    const color = isLight && modes.some((m) => ["rgb", "rgbw", "rgbww", "hs", "xy"].includes(m));
    const ct = isLight && modes.includes("color_temp");
    const pct = on && s.attributes.brightness != null ? Math.round(s.attributes.brightness / 2.55) : 0;
    const rgb = on && Array.isArray(s.attributes.rgb_color) ? s.attributes.rgb_color.join(",") : "255,196,120";
    const stTxt = !avail ? this._t("st_offline") : on ? (dim ? `${pct}%` : kind === "fan" ? this._t("st_running") : this._t("st_on")) : this._t("st_off");
    return `
      <div class="lt glass ${on ? "on" : ""} ${!avail ? "off-line" : ""} ${kind === "fan" && on ? "spin-ic" : ""}" style="--lc:${rgb}">
        <button class="lt-main" data-toggle="${lhcEsc(id)}" ${!avail ? "disabled" : ""}>
          <div class="bulb">${this._icon(on && icon === "mdi:ceiling-light-outline" ? "mdi:ceiling-light" : icon)}</div>
          <div class="lt-txt"><div class="lt-name">${name}</div><div class="lt-state">${stTxt}</div></div>
          <span class="sw ${on ? "on" : ""}"><i></i></span>
        </button>
        ${dim && avail ? `<input class="slider" type="range" min="1" max="100" value="${pct || 1}" data-bri="${lhcEsc(id)}" style="--p:${pct || 0}%">` : ""}
        ${color && avail ? `<div class="sws">${LRC_SWATCHES.map((c) => `<button class="swatch" style="--c:${c.join(",")}" data-rgb="${lhcEsc(id)}" data-v="${c.join(",")}"></button>`).join("")}</div>` : ""}
        ${!color && ct && avail ? `<div class="kel">${LRC_KELVIN.map(([k, n]) => `<button class="kchip" data-kelvin="${lhcEsc(id)}" data-v="${k}">${this._t(n)}</button>`).join("")}</div>` : ""}
      </div>`;
  }

  _wClimate([id, nm, kind]) {
    const s = this._s(id);
    if (!s) return "";
    const a = s.attributes;
    const name = this._name(id, nm);
    const avail = !LHC_BAD.includes(s.state);
    const off = s.state === "off";
    const cur = a.current_temperature;
    const pend = this._pending[`t:${id}`];
    const tgt = pend != null ? pend : a.temperature;
    const action = a.hvac_action;
    const modes = (a.hvac_modes || []).filter((m) => LRC_HVAC_ICON[m]);
    const modeChips = modes.map((m) => `<button class="mchip ${s.state === m ? "on" : ""}" data-hvac="${lhcEsc(id)}" data-v="${m}">${this._icon(LRC_HVAC_ICON[m])}${this._m("hvac", m)}</button>`).join("");
    const actTxt = !avail ? this._t("st_offline") : off ? this._m("action", "off") : action ? this._m("action", action, lhcEsc(action)) : this._m("hvac", s.state, s.state);
    const heating = action === "heating", cooling = action === "cooling";
    const hasT = tgt != null && Number.isFinite(Number(tgt));
    if (kind === "main" || kind === "ac") {
      const min = a.min_temp ?? 7, max = a.max_temp ?? 30;
      const ang = (t) => 135 + 270 * Math.max(0, Math.min(1, (t - min) / (max - min)));
      const pt = (r, deg) => [100 + r * Math.cos((deg * Math.PI) / 180), 100 + r * Math.sin((deg * Math.PI) / 180)];
      const arc = (r, a0, a1) => { const [x0, y0] = pt(r, a0), [x1, y1] = pt(r, a1); return `M${x0.toFixed(1)},${y0.toFixed(1)} A${r},${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1.toFixed(1)},${y1.toFixed(1)}`; };
      const tA = hasT ? ang(Number(tgt)) : 135;
      const [cx, cy] = cur != null ? pt(80, ang(Number(cur))) : [0, 0];
      const [kx, ky] = pt(80, tA);
      const gid = `dg-${id.replace(/[^\w]/g, "")}`;
      return `
        <div class="dial glass ${heating ? "heating" : ""} ${cooling ? "cooling" : ""} ${off ? "is-off" : ""}">
          <div class="dial-hd"><span>${name}</span><span class="act">${this._icon(heating ? "mdi:fire" : cooling ? "mdi:snowflake" : "mdi:circle-small")}${actTxt}</span></div>
          <div class="dial-ring">
            <svg viewBox="0 0 200 200">
              <defs><linearGradient id="${gid}" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#38bdf8"/><stop offset=".55" stop-color="#fbbf24"/><stop offset="1" stop-color="#f97316"/></linearGradient></defs>
              <path d="${arc(80, 135, 405)}" class="track"/>
              ${hasT && !off ? `<path d="${arc(80, 135, Math.max(135.5, tA))}" class="fill" stroke="url(#${gid})"/>` : ""}
              ${cur != null ? `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="4" class="curdot"/>` : ""}
              ${hasT && !off ? `<circle cx="${kx.toFixed(1)}" cy="${ky.toFixed(1)}" r="9" class="knob"/>` : ""}
            </svg>
            <div class="dial-c">
              <div class="dial-t">${off ? this._t("off_big") : hasT ? `${this._num(tgt)}<small>°</small>` : "—"}</div>
              <div class="dial-cur">${cur != null ? this._t("now", this._num(cur)) : ""}</div>
            </div>
            ${hasT && !off ? `<button class="dbtn minus glass" data-tstep="${lhcEsc(id)}" data-v="-1">${this._icon("mdi:minus")}</button><button class="dbtn plus glass" data-tstep="${lhcEsc(id)}" data-v="1">${this._icon("mdi:plus")}</button>` : ""}
          </div>
          <div class="mchips">${modeChips}</div>
        </div>`;
    }
    return `
      <div class="crow glass ${heating ? "heating" : ""} ${off ? "is-off" : ""}">
        <div class="crow-ic">${this._icon(kind === "floor" ? "mdi:heating-coil" : kind === "trv" ? "mdi:radiator" : "mdi:air-conditioner")}</div>
        <div class="crow-txt"><div class="crow-name">${name}</div><div class="crow-sub">${cur != null ? `${this._num(cur)}°C · ` : ""}${actTxt}</div></div>
        ${hasT && !off ? `<div class="stepper"><button class="sbtn" data-tstep="${lhcEsc(id)}" data-v="-1">${this._icon("mdi:minus")}</button><b>${this._num(tgt)}°</b><button class="sbtn" data-tstep="${lhcEsc(id)}" data-v="1">${this._icon("mdi:plus")}</button></div>` : ""}
        ${modes.includes("off") && (modes.includes("heat") || modes.includes("auto")) ? `<button class="sw big ${off ? "" : "on"}" data-hvac="${lhcEsc(id)}" data-v="${off ? (modes.includes("heat") ? "heat" : "auto") : "off"}"><i></i></button>` : ""}
      </div>`;
  }

  _wMedia([id, nm, volId, speaker]) {
    const s = this._s(id);
    if (!s) return "";
    const a = s.attributes;
    const vs = volId ? this._s(volId) : null;
    const volSrc = vs && vs.attributes.volume_level != null ? vs : s;
    const vol = volSrc.attributes.volume_level;
    const volEnt = volSrc === vs ? volId : id;
    const on = LHC_TV_ON.includes(s.state) || s.state === "idle";
    const playing = s.state === "playing";
    const pic = a.entity_picture;
    const title = a.media_title || (on ? a.app_name || "" : "");
    const sub = [a.media_artist || a.media_series_title, a.app_name && a.media_title ? a.app_name : ""].filter(Boolean).join(" · ");
    const vpct = Math.round((vol || 0) * 100);
    const st = this._m("media", s.state, lhcEsc(s.state));
    return `
      <div class="md glass ${playing ? "playing" : ""} ${!on ? "is-off" : ""}">
        ${pic ? `<div class="md-bg" style="background-image:url('${lhcEsc(pic)}')"></div>` : ""}
        <div class="md-row">
          <div class="md-art" ${pic ? `style="background-image:url('${lhcEsc(pic)}')"` : ""}>${pic ? "" : this._icon(speaker ? "mdi:speaker" : "mdi:television-classic")}${playing ? `<span class="eq"><i></i><i></i><i></i></span>` : ""}</div>
          <div class="md-txt">
            <div class="md-name">${this._name(id, nm)}</div>
            <div class="md-title">${lhcEsc(title) || st}</div>
            <div class="md-sub">${lhcEsc(sub) || (title ? st : "")}</div>
          </div>
          <button class="round glass sm" data-mpower="${lhcEsc(id)}" data-v="${on ? "off" : "on"}">${this._icon("mdi:power")}</button>
        </div>
        ${on ? `<div class="md-ctl">
          <button class="round glass sm" data-media="${lhcEsc(id)}" data-v="media_previous_track">${this._icon("mdi:skip-previous")}</button>
          <button class="round glass play" data-media="${lhcEsc(id)}" data-v="media_play_pause">${this._icon(playing ? "mdi:pause" : "mdi:play")}</button>
          <button class="round glass sm" data-media="${lhcEsc(id)}" data-v="media_next_track">${this._icon("mdi:skip-next")}</button>
          ${vol != null ? `<div class="vol">${this._icon(vpct ? "mdi:volume-high" : "mdi:volume-off")}<input class="slider" type="range" min="0" max="100" value="${vpct}" data-vol="${lhcEsc(volEnt)}" style="--p:${vpct}%"></div>` : ""}
        </div>` : ""}
      </div>`;
  }

  _wSensors(r) {
    return `<div class="sgrid">${r.sensors.map(([id, nm, k]) => {
      const s = this._s(id);
      if (!s) return "";
      const kind = this._kind(id, k);
      const avail = !LHC_BAD.includes(s.state);
      const on = s.state === "on";
      let icon = "mdi:access-point", val = avail ? `${lhcEsc(s.state)} ${s.attributes.unit_of_measurement || ""}` : this._t("st_offline"), cls = "";
      if (kind === "window") { icon = on ? "mdi:window-open-variant" : "mdi:window-closed-variant"; val = on ? this._t("open") : this._t("closed"); cls = on ? "warn" : "ok"; }
      if (kind === "leak") { icon = on ? "mdi:water-alert" : "mdi:water-check-outline"; val = on ? this._t("leak") : this._t("dry"); cls = on ? "bad" : "ok"; }
      if (kind === "co") { icon = on ? "mdi:molecule-co" : "mdi:shield-check-outline"; val = on ? this._t("co") : this._t("safe"); cls = on ? "bad" : "ok"; }
      if (kind === "motion") { icon = on ? "mdi:motion-sensor" : "mdi:motion-sensor-off"; val = on ? this._t("motion") : this._t("no_motion"); cls = on ? "mint" : ""; }
      if (kind === "binary") { icon = on ? "mdi:checkbox-blank-circle" : "mdi:checkbox-blank-circle-outline"; val = on ? this._t("detected") : this._t("clear"); }
      if (kind === "battery") { const n = Number(s.state); icon = n > 60 ? "mdi:battery-high" : n > 25 ? "mdi:battery-medium" : "mdi:battery-low"; val = `${this._num(s.state, 0)}%`; cls = n > 25 ? "ok" : "warn"; }
      if (kind === "pm") { const n = Number(s.state); icon = "mdi:molecule"; val = `${this._num(s.state, 0)} µg/m³`; cls = n <= 12 ? "ok" : n <= 35 ? "warn" : "bad"; }
      if (kind === "aq") { icon = "mdi:leaf"; val = this._m("aq_states", s.state, lhcEsc(s.state)); cls = LRC_AQ_OK.includes(s.state) ? "ok" : ""; }
      if (!avail) cls = "dim";
      return `<button class="sens glass ${cls}" data-more="${lhcEsc(id)}">${this._icon(icon)}<div><div class="s-name">${this._name(id, nm)}</div><div class="s-val">${val}</div></div></button>`;
    }).join("")}</div>`;
  }

  _wDevice(d) {
    const sws = (list) => list.map((x) => this._s(x.entity) ? `<button class="trow" data-toggle="${lhcEsc(x.entity)}"><span>${this._name(x.entity, x.name)}</span><span class="sw ${this._on(x.entity) ? "on" : ""}"><i></i></span></button>` : "").join("");
    if (d.type === "purifier") {
      const f = this._s(d.fan);
      if (!f) return "";
      const on = f.state === "on";
      const pct = f.attributes.percentage ?? 0;
      const pm = Number(this._s(d.pm)?.state);
      const flt = Number(this._s(d.filter)?.state);
      const presets = f.attributes.preset_modes || [];
      const pmCls = pm <= 12 ? "ok" : pm <= 35 ? "warn" : "bad";
      return `
        <div class="dev glass purifier ${on ? "on" : ""}">
          <div class="dev-hd">${this._icon("mdi:air-purifier", 'class="dev-ic"')}<div><div class="dev-name">${lhcEsc(d.name || this._t("purifier"))}</div><div class="dev-sub">${on ? (f.attributes.preset_mode ? this._m("preset", f.attributes.preset_mode, f.attributes.preset_mode) : this._t("manual", pct)) : this._t("st_off")}</div></div>
            <button class="power ${on ? "on" : ""}" data-toggle="${lhcEsc(d.fan)}">${this._icon("mdi:power")}</button></div>
          <div class="pur-body">
            ${d.pm ? `<div class="pm ${pmCls}"><b>${Number.isFinite(pm) ? pm.toFixed(0) : "—"}</b><span>${this._t("pm_unit")}</span></div>` : ""}
            <div class="pur-ctl">
              ${presets.length ? `<div class="mchips">${presets.map((p) => `<button class="mchip ${f.attributes.preset_mode === p ? "on" : ""}" data-preset="${lhcEsc(d.fan)}" data-v="${lhcEsc(p)}">${this._m("preset", p, p)}</button>`).join("")}</div>` : ""}
              <input class="slider" type="range" min="1" max="100" value="${pct || 1}" data-fanpct="${lhcEsc(d.fan)}" style="--p:${pct}%">
              ${d.filter ? `<div class="bar"><span>${this._t("filter")}</span><i style="--w:${Number.isFinite(flt) ? flt : 0}%"></i><b>${Number.isFinite(flt) ? flt + "%" : "—"}</b></div>` : ""}
            </div>
          </div>
        </div>`;
    }
    if (d.type === "feeder") {
      const st = this._s(d.status)?.state;
      const n = this._s(d.manual);
      const max = n ? n.attributes.max || 10 : 10;
      const portions = this._pending[`p:${d.manual}`] ?? 1;
      return `
        <div class="dev glass feeder">
          <div class="dev-hd">${this._icon("mdi:cat", 'class="dev-ic"')}<div><div class="dev-name">${lhcEsc(d.name || this._t("feeder"))}</div><div class="dev-sub">${st ? this._m("feeder_st", st, lhcEsc(st)) : "—"}</div></div></div>
          ${d.manual ? `<div class="feed">
            <div class="stepper big"><button class="sbtn" data-portion="${lhcEsc(d.manual)}" data-v="-1" data-max="${max}">${this._icon("mdi:minus")}</button><b>${portions}</b><span>${this._t("portions", portions)}</span><button class="sbtn" data-portion="${lhcEsc(d.manual)}" data-v="1" data-max="${max}">${this._icon("mdi:plus")}</button></div>
            <button class="cta" data-feed="${lhcEsc(d.manual)}">${this._icon("mdi:food-drumstick-outline")}${this._t("feed_now")}</button>
          </div>` : ""}
          ${d.switches.length ? `<div class="toggles">${sws(d.switches)}</div>` : ""}
        </div>`;
    }
    if (d.type === "litter") {
      const st = this._s(d.status)?.state;
      return `
        <div class="dev glass litter">
          <div class="dev-hd">${this._icon("mdi:cat", 'class="dev-ic"')}<div><div class="dev-name">${lhcEsc(d.name || this._t("litter"))}</div><div class="dev-sub">${st ? this._m("litter_st", st, lhcEsc(st)) : "—"}</div></div>
            ${d.clean ? `<button class="cta sm" data-clean="${lhcEsc(d.clean)}">${this._icon("mdi:broom")}${this._t("clean")}</button>` : ""}</div>
          ${d.switches.length ? `<div class="toggles">${sws(d.switches)}</div>` : ""}
        </div>`;
    }
    if (d.type === "printer") return this._wPrinter(d);
    if (d.type === "washer" || d.type === "dryer") {
      const washer = d.type === "washer";
      const s = this._s(d.status);
      const avail = s && !LHC_BAD.includes(s.state);
      const running = avail && s.state === "running";
      const rem = Number(this._s(d.remaining)?.state);
      const extra = washer ? (this._ok(d.temp) ? (this._s(d.temp).state === "cold" ? this._t("cold") : this._s(d.temp).state + "°C") : "") : (this._ok(d.program) ? this._m("dry_prog", this._s(d.program).state, this._s(d.program).state.replace(/_/g, " ")) : "");
      const warns = !washer ? [[d.water, this._t("waterbox_full")], [d.filter, this._t("empty_filter")]].filter(([e]) => e && this._on(e)) : [];
      return `
        <div class="dev glass appl ${running ? "running" : ""} ${!avail ? "is-off" : ""}">
          <div class="dev-hd">${this._icon(washer ? "mdi:washing-machine" : "mdi:tumble-dryer", `class="dev-ic ${running ? "spin" : ""}"`)}<div><div class="dev-name">${lhcEsc(d.name || this._t(washer ? "washer" : "dryer"))}</div><div class="dev-sub">${avail ? this._m(washer ? "washer_st" : "dryer_st", s.state, lhcEsc(s.state)) : this._t("appl_offline")}</div></div></div>
          ${avail ? `<div class="appl-body"><div class="rem"><b>${Number.isFinite(rem) && rem > 0 ? rem : "—"}</b><span>${this._t("min_left")}</span></div>${extra ? `<div class="tag">${this._icon(washer ? "mdi:thermometer" : "mdi:tune-variant")}${lhcEsc(extra)}</div>` : ""}</div>` : ""}
          ${warns.map(([, t]) => `<div class="warnrow">${this._icon("mdi:alert-outline")}${t}</div>`).join("")}
        </div>`;
    }
    return "";
  }

  _wPrinter(d) {
    const S = (id) => (id ? this._s(id) : undefined);
    const st = (S(d.status) && S(d.status).state) || "unknown";
    const avail = !!S(d.status) && !LHC_BAD.includes(st) && st !== "offline";
    const active = ["running", "prepare", "pause", "init", "slicing"].includes(st);
    const pr = Math.max(0, Math.min(100, Number(S(d.progress) && S(d.progress).state) || 0));
    const left = lhcDuration(S(d.remaining));
    const tz = this._hass.config.time_zone, loc = this._lang === "pl" ? "pl-PL" : undefined;
    let ends = "";
    try {
      const et = S(d.end_time);
      if (et && !LHC_BAD.includes(et.state)) ends = new Date(et.state).toLocaleTimeString(loc, { hour: "2-digit", minute: "2-digit", timeZone: tz });
      else if (active && lhcRemainingMin(S(d.remaining)) > 0) ends = new Date(Date.now() + lhcRemainingMin(S(d.remaining)) * 60000).toLocaleTimeString(loc, { hour: "2-digit", minute: "2-digit", timeZone: tz });
    } catch (e) { ends = ""; }
    const stage = S(d.stage) && S(d.stage).state;
    const stageTxt = active && stage && !["printing", "idle", "unknown", "offline"].includes(stage) ? this._m("pr_stage", stage, stage.replace(/_/g, " ")) : "";
    const pic = (id) => (S(id) && S(id).attributes.entity_picture) || "";
    const camPic = pic(d.camera), modelPic = pic(d.image);
    const view = this._prView || (st === "running" && camPic ? "camera" : "model");
    const showCam = view === "camera" && !!camPic;
    const imgSrc = showCam ? `${camPic}&_=${Math.floor(Date.now() / 8000)}` : modelPic || camPic;
    const R = 52, C = 2 * Math.PI * R;
    const temp = (cur, tgt, label, icon) => {
      if (!d[cur]) return "";
      const c = this._num(S(d[cur]) && S(d[cur]).state, 0);
      const t = d[tgt] ? this._num(S(d[tgt]) && S(d[tgt]).state, 0) : null;
      return `<div class="pr-temp ${Number(c) > 45 ? "hot" : ""}">${this._icon(icon)}<span>${label}</span><b>${c}°</b>${t && t !== "0" && t !== "—" ? `<small>/ ${t}°</small>` : ""}</div>`;
    };
    const fil = d.filaments.map((id) => {
      const f = S(id);
      if (!f) return "";
      const a = f.attributes, empty = a.empty || f.state === "Empty";
      const col = String(a.color || "#000000").slice(0, 7);
      return `<div class="fil ${a.active ? "on" : ""} ${empty ? "empty" : ""}" title="${lhcEsc(f.state)}"><i style="background:${empty ? "transparent" : col}"></i><span>${empty ? this._t("pr_empty") : lhcEsc(a.type || f.state)}</span></div>`;
    }).join("");
    const btn = (id, icon, label, cls = "") => (id && S(id) && S(id).state !== "unavailable" ? `<button class="mchip ${cls}" data-press="${lhcEsc(id)}" ${cls === "danger" ? 'data-confirm="1"' : ""}>${this._icon(icon)}${label}</button>` : "");
    const light = S(d.light);
    const task = S(d.task);
    return `
      <div class="dev glass printer ${active ? "printing" : ""} ${st === "failed" ? "failed" : ""} ${!avail ? "is-off" : ""}">
        <div class="dev-hd">${this._icon("mdi:printer-3d-nozzle", `class="dev-ic ${st === "running" ? "pulse-ic" : ""}"`)}<div><div class="dev-name">${lhcEsc(d.name || this._t("printer"))}</div>
          <div class="dev-sub">${this._m("pr_status", st, lhcEsc(st))}${stageTxt ? ` · ${lhcEsc(stageTxt)}` : ""}</div></div>
          ${light ? `<button class="power ${light.state === "on" ? "on" : ""}" data-toggle="${lhcEsc(d.light)}" title="${this._t("pr_light")}">${this._icon(light.state === "on" ? "mdi:lightbulb-on" : "mdi:lightbulb-outline")}</button>` : ""}
        </div>
        <div class="pr-body">
          <div class="pr-media">
            ${imgSrc ? `<img src="${lhcEsc(imgSrc)}" alt="" ${showCam ? `data-cam="${lhcEsc(d.camera)}"` : ""} class="${showCam ? "cam" : "model"}">` : `<div class="pr-noimg">${this._icon("mdi:cube-outline")}</div>`}
            ${camPic && modelPic ? `<div class="pr-tabs"><button class="${!showCam ? "on" : ""}" data-prview="model">${this._t("pr_model")}</button><button class="${showCam ? "on" : ""}" data-prview="camera"><i class="live-dot"></i>${this._t("pr_camera")}</button></div>` : ""}
          </div>
          <div class="pr-ring">
            <svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="${R}" class="pr-track"/><circle cx="60" cy="60" r="${R}" class="pr-fill" style="stroke-dasharray:${C.toFixed(1)};stroke-dashoffset:${(C * (1 - pr / 100)).toFixed(1)}"/></svg>
            <div class="pr-c"><b>${active || st === "finish" ? Math.round(pr) : "—"}<small>%</small></b>${left && active ? `<span>${left}</span>` : ""}</div>
          </div>
        </div>
        ${task && !LHC_BAD.includes(task.state) ? `<div class="pr-task">${this._icon("mdi:file-cad-box")}<span>${lhcEsc(task.state.replace(/\.(stl|3mf|gcode)$/i, "").replace(/_/g, " "))}</span></div>` : ""}
        <div class="pr-meta">
          ${d.layer && d.total_layers ? `<div>${this._icon("mdi:layers-triple-outline")}<span>${this._t("pr_layer")}</span><b>${this._num(S(d.layer) && S(d.layer).state, 0)} / ${this._num(S(d.total_layers) && S(d.total_layers).state, 0)}</b></div>` : ""}
          ${ends && active ? `<div>${this._icon("mdi:flag-checkered")}<span>${this._t("pr_ends", ends)}</span></div>` : ""}
        </div>
        <div class="pr-temps">${temp("nozzle", "nozzle_target", this._t("pr_nozzle"), "mdi:printer-3d-nozzle-heat-outline")}${temp("bed", "bed_target", this._t("pr_bed"), "mdi:radiator")}</div>
        ${fil ? `<div class="fils">${fil}</div>` : ""}
        ${active ? `<div class="mchips pr-ctl">${st === "pause" ? btn(d.resume, "mdi:play", this._t("pr_resume")) : btn(d.pause, "mdi:pause", this._t("pr_pause"))}${btn(d.stop, "mdi:stop", this._t("pr_stop"), "danger")}</div>` : ""}
      </div>`;
  }

  /* ---------- historia 24h ---------- */
  async _loadHistory(r) {
    const ids = [r.temp, r.hum].filter(Boolean);
    if (!ids.length) return;
    const cached = this._hist[r.id];
    if (cached && Date.now() - cached.t < 5 * 60 * 1000) { this._drawChart(r, cached.data); return; }
    try {
      const start = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
      const res = await this._hass.callWS({ type: "history/history_during_period", start_time: start, entity_ids: ids, minimal_response: true, no_attributes: true, significant_changes_only: false });
      this._hist[r.id] = { t: Date.now(), data: res };
      if (this._view === r.id) this._drawChart(r, res);
    } catch (e) {
      const c = this._el("chart");
      if (c) c.innerHTML = `<div class="muted pad">${this._t("no_history")}</div>`;
    }
  }
  _drawChart(r, res) {
    const c = this._el("chart");
    if (!c) return;
    const t0 = Date.now() - 24 * 3600 * 1000;
    const series = [[r.temp, "#fbbf24", "°C", this._t("temperature")], [r.hum, "#60a5fa", "%", this._t("humidity")]].filter(([id]) => id && res[id]).map(([id, col, unit, label]) => {
      const pts = res[id].map((p) => [((p.lu || p.lc) * 1000) || Date.parse(p.last_updated || p.last_changed), Number(p.s ?? p.state)]).filter((p) => Number.isFinite(p[0]) && Number.isFinite(p[1]));
      return { col, unit, label, pts };
    }).filter((s) => s.pts.length > 1);
    if (!series.length) { c.innerHTML = `<div class="muted pad">${this._t("no_history_day")}</div>`; return; }
    const W = 1000, H = 220;
    const paths = series.map((s, k) => {
      const vals = s.pts.map((p) => p[1]);
      let min = Math.min(...vals), max = Math.max(...vals);
      const rmin = min, rmax = max;
      if (max - min < 1) { min -= 0.5; max += 0.5; }
      const X = (t) => ((Math.max(t, t0) - t0) / (24 * 3600 * 1000)) * W;
      const Y = (v) => H - 14 - ((v - min) / (max - min)) * (H - 40);
      let d = "";
      s.pts.forEach((p, i) => { d += `${i ? "L" : "M"}${X(p[0]).toFixed(1)},${Y(p[1]).toFixed(1)} `; });
      d += `L${W},${Y(s.pts[s.pts.length - 1][1]).toFixed(1)}`;
      return { s, d, min: rmin, max: rmax, last: s.pts[s.pts.length - 1][1], k };
    });
    c.innerHTML = `
      <div class="legend">${paths.map((p) => `<span><i style="background:${p.s.col}"></i>${p.s.label}<b>${p.last.toFixed(p.s.unit === "%" ? 0 : 1)}${p.s.unit}</b><small>min ${p.min.toFixed(1)} · max ${p.max.toFixed(1)}</small></span>`).join("")}</div>
      <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
        <defs>${paths.map((p) => `<linearGradient id="cg${p.k}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${p.s.col}" stop-opacity=".28"/><stop offset="1" stop-color="${p.s.col}" stop-opacity="0"/></linearGradient>`).join("")}</defs>
        ${[0.25, 0.5, 0.75].map((f) => `<line x1="${W * f}" x2="${W * f}" y1="0" y2="${H}" class="gl"/>`).join("")}
        ${paths.map((p) => `<path d="${p.d} L${W},${H} L0,${H} Z" fill="url(#cg${p.k})"/><path d="${p.d}" class="cl" stroke="${p.s.col}" pathLength="1"/>`).join("")}
      </svg>
      <div class="axis"><span>${this._t("h24")}</span><span>${this._t("h18")}</span><span>${this._t("h12")}</span><span>${this._t("h6")}</span><span>${this._t("h0")}</span></div>`;
  }

  /* ---------- interakcje ---------- */
  _more(id) { this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId: id }, bubbles: true, composed: true })); }
  _rerender(key) {
    const w = (this._widgets || []).find((x) => x.key === key);
    const el = this._root.querySelector(`.slot[data-w="${CSS.escape(key)}"]`);
    if (w && el) el.innerHTML = w.render();
  }

  _click(e) {
    const path = e.composedPath();
    const stop = path.indexOf(this._root);
    const keys = ["prview", "press", "open", "nav", "hub", "goto", "toggle", "roomlights", "rgb", "kelvin", "hvac", "tstep", "media", "mpower", "preset", "portion", "feed", "clean", "more"];
    const t = (stop >= 0 ? path.slice(0, stop) : path).find((n) => n.dataset && Object.keys(n.dataset).some((k) => keys.includes(k)));
    if (!t || t.tagName === "INPUT") return;
    const d = t.dataset;
    e.stopPropagation();
    if (d.prview) {
      this._prView = d.prview;
      (this._widgets || []).filter((w) => w.key.startsWith("d:")).forEach((w) => this._rerender(w.key));
      return;
    }
    if (d.press) {
      if (d.confirm && !confirm(this._t("pr_stop_confirm"))) return;
      return this._call("button", "press", { entity_id: d.press });
    }
    if (d.roomlights) {
      const r = this._rooms.find((x) => x.id === d.roomlights);
      const ids = r.lights.filter((l) => l[3] !== "fan" && this._ok(l[0])).map((l) => l[0]);
      const any = ids.some((id) => this._on(id));
      if (t.classList.contains("t-bulb")) { t.classList.add("bump"); setTimeout(() => t.classList.remove("bump"), 400); }
      return this._call("homeassistant", any ? "turn_off" : "turn_on", { entity_id: ids });
    }
    if (d.open) return this._openFromTile(d.open, t.classList.contains("tile") ? t : null);
    if (d.nav) return lhcNavigate(d.nav);
    if (d.hub) return this._goHub();
    if (d.goto) {
      if (d.goto === this._view) return;
      const dir = this._rooms.findIndex((x) => x.id === d.goto) > this._rooms.findIndex((x) => x.id === this._view) ? 1 : -1;
      history.replaceState({ lrc: d.goto }, "", `${location.pathname}${location.search}#${d.goto}`);
      return this._showRoom(d.goto, null, dir);
    }
    if (d.toggle) {
      const dom = d.toggle.split(".")[0];
      return this._call(["switch", "light", "fan", "input_boolean"].includes(dom) ? dom : "homeassistant", "toggle", { entity_id: d.toggle });
    }
    if (d.rgb) return this._call("light", "turn_on", { entity_id: d.rgb, rgb_color: d.v.split(",").map(Number) });
    if (d.kelvin) return this._call("light", "turn_on", { entity_id: d.kelvin, color_temp_kelvin: Number(d.v) });
    if (d.hvac) return this._call("climate", "set_hvac_mode", { entity_id: d.hvac, hvac_mode: d.v });
    if (d.tstep) {
      const id = d.tstep, s = this._s(id);
      const step = s.attributes.target_temp_step || 0.5;
      const base = this._pending[`t:${id}`] ?? Number(s.attributes.temperature);
      const min = s.attributes.min_temp ?? 5, max = s.attributes.max_temp ?? 35;
      this._pending[`t:${id}`] = Math.max(min, Math.min(max, Math.round((base + Number(d.v) * step) * 10) / 10));
      this._busy[`c:${id}`] = Date.now() + 2500;
      this._rerender(`c:${id}`);
      clearTimeout(this._tT);
      this._tT = setTimeout(async () => {
        const v = this._pending[`t:${id}`];
        try { await this._call("climate", "set_temperature", { entity_id: id, temperature: v }); } finally {
          setTimeout(() => { delete this._pending[`t:${id}`]; delete this._busy[`c:${id}`]; this._rerender(`c:${id}`); }, 1500);
        }
      }, 800);
      return;
    }
    if (d.media) return this._call("media_player", d.v, { entity_id: d.media });
    if (d.mpower) return this._call("media_player", d.v === "on" ? "turn_on" : "turn_off", { entity_id: d.mpower });
    if (d.preset) return this._call("fan", "set_preset_mode", { entity_id: d.preset, preset_mode: d.v });
    if (d.portion) {
      const k = `p:${d.portion}`;
      this._pending[k] = Math.max(1, Math.min(Number(d.max) || 10, (this._pending[k] ?? 1) + Number(d.v)));
      const dev = this._widgets.find((w) => w.ids.includes(d.portion));
      if (dev) this._rerender(dev.key);
      return;
    }
    if (d.feed) {
      const n = this._pending[`p:${d.feed}`] ?? 1;
      if (!confirm(this._t("feed_confirm", n))) return;
      return this._call("number", "set_value", { entity_id: d.feed, value: n });
    }
    if (d.clean) {
      if (!confirm(this._t("clean_confirm"))) return;
      const dom = d.clean.split(".")[0];
      return this._call(dom === "button" ? "button" : "homeassistant", dom === "button" ? "press" : "turn_on", { entity_id: d.clean });
    }
    if (d.more) return this._more(d.more);
  }

  _input(e) {
    const t = e.target, d = t.dataset;
    if (!d) return;
    t.style.setProperty("--p", `${t.value}%`);
    const id = d.bri || d.vol || d.fanpct;
    if (!id) return;
    const w = this._widgets.find((x) => x.ids.includes(id));
    if (w) this._busy[w.key] = Date.now() + 2500;
    if (d.bri) { const st = t.closest(".lt")?.querySelector(".lt-state"); if (st) st.textContent = `${t.value}%`; }
  }
  _change(e) {
    const t = e.target, d = t.dataset;
    if (!d) return;
    const v = Number(t.value);
    const done = (id) => { const w = this._widgets.find((x) => x.ids.includes(id)); if (w) setTimeout(() => { delete this._busy[w.key]; }, 1500); };
    if (d.bri) { this._call("light", "turn_on", { entity_id: d.bri, brightness_pct: v }); done(d.bri); }
    if (d.vol) { this._call("media_player", "volume_set", { entity_id: d.vol, volume_level: v / 100 }); done(d.vol); }
    if (d.fanpct) { this._call("fan", "set_percentage", { entity_id: d.fanpct, percentage: v }); done(d.fanpct); }
  }
}

const LRC_STYLE = `:host{display:block;--txt:#eef4ff;--dim:#9fb0cd;--line:rgba(255,255,255,.12);font-family:"Inter","Segoe UI",Roboto,system-ui,sans-serif;color:var(--txt)}
*{box-sizing:border-box}
button{font:inherit;color:inherit;background:none;border:0;padding:0;cursor:pointer}
button:disabled{cursor:default}
ha-icon{--mdc-icon-size:20px;display:inline-flex}
h1,h2,p{margin:0}
.blue{color:#60a5fa}.amber{color:#f59e4c}.yellow{color:#facc15}.green{color:#4ade80}.grey{color:#64748b}.violet{color:#a78bfa}.mint{color:#5eead4}
.muted{color:var(--dim);font-size:13px}.pad{padding:14px}

.page{position:relative;min-height:calc(100vh - var(--header-height,56px));background:#040913;overflow:hidden}
.bg{position:absolute;inset:0;pointer-events:none;overflow:hidden}
.bg>*{position:absolute;inset:0}
.bg-img{inset:-10%;background:radial-gradient(ellipse at 30% 20%,#1e3a8a,#0b1020 60%);filter:blur(70px) saturate(1.5) brightness(.4);transform:scale(1.1);transition:background-image .6s}
.bg-dim{background:radial-gradient(ellipse at 50% 0%,transparent 0%,rgba(4,9,19,.55) 70%)}
.orb{inset:auto;border-radius:50%;filter:blur(70px);opacity:.4;animation:drift 24s ease-in-out infinite alternate}
.o1{width:40%;height:50%;left:-8%;top:8%;background:#1d4ed8}.o2{width:34%;height:44%;right:-8%;bottom:-10%;background:#7c3aed;animation-delay:-10s;opacity:.3}

.glass{position:relative;background:linear-gradient(150deg,rgba(255,255,255,.12),rgba(255,255,255,.035) 45%,rgba(255,255,255,.02)),rgba(12,20,40,.4);
  border:1px solid rgba(255,255,255,.13);box-shadow:inset 0 1px 0 rgba(255,255,255,.22),0 14px 40px rgba(0,0,0,.4);
  backdrop-filter:blur(22px) saturate(160%);-webkit-backdrop-filter:blur(22px) saturate(160%)}

/* ---------- HUB ---------- */
.hub{position:relative;display:flex;flex-direction:column;gap:16px;padding:18px 22px 22px;min-height:calc(100vh - var(--header-height,56px))}
.hub[hidden],.room[hidden]{display:none}
.hub.back-in{animation:fade .5s ease both}
.hhd{display:flex;align-items:center;gap:18px;flex-wrap:wrap}
.back{display:flex;align-items:center;gap:8px;padding:10px 16px;border-radius:999px;font-size:14.5px;transition:border-color .2s,transform .2s}
.back:hover{border-color:rgba(147,197,253,.55);transform:translateY(-1px)}
.htitle{flex:1;min-width:200px}
.kicker{font-size:12.5px;letter-spacing:.14em;text-transform:uppercase;color:#8fb4e8}
h1{font-size:34px;font-weight:600;letter-spacing:-.01em;background:linear-gradient(90deg,#fff,#a5c8ff);-webkit-background-clip:text;background-clip:text;color:transparent}
.hsum{display:flex;gap:10px;flex-wrap:wrap}
.pill{display:flex;align-items:center;gap:8px;padding:9px 14px;border-radius:999px;font-size:13.5px}
.pill ha-icon{--mdc-icon-size:18px}
.pill.ok ha-icon{color:#4ade80}.pill.warn{border-color:rgba(251,191,36,.55)}.pill.warn ha-icon{color:#fbbf24}
.pill.bad{border-color:rgba(248,113,113,.7);animation:alarm 1.4s ease-in-out infinite}.pill.bad ha-icon{color:#f87171}
.pill[data-open]{cursor:pointer}

.bento{flex:1;display:grid;gap:16px;grid-template-columns:repeat(4,minmax(0,1fr));grid-template-rows:repeat(var(--rows,3),minmax(170px,1fr));grid-auto-flow:row dense;perspective:1400px}
.sz-big{grid-column:span 2;grid-row:span 2}.sz-wide{grid-column:span 2}.sz-tall{grid-row:span 2}
.tile{position:relative;border-radius:26px;overflow:hidden;cursor:pointer;isolation:isolate;
  transform:rotateX(var(--rx,0)) rotateY(var(--ry,0));transition:transform .35s cubic-bezier(.2,.8,.2,1),box-shadow .4s,border-color .4s;
  border:1px solid rgba(255,255,255,.12);box-shadow:0 18px 50px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.18)}
.tile:hover{box-shadow:0 26px 70px rgba(0,0,0,.55),0 0 0 1px rgba(var(--acc),.55),0 0 40px rgba(var(--acc),.25)}
.tile.lit{border-color:rgba(255,200,120,.38)}
.tile.lit::after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;box-shadow:inset 0 0 60px rgba(255,180,90,.18);animation:breathe 5s ease-in-out infinite}
.tile.pulse{animation:pulseT 1.2s ease}
.t-img{position:absolute;inset:-4%;background-size:cover;background-position:center;z-index:-2;
  filter:brightness(calc(.38 + .62 * var(--lit,1))) saturate(calc(.55 + .45 * var(--lit,1)));transition:filter 1.4s ease,transform 8s ease;transform:scale(1.02)}
.tile:hover .t-img{transform:scale(1.12)}
.t-shade{position:absolute;inset:0;z-index:-1;background:linear-gradient(180deg,rgba(4,8,18,.15) 0%,rgba(4,8,18,0) 35%,rgba(4,8,18,.55) 70%,rgba(4,8,18,.88) 100%)}
.tile.dark .t-shade{background:linear-gradient(180deg,rgba(6,10,26,.45),rgba(6,10,26,.35) 40%,rgba(4,8,18,.92) 100%)}
.t-glare{position:absolute;inset:0;z-index:0;pointer-events:none;opacity:0;transition:opacity .4s;
  background:radial-gradient(circle at var(--gx,50%) var(--gy,50%),rgba(255,255,255,.22),transparent 45%)}
.tile:hover .t-glare{opacity:1}
.t-top{position:absolute;top:14px;left:14px;right:14px;display:flex;align-items:flex-start;gap:8px;z-index:1}
.t-ic{width:44px;height:44px;border-radius:14px;display:grid;place-items:center;flex:none}
.t-ic ha-icon{--mdc-icon-size:23px;color:rgb(var(--acc))}
.t-badges{flex:1;display:flex;gap:6px;flex-wrap:wrap}
.alert{display:inline-flex;align-items:center;gap:5px;padding:5px 9px;border-radius:999px;font-size:12px;background:rgba(10,14,28,.6);backdrop-filter:blur(10px)}
.alert ha-icon{--mdc-icon-size:15px}
.alert.warn{border:1px solid rgba(251,191,36,.6);color:#fde68a}.alert.bad{border:1px solid rgba(248,113,113,.8);color:#fecaca;animation:alarm 1.4s infinite}
.t-bulb{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;flex:none;transition:.3s}
.t-bulb ha-icon{--mdc-icon-size:22px;color:#94a3b8}
.t-bulb.on{border-color:rgba(250,204,21,.7);box-shadow:0 0 18px rgba(250,204,21,.55),inset 0 1px 0 rgba(255,255,255,.3)}
.t-bulb.on ha-icon{color:#fde047;filter:drop-shadow(0 0 6px rgba(250,204,21,.9))}
.t-bulb.bump{transform:scale(.88)}
.t-bottom{position:absolute;left:18px;right:18px;bottom:16px;z-index:1}
.t-name{font-size:24px;font-weight:600;letter-spacing:-.01em;text-shadow:0 2px 12px rgba(0,0,0,.6)}
.sz-big .t-name{font-size:36px}
.t-sub{font-size:13px;color:#cbd5e1;margin:2px 0 10px;opacity:.85;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.t-chips{display:flex;gap:6px;flex-wrap:wrap}
.chip{display:inline-flex;align-items:center;gap:5px;padding:5px 10px;border-radius:999px;font-size:13px;
  background:rgba(10,16,30,.5);border:1px solid rgba(255,255,255,.14);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}
.chip ha-icon{--mdc-icon-size:15px}
.chip.on{border-color:rgba(250,204,21,.45)}
.chip.tv{border-color:rgba(167,139,250,.6)}.chip.tv ha-icon{color:#c4b5fd}

/* ---------- POKÓJ ---------- */
.room{position:relative;padding:0 0 30px}
.room.enter{animation:fade .45s ease both}
.room.enter-flip .hero-img{opacity:0}
.room.enter-flip .hero-body,.room.enter-flip .rbody,.room.enter-flip .hero-nav{opacity:0}
.room.enter .rise2{animation:rise .7s cubic-bezier(.2,.8,.2,1) both}
.room.enter .rise2:nth-child(2){animation-delay:.07s}.room.enter .rise2:nth-child(3){animation-delay:.14s}
.room.enter .rise2:nth-child(4){animation-delay:.21s}.room.enter .rise2:nth-child(5){animation-delay:.28s}.room.enter .rise2:nth-child(6){animation-delay:.35s}
.room.slide-l{animation:slideL .5s cubic-bezier(.2,.8,.2,1) both}.room.slide-r{animation:slideR .5s cubic-bezier(.2,.8,.2,1) both}
.room.leaving{animation:fadeOut .26s ease both}
.ghost{position:fixed;z-index:30;background-size:cover;background-position:center;pointer-events:none;box-shadow:0 30px 80px rgba(0,0,0,.6)}
.hero{position:relative;height:min(46vh,440px);min-height:300px;margin:14px 18px 0;border-radius:30px;overflow:hidden;isolation:isolate}
.hero-img{position:absolute;inset:0;background-size:cover;background-position:center;z-index:-2;animation:kb 30s ease-in-out infinite alternate}
.hero-shade{position:absolute;inset:0;z-index:-1;background:linear-gradient(180deg,rgba(4,8,18,.35) 0%,rgba(4,8,18,0) 30%,rgba(4,8,18,.55) 70%,rgba(4,9,19,.95) 100%),radial-gradient(ellipse at 15% 100%,rgba(var(--acc),.3),transparent 55%)}
.hero-nav{position:absolute;top:16px;left:16px;right:16px;display:flex;justify-content:space-between;align-items:center;transition:opacity .3s}
.hero-arrows{display:flex;gap:10px}
.round{width:46px;height:46px;border-radius:50%;display:grid;place-items:center;transition:border-color .2s,transform .2s}
.round:hover{border-color:rgba(147,197,253,.6);transform:translateY(-1px)}
.round ha-icon{--mdc-icon-size:24px}
.round.sm{width:40px;height:40px}.round.sm ha-icon{--mdc-icon-size:20px}
.hero-body{position:absolute;left:28px;right:28px;bottom:24px;transition:opacity .3s}
.hero-ic ha-icon{--mdc-icon-size:34px;color:rgb(var(--acc));filter:drop-shadow(0 0 12px rgba(var(--acc),.7))}
h2{font-size:clamp(34px,5vw,58px);font-weight:700;letter-spacing:-.02em;line-height:1.05;text-shadow:0 4px 24px rgba(0,0,0,.6)}
.hero-body p{color:#cbd5e1;font-size:16px;margin:4px 0 14px}
.stats{display:flex;gap:10px;flex-wrap:wrap}
.stat{display:flex;align-items:baseline;gap:5px;padding:9px 14px;border-radius:16px;background:rgba(10,16,30,.5);border:1px solid rgba(255,255,255,.15);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}
.stat ha-icon{--mdc-icon-size:20px;align-self:center}
.stat b{font-size:24px;font-weight:600}.stat span{color:var(--dim);font-size:13px}
.stat.warn{border-color:rgba(251,191,36,.6)}.stat.warn ha-icon{color:#fbbf24}
.stat.bad{border-color:rgba(248,113,113,.8);animation:alarm 1.4s infinite}.stat.bad ha-icon{color:#f87171}
.stat.tv{border-color:rgba(167,139,250,.6)}.stat.tv ha-icon{color:#c4b5fd}

.rbody{position:relative;display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:18px;padding:18px;transition:opacity .3s}
.sec{grid-column:span 12;min-width:0}
@media (min-width:1000px){.sec.half{grid-column:span 6}.sec.half .mgrid,.sec.half .dgrid{grid-template-columns:repeat(auto-fill,minmax(300px,1fr))}}
.sec-hd{display:flex;align-items:center;gap:10px;font-size:18px;font-weight:600;margin:4px 4px 12px}
.sec-hd ha-icon{--mdc-icon-size:22px;color:#93c5fd}
.mini{margin-left:auto;padding:7px 14px;border-radius:999px;font-size:13px;font-weight:500}
.mini:hover{border-color:rgba(250,204,21,.6)}

.lgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(168px,1fr));gap:14px;align-items:start}
.lt{border-radius:22px;padding:14px;display:flex;flex-direction:column;gap:12px;transition:border-color .4s,box-shadow .4s}
.lt.on{border-color:rgba(var(--lc),.55);box-shadow:inset 0 1px 0 rgba(255,255,255,.25),0 14px 40px rgba(0,0,0,.4),0 0 30px rgba(var(--lc),.18)}
.lt.off-line{opacity:.5}
.lt-main{display:grid;grid-template-columns:auto 1fr auto;grid-template-areas:"b . s" "t t t";align-items:start;gap:12px;text-align:left;width:100%}
.lt-main .bulb{grid-area:b}.lt-main .sw{grid-area:s}.lt-main .lt-txt{grid-area:t}
.bulb{width:52px;height:52px;border-radius:16px;display:grid;place-items:center;flex:none;background:rgba(255,255,255,.06);transition:.4s}
.bulb ha-icon{--mdc-icon-size:28px;color:#64748b;transition:.4s}
.lt.on .bulb{background:radial-gradient(circle,rgba(var(--lc),.45),rgba(var(--lc),.08) 70%)}
.lt.on .bulb ha-icon{color:rgb(var(--lc));filter:drop-shadow(0 0 10px rgba(var(--lc),.95))}
.lt.spin-ic .bulb ha-icon{animation:spin 1.6s linear infinite}
.lt-txt{flex:1;min-width:0}
.lt-name{font-size:15px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.lt-state{font-size:12.5px;color:var(--dim)}
.sw{width:42px;height:24px;border-radius:12px;background:rgba(100,116,139,.45);position:relative;flex:none;transition:.25s;border:1px solid var(--line)}
.sw i{position:absolute;top:2px;left:2px;width:18px;height:18px;border-radius:50%;background:#cbd5e1;transition:.25s}
.sw.on{background:#2563eb;box-shadow:0 0 12px rgba(59,130,246,.6)}.sw.on i{left:20px;background:#fff}
.sw.big{width:50px;height:28px}.sw.big i{width:22px;height:22px}.sw.big.on i{left:24px}
.slider{-webkit-appearance:none;appearance:none;width:100%;height:10px;border-radius:6px;outline:none;cursor:pointer;
  background:linear-gradient(90deg,rgba(var(--lc,96,165,250),.9) 0 var(--p,0%),rgba(255,255,255,.12) var(--p,0%) 100%)}
.slider::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;background:#fff;box-shadow:0 0 0 4px rgba(255,255,255,.15),0 4px 10px rgba(0,0,0,.4)}
.slider::-moz-range-thumb{width:22px;height:22px;border-radius:50%;background:#fff;border:0}
.sws{display:flex;gap:7px;flex-wrap:wrap}
.swatch{width:24px;height:24px;border-radius:50%;background:rgb(var(--c));box-shadow:0 0 10px rgba(var(--c),.6),inset 0 0 0 2px rgba(255,255,255,.35);transition:transform .2s}
.swatch:hover{transform:scale(1.18)}
.kel{display:flex;gap:6px}
.kchip,.mchip{display:inline-flex;align-items:center;gap:5px;padding:6px 11px;border-radius:999px;font-size:12.5px;border:1px solid var(--line);background:rgba(255,255,255,.05);transition:.2s}
.kchip:hover,.mchip:hover{border-color:rgba(147,197,253,.6)}
.mchip ha-icon{--mdc-icon-size:15px}
.mchip.on{background:linear-gradient(180deg,rgba(59,130,246,.45),rgba(29,78,216,.2));border-color:#3b82f6;box-shadow:0 0 12px rgba(59,130,246,.45)}

.cgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px;align-items:start}
.dial{border-radius:26px;padding:16px;display:flex;flex-direction:column;align-items:center;gap:10px}
.dial-hd{width:100%;display:flex;justify-content:space-between;align-items:center;font-size:16px;font-weight:600}
.act{display:flex;align-items:center;gap:4px;font-size:12.5px;font-weight:400;color:var(--dim)}
.act ha-icon{--mdc-icon-size:16px}
.dial.heating .act{color:#fdba74}.dial.heating .act ha-icon{color:#fb923c;animation:pulse 1.6s infinite}
.dial.cooling .act{color:#7dd3fc}
.dial-ring{position:relative;width:min(240px,100%);aspect-ratio:1}
.dial-ring svg{width:100%;height:100%;overflow:visible}
.track{fill:none;stroke:rgba(255,255,255,.1);stroke-width:14;stroke-linecap:round}
.fill{fill:none;stroke-width:14;stroke-linecap:round;filter:drop-shadow(0 0 8px rgba(251,146,60,.5));transition:d .4s}
.dial.is-off .track{stroke:rgba(255,255,255,.06)}
.knob{fill:#fff;filter:drop-shadow(0 2px 6px rgba(0,0,0,.5))}
.curdot{fill:#0f172a;stroke:#e2e8f0;stroke-width:2}
.dial.heating .dial-ring::before{content:"";position:absolute;inset:16%;border-radius:50%;background:radial-gradient(circle,rgba(251,146,60,.3),transparent 70%);animation:breathe 2.4s ease-in-out infinite}
.dial.cooling .dial-ring::before{content:"";position:absolute;inset:16%;border-radius:50%;background:radial-gradient(circle,rgba(56,189,248,.28),transparent 70%);animation:breathe 2.4s ease-in-out infinite}
.dial-c{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none}
.dial-t{font-size:52px;font-weight:300;line-height:1}.dial-t small{font-size:26px}
.dial-cur{font-size:13px;color:var(--dim);margin-top:4px}
.dbtn{position:absolute;bottom:4%;width:46px;height:46px;border-radius:50%;display:grid;place-items:center}
.dbtn.minus{left:6%}.dbtn.plus{right:6%}
.dbtn:hover{border-color:rgba(251,146,60,.6)}
.mchips{display:flex;gap:6px;flex-wrap:wrap;justify-content:center}
.crow{border-radius:20px;padding:12px 14px;display:flex;align-items:center;gap:12px}
.crow-ic{width:44px;height:44px;border-radius:14px;display:grid;place-items:center;background:rgba(255,255,255,.06)}
.crow-ic ha-icon{--mdc-icon-size:24px;color:#f5a35c}
.crow.heating .crow-ic{background:radial-gradient(circle,rgba(251,146,60,.4),rgba(251,146,60,.05));}
.crow.heating .crow-ic ha-icon{color:#fb7a3c;animation:pulse 1.6s infinite}
.crow.is-off .crow-ic ha-icon{color:#64748b}
.crow-txt{flex:1;min-width:0}.crow-name{font-size:15px;font-weight:500}.crow-sub{font-size:12.5px;color:var(--dim)}
.stepper{display:flex;align-items:center;gap:6px}
.stepper b{min-width:52px;text-align:center;font-size:17px;font-weight:600}
.sbtn{width:32px;height:32px;border-radius:50%;display:grid;place-items:center;border:1px solid var(--line);background:rgba(255,255,255,.06)}
.sbtn:hover{border-color:rgba(147,197,253,.6)}
.sbtn ha-icon{--mdc-icon-size:18px}

.mgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:14px}
.md{border-radius:24px;padding:16px;overflow:hidden;display:flex;flex-direction:column;gap:14px}
.md-bg{position:absolute;inset:-20%;background-size:cover;background-position:center;filter:blur(40px) brightness(.5) saturate(1.4);z-index:-1;opacity:.85}
.md.is-off{opacity:.75}
.md-row{display:flex;align-items:center;gap:14px}
.md-art{position:relative;width:76px;height:76px;border-radius:18px;flex:none;display:grid;place-items:center;background:rgba(255,255,255,.07) center/cover;box-shadow:0 10px 24px rgba(0,0,0,.4)}
.md-art ha-icon{--mdc-icon-size:36px;color:#a78bfa}
.md.playing .md-art{box-shadow:0 10px 24px rgba(0,0,0,.4),0 0 24px rgba(167,139,250,.45)}
.eq{position:absolute;right:6px;bottom:6px;display:flex;gap:2px;align-items:flex-end;height:16px}
.eq i{width:3px;background:#c4b5fd;border-radius:2px;animation:eq .9s ease-in-out infinite}
.eq i:nth-child(2){animation-delay:-.3s}.eq i:nth-child(3){animation-delay:-.6s}
.md-txt{flex:1;min-width:0}
.md-name{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#c4b5fd}
.md-title{font-size:17px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.md-sub{font-size:13px;color:var(--dim);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.md-ctl{display:flex;align-items:center;gap:10px}
.round.play{width:52px;height:52px;background:linear-gradient(180deg,rgba(167,139,250,.5),rgba(124,58,237,.25));border-color:rgba(167,139,250,.7)}
.vol{flex:1;display:flex;align-items:center;gap:8px;--lc:167,139,250}
.vol ha-icon{color:var(--dim)}

.dgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:14px;align-items:start}
.dev{border-radius:24px;padding:16px;display:flex;flex-direction:column;gap:14px}
.dev-hd{display:flex;align-items:center;gap:12px}
.dev-hd>div{flex:1;min-width:0}
.dev-ic{--mdc-icon-size:34px;color:#a5b4fc}
.dev-ic.spin{animation:spin 2s linear infinite}
.dev-name{font-size:16px;font-weight:600}.dev-sub{font-size:13px;color:var(--dim)}
.dev.is-off{opacity:.6}
.power{width:42px;height:42px;border-radius:50%;display:grid;place-items:center;color:#64748b;border:1px solid var(--line);transition:.25s}
.power.on{color:#4ade80;border-color:rgba(74,222,128,.55);box-shadow:0 0 14px rgba(74,222,128,.5)}
.pur-body{display:flex;gap:16px;align-items:center}
.pm{width:110px;height:110px;border-radius:50%;flex:none;display:flex;flex-direction:column;align-items:center;justify-content:center;
  background:radial-gradient(circle,rgba(74,222,128,.22),rgba(74,222,128,.03) 70%);border:2px solid rgba(74,222,128,.5)}
.pm b{font-size:36px;font-weight:500;line-height:1}.pm span{font-size:10.5px;color:var(--dim);text-align:center}
.pm.warn{background:radial-gradient(circle,rgba(250,204,21,.22),transparent 70%);border-color:rgba(250,204,21,.55)}
.pm.bad{background:radial-gradient(circle,rgba(248,113,113,.25),transparent 70%);border-color:rgba(248,113,113,.6)}
.dev.purifier.on .pm{animation:breathe 4s ease-in-out infinite}
.pur-ctl{flex:1;display:flex;flex-direction:column;gap:12px;--lc:74,222,128}
.pur-ctl .mchips{justify-content:flex-start}
.bar{display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--dim)}
.bar i{flex:1;height:6px;border-radius:3px;background:linear-gradient(90deg,#4ade80 0 var(--w),rgba(255,255,255,.1) var(--w))}
.bar b{color:var(--txt);font-weight:500}
.feed{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.stepper.big b{font-size:26px;min-width:34px}.stepper.big span{color:var(--dim);font-size:13px;margin-right:4px}
.cta{display:inline-flex;align-items:center;gap:8px;padding:11px 18px;border-radius:999px;font-weight:600;font-size:14px;
  background:linear-gradient(180deg,rgba(236,72,153,.55),rgba(190,24,93,.3));border:1px solid rgba(244,114,182,.7);box-shadow:0 0 18px rgba(236,72,153,.35);transition:transform .2s}
.cta:hover{transform:translateY(-1px)}
.cta.sm{padding:8px 13px;font-size:13px;background:linear-gradient(180deg,rgba(56,189,248,.45),rgba(2,132,199,.2));border-color:rgba(56,189,248,.6);box-shadow:0 0 14px rgba(56,189,248,.3)}
.toggles{display:flex;flex-direction:column;gap:4px}
.trow{display:flex;justify-content:space-between;align-items:center;padding:8px 2px;border-top:1px solid var(--line);font-size:14px}
.appl-body{display:flex;align-items:center;gap:14px}
.rem b{font-size:38px;font-weight:300}.rem span{color:var(--dim);font-size:13px;margin-left:6px}
.tag{display:inline-flex;align-items:center;gap:6px;padding:6px 11px;border-radius:999px;font-size:12.5px;border:1px solid var(--line);background:rgba(255,255,255,.05)}
.tag ha-icon{--mdc-icon-size:15px}
.warnrow{display:flex;align-items:center;gap:8px;color:#fde68a;font-size:13.5px}
.warnrow ha-icon{color:#fbbf24}
.dev.appl.running{border-color:rgba(167,139,250,.55);box-shadow:inset 0 1px 0 rgba(255,255,255,.2),0 0 30px rgba(167,139,250,.25)}

.sgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px}
.sens{border-radius:18px;padding:13px 14px;display:flex;align-items:center;gap:12px;text-align:left}
.sens ha-icon{--mdc-icon-size:28px;color:#94a3b8}
.s-name{font-size:13px;color:var(--dim)}.s-val{font-size:16px;font-weight:600}
.sens.ok ha-icon{color:#4ade80}.sens.warn{border-color:rgba(251,191,36,.6)}.sens.warn ha-icon{color:#fbbf24}
.sens.bad{border-color:rgba(248,113,113,.8);animation:alarm 1.4s infinite}.sens.bad ha-icon{color:#f87171}
.sens.mint ha-icon{color:#5eead4}.sens.dim{opacity:.5}

.chart{border-radius:24px;padding:16px 16px 10px}
.chart svg{width:100%;height:200px;display:block;overflow:visible}
.cl{fill:none;stroke-width:2.5;vector-effect:non-scaling-stroke;stroke-dasharray:1;stroke-dashoffset:1;animation:draw 1.8s ease-out forwards}
.gl{stroke:rgba(255,255,255,.07);vector-effect:non-scaling-stroke}
.legend{display:flex;gap:22px;flex-wrap:wrap;margin-bottom:8px;font-size:13px;color:var(--dim)}
.legend span{display:flex;align-items:center;gap:7px}
.legend i{width:10px;height:10px;border-radius:50%}
.legend b{color:var(--txt);font-size:16px;font-weight:600;margin-left:4px}
.legend small{font-size:11.5px}
.axis{display:flex;justify-content:space-between;font-size:11.5px;color:#64748b;margin-top:4px}

/* ---------- animacje ---------- */
.rise{animation:rise .7s cubic-bezier(.2,.8,.2,1) both;animation-delay:calc(var(--d,0) * 70ms)}
@keyframes rise{from{opacity:0;transform:translateY(18px) scale(.98)}to{opacity:1;transform:none}}
@keyframes fade{from{opacity:0}to{opacity:1}}
@keyframes fadeOut{to{opacity:0;transform:scale(.985)}}
@keyframes slideL{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:none}}
@keyframes slideR{from{opacity:0;transform:translateX(-40px)}to{opacity:1;transform:none}}
@keyframes kb{from{transform:scale(1.02)}to{transform:scale(1.12) translate(-1.5%,-1%)}}
@keyframes breathe{50%{opacity:.55}}
@keyframes pulse{50%{opacity:.5}}
@keyframes alarm{50%{box-shadow:0 0 18px rgba(248,113,113,.6)}}
@keyframes pulseT{0%{box-shadow:0 0 0 0 rgba(147,197,253,.7)}100%{box-shadow:0 0 0 18px rgba(147,197,253,0)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes eq{0%,100%{height:4px}50%{height:16px}}
@keyframes draw{to{stroke-dashoffset:0}}
@keyframes drift{to{transform:translate(8%,6%) scale(1.12)}}
@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important}}

/* ---------- responsywność ---------- */
@media (max-width:1100px){
  .bento{grid-template-columns:repeat(2,minmax(0,1fr));grid-template-rows:none;grid-auto-rows:minmax(200px,auto)}
  .sz-big{grid-row:span 1;min-height:280px}.sz-tall{grid-row:span 1}
}
@media (max-width:600px){
  .hub{padding:12px}
  h1{font-size:28px}
  .bento{grid-template-columns:minmax(0,1fr);grid-auto-rows:minmax(190px,auto)}
  .sz-big,.sz-wide{grid-column:span 1}
  .sz-big .t-name{font-size:28px}
  .hero{margin:10px 10px 0;min-height:340px}
  .rbody{padding:12px;gap:14px}
  .pur-body{flex-direction:column;align-items:stretch}.pm{align-self:center}
}

/* ---------- pasek pokoju: Dom · Pomieszczenia · zakładki ---------- */
.rtop{position:sticky;top:0;z-index:5;display:flex;align-items:center;gap:10px;padding:12px 18px 0}
.back.home{background:linear-gradient(180deg,rgba(59,130,246,.5),rgba(29,78,216,.25));border-color:#3b82f6;box-shadow:0 0 18px rgba(59,130,246,.5),inset 0 1px 0 rgba(255,255,255,.3);font-weight:600}
.back ha-icon{--mdc-icon-size:20px}
.rtabs{flex:1;display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;padding:4px 2px;justify-content:flex-end}
.rtabs::-webkit-scrollbar{display:none}
.rtab{display:flex;align-items:center;gap:7px;padding:9px 14px;border-radius:999px;white-space:nowrap;font-size:14px;color:#cbd5e1;
  border:1px solid rgba(255,255,255,.1);background:rgba(12,20,40,.35);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);transition:.2s}
.rtab ha-icon{--mdc-icon-size:18px;color:rgb(var(--acc))}
.rtab:hover{border-color:rgba(var(--acc),.6);color:#fff}
.rtab.on{color:#fff;font-weight:600;border-color:rgba(var(--acc),.9);background:linear-gradient(180deg,rgba(var(--acc),.35),rgba(var(--acc),.12));box-shadow:0 0 16px rgba(var(--acc),.4),inset 0 1px 0 rgba(255,255,255,.25)}

/* ---------- pokój: przewijany (telefon / wąskie okno) ---------- */
.rgrid{display:flex;flex-direction:column;gap:16px;padding:14px 18px 24px}
.rgrid .col{display:contents}
.rgrid .hero{margin:0}

/* ---------- dopasowanie do ekranu (laptop / tablet) ---------- */
.page.fit{display:flex;align-items:center;justify-content:center;min-height:0}
.page.fit .stage{position:relative;width:1440px;height:var(--bh,820px);zoom:var(--z,1);flex:none}
.page.fit .hub{height:100%;min-height:0;padding:16px 20px 18px}
.page.fit .bento{min-height:0;grid-template-columns:repeat(4,minmax(0,1fr));grid-template-rows:repeat(var(--rows,3),minmax(0,1fr));grid-auto-rows:auto}
.page.fit .sz-big{grid-column:span 2;grid-row:span 2;min-height:0}.page.fit .sz-wide{grid-column:span 2}.page.fit .sz-tall{grid-row:span 2}
.page.fit .room{height:100%;padding:0;display:flex;flex-direction:column}
.page.fit .rtop{position:relative;padding:14px 18px 0}
.page.fit .rgrid{flex:1;min-height:0;display:grid;grid-template-columns:340px minmax(0,1fr) 380px;gap:16px;padding:10px 18px 12px}
.page.fit .rgrid.two{grid-template-columns:420px minmax(0,1fr)}
.page.fit .rgrid .col{display:flex;flex-direction:column;gap:10px;min-height:0;overflow-y:auto;overflow-x:hidden;scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.18) transparent;padding:2px}
.page.fit .rgrid .sec{order:0!important;flex:none}
.page.fit .hero{height:min(310px,40%);min-height:230px;flex:none;border-radius:26px}
.page.fit .hero-body{left:22px;right:22px;bottom:18px}
.page.fit h2{font-size:44px}
.page.fit .hero-body p{font-size:14px;margin:2px 0 10px}
.page.fit .stat{padding:7px 11px}.page.fit .stat b{font-size:20px}
.page.fit .colA .s-chart{flex:1 1 auto;display:flex;flex-direction:column;min-height:170px}
.page.fit .colA .s-chart>.chart{flex:1;min-height:0}
.page.fit .chart{display:flex;flex-direction:column}
.page.fit .chart svg{flex:1;height:auto;min-height:80px}
.page.fit .sec-hd{font-size:16px;margin:0 4px 6px}
.page.fit .lgrid{grid-template-columns:repeat(auto-fill,minmax(142px,1fr));gap:10px}
.page.fit .lt{padding:10px;gap:8px;border-radius:18px}
.page.fit .bulb{width:42px;height:42px;border-radius:13px}.page.fit .bulb ha-icon{--mdc-icon-size:24px}
.page.fit .lt-main{gap:8px}
.page.fit .lt-name{font-size:14px}
.page.fit .cgrid{grid-template-columns:repeat(2,minmax(0,1fr));grid-auto-flow:row dense;gap:10px}
.page.fit .cgrid .slot:has(.dial){grid-row:span 3}
.page.fit .cgrid.c1{grid-template-columns:minmax(0,1fr)}
.page.fit .cgrid.c1 .dial{max-width:420px;margin:0 auto;width:100%}
.page.fit .dial{padding:10px 12px;gap:4px}
.page.fit .dial-ring{width:min(176px,100%)}
.page.fit .dial-t{font-size:42px}.page.fit .dial-t small{font-size:20px}
.page.fit .dbtn{width:40px;height:40px}
.page.fit .mgrid,.page.fit .dgrid{grid-template-columns:minmax(0,1fr);gap:10px}
.page.fit .md,.page.fit .dev{padding:13px;gap:11px;border-radius:20px}
.page.fit .md-art{width:60px;height:60px;border-radius:14px}
.page.fit .pm{width:92px;height:92px}.page.fit .pm b{font-size:30px}
.page.fit .sgrid{grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:10px}
.page.fit .sens{padding:10px 12px}
.page.fit .colA .sgrid{grid-template-columns:repeat(2,minmax(0,1fr))}

/* ---------- drukarka 3D ---------- */
.cyan{color:#22d3ee}
.pulse-ic{animation:pulse 1.6s ease-in-out infinite}
.chip.pr{border-color:rgba(34,211,238,.6)}
.dev.printer.printing{border-color:rgba(34,211,238,.5);box-shadow:inset 0 1px 0 rgba(255,255,255,.2),0 0 30px rgba(34,211,238,.18)}
.dev.printer.failed{border-color:rgba(248,113,113,.8);animation:alarm 1.4s infinite}
.dev.printer .dev-ic{color:#67e8f9}
.pr-body{display:flex;gap:14px;align-items:center}
.pr-media{position:relative;flex:1;min-width:0;aspect-ratio:16/10;max-height:300px;border-radius:16px;overflow:hidden;background:rgba(2,6,16,.6);border:1px solid var(--line)}
.pr-media img{width:100%;height:100%;display:block}
.pr-media img.model{object-fit:contain;padding:6px;filter:drop-shadow(0 6px 14px rgba(0,0,0,.6))}
.pr-media img.cam{object-fit:cover}
.pr-noimg{width:100%;height:100%;display:grid;place-items:center;color:#475569}
.pr-noimg ha-icon{--mdc-icon-size:46px}
.pr-tabs{position:absolute;left:8px;bottom:8px;display:flex;gap:4px;padding:3px;border-radius:999px;background:rgba(4,8,20,.7);backdrop-filter:blur(8px)}
.pr-tabs button{display:flex;align-items:center;gap:5px;padding:4px 10px;border-radius:999px;font-size:11.5px;color:#cbd5e1}
.pr-tabs button.on{background:rgba(34,211,238,.25);color:#fff}
.live-dot{width:7px;height:7px;border-radius:50%;background:#f43f5e;box-shadow:0 0 6px #f43f5e;animation:blink 1.4s infinite}
.pr-ring{position:relative;width:128px;height:128px;flex:none}
.pr-ring svg{width:100%;height:100%;transform:rotate(-90deg)}
.pr-track{fill:none;stroke:rgba(255,255,255,.08);stroke-width:10}
.pr-fill{fill:none;stroke:#22d3ee;stroke-width:10;stroke-linecap:round;transition:stroke-dashoffset 1s ease;filter:drop-shadow(0 0 6px rgba(34,211,238,.7))}
.printer.printing .pr-fill{animation:prglow 2.4s ease-in-out infinite}
.pr-c{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
.pr-c b{font-size:30px;font-weight:600;line-height:1}.pr-c b small{font-size:15px;color:var(--dim)}
.pr-c span{font-size:12px;color:#a5f3fc;margin-top:4px}
.pr-task{display:flex;align-items:center;gap:8px;font-size:14px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pr-task ha-icon{--mdc-icon-size:18px;color:#67e8f9;flex:none}
.pr-task span{overflow:hidden;text-overflow:ellipsis}
.pr-meta,.pr-temps{display:flex;gap:16px;flex-wrap:wrap;font-size:13px;color:var(--dim)}
.pr-meta>div,.pr-temp{display:flex;align-items:center;gap:6px}
.pr-meta ha-icon,.pr-temp ha-icon{--mdc-icon-size:17px}
.pr-meta b,.pr-temp b{color:var(--txt);font-weight:600}
.pr-temp small{color:var(--dim)}
.pr-temp.hot ha-icon{color:#fb923c}
.fils{display:flex;gap:8px;flex-wrap:wrap}
.fil{display:flex;align-items:center;gap:6px;padding:4px 10px 4px 5px;border-radius:999px;font-size:12px;border:1px solid var(--line);background:rgba(255,255,255,.04)}
.fil i{width:16px;height:16px;border-radius:50%;box-shadow:inset 0 0 0 2px rgba(255,255,255,.25)}
.fil.empty{opacity:.45}.fil.empty i{box-shadow:inset 0 0 0 2px rgba(255,255,255,.2);background:repeating-linear-gradient(45deg,transparent 0 3px,rgba(255,255,255,.15) 3px 5px)!important}
.fil.on{border-color:#22d3ee;box-shadow:0 0 10px rgba(34,211,238,.4)}
.mchip.danger{border-color:rgba(248,113,113,.55);color:#fecaca}
.mchip.danger:hover{background:rgba(248,113,113,.15)}
.page.fit .pr-ring{width:110px;height:110px}
.page.fit .pr-media{aspect-ratio:16/9;max-height:230px}
@keyframes prglow{50%{filter:drop-shadow(0 0 12px rgba(34,211,238,1))}}
`;

if (!customElements.get("living-rooms-card")) {
  customElements.define("living-rooms-card", LivingRoomsCard);
  window.customCards = window.customCards || [];
  window.customCards.push({ type: "living-rooms-card", name: "Living Rooms Card", description: "Room tiles with wallpapers and full room views (lights, climate, media, devices).", preview: false, documentationURL: "https://github.com/krystianokris/living-house-card" });
}


/* ---------- Living House Card – cat corner ----------
 * type: custom:living-cats-card
 * A living picture of the cat corner: the scene follows the litter box and the feeder
 * (cat inside, cleaning, eating, day/night) and glass panels control both devices.
 */
const LCC_SCENES = ["night", "day", "litter", "eating", "cleaning"]; // DOM order = stacking order (night at the bottom)
const LCC_CDN = "https://cdn.jsdelivr.net/gh/krystianokris/living-house-card@" + (LHC_VERSION.includes("_") ? "main" : "v" + LHC_VERSION) + "/images/cats/";
const LCC_OCCUPIED = ["occupied", "defecation", "cat_inside", "in_use"];
const LCC_CLEANING = ["cleaning", "working", "leveling", "emptying"];
const LCC_FEEDING = ["feeding", "dispensing"];
const LCC_FED_RECENT_MS = 3 * 60 * 1000;
const LCC_SWITCH_ICONS = [[/uv/, "mdi:sun-wireless-outline"], [/sleep|nocn|night/, "mdi:weather-night"], [/deodor|dezodor/, "mdi:scent"],
  [/slow|woln/, "mdi:tortoise"], [/light|swiatl|display/, "mdi:lightbulb-outline"], [/power|zasil/, "mdi:power"], [/lock|blokad/, "mdi:lock-outline"]];

class LivingCatsCard extends HTMLElement {
  static getStubConfig() {
    return {
      litter: { status: "sensor.litter_box_status", clean: "button.litter_box_clean", bin_full: "binary_sensor.litter_box_bin_full", weight: "sensor.litter_box_cat_weight", visits: "sensor.litter_box_visits_today", switches: [] },
      feeder: { status: "sensor.pet_feeder_status", portions: "number.pet_feeder_manual_feed", last: "sensor.pet_feeder_last_portion", switches: [] },
    };
  }

  setConfig(config) {
    if (!config || (!config.litter && !config.feeder)) throw new Error("living-cats-card: add `litter:` and/or `feeder:`");
    const sw = (l) => lhcArr(l).map((x) => (typeof x === "string" ? { entity: x } : x)).filter((x) => x && x.entity);
    const litter = config.litter ? { ...config.litter, switches: sw(config.litter.switches) } : null;
    const feeder = config.feeder ? { ...config.feeder, switches: sw(config.feeder.switches) } : null;
    this._cfg = { sun: "sun.sun", title: null, cat_name: null, ...config, litter, feeder };
    this._portions = null;
    this._fedAt = 0;
    if (this.shadowRoot) this.shadowRoot.innerHTML = "";
    this._root = null;
  }
  getCardSize() { return 8; }
  getGridOptions() { return { columns: 12, min_columns: 6 }; }

  _t(k, a) { return lhcT(this._lang || "en", k, a); }
  _m(g, k, f) { return lhcMap(this._lang || "en", g, k, f); }
  _s(id) { return id && this._hass ? this._hass.states[id] : undefined; }
  _ok(id) { const s = this._s(id); return !!s && !LHC_BAD.includes(s.state); }
  _on(id) { const s = this._s(id); return !!s && s.state === "on"; }
  _icon(i, extra = "") { return `<ha-icon icon="${i}" ${extra}></ha-icon>`; }

  _img(k) {
    const own = this._cfg.images && this._cfg.images[k];
    if (own) return own;
    const base = this._cfg.image_base ? String(this._cfg.image_base).replace(/\/?$/, "/") : LCC_CDN;
    return base + k + ".webp";
  }

  set hass(h) {
    const old = this._hass;
    this._hass = h;
    this._lang = lhcLang(h, this._cfg);
    if (!this._root) { this._build(); this._update(); return; }
    if (!old || this._ids().some((id) => old.states[id] !== h.states[id])) this._update();
  }

  connectedCallback() {
    if (!this._ro && window.ResizeObserver) this._ro = new ResizeObserver(() => this._layout());
    if (this._ro) this._ro.observe(this);
    clearInterval(this._tick);
    this._tick = setInterval(() => this._root && this._update(), 30000);
  }
  disconnectedCallback() {
    if (this._ro) this._ro.disconnect();
    clearInterval(this._tick);
  }

  _ids() {
    const c = this._cfg, ids = [c.sun];
    [c.litter, c.feeder].filter(Boolean).forEach((d) => Object.entries(d).forEach(([k, v]) => {
      if (k === "switches") v.forEach((x) => ids.push(x.entity));
      else if (typeof v === "string" && v.includes(".")) ids.push(v);
    }));
    return ids.filter(Boolean);
  }

  /* ---------- state ---------- */
  _dayFactor() {
    const f = this._cfg.force;
    if (f === "day") return 1;
    if (f === "night") return 0;
    const s = this._s(this._cfg.sun);
    if (!s) return 1;
    const el = Number(s.attributes.elevation);
    if (!Number.isFinite(el)) return s.state === "above_horizon" ? 1 : 0;
    return Math.max(0, Math.min(1, (el + 5) / 13));
  }
  _state() {
    const L = this._cfg.litter || {}, F = this._cfg.feeder || {};
    const ls = this._s(L.status), fs = this._s(F.status);
    const lst = ls ? ls.state : null, fst = fs ? fs.state : null;
    const cleaning = LCC_CLEANING.includes(lst) || (L.clean && L.clean.startsWith("switch.") && this._on(L.clean));
    const occupied = LCC_OCCUPIED.includes(lst) || (L.presence && this._on(L.presence));
    const fedChanged = fs && fst === "feeding_complete" ? Date.parse(fs.last_changed) : 0;
    const eating = LCC_FEEDING.includes(fst) || (fedChanged && Date.now() - fedChanged < LCC_FED_RECENT_MS) || Date.now() - this._fedAt < 20000;
    const full = !!(L.bin_full && this._on(L.bin_full)) || lst === "full";
    const problem = !!(L.problem && this._on(L.problem)) || lst === "fault" || lst === "blocked" || fst === "fault";
    const sleep = L.switches.some((x) => /sleep|nocn|night/.test(x.entity) && this._on(x.entity));
    const scene = cleaning ? "cleaning" : occupied ? "litter" : eating ? "eating" : null;
    return { lst, fst, cleaning, occupied, eating, full, problem, sleep, scene };
  }

  /* ---------- build once, then only update ---------- */
  _build() {
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    const L = this._cfg.litter, F = this._cfg.feeder;
    this.shadowRoot.innerHTML = `<style>${LCC_STYLE}</style>
      <div class="wrap">
        <div class="scene glass">
          ${LCC_SCENES.map((k) => `<div class="layer" data-k="${k}" style="background-image:url('${lhcEsc(this._img(k))}')"></div>`).join("")}
          <div class="tint"></div>
          <div class="fx fx-uv"></div><div class="fx fx-clean"><i></i><i></i></div><div class="fx fx-full"></div><div class="fx fx-feed"></div>
          ${this._cfg.back_path ? `<button class="back glass" data-nav="${lhcEsc(this._cfg.back_path)}">${this._icon("mdi:arrow-left")}<span>${lhcEsc(this._cfg.back_name || this._t("rooms_title"))}</span></button>` : ""}
          <div class="head"><div class="kicker">${this._t("cats_kicker")}</div><h2>${lhcEsc(this._cfg.title || this._cfg.cat_name || this._t("cats_title"))}</h2><div class="say"></div></div>
          ${L ? `<button class="spot glass s-litter" data-more="${lhcEsc(L.status || "")}">${this._icon("mdi:cat")}<span class="sp-txt"></span></button>` : ""}
          ${F ? `<button class="spot glass s-feeder" data-more="${lhcEsc(F.status || "")}">${this._icon("mdi:bowl-mix-outline")}<span class="sp-txt"></span></button>` : ""}
        </div>
        <div class="side">
          ${L ? `<section class="panel glass p-litter"></section>` : ""}
          ${F ? `<section class="panel glass p-feeder"></section>` : ""}
        </div>
      </div>`;
    this._root = this.shadowRoot.querySelector(".wrap");
    this._root.addEventListener("click", (e) => this._click(e));
    this._layout();
  }

  _layout() {
    if (!this._root) return;
    const w = this.clientWidth || this._root.clientWidth;
    this._root.classList.toggle("narrow", w > 0 && w < 860);
    this._root.classList.toggle("tiny", w > 0 && w < 560);
  }

  _update() {
    if (!this._root || !this._hass) return;
    const st = this._state(), d = this._dayFactor();
    const sc = this._root.querySelector(".scene");
    sc.style.setProperty("--day", d.toFixed(3));
    sc.querySelectorAll(".layer").forEach((el) => {
      const k = el.dataset.k;
      el.classList.toggle("show", k === "night" || (k === "day" && !st.scene) || k === st.scene);
    });
    sc.classList.toggle("ev", !!st.scene);
    const uvOn = (this._cfg.litter?.switches || []).some((x) => /uv/.test(x.entity) && this._on(x.entity));
    sc.classList.toggle("uv", uvOn && !st.cleaning && !st.occupied);
    sc.classList.toggle("cleaning", st.cleaning);
    sc.classList.toggle("full", st.full || st.problem);
    sc.classList.toggle("eating", st.eating);
    sc.querySelector(".say").innerHTML = this._say(st);
    const sl = sc.querySelector(".s-litter .sp-txt"), sf = sc.querySelector(".s-feeder .sp-txt");
    if (sl) { sl.textContent = this._litterText(st); sc.querySelector(".s-litter").classList.toggle("bad", st.full || st.problem); }
    if (sf) sf.textContent = this._feederText(st);
    const pl = this._root.querySelector(".p-litter"), pf = this._root.querySelector(".p-feeder");
    if (pl) pl.innerHTML = this._litterPanel(st);
    if (pf) pf.innerHTML = this._feederPanel(st);
  }

  _say(st) {
    const n = lhcEsc(this._cfg.cat_name || "");
    if (st.problem) return `<span class="bad">${this._icon("mdi:alert-outline")}${this._t("scene_problem")}</span>`;
    if (st.full) return `<span class="bad">${this._icon("mdi:delete-alert-outline")}${this._t("scene_full")}</span>`;
    if (st.cleaning) return `${this._icon("mdi:autorenew", 'class="spin"')}${this._t("scene_cleaning")}`;
    if (st.occupied) return `${this._icon("mdi:cat")}${this._t("scene_litter", n)}`;
    if (st.eating) return `${this._icon("mdi:food-drumstick-outline")}${this._t("scene_eating", n)}`;
    if (st.sleep) return `${this._icon("mdi:weather-night")}${this._t("scene_sleep")}`;
    return `${this._icon("mdi:check-circle-outline", 'class="ok"')}${this._t("scene_ok")}`;
  }
  _litterText(st) {
    if (st.full) return this._t("bin_full");
    return st.lst && !LHC_BAD.includes(st.lst) ? this._m("litter_st", st.lst, st.lst) : this._t("st_offline");
  }
  _feederText(st) {
    return st.fst && !LHC_BAD.includes(st.fst) ? this._m("feeder_st", st.fst, st.fst) : this._t("st_offline");
  }

  _val(id, digits) {
    const s = this._s(id);
    if (!s || LHC_BAD.includes(s.state)) return null;
    const n = Number(s.state);
    const v = Number.isFinite(n) && digits != null ? n.toFixed(digits) : s.state;
    return { v, u: s.attributes.unit_of_measurement || "", s };
  }
  _stat(icon, label, val, unit) {
    return `<div class="stat">${this._icon(icon)}<b>${val == null ? "—" : lhcEsc(val)}<small>${lhcEsc(unit || "")}</small></b><span>${label}</span></div>`;
  }
  _ago(iso) {
    const m = Math.round((Date.now() - Date.parse(iso)) / 60000);
    if (!Number.isFinite(m) || m < 0) return "";
    if (m < 1) return this._t("just_now");
    if (m < 60) return this._t("min_ago", m);
    const h = Math.floor(m / 60);
    return h < 24 ? this._t("h_ago", h) : "";
  }
  _switches(list) {
    if (!list.length) return "";
    return `<div class="tgl">${list.map((x) => {
      const s = this._s(x.entity), on = s && s.state === "on", ok = s && !LHC_BAD.includes(s.state);
      const icon = x.icon || (LCC_SWITCH_ICONS.find(([re]) => re.test(x.entity)) || [0, "mdi:toggle-switch-outline"])[1];
      const name = x.name || (s && s.attributes.friendly_name) || x.entity;
      return `<button class="tg ${on ? "on" : ""}" ${ok ? "" : "disabled"} data-toggle="${lhcEsc(x.entity)}" title="${lhcEsc(name)}">${this._icon(icon)}<span>${lhcEsc(name)}</span><i></i></button>`;
    }).join("")}</div>`;
  }

  _litterPanel(st) {
    const L = this._cfg.litter;
    const w = this._val(L.weight, 1), vis = this._val(L.visits, 0), dur = this._val(L.duration, 0);
    let durTxt = null, durU = "";
    if (dur) { const sec = Number(dur.v) * (/min/.test(dur.u) ? 60 : 1); if (Number.isFinite(sec)) { durTxt = sec >= 120 ? Math.round(sec / 60) : Math.round(sec); durU = sec >= 120 ? "min" : "s"; } }
    const alert = st.problem ? this._t("litter_problem") : st.full ? this._t("bin_full") : "";
    return `
      <div class="ph">${this._icon("mdi:cat", 'class="ph-ic"')}<div><div class="pt">${lhcEsc(L.name || this._t("litter"))}</div><div class="ps ${st.full || st.problem ? "bad" : ""}">${lhcEsc(this._litterText(st))}</div></div>
        ${L.clean ? `<button class="cta" data-clean="${lhcEsc(L.clean)}" ${st.cleaning ? "disabled" : ""}>${this._icon("mdi:broom")}${this._t("clean")}</button>` : ""}</div>
      ${alert ? `<div class="warn">${this._icon("mdi:alert-outline")}${lhcEsc(alert)}</div>` : ""}
      <div class="stats">
        ${L.visits ? this._stat("mdi:counter", this._t("visits_today"), vis && vis.v, "") : ""}
        ${L.weight ? this._stat("mdi:scale-bathroom", this._t("cat_weight"), w && w.v, w ? w.u.toLowerCase() : "kg") : ""}
        ${L.duration ? this._stat("mdi:timer-outline", this._t("time_today"), durTxt, durU) : ""}
      </div>
      ${this._switches(L.switches)}`;
  }

  _feederPanel(st) {
    const F = this._cfg.feeder;
    const n = this._s(F.portions);
    const max = n ? Number(n.attributes.max) || 10 : 10, min = n ? Math.max(1, Number(n.attributes.min) || 1) : 1;
    const p = Math.max(min, Math.min(max, this._portions ?? min));
    const last = this._val(F.last, null);
    const lastTxt = last ? `${last.v} ${this._t("portions", Number(last.v))}` : null;
    const when = last && last.s.last_changed ? this._ago(last.s.last_changed) : "";
    return `
      <div class="ph">${this._icon("mdi:bowl-mix-outline", 'class="ph-ic"')}<div><div class="pt">${lhcEsc(F.name || this._t("feeder"))}</div><div class="ps">${lhcEsc(this._feederText(st))}</div></div>
        ${F.quick_feed ? `<button class="cta ghost" data-quick="${lhcEsc(F.quick_feed)}">${this._icon("mdi:lightning-bolt-outline")}${this._t("quick_feed")}</button>` : ""}</div>
      ${F.last ? `<div class="stats">${this._stat("mdi:food-drumstick-outline", this._t("last_portion") + (when ? ` · ${when}` : ""), lastTxt, "")}</div>` : ""}
      ${F.portions ? `<div class="feed">
        <div class="step"><button data-step="-1" ${p <= min ? "disabled" : ""}>${this._icon("mdi:minus")}</button><b>${p}</b><span>${this._t("portions", p)}</span><button data-step="1" data-max="${max}" ${p >= max ? "disabled" : ""}>${this._icon("mdi:plus")}</button></div>
        <button class="cta" data-feed="${lhcEsc(F.portions)}" data-n="${p}">${this._icon("mdi:food-drumstick-outline")}${this._t("feed_now")}</button>
      </div>` : ""}
      ${this._switches(F.switches)}`;
  }

  /* ---------- actions ---------- */
  _more(id) { if (id) this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId: id }, bubbles: true, composed: true })); }
  _press(id) {
    const dom = id.split(".")[0];
    if (dom === "button") return this._hass.callService("button", "press", { entity_id: id });
    if (dom === "script") return this._hass.callService("script", "turn_on", { entity_id: id });
    return this._hass.callService("homeassistant", "turn_on", { entity_id: id });
  }
  _click(e) {
    const b = e.target.closest("button");
    if (!b || b.disabled) return;
    const d = b.dataset;
    if (d.nav) return lhcNavigate(d.nav);
    if (d.more !== undefined) return this._more(d.more);
    if (d.toggle) return this._hass.callService("homeassistant", "toggle", { entity_id: d.toggle });
    if (d.step) {
      const F = this._cfg.feeder, n = this._s(F.portions);
      const max = n ? Number(n.attributes.max) || 10 : 10, min = n ? Math.max(1, Number(n.attributes.min) || 1) : 1;
      this._portions = Math.max(min, Math.min(max, (this._portions ?? min) + Number(d.step)));
      return this._update();
    }
    if (d.feed) {
      const n = Number(d.n) || 1;
      if (!confirm(this._t("feed_confirm", n))) return;
      this._fedAt = Date.now();
      this._update();
      return this._hass.callService("number", "set_value", { entity_id: d.feed, value: n });
    }
    if (d.quick) {
      if (!confirm(this._t("quick_confirm"))) return;
      this._fedAt = Date.now();
      this._update();
      return this._press(d.quick);
    }
    if (d.clean) {
      if (!confirm(this._t("clean_confirm"))) return;
      return this._press(d.clean);
    }
  }
}

const LCC_STYLE = `:host{display:block;--txt:#eef4ff;--dim:#9fb0cd;font-family:"Inter","Segoe UI",Roboto,system-ui,sans-serif;color:var(--txt)}
*{box-sizing:border-box}
button{font:inherit;color:inherit;background:none;border:0;padding:0;cursor:pointer}
button:disabled{cursor:default;opacity:.45}
ha-icon{--mdc-icon-size:20px;display:inline-flex}
h2{margin:0}

.glass{position:relative;background:linear-gradient(150deg,rgba(255,255,255,.12),rgba(255,255,255,.035) 45%,rgba(255,255,255,.02)),rgba(12,20,40,.45);
  border:1px solid rgba(255,255,255,.13);box-shadow:inset 0 1px 0 rgba(255,255,255,.22),0 14px 40px rgba(0,0,0,.4);
  backdrop-filter:blur(22px) saturate(160%);-webkit-backdrop-filter:blur(22px) saturate(160%)}

.wrap{display:grid;grid-template-columns:minmax(0,1.85fr) minmax(290px,1fr);gap:16px;padding:4px}
.wrap.narrow{grid-template-columns:1fr}

/* ---------- scene ---------- */
.scene{aspect-ratio:1585/992;border-radius:26px;overflow:hidden;isolation:isolate;background:#151b38}
.layer{position:absolute;inset:0;background-size:cover;background-position:center;opacity:0;transition:opacity 1.2s ease}
.layer[data-k="night"]{opacity:1}
.layer[data-k="day"].show{opacity:var(--day,1)}
.layer.show:not([data-k="day"]):not([data-k="night"]){opacity:1}
.tint{position:absolute;inset:0;pointer-events:none;opacity:0;transition:opacity 1.2s ease;
  background:radial-gradient(ellipse at 30% 20%,rgba(255,170,90,.18),transparent 45%),linear-gradient(180deg,rgba(20,28,70,.55),rgba(10,14,40,.6));mix-blend-mode:multiply}
.scene.ev .tint{opacity:calc(1 - var(--day,1))}

.fx{position:absolute;pointer-events:none;opacity:0;transition:opacity .8s ease;border-radius:50%}
.fx-uv{left:25.5%;top:46%;width:12%;height:18%;background:radial-gradient(circle,rgba(167,139,250,.55),rgba(124,58,237,.18) 55%,transparent 72%);mix-blend-mode:screen}
.scene.uv .fx-uv{opacity:calc(.35 + .5 * (1 - var(--day,1)));animation:breathe 4s ease-in-out infinite}
.fx-clean{left:22%;top:40%;width:19%;height:30%;background:radial-gradient(circle,rgba(34,211,238,.55),rgba(14,165,233,.15) 55%,transparent 72%);mix-blend-mode:screen}
.fx-clean i{position:absolute;inset:18%;border-radius:50%;border:2px solid rgba(165,243,252,.55);animation:ripple 2.2s ease-out infinite}
.fx-clean i+i{animation-delay:1.1s}
.scene.cleaning .fx-clean{opacity:1}
.fx-full{left:11%;top:30%;width:28%;height:50%;box-shadow:0 0 0 3px rgba(248,113,113,.7),0 0 40px 10px rgba(248,113,113,.35);border-radius:46% 46% 18% 18%}
.scene.full .fx-full{opacity:1;animation:alarm 1.6s ease-in-out infinite}
.fx-feed{left:74%;top:60%;width:17%;height:20%;background:radial-gradient(circle,rgba(251,191,36,.5),rgba(245,158,11,.12) 55%,transparent 72%);mix-blend-mode:screen}
.scene.eating .fx-feed{opacity:1;animation:breathe 2.6s ease-in-out infinite}

.back{position:absolute;right:3%;top:4%;z-index:2;display:flex;align-items:center;gap:7px;padding:9px 15px;border-radius:999px;font-size:14px;transition:border-color .2s,transform .2s}
.back:hover{border-color:rgba(147,197,253,.55);transform:translateY(-1px)}
.back ha-icon{--mdc-icon-size:18px}
.tiny .back{padding:6px 10px;font-size:12px}.tiny .back span{display:none}
.head{position:absolute;left:3%;top:4%;max-width:46%;padding:12px 16px;border-radius:18px;background:rgba(8,12,28,.42);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,.12)}
.kicker{font-size:11.5px;letter-spacing:.16em;text-transform:uppercase;color:#8fb4e8}
.head h2{font-size:24px;font-weight:600;letter-spacing:-.01em;background:linear-gradient(90deg,#fff,#a5c8ff);-webkit-background-clip:text;background-clip:text;color:transparent}
.say{display:flex;align-items:center;gap:6px;margin-top:4px;font-size:14px;color:#dbe7ff}
.say>span{display:flex;align-items:center;gap:6px}
.say ha-icon{--mdc-icon-size:18px}
.say .ok{color:#4ade80}.say .bad{color:#fca5a5}
.spin{animation:spin 1.6s linear infinite}

.spot{position:absolute;display:flex;align-items:center;gap:7px;padding:7px 12px 7px 9px;border-radius:999px;font-size:13px;white-space:nowrap;transform:translate(-50%,-50%);transition:transform .25s,border-color .25s}
.spot:hover{transform:translate(-50%,-50%) scale(1.05);border-color:rgba(147,197,253,.6)}
.spot ha-icon{--mdc-icon-size:17px;color:#93c5fd}
.spot.bad{border-color:rgba(248,113,113,.75)}.spot.bad ha-icon{color:#f87171}
.s-litter{left:24.5%;top:29%}
.s-feeder{left:85%;top:35%}

.tiny .scene{border-radius:20px}
.tiny .head{left:3%;top:3%;max-width:64%;padding:7px 10px;border-radius:13px}
.tiny .kicker{display:none}
.tiny .head h2{font-size:16px}
.tiny .say{font-size:11.5px;margin-top:1px;gap:4px}
.tiny .say ha-icon{--mdc-icon-size:14px}
.tiny .spot{display:none}

/* ---------- panels ---------- */
.side{display:flex;flex-direction:column;gap:16px;min-width:0}
.wrap.narrow .side{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr))}
.panel{border-radius:22px;padding:16px;display:flex;flex-direction:column;gap:14px}
.ph{display:flex;align-items:center;gap:12px}
.ph>div{flex:1;min-width:0}
.ph-ic{--mdc-icon-size:22px;width:42px;height:42px;border-radius:14px;display:grid;place-items:center;background:rgba(96,165,250,.14);color:#93c5fd;flex:none}
.pt{font-size:16px;font-weight:600}
.ps{font-size:13px;color:var(--dim)}.ps.bad{color:#fca5a5}
.cta{display:flex;align-items:center;gap:7px;padding:10px 15px;border-radius:14px;font-size:14px;font-weight:600;
  background:linear-gradient(135deg,#3b82f6,#6366f1);box-shadow:0 8px 24px rgba(59,130,246,.35);transition:transform .2s,box-shadow .2s;white-space:nowrap}
.cta:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 12px 30px rgba(59,130,246,.5)}
.cta ha-icon{--mdc-icon-size:18px}
.cta.ghost{background:rgba(255,255,255,.08);box-shadow:none;border:1px solid rgba(255,255,255,.14);font-weight:500}
.warn{display:flex;align-items:center;gap:8px;padding:9px 12px;border-radius:12px;font-size:13.5px;background:rgba(248,113,113,.14);border:1px solid rgba(248,113,113,.45);color:#fecaca}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(88px,1fr));gap:10px}
.stat{display:flex;flex-direction:column;gap:2px;padding:10px 12px;border-radius:14px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08)}
.stat ha-icon{--mdc-icon-size:17px;color:#93c5fd}
.stat b{font-size:20px;font-weight:600}
.stat b small{font-size:12px;font-weight:500;color:var(--dim);margin-left:3px}
.stat span{font-size:12px;color:var(--dim)}
.feed{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.step{flex:1;display:flex;align-items:center;justify-content:center;gap:10px;padding:6px;border-radius:14px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);min-width:150px}
.step button{width:34px;height:34px;border-radius:10px;display:grid;place-items:center;background:rgba(255,255,255,.08)}
.step b{font-size:20px;min-width:22px;text-align:center}
.step span{font-size:13px;color:var(--dim);min-width:52px}
.tgl{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px}
.tg{display:flex;align-items:center;gap:8px;padding:10px 12px;border-radius:14px;font-size:13px;text-align:left;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);transition:background .25s,border-color .25s}
.tg span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tg ha-icon{--mdc-icon-size:18px;color:var(--dim)}
.tg i{width:26px;height:15px;border-radius:999px;background:rgba(255,255,255,.18);position:relative;flex:none;transition:background .25s}
.tg i::after{content:"";position:absolute;top:2px;left:2px;width:11px;height:11px;border-radius:50%;background:#fff;transition:transform .25s}
.tg.on{background:rgba(96,165,250,.16);border-color:rgba(96,165,250,.45)}
.tg.on ha-icon{color:#93c5fd}.tg.on i{background:#3b82f6}.tg.on i::after{transform:translateX(11px)}

@keyframes breathe{0%,100%{filter:brightness(1)}50%{filter:brightness(1.35)}}
@keyframes ripple{0%{transform:scale(.5);opacity:.9}100%{transform:scale(1.5);opacity:0}}
@keyframes alarm{0%,100%{opacity:1}50%{opacity:.35}}
@keyframes spin{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
`;

if (!customElements.get("living-cats-card")) {
  customElements.define("living-cats-card", LivingCatsCard);
  window.customCards = window.customCards || [];
  window.customCards.push({ type: "living-cats-card", name: "Living Cats Card", description: "A living picture of the cat corner – litter box and pet feeder with live scenes and controls.", preview: false, documentationURL: "https://github.com/krystianokris/living-house-card" });
}


console.info("%c LIVING-HOUSE-CARD %c v0.4.3 ", "background:#2563eb;color:#fff;border-radius:4px 0 0 4px", "background:#0f172a;color:#93c5fd;border-radius:0 4px 4px 0");
})();
