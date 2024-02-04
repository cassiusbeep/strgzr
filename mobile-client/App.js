import { useEffect, useState } from "react";
import {
  Button,
  StyleSheet,
  Text,
  View,
  Platform,
  PermissionsAndroid,
  NativeEventEmitter,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import * as Location from "expo-location";
import BleManager, {
  BleDisconnectPeripheralEvent,
  BleManagerDidUpdateValueForCharacteristicEvent,
  BleScanCallbackType,
  BleScanMatchMode,
  BleScanMode,
  Peripheral,
} from "react-native-ble-manager";

const SECONDS_TO_SCAN_FOR = 10;
const SERVICE_UUIDS = ["00001101-0000-1000-8000-00805f9b34fb"];
const ALLOW_DUPLICATES = true;

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

export default function App() {
  const [location, setLocation] = useState(null);

  useEffect(() => {
    const watchLocation = async () => {
      await Location.requestForegroundPermissionsAsync();
      Location.watchHeadingAsync((location) => {
        setLocation(location);
      });
    };

    const requestBluetoothPermission = async () => {
      if (Platform.OS === "ios") {
        return true;
      }
      if (
        Platform.OS === "android" &&
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      ) {
        const apiLevel = parseInt(Platform.Version.toString(), 10);

        if (apiLevel < 31) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
        if (
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN &&
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
        ) {
          const result = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          ]);

          return (
            result["android.permission.BLUETOOTH_CONNECT"] ===
              PermissionsAndroid.RESULTS.GRANTED &&
            result["android.permission.BLUETOOTH_SCAN"] ===
              PermissionsAndroid.RESULTS.GRANTED &&
            result["android.permission.ACCESS_FINE_LOCATION"] ===
              PermissionsAndroid.RESULTS.GRANTED
          );
        }
      }

      return false;
    };

    const startScan = async () => {
      await BleManager.scan(
        SERVICE_UUIDS,
        SECONDS_TO_SCAN_FOR,
        ALLOW_DUPLICATES,
        {
          matchMode: BleScanMatchMode.Sticky,
          scanMode: BleScanMode.LowLatency,
          callbackType: BleScanCallbackType.AllMatches,
        }
      );
    };

    BleManager.start({ showAlert: false })
      .then(() => console.debug("BleManager started."))
      .catch((error) =>
        console.error("BeManager could not be started.", error)
      );

    const listeners = [
      bleManagerEmitter.addListener(
        "BleManagerDiscoverPeripheral",
        async (peripheral) => {
          await connectDevice(peripheral);
        }
      ),
      bleManagerEmitter.addListener("BleManagerConnectPeripheral", (device) => {
        console.log("Connected to device", device.id);
      }),
      bleManagerEmitter.addListener(
        "BleManagerDisconnectPeripheral",
        (device) => {
          console.log("Disconnected from device", device.id);
        }
      ),
    ];

    requestBluetoothPermission();
    watchLocation();
    startScan();

    return () => {
      listeners.forEach((listener) => listener.remove());
    };
  }, []);

  const connectDevice = async (peripheral: Peripheral) => {
    try {
      await BleManager.connect(peripheral.id);
      console.log("Connected to", peripheral.id);
      await sleep(900);
      const peripheralData = await BleManager.retrieveServices(peripheral.id);
      await BleManager.write(
        peripheral.id,
        peripheralData.characteristics[0].service,
        peripheralData.characteristics[0].characteristic,
        new TextEncoder().encode("hello")
      );
    } catch (error) {
      console.error("Could not connect to", peripheral.id, error);
    }
  };

  return (
    <View style={styles.container}>
      <Text>Compass heading: {Math.round(location?.trueHeading)}°</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
