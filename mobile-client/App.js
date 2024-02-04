import { useEffect, useState } from "react";
import {
  Button,
  StyleSheet,
  Text,
  View,
  Platform,
  PermissionsAndroid,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import * as Location from "expo-location";
import { UsbSerial } from "react-native-usbserial";
import { BleManager } from "react-native-ble-plx";

export default function App() {
  const [location, setLocation] = useState(null);

  const manager = new BleManager();
  let usbs;

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

    if (Platform.OS === "android") {
      usbs = new UsbSerial();
      const getDevice = async () => {
        const deviceList = await usbs.getDeviceListAsync();
        const firstDevice = deviceList[0];
        console.log(firstDevice);

        if (firstDevice) {
          const usbSerialDevice = await usbs.openDeviceAsync(firstDevice);
          console.log(usbSerialDevice);
        }
      };

      getDevice();
    }

    requestBluetoothPermission();
    watchLocation();
  }, []);

  useEffect(() => {
    const subscription = manager.onStateChange((state) => {
      if (state === "PoweredOn") {
        scanAndConnect();
        subscription.remove();
      }
    }, true);
    return () => subscription.remove();
  }, [manager]);

  const scanAndConnect = () => {
    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error(error);
        return;
      }

      if (device.name === "HC-05") {
        // Stop scanning as it's not necessary if you are scanning for one device.
        manager.stopDeviceScan();

        device
          .connect({ autoConnect: true })
          .then((device) => {
            console.log("Connected to device", device.id);
          })
          .catch((error) => {
            console.error(error);
          });
      }
    });
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
