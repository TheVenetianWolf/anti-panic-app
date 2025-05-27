import React from 'react';
import { View } from 'react-native';
import BreathingAnimation from '../components/BreathingAnimation';

export default function App() {
  return (
    <View style={{ flex: 1 }}>
      <BreathingAnimation />
    </View>
  );
}