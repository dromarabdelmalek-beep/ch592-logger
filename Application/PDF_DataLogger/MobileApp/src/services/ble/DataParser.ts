import { LiveData } from '../../types/device';

/**
 * Parse manufacturer-specific advertising data
 * Format: Company ID (2 bytes) + Temperature (float32) + Humidity (float32)
 */
export function parseAdvertisingData(
  advertising?: {
    manufacturerData?: {
      companyId: number;
      data: number[];
    };
  }
): LiveData | null {
  if (!advertising?.manufacturerData) {
    return null;
  }

  const { companyId, data } = advertising.manufacturerData;

  // Verify WCH company ID
  if (companyId !== 0x07D7) {
    return null;
  }

  // Need at least 10 bytes: companyId(2) + temp(4) + humi(4)
  if (data.length < 10) {
    return null;
  }

  try {
    // Skip company ID bytes (0-1), parse temperature (2-5) and humidity (6-9)
    const tempBytes = data.slice(2, 6);
    const humiBytes = data.slice(6, 10);

    // Convert bytes to float32 (little-endian)
    const temperature = bytesToFloat32(tempBytes);
    const humidity = bytesToFloat32(humiBytes);

    return {
      temperature,
      humidity,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('Error parsing advertising data:', error);
    return null;
  }
}

/**
 * Convert 4 bytes to float32 (little-endian)
 */
function bytesToFloat32(bytes: number[]): number {
  if (bytes.length !== 4) {
    throw new Error('Invalid byte array length for float32');
  }

  const buffer = new ArrayBuffer(4);
  const view = new DataView(buffer);

  // Set bytes in little-endian order
  bytes.forEach((byte, index) => {
    view.setUint8(index, byte);
  });

  return view.getFloat32(0, true); // true = little-endian
}

/**
 * Parse measurement data notification
 * Format: ResponseCode(1) + StartIndex(2) + Count(2) + Records(4 bytes each)
 */
export function parseDataNotification(bytes: number[]): {
  startIndex: number;
  records: { temperature: number; humidity: number }[];
} | null {
  if (bytes.length < 5) {
    return null;
  }

  const responseCode = bytes[0];

  // Data range response
  if (responseCode === 0x21) {
    const startIndex = bytes[1] | (bytes[2] << 8);
    const count = bytes[3] | (bytes[4] << 8);

    const records: { temperature: number; humidity: number }[] = [];

    for (let i = 0; i < count; i++) {
      const offset = 5 + i * 4;

      if (offset + 4 > bytes.length) {
        break;
      }

      // Parse int16 values (little-endian)
      let tempRaw = bytes[offset] | (bytes[offset + 1] << 8);
      let humiRaw = bytes[offset + 2] | (bytes[offset + 3] << 8);

      // Convert to signed int16
      if (tempRaw > 32767) tempRaw -= 65536;
      if (humiRaw > 32767) humiRaw -= 65536;

      // Convert to actual values (stored as value * 100)
      const temperature = tempRaw / 100.0;
      const humidity = humiRaw / 100.0;

      records.push({ temperature, humidity });
    }

    return { startIndex, records };
  }

  return null;
}

/**
 * Calculate timestamp for a measurement based on device start time and index
 */
export function calculateTimestamp(
  startTime: number,
  recordIndex: number,
  intervalMinutes: number
): number {
  const offsetMs = recordIndex * intervalMinutes * 60 * 1000;
  return startTime + offsetMs;
}

/**
 * Convert temperature between Celsius and Fahrenheit
 */
export function convertTemperature(
  value: number,
  from: 'C' | 'F',
  to: 'C' | 'F'
): number {
  if (from === to) return value;

  if (from === 'C' && to === 'F') {
    return (value * 9) / 5 + 32;
  } else {
    return ((value - 32) * 5) / 9;
  }
}
