<template>
  <div class="border-t border-gray-200">
    <table class="min-w-full text-[12px] md:text-xs relative">
      <thead class="bg-gray-200/60 text-gray-700">
        <tr>
          <th class="px-3 py-2 text-left font-semibold">Serial</th>
          <th class="px-3 py-2 text-left font-semibold">Avg Daily Drain</th>
          <th class="px-3 py-2 text-left font-semibold">Status</th>
          <th class="px-3 py-2 text-left font-semibold">Intervals</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="d in devices"
          :key="d.serialNumber"
          class="odd:bg-white even:bg-gray-50/60 hover:bg-indigo-50/60 transition-colors relative cursor-help"
          @mouseenter="hover(d)"
          @mouseleave="unhover"
          @focusin="hover(d)"
          @focusout="unhover"
          tabindex="0"
          :aria-describedby="`tooltip-${d.serialNumber}`"
        >
          <td class="px-3 py-1.5 font-mono text-[11px] tracking-tight text-gray-800">
            {{ d.serialNumber }}
          </td>
          <td class="px-3 py-1.5">
            <span :class="drainClass(d)">{{ formatDrain(d.averageDailyDrainPct) }}</span>
          </td>
          <td class="px-3 py-1.5">
            <span
              v-if="d.averageDailyDrainPct === null"
              class="inline-flex rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600 ring-1 ring-inset ring-gray-300"
              >Unknown</span
            >
            <span v-else :class="classificationBadgeClass(classify(d).tier)">{{
              classify(d).tier
            }}</span>
          </td>
          <td class="px-3 py-1.5 text-gray-700">{{ d.intervalsConsidered }}</td>

          <transition name="fade">
            <div
              v-if="hovered && hovered.serialNumber === d.serialNumber"
              :id="`tooltip-${d.serialNumber}`"
              role="tooltip"
              class="absolute z-20 -top-2 left-44 md:left-80 translate-y-[-100%] w-72 rounded-md border border-gray-200 bg-white px-3 py-2 shadow-lg ring-1 ring-black/5"
            >
              <div class="flex items-start gap-2">
                <div
                  class="mt-0.5 h-2 w-2 rounded-full"
                  :class="classificationDotClass(classify(d).tier)"
                ></div>
                <div class="flex-1">
                  <p class="text-[11px] font-semibold tracking-wide text-gray-800">
                    {{ d.serialNumber }}
                  </p>
                  <p class="text-[11px] text-gray-600">
                    Status:
                    <span :class="classificationTextClass(classify(d).tier)">{{
                      classify(d).tier
                    }}</span>
                    <span v-if="d.averageDailyDrainPct !== null">
                      ({{ formatDrain(d.averageDailyDrainPct) }}/day)</span
                    >
                  </p>
                  <p class="mt-1 text-[10px] leading-snug text-gray-500">
                    {{ classify(d).description }}
                  </p>
                  <p v-if="d.averageDailyDrainPct === null" class="mt-1 text-[10px] text-amber-600">
                    Insufficient data (only one or no valid interval).
                  </p>
                  <div class="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[10px] text-gray-600">
                    <span class="font-medium text-gray-700">Intervals:</span
                    ><span>{{ d.intervalsConsidered }}</span>
                    <span class="font-medium text-gray-700">Unhealthy rule:</span
                    ><span>&gt; 30% / day</span>
                    <span class="font-medium text-gray-700">Tier logic:</span
                    ><span>20/30/40 thresholds</span>
                  </div>
                </div>
              </div>
            </div>
          </transition>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script setup lang="ts">
import type { DeviceBatteryStat } from '@/models/battery';
import { ref } from 'vue';

defineProps<{ devices: DeviceBatteryStat[] }>();

const hovered = ref<DeviceBatteryStat | null>(null);

function hover(d: DeviceBatteryStat) {
  hovered.value = d;
}
function unhover() {
  hovered.value = null;
}

function formatDrain(v: number | null) {
  return v == null ? '—' : v.toFixed(1) + '%';
}
function drainClass(d: DeviceBatteryStat) {
  if (d.averageDailyDrainPct == null) return 'text-gray-500';
  if (d.unhealthy) return 'font-semibold text-red-700';
  return 'text-gray-800';
}

type Tier = 'Healthy' | 'Warning' | 'Critical' | 'Unknown';

function classify(d: DeviceBatteryStat): { tier: Tier; description: string } {
  const v = d.averageDailyDrainPct;
  if (v == null)
    return { tier: 'Unknown', description: 'Not enough data to determine consumption pattern.' };
  if (v < 20)
    return {
      tier: 'Healthy',
      description: 'Battery usage well within expected performance range.'
    };
  if (v < 30)
    return { tier: 'Warning', description: 'Above normal drain. Monitor; may degrade soon.' };
  return { tier: 'Critical', description: 'Excessive drain. Prioritize replacement visit.' };
}

function classificationBadgeClass(tier: Tier) {
  const base = 'inline-flex rounded-md px-2 py-0.5 text-[11px] ring-1 ring-inset';
  switch (tier) {
    case 'Healthy':
      return base + ' bg-emerald-100 text-emerald-700 ring-emerald-600/20 font-medium';
    case 'Warning':
      return base + ' bg-amber-100 text-amber-700 ring-amber-600/30 font-medium';
    case 'Critical':
      return base + ' bg-red-100 text-red-700 ring-red-600/25 font-semibold';
    default:
      return base + ' bg-gray-100 text-gray-600 ring-gray-300';
  }
}
function classificationDotClass(tier: Tier) {
  switch (tier) {
    case 'Healthy':
      return 'bg-emerald-500';
    case 'Warning':
      return 'bg-amber-500';
    case 'Critical':
      return 'bg-red-600';
    default:
      return 'bg-gray-400';
  }
}
function classificationTextClass(tier: Tier) {
  switch (tier) {
    case 'Healthy':
      return 'text-emerald-700';
    case 'Warning':
      return 'text-amber-700';
    case 'Critical':
      return 'text-red-700';
    default:
      return 'text-gray-600';
  }
}
</script>
<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 120ms ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
