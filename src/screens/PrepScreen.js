import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, TextInput, Keyboard } from 'react-native';
import { colors } from '../theme';
import { t } from '../i18n';

export default function PrepScreen({ navigation, route }) {
  const { numPlayers, assignments, currentPlayer, takenNumbers, playerNumbers, playerNames } = route.params;

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

    navigation.navigate('Reveal', {
      numPlayers, assignments, currentPlayer,
      takenNumbers, playerNumbers,
      playerNames: newNames,
    });
  };

  return (
    <TouchableOpacity style={styles.container} activeOpacity={1} onPress={handleTap}>
      <Text style={styles.playerBadge}>{t('playerLabel', currentPlayer + 1)}</Text>

      <View style={styles.nameWrap} onStartShouldSetResponder={() => true}>
        <TextInput
          ref={inputRef}
          style={styles.nameInput}
          value={name}
          onChangeText={setName}
          onSubmitEditing={handleTap}
          placeholder={t('namePlaceholder')}
          placeholderTextColor="#333"
          maxLength={14}
          autoCorrect={false}
          returnKeyType="done"
        />
        <Text style={styles.nameHint}>{t('nameHint')}</Text>
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
  container:  { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 12 },
  playerBadge:{ fontFamily: 'SpaceMono', fontSize: 11, color: colors.gray, letterSpacing: 5 },
  nameWrap:   { width: '100%', alignItems: 'center', gap: 6 },
  nameInput:  { fontFamily: 'BebasNeue', fontSize: 44, color: colors.text, borderBottomWidth: 2, borderBottomColor: '#444', textAlign: 'center', width: '80%', paddingVertical: 4, letterSpacing: 2 },
  nameHint:   { fontFamily: 'SpaceMono', fontSize: 8, color: colors.muted, letterSpacing: 2 },
  prompt:     { fontFamily: 'BebasNeue', fontSize: 72, color: colors.text, textAlign: 'center', lineHeight: 66 },
  dotsRow:    { flexDirection: 'row', gap: 8 },
  dot:        { width: 8, height: 8, borderRadius: 4, backgroundColor: '#222' },
  dotDone:    { backgroundColor: colors.accent },
  dotCurrent: { backgroundColor: colors.text },
  tapIcon:    { fontSize: 48 },
});
