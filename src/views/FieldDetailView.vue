<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import {
  NH1,
  NTabs,
  NTabPane,
  NSpace,
  NText,
  NDescriptions,
  NDescriptionsItem,
  NDivider,
  NSelect,
  NCheckbox,
  NCheckboxGroup,
  NButton,
  useMessage,
} from 'naive-ui';
import type { ModuleName } from '@/types';
import { useFieldStore } from '@/stores/field';
import { useOrgStore } from '@/stores/org';
import { useAnalysisStore } from '@/stores/analysis';
import { useReportStore } from '@/stores/report';
import { useSeasonStore } from '@/stores/season';
import { useRole, usePolling } from '@/composables';
import LoadingState from '@/components/common/LoadingState.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import FieldMap from '@/components/map/FieldMap.vue';
import AnalysisCard from '@/components/analysis/AnalysisCard.vue';
import ReportCard from '@/components/reports/ReportCard.vue';

const route = useRoute();
const message = useMessage();
const fieldStore = useFieldStore();
const orgStore = useOrgStore();
const analysisStore = useAnalysisStore();
const reportStore = useReportStore();
const seasonStore = useSeasonStore();
const { isAnalyst } = useRole();

const fieldId = computed(() => route.params.fieldId as string);
const orgId = computed(() => orgStore.currentOrgId ?? '');

const activeTab = ref('overview');

const analysisSeason = ref<string | undefined>(undefined);
const analysisModules = ref<ModuleName[]>(['M1', 'M2', 'M3']);
const creatingAnalysis = ref(false);

const reportSeasons = ref<string[]>([]);
const reportModules = ref<ModuleName[]>(['M1', 'M2', 'M3']);
const creatingReport = ref(false);

const seasonOptions = computed(() =>
  seasonStore.all.map((s) => ({ label: s.label, value: s.id })),
);

const moduleOptions: { label: string; value: ModuleName }[] = [
  { label: 'M1: Здоровье посевов', value: 'M1' },
  { label: 'M2: Орошение', value: 'M2' },
  { label: 'M3: Почвы', value: 'M3' },
];

const sortedAnalyses = computed(() =>
  [...analysisStore.analyses].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  ),
);

const sortedReports = computed(() =>
  [...reportStore.reports].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  ),
);

const hasRunningAnalyses = computed(() =>
  analysisStore.analyses.some(
    (a) => a.status === 'CREATED' || a.status === 'RUNNING',
  ),
);

const hasGeneratingReports = computed(() =>
  reportStore.reports.some(
    (r) => r.status === 'CREATED' || r.status === 'GENERATING',
  ),
);

const analysisPolling = usePolling(async () => {
  if (!orgId.value || !fieldId.value) return;
  await analysisStore.loadAnalyses(orgId.value, fieldId.value);
  if (!hasRunningAnalyses.value) analysisPolling.stop();
}, 5000);

const reportPolling = usePolling(async () => {
  if (!orgId.value || !fieldId.value) return;
  await reportStore.loadReports(orgId.value, fieldId.value);
  if (!hasGeneratingReports.value) reportPolling.stop();
}, 5000);

async function loadFieldData() {
  if (!orgId.value || !fieldId.value) return;
  await Promise.all([
    fieldStore.loadField(orgId.value, fieldId.value),
    analysisStore.loadAnalyses(orgId.value, fieldId.value),
    reportStore.loadReports(orgId.value, fieldId.value),
    seasonStore.loadSeasons(),
  ]);
  if (seasonStore.current) {
    analysisSeason.value = seasonStore.current.id;
  }
}

async function createAnalysis() {
  if (!orgId.value || !fieldId.value) return;
  creatingAnalysis.value = true;
  try {
    await analysisStore.createAnalysis(orgId.value, fieldId.value, {
      season_id: analysisSeason.value,
      modules: analysisModules.value,
    });
    message.success('Анализ запущен');
    if (hasRunningAnalyses.value) analysisPolling.start();
  } catch {
    message.error('Не удалось запустить анализ');
  } finally {
    creatingAnalysis.value = false;
  }
}

async function createReport() {
  if (!orgId.value || !fieldId.value || reportSeasons.value.length === 0) return;
  creatingReport.value = true;
  try {
    await reportStore.createReport(orgId.value, fieldId.value, {
      season_ids: reportSeasons.value,
      modules: reportModules.value,
    });
    message.success('Отчёт создан');
    if (hasGeneratingReports.value) reportPolling.start();
  } catch {
    message.error('Не удалось создать отчёт');
  } finally {
    creatingReport.value = false;
  }
}

onMounted(async () => {
  await loadFieldData();
  if (hasRunningAnalyses.value) analysisPolling.start();
  if (hasGeneratingReports.value) reportPolling.start();
});

