import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Text,
  FAB,
  Searchbar,
  Chip,
  useTheme,
  Portal,
  Dialog,
  Button,
} from 'react-native-paper';
import { BLEDevice } from '../types/device';
import DeviceCard from '../components/device/DeviceCard';
import EmptyState from '../components/common/EmptyState';
import { requestPermissions } from '../utils/permissions';

const HomeScreen: React.FC = () => {
  const theme = useTheme();
  const [devices, setDevices] = useState<BLEDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'rssi'>('rssi');
  const [permissionDialogVisible, setPermissionDialogVisible] = useState(false);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) {
      setPermissionDialogVisible(true);
    }
  };

  const handleStartScan = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) {
      setPermissionDialogVisible(true);
      return;
    }

    setIsScanning(true);
    setDevices([]);

    try {
      // BLE scanning logic will be implemented in BLEService
      // For now, showing mock data
      setTimeout(() => {
        const mockDevices: BLEDevice[] = [
          {
            id: 'AA:BB:CC:DD:EE:FF',
            name: 'Temp&Humi Logger',
            rssi: -65,
            advertising: {
              manufacturerData: {
                companyId: 0x07D7,
                data: [0xD7, 0x07, 0x00, 0x00, 0x90, 0x41, 0x00, 0x00, 0x50, 0x42],
              },
            },
          },
        ];
        setDevices(mockDevices);
        setIsScanning(false);
      }, 2000);
    } catch (error) {
      Alert.alert('Scan Error', 'Failed to start BLE scan');
      setIsScanning(false);
    }
  };

  const handleDevicePress = (device: BLEDevice) => {
    // Navigate to device detail screen
    // navigation.navigate('DeviceDetail', { device });
    console.log('Selected device:', device.name);
  };

  const filteredDevices = devices.filter(device =>
    device.name.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    return b.rssi - a.rssi; // Higher RSSI first
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Devices
        </Text>
        <Text variant="bodyMedium" style={{ color: theme.colors.secondary }}>
          Scan for nearby temperature loggers
        </Text>
      </View>

      {/* Search Bar */}
      <Searchbar
        placeholder="Search devices..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
        loading={isScanning}
      />

      {/* Sort Chips */}
      <View style={styles.chipContainer}>
        <Text variant="labelMedium" style={styles.chipLabel}>
          Sort by:
        </Text>
        <Chip
          selected={sortBy === 'rssi'}
          onPress={() => setSortBy('rssi')}
          style={styles.chip}
        >
          Signal Strength
        </Chip>
        <Chip
          selected={sortBy === 'name'}
          onPress={() => setSortBy('name')}
          style={styles.chip}
        >
          Name
        </Chip>
      </View>

      {/* Device List */}
      {devices.length === 0 && !isScanning ? (
        <EmptyState
          icon="bluetooth-off"
          title="No devices found"
          message="Tap the scan button to search for nearby devices"
        />
      ) : (
        <FlatList
          data={filteredDevices}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <DeviceCard
              device={item}
              onPress={() => handleDevicePress(item)}
            />
          )}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={isScanning}
              onRefresh={handleStartScan}
              colors={[theme.colors.primary]}
            />
          }
        />
      )}

      {/* Scan FAB */}
      <FAB
        icon={isScanning ? 'loading' : 'bluetooth-search'}
        label={isScanning ? 'Scanning...' : 'Scan'}
        onPress={handleStartScan}
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        disabled={isScanning}
        loading={isScanning}
      />

      {/* Permission Dialog */}
      <Portal>
        <Dialog visible={permissionDialogVisible} onDismiss={() => setPermissionDialogVisible(false)}>
          <Dialog.Icon icon="alert-circle" />
          <Dialog.Title>Permissions Required</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              This app needs Bluetooth and Location permissions to scan for devices.
              Please enable them in your device settings.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setPermissionDialogVisible(false)}>Cancel</Button>
            <Button onPress={checkPermissions}>Check Again</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  searchBar: {
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 2,
  },
  chipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  chipLabel: {
    marginRight: 8,
    opacity: 0.7,
  },
  chip: {
    marginRight: 8,
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});

export default HomeScreen;
