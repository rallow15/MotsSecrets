import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, StatusBar,
} from 'react-native';
import { colors } from '../theme';

export default function MenuScreen({ navigation }) {
  const [numPlayers, setNumPlayers] = useState(4);

  const handleStart = () => {
    navigation.navigate('Prep', { numPlayers });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      <Text style={styles.title}>MOTS{'\n'}SECRETS</Text>
      <Text style={styles.subtitle}>TROUVEZ L'INTRUS PARMI VOUS</Text>

      <View style={styles.selectorRow}>
        <Text style={styles.selectorLabel}>JOUEURS</Text>
        <View style={styles.counterRow}>
          <TouchableOpacity
            style={styles.counterBtn}
            onPress={() => setNumPlayers(p => Math.max(3, p - 1))}
          >
            <Text style={styles.counterBtnText}>−</Text>
          </TouchableOpacity>

          <Text style={styles.counterVal}>{numPlayers}</Text>

          <TouchableOpacity
            style={styles.counterBtn}
            onPress={() => setNumPlayers(p => Math.min(7, p + 1))}
          >
            <Text style={styles.counterBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.startBtn} onPress={handleStart}>
        <Text style={styles.startBtnText}>DÉMARRER</Text>
      </TouchableOpacity>
    </View>
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
  title: {
    fontFamily: 'BebasNeue',
    fontSize: 65,
    color: colors.accent,
    textAlign: 'center',
    lineHeight: 76,
    letterSpacing: 2,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    color: colors.gray,
    letterSpacing: 4,
    marginBottom: 48,
    textAlign: 'center',
  },
  selectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 40,
  },
  selectorLabel: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: '#888',
    letterSpacing: 3,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  counterBtn: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: colors.dim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnText: {
    color: colors.text,
    fontSize: 22,
    fontFamily: 'SpaceMono',
    lineHeight: 26,
  },
  counterVal: {
    fontFamily: 'BebasNeue',
    fontSize: 48,
    color: colors.accent,
    minWidth: 32,
    textAlign: 'center',
  },
  startBtn: {
    backgroundColor: colors.accent,
    paddingHorizontal: 48,
    paddingVertical: 16,
  },
  startBtnText: {
    fontFamily: 'BebasNeue',
    fontSize: 26,
    color: colors.bg,
    letterSpacing: 2,
  },
});
