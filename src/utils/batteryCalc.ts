import type { BatterySample, DeviceBatteryStat, SchoolBatterySummary } from '@/models/battery';
import { UNHEALTHY_THRESHOLD } from '@/models/battery';

interface EnrichedSample extends BatterySample {
  ts: number;
}

export function calculateDeviceStat(samples: BatterySample[]): DeviceBatteryStat {
  if (samples.length < 2) {
    return {
      serialNumber: samples[0]?.serialNumber || 'unknown',
      academyId: samples[0]?.academyId ?? -1,
      averageDailyDrainPct: null,
      unhealthy: false,
      intervalsConsidered: 0
    };
  }

  const enriched: EnrichedSample[] = samples
    .map((s) => ({ ...s, ts: Date.parse(s.timestamp) }))
    .sort((a, b) => a.ts - b.ts);

  let weightedSum = 0; // sum of (drainPerDay * hours)
  let totalHours = 0;
  let considered = 0;

  for (let i = 0; i < enriched.length - 1; i++) {
    const current = enriched[i];
    const next = enriched[i + 1];
    const deltaLevel = current.batteryLevel - next.batteryLevel;
    const deltaHours = (next.ts - current.ts) / 3_600_000;
    if (deltaHours <= 0) continue;
    if (deltaLevel <= 0) continue; // charging

    const drainPerDay = ((deltaLevel * 100) / deltaHours) * 24; // fraction -> percent
    weightedSum += drainPerDay * deltaHours;
    totalHours += deltaHours;
    considered++;
  }

  if (totalHours === 0 || considered === 0) {
    return {
      serialNumber: enriched[0].serialNumber,
      academyId: enriched[0].academyId,
      averageDailyDrainPct: null,
      unhealthy: false,
      intervalsConsidered: 0
    };
  }

  const avg = weightedSum / totalHours;
  return {
    serialNumber: enriched[0].serialNumber,
    academyId: enriched[0].academyId,
    averageDailyDrainPct: avg,
    unhealthy: avg > UNHEALTHY_THRESHOLD,
    intervalsConsidered: considered
  };
}

export function aggregateBySchool(samples: BatterySample[]): SchoolBatterySummary[] {
  const byDevice: Record<string, BatterySample[]> = {};
  for (const s of samples) {
    (byDevice[s.serialNumber] ||= []).push(s);
  }

  const deviceStats: DeviceBatteryStat[] = Object.values(byDevice).map(calculateDeviceStat);

  const bySchool: Record<number, DeviceBatteryStat[]> = {};
  for (const stat of deviceStats) {
    (bySchool[stat.academyId] ||= []).push(stat);
  }

  const summaries: SchoolBatterySummary[] = Object.entries(bySchool).map(
    ([academyIdStr, stats]) => {
      const academyId = Number(academyIdStr);
      const unhealthy = stats.filter((s) => s.unhealthy);
      return {
        academyId,
        unhealthyCount: unhealthy.length,
        totalDevices: stats.length,
        devices: [...stats].sort(
          (a, b) => (b.averageDailyDrainPct ?? -1) - (a.averageDailyDrainPct ?? -1)
        )
      };
    }
  );

  return summaries.sort((a, b) => b.unhealthyCount - a.unhealthyCount);
}
