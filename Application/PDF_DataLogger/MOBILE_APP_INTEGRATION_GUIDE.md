# Temperature & Humidity DataLogger - Mobile App Integration Guide

## Overview

This guide explains how to integrate the CH592 PDF DataLogger with a React Native Android mobile application to read stored temperature and humidity logs via BLE (Bluetooth Low Energy).

## Table of Contents

1. [System Architecture](#system-architecture)
2. [BLE Protocol Specification](#ble-protocol-specification)
3. [Data Format & Storage](#data-format--storage)
4. [React Native Integration](#react-native-integration)
5. [Example Implementation](#example-implementation)
6. [Troubleshooting](#troubleshooting)

---

## System Architecture

### Hardware Components
- **Microcontroller**: CH592 (RISC-V based BLE MCU)
- **Sensor**: AHT20 (Temperature & Humidity sensor)
- **Storage**: Internal Flash + Optional SPI Flash
- **Communication**: BLE 5.0 / USB

### Data Flow
```
AHT20 Sensor → CH592 MCU → Flash Storage → BLE/USB → Mobile App
```

---

## BLE Protocol Specification

### Device Information

- **Device Name**: `Temp&Humi Logger`
- **Service UUID**: `0xFFE0`
- **Advertising Interval**: 1000ms (1 second)
- **Connection Parameters**:
  - Min Connection Interval: 7.5ms
  - Max Connection Interval: 125ms
  - Slave Latency: 0
  - Connection Timeout: 1s

### GATT Service & Characteristics

The DataLogger uses a custom GATT service with the following characteristics:

#### Service: `0xFFE0` (Simple Profile Service)

| Characteristic | UUID   | Properties | Length | Description |
|----------------|--------|------------|--------|-------------|
| CHAR3          | 0xFFE3 | Write      | 1 byte | Command/Control characteristic |
| CHAR4          | 0xFFE4 | Notify     | 1+ bytes | Data notification characteristic |

### Advertising Data Format

The device advertises temperature and humidity in the scan response data:

```javascript
// Scan Response Data Structure
{
  name: "Temp&Humi Logger",  // Device name (17 bytes)
  manufacturerData: {
    companyId: 0x07D7,        // WCH Company ID
    temperature: float32,      // Current temperature (4 bytes)
    humidity: float32          // Current humidity (4 bytes)
  }
}
```

**Note**: Temperature and humidity values in advertising data are little-endian float32 values.

---

## Data Format & Storage

### Device Configuration

The device stores configuration in flash memory:

```c
typedef struct {
  uint16_t MeasureInterval;   // Measurement interval in minutes (default: 6)
  uint8_t  TempUnit;          // 0: Celsius, 1: Fahrenheit
  float    MaxTempAlarm;      // Upper temperature limit (default: 35.0°C)
  float    MinTempAlarm;      // Lower temperature limit (default: -10.0°C)
  float    MaxHumiAlarm;      // Upper humidity limit (default: 90.0%)
  float    MinHumiAlarm;      // Lower humidity limit (default: 30.0%)
} PDF_PARAM_t;

typedef struct {
  uint16_t Year;              // e.g., 2023
  uint8_t  Month;             // 1-12
  uint8_t  Day;               // 1-31
  uint8_t  Hour;              // 0-23
  uint8_t  Minute;            // 0-59
  uint8_t  Second;            // 0-59
} START_TIME_t;
```

### Measurement Data Storage

- **Flash Address**: 0x41800 (268KB offset)
- **Total Size**: 180KB
- **Single Record**: 4 bytes (2 bytes temperature + 2 bytes humidity)
- **Max Records**: 46,080 measurements
- **Data Encoding**:
  - Temperature: `int16_t` (value * 100, e.g., 25.67°C → 2567)
  - Humidity: `int16_t` (value * 100, e.g., 65.43% → 6543)

### Calculating Timestamps

Since individual measurements don't have timestamps, calculate them based on:
```javascript
recordTimestamp = startTime + (recordIndex * measurementInterval * 60 * 1000);
```

Where:
- `startTime`: Device start time (from device info)
- `recordIndex`: Index of the measurement (0-based)
- `measurementInterval`: Time between measurements in minutes
- Result is in milliseconds

---

## React Native Integration

### Required Packages

```bash
npm install react-native-ble-manager
npm install react-native-permissions
```

### Permissions (Android)

Add to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.BLUETOOTH"/>
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN"/>
<uses-permission android:name="android.permission.BLUETOOTH_SCAN"/>
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT"/>
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>
```

---

## Example Implementation

### 1. Initialize BLE Manager

```javascript
import BleManager from 'react-native-ble-manager';
import { NativeEventEmitter, NativeModules } from 'react-native';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

// Initialize
BleManager.start({ showAlert: false })
  .then(() => {
    console.log('BLE Manager initialized');
  });
```

### 2. Scan for DataLogger

```javascript
const SERVICE_UUID = 'FFE0';
const DEVICE_NAME = 'Temp&Humi Logger';

// Start scanning
BleManager.scan([], 5, true)
  .then(() => {
    console.log('Scanning...');
  });

// Listen for discovered devices
bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', (peripheral) => {
  if (peripheral.name === DEVICE_NAME) {
    console.log('Found DataLogger:', peripheral);
    // Stop scanning and connect
    BleManager.stopScan();
    connectToDevice(peripheral.id);
  }
});
```

### 3. Parse Advertising Data

```javascript
function parseAdvertisingData(peripheral) {
  if (!peripheral.advertising || !peripheral.advertising.manufacturerData) {
    return null;
  }

  const data = peripheral.advertising.manufacturerData;

  // Skip company ID (2 bytes) and parse temperature & humidity
  if (data.bytes && data.bytes.length >= 10) {
    const bytes = data.bytes;

    // Parse float32 values (little-endian)
    const tempBytes = bytes.slice(2, 6);
    const humiBytes = bytes.slice(6, 10);

    const temperature = new Float32Array(
      new Uint8Array(tempBytes).buffer
    )[0];

    const humidity = new Float32Array(
      new Uint8Array(humiBytes).buffer
    )[0];

    return { temperature, humidity };
  }

  return null;
}
```

### 4. Connect to Device

```javascript
async function connectToDevice(peripheralId) {
  try {
    await BleManager.connect(peripheralId);
    console.log('Connected to device');

    // Retrieve services
    const peripheralInfo = await BleManager.retrieveServices(peripheralId);
    console.log('Services retrieved:', peripheralInfo);

    // Enable notifications for CHAR4
    await enableNotifications(peripheralId);

  } catch (error) {
    console.error('Connection error:', error);
  }
}
```

### 5. Enable Notifications

```javascript
const SERVICE_UUID = 'FFE0';
const CHAR4_UUID = 'FFE4'; // Notification characteristic

async function enableNotifications(peripheralId) {
  try {
    await BleManager.startNotification(
      peripheralId,
      SERVICE_UUID,
      CHAR4_UUID
    );
    console.log('Notifications enabled');

    // Listen for notifications
    bleManagerEmitter.addListener(
      'BleManagerDidUpdateValueForCharacteristic',
      ({ value, peripheral, characteristic }) => {
        if (characteristic === CHAR4_UUID) {
          console.log('Received data:', value);
          parseDataNotification(value);
        }
      }
    );
  } catch (error) {
    console.error('Notification error:', error);
  }
}
```

### 6. Send Commands (Write to CHAR3)

```javascript
const CHAR3_UUID = 'FFE3'; // Write characteristic

async function sendCommand(peripheralId, command) {
  try {
    await BleManager.write(
      peripheralId,
      SERVICE_UUID,
      CHAR3_UUID,
      [command],
      1 // max byte size
    );
    console.log('Command sent:', command);
  } catch (error) {
    console.error('Write error:', error);
  }
}

// Example commands (to be defined based on your protocol)
// sendCommand(peripheralId, 0x01); // Start logging
// sendCommand(peripheralId, 0x02); // Stop logging
// sendCommand(peripheralId, 0x03); // Request data dump
```

### 7. Parse Received Data

```javascript
function parseDataNotification(data) {
  // Data format depends on your implementation
  // Example: If receiving temperature/humidity records

  if (data.length >= 4) {
    // Parse int16 values
    const tempRaw = (data[1] << 8) | data[0];
    const humiRaw = (data[3] << 8) | data[2];

    // Convert to actual values
    const temperature = tempRaw / 100.0;
    const humidity = humiRaw / 100.0;

    console.log(`Temp: ${temperature}°C, Humidity: ${humidity}%`);

    return { temperature, humidity };
  }

  return null;
}
```

### 8. Request Historical Data

```javascript
async function requestHistoricalData(peripheralId) {
  // This is a conceptual example - actual implementation depends
  // on your firmware protocol

  try {
    // Step 1: Request device info (total records, start time, etc.)
    await sendCommand(peripheralId, 0x10); // Request device info command

    // Step 2: Wait for device info response via notification
    // ...

    // Step 3: Request data in chunks
    const CHUNK_SIZE = 100; // records per chunk
    const totalRecords = 1000; // from device info

    for (let i = 0; i < totalRecords; i += CHUNK_SIZE) {
      await sendCommand(peripheralId, 0x20); // Request data chunk
      // Send chunk parameters (start index, count)
      await BleManager.write(
        peripheralId,
        SERVICE_UUID,
        CHAR3_UUID,
        [i & 0xFF, (i >> 8) & 0xFF, CHUNK_SIZE],
        3
      );

      // Wait for data via notifications
      await new Promise(resolve => setTimeout(resolve, 100));
    }

  } catch (error) {
    console.error('Data request error:', error);
  }
}
```

### 9. Complete React Native Component Example

```javascript
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Button,
  FlatList,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import BleManager from 'react-native-ble-manager';
import { NativeEventEmitter, NativeModules } from 'react-native';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const SERVICE_UUID = 'FFE0';
const CHAR3_UUID = 'FFE3';
const CHAR4_UUID = 'FFE4';
const DEVICE_NAME = 'Temp&Humi Logger';

export default function DataLoggerApp() {
  const [isScanning, setIsScanning] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState(null);
  const [measurements, setMeasurements] = useState([]);
  const [currentData, setCurrentData] = useState({ temp: 0, humidity: 0 });

  useEffect(() => {
    // Request permissions
    if (Platform.OS === 'android' && Platform.Version >= 23) {
      PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]);
    }

    // Initialize BLE
    BleManager.start({ showAlert: false });

    // Set up listeners
    const discoverListener = bleManagerEmitter.addListener(
      'BleManagerDiscoverPeripheral',
      handleDiscoverPeripheral
    );

    const updateListener = bleManagerEmitter.addListener(
      'BleManagerDidUpdateValueForCharacteristic',
      handleUpdateValue
    );

    return () => {
      discoverListener.remove();
      updateListener.remove();
    };
  }, []);

  const handleDiscoverPeripheral = (peripheral) => {
    if (peripheral.name === DEVICE_NAME) {
      console.log('Found device:', peripheral);
      // Parse advertising data for current readings
      const liveData = parseAdvertisingData(peripheral);
      if (liveData) {
        setCurrentData(liveData);
      }
    }
  };

  const handleUpdateValue = ({ value, peripheral, characteristic }) => {
    if (characteristic === CHAR4_UUID) {
      const data = parseDataNotification(value);
      if (data) {
        setMeasurements(prev => [...prev, data]);
      }
    }
  };

  const startScan = () => {
    setIsScanning(true);
    BleManager.scan([], 10, false)
      .then(() => {
        console.log('Scan started');
      })
      .catch(err => console.error('Scan error:', err))
      .finally(() => {
        setTimeout(() => setIsScanning(false), 10000);
      });
  };

  const connectDevice = async (deviceId) => {
    try {
      await BleManager.connect(deviceId);
      await BleManager.retrieveServices(deviceId);
      await BleManager.startNotification(deviceId, SERVICE_UUID, CHAR4_UUID);
      setConnectedDevice(deviceId);
      console.log('Connected and notifications enabled');
    } catch (error) {
      console.error('Connection error:', error);
    }
  };

  const parseAdvertisingData = (peripheral) => {
    // Implementation from example above
    // ...
  };

  const parseDataNotification = (data) => {
    // Implementation from example above
    // ...
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
        Temperature & Humidity Logger
      </Text>

      <View style={{ marginTop: 20 }}>
        <Text>Current Reading:</Text>
        <Text>Temperature: {currentData.temp.toFixed(2)}°C</Text>
        <Text>Humidity: {currentData.humidity.toFixed(2)}%</Text>
      </View>

      <Button
        title={isScanning ? 'Scanning...' : 'Scan for Device'}
        onPress={startScan}
        disabled={isScanning}
      />

      {connectedDevice && (
        <Text style={{ color: 'green', marginTop: 10 }}>
          Connected to device
        </Text>
      )}

      <FlatList
        data={measurements}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={{ padding: 10, borderBottomWidth: 1 }}>
            <Text>Record #{index + 1}</Text>
            <Text>Temperature: {item.temperature}°C</Text>
            <Text>Humidity: {item.humidity}%</Text>
            <Text>Time: {new Date(item.timestamp).toLocaleString()}</Text>
          </View>
        )}
      />
    </View>
  );
}
```

---

## Troubleshooting

### Common Issues

#### 1. Device Not Found During Scan
- **Check**: Ensure Bluetooth is enabled on phone
- **Check**: Device is powered on and advertising
- **Check**: Location permissions granted (required for BLE on Android)
- **Solution**: Move closer to the device (within 10 meters)

#### 2. Connection Fails
- **Check**: Only one connection at a time is supported
- **Check**: Device is not connected to another phone/computer
- **Solution**: Reset the device or wait for connection timeout

#### 3. Notifications Not Received
- **Check**: Notifications were properly enabled
- **Check**: MTU size is sufficient for data transfer
- **Solution**: Re-enable notifications or reconnect

#### 4. Incorrect Data Values
- **Check**: Byte order (little-endian vs big-endian)
- **Check**: Data type interpretation (int16 vs float32)
- **Solution**: Verify parsing logic matches firmware encoding

### Debug Tips

```javascript
// Enable verbose BLE logging
BleManager.enableBluetooth()
  .then(() => {
    console.log('Bluetooth enabled');
  });

