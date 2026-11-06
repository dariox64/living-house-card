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

const LCC_STYLE = __CATS_CSS__;

if (!customElements.get("living-cats-card")) {
  customElements.define("living-cats-card", LivingCatsCard);
  window.customCards = window.customCards || [];
  window.customCards.push({ type: "living-cats-card", name: "Living Cats Card", description: "A living picture of the cat corner – litter box and pet feeder with live scenes and controls.", preview: false, documentationURL: "https://github.com/krystianokris/living-house-card" });
}
