/* ---------- Living House Card – shared helpers ---------- */
const LHC_VERSION = "__VERSION__";
const LHC_BAD = ["unknown", "unavailable", undefined, null, ""];
const LHC_TV_ON = ["on", "playing", "paused", "buffering"];

const lhcEsc = (x) => String(x ?? "").replace(/[&<>"]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
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
