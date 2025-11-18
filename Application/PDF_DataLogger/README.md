# CH592 PDF Temperature & Humidity DataLogger

## Overview

This is a temperature and humidity data logging system based on the CH592 microcontroller with BLE (Bluetooth Low Energy) and USB connectivity. The system continuously monitors environmental conditions using the AHT20 sensor and stores measurements to flash memory.

## Features

- **Dual Connectivity**: BLE and USB modes
- **Sensor**: AHT20 I2C temperature and humidity sensor
  - Temperature range: -40°C to +85°C
  - Humidity range: 0% to 100% RH
  - High accuracy: ±0.3°C, ±2% RH
- **Data Storage**: Up to 46,080 measurements in flash memory
- **Configurable Parameters**:
  - Measurement interval (default: 6 minutes)
  - Temperature unit (Celsius/Fahrenheit)
  - Alarm thresholds for temperature and humidity
- **Low Power**: Sleep mode support with RTC wake-up
- **Real-Time Display**: Optional LCD support
- **Mobile App Support**: BLE interface for mobile applications

## Project Structure

```
PDF_DataLogger/
├── CH592_PDF_Logger_BLE/          # BLE version
│   ├── APP/                       # Application layer
│   │   ├── peripheral.c           # BLE peripheral implementation
│   │   └── peripheral_main.c      # Main program
│   ├── Profile/                   # GATT profile
│   │   └── gattprofile.c          # Custom service characteristics
│   ├── HAL/                       # Hardware Abstraction Layer
│   │   ├── AHT20.c                # Temperature/humidity sensor driver
│   │   ├── RTC.c                  # Real-time clock
│   │   ├── LCD.c                  # Display driver
│   │   ├── KEY.c                  # Button input
│   │   └── BAT.c                  # Battery monitoring
│   ├── Driver/                    # Low-level drivers
│   │   ├── FLASH/                 # Flash storage management
│   │   │   ├── flash_info.c       # Device info & data storage
│   │   │   ├── internal_flash.c   # Internal flash operations
│   │   │   └── spi_flash.c        # External SPI flash (optional)
│   │   └── USB/                   # USB device support
│   └── SRC/                       # Chip peripheral drivers
│
├── CH592_PDF_Logger_USB/          # USB version
│   └── [Similar structure to BLE version]
│
├── MOBILE_APP_INTEGRATION_GUIDE.md  # Mobile app development guide
└── README.md                       # This file
```

## Hardware Requirements

- **MCU**: CH592F (RISC-V, BLE 5.0)
- **Sensor**: AHT20 temperature and humidity sensor (I2C)
- **Flash**: Internal flash + optional SPI flash for extended storage
- **Display** (optional): LCD module
- **Power**: 3.3V supply, battery monitoring support

## Getting Started

### 1. Build the Firmware

Use MounRiver Studio or compatible RISC-V toolchain:

```bash
# Open the project in MounRiver Studio
# Select the appropriate build configuration:
#   - CH592_PDF_Logger_BLE for BLE version
#   - CH592_PDF_Logger_USB for USB version
# Build and flash to CH592 device
```

### 2. Configuration

Default settings are defined in `HAL/include/CONFIG.h`:

```c
// Measurement interval: 6 minutes
#define DEFAULT_MEASURE_INTERVAL        6

// Temperature thresholds
#define DEFAULT_TEMP_UPPER_LIMIT        35.0   // °C
#define DEFAULT_TEMP_LOWER_LIMIT        -10.0  // °C

// Humidity thresholds
#define DEFAULT_HUMI_UPPER_LIMIT        90.0   // %
#define DEFAULT_HUMI_LOWER_LIMIT        30.0   // %

// Enable/disable features
#define HAL_SLEEP          FALSE  // Sleep mode
#define DCDC_ENABLE        TRUE   // DC-DC converter
#define BLE_MAC            FALSE  // Custom MAC address
```

### 3. Device Operation

#### BLE Mode

1. **Power On**: Device starts advertising as "Temp&Humi Logger"
2. **Connect**: Use mobile app to connect via BLE
3. **Read Data**: Access current readings from advertising data
4. **Download Logs**: Use GATT characteristics to retrieve stored measurements
5. **Configure**: Modify settings via BLE commands

#### USB Mode

1. **Connect USB**: Device enumerates as USB mass storage
2. **Access Files**: Logged data available as PDF files
3. **Export**: Copy files to computer for analysis

