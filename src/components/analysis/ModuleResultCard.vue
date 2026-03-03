<script setup lang="ts">
import { computed } from 'vue';
import { NCard, NSpace, NText, NDivider, NA } from 'naive-ui';
import type { ModuleResult } from '@/types';
import StatusBadge from '@/components/common/StatusBadge.vue';

const props = defineProps<{
  result: ModuleResult;
}>();

const MODULE_LABELS: Record<string, string> = {
  M1: 'M1: Здоровье посевов',
  M2: 'M2: Орошение',
  M3: 'M3: Почвы',
};

const moduleLabel = computed(() => MODULE_LABELS[props.result.module] ?? props.result.module);

const summaryEntries = computed(() => {
  if (!props.result.summary_json) return [];
  return Object.entries(props.result.summary_json);
});

const artifactLinks = computed(() => {
  if (!props.result.artifacts_json) return [];
  return Object.entries(props.result.artifacts_json).filter(
    ([, v]) => typeof v === 'string' && (v as string).startsWith('http'),
  );
});
</script>

<template>
  <n-card size="small" :bordered="true" style="margin-bottom: 8px">
    <template #header>
      <n-space align="center" :size="8">
        <n-text strong>{{ moduleLabel }}</n-text>
        <StatusBadge :status="result.status" type="analysis" />
      </n-space>
    </template>
    <div v-if="summaryEntries.length > 0" class="summary-section">
      <div v-for="[key, value] in summaryEntries" :key="key" class="summary-row">
        <n-text depth="3">{{ key }}:</n-text>
        <n-text>{{ value }}</n-text>
      </div>
    </div>
    <div v-if="artifactLinks.length > 0">
      <n-divider style="margin: 8px 0" />
      <n-space vertical :size="4">
        <n-a
          v-for="[label, url] in artifactLinks"
          :key="label"
          :href="url as string"
          target="_blank"
        >
          {{ label }}
        </n-a>
      </n-space>
    </div>
  </n-card>
</template>

<style scoped>
.summary-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.summary-row {
  display: flex;
  gap: 8px;
}
</style>
