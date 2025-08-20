import raw from '@/data/battery.json';
import type { BatterySample } from '@/models/battery';

export async function fetchBatterySamples(): Promise<BatterySample[]> {
  return Promise.resolve(raw as unknown as BatterySample[]);
}
