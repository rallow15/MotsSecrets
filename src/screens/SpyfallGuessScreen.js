import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme';
import { t, getLang } from '../i18n';
import { playClick, playWin, playLose } from '../sound';
import { triggerHaptic } from '../animations';
import BouncePress from '../components/BouncePress';

export default function SpyfallGuessScreen({ navigation, route }) {
  const { numPlayers, assignments, playerNames, selectedCategory, fromGame, spyfallUndercover, votedPlayerIndex } = route.params;
  const [guess, setGuess] = useState('');
  const [showInput, setShowInput] = useState(fromGame ? false : true);
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
    <View style={styles.container}>
      {!showInput ? (
        // Écran "Passez le téléphone à l'espion/intrus"
        <>
          <Text style={styles.emoji}>{spyfallUndercover ? '🥸' : '🕵️'}</Text>
          <Text style={styles.title}>{spyfallUndercover ? t('passToUndercover') : t('passToSpy')}</Text>
          <BouncePress onPress={handleConfirmSpy} style={styles.confirmBtn}>
            <Text style={styles.confirmBtnText}>{t('spyConfirmGuess')}</Text>
          </BouncePress>
        </>
      ) : (
        // Écran de devinette
        <>
          <Text style={styles.title}>
            {fromGame ? t('spyGuess') : (spyfallUndercover ? t('undercoverCaught') : t('spyCaught'))}
          </Text>

          {fromGame ? null : (
            <Text style={styles.subtitle}>
              {lang === 'fr'
                ? `${suspectName} a été découvert ! Devinez le mot pour gagner.`
                : `${suspectName} was caught! Guess the word to win.`}
            </Text>
          )}

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={guess}
              onChangeText={setGuess}
              placeholder={t('spyGuessHint')}
              placeholderTextColor="#999"
              autoCapitalize="words"
              autoCorrect={false}
              maxLength={40}
              returnKeyType="done"
            />
          </View>

          <BouncePress
            onPress={handleSubmit}
            style={[styles.submitBtn, !guess.trim() && styles.submitBtnDisabled]}
            disabled={!guess.trim()}
          >
            <Text style={styles.submitBtnText}>{t('spyGuessConfirm')}</Text>
          </BouncePress>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5DC', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, gap: 16 },
  emoji: { fontSize: 64 },
  title: { fontFamily: 'BebasNeue', fontSize: 40, color: '#1a1a1a', letterSpacing: 2, textAlign: 'center' },
  subtitle: { fontFamily: 'SpaceMono', fontSize: 11, color: '#666', textAlign: 'center', letterSpacing: 1 },
  inputContainer: { width: '100%' },
  input: { fontFamily: 'BebasNeue', fontSize: 28, color: '#1a1a1a', borderBottomWidth: 2, borderBottomColor: 'rgba(0,0,0,0.3)', textAlign: 'center', paddingVertical: 8, letterSpacing: 2 },
  confirmBtn: { width: '100%', backgroundColor: '#1a1a1a', paddingVertical: 16, alignItems: 'center', borderRadius: 12 },
  confirmBtnText: { fontFamily: 'BebasNeue', fontSize: 22, color: '#F5F5DC', letterSpacing: 2 },
  submitBtn: { width: '100%', backgroundColor: '#ff4444', paddingVertical: 16, alignItems: 'center', borderRadius: 12 },
  submitBtnDisabled: { backgroundColor: 'rgba(255,68,68,0.3)' },
  submitBtnText: { fontFamily: 'BebasNeue', fontSize: 22, color: '#F5F5DC', letterSpacing: 2 },
});