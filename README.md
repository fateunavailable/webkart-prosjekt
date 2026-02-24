# Webkart med Romlig Analyse

## TLDR

Dette webkartet visualiserer geografiske data fra både lokale GeoJSON-filer og OGC-tjenester.  
Brukeren kan klikke i kartet for å generere en 500 meters buffer og analysere hvilke objekter som befinner seg innenfor området.  
Løsningen kombinerer kartvisualisering og romlig analyse direkte i nettleseren.

---

## Demo av system

Video demonstrasjon av applikasjonen min:  
https://youtu.be/p7CP4kg0EjY

Videoen viser:
- Kartet lastet i nettleser
- Aktivering/deaktivering av lag
- Generering av 500m buffer ved klikk
- Popup med antall treff innenfor buffer
- Dynamisk lasting av OGC-data

---

## Teknisk Stack

| Teknologi | Versjon | Formål |
|------------|----------|--------|
| Vite | ^5.x | Utviklingsserver og bygging |
| Leaflet | ^1.9.x | Kartvisualisering |
| Turf.js | ^6.x | Romlig analyse (buffer, intersects) |
| JavaScript | ES6+ | Applikasjonslogikk |
| GeoJSON | - | Dataformat |

---

## Datakatalog

| Datasett | Kilde | Format | Bearbeiding |
|-----------|--------|--------|--------------|
| Lokalt datasett | Lokal GeoJSON-fil | GeoJSON | Lastes inn og vises i Leaflet |
| OGC-data | Kartverket OGC API | GeoJSON | Hentes dynamisk basert på bounding box |
| Bufferanalyse | Generert i nettleser | GeoJSON | Genereres med Turf.buffer() og analyseres med Turf.booleanIntersects() |

---

## Arkitekturskisse

Dataflyt i systemet:

1. Lokale GeoJSON-filer lastes fra prosjektet.
2. OGC-data hentes dynamisk via API basert på kartets bounding box.
3. Data sendes til Leaflet for rendering.
4. Bruker klikker i kartet.
5. Turf.js genererer en 500 meters buffer.
6. Systemet analyserer hvilke objekter som krysser bufferen.
7. Resultatet vises i popup i kartet.

Forenklet oversikt:
GeoJSON / OGC API
↓
JavaScript (fetch)
↓
Leaflet
↓
Brukerinteraksjon
↓
Turf.js
↓
Popup-resultat


---

## Refleksjon

- Løsningen kan forbedres ved bedre håndtering av større datasett for å øke ytelsen.
- Bufferstørrelsen er statisk (500m) og kunne vært gjort dynamisk via brukerinput.
- UI/UX kan forbedres med tydeligere lagkontroll og bedre visuell tilbakemelding.
- Feilhåndtering ved OGC-kall kan forbedres for mer robuste API-forespørsler.
- Videre utvikling kan inkludere filtrering basert på attributtdata.

---

## Installasjon

```bash
git clone "https://github.com/fateunavailable/webkart-prosjekt.git"
cd webkart
npm install
npm run dev
