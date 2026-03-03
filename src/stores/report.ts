import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Report, CreateReportPayload } from '@/types';
import * as reportsApi from '@/api/reports';

export const useReportStore = defineStore('report', () => {
  const reports = ref<Report[]>([]);
  const currentReport = ref<Report | null>(null);
  const isLoading = ref(false);

  async function loadReports(orgId: string, fieldId: string) {
    isLoading.value = true;
    try {
      reports.value = await reportsApi.listReports(orgId, fieldId);
    } finally {
      isLoading.value = false;
    }
  }

  async function loadReport(orgId: string, fieldId: string, reportId: string) {
    isLoading.value = true;
    try {
      currentReport.value = await reportsApi.getReport(orgId, fieldId, reportId);
    } finally {
      isLoading.value = false;
    }
  }

  async function createReport(orgId: string, fieldId: string, payload: CreateReportPayload) {
    const report = await reportsApi.createReport(orgId, fieldId, payload);
    reports.value.unshift(report);
    return report;
  }

  async function downloadReport(orgId: string, fieldId: string, reportId: string) {
    const url = await reportsApi.getDownloadUrl(orgId, fieldId, reportId);
    window.open(url, '_blank');
  }

  return {
    reports,
    currentReport,
    isLoading,
    loadReports,
    loadReport,
    createReport,
    downloadReport,
  };
});
