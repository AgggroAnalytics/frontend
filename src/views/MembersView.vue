<script setup lang="ts">
import { ref, onMounted, watch, h } from 'vue';
import {
  NH1,
  NDataTable,
  NButton,
  NSpace,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  useMessage,
  useDialog,
} from 'naive-ui';
import type { DataTableColumns, SelectOption } from 'naive-ui';
import type { OrgMember, OrgRole } from '@/types';
import { useOrgStore } from '@/stores/org';
import * as orgsApi from '@/api/orgs';
import LoadingState from '@/components/common/LoadingState.vue';
import EmptyState from '@/components/common/EmptyState.vue';

const orgStore = useOrgStore();
const message = useMessage();
const dialog = useDialog();

const members = ref<OrgMember[]>([]);
const loading = ref(false);

const showAddModal = ref(false);
const addEmail = ref('');
const addRole = ref<OrgRole>('ORG_VIEWER');
const addLoading = ref(false);

const showEditModal = ref(false);
const editMember = ref<OrgMember | null>(null);
const editRole = ref<OrgRole>('ORG_VIEWER');
const editLoading = ref(false);

const roleOptions: SelectOption[] = [
  { label: 'Владелец', value: 'ORG_OWNER' },
  { label: 'Администратор', value: 'ORG_ADMIN' },
  { label: 'Аналитик', value: 'ORG_ANALYST' },
  { label: 'Наблюдатель', value: 'ORG_VIEWER' },
];

const ROLE_LABELS: Record<OrgRole, string> = {
  ORG_OWNER: 'Владелец',
  ORG_ADMIN: 'Администратор',
  ORG_ANALYST: 'Аналитик',
  ORG_VIEWER: 'Наблюдатель',
};

const columns: DataTableColumns<OrgMember> = [
  {
    title: 'ID пользователя',
    key: 'user_id',
    ellipsis: { tooltip: true },
  },
  {
    title: 'Роль',
    key: 'role',
    render(row) {
      return ROLE_LABELS[row.role] ?? row.role;
    },
  },
  {
    title: 'Добавлен',
    key: 'created_at',
    render(row) {
      return new Date(row.created_at).toLocaleDateString('ru-RU');
    },
  },
  {
    title: '',
    key: 'actions',
    width: 200,
    render(row) {
      return h(NSpace, { size: 8 }, () => [
        h(
          NButton,
          {
            size: 'small',
            onClick: () => openEditModal(row),
          },
          () => 'Роль',
        ),
        h(
          NButton,
          {
            size: 'small',
            type: 'error',
            secondary: true,
            disabled: row.role === 'ORG_OWNER',
            onClick: () => confirmRemove(row),
          },
          () => 'Удалить',
        ),
      ]);
    },
  },
];

async function loadMembers() {
  const oid = orgStore.currentOrgId;
  if (!oid) return;
  loading.value = true;
  try {
    members.value = await orgsApi.getMembers(oid);
  } finally {
    loading.value = false;
  }
}

function openAddModal() {
  addEmail.value = '';
  addRole.value = 'ORG_VIEWER';
  showAddModal.value = true;
}

async function handleAdd() {
  const oid = orgStore.currentOrgId;
  if (!oid || !addEmail.value.trim()) return;
  addLoading.value = true;
  try {
    const member = await orgsApi.addMember(oid, {
      user_id: addEmail.value.trim(),
      role: addRole.value,
    });
    members.value.push(member);
    showAddModal.value = false;
    message.success('Участник добавлен');
  } catch {
    message.error('Не удалось добавить участника');
  } finally {
    addLoading.value = false;
  }
}

function openEditModal(member: OrgMember) {
  editMember.value = member;
  editRole.value = member.role;
  showEditModal.value = true;
}

async function handleEditRole() {
  const oid = orgStore.currentOrgId;
  if (!oid || !editMember.value) return;
  editLoading.value = true;
  try {
    const updated = await orgsApi.updateMemberRole(oid, editMember.value.user_id, editRole.value);
    const idx = members.value.findIndex((m) => m.user_id === updated.user_id);
    if (idx !== -1) members.value[idx] = updated;
    showEditModal.value = false;
    message.success('Роль обновлена');
  } catch {
    message.error('Не удалось обновить роль');
  } finally {
    editLoading.value = false;
  }
}

function confirmRemove(member: OrgMember) {
  dialog.warning({
    title: 'Удалить участника',
    content: `Вы уверены, что хотите удалить участника ${member.user_id}?`,
    positiveText: 'Удалить',
    negativeText: 'Отмена',
    onPositiveClick: () => handleRemove(member),
  });
}

async function handleRemove(member: OrgMember) {
  const oid = orgStore.currentOrgId;
  if (!oid) return;
  try {
    await orgsApi.removeMember(oid, member.user_id);
    members.value = members.value.filter((m) => m.user_id !== member.user_id);
    message.success('Участник удалён');
  } catch {
    message.error('Не удалось удалить участника');
  }
}

onMounted(loadMembers);
watch(() => orgStore.currentOrgId, loadMembers);
</script>

<template>
  <n-space justify="space-between" align="center" style="margin-bottom: 16px">
    <n-h1 style="margin: 0">Участники организации</n-h1>
    <n-button type="primary" @click="openAddModal">Добавить участника</n-button>
  </n-space>

  <LoadingState v-if="loading" message="Загрузка участников..." />

  <EmptyState
    v-else-if="members.length === 0"
    title="Нет участников"
    description="Добавьте первого участника в организацию"
    action-label="Добавить участника"
    @action="openAddModal"
  />

  <n-data-table v-else :columns="columns" :data="members" :bordered="false" striped />

  <n-modal
    v-model:show="showAddModal"
    preset="dialog"
    title="Добавить участника"
    positive-text="Добавить"
    negative-text="Отмена"
    :loading="addLoading"
    @positive-click="handleAdd"
  >
    <n-form label-placement="top" style="margin-top: 16px">
      <n-form-item label="ID или email пользователя">
        <n-input v-model:value="addEmail" placeholder="user@example.com" />
      </n-form-item>
      <n-form-item label="Роль">
        <n-select v-model:value="addRole" :options="roleOptions" />
      </n-form-item>
    </n-form>
  </n-modal>

  <n-modal
    v-model:show="showEditModal"
    preset="dialog"
    title="Изменить роль"
    positive-text="Сохранить"
    negative-text="Отмена"
    :loading="editLoading"
    @positive-click="handleEditRole"
  >
    <n-form label-placement="top" style="margin-top: 16px">
      <n-form-item label="Роль">
        <n-select v-model:value="editRole" :options="roleOptions" />
      </n-form-item>
    </n-form>
  </n-modal>
</template>
