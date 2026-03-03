<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { NH1, NButton, NInput, NDataTable, NSpace } from 'naive-ui';
import type { DataTableColumns } from 'naive-ui';
import type { Field } from '@/types';
import { useFieldStore } from '@/stores/field';
import { useOrgStore } from '@/stores/org';
import { useRole } from '@/composables';
import EmptyState from '@/components/common/EmptyState.vue';
import LoadingState from '@/components/common/LoadingState.vue';

const router = useRouter();
const fieldStore = useFieldStore();
const orgStore = useOrgStore();
const { isAdmin } = useRole();

const search = ref('');

const filteredFields = computed(() => {
  const q = search.value.toLowerCase().trim();
  if (!q) return fieldStore.fields;
  return fieldStore.fields.filter((f) => f.name.toLowerCase().includes(q));
});

const columns: DataTableColumns<Field> = [
  { title: 'Название', key: 'name', sorter: 'default' },
  {
    title: 'Площадь (га)',
    key: 'area_ha',
    sorter: 'default',
    render(row) {
      return row.area_ha.toFixed(2);
    },
  },
  {
    title: 'Создано',
    key: 'created_at',
    sorter: 'default',
    render(row) {
      return new Date(row.created_at).toLocaleDateString('ru-RU');
    },
  },
  {
    title: 'Статус',
    key: 'is_active',
    render(row) {
      return row.is_active ? 'Активно' : 'Неактивно';
    },
  },
];

function handleRowClick(row: Field) {
  router.push({ name: 'field-detail', params: { fieldId: row.id } });
}

function goToCreate() {
  router.push({ name: 'field-create' });
}

async function load() {
  if (orgStore.currentOrgId) {
    await fieldStore.loadFields(orgStore.currentOrgId);
  }
}

onMounted(load);
watch(() => orgStore.currentOrgId, load);
</script>

<template>
  <n-space justify="space-between" align="center" style="margin-bottom: 16px">
    <n-h1 style="margin: 0">Поля</n-h1>
    <n-space align="center" :size="12">
      <n-input
        v-model:value="search"
        placeholder="Поиск по названию..."
        clearable
        style="width: 260px"
      />
      <n-button v-if="isAdmin" type="primary" @click="goToCreate">
        Создать поле
      </n-button>
    </n-space>
  </n-space>

  <LoadingState v-if="fieldStore.isLoading" message="Загрузка полей..." />

  <template v-else-if="fieldStore.fields.length === 0">
    <EmptyState
      title="Нет полей"
      description="Создайте первое поле для начала работы"
      :action-label="isAdmin ? 'Создать поле' : undefined"
      @action="goToCreate"
    />
  </template>

  <n-data-table
    v-else
    :columns="columns"
    :data="filteredFields"
    :row-props="(row: Field) => ({ style: 'cursor: pointer', onClick: () => handleRowClick(row) })"
    :bordered="false"
    striped
  />
</template>
