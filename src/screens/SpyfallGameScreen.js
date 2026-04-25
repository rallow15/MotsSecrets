import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../theme';
import { t } from '../i18n';
import { playClick, playReveal } from '../sound';

export default function SpyfallGameScreen({ navigation, route }) {
  const { numPlayers, assignments, playerNames, spyfallTimer: initialTimer, selectedCategory } = route.params;
  const [timeLeft, setTimeLeft] = useState((initialTimer ?? 8) * 60);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (timeLeft === 0) {
      clearInterval(timerRef.current);
      navigation.navigate('Result', {
        numPlayers,
        assignments,
        playerNumbers: new Array(numPlayers).fill(null),
        playerNames,
        selectedCategory,
        gameMode: 3,
        spyfallOutcome: 'spyWinsTimer',
      });
    }
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  const isUrgent = timeLeft <= 30;

  const handleReveal = () => {
    playClick();
    playReveal();
    clearInterval(timerRef.current);
    navigation.navigate('Result', {
      numPlayers,
      assignments,
      playerNumbers: new Array(numPlayers).fill(null),
      playerNames,
      selectedCategory,
      gameMode: 3,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.timerLabel}>{t('timeLeft')}</Text>
      <Text style={[styles.timer, isUrgent && styles.timerUrgent]}>{timeStr}</Text>

      <View style={styles.divider} />

      <TouchableOpacity style={styles.revealBtn} onPress={handleReveal} activeOpacity={0.8}>
        <Text style={styles.revealBtnText}>{t('revealPlayers')}</Text>
      </TouchableOpacity>

      <Text style={styles.hint}>{t('voteInstruction')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5DC', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, gap: 16 },
  timerLabel: { fontFamily: 'SpaceMono', fontSize: 10, color: '#666', letterSpacing: 3 },
  timer: { fontFamily: 'BebasNeue', fontSize: 96, color: '#1a1a1a', letterSpacing: 4 },
  timerUrgent: { color: '#ff4444' },
  divider: { width: '60%', height: 2, backgroundColor: 'rgba(0,0,0,0.15)', marginVertical: 8 },
  revealBtn: { width: '100%', backgroundColor: '#1a1a1a', paddingVertical: 18, alignItems: 'center', borderRadius: 12 },
  revealBtnText: { fontFamily: 'BebasNeue', fontSize: 22, color: '#F5F5DC', letterSpacing: 2 },
  hint: { fontFamily: 'SpaceMono', fontSize: 11, color: '#666', textAlign: 'center', letterSpacing: 1 },
});