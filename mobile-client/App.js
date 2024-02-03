import { useEffect, useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as Location from "expo-location";

export default function App() {
  const [location, setLocation] = useState(null);

  useEffect(() => {
    (async () => {
      await Location.requestForegroundPermissionsAsync();
      Location.watchHeadingAsync((location) => {
        setLocation(location);
      });
    })();
  }, []);

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
