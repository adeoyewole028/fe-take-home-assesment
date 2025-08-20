import { render, screen, fireEvent } from '@testing-library/vue';
import { describe, it, expect } from 'vitest';
import SchoolList from '@/components/SchoolList.vue';
import type { SchoolBatterySummary, DeviceBatteryStat } from '@/models/battery';

function device(partial: Partial<DeviceBatteryStat>): DeviceBatteryStat {
  return {
    serialNumber: 'S',
    academyId: 1,
    averageDailyDrainPct: 35,
    unhealthy: true,
    intervalsConsidered: 2,
    ...partial
  };
}

function summary(id: number, devs: DeviceBatteryStat[]): SchoolBatterySummary {
  return {
    academyId: id,
    unhealthyCount: devs.filter(d => d.unhealthy).length,
    totalDevices: devs.length,
    devices: devs
  };
}

describe('SchoolList', () => {
  it('toggles a single row via button click (aria-expanded)', async () => {
    const summaries = [summary(1, [device({ serialNumber: 'X' })])];
    render(SchoolList, { props: { summaries, error: null } });
    const btn = await screen.findByRole('button', { name: /show/i });
  expect(btn.getAttribute('aria-expanded')).toBe('false');
    await fireEvent.click(btn);
  expect(btn.getAttribute('aria-expanded')).toBe('true');
  });

  it('expands all when expandTrigger increments', async () => {
    const summaries = [
      summary(1, [device({ serialNumber: 'X' })]),
      summary(2, [device({ serialNumber: 'Y' })])
    ];
    const { rerender } = render(SchoolList, { props: { summaries, error: null, expandTrigger: 0 } });
    const buttonsBefore = screen.getAllByRole('button', { name: /show/i });
  buttonsBefore.forEach(b => expect(b.getAttribute('aria-expanded')).toBe('false'));
    await rerender({ summaries, error: null, expandTrigger: 1 });
    const buttonsAfter = screen.getAllByRole('button');
  buttonsAfter.forEach(b => expect(b.getAttribute('aria-expanded')).toBe('true'));
  });

  it('collapses rows via user interaction (click Hide buttons)', async () => {
    const summaries = [
      summary(1, [device({ serialNumber: 'X' })]),
      summary(2, [device({ serialNumber: 'Y' })])
    ];
    const { rerender } = render(SchoolList, { props: { summaries, error: null, expandTrigger: 0 } });
    // trigger expand by incrementing expandTrigger
    await rerender({ summaries, error: null, expandTrigger: 1 });
    const buttons = screen.getAllByRole('button');
    buttons.forEach(b => expect(b.getAttribute('aria-expanded')).toBe('true'));
    for (const b of buttons) await fireEvent.click(b);
    screen.getAllByRole('button').forEach(b => expect(b.getAttribute('aria-expanded')).toBe('false'));
  });
});
