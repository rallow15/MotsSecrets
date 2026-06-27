import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';
import { screenThemes, useDarkTheme } from '../theme';
import { t, getLang } from '../i18n';
import { playClick, playWin, playLose } from '../sound';
import { triggerHaptic } from '../animations';
import BouncePress from '../components/BouncePress';
import ScreenBackground from '../components/ScreenBackground';

export default function SpyfallGuessScreen({ navigation, route }) {
  const { numPlayers, assignments, playerNames, selectedCategory, spyfallUndercover, votedPlayerIndex } = route.params;
  useKeepAwake();
  const darkTheme = useDarkTheme();
  const theme = darkTheme ? screenThemes.dark : screenThemes.light;
  const [guess, setGuess] = useState('');
  // Toujours commencer par l'écran "passez le téléphone à l'espion/intrus"
  const [showInput, setShowInput] = useState(false);
  const lang = getLang();

  // Trouver le mot secret (celui des innocents)
  const secretWord = assignments.find(a => a.role === 'normal')?.word || '';
  const suspectRole = spyfallUndercover ? 'intrus' : 'spy';
  const suspectIdx = votedPlayerIndex ?? assignments.findIndex(a => a.role === suspectRole);
  const suspectName = playerNames?.[suspectIdx] || '';

  const handleConfirmSpy = () => {
    playClick();
    triggerHaptic('medium');
    setShowInput(true);
  };

  const handleSubmit = () => {
    if (!guess.trim()) return;
    triggerHaptic('medium');
    playClick();

    const isCorrect = guess.trim().toLowerCase() === secretWord.toLowerCase();

    if (isCorrect) {
      playWin();
    } else {
      playLose();
    }

    navigation.navigate('Result', {
      numPlayers,
      assignments,
      playerNumbers: new Array(numPlayers).fill(null),
      playerNames,
      selectedCategory,
      gameMode: 3,
      spyfallOutcome: isCorrect ? 'spyGuessRight' : 'spyGuessWrong',
      spyfallUndercover,
    });
  };

  return (
    <ScreenBackground darkTheme={darkTheme} style={{ backgroundColor: theme.bg }}>
      {!showInput ? (
        // Écran "Passez le téléphone à l'espion/intrus"
        <>
          <Text style={styles.emoji}>{spyfallUndercover ? '🥸' : '🕵️'}</Text>
          <Text style={[styles.title, { color: theme.text }]}>{spyfallUndercover ? t('passToUndercover') : t('passToSpy')}</Text>
          <BouncePress accessibilityLabel={t('spyConfirmGuess')} accessibilityRole="button" onPress={handleConfirmSpy} style={[styles.confirmBtn, { backgroundColor: theme.okBtnBg }]}>
            <Text style={[styles.confirmBtnText, { color: theme.okBtnText }]}>{t('spyConfirmGuess')}</Text>
          </BouncePress>
        </>
      ) : (
        // Écran de devinette
        <>
          <Text style={[styles.title, { color: theme.text }]}>
            {spyfallUndercover ? t('undercoverCaught') : t('spyCaught')}
          </Text>

          <Text style={[styles.subtitle, { color: theme.textMuted }]}>
            {t('caughtGuessWord', suspectName)}
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { color: theme.text, borderBottomColor: theme.inputBorder }]}
              value={guess}
              onChangeText={setGuess}
              placeholder={t('spyGuessHint')}
              placeholderTextColor={darkTheme ? 'rgba(232,213,255,0.4)' : '#999'}
              autoCapitalize="words"
              autoCorrect={false}
              maxLength={40}
              returnKeyType="done"
            />
          </View>

          <BouncePress
            accessibilityLabel={t('spyGuessConfirm')}
            accessibilityRole="button"
            onPress={handleSubmit}
            style={[styles.submitBtn, !guess.trim() && styles.submitBtnDisabled, { backgroundColor: theme.danger }]}
            disabled={!guess.trim()}
          >
            <Text style={styles.submitBtnText}>{t('spyGuessConfirm')}</Text>
          </BouncePress>
        </>
      )}
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, gap: 16 },
  emoji: { fontSize: 64 },
  title: { fontFamily: 'BebasNeue', fontSize: 40, letterSpacing: 2, textAlign: 'center' },
  subtitle: { fontFamily: 'SpaceMono', fontSize: 11, textAlign: 'center', letterSpacing: 1 },
  inputContainer: { width: '100%' },
  input: { fontFamily: 'BebasNeue', fontSize: 28, borderBottomWidth: 2, textAlign: 'center', paddingVertical: 8, letterSpacing: 2 },
  confirmBtn: { width: '100%', paddingVertical: 16, alignItems: 'center', borderRadius: 12 },
  confirmBtnText: { fontFamily: 'BebasNeue', fontSize: 22, color: '#F5F5DC', letterSpacing: 2 },
  submitBtn: { width: '100%', paddingVertical: 16, alignItems: 'center', borderRadius: 12 },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: { fontFamily: 'BebasNeue', fontSize: 22, color: '#F5F5DC', letterSpacing: 2 },
});