## BLE Quick Reference

| Item | Value |
|------|-------|
| Device Name | `Temp&Humi Logger` |
| Service UUID | `0xFFE0` |
| Write Characteristic | `0xFFE3` |
| Notify Characteristic | `0xFFE4` |
| Advertising Interval | 1000ms |

### Live Data in Advertising

Temperature and humidity are broadcast in the manufacturer-specific data field:

```
Company ID: 0x07D7 (WCH)
Temperature: float32 (4 bytes, little-endian)
Humidity: float32 (4 bytes, little-endian)
```

## Data Format

### Flash Storage Layout

| Region | Address | Size | Description |
|--------|---------|------|-------------|
| Device Info | 0x00070000 | 8 KB | Configuration and metadata |
| Measurement Data | 0x00041800 | 180 KB | Temperature & humidity logs |

### Measurement Record Format

Each measurement is stored as 4 bytes:

```c
struct MeasurementRecord {
  int16_t temperature;  // Value × 100 (e.g., 2567 = 25.67°C)
  int16_t humidity;     // Value × 100 (e.g., 6543 = 65.43%)
};
```

### Timestamp Calculation

Records don't include individual timestamps. Calculate as:

```
recordTime = startTime + (recordIndex × measurementInterval × 60)
```

Where:
- `startTime`: Device start timestamp (from device info)
- `recordIndex`: Index of measurement (0-based)
- `measurementInterval`: Minutes between measurements

## Mobile App Integration

For detailed mobile app development instructions, see [MOBILE_APP_INTEGRATION_GUIDE.md](./MOBILE_APP_INTEGRATION_GUIDE.md).

### Quick Start (React Native)

```bash
npm install react-native-ble-manager
```

```javascript
import BleManager from 'react-native-ble-manager';

// Scan for device
BleManager.scan([], 5, true);

// Connect to "Temp&Humi Logger"
BleManager.connect(deviceId);

// Enable notifications
BleManager.startNotification(deviceId, 'FFE0', 'FFE4');
```

See the integration guide for complete examples and troubleshooting.

## Development

### Adding Custom Commands

1. Define command codes in `APP/peripheral.h`
2. Implement handler in `simpleProfileChangeCB()` in `APP/peripheral.c`
3. Update mobile app to send new commands

### Modifying Storage Format

1. Update structures in `Driver/FLASH/include/flash_info.h`
2. Modify read/write functions in `Driver/FLASH/flash_info.c`
3. Ensure checksum calculation includes new fields

### Customizing BLE Service

1. Edit UUIDs in `Profile/include/gattprofile.h`
2. Modify characteristic properties in `Profile/gattprofile.c`
3. Update advertising data in `APP/peripheral.c`

## Power Consumption

Typical power consumption (at 3.3V):

- **Active Measurement**: ~15 mA
- **BLE Advertising**: ~8 mA (average)
- **BLE Connected**: ~10 mA
- **Sleep Mode**: ~5 µA (with RTC)

Battery life estimate (2000 mAh CR2032):
- Continuous advertising: ~10 days
- Sleep mode with periodic wake-up: ~6 months

## Troubleshooting

### Device Not Advertising

1. Check power supply (3.3V ±10%)
2. Verify flash is not corrupted (erase and reflash)
3. Check BLE antenna connection

### Incorrect Sensor Readings

1. Verify I2C connections to AHT20
2. Check sensor calibration (auto-calibrates on startup)
3. Allow sensor to stabilize (40ms after power-on)

### Flash Storage Full

1. Connect via BLE/USB and export data
2. Send clear command to erase measurement data
3. Device automatically erases when DEVICEINFO_MAX reached

### BLE Connection Issues

1. Ensure only one connection at a time
2. Reset device if connection is stuck
3. Check mobile app permissions (location required for BLE)

## License

Copyright (c) 2021 Nanjing Qinheng Microelectronics Co., Ltd.

This software (modified or not) and binary are used for microcontroller manufactured by Nanjing Qinheng Microelectronics.

## Support

For technical questions:
- Hardware: Refer to CH592 datasheet
- BLE Stack: See CH59x BLE library documentation
- Mobile App: See MOBILE_APP_INTEGRATION_GUIDE.md

## Version History

- **V1.2** (2022/01/18): Added temperature unit configuration
- **V1.1** (2020/08/06): Initial BLE implementation
- **V1.0** (2018/12/10): First release
