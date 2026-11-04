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
        id, name: r.name || id, icon: r.icon || "mdi:home-outline", image: r.image || "", subtitle: r.subtitle || "",
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
    const r = this._rooms.find((x) => x.id === id);
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
          <article class="tile t-${r.id} sz-${sizes[i]} rise" style="--d:${i + 1};--acc:${r.accent}" data-open="${r.id}">
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
    const i = this._rooms.findIndex((r) => r.id === this._view);
    const n = this._rooms[(i + dir + this._rooms.length) % this._rooms.length];
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
        <nav class="rtabs">${this._rooms.map((x) => `<button class="rtab ${x.id === r.id ? "on" : ""}" data-goto="${x.id}" style="--acc:${x.accent}">${this._icon(x.icon)}<span>${lhcEsc(x.name)}</span></button>`).join("")}</nav>
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

const LRC_STYLE = __ROOMS_CSS__;

if (!customElements.get("living-rooms-card")) {
  customElements.define("living-rooms-card", LivingRoomsCard);
  window.customCards = window.customCards || [];
  window.customCards.push({ type: "living-rooms-card", name: "Living Rooms Card", description: "Room tiles with wallpapers and full room views (lights, climate, media, devices).", preview: false, documentationURL: "https://github.com/krystianokris/living-house-card" });
}
