// src/main.js
// Webkart med Leaflet + lokal GeoJSON + (valgfritt) OGC API + romlig filter (Turf)
// - Lokal GeoJSON lastes fra /public/data/dataset.geojson
// - OGC API hentes fra en .../collections/.../items URL (GeoJSON)
// - Romlig filter: klikk i kartet -> buffer (500m) -> viser lokale objekter innenfor

import "leaflet/dist/leaflet.css";
import "./style.css";
import L from "leaflet";
import * as turf from "@turf/turf";

/* -----------------------------
   1) Kart + basiskart
------------------------------ */

const map = L.map("map").setView([59.9139, 10.7522], 12);

// Legg basiskart i en variabel (slik at Layer Control kan bruke det)
const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
  maxZoom: 19,
}).addTo(map);

/* -----------------------------
   2) Overlay-lag (for toggling)
------------------------------ */

const localLayerGroup = L.layerGroup().addTo(map);  // Lokal GeoJSON
const ogcLayerGroup = L.layerGroup().addTo(map);    // Ekstern OGC API
const filterGroup = L.layerGroup().addTo(map);      // Resultat av romlig filter

// Layer Control (én gang!)
L.control
  .layers(
    { OpenStreetMap: osm },
    {
      "Lokal GeoJSON": localLayerGroup,
      "OGC API": ogcLayerGroup,
      "Romlig filter": filterGroup,
    }
  )
  .addTo(map);

/* -----------------------------
   3) Lokal GeoJSON (statisk fil)
------------------------------ */

// Datadrevet styling:
// Bytt "type" til et felt som faktisk finnes i din GeoJSON (f.eks. "kategori", "class", osv.)
function styleFeature(feature) {
  const t = feature?.properties?.type ?? "ukjent";
  return {
    color: t === "Demo" ? "#0077ff" : "#ff5500",
    weight: 2,
    fillOpacity: 0.4,
  };
}

// Last GeoJSON fra /public/data/dataset.geojson
fetch("/data/dataset.geojson")
  .then((res) => {
    if (!res.ok) throw new Error("Fant ikke /data/dataset.geojson");
    return res.json();
  })
  .then((data) => {
    // Lagre data så Turf-filteret kan bruke det senere
    window.__localData = data;

    const localLayer = L.geoJSON(data, {
      style: styleFeature,

      // Hvis GeoJSON inneholder punkt: vis som circleMarker (finere enn standard “pin”)
      pointToLayer: (feature, latlng) => L.circleMarker(latlng, { radius: 8 }),

      // Popups
      onEachFeature: (feature, lyr) => {
        lyr.bindPopup(
          `<b>${feature.properties?.navn ?? "Uten navn"}</b><br/>
           Type: ${feature.properties?.type ?? "ukjent"}`
        );
      },
    });

    localLayerGroup.addLayer(localLayer);

    // Zoom til datasettet (funker best når det faktisk finnes geometri)
    try {
      map.fitBounds(localLayer.getBounds(), { padding: [20, 20] });
    } catch {}
  })
  .catch((err) => console.error("GeoJSON-feil:", err));

/* -----------------------------
   4) Ekstern OGC API (Features)
------------------------------ */

// SETT INN ekte OGC API Features URL her (…/collections/.../items)
const OGC_URL = "https://hybasapi.atgcp1-prod.kartverket.cloud/collections/surveys/items";

// Laster OGC-data innenfor kartutsnitt (bbox) for å unngå å hente “alt”
async function loadOgc() {
  // Ikke prøv å hente før du har lagt inn ekte URL
  if (!OGC_URL || OGC_URL.includes("SETT_INN")) return;

  ogcLayerGroup.clearLayers();

  const b = map.getBounds();
  const bbox = [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()].join(",");

const url = `${OGC_URL}?f=json&limit=200&bbox=${bbox}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("OGC API feilet: " + res.status);
    const data = await res.json();

    const layer = L.geoJSON(data, {
  style: {
    color: "#1f78b4",
    weight: 1,
    fillOpacity: 0.1
  },
  onEachFeature: (feature, lyr) => {
    lyr.bindPopup(
      `<pre style="margin:0">${JSON.stringify(feature.properties, null, 2)}</pre>`
    );
  },
});
    ogcLayerGroup.addLayer(layer);
  } catch (err) {
    console.error("OGC-feil:", err);
  }
}

// Last ved oppstart + når kartet flyttes/zoomes
loadOgc();
map.on("moveend", loadOgc);

/* -----------------------------
   5) Romlig filtrering (Turf)
------------------------------ */

// Klikk i kartet -> buffer (500m) -> vis lokale objekter som treffer buffer
map.on("click", (e) => {
  if (!window.__localData) return;

  filterGroup.clearLayers();

  const pt = turf.point([e.latlng.lng, e.latlng.lat]);
  const buffer = turf.buffer(pt, 500, { units: "meters" });

  const inside = turf.featureCollection(
    window.__localData.features.filter((f) => {
      try {
        return turf.booleanIntersects(f, buffer);
      } catch {
        return false;
      }
    })
  );
L.popup()
  .setLatLng(e.latlng)
  .setContent(`Treff innen 500m: <b>${inside.features.length}</b>`)
  .openOn(map);


  // Tegn buffer + treff
  L.geoJSON(buffer, {
    style: { color: "#9467bd", weight: 2, fillOpacity: 0.05 },
  }).addTo(filterGroup);

  L.geoJSON(inside, {
    style: { color: "#17becf", weight: 3, fillOpacity: 0.2 },
    onEachFeature: (feature, lyr) => {
      lyr.bindPopup(
        `<b>${feature.properties?.navn ?? "Treff"}</b><br/>
         Type: ${feature.properties?.type ?? "ukjent"}`
      );
    },
  }).addTo(filterGroup);
});

