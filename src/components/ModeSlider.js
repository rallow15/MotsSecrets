import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';

export default function ModeSlider({ value, onValueChange, min, max, themeColors }) {
  const sliderTheme = themeColors || { neon: '#1a1a1a', border: 'rgba(0,0,0,0.15)', text: '#1a1a1a' };
  return (
    <View style={styles.sliderRow}>
      <Slider
        style={styles.slider}
        minimumValue={min}
        maximumValue={max}
        step={1}
        value={value}
        onValueChange={onValueChange}
        minimumTrackTintColor={sliderTheme.neon}
        maximumTrackTintColor={sliderTheme.border}
        thumbTintColor={sliderTheme.neon}
      />
      <Text style={[styles.sliderValue, { color: sliderTheme.neon }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sliderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, width: '100%' },
  slider: { flex: 1, height: 40 },
  sliderValue: { fontFamily: 'BebasNeue', fontSize: 28, minWidth: 28, textAlign: 'center' },
});