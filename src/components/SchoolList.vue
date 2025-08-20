<template>
  <div class="space-y-6"> 
    <div
      v-if="error"
      class="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-red-800 text-sm"
    >
      {{ error }}
    </div>
    <div v-else class="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div class="overflow-x-auto rounded-xl">
        <table class="min-w-full text-[13px] md:text-sm leading-relaxed">
          <thead
            class="bg-gray-100/70 text-gray-700 text-xs md:text-[13px] uppercase tracking-wide sticky top-0 z-10"
          >
            <tr>
              <th class="px-3 py-2 text-left font-semibold">Academy ID</th>
              <th class="px-3 py-2 text-left font-semibold">Unhealthy</th>
              <th class="px-3 py-2 text-left font-semibold">Total</th>
              <th class="px-3 py-2 text-left font-semibold">% Unhealthy</th>
              <th class="px-3 py-2 text-left font-semibold">Details</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <template v-for="s in summaries" :key="s.academyId">
              <tr
                :class="[
                  'hover:bg-indigo-50/50 transition-colors',
                  open.has(s.academyId) ? 'bg-indigo-50/30' : 'odd:bg-gray-50/40'
                ]"
              >
                <td class="px-3 py-2 font-medium text-gray-800">{{ s.academyId }}</td>
                <td class="px-3 py-2">
                  <span :class="badgeClass(s.unhealthyCount > 0)">{{ s.unhealthyCount }}</span>
                </td>
                <td class="px-3 py-2 text-gray-700">{{ s.totalDevices }}</td>
                <td class="px-3 py-2">
                  <span :class="ratioBadgeClass(s)">{{ percent(s) }}</span>
                </td>
                <td class="px-3 py-2">
                  <button
                    class="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1"
                    @click="toggle(s.academyId)"
                    :aria-expanded="open.has(s.academyId)"
                    :aria-controls="'devices-' + s.academyId"
                  >
                    <span>{{ open.has(s.academyId) ? 'Hide' : 'Show' }}</span>
                    <svg
                      :class="[
                        'h-3.5 w-3.5 transition-transform',
                        open.has(s.academyId) ? 'rotate-180' : ''
                      ]"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                        clip-rule="evenodd"
                      />
                    </svg>
                  </button>
                </td>
              </tr>
              <tr v-show="open.has(s.academyId)">
                <td :id="'devices-' + s.academyId" colspan="5" class="p-0 bg-gray-50">
                  <DeviceTable :devices="s.devices" />
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
      <div class="px-4 py-2 text-[11px] md:text-xs text-gray-500 border-t bg-gray-50 rounded-b-xl">
        Showing {{ summaries.length }} schools.
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue';
import type { SchoolBatterySummary } from '@/models/battery';
import DeviceTable from './DeviceTable.vue';

const props = defineProps<{
  summaries: SchoolBatterySummary[];
  error: string | null;
  expandTrigger?: number; // increment to force expand all
  collapseTrigger?: number; // increment to force collapse all
}>();

const open = ref<Set<number>>(new Set());
function toggle(id: number) {
  if (open.value.has(id)) open.value.delete(id);
  else open.value.add(id);
  open.value = new Set(open.value);
}
function expandAllCurrent() {
  open.value = new Set(props.summaries.map(s => s.academyId));
}
function collapseAllCurrent() {
  if (open.value.size) {
    open.value = new Set();
  }
}
// Whenever expandTrigger changes (incremented by parent) expand all rows
watch(
  () => props.expandTrigger,
  () => {
    if (props.expandTrigger !== undefined) expandAllCurrent();
  }
);
// Whenever collapseTrigger changes collapse all
watch(
  () => props.collapseTrigger,
  () => {
    if (props.collapseTrigger !== undefined) collapseAllCurrent();
  }
);
// If the list of summaries changes while fully expanded, keep them expanded
watch(
  () => props.summaries,
  (newVal, oldVal) => {
    if (open.value.size && open.value.size === (oldVal?.length || 0)) {
      // assume previously fully expanded; add any new ids
      for (const s of newVal) open.value.add(s.academyId);
      open.value = new Set(open.value);
    }
  },
  { deep: true }
);
function percent(s: SchoolBatterySummary) {
  return s.totalDevices ? ((s.unhealthyCount / s.totalDevices) * 100).toFixed(1) + '%' : '—';
}
function badgeClass(has: boolean) {
  return has
    ? 'inline-flex items-center justify-center rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-700 ring-1 ring-inset ring-red-600/20'
    : 'inline-flex items-center justify-center rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20';
}
function ratioBadgeClass(s: SchoolBatterySummary) {
  const ratio = s.totalDevices ? s.unhealthyCount / s.totalDevices : 0;
  if (!s.totalDevices)
    return 'inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600 ring-1 ring-inset ring-gray-300';
  if (ratio > 0.5)
    return 'inline-flex rounded-full bg-red-200/70 px-2 py-0.5 text-[11px] font-semibold text-red-800 ring-1 ring-inset ring-red-600/30';
  if (ratio > 0.2)
    return 'inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800 ring-1 ring-inset ring-amber-500/30';
  return 'inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800 ring-1 ring-inset ring-emerald-600/20';
}
</script>
