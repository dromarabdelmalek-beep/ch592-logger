# CH592 DataLogger - Firmware & Hardware Specification

## Table of Contents

1. [System Overview](#system-overview)
2. [Hardware Architecture](#hardware-architecture)
3. [Flash Memory Organization](#flash-memory-organization)
4. [Data Storage Mechanism](#data-storage-mechanism)
5. [Data Reading Process](#data-reading-process)
6. [Firmware Components](#firmware-components)
7. [Measurement Flow](#measurement-flow)
8. [Power Management](#power-management)

---

## System Overview

The CH592 Temperature & Humidity DataLogger is a battery-powered environmental monitoring device that:
- Measures temperature and humidity at configurable intervals
- Stores up to 46,080 measurements in flash memory
- Transmits data via BLE or USB
- Operates in ultra-low power mode between measurements
- Provides real-time readings via BLE advertising

### Key Specifications

| Parameter | Value |
|-----------|-------|
| MCU | CH592F (RISC-V 32-bit, 32MHz) |
| BLE | Bluetooth 5.0 |
| Sensor | AHT20 (I2C) |
| Flash Storage | 448KB internal flash |
| RAM | 32KB SRAM |
| Temperature Range | -40°C to +85°C (±0.3°C) |
| Humidity Range | 0-100% RH (±2% RH) |
| Default Interval | 6 minutes |
| Max Storage Duration | ~19 days @ 6min interval |
| Operating Voltage | 2.0V - 3.6V |
| Average Current | 8mA (advertising) / 5µA (sleep) |

---

## Hardware Architecture

### Block Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         CH592 MCU                           │
│                                                             │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐              │
│  │   CPU    │   │   BLE    │   │   USB    │              │
│  │ RISC-V   │   │  Stack   │   │  Device  │              │
│  │  32MHz   │   │   5.0    │   │          │              │
│  └──────────┘   └──────────┘   └──────────┘              │
│                                                             │
│  ┌──────────────────────────────────────────────┐         │
│  │         Internal Flash (448KB)                │         │
│  │  ┌────────────┐  ┌──────────────────────┐   │         │
│  │  │ Code Flash │  │  Measurement Data    │   │         │
│  │  │   268KB    │  │      180KB           │   │         │
│  │  └────────────┘  └──────────────────────┘   │         │
│  └──────────────────────────────────────────────┘         │
│                                                             │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐              │
│  │   RTC    │   │   ADC    │   │   I2C    │              │
│  │  32kHz   │   │  12-bit  │   │  Master  │              │
│  └──────────┘   └──────────┘   └──────────┘              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
         │                 │                 │
         │                 │                 │
    ┌────▼────┐       ┌───▼────┐      ┌────▼─────┐
    │  AHT20  │       │  LCD   │      │ Battery  │
    │ Sensor  │       │Display │      │ Monitor  │
    │  (I2C)  │       │(Optional)     │  (ADC)   │
    └─────────┘       └────────┘      └──────────┘
```

### Pin Configuration

#### I2C (AHT20 Sensor)
- **SDA**: PB13
- **SCL**: PB12
- **Frequency**: 100kHz (standard mode)

#### LCD (Optional)
- **COM0-COM3**: Segment LCD pins
- **SEG0-SEGn**: Segment LCD pins

#### USB
- **DP**: USB D+
- **DM**: USB D-

#### Battery Monitoring
- **ADC_CHANNEL**: PA4 (Battery voltage divider)

#### Debug UART
- **TX**: PA9
- **RX**: PA8

---

## Flash Memory Organization

### Memory Map

```
┌─────────────────────────────────────────────────────────────┐
│                    CH592 Flash Memory Map                    │
├─────────────────────────────────────────────────────────────┤
│ 0x00000000                                                   │
│            ┌───────────────────────────────────┐             │
│            │        Bootloader                 │             │
│ 0x00004000 │          (16KB)                   │             │
│            └───────────────────────────────────┘             │
│            ┌───────────────────────────────────┐             │
│            │                                   │             │
│            │        Application Code           │             │
│            │          (252KB)                  │             │
│ 0x00041800 │                                   │             │
│ (268KB)    └───────────────────────────────────┘             │
│            ┌───────────────────────────────────┐             │
│            │    Measurement Data Storage       │             │
│            │         (180KB)                   │             │
│            │                                   │             │
│            │  • 46,080 records maximum         │             │
│            │  • Each record: 4 bytes           │             │
│ 0x0006E800 │  • Temperature: int16 (2 bytes)   │             │
│ (452KB)    │  • Humidity: int16 (2 bytes)      │             │
│            └───────────────────────────────────┘             │
│            ┌───────────────────────────────────┐             │
│            │      Data Flash (Reserved)        │             │
│ 0x00070000 │          (8KB)                    │             │
│ (448KB)    │                                   │             │
│            │  • Device Configuration           │             │
│            │  • System Parameters              │             │
│            │  • Metadata                       │             │
│ 0x00072000 └───────────────────────────────────┘             │
│ (456KB)                                                      │
│            ┌───────────────────────────────────┐             │
│            │      BLE Stack & Data             │             │
│            │          (8KB)                    │             │
│ 0x00074000 └───────────────────────────────────┘             │
│ (464KB)                                                      │
└─────────────────────────────────────────────────────────────┘
```

### Data Flash Region Details

```
Data Flash (0x00070000 - 0x00071FFF, 8KB)
├── Device Info Storage
│   ├── Address: 0x00070000
│   ├── Size: 8KB (8192 bytes)
│   ├── Record Size: 44 bytes
│   ├── Max Records: 186 (DEVICEINFO_MAX)
│   └── Wear Leveling: Circular buffer
│
└── Structure: DEVICE_INFO_t (44 bytes)
    ├── Byte 0: CheckFlag (0x5A = valid)
    ├── Byte 1-2: InfoNum (current record number)
    ├── Byte 3: StatusFlag (0=factory, 1=normal, 2=USB)
    ├── Byte 4-25: PDF Parameters (22 bytes)
    │   ├── Byte 4-5: MeasureInterval (uint16)
    │   ├── Byte 6: TempUnit (0=Celsius, 1=Fahrenheit)
    │   ├── Byte 7-10: MaxTempAlarm (float32)
    │   ├── Byte 11-14: MinTempAlarm (float32)
    │   ├── Byte 15-18: MaxHumiAlarm (float32)
    │   └── Byte 19-22: MinHumiAlarm (float32)
    ├── Byte 26-29: MeasureNum (uint32, total measurements)
    ├── Byte 30-36: StartTime (7 bytes)
    │   ├── Byte 30-31: Year (uint16)
    │   ├── Byte 32: Month (uint8)
    │   ├── Byte 33: Day (uint8)
    │   ├── Byte 34: Hour (uint8)
    │   ├── Byte 35: Minute (uint8)
    │   └── Byte 36: Second (uint8)
    ├── Byte 37-39: Reserved (3 bytes)
    └── Byte 40: Checksum (sum of bytes 0-39)
```

---

## Data Storage Mechanism

### 1. Initialization Process

```c
// On device startup or first boot
void HAL_ReadDeviceInfo(void) {
    // 1. Scan Data Flash to find latest valid record
    uint16_t recordNum = 1;
    do {
        uint32_t addr = DEVICEINFO_ADDR + recordNum * DEVICEINFO_LEN;
        EEPROM_READ(addr, &DeviceInfo, 1);  // Read CheckFlag
        recordNum++;
    } while (CheckFlag != 0xFF && recordNum <= DEVICEINFO_MAX);

    // 2. Read the complete record
    uint32_t addr = DEVICEINFO_ADDR + (recordNum - 2) * DEVICEINFO_LEN;
    EEPROM_READ(addr, &DeviceInfo, DEVICEINFO_LEN);

    // 3. Validate checksum
    if (HAL_FlashChecksumCheck(&DeviceInfo, DEVICEINFO_LEN-1) != SUCCESS) {
        // Initialize with defaults
        DeviceInfo.MeasureInterval = 6;      // 6 minutes
        DeviceInfo.TempUnit = 0;             // Celsius
        DeviceInfo.MaxTempAlarm = 35.0;
        DeviceInfo.MinTempAlarm = -10.0;
        DeviceInfo.MaxHumiAlarm = 90.0;
        DeviceInfo.MinHumiAlarm = 30.0;
        DeviceInfo.StartTime = {2023, 9, 20, 0, 0, 0};
        HAL_SaveDeviceInfo();
    }

    // 4. If Data Flash is full, erase and reset
    if (DeviceInfo.InfoNum == DEVICEINFO_MAX) {
        EEPROM_ERASE(DEVICEINFO_ADDR, DEVICEINFO_FLASH_SIZE);
        DeviceInfo.InfoNum = 0;
    }
}
```

### 2. Measurement Storage

```c
// Every measurement interval (default: 6 minutes)
void StoreMeasurement(float temperature, float humidity) {

    // 1. Convert to int16 format (value × 100)
    int16_t temp_raw = (int16_t)(temperature * 100.0f);
    int16_t humi_raw = (int16_t)(humidity * 100.0f);

    // 2. Calculate flash address
    uint32_t recordIndex = DeviceInfo.MeasureNum;
    uint32_t flashAddr = MEASURENT_DATA_ADDR + (recordIndex * 4);

    // 3. Check if flash is full
    if (recordIndex >= MEASURENT_DATA_MAX) {
        // Flash is full - stop logging or overwrite oldest
        return;
    }

    // 4. Prepare data buffer
    uint8_t data[4];
    data[0] = temp_raw & 0xFF;           // Temp low byte
    data[1] = (temp_raw >> 8) & 0xFF;    // Temp high byte
    data[2] = humi_raw & 0xFF;           // Humi low byte
    data[3] = (humi_raw >> 8) & 0xFF;    // Humi high byte

    // 5. Write to flash
    FLASH_ROM_WRITE(flashAddr, data, 4);

    // 6. Update measurement count
    DeviceInfo.MeasureNum++;
    HAL_SaveDeviceInfo();  // Save updated count
}
```

### 3. Wear Leveling Strategy

The device info uses a circular buffer approach:

```
Flash Write Cycle:
┌──────────────────────────────────────────────────┐
│  Record 0  │  Record 1  │  Record 2  │  ...     │
│  (44 bytes)│  (44 bytes)│  (44 bytes)│          │
└──────────────────────────────────────────────────┘
     Write 1      Write 2      Write 3    ...  Write 186
                                                    │
                                                    ▼
                                              Erase entire
                                              8KB sector
                                                    │
                                                    ▼
                                              Start from
                                              Record 0 again
```

This provides approximately **186 configuration updates** before requiring an erase cycle.

---

## Data Reading Process

### 1. Reading Device Configuration

```c
// Read current device settings
DEVICE_INFO_t getDeviceConfig(void) {
    HAL_ReadDeviceInfo();  // Loads into global DeviceInfo
    return DeviceInfo;
}

// Access specific parameters
uint16_t getMeasurementInterval() {
    return DeviceInfo.PdfParam.MeasureInterval;  // minutes
}

uint32_t getTotalMeasurements() {
    return DeviceInfo.MeasureNum;
}

START_TIME_t getStartTime() {
    return DeviceInfo.StartTime;
}
```

### 2. Reading Individual Measurements

```c
// Read a specific measurement record
typedef struct {
    float temperature;
    float humidity;
    uint32_t timestamp;  // Unix timestamp (calculated)
} MeasurementRecord_t;

MeasurementRecord_t readMeasurement(uint32_t index) {
    MeasurementRecord_t record;

    // 1. Validate index
    if (index >= DeviceInfo.MeasureNum) {
        return {0, 0, 0};  // Invalid
    }

    // 2. Calculate flash address
    uint32_t addr = MEASURENT_DATA_ADDR + (index * 4);

    // 3. Read 4 bytes from flash
    uint8_t data[4];
    FLASH_ROM_READ(addr, data, 4);

    // 4. Parse data
    int16_t temp_raw = (data[1] << 8) | data[0];
    int16_t humi_raw = (data[3] << 8) | data[2];

    // 5. Convert to float
    record.temperature = temp_raw / 100.0f;
    record.humidity = humi_raw / 100.0f;

    // 6. Calculate timestamp
    record.timestamp = calculateTimestamp(
        DeviceInfo.StartTime,
        index,
        DeviceInfo.PdfParam.MeasureInterval
    );

    return record;
}
```

### 3. Reading Measurement Range

```c
// Read multiple measurements efficiently
void readMeasurementRange(
    uint32_t startIndex,
    uint32_t count,
    MeasurementRecord_t* buffer
) {
    // 1. Validate range
    if (startIndex + count > DeviceInfo.MeasureNum) {
        count = DeviceInfo.MeasureNum - startIndex;
    }

    // 2. Calculate starting address
    uint32_t addr = MEASURENT_DATA_ADDR + (startIndex * 4);

    // 3. Read bulk data from flash
    uint32_t totalBytes = count * 4;
    uint8_t* rawData = malloc(totalBytes);
    FLASH_ROM_READ(addr, rawData, totalBytes);

    // 4. Parse each record
    for (uint32_t i = 0; i < count; i++) {
        uint8_t* recordData = &rawData[i * 4];

        int16_t temp_raw = (recordData[1] << 8) | recordData[0];
        int16_t humi_raw = (recordData[3] << 8) | recordData[2];

        buffer[i].temperature = temp_raw / 100.0f;
        buffer[i].humidity = humi_raw / 100.0f;
        buffer[i].timestamp = calculateTimestamp(
            DeviceInfo.StartTime,
            startIndex + i,
            DeviceInfo.PdfParam.MeasureInterval
        );
    }

    free(rawData);
}
```

### 4. Timestamp Calculation

```c
uint32_t calculateTimestamp(
    START_TIME_t startTime,
    uint32_t recordIndex,
    uint16_t intervalMinutes
) {
    // Convert start time to Unix timestamp
    struct tm timeinfo;
    timeinfo.tm_year = startTime.Year - 1900;
    timeinfo.tm_mon = startTime.Month - 1;
    timeinfo.tm_mday = startTime.Day;
    timeinfo.tm_hour = startTime.Hour;
    timeinfo.tm_min = startTime.Minute;
    timeinfo.tm_sec = startTime.Second;

    time_t startUnix = mktime(&timeinfo);

    // Calculate offset in seconds
    uint32_t offsetSeconds = recordIndex * intervalMinutes * 60;

    // Return absolute timestamp
    return startUnix + offsetSeconds;
}
```

---

## Firmware Components

### 1. Main Application Loop

```c
int main(void) {
    // Hardware initialization
    SetSysClock(CLK_SOURCE_PLL_60MHz);
    HAL_Init();

    // BLE stack initialization
    CH59x_BLEInit();
    GAPRole_PeripheralInit();
    Peripheral_Init();

    // Read device configuration from flash
    HAL_ReadDeviceInfo();

    // Initialize RTC with stored start time
    HAL_TimeInit();

    // Initialize temperature/humidity sensor
    HAL_AHT20_Init();

    // Main event loop
    while(1) {
        TMOS_SystemProcess();  // Process BLE events
    }
}
```

### 2. Periodic Measurement Task

```c
// Triggered by RTC every N minutes
void HAL_AHT20_Task(void) {
    static uint32_t measurementTimer = 0;

    // Check if measurement interval has elapsed
    if (++measurementTimer >= DeviceInfo.PdfParam.MeasureInterval) {
        measurementTimer = 0;

        // 1. Read sensor
        HAL_AHT20_MeasureReadTemperatureHumidity();

        // 2. Get values
        float temp = AHT20_TemperatureValue;
        float humi = AHT20_HumidityValue;

        // 3. Check if logging is active
        if (DeviceInfo.StatusFlag == DEF_DEVICE_STATUS_NORMAL) {
            StoreMeasurement(temp, humi);
        }

        // 4. Update advertising data with latest values
        updateAdvertisingData(temp, humi);

        // 5. Update LCD if present
        updateLCD(temp, humi);

        // 6. Check alarm thresholds
        checkAlarms(temp, humi);
    }
}
```

### 3. BLE Data Transfer

```c
// Send measurement data via BLE notification
void sendMeasurementData(uint32_t startIndex, uint16_t count) {
    const uint16_t MAX_CHUNK = 20;  // Records per notification

    for (uint32_t i = 0; i < count; i += MAX_CHUNK) {
        uint16_t chunkSize = min(MAX_CHUNK, count - i);

        // Prepare notification packet
        uint8_t packet[244];  // Max MTU payload
        uint16_t offset = 0;

        // Header
        packet[offset++] = 0x21;  // Data response code
        packet[offset++] = (startIndex + i) & 0xFF;
        packet[offset++] = ((startIndex + i) >> 8) & 0xFF;
        packet[offset++] = chunkSize & 0xFF;
        packet[offset++] = (chunkSize >> 8) & 0xFF;

        // Read and pack measurements
        for (uint16_t j = 0; j < chunkSize; j++) {
            MeasurementRecord_t record = readMeasurement(startIndex + i + j);

            int16_t temp_raw = (int16_t)(record.temperature * 100);
            int16_t humi_raw = (int16_t)(record.humidity * 100);

            packet[offset++] = temp_raw & 0xFF;
            packet[offset++] = (temp_raw >> 8) & 0xFF;
            packet[offset++] = humi_raw & 0xFF;
            packet[offset++] = (humi_raw >> 8) & 0xFF;
        }

        // Send notification
        peripheralChar4Notify(packet, offset);

        // Wait for transmission complete
        DelayMs(20);
    }
}
```

---

## Measurement Flow

### Complete Measurement Cycle

```
┌─────────────────────────────────────────────────────────────┐
│                    Measurement Cycle                         │
└─────────────────────────────────────────────────────────────┘

1. RTC Interrupt (every 1 minute)
   │
   ├─> Check if interval elapsed
   │   (e.g., 6 minutes)
   │
   └─> If YES:
       │
       ├─> Wake up from sleep
       │
       ├─> Power on I2C bus
       │   │
       │   └─> Send measure command to AHT20
       │       │
       │       └─> Wait 75ms for conversion
       │
       ├─> Read temperature and humidity
       │   │
       │   ├─> Temperature: (raw * 200 / 1048576) - 50
       │   └─> Humidity: (raw * 100 / 1048576)
       │
       ├─> Store to flash
       │   │
       │   ├─> Convert: temp_int16 = temp * 100
       │   ├─> Convert: humi_int16 = humi * 100
       │   ├─> Calculate address
       │   └─> Write 4 bytes to flash
       │
       ├─> Update advertising data
       │   │
       │   └─> Embed latest values in manufacturer data
       │
       ├─> Update device info
       │   │
       │   ├─> Increment MeasureNum
       │   ├─> Calculate checksum
       │   └─> Write to data flash
       │
       ├─> Check alarms
       │   │
       │   ├─> If temp > MaxTempAlarm: trigger alarm
       │   ├─> If temp < MinTempAlarm: trigger alarm
       │   ├─> If humi > MaxHumiAlarm: trigger alarm
       │   └─> If humi < MinHumiAlarm: trigger alarm
       │
       └─> Return to sleep mode
           │
           └─> Wait for next RTC interrupt
```

### Data Flow Diagram

```
     AHT20                  CH592                    Flash
    Sensor                   MCU                    Memory
      │                       │                        │
      │    Measure Cmd        │                        │
      │◄──────────────────────│                        │
      │                       │                        │
      │   Wait 75ms           │                        │
      │                       │                        │
      │    Raw Data           │                        │
      ├──────────────────────►│                        │
      │   (6 bytes)           │                        │
      │                       │                        │
      │                       │ Parse & Convert        │
      │                       │ (int16 format)         │
      │                       │                        │
      │                       │    Write Data          │
      │                       ├───────────────────────►│
      │                       │    (4 bytes)           │
      │                       │                        │
      │                       │◄───────────────────────┤
      │                       │    Write Complete      │
      │                       │                        │
      │                       │  Update DeviceInfo     │
      │                       ├───────────────────────►│
      │                       │    (44 bytes)          │
      │                       │                        │
      │                       │                        │
      │                   BLE Advertise                │
      │                   (with latest data)           │
      │                       │                        │
      │                  Enter Sleep                   │
      │                       │                        │
```

---

## Power Management

### Operating Modes

```
┌─────────────────────────────────────────────────────────────┐
│                      Power Modes                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. ACTIVE MODE                                             │
│     ├─ CPU: Running @ 60MHz                                 │
│     ├─ BLE: Advertising/Connected                           │
│     ├─ Current: ~15mA                                       │
│     └─ Duration: <1 second per measurement                  │
│                                                              │
│  2. SLEEP MODE (Default between measurements)               │
│     ├─ CPU: Halted                                          │
│     ├─ BLE: Advertising (low duty cycle)                    │
│     ├─ RTC: Running                                         │
│     ├─ Current: ~8mA (advertising)                          │
│     └─ Wake: RTC interrupt or BLE event                     │
│                                                              │
│  3. DEEP SLEEP MODE (Optional)                              │
│     ├─ CPU: Powered down                                    │
│     ├─ BLE: Stopped                                         │
│     ├─ RTC: Running                                         │
│     ├─ Current: ~5µA                                        │
│     └─ Wake: RTC interrupt only                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Battery Life Calculation

```
Assumptions:
- Battery: 2000mAh CR2032
- Measurement Interval: 6 minutes
- BLE Advertising: Continuous

Current Profile per hour:
- Active (measurement): 15mA × 1s × 10 measurements = 0.042mAh
- Sleep (advertising): 8mA × 3599s = 7.997mAh
- Total per hour: ~8.04mAh

Battery Life:
2000mAh / 8.04mAh = ~249 hours = ~10.4 days

With Deep Sleep (advertising disabled):
- Active: 0.042mAh per hour
- Deep Sleep: 0.005mA × 3599s = 0.005mAh per hour
- Total: ~0.047mAh per hour
- Battery Life: 2000 / 0.047 = ~42,553 hours = ~1773 days = ~4.8 years
```

---

## Summary

This firmware implements a robust data logging system with:

✅ **Efficient Flash Storage**: 180KB dedicated to measurements (46,080 records)
✅ **Wear Leveling**: Circular buffer for device config reduces flash wear
✅ **Data Integrity**: Checksums protect configuration data
✅ **Flexible Retrieval**: Read individual records or bulk ranges
✅ **Timestamp Calculation**: Server-side calculation from start time + interval
✅ **Low Power**: Sleep modes between measurements for long battery life
✅ **BLE Real-time**: Live data in advertising packets
✅ **Configurable**: Adjustable measurement intervals and alarm thresholds

The storage mechanism is designed for:
- **Reliability**: Checksums and validation
- **Efficiency**: Direct flash access, no filesystem overhead
- **Longevity**: Wear leveling extends flash life
- **Simplicity**: Fixed-size records, predictable addressing
