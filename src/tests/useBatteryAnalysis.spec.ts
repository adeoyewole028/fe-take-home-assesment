import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useBatteryAnalysis } from '@/composables/useBatteryAnalysis';
import * as svc from '@/services/batteryDataService';
import type { BatterySample } from '@/models/battery';

function sample(level: number, iso: string, serial = 'DEV1', academyId = 10): BatterySample {
  return { batteryLevel: level, timestamp: iso, employeeId: 'E1', serialNumber: serial, academyId };
}

describe('useBatteryAnalysis', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('loads and aggregates data', async () => {
    const now = Date.parse('2024-01-01T00:00:00Z');
    vi.spyOn(svc, 'fetchBatterySamples').mockResolvedValue([
      sample(1, new Date(now).toISOString(), 'DEV1', 10),
      sample(0.9, new Date(now + 6 * 3600 * 1000).toISOString(), 'DEV1', 10),
      sample(1, new Date(now).toISOString(), 'DEV2', 20),
      sample(0.7, new Date(now + 24 * 3600 * 1000).toISOString(), 'DEV2', 20)
    ]);

    const { load, loading, error, summaries, totalDevices, totalUnhealthy, schoolsToVisit } =
      useBatteryAnalysis();
    expect(loading.value).toBe(false);
    await load();
    expect(loading.value).toBe(false);
    expect(error.value).toBeNull();
    expect(summaries.value.length).toBe(2); // two schools
    expect(totalDevices.value).toBe(2);
    expect(totalUnhealthy.value).toBeGreaterThanOrEqual(0);
    expect(schoolsToVisit.value).toBeLessThanOrEqual(2);
  });

  it('handles service error', async () => {
    vi.spyOn(svc, 'fetchBatterySamples').mockRejectedValue(new Error('boom'));
    const { load, error } = useBatteryAnalysis();
    await load();
    expect(error.value).toBe('boom');
  });
});
