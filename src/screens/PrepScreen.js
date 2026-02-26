import React, { useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated,
} from 'react-native';
import { colors } from '../theme';

export default function PrepScreen({ navigation, route }) {
  const { numPlayers, assignments, currentPlayer, takenNumbers, playerNumbers } = route.params;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 750, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 750, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={1}
      onPress={() =>
        navigation.navigate('Reveal', {
          numPlayers, assignments, currentPlayer, takenNumbers, playerNumbers,
        })
      }
    >
      <Text style={styles.playerBadge}>JOUEUR {currentPlayer + 1}</Text>
      <Text style={styles.prompt}>Touche{'\n'}l'écran</Text>

      {/* Progress dots */}
      <View style={styles.dotsRow}>
        {Array.from({ length: numPlayers }, (_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i < currentPlayer && styles.dotDone,
              i === currentPlayer && styles.dotCurrent,
            ]}
          />
        ))}
      </View>

      <Animated.Text style={[styles.tapIcon, { opacity: pulseAnim }]}>👆</Animated.Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  playerBadge: {
    fontFamily: 'BebasNeue',
    fontSize: 28,
    color: colors.gray,
    letterSpacing: 6,
    marginBottom: 16,
  },
  prompt: {
    fontFamily: 'BebasNeue',
    fontSize: 58,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 60,
    marginBottom: 32,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.dim,
  },
  dotDone: { backgroundColor: colors.accent },
  dotCurrent: { backgroundColor: colors.text },
  tapIcon: {
    fontSize: 48,
  },
});
