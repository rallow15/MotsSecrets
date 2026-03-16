import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../theme';

// Non utilisé — la navigation est gérée dans RevealScreen
export default function BlackScreen() {
  return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
}
