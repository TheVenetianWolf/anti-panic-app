import React from 'react';
import { View, StyleSheet } from 'react-native';
import BreathingAnimation from '../components/BreathingAnimation';

const BreathingScreen = () => {
  return (
    <View style={styles.container}>
      <BreathingAnimation />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default BreathingScreen;