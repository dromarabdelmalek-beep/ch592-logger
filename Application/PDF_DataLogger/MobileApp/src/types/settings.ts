export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  notificationsEnabled: boolean;
  autoDownloadOnConnect: boolean;
  dataRetentionDays: number; // 0 = keep forever
  chartPreferences: ChartPreferences;
  units: UnitPreferences;
}

export interface ChartPreferences {
  showGrid: boolean;
  showThresholds: boolean;
  smoothCurves: boolean;
  fillArea: boolean;
  pointsVisible: boolean;
  defaultTimeRange: string; // TimeRangePreset
  defaultChartType: ChartType;
}

export enum ChartType {
  TEMPERATURE = 'temperature',
  HUMIDITY = 'humidity',
  COMBINED = 'combined',
}

export interface UnitPreferences {
  temperature: 'C' | 'F';
  dateFormat: string;
  timeFormat: '12h' | '24h';
}

export interface NotificationSettings {
  enabled: boolean;
  temperatureAlerts: boolean;
  humidityAlerts: boolean;
  connectionAlerts: boolean;
  memoryFullAlerts: boolean;
}

export interface ExportFormat {
  type: 'csv' | 'json';
  includeHeaders: boolean;
  dateFormat: string;
  separator?: string; // For CSV
}
