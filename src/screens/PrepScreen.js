import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, TextInput, Keyboard, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { colors, screenThemes, useDarkTheme } from '../theme';
import { t } from '../i18n';
import { useFadeIn, triggerHaptic } from '../animations';

export default function PrepScreen({ navigation, route }) {
  const { numPlayers, assignments, currentPlayer, takenNumbers, playerNumbers, playerNames, selectedCategory, gameMode } = route.params;
  const darkTheme = useDarkTheme();
  const theme = darkTheme ? screenThemes.dark : screenThemes.light;
  const insets = useSafeAreaInsets();

  const existingName = Array.isArray(playerNames) ? (playerNames[currentPlayer] || '') : '';

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const { animatedStyle: fadeInStyle, start: startFadeIn } = useFadeIn(300);
  const [name, setName] = useState(existingName);
  const inputRef = useRef(null);

  useEffect(() => {
    startFadeIn();
    const n = Array.isArray(playerNames) ? (playerNames[currentPlayer] || '') : '';
    setName(n);

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.3, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,   duration: 800, useNativeDriver: true }),
      ])
    );
    pulse.start();

    if (!n) {
      const timer = setTimeout(() => inputRef.current?.focus(), 200);
      return () => { pulse.stop(); clearTimeout(timer); };
    }

    return () => { pulse.stop(); };
  }, [currentPlayer]);

  const handleTap = () => {
    Keyboard.dismiss();
    const newNames = Array.isArray(playerNames)
      ? [...playerNames]
      : new Array(numPlayers).fill('');
    newNames[currentPlayer] = name.trim().toUpperCase() || existingName;

    navigation.navigate('Reveal', {
      numPlayers, assignments, currentPlayer,
      takenNumbers, playerNumbers,
      playerNames: newNames,
      selectedCategory,
      gameMode,
      customWords: route.params.customWords || [],
      mimerMode: route.params.mimerMode,
      spyfallUndercover: route.params.spyfallUndercover ?? false,
      numUndercovers: route.params.numUndercovers ?? 1,
      numMisterWhites: route.params.numMisterWhites ?? 0,
      easyMode: route.params.easyMode ?? false,
      selectedCategories: route.params.selectedCategories,
      wordVisible: true,
      darkTheme,
    });
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <Image
        source={darkTheme ? require('../../assets/bg-sombre.jpg') : require('../../assets/bg-white.jpg')}
        style={styles.bgImage}
        resizeMode="cover"
      />
      <View style={darkTheme ? styles.bgGradientDark : styles.bgGradientLight} />
      <TouchableOpacity style={[styles.container, fadeInStyle]} activeOpacity={1} onPress={handleTap}>
        <TouchableOpacity style={[styles.backBtn, { top: insets.top + 55, backgroundColor: theme.backBtnBg, borderColor: theme.backBtnBorder }]} onPress={(e) => { e.stopPropagation(); triggerHaptic('light'); navigation.goBack(); }} activeOpacity={0.7}>
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={darkTheme ? '#e8d5ff' : '#1a1a1a'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M15 18l-6-6 6-6" />
          </Svg>
        </TouchableOpacity>

        <Text style={[styles.playerBadge, { color: theme.textMuted }]}>{t('playerLabel', currentPlayer + 1)}</Text>

        <View style={styles.nameWrap}>
          <TextInput
            ref={inputRef}
            style={[styles.nameInput, { color: theme.text, borderBottomColor: theme.inputBorder }]}
            value={name}
            onChangeText={setName}
            onSubmitEditing={handleTap}
            placeholder={t('namePlaceholder')}
            placeholderTextColor={darkTheme ? 'rgba(232,213,255,0.4)' : '#999'}
            maxLength={14}
            autoCorrect={false}
            returnKeyType="done"
            autoCapitalize="characters"
          />
        </View>

        <Text style={[styles.prompt, { color: theme.text }]}>{t('touchScreen')}</Text>

        <View style={styles.dotsRow}>
          {Array.from({ length: numPlayers }, (_, i) => (
            <View key={i} style={[
              styles.dot,
              i < currentPlayer  ? { backgroundColor: theme.dotDone } : null,
              i === currentPlayer ? { backgroundColor: theme.dotCurrent } : null,
              i > currentPlayer ? { backgroundColor: theme.border } : null,
            ]} />
          ))}
        </View>

        <Animated.Text style={[styles.tapIcon, { opacity: pulseAnim }]}>👆</Animated.Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  bgImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  bgGradientDark: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.15)' },
  bgGradientLight: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(180,150,80,0.10)' },
  container:  { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 8 },
  backBtn: { position: 'absolute', left: 20, width: 44, height: 44, borderRadius: 22, borderWidth: 2, alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  playerBadge:{ fontFamily: 'SpaceMono', fontSize: 11, letterSpacing: 5, overflow: 'visible' },
  nameWrap:   { width: '100%', alignItems: 'center', gap: 2 },
  nameInput:  { fontFamily: 'BebasNeue', fontSize: 36, borderBottomWidth: 2, textAlign: 'center', width: '80%', paddingVertical: 4, letterSpacing: 2, lineHeight: 44, overflow: 'visible' },
  prompt:     { fontFamily: 'BebasNeue', fontSize: 48, textAlign: 'center', lineHeight: 60, marginTop: 4, paddingTop: 4, overflow: 'visible' },
  dotsRow:    { flexDirection: 'row', gap: 8 },
  dot:        { width: 8, height: 8, borderRadius: 4 },
  tapIcon:    { fontSize: 40, marginTop: 8 },
});