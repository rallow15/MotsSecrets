import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, TextInput, Keyboard } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../theme';
import { t } from '../i18n';

export default function PrepScreen({ navigation, route }) {
  const { numPlayers, assignments, currentPlayer, takenNumbers, playerNumbers, playerNames, selectedCategory, gameMode } = route.params;

  // Pré-remplir avec le nom existant s'il y en a un (cas rejouer)
  const existingName = Array.isArray(playerNames) ? (playerNames[currentPlayer] || '') : '';

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [name, setName] = useState(existingName);
  const inputRef = useRef(null);

  useEffect(() => {
    // Mettre le nom existant, pas vide
    const n = Array.isArray(playerNames) ? (playerNames[currentPlayer] || '') : '';
    setName(n);

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,   duration: 800, useNativeDriver: true }),
      ])
    ).start();

    // Focus seulement si pas de nom pré-rempli
    if (!n) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [currentPlayer]);

  const handleTap = () => {
    Keyboard.dismiss();
    const newNames = Array.isArray(playerNames)
      ? [...playerNames]
      : new Array(numPlayers).fill('');
    // Garder le nom tapé ou l'existant si l'input est vide
    newNames[currentPlayer] = name.trim().toUpperCase() || existingName;

    // Passer directement à l'écran de révélation du mot (wordVisible: true)
    navigation.navigate('Reveal', {
      numPlayers, assignments, currentPlayer,
      takenNumbers, playerNumbers,
      playerNames: newNames,
      selectedCategory,
      gameMode,
      wordVisible: true,  // Afficher le mot directement
    });
  };

  return (
    <TouchableOpacity style={styles.container} activeOpacity={1} onPress={handleTap}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <Path d="M15 18l-6-6 6-6" />
        </Svg>
      </TouchableOpacity>

      <Text style={styles.playerBadge}>{t('playerLabel', currentPlayer + 1)}</Text>

      <View style={styles.nameWrap} onStartShouldSetResponder={() => true}>
        <TextInput
          ref={inputRef}
          style={styles.nameInput}
          value={name}
          onChangeText={setName}
          onSubmitEditing={handleTap}
          placeholder={t('namePlaceholder')}
          placeholderTextColor="#666"
          maxLength={14}
          autoCorrect={false}
          returnKeyType="done"
          autoCapitalize="characters"
        />
      </View>

      <Text style={styles.prompt}>{t('touchScreen')}</Text>

      <View style={styles.dotsRow}>
        {Array.from({ length: numPlayers }, (_, i) => (
          <View key={i} style={[
            styles.dot,
            i < currentPlayer  && styles.dotDone,
            i === currentPlayer && styles.dotCurrent,
          ]} />
        ))}
      </View>

      <Animated.Text style={[styles.tapIcon, { opacity: pulseAnim }]}>👆</Animated.Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#F5F5DC', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 8, paddingTop: 50 },
  backBtn: { position: 'absolute', top: 50, left: 20, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.1)', borderWidth: 2, borderColor: 'rgba(0,0,0,0.2)', alignItems: 'center', justifyContent: 'center' },
  playerBadge:{ fontFamily: 'SpaceMono', fontSize: 11, color: '#333', letterSpacing: 5 },
  nameWrap:   { width: '100%', alignItems: 'center', gap: 2 },
  nameInput:  { fontFamily: 'BebasNeue', fontSize: 36, color: '#000000', borderBottomWidth: 2, borderBottomColor: 'rgba(0,0,0,0.3)', textAlign: 'center', width: '80%', paddingVertical: 4, letterSpacing: 2 },
  prompt:     { fontFamily: 'BebasNeue', fontSize: 56, color: '#1a1a1a', textAlign: 'center', lineHeight: 52 },
  dotsRow:    { flexDirection: 'row', gap: 8 },
  dot:        { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(0,0,0,0.2)' },
  dotDone:    { backgroundColor: '#1a1a1a' },
  dotCurrent: { backgroundColor: '#4FC3F7' },
  tapIcon:    { fontSize: 40, marginTop: 8 },
});
