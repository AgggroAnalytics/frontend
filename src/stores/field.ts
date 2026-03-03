import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Field, CreateFieldPayload } from '@/types';
import * as fieldsApi from '@/api/fields';

export const useFieldStore = defineStore('field', () => {
  const fields = ref<Field[]>([]);
  const currentField = ref<Field | null>(null);
  const isLoading = ref(false);

  async function loadFields(orgId: string) {
    isLoading.value = true;
    try {
      fields.value = await fieldsApi.getFields(orgId);
    } finally {
      isLoading.value = false;
    }
  }

  async function loadField(orgId: string, fieldId: string) {
    isLoading.value = true;
    try {
      currentField.value = await fieldsApi.getField(orgId, fieldId);
    } finally {
      isLoading.value = false;
    }
  }

  async function createField(orgId: string, payload: CreateFieldPayload) {
    const field = await fieldsApi.createField(orgId, payload);
    fields.value.push(field);
    return field;
  }

  async function deleteField(orgId: string, fieldId: string) {
    await fieldsApi.deleteField(orgId, fieldId);
    fields.value = fields.value.filter((f) => f.id !== fieldId);
    if (currentField.value?.id === fieldId) {
      currentField.value = null;
    }
  }

  return {
    fields,
    currentField,
    isLoading,
    loadFields,
    loadField,
    createField,
    deleteField,
  };
});
