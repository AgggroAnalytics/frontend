<script setup lang="ts">
import { NCard, NButton, NSpace, NText } from 'naive-ui';

defineProps<{
  title: string;
  description: string;
  actionLabel?: string;
}>();

const emit = defineEmits<{
  action: [];
}>();
</script>

<template>
  <n-card style="max-width: 420px; margin: 48px auto; text-align: center">
    <n-space vertical align="center" :size="16">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
        style="opacity: 0.35"
      >
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      </svg>
      <n-text strong style="font-size: 16px">{{ title }}</n-text>
      <n-text depth="3">{{ description }}</n-text>
      <n-button
        v-if="actionLabel"
        type="primary"
        @click="emit('action')"
      >
        {{ actionLabel }}
      </n-button>
    </n-space>
  </n-card>
</template>
