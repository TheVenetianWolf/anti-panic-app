import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Audio } from 'expo-av';

const DURATION = 3000;

const PHASES = [
  { label: 'Inhale', toValue: 1.5 },
  { label: 'Hold', toValue: 1.5 },
  { label: 'Exhale', toValue: 1 },
  { label: 'Rest', toValue: 1 },
];

const SESSION_OPTIONS = [1, 2, 5, 10];

const SOUND_OPTIONS = [
  { label: 'Ocean', file: require('../assets/sounds/ocean.wav') },
  { label: 'Rain', file: require('../assets/sounds/sleepy-rain.mp3') },
  { label: 'Wind', file: require('../assets/sounds/wind-chimes.wav') },
];

const BreathingAnimation = () => {
  const scale = useRef(new Animated.Value(1)).current;
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [instruction, setInstruction] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [timer, setTimer] = useState(0);
  const [sessionMinutes, setSessionMinutes] = useState(2);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [selectedSound, setSelectedSound] = useState(SOUND_OPTIONS[0].label);
  const soundRef = useRef<Audio.Sound | null>(null);

  const isRunningRef = useRef(false);
  const phaseIndexRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const animatePhase = () => {
    if (!isRunningRef.current) return;
    const index = phaseIndexRef.current;
    const { label, toValue } = PHASES[index];
    setInstruction(label);
    setPhaseIndex(index);

    Animated.timing(scale, {
      toValue,
      duration: DURATION,
      useNativeDriver: true,
      easing: Easing.inOut(Easing.ease),
    }).start(() => {
      phaseIndexRef.current = (phaseIndexRef.current + 1) % PHASES.length;
      animatePhase();
    });
  };

  const playSound = async () => {
    try {
      const soundObj = SOUND_OPTIONS.find((s) => s.label === selectedSound);
      if (!soundObj) return;

      const { sound } = await Audio.Sound.createAsync(soundObj.file);
      soundRef.current = sound;
      await sound.setIsLoopingAsync(true);
      await sound.playAsync();
    } catch (error) {
      console.warn('Failed to play sound', error);
    }
  };

  const stopSound = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
  };

  const startBreathing = () => {
    setCountdown(3);
    let count = 3;

    const countdownInterval = setInterval(() => {
      count -= 1;
      if (count === 0) {
        clearInterval(countdownInterval);
        setCountdown(null);
        setIsRunning(true);
        isRunningRef.current = true;
        setTimer(0);
        phaseIndexRef.current = 0;
        animatePhase();
        playSound();

        intervalRef.current = setInterval(() => {
          setTimer((prev) => {
            const newTime = prev + 1;
            if (newTime >= sessionMinutes * 60) {
              stopBreathing();
            }
            return newTime;
          });
        }, 1000);
      } else {
        setCountdown(count);
      }
    }, 1000);
  };

  const stopBreathing = () => {
    setIsRunning(false);
    isRunningRef.current = false;
    setInstruction('');
    scale.setValue(1);
    stopSound();
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      stopSound();
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {!isRunning && (
        <>
          <View style={styles.pickerWrapper}>
            <Text style={styles.pickerLabel}>Session:</Text>
            <Picker
              selectedValue={sessionMinutes}
              style={styles.picker}
              onValueChange={(val) => setSessionMinutes(val)}
            >
              {SESSION_OPTIONS.map((m) => (
                <Picker.Item key={m} label={`${m} min`} value={m} />
              ))}
            </Picker>
          </View>

          <View style={styles.pickerWrapper}>
            <Text style={styles.pickerLabel}>Sound:</Text>
            <Picker
              selectedValue={selectedSound}
              style={styles.picker}
              onValueChange={(val) => setSelectedSound(val)}
            >
              {SOUND_OPTIONS.map((opt) => (
                <Picker.Item key={opt.label} label={opt.label} value={opt.label} />
              ))}
            </Picker>
          </View>
        </>
      )}

      <View style={styles.animationWrapper}>
        {isRunning && <Animated.View style={[styles.circle, { transform: [{ scale }] }]} />}
      </View>

      {countdown !== null && <Text style={styles.countdown}>{countdown}</Text>}

      {instruction !== '' && <Text style={styles.instruction}>{instruction}</Text>}

      {isRunning && <Text style={styles.timer}>{formatTime(timer)}</Text>}

      <TouchableOpacity
        disabled={countdown !== null}
        onPress={isRunning ? stopBreathing : startBreathing}
        style={[styles.button, { backgroundColor: isRunning ? '#FF6B6B' : '#6EC6CA' }]}
      >
        <Text style={styles.buttonText}>{isRunning ? 'Stop' : 'Start'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    flex: 1,
    backgroundColor: '#101820',
    paddingTop: 80,
  },
  pickerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  pickerLabel: {
    color: '#fff',
    fontSize: 18,
    marginRight: 10,
  },
  picker: {
    height: 50,
    width: 160,
    color: '#fff',
    backgroundColor: '#333',
  },
  animationWrapper: {
    height: width * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  circle: {
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: width * 0.25,
    backgroundColor: '#6EC6CA',
  },
  instruction: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  timer: {
    color: '#bbb',
    fontSize: 20,
    marginBottom: 30,
  },
  button: {
    marginTop: 20,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  buttonText: {
    color: '#101820',
    fontSize: 20,
    fontWeight: '600',
  },
  countdown: {
    fontSize: 64,
    color: '#6EC6CA',
    fontWeight: 'bold',
    position: 'absolute',
    top: '40%',
  },
});

export default BreathingAnimation;
