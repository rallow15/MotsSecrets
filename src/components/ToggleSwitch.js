import React from 'react';
import { View, TouchableOpacity } from 'react-native';

export default function ToggleSwitch({ value, onValueChange, activeColor, inactiveColor }) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onValueChange}
      style={{
        width: 52,
        height: 30,
        borderRadius: 15,
        backgroundColor: value ? activeColor : inactiveColor,
        padding: 2,
        alignItems: value ? 'flex-end' : 'flex-start',
        justifyContent: 'center',
      }}
    >
      <View style={{
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 4,
      }} />
    </TouchableOpacity>
  );
}