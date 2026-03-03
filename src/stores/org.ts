import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Organization } from '@/types';
import { getOrgs } from '@/api/orgs';

const LS_KEY = 'aggro_current_org_id';

export const useOrgStore = defineStore('org', () => {
  const currentOrgId = ref<string | null>(localStorage.getItem(LS_KEY));
  const organizations = ref<Organization[]>([]);

  const currentOrg = computed(() =>
    organizations.value.find((o) => o.id === currentOrgId.value) ?? null,
  );

  function setCurrentOrg(orgId: string) {
    currentOrgId.value = orgId;
    localStorage.setItem(LS_KEY, orgId);
  }

  async function loadOrgs() {
    organizations.value = await getOrgs();
    if (!currentOrgId.value && organizations.value.length > 0) {
      setCurrentOrg(organizations.value[0].id);
    }
  }

  return {
    currentOrgId,
    organizations,
    currentOrg,
    setCurrentOrg,
    loadOrgs,
  };
});
