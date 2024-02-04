import * as React from 'react';
import { useEffect, useState } from "react";
import { Button, StyleSheet, Text, View, Platform, FlatList } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as Location from "expo-location";
import { UsbSerial } from "react-native-usbserial";
import {NavigationContainer} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

export default function App() {
  
  const [usbConnected, setUsbConnected] = useState(false);
  const Stack = createNativeStackNavigator();
  const [location, setLocation] = useState(null);
  const [long, setLong] = useState(null);
  const [lat, setLat] = useState(null);
  const [azimuth, setAzimuth] = useState(null);
  const [altitude, setAltitude] = useState(null);
  const axios = require('axios');

  const getDirections = async (long, lat, planet) => {
    console.log('checkpoint 1');
    axios.get('http://server.milesacq.com:7892/calculate_distance', 
    {longitude: long,
      latitude: lat,
      planet: planet})
    /*axios({
      method: 'get',
      url: 'http://server.milesacq.com:7892/calculate_distance', 
      params: 
        {
          longitude: long,
          latitude: lat,
          planet: planet
        },
    })*/.then((response) => {
      console.log('checkpoint 2');
      setAzimuth(response.data.Azimuth);
      setAltitude(response.data.Altitude);
    }, (error) => {
      console.log(error);
    })
  }

  const getPlanets = (long, lat, direction) => {
    planetRouter.get(
      "http://server.milesacq.com:7892/closest_planet", {
        params: {
          longitude,
          latitude,
          direction
        }
      }
    )
  }
  
  let usbs;

  useEffect(() => {
    const watchLocation = async () => {
      await Location.requestForegroundPermissionsAsync();
      Location.watchHeadingAsync((location) => {
        setLocation(location);
      });
    };

    const watchPosition = async () => {
      await Location.requestForegroundPermissionsAsync();
      await Location.watchPositionAsync({}, (location) => {
        setLong(location.coords.longitude);
        setLat(location.coords.latitude);
      })
    }

    watchLocation();
    watchPosition();

    if (Platform.OS === "android") {
      usbs = new UsbSerial();
      const getDevice = async () => {
        const deviceList = await usbs?.getDeviceListAsync();
        const firstDevice = deviceList[0];
        console.log(firstDevice);

        if (firstDevice) {
          const usbSerialDevice = await usbs?.openDeviceAsync(firstDevice);
          setUsbConnected(true);
          console.log(usbSerialDevice);
        }
      };
      getDevice();
    }
  }, []);

  useEffect(() => {

  })

  const BODIES = [
    {
      id: '1',
      title: 'Venus',
    },
    {
      id: '2',
      title: 'Jupiter',
    },
    {
      id: '3',
      title: 'Mars',
    },
  ];

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
        <Button onPress={() => {
          navigation.navigate('Dock')}} title={"Search the Stars"}></Button>
      </View>
    );
  }

  function moveArm({navigation, planetName}) {
    console.log('move arm');
    getDirections(long, lat, planetName).then(() => {
      console.log('inside get directions');
      // work out number of 5.625° steps to take to point there
      if (altitude < 0 || altitude > 90) {
        console.log(planetName + "not visible");
        // dont move the arm!
      } else {
        // TODO: check if this is appropriate calibration to turn the middle wheel
        const xSteps = Math.round(((azimuth - location?.trueHeading)/5.625)*0.5);
        const ySteps = Math.round(altitude/5.625);
        const dirString = xSteps + "," + ySteps;
        console.log("direction string: ")
        console.log(dirString);
        // TODO: send new azimuth and altitude to the arduino
        navigation.navigate('TelescopeScreen');
      }
    });
  }

  function DockScreen({navigation}) { 
    return (
      <View style={styles.container}>
        <Text>Compass heading: {Math.round(location?.trueHeading)}°</Text>
        <Button title={"sun"} onPress={(title) => moveArm(navigation, title)}></Button>
        <Button onPress={() => {navigation.goBack()}} title={"back"}></Button>
        
        {/* <SafeAreaView style={styles.container}>
          <FlatList
            data={BODIES}
            renderItem={({id, title}) => 
                {return (
                  <View style={styles.container}>
                    <Button onPress={(title) => moveArm(navigation, title)} title={title}></Button>
                  </View>)
                }}
            keyExtractor={item => item.id}
          />
        </SafeAreaView> */}
      </View>
    );
  }

  function TelescopeScreen({planet, navigation}) { 
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
    width: '100%'
  },
});
