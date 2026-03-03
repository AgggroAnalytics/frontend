<script setup lang="ts">
import { computed } from 'vue';
import { NTag } from 'naive-ui';

const props = defineProps<{
  status: string;
  type: 'analysis' | 'report';
}>();

const labelMap: Record<string, string> = {
  CREATED: 'СОЗДАН',
  RUNNING: 'ВЫПОЛНЯЕТСЯ',
  GENERATING: 'ВЫПОЛНЯЕТСЯ',
  SUCCEEDED: 'ЗАВЕРШЁН',
  READY: 'ЗАВЕРШЁН',
  FAILED: 'ОШИБКА',
  CANCELED: 'ОТМЕНЁН',
};

type TagType = 'default' | 'info' | 'success' | 'warning' | 'error';

const tagType = computed<TagType>(() => {
  switch (props.status) {
    case 'CREATED':
      return 'info';
    case 'RUNNING':
    case 'GENERATING':
      return 'warning';
    case 'SUCCEEDED':
    case 'READY':
      return 'success';
    case 'FAILED':
      return 'error';
    case 'CANCELED':
      return 'default';
    default:
      return 'default';
  }
});

const label = computed(() => labelMap[props.status] ?? props.status);

const isProcessing = computed(
  () => props.status === 'RUNNING' || props.status === 'GENERATING',
);
</script>

<template>
  <n-tag :type="tagType" size="small" round :bordered="false">
    <template v-if="isProcessing">
      <span class="processing-dot" />
    </template>
    {{ label }}
  </n-tag>
</template>

<style scoped>
.processing-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  margin-right: 6px;
  animation: pulse 1.2s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}
</style>
