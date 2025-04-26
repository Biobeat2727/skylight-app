// LocationScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Dimensions } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import * as Location from 'expo-location'

const screenWidth = Dimensions.get('window').width;

const exampleHours = [
  '6PM', '7PM', '8PM', '9PM',
  '10PM', '11PM', '12AM', '1AM',
  '2AM', '3AM', '4AM', '5AM'
];

const exampleChances = [0, 5, 10, 25, 40, 60, 70, 50, 35, 20, 10, 5];

const generateHourlyForecast = (baseChance) => {
  // Simulates a bell curve of visibility over time centered on midnight
  const modifiers = [0.1, 0.25, 0.5, 0.75, 1, 0.9, 0.95, 0.85, 0.6, 0.4, 0.2, 0.1];
  return modifiers.map(mod => Math.round(baseChance * mod));
};


const getAuroraChance = (lat, kp) => {
  const thresholds = {
    3: 65,
    4: 60,
    5: 55,
    6: 50,
    7: 45,
    8: 40,
    9: 35,
  };

  const visibleLat = thresholds[kp] || 80;
  const diff = visibleLat - lat;

  if (diff >= 10) return 0;
  if (diff <= 0) return 100;

  return Math.round((1 - diff / 10) * 100);
};

export default function LocationScreen() {
  const [location, setLocation] = useState(null);
  const [auroraChance, setauroraChance] = useState(null);
  const [kpIndex, setKpIndex] = useState(null);
  

  useEffect(() => {
    fetch('https://services.swpc.noaa.gov/json/planetary_k_index_1m.json')
      .then(res => res.json())
      .then(data => {
        const latest = data[data.length - 1];
        setKpIndex(latest.kp_index);
      })
      .catch(error => {
        console.error('Error fetching K-index:', error);
      });
  }, []);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied.');
        return;
      }
  
      let { coords } = await Location.getCurrentPositionAsync({});
      setLocation({ lat: coords.latitude, lon: coords.longitude });
  
      if (kpIndex !== null) {
        const chance = getAuroraChance(coords.latitude, kpIndex);
        setauroraChance(chance);
      }
    })();
  }, [kpIndex]);
  
  

  const forecastChances = auroraChance !== null ? generateHourlyForecast(auroraChance) : [];

  const chartData = forecastChances.map((value, index) => ({
    value,
    label: exampleHours[index],
    frontColor: '#00ffcc',
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.graphTitle}>Aurora Viewing Forecast</Text>
      {chartData.length === 0 ? (
        <Text style={{ color: '#888', marginBottom: 20}}>
          Determining your location...
        </Text>
     ) : (
      <BarChart
        barWidth={22}
        noOfSections={5}
        data={chartData}
        height={220}
        width={screenWidth - 40}
        isAnimated
        yAxisColor="#00ffcc"
        xAxisColor="#00ffcc"
        yAxisTextStyle={{ color: '#fff' }}
        xAxisLabelTextStyle={{ color: '#fff', fontSize: 12 }}
        stepValue={20}
        spacing={18}
        initialSpacing={10}
        roundedTop
        showGradient
        backgroundColor="#000814"
      />
     )}

      {location && (
        <Text style={styles.location}>
          📍 {location.lat}°, {location.lon}°
        </Text>
      )}

      {auroraChance !== null && (
        <Text style={styles.auroraChanceBox}>
          Estimated Aurora Chance Now: {auroraChance}%
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000814',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  location: {
    color: '#ffffff',
    fontSize: 18,
    marginTop: 20,
  },
  auroraChanceBox: {
    fontSize: 20,
    color: '#00ffcc',
    fontWeight: 'bold',
    marginTop: 10,
  },
  graphTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00ffcc',
    marginBottom: 20,
  },
});