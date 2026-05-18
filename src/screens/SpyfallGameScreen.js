import React, { useState } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import { t } from '../i18n';
import { playClick, playReveal } from '../sound';
import { useScaleIn, triggerHaptic } from '../animations';
import { screenThemes, useDarkTheme } from '../theme';
import BouncePress from '../components/BouncePress';

export default function SpyfallGameScreen({ navigation, route }) {
  const { numPlayers, assignments, playerNames, selectedCategory, numUndercovers, numMisterWhites, easyMode, mimerMode, customWords, spyfallUndercover: spyfallUC } = route.params;
  const spyfallUndercover = spyfallUC ?? false;
  const darkTheme = useDarkTheme();
  const theme = darkTheme ? screenThemes.dark : screenThemes.light;

  const safeNames = Array.isArray(playerNames) ? playerNames : new Array(numPlayers).fill('');
  const [starterIdx] = useState(() => Math.floor(Math.random() * numPlayers));
  const starterName = safeNames[starterIdx] || t('playerFallback', starterIdx + 1);
  const { animatedStyle: scaleStyle, start: startScaleIn } = useScaleIn();

  React.useEffect(() => {
    startScaleIn();
  }, []);

  const handleReveal = () => {
    playClick();
    playReveal();
    triggerHaptic('medium');
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
      selectedCategories: route.params.selectedCategories,
      darkTheme,
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <Image
        source={darkTheme ? require('../../assets/bg-sombre.jpg') : require('../../assets/bg-white.jpg')}
        style={styles.bgImage}
        resizeMode="cover"
      />
      <View style={darkTheme ? styles.bgGradientDark : styles.bgGradientLight} />

      <Animated.View style={[styles.starterRow, scaleStyle]}>
        <Text style={[styles.starterLabel, { color: theme.textMuted }]}>{t('startsFirst')}</Text>
        <Text style={[styles.starterName, { color: theme.text }]}>{starterName}</Text>
      </Animated.View>

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <BouncePress onPress={handleReveal} style={[styles.revealBtn, { backgroundColor: theme.okBtnBg }]}>
        <Text style={[styles.revealBtnText, { color: theme.okBtnText }]}>{t('revealPlayers')}</Text>
      </BouncePress>

      <Text style={[styles.hint, { color: theme.textMuted }]}>{t('voteInstruction')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, gap: 16 },
  bgImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  bgGradientDark: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.15)' },
  bgGradientLight: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(180,150,80,0.10)' },
  divider: { width: '60%', height: 2, marginVertical: 8 },
  starterRow: { alignItems: 'center', gap: 4 },
  starterLabel: { fontFamily: 'SpaceMono', fontSize: 10, letterSpacing: 3 },
  starterName: { fontFamily: 'BebasNeue', fontSize: 28, letterSpacing: 2 },
  revealBtn: { width: '100%', paddingVertical: 18, alignItems: 'center', borderRadius: 12 },
  revealBtnText: { fontFamily: 'BebasNeue', fontSize: 22, letterSpacing: 2 },
  hint: { fontFamily: 'SpaceMono', fontSize: 11, textAlign: 'center', letterSpacing: 1 },
});