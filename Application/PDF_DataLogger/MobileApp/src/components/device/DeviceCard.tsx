import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, Text, Icon, useTheme, Chip } from 'react-native-paper';
import { BLEDevice } from '../../types/device';
import { parseAdvertisingData } from '../../services/ble/DataParser';

interface DeviceCardProps {
  device: BLEDevice;
  onPress: () => void;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ device, onPress }) => {
  const theme = useTheme();

  // Parse live data from advertising
  const liveData = parseAdvertisingData(device.advertising);

  // Get signal strength indicator
  const getSignalStrength = (rssi: number): { bars: number; color: string } => {
    if (rssi > -60) return { bars: 3, color: theme.custom.colors.success.main };
    if (rssi > -75) return { bars: 2, color: theme.custom.colors.warning.main };
    return { bars: 1, color: theme.custom.colors.error.main };
  };

  const signal = getSignalStrength(device.rssi);

  // Temperature color based on value
  const getTempColor = (temp: number): string => {
    if (temp < 10) return theme.custom.colors.temperature.cold;
    if (temp < 20) return theme.custom.colors.temperature.cool;
    if (temp < 30) return theme.custom.colors.temperature.warm;
    return theme.custom.colors.temperature.hot;
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card} elevation={2}>
        <Card.Content>
          {/* Header Row */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Icon source="bluetooth" size={24} color={theme.colors.primary} />
              <Text variant="titleMedium" style={styles.deviceName}>
                {device.name}
              </Text>
            </View>
            <View style={styles.signalContainer}>
              {[...Array(3)].map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.signalBar,
                    {
                      height: 8 + index * 4,
                      backgroundColor:
                        index < signal.bars ? signal.color : theme.colors.surfaceVariant,
                    },
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Device ID */}
          <Text variant="bodySmall" style={[styles.deviceId, { color: theme.colors.secondary }]}>
            {device.id}
          </Text>

          {/* Live Data */}
          {liveData && (
            <View style={styles.liveDataContainer}>
              <View style={styles.readingRow}>
                {/* Temperature */}
                <View style={styles.reading}>
                  <Icon
                    source="thermometer"
                    size={20}
                    color={getTempColor(liveData.temperature)}
                  />
                  <Text
                    variant="titleLarge"
                    style={[styles.value, { color: getTempColor(liveData.temperature) }]}
                  >
                    {liveData.temperature.toFixed(1)}°C
                  </Text>
                </View>

                {/* Humidity */}
                <View style={styles.reading}>
                  <Icon
                    source="water"
                    size={20}
                    color={theme.custom.colors.humidity.normal}
                  />
                  <Text
                    variant="titleLarge"
                    style={[styles.value, { color: theme.custom.colors.humidity.normal }]}
                  >
                    {liveData.humidity.toFixed(1)}%
                  </Text>
                </View>
              </View>

              <Chip
                icon="access-point"
                textStyle={styles.liveChipText}
                style={[styles.liveChip, { backgroundColor: theme.custom.colors.success.light }]}
              >
                Live
              </Chip>
            </View>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deviceName: {
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  deviceId: {
    marginBottom: 12,
    opacity: 0.7,
  },
  signalContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  signalBar: {
    width: 4,
    borderRadius: 2,
  },
  liveDataContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    paddingTop: 12,
  },
  readingRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  reading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  value: {
    fontWeight: '600',
  },
  liveChip: {
    alignSelf: 'flex-end',
  },
  liveChipText: {
    fontSize: 10,
  },
});

export default DeviceCard;
