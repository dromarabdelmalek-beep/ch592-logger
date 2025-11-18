# TempHumi Logger - React Native Mobile App

Modern mobile application for the CH592 Temperature & Humidity DataLogger.

## Features

- 📱 Modern Material Design UI
- 🔵 BLE device discovery and connection
- 📊 Real-time temperature and humidity monitoring
- 📈 Interactive charts with zoom and pan
- 💾 Download and store historical data
- 📤 Export data as CSV or JSON
- ⚙️ Device configuration
- 🔔 Alarm notifications
- 🌓 Light/Dark theme support

## Prerequisites

- Node.js >= 16
- React Native CLI
- Android Studio (for Android development)
- Android SDK with API level 30+

## Installation

```bash
# Install dependencies
npm install

# Install iOS pods (Mac only)
cd ios && pod install && cd ..
```

## Running the App

```bash
# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS (Mac only)
npm run ios
```

## Project Structure

```
src/
├── screens/          # Screen components
├── components/       # Reusable UI components
├── services/         # Business logic (BLE, storage, export)
├── store/           # Redux state management
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
├── hooks/           # Custom React hooks
├── theme/           # Theme configuration
├── assets/          # Images, fonts, etc.
└── navigation/      # Navigation configuration
```

## Key Technologies

- **React Native**: Cross-platform mobile framework
- **TypeScript**: Type-safe JavaScript
- **React Navigation**: Screen navigation
- **Redux Toolkit**: State management
- **React Native Paper**: Material Design components
- **BLE Manager**: Bluetooth Low Energy communication
- **Chart Kit**: Data visualization
- **SQLite**: Local database

## BLE Protocol

The app communicates with the CH592 DataLogger using:

- **Service UUID**: `FFE0`
- **Write Characteristic**: `FFE3` (commands)
- **Notify Characteristic**: `FFE4` (data)

See [BLE_PROTOCOL_QUICK_REFERENCE.md](../BLE_PROTOCOL_QUICK_REFERENCE.md) for details.

## Building for Production

```bash
# Android
cd android && ./gradlew assembleRelease

# iOS (Mac only)
cd ios && xcodebuild -scheme TempHumiLogger -configuration Release
```

## Testing

```bash
# Run unit tests
npm test

# Type checking
npm run type-check

# Linting
npm run lint
```

## Permissions

The app requires these permissions:

### Android
- `BLUETOOTH` - BLE communication
- `BLUETOOTH_ADMIN` - BLE operations
- `BLUETOOTH_SCAN` - Device discovery (Android 12+)
- `BLUETOOTH_CONNECT` - Device connection (Android 12+)
- `ACCESS_FINE_LOCATION` - Required for BLE scanning
- `WRITE_EXTERNAL_STORAGE` - Export files
- `POST_NOTIFICATIONS` - Alarm notifications (Android 13+)

### iOS
- `NSBluetoothAlwaysUsageDescription` - BLE access
- `NSLocationWhenInUseUsageDescription` - Location for BLE

## Troubleshooting

### BLE not working
1. Enable Bluetooth on device
2. Grant location permission (required for BLE on Android)
3. Ensure device is in range (<10 meters)

### Build errors
1. Clear cache: `npm start -- --reset-cache`
2. Clean build: `cd android && ./gradlew clean`
3. Reinstall dependencies: `rm -rf node_modules && npm install`

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

Copyright (c) 2023. All rights reserved.

## Support

For issues and questions:
- Check [MOBILE_APP_INTEGRATION_GUIDE.md](../MOBILE_APP_INTEGRATION_GUIDE.md)
- Review [MOBILE_APP_SPECIFICATION.md](../MOBILE_APP_SPECIFICATION.md)
