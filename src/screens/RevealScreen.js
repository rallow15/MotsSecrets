import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme';
import { t } from '../i18n';

export default function RevealScreen({ navigation, route }) {
  const { numPlayers, assignments, currentPlayer, playerNumbers, playerNames } = route.params;
  const [wordVisible, setWordVisible] = useState(false);

  const assignment   = assignments[currentPlayer];
  const isMister     = assignment.role === 'mister';
  const word         = isMister ? 'MISTER WHITE' : assignment.word;
  // gameLogic génère "category", on supporte aussi "cat"
  const category     = assignment.category ?? assignment.cat ?? '';
  const wordLen      = word ? word.length : 0;
  const wordFontSize = wordLen > 14 ? 44 : wordLen > 10 ? 58 : wordLen > 7 ? 72 : 88;
  const playerName   = playerNames?.[currentPlayer] ?? '';

  const handleNext = () => {
    const next = currentPlayer + 1;
    if (next >= numPlayers) {
      navigation.navigate('Result', {
        numPlayers, assignments, playerNumbers, playerNames,
      });
    } else {
      navigation.navigate('Prep', {
        numPlayers, assignments,
        currentPlayer: next,
        takenNumbers:  [],
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

      <TouchableOpacity style={styles.okBtn} onPress={handleNext} activeOpacity={0.8}>
        <Text style={styles.okBtnText}>OK 👆</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  passContainer: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', gap: 16 },
  passPrompt:    { fontFamily: 'BebasNeue', fontSize: 72, color: colors.text, textAlign: 'center', lineHeight: 66 },
  tapIcon:       { fontSize: 52 },
  container:     { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, gap: 12 },
  playerBadge:   { fontFamily: 'SpaceMono', fontSize: 10, color: colors.gray, letterSpacing: 5 },
  playerName:    { fontFamily: 'BebasNeue', fontSize: 38, color: colors.text, letterSpacing: 2 },
  catBadge:      { borderWidth: 1, borderColor: 'rgba(232,255,71,0.4)', paddingHorizontal: 14, paddingVertical: 4 },
  catText:       { fontFamily: 'SpaceMono', fontSize: 10, color: colors.accent, letterSpacing: 2 },
  word:          { fontFamily: 'BebasNeue', color: colors.accent, textAlign: 'center', letterSpacing: 1 },
  wordMister:    { color: colors.gray, fontSize: 52 },
  hint:          { fontFamily: 'SpaceMono', fontSize: 9, color: colors.gray, letterSpacing: 3 },
  okBtn:         { marginTop: 20, backgroundColor: colors.accent, paddingVertical: 16, paddingHorizontal: 48 },
  okBtnText:     { fontFamily: 'BebasNeue', fontSize: 26, color: colors.bg, letterSpacing: 3 },
});
