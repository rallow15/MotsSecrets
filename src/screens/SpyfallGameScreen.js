import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { t } from '../i18n';
import { playClick, playReveal } from '../sound';

export default function SpyfallGameScreen({ navigation, route }) {
  const { numPlayers, assignments, playerNames, selectedCategory, numUndercovers, numMisterWhites, easyMode, mimerMode, customWords, spyfallUndercover: spyfallUC } = route.params;
  const spyfallUndercover = spyfallUC ?? false;

  const safeNames = Array.isArray(playerNames) ? playerNames : new Array(numPlayers).fill('');
  const [starterIdx] = useState(() => Math.floor(Math.random() * numPlayers));
  const starterName = safeNames[starterIdx] || t('playerFallback', starterIdx + 1);

  const handleReveal = () => {
    playClick();
    playReveal();
    navigation.navigate('Result', {
      numPlayers,
      assignments,
      playerNumbers: new Array(numPlayers).fill(null),
      playerNames,
      selectedCategory,
      gameMode: 3,
      spyfallUndercover,
      numUndercovers: numUndercovers ?? 1,
      numMisterWhites: numMisterWhites ?? 0,
      easyMode: easyMode ?? false,
      mimerMode: mimerMode ?? false,
      customWords: customWords || [],
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.starterRow}>
        <Text style={styles.starterLabel}>{t('startsFirst')}</Text>
        <Text style={styles.starterName}>{starterName}</Text>
      </View>

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
  divider: { width: '60%', height: 2, backgroundColor: 'rgba(0,0,0,0.15)', marginVertical: 8 },
  starterRow: { alignItems: 'center', gap: 4 },
  starterLabel: { fontFamily: 'SpaceMono', fontSize: 10, color: '#666', letterSpacing: 3 },
  starterName: { fontFamily: 'BebasNeue', fontSize: 28, color: '#1a1a1a', letterSpacing: 2 },
  revealBtn: { width: '100%', backgroundColor: '#1a1a1a', paddingVertical: 18, alignItems: 'center', borderRadius: 12 },
  revealBtnText: { fontFamily: 'BebasNeue', fontSize: 22, color: '#F5F5DC', letterSpacing: 2 },
  hint: { fontFamily: 'SpaceMono', fontSize: 11, color: '#666', textAlign: 'center', letterSpacing: 1 },
});