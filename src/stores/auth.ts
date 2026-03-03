import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import Keycloak from 'keycloak-js';
import type { User, Organization, OrgMember, OrgRole } from '@/types';
import { getProfile } from '@/api/auth';
import { useOrgStore } from '@/stores/org';

const TOKEN_REFRESH_INTERVAL_MS = 30_000;
const TOKEN_MIN_VALIDITY_SEC = 60;

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const organizations = ref<Organization[]>([]);
  const memberships = ref<OrgMember[]>([]);
  const keycloak = ref<Keycloak | null>(null);
  const isAuthenticated = ref(false);
  const isLoading = ref(true);

  const token = computed(() => keycloak.value?.token ?? '');

  const currentRole = computed(() => {
    return (orgId: string): OrgRole | undefined => {
      return memberships.value.find((m) => m.org_id === orgId)?.role;
    };
  });

  const isAdmin = computed(() => {
    return (orgId: string): boolean => {
      const role = currentRole.value(orgId);
      return role === 'ORG_ADMIN' || role === 'ORG_OWNER';
    };
  });

  const isAnalyst = computed(() => {
    return (orgId: string): boolean => {
      const role = currentRole.value(orgId);
      return role === 'ORG_ANALYST' || role === 'ORG_ADMIN' || role === 'ORG_OWNER';
    };
  });

  let refreshInterval: ReturnType<typeof setInterval> | null = null;

  async function loadProfile() {
    const profile = await getProfile();
    user.value = profile.user;
    organizations.value = profile.organizations ?? [];
    memberships.value = profile.memberships ?? [];

    const orgStore = useOrgStore();
    orgStore.organizations = organizations.value;
    if (!orgStore.currentOrgId && organizations.value.length > 0) {
      orgStore.setCurrentOrg(organizations.value[0].id);
    }
  }

  async function init() {
    isLoading.value = true;
    try {
      const kc = new Keycloak({
        url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8180',
        realm: 'aggro',
        clientId: 'aggro-frontend',
      });

      await kc.init({
        onLoad: 'login-required',
        checkLoginIframe: false,
      });

      keycloak.value = kc;
      isAuthenticated.value = !!kc.authenticated;

      if (kc.authenticated) {
        await loadProfile();

        refreshInterval = setInterval(async () => {
          try {
            await kc.updateToken(TOKEN_MIN_VALIDITY_SEC);
          } catch {
            kc.login();
          }
        }, TOKEN_REFRESH_INTERVAL_MS);
      }
    } finally {
      isLoading.value = false;
    }
  }

  function logout() {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
    }
    keycloak.value?.logout();
  }

  return {
    user,
    organizations,
    memberships,
    keycloak,
    isAuthenticated,
    isLoading,
    token,
    currentRole,
    isAdmin,
    isAnalyst,
    init,
    loadProfile,
    logout,
  };
});
