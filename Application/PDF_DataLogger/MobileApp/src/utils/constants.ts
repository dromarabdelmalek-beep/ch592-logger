/**
 * BLE Constants
 */
export const BLE_CONSTANTS = {
  // Service and Characteristic UUIDs
  SERVICE_UUID: 'FFE0',
  CHAR_WRITE_UUID: 'FFE3',
  CHAR_NOTIFY_UUID: 'FFE4',

  // Device identification
  DEVICE_NAME: 'Temp&Humi Logger',
  COMPANY_ID: 0x07D7, // WCH

  // Connection parameters
  SCAN_TIMEOUT: 10000, // 10 seconds
  CONNECTION_TIMEOUT: 5000, // 5 seconds

  // Data transfer
  CHUNK_SIZE: 100, // Records per request
  MAX_RETRIES: 3,
  DELAY_BETWEEN_CHUNKS: 50, // milliseconds
  TIMEOUT_PER_CHUNK: 5000, // milliseconds
};

/**
 * Command Codes (for CHAR_WRITE)
 */
export const BLE_COMMANDS = {
  GET_DEVICE_INFO: 0x10,
  SET_INTERVAL: 0x11,
  SET_TEMP_UNIT: 0x12,
  GET_DATA_COUNT: 0x20,
  GET_DATA_RANGE: 0x21,
  CLEAR_DATA: 0x30,
  START_LOGGING: 0x40,
  STOP_LOGGING: 0x41,
};

/**
 * Response Codes (from CHAR_NOTIFY)
 */
export const BLE_RESPONSES = {
  DEVICE_INFO: 0x10,
  DATA_COUNT: 0x20,
  DATA_RANGE: 0x21,
  SUCCESS: 0x00,
  ERROR: 0xFF,
};

/**
 * Storage Constants
 */
export const STORAGE_KEYS = {
  THEME: '@theme',
  SETTINGS: '@settings',
  LAST_DEVICE: '@last_device',
  NOTIFICATIONS: '@notifications',
};

/**
 * Database Constants
 */
export const DATABASE = {
  NAME: 'temphumi_logger.db',
  VERSION: 1,
};

/**
 * Chart Constants
 */
export const CHART_CONFIG = {
  POINTS_TO_DISPLAY: 1000, // Max points to render
  DOWNSAMPLE_THRESHOLD: 5000, // Start downsampling above this
  ANIMATION_DURATION: 300, // milliseconds
};

/**
 * Default Settings
 */
export const DEFAULT_SETTINGS = {
  theme: 'auto' as const,
  notificationsEnabled: true,
  autoDownloadOnConnect: false,
  dataRetentionDays: 0, // Keep forever
  chartPreferences: {
    showGrid: true,
    showThresholds: true,
    smoothCurves: true,
    fillArea: true,
    pointsVisible: false,
    defaultTimeRange: 'last_24_hours',
    defaultChartType: 'combined',
  },
  units: {
    temperature: 'C' as const,
    dateFormat: 'yyyy-MM-dd HH:mm:ss',
    timeFormat: '24h' as const,
  },
};

/**
 * Time Range Presets (milliseconds)
 */
export const TIME_RANGES = {
  LAST_6_HOURS: 6 * 60 * 60 * 1000,
  LAST_24_HOURS: 24 * 60 * 60 * 1000,
  LAST_7_DAYS: 7 * 24 * 60 * 60 * 1000,
  LAST_30_DAYS: 30 * 24 * 60 * 60 * 1000,
};

/**
 * Validation Constants
 */
export const VALIDATION = {
  MIN_INTERVAL: 1, // minutes
  MAX_INTERVAL: 60, // minutes
  MIN_TEMP: -50, // Celsius
  MAX_TEMP: 100, // Celsius
  MIN_HUMIDITY: 0, // percent
  MAX_HUMIDITY: 100, // percent
};

/**
 * Export Constants
 */
export const EXPORT = {
  CSV_SEPARATOR: ',',
  DATE_FORMAT: 'yyyy-MM-dd HH:mm:ss',
  FILE_PREFIX: 'TempHumiLog_',
  MAX_EXPORT_RECORDS: 100000,
};
