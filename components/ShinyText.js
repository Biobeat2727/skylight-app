import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, Text } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';

const ShinyText = ({ text, style }) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const gradientTranslateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(translateX, {
            toValue: 1,
            duration: 8000,
            useNativeDriver: true,
          }),
          Animated.timing(translateX, {
            toValue: 0,
            duration: 8000,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(translateY, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: 4000,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.05,
            duration: 5000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 5000,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 0.6,
            duration: 6000,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 6000,
            useNativeDriver: true,
          }),
        ]),
        Animated.loop(
          Animated.timing(gradientTranslateX, {
            toValue: 1,
            duration: 10000,
            useNativeDriver: true,
          })
        ),
      ])
    ).start();

    return () => {
      // No cleanup needed for Animated.loop with useRef
    };
  }, []);

  const moveX = translateX.interpolate({
    inputRange: [0, 1],
    outputRange: [-55, 55],
  });

  const moveY = translateY.interpolate({
    inputRange: [0, 1],
    outputRange: [-20, 20],
  });

  const gradientShift = gradientTranslateX.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '-50%'],
  });

  return (
    <View style={styles.container}>
      <MaskedView
        style={{ width: 360, height: 120 }}
        maskElement={
          <View style={styles.mask}>
            <Text style={[style, { color: 'black', fontSize: 64, fontWeight: 'bold', textAlign: 'center' }]}>
              {text}
            </Text>
          </View>
        }
      >
        <Animated.View
          style={[
            styles.gradientContainer,
            {
              transform: [
                { translateX: moveX },
                { translateY: moveY },
                { scale: scaleAnim },
                { translateX: gradientTranslateX },
              ],
            },
          ]}
        >
          <LinearGradient
  colors={[
    '#00ffcc', '#33ccff', '#66b3ff', '#998aff',
    '#cc66ff', '#ff33cc', '#ff66cc', '#ff99cc',
    '#ff66cc', '#ff33cc', '#cc66ff', '#998aff',
    '#66b3ff', '#33ccff', '#00ffcc'
  ]}
  
  
  start={{ x: 0, y: 0.5 }}
  end={{ x: 1, y: 0.5 }}
  style={styles.gradient}
/>

        </Animated.View>
      </MaskedView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  mask: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientContainer: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    width: '275%',
    height: '300%',
  },
});

export default ShinyText;
