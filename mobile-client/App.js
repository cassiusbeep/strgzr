import * as React from 'react';
import { useEffect, useState } from "react";
import { Button, StyleSheet, Text, View, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as Location from "expo-location";
import { UsbSerial } from "react-native-usbserial";
import {NavigationContainer} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { useNavigation } from '@react-navigation/native/lib/typescript/src';



export default function App() {
  
  const [usbConnected, setUsbConnected] = useState(false);
  const Stack = createNativeStackNavigator();
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
          setUsbConnected(true);
          console.log(usbSerialDevice);
        }
      };
      getDevice();
    }
  }, []);


  function HomeScreen({ navigation }) { 
    useEffect(() => {
      if (usbConnected && usbs) {
        navigation.navigate('Dock')
      }
    }, [usbConnected])

    return (
      <View style={styles.container}>
        <Text>Compass heading: {Math.round(location?.trueHeading)}°</Text>
        <Text>Place phone in telescope dock!</Text>
      </View>
    );
  }

  function DockScreen({navigation}) { 
    return (
      <View style={styles.container}>
        <Text>Compass heading: {Math.round(location?.trueHeading)}°</Text>
        <Button onPress={() => {navigation.goBack()}}></Button>
      </View>
    );
  }

  function TelescopeScreen({navigation}) { 
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
