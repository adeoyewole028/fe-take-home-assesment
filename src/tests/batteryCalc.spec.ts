import { describe, it, expect } from 'vitest';
import { calculateDeviceStat, aggregateBySchool } from '@/utils/batteryCalc';
import type { BatterySample } from '@/models/battery';

function sample(partial: Partial<BatterySample>): BatterySample {
  return {
    academyId: 1,
    batteryLevel: 1,
    employeeId: 'E',
    serialNumber: 'S',
    timestamp: new Date().toISOString(),
    ...partial
  };
}

describe('calculateDeviceStat', () => {
  it('returns unknown for single reading', () => {
    const stat = calculateDeviceStat([sample({ batteryLevel: 1 })]);
    expect(stat.averageDailyDrainPct).toBeNull();
  });

  it('computes simple drain across interval', () => {
    const start = Date.parse('2024-01-01T00:00:00Z');
    const end = Date.parse('2024-01-01T12:00:00Z');
    const stat = calculateDeviceStat([
      sample({ batteryLevel: 1, timestamp: new Date(start).toISOString() }),
      sample({ batteryLevel: 0.9, timestamp: new Date(end).toISOString() })
    ]);
    expect(stat.averageDailyDrainPct && Math.round(stat.averageDailyDrainPct)).toBe(20); // 10% over 12h => 20% per day
  });

  it('ignores charging intervals', () => {
    const t0 = Date.parse('2024-01-01T00:00:00Z');
    const t1 = Date.parse('2024-01-01T06:00:00Z');
    const t2 = Date.parse('2024-01-01T12:00:00Z');
    const stat = calculateDeviceStat([
      sample({ batteryLevel: 1, timestamp: new Date(t0).toISOString() }),
      sample({ batteryLevel: 0.8, timestamp: new Date(t1).toISOString() }),
      sample({ batteryLevel: 0.85, timestamp: new Date(t2).toISOString() })
    ]);
    expect(stat.averageDailyDrainPct && Math.round(stat.averageDailyDrainPct)).toBe(80); // 20% over 6h => 80% per day
  });
});

describe('aggregateBySchool', () => {
  it('returns empty array for empty input', () => {
    expect(aggregateBySchool([])).toEqual([]);
  });
});
