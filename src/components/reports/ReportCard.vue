<script setup lang="ts">
import { computed } from 'vue';
import { NCard, NSpace, NText, NTag, NButton } from 'naive-ui';
import type { Report } from '@/types';
import StatusBadge from '@/components/common/StatusBadge.vue';
import { useReportStore } from '@/stores/report';

const props = defineProps<{
  report: Report;
  orgId: string;
  fieldId: string;
}>();

const reportStore = useReportStore();

const MODULE_LABELS: Record<string, string> = {
  M1: 'Здоровье посевов',
  M2: 'Орошение',
  M3: 'Почвы',
};

const formattedDate = computed(() =>
  new Date(props.report.created_at).toLocaleString('ru-RU'),
);

const isReady = computed(() => props.report.status === 'READY');

async function handleDownload(e: MouseEvent) {
  e.stopPropagation();
  await reportStore.downloadReport(props.orgId, props.fieldId, props.report.id);
}
</script>

<template>
  <n-card size="small" hoverable style="margin-bottom: 12px">
    <n-space justify="space-between" align="center">
      <n-space align="center" :size="12">
        <StatusBadge :status="report.status" type="report" />
        <n-space :size="4">
          <n-tag
            v-for="m in report.modules"
            :key="m"
            size="small"
            :bordered="false"
          >
            {{ MODULE_LABELS[m] ?? m }}
          </n-tag>
        </n-space>
      </n-space>
      <n-space align="center" :size="12">
        <n-text depth="3" style="font-size: 12px">{{ formattedDate }}</n-text>
        <n-button
          v-if="isReady"
          size="small"
          type="primary"
          secondary
          @click="handleDownload"
        >
          Скачать
        </n-button>
      </n-space>
    </n-space>
  </n-card>
</template>
