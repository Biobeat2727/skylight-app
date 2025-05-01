// App.js
import 'react-native-gesture-handler'; // <-- MUST BE FIRST
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen'; // <-- NEW import

// Import Screens
import HomeScreen from './screens/HomeScreen';
import AuroraMaps from './screens/AuroraMaps';
import LocationScreen from './screens/ForecastLocationScreen'; 

// Create Drawer navigator instance
const Drawer = createDrawerNavigator();

// Keep splash screen visible until we manually hide it
SplashScreen.preventAutoHideAsync();

export default function App() {
  useEffect(() => {
    const prepare = async () => {
      // Wait for 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Then hide splash screen
      await SplashScreen.hideAsync();
    };

    prepare();
  }, []);

  return (
    <SafeAreaProvider>
      <>
        <StatusBar
          style="light"
          backgroundColor="transparent"
          translucent={true}
        />

        <NavigationContainer>
          <Drawer.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerStyle: {
                backgroundColor: 'transparent',
              },
              headerTintColor: '#ffffff',
              headerTransparent: true,
              headerShadowVisible: false,
              headerTitleStyle: {
                 fontWeight: 'bold',
              },
              drawerStyle: {
                backgroundColor: '#1a1a2e',
                width: 240,
              },
              drawerInactiveTintColor: '#cccccc',
              drawerActiveTintColor: '#ffffff',
              drawerActiveBackgroundColor: '#00ffcc40',
            }}
          >
            <Drawer.Screen
              name="Home"
              component={HomeScreen}
              options={{
                title: 'Home',
                drawerLabel: 'Home'
              }}
            />

            <Drawer.Screen
              name="Aurora Maps"
              component={AuroraMaps}
              options={{
                title: 'Solar Activity',
                drawerLabel: 'Solar Activity'
              }}
            />

            <Drawer.Screen
              name="Forecast Tools"
              component={LocationScreen}
              options={{
                title: '🔮 Forecast Tools',
                drawerLabel: 'Forecast Tools'
              }}
            />
          </Drawer.Navigator>
        </NavigationContainer>
      </>
    </SafeAreaProvider>
  );
}