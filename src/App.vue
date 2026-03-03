<script setup lang="ts">
import { NConfigProvider, NMessageProvider, NNotificationProvider, NSpin } from 'naive-ui';
import { useAuthStore } from '@/stores/auth';
import AppLayout from '@/components/layout/AppLayout.vue';

const authStore = useAuthStore();
</script>

<template>
  <n-config-provider>
    <n-message-provider>
      <n-notification-provider>
        <template v-if="authStore.isLoading">
          <div style="display: flex; justify-content: center; align-items: center; height: 100vh">
            <n-spin size="large" />
          </div>
        </template>
        <AppLayout v-else />
      </n-notification-provider>
    </n-message-provider>
  </n-config-provider>
</template>
