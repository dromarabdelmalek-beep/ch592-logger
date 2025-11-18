import { Platform, PermissionsAndroid, Alert } from 'react-native';
import { PERMISSIONS, request, checkMultiple, RESULTS } from 'react-native-permissions';

export async function requestPermissions(): Promise<boolean> {
  if (Platform.OS === 'ios') {
    return requestIOSPermissions();
  } else {
    return requestAndroidPermissions();
  }
}

async function requestAndroidPermissions(): Promise<boolean> {
  try {
    const apiLevel = Platform.Version;

    let permissions: string[] = [
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    ];

    // Android 12+ (API 31+) requires new Bluetooth permissions
    if (apiLevel >= 31) {
      permissions = [
        ...permissions,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ];
    } else {
      permissions = [
        ...permissions,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADMIN,
      ];
    }

    // Android 13+ requires notification permission
    if (apiLevel >= 33) {
      permissions.push(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    }

    const results = await PermissionsAndroid.requestMultiple(permissions);

    // Check if all required permissions are granted
    const requiredGranted = Object.values(results).every(
      result => result === PermissionsAndroid.RESULTS.GRANTED
    );

    if (!requiredGranted) {
      Alert.alert(
        'Permissions Required',
        'Bluetooth and Location permissions are required to scan for devices. ' +
        'Please enable them in your device settings.',
        [{ text: 'OK' }]
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error('Permission request error:', error);
    return false;
  }
}

async function requestIOSPermissions(): Promise<boolean> {
  try {
    const statuses = await checkMultiple([
      PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL,
      PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
    ]);

    const bluetoothStatus = statuses[PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL];
    const locationStatus = statuses[PERMISSIONS.IOS.LOCATION_WHEN_IN_USE];

    if (bluetoothStatus !== RESULTS.GRANTED) {
      const result = await request(PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL);
      if (result !== RESULTS.GRANTED) {
        return false;
      }
    }

    if (locationStatus !== RESULTS.GRANTED) {
      const result = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
      if (result !== RESULTS.GRANTED) {
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Permission request error:', error);
    return false;
  }
}

export async function checkPermissions(): Promise<boolean> {
  if (Platform.OS === 'ios') {
    return checkIOSPermissions();
  } else {
    return checkAndroidPermissions();
  }
}

async function checkAndroidPermissions(): Promise<boolean> {
  try {
    const apiLevel = Platform.Version;

    let permissions: string[] = [
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    ];

    if (apiLevel >= 31) {
      permissions = [
        ...permissions,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ];
    } else {
      permissions = [
        ...permissions,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADMIN,
      ];
    }

    const results = await PermissionsAndroid.requestMultiple(permissions);

    return Object.values(results).every(
      result => result === PermissionsAndroid.RESULTS.GRANTED
    );
  } catch (error) {
    console.error('Permission check error:', error);
    return false;
  }
}

async function checkIOSPermissions(): Promise<boolean> {
  try {
    const statuses = await checkMultiple([
      PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL,
      PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
    ]);

    return Object.values(statuses).every(status => status === RESULTS.GRANTED);
  } catch (error) {
    console.error('Permission check error:', error);
    return false;
  }
}
