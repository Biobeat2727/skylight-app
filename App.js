// App.js
import 'react-native-gesture-handler'; // <-- MUST BE FIRST
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
// No longer need StackNavigator for this setup
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context'; // Keep this

// Import Screens
import HomeScreen from './screens/HomeScreen';
import AuroraMaps from './screens/AuroraMaps';
import LocationScreen from './screens/ForecastLocationScreen'; // Assuming this is the Forecast Tools screen component

// Create Drawer navigator instance ONLY
const Drawer = createDrawerNavigator();
// const Stack = createNativeStackNavigator(); // Removed Stack instance

// --- No longer need the Stack Component ---
// function AuroraMapsStack() { ... } // Removed this function

// --- Main App Component ---
export default function App() {
  return (
    // SafeAreaProvider helps avoid overlaps with status bar/notches
    <SafeAreaProvider>
      <>
        {/* Configure the status bar */}
        <StatusBar
          style="light" // Use light text/icons for dark background
          backgroundColor="transparent" // Make status bar background transparent
          translucent={true} // Allow app content to draw behind status bar
        />

        <NavigationContainer>
          {/* Drawer Navigator is the main navigator */}
          <Drawer.Navigator
            initialRouteName="Home" // Start on the Home screen
            screenOptions={{
              // --- Apply options globally to ALL Drawer screens ---

              // Style the header
              headerStyle: {
                backgroundColor: 'transparent', // Make header background transparent
              },
              headerTintColor: '#ffffff',       // Make title and hamburger icon white
              headerTransparent: true,         // IMPORTANT: Allows content behind header
              headerShadowVisible: false,     // Optional: Removes shadow/border on Android
              headerTitleStyle: {
                 fontWeight: 'bold',
              },

              // Style the drawer menu itself
              drawerStyle: {
                backgroundColor: '#1a1a2e', // Dark background for drawer menu
                width: 240,
              },
              drawerInactiveTintColor: '#cccccc', // Color for inactive menu items
              drawerActiveTintColor: '#ffffff',   // Color for active menu item text
              drawerActiveBackgroundColor: '#00ffcc40', // Background for active menu item
            }}
          >
            {/* Screen for Home */}
            <Drawer.Screen
              name="Home"
              component={HomeScreen}
              options={{
                // headerShown: false, // REMOVED - Now header WILL be shown
                title: 'SkyLight', // Added title for Home screen header
                drawerLabel: '🏠 Home'
              }}
            />

            {/* Screen for Aurora Maps section */}
            <Drawer.Screen
              name="Aurora Maps"
              component={AuroraMaps} // Use the screen component directly
              options={{
                // headerShown: false, // REMOVED - Drawer header will show
                title: '🌞 Live Solar Activity', // Title for this screen's header
                drawerLabel: '🗺️ Aurora Maps'
              }}
            />

            {/* Screen for Forecast Tools section */}
            <Drawer.Screen
              name="Forecast Tools"
              component={LocationScreen}
              options={{
                // Header styles are inherited from Drawer.Navigator screenOptions
                title: '🔮 Forecast Tools',
                drawerLabel: '⚙️ Forecast Tools'
              }}
            />
          </Drawer.Navigator>
        </NavigationContainer>
      </>
    </SafeAreaProvider>
  );
}