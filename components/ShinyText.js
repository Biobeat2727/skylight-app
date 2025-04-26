import React, { useRef, useEffect } from 'react';
import { Animated, Text, StyleSheet } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';

export default function ShinyText({ text = 'SkyLight', style = {} }) {
  const translateX = useRef(new Animated.Value(-200)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(translateX, {
        toValue: 400,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  return (
    <MaskedView
      style={{ height: 60, alignSelf: 'center' }}
      maskElement={
        <Text style={[styles.maskText, style]}>
          {text}
        </Text>
      }
    >
      <Animated.View style={{ transform: [{ translateX }] }}>
        <LinearGradient
          colors={['transparent', '#00ffcc', '#cc00ff', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        />
      </Animated.View>
    </MaskedView>
  );
}

const styles = StyleSheet.create({
  maskText: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
  gradient: {
    width: 400,
    height: 60,
  },
});
