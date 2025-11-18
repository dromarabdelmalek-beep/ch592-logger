# BLE Protocol Quick Reference

## Device Identity

```
Device Name:     Temp&Humi Logger
Service UUID:    FFE0
Company ID:      0x07D7 (WCH)
```

## GATT Service Structure

```
Service: 0xFFE0 (Simple Profile)
│
├── Characteristic 0xFFE3 (CHAR3)
│   ├── Properties: WRITE
│   ├── Length: 1+ bytes
│   └── Purpose: Send commands to device
│
└── Characteristic 0xFFE4 (CHAR4)
    ├── Properties: NOTIFY
    ├── Length: Variable
    └── Purpose: Receive data from device
```

## Advertising Data Format

### Scan Response Packet

```
Offset | Length | Description
-------|--------|-------------
0      | 2      | Length + Type (0x11, GAP_ADTYPE_LOCAL_NAME_COMPLETE)
2      | 16     | Device Name: "Temp&Humi Logger"
18     | 1      | Length (0x0B)
19     | 1      | Type (GAP_ADTYPE_MANUFACTURER_SPECIFIC)
20     | 2      | Company ID: 0x07D7 (little-endian)
22     | 4      | Temperature: float32 (little-endian)
26     | 4      | Humidity: float32 (little-endian)
```

### Parsing Advertising Data (JavaScript)

```javascript
function parseManufacturerData(bytes) {
  // bytes is Uint8Array

  // Skip company ID (bytes 0-1)
  const tempBytes = bytes.slice(2, 6);
  const humiBytes = bytes.slice(6, 10);

  // Convert to float32 (little-endian)
  const temperature = new DataView(tempBytes.buffer).getFloat32(0, true);
  const humidity = new DataView(humiBytes.buffer).getFloat32(0, true);

  return { temperature, humidity };
}
```

### Parsing Advertising Data (Python)

```python
import struct

def parse_manufacturer_data(data: bytes):
    # data format: company_id(2) + temperature(4) + humidity(4)
    if len(data) < 10:
        return None

    company_id = struct.unpack('<H', data[0:2])[0]
    temperature = struct.unpack('<f', data[2:6])[0]
    humidity = struct.unpack('<f', data[6:10])[0]

    return {
        'company_id': company_id,
        'temperature': temperature,
        'humidity': humidity
    }
```

## Connection Parameters

| Parameter | Value |
|-----------|-------|
| Advertising Interval | 1000 ms (1600 × 0.625ms) |
| Min Connection Interval | 7.5 ms (6 × 1.25ms) |
| Max Connection Interval | 125 ms (100 × 1.25ms) |
| Slave Latency | 0 |
| Connection Timeout | 1000 ms (100 × 10ms) |
| MTU Size | 23 bytes (default) |

## Command Protocol (CHAR3 Write)

Commands are sent by writing to characteristic 0xFFE3.

### Example Commands

**Note**: The actual command protocol needs to be implemented in firmware. Below are suggested command codes:

| Command | Code | Parameters | Description |
|---------|------|------------|-------------|
| Get Device Info | 0x10 | None | Request device configuration |
| Set Interval | 0x11 | uint16 (minutes) | Set measurement interval |
| Set Temp Unit | 0x12 | uint8 (0=°C, 1=°F) | Set temperature unit |
| Get Data Count | 0x20 | None | Request number of stored records |
| Get Data Range | 0x21 | uint16 start, uint16 count | Request specific data range |
| Clear Data | 0x30 | None | Erase all measurement data |
| Start Logging | 0x40 | None | Start data logging |
| Stop Logging | 0x41 | None | Stop data logging |

### Command Format

```
Byte 0:    Command code
Byte 1-N:  Parameters (if any)
```

### Example: Set Measurement Interval to 10 minutes

```javascript
// React Native
await BleManager.write(
  deviceId,
  'FFE0',  // Service UUID
  'FFE3',  // Characteristic UUID
  [0x11, 0x0A, 0x00],  // Command: 0x11, Interval: 10 (little-endian uint16)
  3  // Length
);
```

```python
# Python (using bleak)
await client.write_gatt_char(
    'FFE3',
    bytes([0x11, 0x0A, 0x00])  # Command + 10 minutes
)
```

## Data Notification Protocol (CHAR4)

Responses and data are sent via notifications on characteristic 0xFFE4.

### Device Info Response (Example)

```
Byte 0:      Response code (0x10 for device info)
Byte 1-2:    Measurement interval (uint16, little-endian)
Byte 3:      Temperature unit (0=°C, 1=°F)
Byte 4-7:    Max temp alarm (float32, little-endian)
Byte 8-11:   Min temp alarm (float32, little-endian)
Byte 12-15:  Max humidity alarm (float32, little-endian)
Byte 16-19:  Min humidity alarm (float32, little-endian)
Byte 20-23:  Total measurement count (uint32, little-endian)
Byte 24-29:  Start time (year:uint16, month:uint8, day:uint8, hour:uint8, minute:uint8, second:uint8)
```

