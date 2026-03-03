import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useOrgStore } from '@/stores/org';
import type { OrgRole } from '@/types';

export function useRole() {
  const authStore = useAuthStore();
  const orgStore = useOrgStore();

  const currentRole = computed<OrgRole | undefined>(() => {
    const orgId = orgStore.currentOrgId;
    if (!orgId) return undefined;
    return authStore.currentRole(orgId);
  });

  const isAdmin = computed(() => {
    const role = currentRole.value;
    return role === 'ORG_ADMIN' || role === 'ORG_OWNER';
  });

  const isAnalyst = computed(() => {
    const role = currentRole.value;
    return role === 'ORG_ANALYST' || role === 'ORG_ADMIN' || role === 'ORG_OWNER';
  });

  const isViewer = computed(() => currentRole.value === 'ORG_VIEWER');

  return { currentRole, isAdmin, isAnalyst, isViewer };
}
