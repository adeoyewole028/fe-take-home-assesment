import { describe, it, expect } from 'vitest';
import { fetchBatterySamples } from '@/services/batteryDataService';

describe('batteryDataService', () => {
  it('returns an array of samples', async () => {
    const samples = await fetchBatterySamples();
    expect(Array.isArray(samples)).toBe(true);
    if (samples.length) {
      const s = samples[0];
      expect(Object.prototype.hasOwnProperty.call(s, 'serialNumber')).toBe(true);
      expect(Object.prototype.hasOwnProperty.call(s, 'batteryLevel')).toBe(true);
      expect(Object.prototype.hasOwnProperty.call(s, 'timestamp')).toBe(true);
    }
  });
});
