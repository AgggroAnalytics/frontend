<script setup lang="ts">
import { ref, computed, onMounted, watch, h } from 'vue';
import { useRouter } from 'vue-router';
import { NH1, NSpace, NSelect, NDataTable, NTag } from 'naive-ui';
import type { DataTableColumns, SelectOption } from 'naive-ui';
import type { AnalysisRequest, ModuleName, AnalysisStatus } from '@/types';
import { useFieldStore } from '@/stores/field';
import { useOrgStore } from '@/stores/org';
import { useSeasonStore } from '@/stores/season';
import * as analysisApi from '@/api/analysis';
import LoadingState from '@/components/common/LoadingState.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';

const router = useRouter();
const fieldStore = useFieldStore();
const orgStore = useOrgStore();
const seasonStore = useSeasonStore();

const allAnalyses = ref<AnalysisRequest[]>([]);
const loading = ref(false);

const filterField = ref<string | null>(null);
const filterSeason = ref<string | null>(null);
const filterModule = ref<ModuleName | null>(null);
const filterStatus = ref<AnalysisStatus | null>(null);

const fieldOptions = computed<SelectOption[]>(() =>
  fieldStore.fields.map((f) => ({ label: f.name, value: f.id })),
);

const seasonOptions = computed<SelectOption[]>(() =>
  seasonStore.all.map((s) => ({ label: s.label, value: s.id })),
);

const moduleFilterOptions: SelectOption[] = [
  { label: 'M1: Здоровье посевов', value: 'M1' },
  { label: 'M2: Орошение', value: 'M2' },
  { label: 'M3: Почвы', value: 'M3' },
];

const statusOptions: SelectOption[] = [
  { label: 'Создан', value: 'CREATED' },
  { label: 'Выполняется', value: 'RUNNING' },
  { label: 'Завершён', value: 'SUCCEEDED' },
  { label: 'Ошибка', value: 'FAILED' },
  { label: 'Отменён', value: 'CANCELED' },
];

const MODULE_LABELS: Record<string, string> = {
  M1: 'Здоровье посевов',
  M2: 'Орошение',
  M3: 'Почвы',
};

const fieldNameMap = computed(() => {
  const map = new Map<string, string>();
  fieldStore.fields.forEach((f) => map.set(f.id, f.name));
  return map;
});

const filteredAnalyses = computed(() => {
  let list = allAnalyses.value;
  if (filterField.value) list = list.filter((a) => a.field_id === filterField.value);
  if (filterSeason.value) list = list.filter((a) => a.season_id === filterSeason.value);
  if (filterModule.value) list = list.filter((a) => a.modules.includes(filterModule.value!));
  if (filterStatus.value) list = list.filter((a) => a.status === filterStatus.value);
  return list.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
});

const columns: DataTableColumns<AnalysisRequest> = [
  {
    title: 'Поле',
    key: 'field_id',
    render(row) {
      return fieldNameMap.value.get(row.field_id) ?? row.field_id;
    },
  },
  { title: 'Сезон', key: 'season_id' },
  {
    title: 'Модули',
    key: 'modules',
    render(row) {
      return h(
        NSpace,
        { size: 4 },
        () => row.modules.map((m) => h(NTag, { size: 'small', bordered: false }, () => MODULE_LABELS[m] ?? m)),
      );
    },
  },
  {
    title: 'Статус',
    key: 'status',
    render(row) {
      return h(StatusBadge, { status: row.status, type: 'analysis' });
    },
  },
  {
    title: 'Создано',
    key: 'created_at',
    sorter: 'default',
    render(row) {
      return new Date(row.created_at).toLocaleString('ru-RU');
    },
  },
];

function handleRowClick(row: AnalysisRequest) {
  router.push({ name: 'field-detail', params: { fieldId: row.field_id } });
}

async function loadAll() {
  const oid = orgStore.currentOrgId;
  if (!oid) return;
  loading.value = true;
  try {
    await Promise.all([fieldStore.loadFields(oid), seasonStore.loadSeasons()]);
    const results = await Promise.all(
      fieldStore.fields.map((f) => analysisApi.listAnalyses(oid, f.id)),
    );
    allAnalyses.value = results.flat();
  } finally {
    loading.value = false;
  }
}

onMounted(loadAll);
watch(() => orgStore.currentOrgId, loadAll);
</script>

<template>
  <n-h1 style="margin-bottom: 16px">Аналитика</n-h1>

  <n-space :size="12" style="margin-bottom: 16px">
    <n-select
      v-model:value="filterField"
      :options="fieldOptions"
      clearable
      placeholder="Поле"
      style="width: 200px"
    />
    <n-select
      v-model:value="filterSeason"
      :options="seasonOptions"
      clearable
      placeholder="Сезон"
      style="width: 200px"
    />
    <n-select
      v-model:value="filterModule"
      :options="moduleFilterOptions"
      clearable
      placeholder="Модуль"
      style="width: 200px"
    />
    <n-select
      v-model:value="filterStatus"
      :options="statusOptions"
      clearable
      placeholder="Статус"
      style="width: 180px"
    />
  </n-space>

  <LoadingState v-if="loading" message="Загрузка аналитики..." />

  <EmptyState
    v-else-if="allAnalyses.length === 0"
    title="Нет анализов"
    description="Запустите анализ из карточки поля"
  />

  <n-data-table
    v-else
    :columns="columns"
    :data="filteredAnalyses"
    :row-props="(row: AnalysisRequest) => ({ style: 'cursor: pointer', onClick: () => handleRowClick(row) })"
    :bordered="false"
    striped
  />
</template>
