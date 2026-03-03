import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import type { OrgRole } from '@/types';
import { useAuthStore } from '@/stores/auth';
import { useOrgStore } from '@/stores/org';

declare module 'vue-router' {
  interface RouteMeta {
    requiresRole?: OrgRole[];
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/fields',
  },
  {
    path: '/fields',
    name: 'fields',
    component: () => import('@/views/FieldsView.vue'),
  },
  {
    path: '/fields/create',
    name: 'field-create',
    component: () => import('@/views/FieldCreateView.vue'),
    meta: { requiresRole: ['ORG_ADMIN', 'ORG_OWNER'] },
  },
  {
    path: '/fields/:fieldId',
    name: 'field-detail',
    component: () => import('@/views/FieldDetailView.vue'),
  },
  {
    path: '/analytics',
    name: 'analytics',
    component: () => import('@/views/AnalyticsView.vue'),
  },
  {
    path: '/reports',
    name: 'reports',
    component: () => import('@/views/ReportsView.vue'),
  },
  {
    path: '/members',
    name: 'members',
    component: () => import('@/views/MembersView.vue'),
    meta: { requiresRole: ['ORG_ADMIN', 'ORG_OWNER'] },
  },
  {
    path: '/login/callback',
    name: 'login-callback',
    component: () => import('@/views/LoginCallback.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to) => {
  const authStore = useAuthStore();

  if (to.name === 'login-callback') return true;

  if (!authStore.isAuthenticated) {
    if (authStore.isLoading) {
      await new Promise<void>((resolve) => {
        const unwatch = authStore.$subscribe(() => {
          if (!authStore.isLoading) {
            unwatch();
            resolve();
          }
        });
      });
    }
    if (!authStore.isAuthenticated) {
      return false;
    }
  }

  const requiredRoles = to.meta.requiresRole;
  if (requiredRoles && requiredRoles.length > 0) {
    const orgStore = useOrgStore();
    const orgId = orgStore.currentOrgId;
    if (!orgId) return { name: 'fields' };

    const role = authStore.currentRole(orgId);
    if (!role || !requiredRoles.includes(role)) {
      return { name: 'fields' };
    }
  }

  return true;
});

export default router;
