import * as React from "react";
import { useEffect, useState } from "react";
import {
  Button,
  StyleSheet,
  Text,
  View,
  Platform,
  DeviceEventEmitter,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import * as Location from "expo-location";
import { RNSerialport, Definitions, Actions } from "react-native-serialport";

export default function App() {
  const [usbConnected, setUsbConnected] = useState(false);
  const [location, setLocation] = useState(null);
  let serialPort: SerialPort;

  const Stack = createNativeStackNavigator();

  useEffect(() => {
    const watchLocation = async () => {
      await Location.requestForegroundPermissionsAsync();
      Location.watchHeadingAsync((location) => {
        setLocation(location);
      });
    };

    watchLocation();

    RNSerialport.setAutoConnectBaudRate(9600);
    RNSerialport.setAutoConnect(true);
    RNSerialport.startUsbService();
  }, []);

  function HomeScreen({ navigation }) {
    useEffect(() => {
      DeviceEventEmitter.addListener(Actions.ON_CONNECTED, () =>
        setUsbConnected(true)
      );
    }, []);
    useEffect(() => {
      if (usbConnected) {
        navigation.navigate("Dock");
      }
    }, [usbConnected]);

    return (
      <View style={styles.container}>
        <Text>Compass heading: {Math.round(location?.trueHeading)}°</Text>
        <Text>Place phone in telescope dock!</Text>
      </View>
    );
  }

  async function DockScreen({ navigation }) {
    useEffect(() => {
      DeviceEventEmitter.addListener(Actions.ON_DISCONNECTED, () =>
        setUsbConnected(false)
      );

      DeviceEventEmitter.addListener(Actions.ON_READ_DATA, (data) => {
        console.log(data);
      });

      const send = async (data) => {
        await serialPort.send(data);
      };
      send("Hello");
    }, []);

    return (
      <View style={styles.container}>
        <Text>Compass heading: {Math.round(location?.trueHeading)}°</Text>
        <Button
          onPress={() => {
            navigation.goBack();
          }}
        ></Button>
      </View>
    );
  }

  function TelescopeScreen({ navigation }) {
    return (
      <View style={styles.container}>
        <Text>Compass heading: {Math.round(location?.trueHeading)}°</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          style={styles.container}
        />
        <Stack.Screen
          name="Dock"
          component={DockScreen}
          style={styles.container}
        />
        <Stack.Screen
          name="Telescope"
          component={TelescopeScreen}
          style={styles.container}
        />
      </Stack.Navigator>
    </NavigationContainer>
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
