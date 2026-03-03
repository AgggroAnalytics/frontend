<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import maplibregl from 'maplibre-gl';
import type { Polygon, MultiPolygon } from 'geojson';
import 'maplibre-gl/dist/maplibre-gl.css';

const props = withDefaults(
  defineProps<{
    geometry: Polygon | MultiPolygon;
    editable?: boolean;
  }>(),
  { editable: false },
);

const mapContainer = ref<HTMLDivElement | null>(null);
let map: maplibregl.Map | null = null;

const STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap contributors',
    },
  },
  layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
};

function fitToGeometry() {
  if (!map || !props.geometry) return;
  const coords =
    props.geometry.type === 'Polygon'
      ? props.geometry.coordinates[0]
      : props.geometry.coordinates.flat(2);

  if (!coords || coords.length === 0) return;

  const bounds = new maplibregl.LngLatBounds();
  for (const c of coords) {
    bounds.extend(c as [number, number]);
  }
  map.fitBounds(bounds, { padding: 50, maxZoom: 16 });
}

function updateSource() {
  if (!map) return;
  const src = map.getSource('field') as maplibregl.GeoJSONSource | undefined;
  const geojson: GeoJSON.Feature = {
    type: 'Feature',
    properties: {},
    geometry: props.geometry,
  };
  if (src) {
    src.setData(geojson);
  }
}

onMounted(() => {
  if (!mapContainer.value) return;

  map = new maplibregl.Map({
    container: mapContainer.value,
    style: STYLE,
    center: [37.6, 55.7],
    zoom: 4,
    attributionControl: false,
  });

  map.addControl(new maplibregl.NavigationControl(), 'top-right');
  map.addControl(new maplibregl.AttributionControl({ compact: true }));

  map.on('load', () => {
    const geojson: GeoJSON.Feature = {
      type: 'Feature',
      properties: {},
      geometry: props.geometry,
    };

    map!.addSource('field', { type: 'geojson', data: geojson });

    map!.addLayer({
      id: 'field-fill',
      type: 'fill',
      source: 'field',
      paint: {
        'fill-color': '#36ad6a',
        'fill-opacity': 0.25,
      },
    });

    map!.addLayer({
      id: 'field-outline',
      type: 'line',
      source: 'field',
      paint: {
        'line-color': '#36ad6a',
        'line-width': 2.5,
      },
    });

    fitToGeometry();
  });
});

watch(
  () => props.geometry,
  () => {
    updateSource();
    fitToGeometry();
  },
  { deep: true },
);

onUnmounted(() => {
  map?.remove();
  map = null;
});
</script>

<template>
  <div ref="mapContainer" class="field-map" />
</template>

<style scoped>
.field-map {
  width: 100%;
  height: 400px;
  border-radius: 8px;
  overflow: hidden;
}
</style>
