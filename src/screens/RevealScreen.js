import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme';
import { t } from '../i18n';
import { playClick, playReveal } from '../sound';

export default function RevealScreen({ navigation, route }) {
  const { numPlayers, assignments, currentPlayer, playerNumbers, playerNames, wordVisible: initialWordVisible } = route.params;
  const [wordVisible, setWordVisible] = useState(initialWordVisible || false);

  const assignment = assignments[currentPlayer];
  const isMister = assignment.role === 'mister';
  const word = isMister ? 'MISTER WHITE' : assignment.word;
  const category = assignment.category ?? assignment.cat ?? '';
  const wordLen = word ? word.length : 0;
  const wordFontSize = wordLen > 14 ? 44 : wordLen > 10 ? 58 : wordLen > 7 ? 72 : 88;
  const playerName = playerNames?.[currentPlayer] ?? '';

  const handleNext = () => {
    playClick();
    const next = currentPlayer + 1;
    if (next >= numPlayers) {
      playReveal();
      navigation.navigate('Result', {
        numPlayers, assignments, playerNumbers, playerNames,
      });
    } else {
      navigation.navigate('Prep', {
        numPlayers, assignments,
        currentPlayer: next,
        takenNumbers: [],
        playerNumbers,
        playerNames,
      });
    }
  };

  // Phase 1 : "Touche l'écran"
  if (!wordVisible) {
    return (
      <TouchableOpacity style={styles.passContainer} activeOpacity={1} onPress={() => setWordVisible(true)}>
        <Text style={styles.playerBadge}>{t('playerLabel', currentPlayer + 1)}</Text>
        {playerName ? <Text style={styles.playerName}>{playerName}</Text> : null}
        <Text style={styles.passPrompt}>{t('touchScreen')}</Text>
        <Text style={styles.tapIcon}>👆</Text>
      </TouchableOpacity>
    );
  }

  // Phase 2 : mot visible
  return (
    <View style={styles.container}>
      <Text style={styles.playerBadge}>{t('playerLabel', currentPlayer + 1)}</Text>
      {playerName ? <Text style={styles.playerName}>{playerName}</Text> : null}

      {!isMister && category ? (
        <View style={styles.catBadge}>
          <Text style={styles.catText}>{category}</Text>
        </View>
      ) : null}

      <Text style={[styles.word, isMister && styles.wordMister, { fontSize: wordFontSize }]}>
        {word}
      </Text>

      <Text style={styles.hint}>{t('memorize')}</Text>

      <TouchableOpacity style={styles.okBtn} onPress={() => handleNext()} activeOpacity={0.8}>
        <Text style={styles.okBtnText}>OK 👆</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  passContainer: { flex: 1, backgroundColor: '#F5F5DC', alignItems: 'center', justifyContent: 'center', gap: 12, paddingTop: 40 },
  passPrompt: { fontFamily: 'BebasNeue', fontSize: 64, color: '#000000', textAlign: 'center', lineHeight: 60 },
  tapIcon: { fontSize: 52 },
  container: { flex: 1, backgroundColor: '#F5F5DC', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, gap: 12 },
  playerBadge: { fontFamily: 'SpaceMono', fontSize: 10, color: '#000000', letterSpacing: 5 },
  playerName: { fontFamily: 'BebasNeue', fontSize: 44, color: '#000000', letterSpacing: 2 },
  catBadge: { borderWidth: 1, borderColor: 'rgba(0,0,0,0.2)', paddingHorizontal: 14, paddingVertical: 4, borderRadius: 8 },
  catText: { fontFamily: 'SpaceMono', fontSize: 12, color: '#000000', letterSpacing: 2 },
  word: { fontFamily: 'BebasNeue', color: '#000000', textAlign: 'center', letterSpacing: 1 },
  wordMister: { color: '#000000', fontSize: 52 },
  hint: { fontFamily: 'SpaceMono', fontSize: 11, color: '#000000', letterSpacing: 3 },
  okBtn: { marginTop: 20, backgroundColor: '#1a1a1a', paddingVertical: 16, paddingHorizontal: 48, borderRadius: 12, borderWidth: 2, borderColor: 'rgba(0,0,0,0.3)' },
  okBtnText: { fontFamily: 'BebasNeue', fontSize: 26, color: '#F5F5DC', letterSpacing: 3 },
});