### Measurement Data Response (Example)

```
Byte 0:      Response code (0x21 for data range)
Byte 1-2:    Start index (uint16, little-endian)
Byte 3-4:    Count (uint16, little-endian)
Byte 5-N:    Data records (4 bytes each)

Each record:
  Byte 0-1:  Temperature (int16, value × 100, little-endian)
  Byte 2-3:  Humidity (int16, value × 100, little-endian)
```

### Parsing Measurement Data

```javascript
function parseDataNotification(bytes) {
  const responseCode = bytes[0];

  if (responseCode === 0x21) {  // Data range response
    const startIndex = bytes[1] | (bytes[2] << 8);
    const count = bytes[3] | (bytes[4] << 8);

    const records = [];
    for (let i = 0; i < count; i++) {
      const offset = 5 + (i * 4);
      const tempRaw = bytes[offset] | (bytes[offset + 1] << 8);
      const humiRaw = bytes[offset + 2] | (bytes[offset + 3] << 8);

      // Convert from int16 to signed value
      const temperature = (tempRaw << 16 >> 16) / 100.0;
      const humidity = (humiRaw << 16 >> 16) / 100.0;

      records.push({ temperature, humidity });
    }

    return { startIndex, records };
  }

  return null;
}
```

## Data Types Reference

| Type | Size | Byte Order | Example |
|------|------|------------|---------|
| uint8 | 1 byte | N/A | 0x0A = 10 |
| uint16 | 2 bytes | Little-endian | [0x0A, 0x00] = 10 |
| uint32 | 4 bytes | Little-endian | [0x0A, 0x00, 0x00, 0x00] = 10 |
| int16 | 2 bytes | Little-endian | [0x67, 0x09] = 2407 (24.07) |
| float32 | 4 bytes | Little-endian | IEEE 754 format |

## Timestamp Calculation

Individual measurements don't have embedded timestamps. Calculate using:

```javascript
function calculateTimestamp(startTime, recordIndex, intervalMinutes) {
  // startTime: Date object from device info
  // recordIndex: 0-based index
  // intervalMinutes: measurement interval

  const offsetMs = recordIndex * intervalMinutes * 60 * 1000;
  return new Date(startTime.getTime() + offsetMs);
}
```

```python
from datetime import datetime, timedelta

def calculate_timestamp(start_time, record_index, interval_minutes):
    offset = timedelta(minutes=record_index * interval_minutes)
    return start_time + offset
```

## Error Codes (Optional)

If implementing error responses:

| Code | Meaning |
|------|---------|
| 0x00 | Success |
| 0x01 | Invalid command |
| 0x02 | Invalid parameter |
| 0x03 | Flash error |
| 0x04 | Busy |
| 0xFF | Unknown error |

## Complete Connection Flow

```
1. Scan for "Temp&Humi Logger"
   └─> Parse advertising data for live readings

2. Connect to device
   └─> Wait for connection established

3. Discover services
   └─> Find service 0xFFE0

4. Enable notifications on 0xFFE4
   └─> Register notification handler

5. Send commands to 0xFFE3
   ├─> Get device info (0x10)
   ├─> Get data count (0x20)
   └─> Request data chunks (0x21)

6. Receive responses via notifications
   └─> Parse based on response code

7. Process and display data
   └─> Calculate timestamps
   └─> Convert units if needed
```

## Testing Tools

### Mobile Apps
- **nRF Connect** (iOS/Android): General BLE testing
- **LightBlue** (iOS): BLE peripheral exploration
- **BLE Scanner** (Android): View advertising data

### Desktop
- **bluetoothctl** (Linux): Command-line BLE control
- **nRF Connect for Desktop** (Windows/Mac/Linux): Advanced BLE development

### Example: Testing with nRF Connect

1. Open app and scan
2. Look for "Temp&Humi Logger"
3. View advertising data to see live temperature/humidity
4. Connect to device
5. Discover services
6. Enable notifications on 0xFFE4
7. Write commands to 0xFFE3
8. Monitor notifications for responses

## Implementation Checklist

- [ ] Scan for device by name
- [ ] Parse advertising data for live readings
- [ ] Connect and discover services
- [ ] Enable notifications on CHAR4
- [ ] Implement write to CHAR3
- [ ] Handle notification callbacks
- [ ] Parse response data correctly
- [ ] Calculate timestamps for measurements
- [ ] Implement error handling
- [ ] Handle disconnection gracefully
- [ ] Store data locally (optional)
- [ ] Export data (CSV, JSON, etc.)

## Additional Notes

- **MTU Negotiation**: Request higher MTU (e.g., 247) for efficient data transfer
- **Connection Stability**: Implement reconnection logic
- **Data Integrity**: Verify checksums if implemented
- **Chunking**: Large data transfers should be split into multiple notifications
- **Flow Control**: Wait for acknowledgment before sending next chunk
- **Battery Optimization**: Disconnect when not actively transferring data
