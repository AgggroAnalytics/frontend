<script setup lang="ts">
import { NSpin, NSpace, NText } from 'naive-ui';

defineProps<{
  message?: string;
}>();
</script>

<template>
  <n-space vertical align="center" justify="center" style="padding: 64px 0">
    <n-spin size="large" />
    <n-text v-if="message" depth="3" style="margin-top: 12px">{{ message }}</n-text>
  </n-space>
</template>
