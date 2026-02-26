import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import { colors } from '../theme';

export default function RevealScreen({ navigation, route }) {
  const { numPlayers, assignments, currentPlayer, takenNumbers, playerNumbers } = route.params;
  const word = assignments[currentPlayer].word;

  const handleChooseNumber = (n) => {
const newTaken = [...takenNumbers, n];
const newNumbers = [...playerNumbers];
newNumbers[currentPlayer] = n;

const next = currentPlayer + 1;
if (next >= numPlayers) {
navigation.navigate('Result', { numPlayers, playerNumbers: newNumbers });
} else {
navigation.navigate('Prep', {
numPlayers,
assignments,
currentPlayer: next,
takenNumbers: newTaken,
playerNumbers: newNumbers,
});
}
};

  return (
    <View style={styles.container}>
      <Text style={styles.playerBadge}>JOUEUR {currentPlayer + 1}</Text>
      <Text style={styles.word}>{word}</Text>
      <Text style={styles.hint}>Mémorise ton mot</Text>

      <Text style={styles.pickLabel}>CHOISIS TON CHIFFRE SECRET</Text>

      <View style={styles.grid}>
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
          const taken = takenNumbers.includes(n);
          return (
            <TouchableOpacity
              key={n}
              style={[styles.numBtn, taken && styles.numBtnTaken]}
              onPress={() => !taken && handleChooseNumber(n)}
              disabled={taken}
              activeOpacity={0.6}
            >
              <Text style={[styles.numText, taken && styles.numTextTaken]}>{n}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
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
  playerBadge: {
    fontFamily: 'BebasNeue',
    fontSize: 24,
    color: colors.gray,
    letterSpacing: 6,
    marginBottom: 12,
  },
  word: {
    fontFamily: 'BebasNeue',
    fontSize: 58,
    color: colors.accent,
    textAlign: 'center',
    lineHeight: 68,
    letterSpacing: 1,
    marginBottom: 4,
  },
  hint: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    color: '#555',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 32,
  },
  pickLabel: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    color: '#888',
    letterSpacing: 3,
    marginBottom: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    maxWidth: 320,
  },
  numBtn: {
    width: 56,
    height: 56,
    borderWidth: 1,
    borderColor: '#3a3a3a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numBtnTaken: {
    borderColor: '#1a1a1a',
  },
  numText: {
    fontFamily: 'BebasNeue',
    fontSize: 30,
    color: colors.text,
  },
  numTextTaken: {
    color: '#252525',
    textDecorationLine: 'line-through',
  },
});
