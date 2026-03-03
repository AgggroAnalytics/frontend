<script setup lang="ts">
import { ref, computed, onMounted, watch, h } from 'vue';
import { useRouter } from 'vue-router';
import { NH1, NSpace, NSelect, NDataTable, NTag, NButton } from 'naive-ui';
import type { DataTableColumns, SelectOption } from 'naive-ui';
import type { Report, ReportStatus } from '@/types';
import { useFieldStore } from '@/stores/field';
import { useOrgStore } from '@/stores/org';
import { useReportStore } from '@/stores/report';
import * as reportsApi from '@/api/reports';
import LoadingState from '@/components/common/LoadingState.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';

const router = useRouter();
const fieldStore = useFieldStore();
const orgStore = useOrgStore();
const reportStore = useReportStore();

const allReports = ref<Report[]>([]);
const loading = ref(false);

const filterField = ref<string | null>(null);
const filterStatus = ref<ReportStatus | null>(null);

const fieldOptions = computed<SelectOption[]>(() =>
  fieldStore.fields.map((f) => ({ label: f.name, value: f.id })),
);

const statusOptions: SelectOption[] = [
  { label: 'Создан', value: 'CREATED' },
  { label: 'Генерируется', value: 'GENERATING' },
  { label: 'Готов', value: 'READY' },
  { label: 'Ошибка', value: 'FAILED' },
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

const filteredReports = computed(() => {
  let list = allReports.value;
  if (filterField.value) list = list.filter((r) => r.field_id === filterField.value);
  if (filterStatus.value) list = list.filter((r) => r.status === filterStatus.value);
  return list.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
});

const columns: DataTableColumns<Report> = [
  {
    title: 'Поле',
    key: 'field_id',
    render(row) {
      return fieldNameMap.value.get(row.field_id) ?? row.field_id;
    },
  },
  {
    title: 'Сезоны',
    key: 'season_ids',
    render(row) {
      return row.season_ids.join(', ');
    },
  },
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
      return h(StatusBadge, { status: row.status, type: 'report' });
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
  {
    title: '',
    key: 'actions',
    width: 100,
    render(row) {
      if (row.status !== 'READY') return null;
      return h(
        NButton,
        {
          size: 'small',
          type: 'primary',
          secondary: true,
          onClick: (e: MouseEvent) => {
            e.stopPropagation();
            handleDownload(row);
          },
        },
        () => 'Скачать',
      );
    },
  },
];

async function handleDownload(row: Report) {
  const oid = orgStore.currentOrgId;
  if (!oid) return;
  await reportStore.downloadReport(oid, row.field_id, row.id);
}

function handleRowClick(row: Report) {
  router.push({ name: 'field-detail', params: { fieldId: row.field_id } });
}

async function loadAll() {
  const oid = orgStore.currentOrgId;
  if (!oid) return;
  loading.value = true;
  try {
    await fieldStore.loadFields(oid);
    const results = await Promise.all(
      fieldStore.fields.map((f) => reportsApi.listReports(oid, f.id)),
    );
    allReports.value = results.flat();
  } finally {
    loading.value = false;
  }
}

onMounted(loadAll);
watch(() => orgStore.currentOrgId, loadAll);
</script>

<template>
  <n-h1 style="margin-bottom: 16px">Отчёты</n-h1>

  <n-space :size="12" style="margin-bottom: 16px">
    <n-select
      v-model:value="filterField"
      :options="fieldOptions"
      clearable
      placeholder="Поле"
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

  <LoadingState v-if="loading" message="Загрузка отчётов..." />

  <EmptyState
    v-else-if="allReports.length === 0"
    title="Нет отчётов"
    description="Создайте отчёт из карточки поля"
  />

  <n-data-table
    v-else
    :columns="columns"
    :data="filteredReports"
    :row-props="(row: Report) => ({ style: 'cursor: pointer', onClick: () => handleRowClick(row) })"
    :bordered="false"
    striped
  />
</template>
