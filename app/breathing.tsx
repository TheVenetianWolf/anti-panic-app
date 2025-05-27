import React from 'react';
import { View, StyleSheet } from 'react-native';
import BreathingAnimation from '../components/BreathingAnimation';

export default function Breathing() {
  return (
    <View style={styles.container}>
      <BreathingAnimation />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});