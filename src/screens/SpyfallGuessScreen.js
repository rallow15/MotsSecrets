import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme';
import { t, getLang } from '../i18n';
import { playClick, playWin, playLose } from '../sound';

export default function SpyfallGuessScreen({ navigation, route }) {
  const { numPlayers, assignments, playerNames, selectedCategory, fromGame } = route.params;
  const [guess, setGuess] = useState('');
  const [showInput, setShowInput] = useState(fromGame ? false : true);
  const lang = getLang();

  // Trouver le mot secret (celui des innocents)
  const secretWord = assignments.find(a => a.role === 'normal')?.word || '';
  const spyName = playerNames?.[assignments.findIndex(a => a.role === 'spy')] || '';

  const handleConfirmSpy = () => {
    playClick();
    setShowInput(true);
  };

  const handleSubmit = () => {
    if (!guess.trim()) return;
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
    });
  };

  return (
    <View style={styles.container}>
      {!showInput ? (
        // Écran "Passez le téléphone à l'espion"
        <>
          <Text style={styles.emoji}>🕵️</Text>
          <Text style={styles.title}>{t('passToSpy')}</Text>
          <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmSpy} activeOpacity={0.8}>
            <Text style={styles.confirmBtnText}>{t('spyConfirmGuess')}</Text>
          </TouchableOpacity>
        </>
      ) : (
        // Écran de devinette
        <>
          <Text style={styles.title}>
            {fromGame ? t('spyGuess') : t('spyCaught')}
          </Text>

          {fromGame ? null : (
            <Text style={styles.subtitle}>
              {lang === 'fr'
                ? `${spyName} a été découvert ! Devinez le mot pour gagner.`
                : `${spyName} was caught! Guess the word to win.`}
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

          <TouchableOpacity
            style={[styles.submitBtn, !guess.trim() && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={!guess.trim()}
          >
            <Text style={styles.submitBtnText}>{t('spyGuessConfirm')}</Text>
          </TouchableOpacity>
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