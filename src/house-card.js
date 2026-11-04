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
  static getStubConfig() {
    return { image: "/local/living-house/house.webp", title: "Living House", weather: "weather.home", rooms: [] };
  }

  setConfig(config) {
    if (!config) throw new Error("Invalid configuration");
    this._cfg = { ...LHC_DEFAULTS, ...config };
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
    if (lang !== this._lang) { this._lang = lang; if (this._root) this._build(); }
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
    this._applyZoom();
  }

  /* ---------- szkielet ---------- */
  _build() {
    if (!this._root) {
      this._root = this.attachShadow({ mode: "open" });
      this._root.addEventListener("click", (e) => this._click(e));
      this._root.addEventListener("pointerdown", (e) => this._edPointerDown(e));
    }
    const c = this._cfg;
    const img = c.image ? lhcEsc(c.image) : "";
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
      const setRatio = () => { if (im.naturalWidth) this._root.querySelector(".outer").style.setProperty("--ratio", (im.naturalWidth / im.naturalHeight).toFixed(5)); };
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
    const tx = fit ? 31 : 50, ty = fit ? 50 : 30;
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
    const keys = ["toggle", "more", "nav", "room", "scene", "roomlights", "dn", "heatmap", "wake", "edit", "edsel", "eddraw", "edundo", "eddone", "edcopy", "edclose", "close"];
    const t = (stop >= 0 ? path.slice(0, stop) : path).find((n) => n.dataset && Object.keys(n.dataset).some((k) => keys.includes(k)));
    if (!t) return;
    const d = t.dataset;
    e.stopPropagation();
    if (d.wake) return this._hideSaver();
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

const LHC_HOUSE_STYLE = __HOUSE_CSS__;

if (!customElements.get("living-house-card")) {
  customElements.define("living-house-card", LivingHouseCard);
  window.customCards = window.customCards || [];
  window.customCards.push({ type: "living-house-card", name: "Living House Card", description: "Living 3D house dashboard: lights, TV glow, weather, day/night, heat map.", preview: false, documentationURL: "https://github.com/krystianokris/living-house-card" });
}
