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

## Oppgave 2 – Romlig analyse og Spatial SQL

### Tematikk: Totalforsvarets år

I denne oppgaven er fokuset på tilgjengelighet til kritiske samfunnsfunksjoner i et totalforsvarsperspektiv.

Totalforsvaret handler om samspillet mellom sivile og militære ressurser i krisesituasjoner. Ved hjelp av romlig analyse undersøkes hvordan geografiske metoder kan brukes til å vurdere dekning og tilgjengelighet til viktige funksjoner innenfor et område.

Analysen viser hvordan avstand, geografisk plassering og terreng kan påvirke beredskap og responstid.

---

### Del A – Notebook

Notebooken dokumenterer en arbeidsflyt for romlig analyse i Python og inkluderer:

1. Innlesing og håndtering av data med Pandas og GeoPandas  
2. Opprettelse av studieområde (Oslo)  
3. Visualisering av punkter og studieområde  
4. Bufferanalyse for å modellere tilgjengelighet  
5. Overlay-analyse for å identifisere hvilke objekter som ligger innenfor området  
6. Romlig aggregering (telling av punkter innenfor området)  
7. Enkel rasteranalyse dokumentert med CLI-kommandoer (DEM, slope, polygonize og hillshade)  

Notebook:
`src/Notebooks/oppgave2_totalforsvar.ipynb`

---

### Del B – Utvidelse av webkart

Webkartet er utvidet med en løsning basert på Spatial SQL ved bruk av Supabase og PostGIS.

Dataflyt i løsningen:

1. Brukeren klikker i kartet  
2. Klikkets koordinater sendes til en SQL-funksjon i databasen  
3. PostGIS benyttes til å finne objekter innenfor en gitt avstand  
4. Resultatet returneres til applikasjonen  
5. Relevante objekter visualiseres i kartet  

Brukeren får visuell tilbakemelding gjennom markør på klikkpunktet og utheving av objekter.

---
## Demo
https://youtu.be/p7CP4kg0EjY

### SQL-snippet (PostGIS)

```sql
create or replace function find_nearby_points(
  lon double precision,
  lat double precision,
  distance_m integer default 1000
)
returns table (
  id bigint,
  geom geometry
)
language sql
as $$
  select *
  from points
  where ST_DWithin(
    geom::geography,
    ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography,
    distance_m
  );
$$;



## Installasjon

```bash
git clone "https://github.com/fateunavailable/webkart-prosjekt.git"
cd webkart
npm install
npm run dev


