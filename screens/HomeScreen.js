// screens/HomeScreen.js
import React from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, ScrollView } from 'react-native';
// 1. Import the hook
import { useHeaderHeight } from '@react-navigation/elements';
// Import SafeAreaView hook if needed for bottom padding as well
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ShinyText from '../components/ShinyText'; // Ensure path is correct

export default function HomeScreen({ navigation }) {
  // 2. Get the actual rendered header height
  const headerHeight = useHeaderHeight();
  // const insets = useSafeAreaInsets(); // Uncomment if you need bottom inset padding

  return (
    // 3. Apply top padding equal to header height to the main content container
    // Using a ScrollView allows content to scroll if it becomes too long
    <ScrollView
      style={styles.safeAreaContainer} // Use flex: 1 container style
      contentContainerStyle={[styles.contentContainer, { paddingTop: headerHeight }]} // Apply padding here
      // bounces={false} // Optional: prevent bounce effect on scroll
      // showsVerticalScrollIndicator={false} // Optional: hide scroll bar
    >
      {/* Background Image - absolute positioning covers entire ScrollView area */}
      <ImageBackground
        source={require('../assets/aurora.png')}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />

      {/* Overlay Content View - contains the actual elements */}
      <View style={styles.overlay}>
        {/* ShinyText Component */}
        <ShinyText text="SkyLight" style={styles.title} />

        {/* Buttons Wrapper */}
        {/* Removed absolute positioning, let it flow naturally or adjust layout */}
        <View style={styles.buttonWrapper}>
          <View style={styles.buttonRow}>
            {/* Aurora Maps Button */}
            <TouchableOpacity
              style={styles.cardButton}
              onPress={() => navigation.navigate('Aurora Maps')}
            >
              <ImageBackground
                source={require('../assets/forecast.png')}
                style={styles.cardImage}
                imageStyle={styles.cardImageStyle}
              >
                <Text style={styles.cardText}>Aurora Maps</Text>
              </ImageBackground>
            </TouchableOpacity>

            {/* Forecast Tools Button */}
            <TouchableOpacity
              style={styles.cardButton}
              onPress={() => navigation.navigate('Forecast Tools')}
            >
              <ImageBackground
                source={require('../assets/location.png')}
                style={styles.cardImage}
                imageStyle={styles.cardImageStyle}
              >
                <Text style={styles.cardText}>Forecast Tools</Text>
              </ImageBackground>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView> // Close the ScrollView
  );
}

const styles = StyleSheet.create({
  // Style for the ScrollView itself
  safeAreaContainer: {
    flex: 1,
    backgroundColor: '#000', // Base background if image doesn't load
  },
  // Style for the content INSIDE the ScrollView
  contentContainer: {
    // paddingTop is now set dynamically
    alignItems: 'center', // Center content horizontally
    paddingBottom: 40, // Add padding at the bottom
    // Ensure content can grow if needed, don't set fixed height
    minHeight: '100%', // Try to ensure it fills height if content is short
    justifyContent: 'space-between', // Example: Push buttons towards bottom
  },
  // Style for the semi-transparent overlay View
  overlay: {
    width: '100%', // Ensure overlay takes full width
    alignItems: 'center', // Center items within the overlay
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 20, 0.3)', // Keep overlay effect if desired
    flex: 1, // Allow overlay to grow and push buttons down
    paddingTop: 20, // Added padding at the top of the overlay content
    paddingBottom: 20, // Added padding at the bottom inside overlay
  },
  title: {
    fontSize: 50,
    fontWeight: 'bold',
    color: '#00ffcc',
    textShadowColor: '#0ff',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    textAlign: 'center', // Center title text
    marginBottom: 10,
    // Removed marginTop, handled by overlay paddingTop or contentContainer paddingTop
  },
  buttonWrapper: {
    width: '100%', // Take full width for alignment
    alignItems: 'center', // Center the row of buttons
    // Removed absolute positioning to let it flow
    marginTop: 100, // Add some space above buttons
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 30,
  },
  cardButton: {
    width: 140,
    height: 140,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#00ffcc',
  },
  cardImage: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  cardImageStyle: {
    borderRadius: 16,
  },
  cardText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: '100%',
    textAlign: 'center',
    paddingVertical: 6,
  },
});