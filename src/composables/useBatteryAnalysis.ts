import { ref, computed } from 'vue';
import { fetchBatterySamples } from '@/services/batteryDataService';
import { aggregateBySchool } from '@/utils/batteryCalc';
import type { SchoolBatterySummary } from '@/models/battery';

export function useBatteryAnalysis() {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const summaries = ref<SchoolBatterySummary[]>([]);

  async function load() {
    loading.value = true;
    error.value = null;
    try {
      const samples = await fetchBatterySamples();
      summaries.value = aggregateBySchool(samples);
    } catch (e: unknown) {
      if (e && typeof e === 'object' && 'message' in e) {
        const err = e as { message?: unknown };
        error.value = typeof err.message === 'string' ? err.message : 'Failed to load battery data';
      } else {
        error.value = 'Failed to load battery data';
      }
    } finally {
      loading.value = false;
    }
  }

  const totalUnhealthy = computed(() =>
    summaries.value.reduce((acc, s) => acc + s.unhealthyCount, 0)
  );
  const totalDevices = computed(() => summaries.value.reduce((acc, s) => acc + s.totalDevices, 0));
  const totalHealthy = computed(() => totalDevices.value - totalUnhealthy.value);
  const schoolsToVisit = computed(() => summaries.value.filter((s) => s.unhealthyCount > 0).length);

  return {
    loading,
    error,
    summaries,
    totalUnhealthy,
    totalHealthy,
    totalDevices,
    schoolsToVisit,
    load
  };
}
