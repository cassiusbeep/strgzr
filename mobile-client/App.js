import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, View } from 'react-native';
import CompassHeading from 'react-native-compass-heading';
import { useEffect, useState } from 'react';

export default function App() {
  const [heading, setHeading] = useState("")

  useEffect(() => {
    const degree_update_rate = 3;

    CompassHeading.start(degree_update_rate, ({heading, accuracy}) => {
      setHeading(heading)
    });

    // return () => {
    //   CompassHeading.stop();
    // };
  }, []);
  return (
    <View style={styles.container}>
      {/* <Button>
        Align
      </Button> */}
      <Text>Compass heading: {heading}</Text> 
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
