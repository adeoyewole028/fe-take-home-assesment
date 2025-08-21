<template>
  <main class="p-6 space-y-6">
    <header>
      <h1 class="text-2xl font-bold">Battery Health Dashboard</h1>
      <p class="text-sm text-gray-400">
        Devices draining &gt; 30% per day are flagged as unhealthy.
      </p>
    </header>
    <section v-if="!loading" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div class="stat-card">
        <div class="text-xs uppercase tracking-wide text-gray-500 font-medium">
          Unhealthy Devices
        </div>
        <div class="mt-1 flex items-baseline gap-2">
          <span class="text-2xl font-semibold text-red-600">{{ totalUnhealthy }}</span>
          <span class="text-[11px] text-gray-500">of {{ totalDevices }}</span>
        </div>
        <div class="mt-1 h-1.5 overflow-hidden rounded-full bg-red-100">
          <div class="h-full bg-red-500" :style="{ width: unhealthyPct + '%' }"></div>
        </div>
      </div>
      <div class="stat-card">
        <div class="text-xs uppercase tracking-wide text-gray-500 font-medium">Healthy Devices</div>
        <div class="mt-1 flex items-baseline gap-2">
          <span class="text-2xl font-semibold text-emerald-600">{{ totalHealthy }}</span>
          <span class="text-[11px] text-gray-500">of {{ totalDevices }}</span>
        </div>
        <div class="mt-1 h-1.5 overflow-hidden rounded-full bg-emerald-100">
          <div class="h-full bg-emerald-500" :style="{ width: healthyPct + '%' }"></div>
        </div>
      </div>
      <div class="stat-card">
        <div class="text-xs uppercase tracking-wide text-gray-500 font-medium">
          Schools To Visit
        </div>
        <div class="mt-1 flex items-baseline gap-2">
          <span class="text-2xl font-semibold text-indigo-600">{{ schoolsToVisit }}</span>
          <span class="text-[11px] text-gray-500">of {{ summaries.length }}</span>
        </div>
        <div class="mt-1 text-[11px] text-gray-500">{{ visitPct.toFixed(1) }}% impacted</div>
      </div>
      <div class="stat-card">
        <div class="text-xs uppercase tracking-wide text-gray-500 font-medium">Overall Health</div>
        <div class="mt-1 flex items-baseline gap-2">
          <span class="text-2xl font-semibold" :class="overallClass">{{ overallLabel }}</span>
        </div>
        <div class="mt-1 text-[11px] text-gray-500">
          Unhealthy ratio: {{ unhealthyPct.toFixed(1) }}%
        </div>
      </div>
    </section>
    <div v-if="!loading" class="flex flex-wrap items-center gap-3 pt-2">
      <button
        @click="toggleCritical()"
        class="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors"
        :class="
          criticalOnly
            ? 'bg-red-600 text-white border-red-600 hover:bg-red-500'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
        "
        type="button"
      >
        <span v-if="criticalOnly">Showing Critical Only (click to show all)</span>
        <span v-else>Show Critical Devices Only</span>
      </button>
      <button
        @click="toggleAll()"
        type="button"
        class="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
      >
        {{ allExpanded ? 'Collapse All' : 'Expand All' }}
      </button>
      <span class="text-[11px] text-gray-400" v-if="criticalOnly"
        >Filtered view: only devices with tier Critical (&gt;= 30% daily drain)</span
      >
    </div>
    <section>
      <div v-if="loading" class="text-gray-500">Loading data...</div>
      <SchoolList
        v-else
        :summaries="filteredSummaries"
        :error="error"
        :expandTrigger="expandTrigger"
        :collapseTrigger="collapseTrigger"
      />
    </section>
  </main>
</template>
<script setup lang="ts">
import { onMounted, computed, ref } from 'vue';
import { useBatteryAnalysis } from '@/composables/useBatteryAnalysis';
import SchoolList from '@/components/SchoolList.vue';

const {
  loading,
  error,
  summaries,
  load,
  totalUnhealthy,
  totalHealthy,
  totalDevices,
  schoolsToVisit
} = useBatteryAnalysis();
const unhealthyPct = computed(() =>
  totalDevices.value ? (totalUnhealthy.value / totalDevices.value) * 100 : 0
);
const healthyPct = computed(() =>
  totalDevices.value ? (totalHealthy.value / totalDevices.value) * 100 : 0
);
const visitPct = computed(() =>
  summaries.value.length ? (schoolsToVisit.value / summaries.value.length) * 100 : 0
);
const overallLabel = computed(() => {
  if (unhealthyPct.value > 50) return 'Critical';
  if (unhealthyPct.value > 25) return 'Degraded';
  if (unhealthyPct.value > 10) return 'Fair';
  return 'Good';
});
const overallClass = computed(() => {
  if (unhealthyPct.value > 50) return 'text-red-600';
  if (unhealthyPct.value > 25) return 'text-amber-600';
  if (unhealthyPct.value > 10) return 'text-indigo-600';
  return 'text-emerald-600';
});
const criticalOnly = ref(false);
const expandTrigger = ref(0);
const collapseTrigger = ref(0);
const allExpanded = ref(false);
function toggleCritical() {
  criticalOnly.value = !criticalOnly.value;
  expandTrigger.value++;
  allExpanded.value = true;
}
function toggleAll() {
  if (allExpanded.value) {
    collapseTrigger.value++;
    allExpanded.value = false;
  } else {
    expandTrigger.value++;
    allExpanded.value = true;
  }
}
const filteredSummaries = computed(() => {
  if (!criticalOnly.value) return summaries.value;
  return summaries.value
    .map((s) => ({
      ...s,
      devices: s.devices.filter(
        (d) => d.averageDailyDrainPct != null && d.averageDailyDrainPct >= 30
      )
    }))
    .filter((s) => s.devices.length > 0);
});
onMounted(load);
</script>
<style scoped>
.stat-card {
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  padding: 1rem;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
</style>
