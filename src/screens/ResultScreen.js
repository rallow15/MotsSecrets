import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, ScrollView, Pressable, Image } from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';
import { colors, screenThemes, useDarkTheme } from '../theme';
import { t } from '../i18n';
import { playClick, playWin, playLose, playIntruderReveal, playInnocentReveal, playMisterWhite, vibrate, vibrateIntruderFound } from '../sound';
import { triggerHaptic } from '../animations';
import { getLieuImage } from '../data/images';
import ScreenBackground from '../components/ScreenBackground';

export default function ResultScreen({ navigation, route }) {
  const { numPlayers, assignments, playerNumbers, playerNames, gameMode, spyfallOutcome } = route.params;
  const spyfallUndercover = route.params.spyfallUndercover ?? false;
  const isSpyfall = gameMode === 3;
  useKeepAwake();
  const darkTheme = useDarkTheme();
  const theme = darkTheme ? screenThemes.dark : screenThemes.light;

  // Joueur aléatoire qui commence
  const [starterIdx] = useState(() => Math.floor(Math.random() * numPlayers));
  const [revealed,   setRevealed]  = useState({});
  const drawingMode = route.params.drawingMode ?? false;
  const [showRecap,  setShowRecap] = useState((isSpyfall && !spyfallOutcome) || drawingMode);

  const scaleAnim   = useRef(new Animated.Value(0.2)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Sécuriser
  const safeNames  = Array.isArray(playerNames)  ? playerNames  : new Array(numPlayers).fill('');
  const safeAsgn   = Array.isArray(assignments)   ? assignments  : [];
  const starterName = safeNames[starterIdx] || t('playerFallback', starterIdx + 1);

  // Une animation pulse par carte (évite qu'elles pulsent toutes ensemble)
  const cardPulseAnims = useRef(safeAsgn.map(() => new Animated.Value(1))).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim,   { toValue: 1, friction: 5, tension: 120, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleNewGame = () => navigation.navigate('Menu');

  // REJOUER : noms conservés, catégorie conservée, mode dessin conservé
  const handleReplay = () =>
    navigation.navigate('Prep', {
      numPlayers,
      gameMode:     gameMode ?? 0,
      playerNames:  safeNames,          // ← noms conservés
      selectedCategory: route.params.selectedCategory, // ← catégorie conservée
      selectedCategories: route.params.selectedCategories, // ← multi-sélection conservée
      customWords: route.params.customWords || [], // ← mots personnalisés conservés
      mimerMode: route.params.mimerMode ?? false, // ← mode MIMER conservé
      spyfallUndercover: route.params.spyfallUndercover ?? false,
      numUndercovers: route.params.numUndercovers ?? 1,
      numMisterWhites: route.params.numMisterWhites ?? 0,
      easyMode: route.params.easyMode ?? false,
      drawingMode: route.params.drawingMode ?? false, // ← mode dessin conservé
      drawRounds: route.params.drawRounds ?? 3,
      currentPlayer: 0,
      takenNumbers:  [],
      playerNumbers: new Array(numPlayers).fill(null),
      assignments: null, // forcer la régénération via PrepScreenWrapper
    });

  const getRoleBadge = (role) => {
    if (role === 'intrus') return { label: t('roleIntrus'),   color: theme.danger, bg: 'rgba(255,68,68,0.12)' };
    if (role === 'mister') return { label: t('roleMister'),   color: colors.accent, bg: 'rgba(232,255,71,0.1)' };
    if (role === 'spy')    return { label: t('roleSpy'),       color: theme.danger, bg: 'rgba(255,68,68,0.15)' };
    return                        { label: t('roleInnocent'), color: theme.text, bg: darkTheme ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)' };
  };

  // ── RECAP ──────────────────────────────────────────────────
  if (showRecap) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: theme.bg }} contentContainerStyle={[styles.recapContainer, { backgroundColor: theme.bg }]}>
        <Text style={[styles.recapTitle, { color: theme.text }]}>{t('whoHadWhat')}</Text>
        <Text style={[styles.recapSub, { color: theme.textMuted }]}>{t('tapToReveal')}</Text>

        {safeAsgn.map((a, i) => {
          const isRev       = !!revealed[i];
          const badge       = getRoleBadge(a.role);
          const name        = safeNames[i] || t('playerFallback', i + 1);
          let wordDisplay = a.role === 'mister' ? t('roleMister') : a.role === 'spy' ? t('roleSpy') : (typeof a.word === 'string' ? a.word : '');
          // Enlever .jpg et .png pour l'affichage en mode MIMER
          if (wordDisplay && (wordDisplay.endsWith('.jpg') || wordDisplay.endsWith('.png'))) {
            wordDisplay = wordDisplay.replace('.jpg', '').replace('.png', '');
          }
          // Image lieu pour Spyfall
          const lieuImg = getLieuImage(wordDisplay);

          const handleReveal = () => {
            if (!isRev) {
              // Première révélation de cette carte
              if (a.role === 'intrus' || a.role === 'spy') {
                playIntruderReveal();
                vibrateIntruderFound();
                triggerHaptic('heavy');
              } else if (a.role === 'mister') {
                playMisterWhite();
                vibrate([50, 30, 50]);
                triggerHaptic('medium');
              } else {
                playInnocentReveal();
                triggerHaptic('light');
              }
              // Pulse animation on card reveal
              cardPulseAnims[i].setValue(0.92);
              Animated.spring(cardPulseAnims[i], {
                toValue: 1,
                friction: 4,
                tension: 140,
                useNativeDriver: true,
              }).start();
            }
            setRevealed(prev => ({ ...prev, [i]: !prev[i] }));
          };

          return (
            <Animated.View
              key={i}
              style={{ transform: [{ scale: isRev ? cardPulseAnims[i] : 1 }] }}
            >
            <Pressable
              onPress={() => { playClick(); handleReveal(); }}
              style={[
                styles.card,
                { backgroundColor: darkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderColor: theme.border },
                isRev && a.role === 'intrus' ? styles.cardIntrus : null,
                isRev && a.role === 'mister' ? styles.cardMister : null,
                isRev && a.role === 'spy' ? styles.cardSpy : null,
                isRev && a.role === 'normal' ? { borderColor: theme.border } : null,
              ]}
            >
              <View style={styles.cardLeft}>
                <Text style={[styles.cardPlayer, { color: theme.text }]}>{name}</Text>
                {isRev && lieuImg ? (
                  <View style={styles.cardLieuRow}>
                    <Image source={lieuImg} style={styles.cardLieuImage} resizeMode="contain" />
                    <View style={{ flexShrink: 1 }}>
                      <Text style={[
                        styles.cardWord,
                        a.role === 'intrus' ? { color: theme.danger } : null,
                        a.role === 'mister' ? { color: colors.accent } : null,
                        a.role === 'spy' ? { color: theme.danger } : null,
                        a.role === 'normal' ? { color: theme.text } : null,
                      ]}>
                        {wordDisplay}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <Text style={[
                    styles.cardWord,
                    { color: darkTheme ? 'rgba(232,213,255,0.4)' : '#999' },
                    isRev && a.role === 'intrus' ? { color: theme.danger } : null,
                    isRev && a.role === 'mister' ? { color: colors.accent } : null,
                    isRev && a.role === 'spy' ? { color: theme.danger } : null,
                    isRev && a.role === 'normal' ? { color: theme.text } : null,
                  ]}>
                    {isRev ? wordDisplay : '● ● ● ● ●'}
                  </Text>
                )}
              </View>

              <View style={styles.cardRight}>
                {!isRev ? (
                  <Text style={[styles.cardTap, { color: theme.textMuted }]}>👆 {t('tapToReveal')}</Text>
                ) : (
                  <View style={styles.badgesCol}>
                    {i === starterIdx && (
                      <View style={[styles.badge, { borderColor: darkTheme ? '#666' : '#999' }]}>
                        <Text style={[styles.badgeText, { color: theme.textMuted }]}>{t('roleStarts')}</Text>
                      </View>
                    )}
                    <View style={[styles.badge, { borderColor: badge.color, backgroundColor: badge.bg }]}>
                      <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
                    </View>
                  </View>
                )}
              </View>
            </Pressable>
            </Animated.View>
          );
        })}

        <View style={styles.recapBtns}>
          <TouchableOpacity accessibilityLabel={t('replay')} accessibilityRole="button" style={[styles.replayBtn, { backgroundColor: theme.okBtnBg }]} onPress={handleReplay}>
            <Text style={[styles.replayBtnText, { color: theme.okBtnText }]}>{t('replay')}</Text>
          </TouchableOpacity>
          <TouchableOpacity accessibilityLabel={t('newGame')} accessibilityRole="button" style={[styles.newBtn, { borderColor: theme.text }]} onPress={handleNewGame}>
            <Text style={[styles.newBtnText, { color: theme.text }]}>{t('newGame')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // ── ECRAN PRINCIPAL ────────────────────────────────────────
  // Spyfall outcomes
  const spyfallTitle = (() => {
    if (!isSpyfall || !spyfallOutcome) return null;
    const winsLabel = spyfallUndercover ? t('intruderWinsSpyfall') : t('spyWins');
    switch (spyfallOutcome) {
      case 'spyWinsTie': return winsLabel;
      case 'spyWinsWrongAccusation': return t('wrongAccusation') + '\n' + winsLabel;
      case 'spyGuessRight': return (spyfallUndercover ? t('undercoverGuessRight') : t('spyGuessRight')) + '\n' + winsLabel;
      case 'spyGuessWrong': return (spyfallUndercover ? t('undercoverGuessWrong') : t('spyGuessWrong')) + '\n' + t('innocentsWin');
      default: return null;
    }
  })();

  if (isSpyfall && spyfallOutcome) {
    const spyWins = spyfallOutcome === 'spyWinsTie' || spyfallOutcome === 'spyWinsWrongAccusation' || spyfallOutcome === 'spyGuessRight';
    return (
      <ScreenBackground darkTheme={darkTheme} style={[styles.container, { backgroundColor: theme.bg }]}>
        <Text style={[styles.commenceLabel, { color: spyWins ? theme.danger : theme.text }]}>
          {spyWins ? (spyfallUndercover ? '🥸' : '🕵️') : '🎉'}
        </Text>
        <Animated.Text style={[styles.winnerName, { transform: [{ scale: scaleAnim }], opacity: opacityAnim, color: theme.text }]}>
          {spyfallTitle}
        </Animated.Text>
        <TouchableOpacity style={[styles.revealBtn, { backgroundColor: theme.okBtnBg }]} onPress={() => setShowRecap(true)}>
          <Text style={[styles.revealBtnText, { color: theme.okBtnText }]}>{t('revealPlayers')}</Text>
        </TouchableOpacity>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground darkTheme={darkTheme} style={[styles.container, { backgroundColor: theme.bg }]}>
      <Text style={[styles.commenceLabel, { color: theme.textMuted }]}>{t('startsFirst')}</Text>
      <Animated.Text style={[styles.winnerName, { transform: [{ scale: scaleAnim }], opacity: opacityAnim, color: theme.text }]}>
        {starterName}
      </Animated.Text>
      <TouchableOpacity style={[styles.revealBtn, { backgroundColor: theme.okBtnBg }]} onPress={() => setShowRecap(true)}>
        <Text style={[styles.revealBtnText, { color: theme.okBtnText }]}>{t('revealPlayers')}</Text>
      </TouchableOpacity>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, gap: 16 },
  commenceLabel: { fontFamily: 'SpaceMono', fontSize: 10, letterSpacing: 3 },
  winnerName:    { fontFamily: 'BebasNeue', fontSize: 72, textAlign: 'center', lineHeight: 72, letterSpacing: 2 },
  revealBtn:     { width: '100%', paddingVertical: 18, alignItems: 'center', marginTop: 8, borderRadius: 12 },
  revealBtnText: { fontFamily: 'BebasNeue', fontSize: 22, letterSpacing: 2 },
  recapContainer:{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16, gap: 8 },
  recapTitle:    { fontFamily: 'BebasNeue', fontSize: 48, letterSpacing: 2, textAlign: 'center' },
  recapSub:      { fontFamily: 'SpaceMono', fontSize: 9, letterSpacing: 3, textAlign: 'center', marginBottom: 10 },
  card:          { borderWidth: 1, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 10 },
  cardIntrus:    { borderColor: 'rgba(255,68,68,0.4)',   backgroundColor: 'rgba(255,68,68,0.1)' },
  cardSpy:       { borderColor: 'rgba(255,68,68,0.5)',   backgroundColor: 'rgba(255,68,68,0.12)' },
  cardMister:    { borderColor: 'rgba(232,255,71,0.5)', backgroundColor: 'rgba(232,255,71,0.08)' },
  cardLeft:      { flex: 1, gap: 4 },
  cardPlayer:    { fontFamily: 'SpaceMono', fontSize: 9, letterSpacing: 2 },
  cardLieuRow:   { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardLieuImage: { width: 36, height: 36, borderRadius: 4 },
  cardWord:      { fontFamily: 'BebasNeue', fontSize: 28, letterSpacing: 1 },
  cardRight:     { alignItems: 'flex-end', gap: 4 },
  cardTap:       { fontFamily: 'SpaceMono', fontSize: 9, letterSpacing: 1 },
  badgesCol:     { alignItems: 'flex-end', gap: 4 },
  badge:         { borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText:     { fontFamily: 'SpaceMono', fontSize: 8, letterSpacing: 1 },
  recapBtns:     { gap: 10, marginTop: 20 },
  replayBtn:     { paddingVertical: 16, alignItems: 'center', borderRadius: 12 },
  replayBtnText: { fontFamily: 'BebasNeue', fontSize: 22, letterSpacing: 2 },
  newBtn:        { borderWidth: 1, paddingVertical: 16, alignItems: 'center', borderRadius: 12 },
  newBtnText:    { fontFamily: 'BebasNeue', fontSize: 22, letterSpacing: 2 },
});