watch(() => route.params.fieldId, loadFieldData);
</script>

<template>
  <LoadingState v-if="fieldStore.isLoading && !fieldStore.currentField" message="Загрузка поля..." />

  <template v-else-if="fieldStore.currentField">
    <n-h1 style="margin-bottom: 16px">{{ fieldStore.currentField.name }}</n-h1>

    <n-tabs v-model:value="activeTab" type="line" animated>
      <n-tab-pane name="overview" tab="Обзор">
        <FieldMap
          v-if="fieldStore.currentField.geometry"
          :geometry="fieldStore.currentField.geometry"
        />
        <n-descriptions
          bordered
          :column="2"
          label-placement="left"
          style="margin-top: 16px"
        >
          <n-descriptions-item label="Название">
            {{ fieldStore.currentField.name }}
          </n-descriptions-item>
          <n-descriptions-item label="Площадь">
            {{ fieldStore.currentField.area_ha.toFixed(2) }} га
          </n-descriptions-item>
          <n-descriptions-item label="Создано">
            {{ new Date(fieldStore.currentField.created_at).toLocaleDateString('ru-RU') }}
          </n-descriptions-item>
          <n-descriptions-item label="Статус">
            {{ fieldStore.currentField.is_active ? 'Активно' : 'Неактивно' }}
          </n-descriptions-item>
        </n-descriptions>
      </n-tab-pane>

      <n-tab-pane name="analytics" tab="Аналитика">
        <template v-if="isAnalyst">
          <n-space align="flex-end" :size="12" style="margin-bottom: 20px">
            <div>
              <n-text depth="3" style="font-size: 12px; display: block; margin-bottom: 4px">Сезон</n-text>
              <n-select
                v-model:value="analysisSeason"
                :options="seasonOptions"
                style="width: 200px"
                placeholder="Сезон"
              />
            </div>
            <div>
              <n-text depth="3" style="font-size: 12px; display: block; margin-bottom: 4px">Модули</n-text>
              <n-checkbox-group v-model:value="analysisModules">
                <n-space :size="8">
                  <n-checkbox
                    v-for="opt in moduleOptions"
                    :key="opt.value"
                    :value="opt.value"
                    :label="opt.label"
                  />
                </n-space>
              </n-checkbox-group>
            </div>
            <n-button
              type="primary"
              :loading="creatingAnalysis"
              :disabled="analysisModules.length === 0"
              @click="createAnalysis"
            >
              Запустить
            </n-button>
          </n-space>
          <n-divider />
        </template>

        <EmptyState
          v-if="sortedAnalyses.length === 0 && !analysisStore.isLoading"
          title="Нет анализов"
          description="Запустите первый анализ для этого поля"
        />
        <LoadingState v-else-if="analysisStore.isLoading && sortedAnalyses.length === 0" />
        <div v-else>
          <AnalysisCard
            v-for="a in sortedAnalyses"
            :key="a.id"
            :analysis="a"
            :org-id="orgId"
            :field-id="fieldId"
          />
        </div>
      </n-tab-pane>

      <n-tab-pane name="reports" tab="Отчёты">
        <template v-if="isAnalyst">
          <n-space align="flex-end" :size="12" style="margin-bottom: 20px">
            <div>
              <n-text depth="3" style="font-size: 12px; display: block; margin-bottom: 4px">Сезоны</n-text>
              <n-select
                v-model:value="reportSeasons"
                :options="seasonOptions"
                multiple
                style="width: 260px"
                placeholder="Выберите сезоны"
              />
            </div>
            <div>
              <n-text depth="3" style="font-size: 12px; display: block; margin-bottom: 4px">Модули</n-text>
              <n-checkbox-group v-model:value="reportModules">
                <n-space :size="8">
                  <n-checkbox
                    v-for="opt in moduleOptions"
                    :key="opt.value"
                    :value="opt.value"
                    :label="opt.label"
                  />
                </n-space>
              </n-checkbox-group>
            </div>
            <n-button
              type="primary"
              :loading="creatingReport"
              :disabled="reportSeasons.length === 0 || reportModules.length === 0"
              @click="createReport"
            >
              Создать отчёт
            </n-button>
          </n-space>
          <n-divider />
        </template>

        <EmptyState
          v-if="sortedReports.length === 0 && !reportStore.isLoading"
          title="Нет отчётов"
          description="Создайте первый отчёт для этого поля"
        />
        <LoadingState v-else-if="reportStore.isLoading && sortedReports.length === 0" />
        <div v-else>
          <ReportCard
            v-for="r in sortedReports"
            :key="r.id"
            :report="r"
            :org-id="orgId"
            :field-id="fieldId"
          />
        </div>
      </n-tab-pane>
    </n-tabs>
  </template>
</template>
