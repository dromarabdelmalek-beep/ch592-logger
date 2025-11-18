# Temperature & Humidity Logger - Mobile App Specification

## Project Overview

**App Name**: TempHumi Logger
**Platform**: Android (React Native)
**Target SDK**: Android 11+ (API Level 30+)
**Primary Function**: Read and visualize temperature and humidity data from CH592 DataLogger via BLE

---

## Table of Contents

1. [Functional Requirements](#functional-requirements)
2. [User Interface Design](#user-interface-design)
3. [Technical Architecture](#technical-architecture)
4. [Data Synchronization](#data-synchronization)
5. [User Flows](#user-flows)
6. [Features & Screens](#features--screens)
7. [Performance Requirements](#performance-requirements)
8. [Security & Privacy](#security--privacy)

---

## Functional Requirements

### Core Features

#### 1. Device Discovery & Connection
- **FR-1.1**: Scan for BLE devices named "Temp&Humi Logger"
- **FR-1.2**: Display signal strength (RSSI) for each discovered device
- **FR-1.3**: Show live temperature/humidity from advertising data (no connection required)
- **FR-1.4**: Connect to selected device
- **FR-1.5**: Maintain connection state and auto-reconnect on disconnect
- **FR-1.6**: Display connection status prominently

#### 2. Real-Time Monitoring
- **FR-2.1**: Display current temperature in Celsius and Fahrenheit
- **FR-2.2**: Display current humidity percentage
- **FR-2.3**: Update readings from BLE advertising packets (every 1 second)
- **FR-2.4**: Show visual indicators for alarm thresholds
- **FR-2.5**: Display battery level (if available)
- **FR-2.6**: Show last update timestamp

#### 3. Historical Data Download
- **FR-3.1**: Download all stored measurements from device start
- **FR-3.2**: Show download progress (percentage, records downloaded)
- **FR-3.3**: Calculate and assign timestamps to each measurement
- **FR-3.4**: Store downloaded data locally on phone
- **FR-3.5**: Resume interrupted downloads
- **FR-3.6**: Display total records available on device

#### 4. Data Visualization
- **FR-4.1**: Line chart showing temperature over time
- **FR-4.2**: Line chart showing humidity over time
- **FR-4.3**: Combined dual-axis chart (temp + humidity)
- **FR-4.4**: Zoom and pan on charts
- **FR-4.5**: Select date range for viewing
- **FR-4.6**: Show min, max, and average values for selected range
- **FR-4.7**: Highlight alarm threshold violations on chart

#### 5. Data Management
- **FR-5.1**: View data in table format with sorting
- **FR-5.2**: Export data as CSV file
- **FR-5.3**: Export data as JSON file
- **FR-5.4**: Share exported files via email, cloud storage, etc.
- **FR-5.5**: Delete local data (keep device data intact)
- **FR-5.6**: Search/filter data by date or value range

#### 6. Device Configuration
- **FR-6.1**: View current device settings
- **FR-6.2**: Set measurement interval (1-60 minutes)
- **FR-6.3**: Set temperature unit (Celsius/Fahrenheit)
- **FR-6.4**: Configure alarm thresholds
- **FR-6.5**: Set device start time
- **FR-6.6**: Clear device measurement data
- **FR-6.7**: Reset device to factory settings

#### 7. Notifications & Alarms
- **FR-7.1**: Alert when temperature exceeds threshold
- **FR-7.2**: Alert when humidity exceeds threshold
- **FR-7.3**: Notification when device disconnects
- **FR-7.4**: Notification when memory is nearly full
- **FR-7.5**: Configure notification preferences

---

## User Interface Design

### Design Principles

- **Modern & Clean**: Material Design 3 with smooth animations
- **Data-First**: Large, clear visualization of current readings
- **Intuitive**: Easy navigation with bottom tab bar
- **Accessible**: High contrast, readable fonts, accessibility support
- **Responsive**: Adapts to different screen sizes

### Color Palette

```
Primary Colors:
- Primary: #2196F3 (Blue)
- Primary Variant: #1976D2 (Dark Blue)
- Secondary: #FF9800 (Orange)
- Secondary Variant: #F57C00 (Dark Orange)

Status Colors:
- Success: #4CAF50 (Green)
- Warning: #FFC107 (Amber)
- Error: #F44336 (Red)
- Info: #00BCD4 (Cyan)

Background:
- Background: #FAFAFA (Light Gray)
- Surface: #FFFFFF (White)
- Card: #FFFFFF with elevation

Text:
- Primary Text: #212121 (Dark Gray)
- Secondary Text: #757575 (Gray)
- Disabled: #BDBDBD (Light Gray)

Temperature Colors (Gradient):
- Cold: #2196F3 (Blue)
- Normal: #4CAF50 (Green)
- Warm: #FF9800 (Orange)
- Hot: #F44336 (Red)

Humidity Colors:
- Low: #FFC107 (Amber)
- Normal: #4CAF50 (Green)
- High: #2196F3 (Blue)
```

### Typography

```
Font Family: Roboto (default Android)

Headings:
- H1: 32sp, Bold
- H2: 24sp, Medium
- H3: 20sp, Medium
- H4: 18sp, Medium

Body:
- Body1: 16sp, Regular
- Body2: 14sp, Regular
- Caption: 12sp, Regular

Data Display:
- Large Reading: 48sp, Bold (current temp/humidity)
- Medium Reading: 32sp, Medium (statistics)
- Small Reading: 24sp, Regular (chart labels)
```

### Iconography

Using Material Icons:
- Device: `bluetooth_searching`, `bluetooth_connected`
- Temperature: `thermostat`, `device_thermostat`
- Humidity: `water_drop`, `opacity`
- Charts: `timeline`, `bar_chart`, `show_chart`
- Download: `cloud_download`, `sync`
- Export: `upload_file`, `share`
- Settings: `settings`, `tune`
- Alarms: `notifications`, `warning`

---

## Technical Architecture

### Technology Stack

```
Frontend:
├── React Native: 0.72+
├── TypeScript: 5.0+
├── React Navigation: 6.0+ (navigation)
├── React Native Paper: 5.0+ (UI components)
└── react-native-ble-manager: BLE communication

State Management:
├── Redux Toolkit: Global state
├── React Context: Theme, settings
└── AsyncStorage: Local persistence

Charts & Visualization:
├── react-native-chart-kit: Charts
└── react-native-svg: Custom visualizations

Data Storage:
├── AsyncStorage: Settings, preferences
└── SQLite (react-native-sqlite-storage): Measurement data

Utilities:
├── date-fns: Date formatting
├── lodash: Data manipulation
└── react-native-fs: File system access
```

### Project Structure

```
TempHumiLogger/
├── android/                    # Android native code
├── ios/                        # iOS native code (future)
├── src/
│   ├── App.tsx                # Root component
│   ├── navigation/            # Navigation configuration
│   │   ├── AppNavigator.tsx
│   │   └── types.ts
│   ├── screens/               # Screen components
│   │   ├── HomeScreen.tsx
│   │   ├── DeviceScreen.tsx
│   │   ├── ChartScreen.tsx
│   │   ├── DataScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── components/            # Reusable components
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Loading.tsx
│   │   ├── device/
│   │   │   ├── DeviceCard.tsx
│   │   │   ├── ConnectionStatus.tsx
│   │   │   └── ScanButton.tsx
│   │   ├── data/
│   │   │   ├── ReadingCard.tsx
│   │   │   ├── StatisticsCard.tsx
│   │   │   └── DataTable.tsx
│   │   └── charts/
│   │       ├── TemperatureChart.tsx
│   │       ├── HumidityChart.tsx
│   │       └── CombinedChart.tsx
│   ├── services/              # Business logic
│   │   ├── ble/
│   │   │   ├── BLEService.ts
│   │   │   ├── DataParser.ts
│   │   │   └── DeviceManager.ts
│   │   ├── storage/
│   │   │   ├── DatabaseService.ts
│   │   │   └── StorageService.ts
│   │   └── export/
│   │       ├── CSVExporter.ts
│   │       └── JSONExporter.ts
│   ├── store/                 # Redux store
│   │   ├── index.ts
│   │   ├── slices/
│   │   │   ├── deviceSlice.ts
│   │   │   ├── dataSlice.ts
│   │   │   └── settingsSlice.ts
│   │   └── hooks.ts
│   ├── types/                 # TypeScript types
│   │   ├── device.ts
│   │   ├── measurement.ts
│   │   └── settings.ts
│   ├── utils/                 # Utility functions
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   ├── calculations.ts
│   │   └── constants.ts
│   ├── hooks/                 # Custom hooks
│   │   ├── useBLE.ts
│   │   ├── useDownload.ts
│   │   └── useChart.ts
│   ├── theme/                 # Theme configuration
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   └── theme.ts
│   └── assets/                # Images, fonts, etc.
│       ├── images/
│       └── fonts/
├── __tests__/                 # Test files
├── package.json
├── tsconfig.json
└── README.md
```

---

## Data Synchronization

### Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Mobile App Architecture                  │
└─────────────────────────────────────────────────────────────┘

BLE Device                    Mobile App                Local Storage
   │                              │                           │
   │   Advertising (1s)           │                           │
   ├─────────────────────────────►│                           │
   │   {temp, humidity}           │                           │
   │                              │                           │
   │                              │   Update Live Display     │
   │                              │                           │
   │   User Initiates Download    │                           │
   │◄─────────────────────────────┤                           │
   │   Get Device Info (0x10)     │                           │
   │                              │                           │
   │   Response: DeviceInfo       │                           │
   ├─────────────────────────────►│                           │
   │   {interval, count, start}   │                           │
   │                              │                           │
   │◄─────────────────────────────┤                           │
   │   Request Data (0x21)        │                           │
   │   {start: 0, count: 100}     │                           │
   │                              │                           │
   │   Data Chunk 0-99            │                           │
   ├─────────────────────────────►│                           │
   │   [temp, humi] x 100         │                           │
   │                              │                           │
   │                              │   Parse & Calculate       │
   │                              │   Timestamps              │
   │                              │                           │
   │                              │   Save to Database        │
   │                              ├──────────────────────────►│
   │                              │   INSERT measurements     │
   │                              │                           │
   │◄─────────────────────────────┤                           │
   │   Request Data (0x21)        │                           │
   │   {start: 100, count: 100}   │                           │
   │                              │                           │
   │          ...                 │                           │
   │          ...                 │                           │
   │                              │                           │
   │   Download Complete          │                           │
   │                              │                           │
   │                              │   Refresh Charts          │
   │                              │◄──────────────────────────┤
   │                              │   SELECT measurements     │
   │                              │   WHERE date BETWEEN ...  │
```

### Download Strategy

#### Chunk-Based Download

```typescript
interface DownloadStrategy {
  chunkSize: number;      // Records per request (e.g., 100)
  maxRetries: number;     // Retry attempts per chunk (e.g., 3)
  delayBetweenChunks: number;  // ms delay (e.g., 50ms)
  timeoutPerChunk: number;     // ms timeout (e.g., 5000ms)
}

const strategy: DownloadStrategy = {
  chunkSize: 100,
  maxRetries: 3,
  delayBetweenChunks: 50,
  timeoutPerChunk: 5000,
};

// Download algorithm
async function downloadAllData(totalRecords: number) {
  const chunks = Math.ceil(totalRecords / strategy.chunkSize);

  for (let i = 0; i < chunks; i++) {
    const startIndex = i * strategy.chunkSize;
    const count = Math.min(strategy.chunkSize, totalRecords - startIndex);

    let success = false;
    for (let retry = 0; retry < strategy.maxRetries && !success; retry++) {
      try {
        const data = await requestDataChunk(startIndex, count);
        await saveToDatabase(data);
        success = true;

        // Update progress
        const progress = ((i + 1) / chunks) * 100;
        updateProgress(progress);
      } catch (error) {
        if (retry === strategy.maxRetries - 1) {
          throw new Error(`Failed to download chunk ${i}`);
        }
        await delay(1000 * (retry + 1));  // Exponential backoff
      }
    }

    await delay(strategy.delayBetweenChunks);
  }
}
```

### Local Database Schema

```sql
-- Device table
CREATE TABLE devices (
  id TEXT PRIMARY KEY,           -- BLE MAC address
  name TEXT NOT NULL,
  last_connected INTEGER,        -- Unix timestamp
  measurement_interval INTEGER,  -- Minutes
  temp_unit TEXT,                -- 'C' or 'F'
  start_time INTEGER,            -- Unix timestamp
  total_records INTEGER,
  max_temp_alarm REAL,
  min_temp_alarm REAL,
  max_humi_alarm REAL,
  min_humi_alarm REAL,
  created_at INTEGER,
  updated_at INTEGER
);

-- Measurements table
CREATE TABLE measurements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id TEXT NOT NULL,
  timestamp INTEGER NOT NULL,    -- Unix timestamp
  temperature REAL NOT NULL,
  humidity REAL NOT NULL,
  record_index INTEGER NOT NULL, -- Original index on device
  downloaded_at INTEGER,         -- When downloaded
  FOREIGN KEY (device_id) REFERENCES devices(id),
  UNIQUE(device_id, record_index)
);

-- Indexes for performance
CREATE INDEX idx_measurements_device_time
  ON measurements(device_id, timestamp);
CREATE INDEX idx_measurements_device_index
  ON measurements(device_id, record_index);
```

---

## User Flows

### 1. First-Time User Flow

```
1. Launch App
   │
   ├─> Welcome Screen (splash)
   │
   ├─> Request Permissions
   │   ├─ Bluetooth
   │   ├─ Location (required for BLE on Android)
   │   └─ Notifications
   │
   ├─> Tutorial (optional, can skip)
   │   ├─ How to connect device
   │   ├─ How to download data
   │   └─ How to view charts
   │
   └─> Main Screen (Device List)
       └─> Ready to scan
```

### 2. Device Connection Flow

```
1. Main Screen
   │
   ├─> Tap "Scan for Devices"
   │
   ├─> Scanning... (show spinner)
   │
   ├─> Devices Found
   │   ├─ Show device cards with:
   │   │  ├─ Device name
   │   │  ├─ Signal strength (RSSI)
   │   │  └─ Live temp/humidity (from advertising)
   │   │
   │   └─> Tap device card
   │
   ├─> Connecting... (show progress)
   │
   └─> Connected!
       │
       ├─> Navigate to Device Detail Screen
       │
       └─> Show options:
           ├─ View Live Data
           ├─ Download History
           └─ Device Settings
```

### 3. Data Download Flow

```
1. Device Detail Screen
   │
   ├─> Tap "Download History"
   │
   ├─> Fetch Device Info
   │   └─> Show: "Device has 5,432 records"
   │
   ├─> User confirms download
   │
   ├─> Download Progress Screen
   │   ├─ Progress bar (0-100%)
   │   ├─ Records downloaded: 1,234 / 5,432
   │   ├─ Estimated time remaining
   │   └─ Cancel button
   │
   ├─> Download Complete!
   │   └─> Success message
   │
   └─> Auto-navigate to Charts Screen
       └─> Display downloaded data
```

### 4. Data Viewing Flow

```
1. Charts Screen
   │
   ├─> Select Time Range
   │   ├─ Last 24 hours
   │   ├─ Last 7 days
   │   ├─ Last 30 days
   │   ├─ All time
   │   └─ Custom range
   │
   ├─> Select Chart Type
   │   ├─ Temperature only
   │   ├─ Humidity only
   │   └─ Combined (dual-axis)
   │
   ├─> View Chart
   │   ├─ Zoom: Pinch gesture
   │   ├─ Pan: Drag gesture
   │   └─ Tap point: Show tooltip
   │
   └─> View Statistics
       ├─ Min: 18.5°C @ 2023-10-01 03:45
       ├─ Max: 28.3°C @ 2023-10-01 15:20
       └─ Avg: 22.4°C
```

### 5. Data Export Flow

```
1. Data Screen (table view)
   │
   ├─> Tap "Export" button
   │
   ├─> Export Options Dialog
   │   ├─ Format:
   │   │  ├─ CSV
   │   │  └─ JSON
   │   │
   │   ├─ Date Range:
   │   │  ├─ All data
   │   │  └─ Custom range
   │   │
   │   └─ Confirm
   │
   ├─> Generate File
   │   └─> "Generating export..." (spinner)
   │
   ├─> File Ready
   │   └─> "Export complete: TempLog_2023-10-01.csv"
   │
   └─> Share Dialog
       ├─ Email
       ├─ Google Drive
       ├─ Save to Downloads
       └─ Other apps
```

---

## Features & Screens

### Screen 1: Device List (Home)

**Purpose**: Scan, discover, and connect to DataLogger devices

**Components**:
- Header with app title and settings icon
- Scan button (floating action button)
- List of discovered devices (cards)
- Empty state: "No devices found. Tap scan to search."

**Device Card Shows**:
- Device name
- Signal strength (RSSI bars)
- Live temperature (from advertising)
- Live humidity (from advertising)
- Connection status
- Last seen timestamp

**Actions**:
- Pull to refresh
- Tap card to connect
- Long press for options (forget, rename)

---

### Screen 2: Device Detail

**Purpose**: View live data and download history

**Components**:
- Connection status banner
- Large current temperature display
- Large current humidity display
- Battery indicator
- Last update time
- Statistics summary (today's min/max/avg)
- Download button
- Configure button

**Live Data Section**:
```
┌─────────────────────────────────────┐
│  Connected to: Temp&Humi Logger     │
│  Battery: 78% 🔋                    │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│         🌡️  Temperature             │
│                                     │
│            23.5°C                   │
│            74.3°F                   │
│                                     │
│  ━━━━━━━━━━●━━━━━━━━━━━━━━━        │
│  -10°C         23.5°C         35°C  │
│                                     │
│  Last updated: 2 seconds ago        │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│          💧  Humidity                │
│                                     │
│             65.2%                   │
│                                     │
│  ━━━━━━━━━━━━━●━━━━━━━━━━━━        │
│  30%          65.2%           90%   │
│                                     │
│  Last updated: 2 seconds ago        │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  📊  Today's Statistics              │
│                                     │
│  Min: 21.3°C at 04:30               │
│  Max: 26.8°C at 14:15               │
│  Avg: 23.9°C                        │
└─────────────────────────────────────┘

    [Download History]  [Settings]
```

---

### Screen 3: Charts

**Purpose**: Visualize historical data with interactive charts

**Components**:
- Time range selector (tabs or dropdown)
- Chart type selector (temperature / humidity / both)
- Interactive line chart with zoom/pan
- Statistics card below chart
- Export button

**Chart Features**:
- Smooth curves with gradient fill
- Dotted alarm threshold lines
- Touch to show tooltip with exact values
- Pinch to zoom
- Drag to pan
- Double tap to reset zoom

**Time Range Options**:
- Last 6 hours
- Last 24 hours
- Last 7 days
- Last 30 days
- All time
- Custom range (date picker)

---

### Screen 4: Data Table

**Purpose**: View, search, and export data in table format

**Components**:
- Search bar
- Filter button (date range, value range)
- Sort options (timestamp, temperature, humidity)
- Paginated table
- Export button

**Table Columns**:
| Timestamp | Temperature | Humidity | Status |
|-----------|-------------|----------|--------|
| 2023-10-01 14:30 | 23.5°C | 65.2% | ✅ |
| 2023-10-01 14:24 | 23.4°C | 65.5% | ✅ |
| 2023-10-01 14:18 | 24.1°C | 64.8% | ⚠️ |

**Status Indicators**:
- ✅ Normal (within thresholds)
- ⚠️ Warning (approaching threshold)
- ❌ Alarm (exceeded threshold)

---

### Screen 5: Settings

**Purpose**: Configure app and device settings

**Sections**:

1. **Device Settings** (requires connection)
   - Measurement interval
   - Temperature unit
   - Alarm thresholds
   - Device name
   - Clear device data
   - Reset to factory

2. **App Settings**
   - Theme (light/dark/auto)
   - Notifications enabled
   - Auto-download on connect
   - Chart preferences
   - Data retention period

3. **About**
   - App version
   - Device firmware version
   - User guide
   - Privacy policy
   - Licenses

---

## Performance Requirements

### Response Time
- App launch: < 2 seconds
- BLE scan start: < 500ms
- Device connection: < 3 seconds
- Live data update: < 100ms (from advertising)
- Chart render: < 1 second (for 10,000 points)
- Data download: ~100 records/second
- Database query: < 200ms
- Export generation: < 5 seconds (10,000 records)

### Resource Usage
- App size: < 50MB
- RAM usage: < 200MB
- Database size: ~1MB per 10,000 records
- Battery impact: Minimal (< 5% per hour when connected)

### Scalability
- Support up to 50,000 measurements per device
- Support up to 10 devices
- Chart rendering optimized for large datasets (downsampling)

---

## Security & Privacy

### Data Protection
- All data stored locally on device
- No cloud upload without explicit user action
- Secure BLE pairing (optional PIN)
- Export files are user-controlled

### Permissions
- **Bluetooth**: Required for device communication
- **Location**: Required by Android for BLE scanning
- **Storage**: For exporting files
- **Notifications**: For alerts (optional)

### Privacy
- No analytics or tracking
- No personal information collected
- Exported files contain only measurement data
- User can delete all data at any time

---

## Future Enhancements

1. **Multi-Device Support**: Connect to multiple loggers simultaneously
2. **Cloud Sync**: Optional cloud backup and sync across devices
3. **Advanced Analytics**: Trends, predictions, anomaly detection
4. **Custom Alerts**: SMS/email notifications for alarms
5. **PDF Reports**: Generate formatted reports with charts
6. **Widget**: Home screen widget showing current readings
7. **Wear OS**: Smartwatch companion app
8. **iOS Version**: Port to iOS platform
9. **Web Dashboard**: Browser-based data viewer
10. **API Access**: Export data to third-party services

---

## Summary

This mobile app specification defines a comprehensive, user-friendly application for:

✅ **Device Management**: Easy BLE discovery and connection
✅ **Real-Time Monitoring**: Live temperature and humidity display
✅ **Data Download**: Efficient bulk download from device flash
✅ **Visualization**: Interactive charts with zoom and pan
✅ **Data Export**: CSV and JSON export for analysis
✅ **Configuration**: Full device settings control
✅ **Performance**: Optimized for large datasets and low battery usage
✅ **Modern UI**: Material Design 3 with smooth animations

The app provides everything needed to make the CH592 DataLogger a complete, professional environmental monitoring solution.
