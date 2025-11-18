export interface MeasurementRecord {
  id?: number; // Database ID
  deviceId: string;
  timestamp: number; // Unix timestamp
  temperature: number;
  humidity: number;
  recordIndex: number; // Original index on device
  downloadedAt?: number;
}

export interface MeasurementStatistics {
  count: number;
  minTemp: number;
  maxTemp: number;
  avgTemp: number;
  minHumi: number;
  maxHumi: number;
  avgHumi: number;
  minTempTime: number;
  maxTempTime: number;
  minHumiTime: number;
  maxHumiTime: number;
}

export interface DateRange {
  start: number; // Unix timestamp
  end: number; // Unix timestamp
}

export enum TimeRangePreset {
  LAST_6_HOURS = 'last_6_hours',
  LAST_24_HOURS = 'last_24_hours',
  LAST_7_DAYS = 'last_7_days',
  LAST_30_DAYS = 'last_30_days',
  ALL_TIME = 'all_time',
  CUSTOM = 'custom',
}

export interface ChartDataPoint {
  x: number; // timestamp
  y: number; // value
}

export interface ChartData {
  temperature: ChartDataPoint[];
  humidity: ChartDataPoint[];
}

export enum AlarmStatus {
  NORMAL = 'normal',
  WARNING = 'warning',
  ALARM = 'alarm',
}

export interface AlarmCheck {
  temperature: AlarmStatus;
  humidity: AlarmStatus;
  message?: string;
}
