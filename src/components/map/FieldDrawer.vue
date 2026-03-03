<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import maplibregl from 'maplibre-gl';
import type { Polygon } from 'geojson';
import turfArea from '@turf/area';
import { NSpace, NButton, NText } from 'naive-ui';
import 'maplibre-gl/dist/maplibre-gl.css';

const props = defineProps<{
  initialGeometry?: Polygon;
}>();

const emit = defineEmits<{
  'update:geometry': [geometry: Polygon | null];
}>();

const mapContainer = ref<HTMLDivElement | null>(null);
let map: maplibregl.Map | null = null;
const vertices = ref<[number, number][]>([]);
const isDrawing = ref(false);
const isClosed = ref(false);

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

const polygon = computed<Polygon | null>(() => {
  if (vertices.value.length < 3 || !isClosed.value) return null;
  return {
    type: 'Polygon',
    coordinates: [[...vertices.value, vertices.value[0]]],
  };
});

const areaHa = computed(() => {
  if (!polygon.value) return 0;
  const feature: GeoJSON.Feature<Polygon> = {
    type: 'Feature',
    properties: {},
    geometry: polygon.value,
  };
  return turfArea(feature) / 10000;
});

function updateMapSource() {
  if (!map) return;
  const src = map.getSource('draw-polygon') as maplibregl.GeoJSONSource | undefined;
  const lineSrc = map.getSource('draw-line') as maplibregl.GeoJSONSource | undefined;
  const ptSrc = map.getSource('draw-points') as maplibregl.GeoJSONSource | undefined;

  if (polygon.value && src) {
    src.setData({ type: 'Feature', properties: {}, geometry: polygon.value });
  } else if (src) {
    src.setData({ type: 'FeatureCollection', features: [] });
  }

  if (lineSrc) {
    if (vertices.value.length >= 2) {
      lineSrc.setData({
        type: 'Feature',
        properties: {},
        geometry: { type: 'LineString', coordinates: vertices.value },
      });
    } else {
      lineSrc.setData({ type: 'FeatureCollection', features: [] });
    }
  }

  if (ptSrc) {
    ptSrc.setData({
      type: 'FeatureCollection',
      features: vertices.value.map((c, i) => ({
        type: 'Feature' as const,
        properties: { index: i },
        geometry: { type: 'Point' as const, coordinates: c },
      })),
    });
  }
}

function startDraw() {
  vertices.value = [];
  isClosed.value = false;
  isDrawing.value = true;
  updateMapSource();
  if (map) map.getCanvas().style.cursor = 'crosshair';
}

function closePolygon() {
  if (vertices.value.length < 3) return;
  isClosed.value = true;
  isDrawing.value = false;
  if (map) map.getCanvas().style.cursor = '';
  updateMapSource();
  emit('update:geometry', polygon.value);
}

function clearDrawing() {
  vertices.value = [];
  isClosed.value = false;
  isDrawing.value = false;
  if (map) map.getCanvas().style.cursor = '';
  updateMapSource();
  emit('update:geometry', null);
}

function handleMapClick(e: maplibregl.MapMouseEvent) {
  if (!isDrawing.value) return;
  vertices.value.push([e.lngLat.lng, e.lngLat.lat]);
  updateMapSource();
}

function handleDblClick(e: maplibregl.MapMouseEvent) {
  if (!isDrawing.value) return;
  e.preventDefault();
  closePolygon();
}

function deleteLastVertex() {
  if (vertices.value.length === 0) return;
  vertices.value.pop();
  if (isClosed.value) {
    isClosed.value = false;
    isDrawing.value = true;
    if (map) map.getCanvas().style.cursor = 'crosshair';
  }
  updateMapSource();
  if (vertices.value.length < 3) {
    emit('update:geometry', null);
  }
}

onMounted(() => {
  if (!mapContainer.value) return;

  map = new maplibregl.Map({
    container: mapContainer.value,
    style: STYLE,
    center: [37.6, 55.7],
    zoom: 4,
    doubleClickZoom: false,
    attributionControl: false,
  });

  map.addControl(new maplibregl.NavigationControl(), 'top-right');
  map.addControl(new maplibregl.AttributionControl({ compact: true }));

  map.on('load', () => {
    map!.addSource('draw-polygon', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    });
    map!.addSource('draw-line', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    });
    map!.addSource('draw-points', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    });

    map!.addLayer({
      id: 'draw-polygon-fill',
      type: 'fill',
      source: 'draw-polygon',
      paint: { 'fill-color': '#36ad6a', 'fill-opacity': 0.2 },
    });
    map!.addLayer({
      id: 'draw-polygon-outline',
      type: 'line',
      source: 'draw-polygon',
      paint: { 'line-color': '#36ad6a', 'line-width': 2.5 },
    });
    map!.addLayer({
      id: 'draw-line',
      type: 'line',
      source: 'draw-line',
      paint: { 'line-color': '#36ad6a', 'line-width': 2, 'line-dasharray': [3, 2] },
    });
    map!.addLayer({
      id: 'draw-points',
      type: 'circle',
      source: 'draw-points',
      paint: {
        'circle-radius': 5,
        'circle-color': '#fff',
        'circle-stroke-color': '#36ad6a',
        'circle-stroke-width': 2,
      },
    });

    if (props.initialGeometry) {
      const ring = props.initialGeometry.coordinates[0];
      vertices.value = ring.slice(0, -1) as [number, number][];
      isClosed.value = true;
      updateMapSource();
      emit('update:geometry', polygon.value);

      const bounds = new maplibregl.LngLatBounds();
      for (const c of vertices.value) bounds.extend(c);
      map!.fitBounds(bounds, { padding: 50, maxZoom: 16 });
    }
  });

  map.on('click', handleMapClick);
  map.on('dblclick', handleDblClick);
});

onUnmounted(() => {
  map?.remove();
  map = null;
});
</script>

<template>
  <div class="field-drawer">
    <n-space style="margin-bottom: 8px" align="center">
      <n-button
        size="small"
        :type="isDrawing ? 'primary' : 'default'"
        :disabled="isDrawing"
        @click="startDraw"
      >
        Рисовать полигон
      </n-button>
      <n-button
        size="small"
        :disabled="vertices.length < 3 || isClosed"
        @click="closePolygon"
      >
        Замкнуть
      </n-button>
      <n-button
        size="small"
        :disabled="vertices.length === 0"
        @click="deleteLastVertex"
      >
        Удалить вершину
      </n-button>
      <n-button size="small" :disabled="vertices.length === 0" @click="clearDrawing">
        Очистить
      </n-button>
      <n-text v-if="areaHa > 0" depth="3">
        Площадь: {{ areaHa.toFixed(2) }} га
      </n-text>
    </n-space>
    <div ref="mapContainer" class="drawer-map" />
  </div>
</template>

<style scoped>
.field-drawer {
  width: 100%;
}
.drawer-map {
  width: 100%;
  height: 400px;
  border-radius: 8px;
  overflow: hidden;
}
</style>
