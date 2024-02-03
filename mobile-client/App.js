import { StatusBar } from 'expo-status-bar';
import { Button, StyleSheet, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import * as Location from 'expo-location';

export default function App() {
  const [heading, setHeading] = useState("")

  useEffect(() => {
    Location.getHeadingAsync().then((e) => setHeading(e.magHeading))
  }, [heading]);
  return (
    <View style={styles.container}>
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