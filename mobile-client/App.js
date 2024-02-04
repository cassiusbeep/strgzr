import * as React from 'react';
import { useEffect, useState } from "react";
import { Pressable, Button, StyleSheet, Text, View, Platform, FlatList, SafeAreaView, Modal } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as Location from "expo-location";
import { UsbSerial } from "react-native-usbserial";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import axios from 'axios';

export default function App() {

  const [usbConnected, setUsbConnected] = useState(false);
  const Stack = createNativeStackNavigator();
  const [location, setLocation] = useState(null);
  const [long, setLong] = useState(null);
  const [lat, setLat] = useState(null);
  const [azimuth, setAzimuth] = useState(null);
  const [altitude, setAltitude] = useState(null);
  const [lastDirs, setLastDirs] = useState(null);
  const [currentPlanet, setCurrentPlanet] = useState("");
  const [invisErrorOpen, setInvisErrorOpen] = useState(false);

  const getDirections = (long, lat, planet) => {
    axios.get('http://server.milesacq.com:7892/calculate_distance',
      {
        params: {
          longitude: long,
          latitude: lat,
          planet: planet,
          heading: location
        }
      }
    ).then((response) => {
      setAzimuth(response.data.Azimuth);
      setAltitude(response.data.Altitude);
    }, (error) => {
      console.log(error);
    })
  }

  const sendDirections = (dirxns) => {
    axios.post('http://server.milesacq.com:7892/move_servos',
      {
        params: {
          dirString: dirxns
        }
      }
    )
  }

  // const getPlanets = (long, lat, direction) => {
  //   planetRouter.get(
  //     "http://server.milesacq.com:7892/closest_planet", {
  //     params: {
  //       longitude,
  //       latitude,
  //       direction
  //     }
  //   }
  //   )
  // }

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
        <Pressable onPress={() => {
          navigation.navigate('Dock')
        }}
        style={styles.button}><Text style={styles.buttonText}>Search the Stars</Text></Pressable>
      </View>
    );
  }

  function moveArm(navigation, planetName) {
    setCurrentPlanet(planetName);
    getDirections(long, lat, planetName);
    // work out number of 5.625° steps to take to point there
    // if (altitude < 0 || altitude > 90) {
    //   console.log(planetName + " not visible"); // dont move the arm!
    // } else {
      // TODO: check if this is appropriate calibration to turn the middle wheel
      const xSteps = Math.round(((azimuth - location?.trueHeading) / 5.625) * 0.5);
      const ySteps = Math.round(altitude / 5.625);
      const dirString = xSteps + "," + ySteps + "!";
      // send arduino direction string to the server to be passed into usb serial port
      sendDirections(dirString);
      setLastDirs(dirString);
      navigation.push('Telescope');
    // }
  }

  BODIES = [
    {
      id: '10',
      title: 'sun',
    },
    {
      id: '199',
      title: 'mercury',
    },
    {
      id: '399',
      title: 'earth',
    },
    {
      id: '299',
      title: 'venus',
    },
    {
      id: '301',
      title: 'moon',
    },
    {
      id: '499',
      title: 'mars',
    },
  ]

  const Item = ({navigation, title}) => (
    <View style={styles.item}>
      <Pressable onPress={() => moveArm(navigation, title)} style={styles.button}><Text style={styles.buttonText}>{title}</Text></Pressable>
    </View>
  );

  function DockScreen({ navigation }) {
    return (
      <View style={styles.container}>
        <Text style={{marginTop: '160px'}}>Compass heading: {Math.round(location?.trueHeading)}°</Text>

        <Pressable 
          onPress={() => { navigation.goBack() }} 
          title={"back"} 
          style={styles.button}>
          <Text style={styles.buttonText}>back</Text>
        </Pressable>

        {/* <Modal
        animationType='slide'
        transparent={false}
        visible={invisErrorOpen}
        onRequestClose={() => {
          setInvisErrorOpen(false);
        }}> */}
          {/* <View style={styles.modalView}>
            <Text style={styles.modalText}>Planet is not visible!</Text>
            <Pressable onPress={() => setInvisErrorOpen(!invisErrorOpen)} style={styles.button}>
              <Text style={styles.buttonText}>close</Text>
            </Pressable>
          </View> */}
        {/* </Modal> */}
        <SafeAreaView style={styles.container}>
          <FlatList
            data={BODIES}
            renderItem={({item}) => <Item navigation={navigation} title={item.title}/>}
            keyExtractor={item => item.id}
            />
        </SafeAreaView>
      </View>
    );
  }

  function TelescopeScreen({ navigation }) {
    // find the opposite of the directions it took to orient here for the exit
    lastXStep = lastDirs.split(",")[0];
    lastYStep = lastDirs.split(",")[1];
    const resetDirs = (-1 * lastXStep) + "," + (-1 * lastYStep);
    return (
      <View style={styles.container}>
        <Text>Compass heading: {Math.round(location?.trueHeading)}°</Text>
        <Text>NOW VIEWING: {typeof currentPlanet == String ? currentPlanet : ""}</Text>
        <Pressable onPress={() => {
          // sendDirections(resetDirs);
          setCurrentPlanet(null);
          navigation.goBack();}}
          style={styles.button}><Text style={styles.buttonText}>back</Text></Pressable>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{
          headerTransparent: true,
          headerBlurEffect: 'systemChromeMaterialLight'
        }}>
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
    display: 'flex',
    backgroundColor: "#592A88",
    alignItems: "center",
    justifyContent: "center",
    width: '100%',
    color: '#fff',
    marginTop: '125px',
  },
  item: {
    backgroundColor: '#592A88',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    color: '#fff',
  },
  title: {
    fontSize: 32,
    color: '#fff',
  },
  buttonText: {
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    backgroundColor: '#461C71',
    color: '#fff',
  },
});