// Log all discovered devices
bleManagerEmitter.addListener('BleManagerDiscoverPeripheral', (device) => {
  console.log('Discovered:', JSON.stringify(device, null, 2));
});

// Monitor connection state
bleManagerEmitter.addListener('BleManagerConnectPeripheral', (args) => {
  console.log('Connected:', args);
});

bleManagerEmitter.addListener('BleManagerDisconnectPeripheral', (args) => {
  console.log('Disconnected:', args);
});
```

---

## Additional Resources

### USB Mode Alternative

If BLE connection is problematic, the device can also operate in USB mode where it appears as a USB mass storage device with PDF files containing the logged data.

### Firmware Customization

To modify the BLE protocol or add custom commands, edit:
- `Profile/gattprofile.c` - GATT service definitions
- `APP/peripheral.c` - Characteristic value change callbacks
- `Driver/FLASH/flash_info.c` - Data storage operations

### Data Export Format

Consider implementing these export formats in your mobile app:
- CSV: `timestamp,temperature,humidity`
- JSON: `[{timestamp, temperature, humidity}, ...]`
- SQLite: For local storage and querying

---

## Summary

This DataLogger provides a simple BLE interface for reading temperature and humidity measurements. The key integration points are:

1. **Scan** for device name "Temp&Humi Logger"
2. **Parse** advertising data for live readings
3. **Connect** to Service UUID 0xFFE0
4. **Enable** notifications on Characteristic 0xFFE4
5. **Write** commands to Characteristic 0xFFE3
6. **Receive** data via notifications
7. **Calculate** timestamps based on start time and measurement interval

For a production app, implement proper error handling, connection state management, and data synchronization logic.
