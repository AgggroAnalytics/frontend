<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  NLayout,
  NLayoutSider,
  NLayoutHeader,
  NLayoutContent,
  NMenu,
  NSpace,
  NText,
  NSelect,
  NButton,
} from 'naive-ui';
import type { MenuOption } from 'naive-ui';
import { useAuthStore } from '@/stores/auth';
import { useOrgStore } from '@/stores/org';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const orgStore = useOrgStore();

const menuKey = computed(() => (route.name as string) ?? 'fields');

const orgOptions = computed(() =>
  orgStore.organizations.map((o) => ({ label: o.name, value: o.id })),
);

const menuOptions = computed<MenuOption[]>(() => [
  { label: 'Поля', key: 'fields' },
  { label: 'Аналитика', key: 'analytics' },
  { label: 'Отчёты', key: 'reports' },
  ...(orgStore.currentOrgId && authStore.isAdmin(orgStore.currentOrgId)
    ? [{ label: 'Участники', key: 'members' }]
    : []),
]);

function handleMenuUpdate(key: string) {
  router.push({ name: key });
}

function handleOrgChange(orgId: string) {
  orgStore.setCurrentOrg(orgId);
  router.push({ name: 'fields' });
}

function handleLogout() {
  authStore.logout();
}
</script>

<template>
  <n-layout has-sider style="min-height: 100vh">
    <n-layout-sider
      v-if="authStore.isAuthenticated"
      bordered
      :width="220"
      content-style="display: flex; flex-direction: column; height: 100%"
    >
      <div style="padding: 20px 16px 8px; font-size: 20px; font-weight: 700; letter-spacing: -0.5px">
        Aggro
      </div>
      <n-menu
        :value="menuKey"
        :options="menuOptions"
        @update:value="handleMenuUpdate"
        style="flex: 1"
      />
    </n-layout-sider>
    <n-layout>
      <n-layout-header
        v-if="authStore.isAuthenticated"
        bordered
        style="padding: 0 24px; height: 56px; display: flex; align-items: center; justify-content: space-between"
      >
        <n-space align="center">
          <n-select
            v-if="orgOptions.length > 0"
            :value="orgStore.currentOrgId"
            :options="orgOptions"
            style="width: 240px"
            placeholder="Организация"
            @update:value="handleOrgChange"
          />
        </n-space>
        <n-space align="center" :size="16">
          <n-text v-if="authStore.user">{{ authStore.user.display_name }}</n-text>
          <n-button size="small" quaternary @click="handleLogout">Выйти</n-button>
        </n-space>
      </n-layout-header>
      <n-layout-content content-style="padding: 24px">
        <router-view />
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>
