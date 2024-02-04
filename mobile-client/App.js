import { useEffect, useState } from "react";
import { Button, StyleSheet, Text, View, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as Location from "expo-location";
import { UsbSerial } from "react-native-usbserial";
import {NavigationContainer} from '@react-navigation/native-stack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';


function HomeScreen() { 
  return (
    <View style={styles.container}>
      <Text>Compass heading: {Math.round(location?.trueHeading)}°</Text>
    </View>
  );
}

const Stack = createNativeStackNavigator();

export default function App() {
  const [location, setLocation] = useState(null);
  
  let usbs;

  useEffect(() => {
    const watchLocation = async () => {
      await Location.requestForegroundPermissionsAsync();
      Location.watchHeadingAsync((location) => {
        setLocation(location);
      });
    };

    watchLocation();

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
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeScreen}
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
