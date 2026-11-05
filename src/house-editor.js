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
