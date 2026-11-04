# 🏠 Living House Card

**Żywy dashboard domu 3D dla Home Assistant.** Twój dom jako izometryczny obraz 3D, który reaguje na żywo: pokój ciemnieje, gdy zgasisz światło, telewizory świecą, taśmy LED barwią pokój swoim kolorem, niebo zmienia się ze słońcem i pogodą – a każdy pokój otwiera piękny widok sterowania.

[🇬🇧 English](README.md) · [Konfiguracja](docs/configuration.md) · [Kalibracja](docs/calibration.md) · [Własny dom 3D](docs/house-image.md)

![Living House Card – noc](images/house-night.webp)

> **Status: v0.1 beta.** U autora działa świetnie – teraz czas na Twój dom. Błędy i pomysły zgłaszaj w [Issues](../../issues).

## ✨ Co potrafi

| | |
|---|---|
| 💡 **Prawdziwe światło na obrazku** | Każdy pokój ma własny obrys. Światło zgaszone → pokój ciemnieje; częściowo → półmrok (główne światła ważą więcej niż LED-y). |
| 🌈 **Kolor LED** | Taśma RGB świeci na różowo? Pokój dostaje różową poświatę. |
| 📺 **Poświata TV** | Migające niebiesko-fioletowe światło, gdy TV gra – a ekran na obrazku gaśnie, gdy TV jest wyłączony. |
| 🌗 **Dzień i noc** | Niebo, zmierzch i gwiazdy według wysokości słońca (`sun.sun`). Przycisk do wymuszenia. |
| 🌧️ **Pogoda** | Deszcz, śnieg, chmury, mgła, błyski burzy – z encji pogody. Przy awarii serwisu pokazuje ostatnie dane. |
| 🌡️ **Mapa ciepła** | Jednym kliknięciem pokoje barwią się kolorem temperatury. |
| 🔍 **Przybliżanie pokoju** | Klik w pokój – kamera wlatuje, reszta przygasa, obok szklany panel z urządzeniami. |
| 🧊 **Szklany interfejs** | Pogoda, status domu, ogrzewanie, powietrze, energia (wykres 24 h), sceny. |
| 🖥️ **Bez przewijania** | Sam dopasowuje się do laptopa i tabletu. Na telefonie – przewijany układ. |
| 📱 **Tryb tabletu** | `?kiosk` → pełny ekran; po 3 min wygaszacz z zegarem i pogodą. |
| 🎯 **Tryb kalibracji** | Przeciągasz plakietki, myszką rysujesz obrysy pokoi, kopiujesz YAML. Działa z **dowolnym** obrazkiem domu. |
| 🗣️ **Polski i angielski** | Według języka Home Assistant. |

### Karta pomieszczeń

Druga karta, **`living-rooms-card`**, to mozaika dużych kafelków ze zdjęciami pokoi. Klik – zdjęcie płynnie rozrasta się w pełny widok pokoju: światła (jasność, kolory, barwa), okrągłe pokrętła termostatów, multimedia z okładką, czujniki, wykres 24 h oraz urządzenia: oczyszczacz, karmnik, kuweta, pralka, suszarka.

| Pomieszczenia | Widok pokoju |
|---|---|
| ![Pomieszczenia](images/rooms-hub.webp) | ![Pokój](images/room-view.webp) |

## 🚀 Wypróbuj bez Home Assistant

```bash
git clone https://github.com/krystianokris/living-house-card.git
cd living-house-card
python -m http.server 8000
```

Otwórz <http://localhost:8000/demo/> – udawane urządzenia, wszystko da się klikać (przełącznik PL/EN w rogu).

## 📦 Instalacja

### HACS (zalecane)

1. HACS → ⋮ → **Niestandardowe repozytoria** → dodaj `https://github.com/krystianokris/living-house-card`, kategoria **Dashboard**.
2. Zainstaluj **Living House Card** i odśwież przeglądarkę (Ctrl+Shift+R).

### Ręcznie

1. Pobierz `living-house-card.js` z [najnowszego wydania](../../releases/latest).
2. Skopiuj do `/config/www/living-house-card/`.
3. Ustawienia → Dashboardy → ⋮ → **Zasoby** → dodaj `/local/living-house-card/living-house-card.js` jako **moduł JavaScript**.

## 🏁 Szybki start

1. Wrzuć obrazek 3D domu do `/config/www/living-house/house.webp` ([jak go zrobić](docs/house-image.md)).
2. Utwórz dashboard z widokiem **Panel** i dodaj kartę:

```yaml
type: custom:living-house-card
image: /local/living-house/house.webp
title: Mój dom
weather: weather.home
rooms:
  - id: salon
    name: Salon
    icon: mdi:sofa-outline
    temperature: sensor.salon_temperatura
    lights:
      - light.salon_sufit
      - entity: light.salon_led
        weight: 0.5
```

3. Kliknij przycisk **kalibracji** (prawy górny róg, tylko dla administratora), przeciągnij plakietkę na pokój, narysuj obrys, kliknij **Kopiuj YAML** i wklej do konfiguracji karty. Gotowe – pokój reaguje na światła.

Wszystkie opcje: **[docs/configuration.md](docs/configuration.md)** · Przykłady: **[examples/](examples/)**

## 📄 Licencja

[MIT](LICENSE) © krystianokris
