<script setup lang="ts">
import { computed } from 'vue';
import { NCard, NSpace, NText, NTag, NDivider } from 'naive-ui';
import { useRouter } from 'vue-router';
import type { AnalysisRequest } from '@/types';
import StatusBadge from '@/components/common/StatusBadge.vue';
import ModuleResultCard from './ModuleResultCard.vue';

const props = defineProps<{
  analysis: AnalysisRequest;
  orgId: string;
  fieldId: string;
}>();

const router = useRouter();

const MODULE_LABELS: Record<string, string> = {
  M1: 'Здоровье посевов',
  M2: 'Орошение',
  M3: 'Почвы',
};

const TRIGGER_LABELS: Record<string, string> = {
  REGISTRATION: 'Регистрация',
  MANUAL: 'Вручную',
  CRON: 'По расписанию',
};

const formattedDate = computed(() => {
  return new Date(props.analysis.created_at).toLocaleString('ru-RU');
});

function navigateToField() {
  router.push({ name: 'field-detail', params: { fieldId: props.fieldId } });
}
</script>

<template>
  <n-card
    size="small"
    hoverable
    style="margin-bottom: 12px; cursor: pointer"
    @click="navigateToField"
  >
    <n-space justify="space-between" align="center">
      <n-space align="center" :size="12">
        <StatusBadge :status="analysis.status" type="analysis" />
        <n-space :size="4">
          <n-tag
            v-for="m in analysis.modules"
            :key="m"
            size="small"
            :bordered="false"
          >
            {{ MODULE_LABELS[m] ?? m }}
          </n-tag>
        </n-space>
      </n-space>
      <n-space align="center" :size="12">
        <n-text depth="3" style="font-size: 12px">
          {{ TRIGGER_LABELS[analysis.trigger_type] ?? analysis.trigger_type }}
        </n-text>
        <n-text depth="3" style="font-size: 12px">{{ formattedDate }}</n-text>
      </n-space>
    </n-space>
    <template v-if="analysis.module_results && analysis.module_results.length > 0">
      <n-divider style="margin: 8px 0" />
      <ModuleResultCard
        v-for="mr in analysis.module_results"
        :key="mr.id"
        :result="mr"
      />
    </template>
  </n-card>
</template>
