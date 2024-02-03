import { useEffect, useState } from "react";
import {
  Button,
  StyleSheet,
  Text,
  View,
  DeviceEventEmitter,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import * as Location from "expo-location";
import { RNSerialport, definitions, actions } from "react-native-serialport";

export default function App() {
  const [location, setLocation] = useState(null);
  const [attached, setAttached] = useState(false);
  const [output, setOutput] = useState("");

  useEffect(() => {
    (async () => {
      await Location.requestForegroundPermissionsAsync();
      Location.watchHeadingAsync((location) => {
        setLocation(location);
      });
    })();

    DeviceEventEmitter.addListener(actions.ON_DEVICE_ATTACHED, () => {
      setAttached(true);
    });

    DeviceEventEmitter.addListener(actions.ON_DEVICE_DETACHED, () => {
      setAttached(false);
    });

    DeviceEventEmitter.addListener(actions.ON_ERROR, (error) => {
      console.log("Error", error);
    });

    DeviceEventEmitter.addListener(actions.ON_READ_DATA, (data) => {
      setOutput(
        (prevOutput) => prevOutput + RNSerialport.hexToUtf16(data.payload)
      );
    });

    RNSerialport.setReturnedDataType(definitions.RETURNED_DATA_TYPES.HEXSTRING);
    RNSerialport.setAutoConnect(true);
    RNSerialport.setAutoConnectBaudRate(9600);
    RNSerialport.startUsbService();

    return () => {
      DeviceEventEmitter.removeAllListeners();
      RNSerialport.disconnect();
      RNSerialport.stopUsbService();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text>Compass heading: {Math.round(location?.trueHeading)}°</Text>
      <Text>Connection status: {attached ? "Connected" : "Disconnected"}</Text>
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
