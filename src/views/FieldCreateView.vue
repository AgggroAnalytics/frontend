<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  NH1,
  NButton,
  NInput,
  NSpace,
  NForm,
  NFormItem,
  useMessage,
} from 'naive-ui';
import type { Polygon } from 'geojson';
import { useFieldStore } from '@/stores/field';
import { useOrgStore } from '@/stores/org';
import FieldDrawer from '@/components/map/FieldDrawer.vue';

const router = useRouter();
const fieldStore = useFieldStore();
const orgStore = useOrgStore();
const message = useMessage();

const name = ref('');
const geometry = ref<Polygon | null>(null);
const submitting = ref(false);

const isValid = computed(
  () => name.value.trim().length > 0 && geometry.value !== null,
);

function handleGeometryUpdate(geo: Polygon | null) {
  geometry.value = geo;
}

async function handleSubmit() {
  if (!isValid.value || !orgStore.currentOrgId) return;
  submitting.value = true;
  try {
    const field = await fieldStore.createField(orgStore.currentOrgId, {
      name: name.value.trim(),
      geometry: geometry.value!,
    });
    message.success('Поле создано');
    router.push({ name: 'field-detail', params: { fieldId: field.id } });
  } catch {
    message.error('Не удалось создать поле');
  } finally {
    submitting.value = false;
  }
}

function handleCancel() {
  router.back();
}
</script>

<template>
  <n-h1>Новое поле</n-h1>

  <n-form label-placement="top" style="max-width: 720px">
    <n-form-item label="Название поля" required>
      <n-input
        v-model:value="name"
        placeholder="Введите название поля"
        :maxlength="200"
      />
    </n-form-item>

    <n-form-item label="Границы поля" required>
      <FieldDrawer @update:geometry="handleGeometryUpdate" />
    </n-form-item>

    <n-space :size="12" style="margin-top: 16px">
      <n-button
        type="primary"
        :disabled="!isValid"
        :loading="submitting"
        @click="handleSubmit"
      >
        Создать
      </n-button>
      <n-button @click="handleCancel">Отмена</n-button>
    </n-space>
  </n-form>
</template>
