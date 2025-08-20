export interface BatterySample {
  academyId: number;
  batteryLevel: number; // 0-1 range
  employeeId: string;
  serialNumber: string;
  timestamp: string; // ISO string
}

export interface DeviceBatteryStat {
  serialNumber: string;
  academyId: number;
  averageDailyDrainPct: number | null; // null => unknown
  unhealthy: boolean; // > 30% daily drain
  intervalsConsidered: number;
}

export interface SchoolBatterySummary {
  academyId: number;
  unhealthyCount: number;
  totalDevices: number;
  devices: DeviceBatteryStat[];
}

export const UNHEALTHY_THRESHOLD = 30; // percent per day
