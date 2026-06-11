export const BLUETOOTH_SERVICE_UUID = 0x1810; // Blood Pressure Service
export const CHARACTERISTIC_UUID = 0x2A35; // Blood Pressure Measurement

export class BLEService {
    constructor() {
        this.device = null;
        this.server = null;
    }

    async connect(onDataReceived) {
        try {
            console.log('Requesting Bluetooth Device...');
            this.device = await navigator.bluetooth.requestDevice({
                filters: [{ services: [BLUETOOTH_SERVICE_UUID] }]
            });

            console.log('Connecting to GATT Server...');
            this.server = await this.device.gatt.connect();

            console.log('Getting Service...');
            const service = await this.server.getPrimaryService(BLUETOOTH_SERVICE_UUID);

            console.log('Getting Characteristic...');
            const characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID);

            console.log('Starting Notifications...');
            await characteristic.startNotifications();

            characteristic.addEventListener('characteristicvaluechanged', (event) => {
                const value = event.target.value;
                const reading = this.parseBloodPressure(value);
                if (reading) {
                    onDataReceived(reading);
                }
            });

            console.log('Connected!');
            return true;
        } catch (error) {
            console.error('Argh! ' + error);
            return false;
        }
    }

    disconnect() {
        if (this.device && this.device.gatt.connected) {
            this.device.gatt.disconnect();
        }
    }

    // Parse the Blob/DataView from the device
    parseBloodPressure(value) {
        // The Blood Pressure Measurement characteristic is complex.
        // Flags (8bit) determine functionality.
        // Byte 0: Flags
        let flags = value.getUint8(0);

        let measurement = {};
        let offset = 1;

        // Check Flag for Units (0 = mmHg, 1 = kPa)
        // We assume mmHg for this app, but should check bit 0
        const isKpa = flags & 1;

        // Systolic, Diastolic, Mean Arterial Pressure (SFLOAT - 16bit)
        // If mmHg, these are SFLOAT. SFLOAT is standard IEEE-11073 16-bit float
        // But for simplicity in many simple devices it's often Uint16 or requires specific parsing
        // We'll use getFloat32 or Uint16 based on standard simple implementations
        // Standard says: 
        // Systolic (SFLOAT)
        // Diastolic (SFLOAT)
        // MAP (SFLOAT)

        // Let's assume standard layout for common devices:
        // SFLOAT is 16 bit. 
        try {
            // Helper to parsing SFLOAT (IEEE 11073-20601)
            // Ideally we need a robust parser, but here is a simplified version
            const getSFloat = (dataview, idx) => {
                const data = dataview.getUint16(idx, true); // Little Endian
                const mantissa = ((data & 0x0FFF) << 4) >> 4; // Sign extend 12 bit to 16 bit
                const exponent = ((data & 0xF000) >> 12);
                // Handle sign of exponent (4 bit 2's complement)
                const signedExponent = exponent >= 8 ? exponent - 16 : exponent;
                return mantissa * Math.pow(10, signedExponent);
            };

            const systolic = getSFloat(value, offset);
            offset += 2;
            const diastolic = getSFloat(value, offset);
            offset += 2;
            const map = getSFloat(value, offset); // Mean Arterial Pressure
            offset += 2;

            measurement.systolic = Math.round(systolic);
            measurement.diastolic = Math.round(diastolic);

            // Pulse Rate? Check Flag bit 2 (0x04)
            if (flags & 0x04) {
                // Next is Timestamp if bit 1 set, but usually Pulse matches this order if present?
                // Standard order: Units -> TimeStamp(if bit1) -> Pulse(if bit2) -> UserID(if bit3) -> Status(if bit4)

                // If TimeStamp bit (0x02) is set, skip 7 bytes (Year2, Mon1, Day1, Hour1, Min1, Sec1)
                if (flags & 0x02) {
                    offset += 7;
                }

                const pulse = getSFloat(value, offset);
                measurement.heart_rate = Math.round(pulse);
            }

            return measurement;

        } catch (err) {
            console.error("Error parsing BLE data", err);
            return null;
        }
    }
}
