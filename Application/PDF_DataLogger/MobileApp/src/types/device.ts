export interface BLEDevice {
  id: string;
  name: string;
  rssi: number;
  advertising?: {
    manufacturerData?: {
      companyId: number;
      data: number[];
    };
    serviceUUIDs?: string[];
  };
}

export interface DeviceInfo {
  id: string;
  name: string;
  measurementInterval: number; // minutes
  tempUnit: 'C' | 'F';
  startTime: number; // Unix timestamp
  totalRecords: number;
  maxTempAlarm: number;
  minTempAlarm: number;
  maxHumiAlarm: number;
  minHumiAlarm: number;
  batteryLevel?: number; // 0-100%
  firmwareVersion?: string;
}

export interface LiveData {
  temperature: number;
  humidity: number;
  timestamp: number;
}

export enum ConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTING = 'disconnecting',
}

export enum DeviceStatus {
  FACTORY = 0,
  NORMAL = 1,
  USB = 2,
}
