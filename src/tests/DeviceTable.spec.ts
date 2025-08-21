import { render, screen } from '@testing-library/vue';
import { describe, it, expect } from 'vitest';
import { axe } from 'jest-axe';
import DeviceTable from '@/components/DeviceTable.vue';
import type { DeviceBatteryStat } from '@/models/battery';

function row(partial: Partial<DeviceBatteryStat>): DeviceBatteryStat {
  return {
    serialNumber: 'S',
    academyId: 1,
    averageDailyDrainPct: null,
    unhealthy: false,
    intervalsConsidered: 0,
    ...partial
  };
}

describe('DeviceTable', () => {
  it('renders classification tiers', async () => {
    const devices: DeviceBatteryStat[] = [
      row({ serialNumber: 'A', averageDailyDrainPct: 10, unhealthy: false }), // Healthy
      row({ serialNumber: 'B', averageDailyDrainPct: 25, unhealthy: false }), // Warning
      row({ serialNumber: 'C', averageDailyDrainPct: 30, unhealthy: true }), // Critical
      row({ serialNumber: 'D', averageDailyDrainPct: null, unhealthy: false }) // Unknown
    ];
  const { container } = render(DeviceTable, { props: { devices } });
    expect(await screen.findByText('Healthy')).toBeTruthy();
    expect(screen.getByText('Warning')).toBeTruthy();
    expect(screen.getByText('Critical')).toBeTruthy();
    expect(screen.getByText('Unknown')).toBeTruthy();

  // snapshot main table markup (stable structure)
  expect(container.querySelector('table')).toMatchSnapshot();

  // accessibility audit (zero violations expected)
  const results = await axe(container as unknown as HTMLElement);
  expect(results.violations.length).toBe(0);
  });
});
