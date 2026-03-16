import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, ScrollView, Pressable } from 'react-native';
import { colors } from '../theme';
import { t } from '../i18n';

let InterstitialAd;
try {
  const admob = require('react-native-google-mobile-ads');
  InterstitialAd = admob.InterstitialAd;
} catch (e) {}

const AD_UNIT = __DEV__
  ? 'ca-app-pub-3940256099942544/1033173712'
  : 'REMPLACE_PAR_TON_AD_UNIT_ID';

export default function ResultScreen({ navigation, route }) {
  const { numPlayers, assignments, playerNumbers, playerNames, gameMode } = route.params;

  // Joueur aléatoire qui commence
  const [starterIdx] = useState(() => Math.floor(Math.random() * numPlayers));
  const [revealed,   setRevealed]  = useState({});
  const [showRecap,  setShowRecap] = useState(false);

  const scaleAnim   = useRef(new Animated.Value(0.2)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const adRef       = useRef(null);

  // Sécuriser
  const safeNames  = Array.isArray(playerNames)  ? playerNames  : new Array(numPlayers).fill('');
  const safeAsgn   = Array.isArray(assignments)   ? assignments  : [];
  const starterName = safeNames[starterIdx] || t('playerFallback', starterIdx + 1);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim,   { toValue: 1, friction: 5, tension: 120, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
    if (InterstitialAd) {
      try {
        const ad = InterstitialAd.createForAdRequest(AD_UNIT);
        adRef.current = ad;
        ad.load();
      } catch (e) {}
    }
  }, []);

  const go = (cb) => { try { adRef.current?.show(); } catch (e) {} cb(); };

  const handleNewGame = () => go(() => navigation.navigate('Menu'));

  // REJOUER : noms conservés, nouveaux assignments générés par PrepScreenWrapper
  const handleReplay = () => go(() =>
    navigation.navigate('Prep', {
      numPlayers,
      gameMode:     gameMode ?? 0,
      playerNames:  safeNames,          // ← noms conservés
      currentPlayer: 0,
      takenNumbers:  [],
      playerNumbers: new Array(numPlayers).fill(null),
      // PAS d'assignments → PrepScreenWrapper en génère de nouveaux
    })
  );

  const getRoleBadge = (role) => {
    if (role === 'intrus') return { label: t('roleIntrus'),   color: colors.danger, bg: 'rgba(255,68,68,0.12)' };
    if (role === 'mister') return { label: t('roleMister'),   color: colors.accent, bg: 'rgba(232,255,71,0.1)' };
    return                        { label: t('roleInnocent'), color: colors.text,   bg: 'rgba(255,255,255,0.06)' };
  };

  // ── RECAP ──────────────────────────────────────────────────
  if (showRecap) {
    return (
      <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={styles.recapContainer}>
        <Text style={styles.recapTitle}>{t('whoHadWhat')}</Text>
        <Text style={styles.recapSub}>{t('tapToReveal')}</Text>

        {safeAsgn.map((a, i) => {
          const isRev       = !!revealed[i];
          const badge       = getRoleBadge(a.role);
          const name        = safeNames[i] || t('playerFallback', i + 1);
          const wordDisplay = a.role === 'mister' ? 'MISTER WHITE' : (a.word ?? '');

          return (
            <Pressable
              key={i}
              onPress={() => setRevealed(prev => ({ ...prev, [i]: !prev[i] }))}
              style={[
                styles.card,
                isRev && a.role === 'intrus' && styles.cardIntrus,
                isRev && a.role === 'mister' && styles.cardMister,
                isRev && a.role === 'normal' && styles.cardNormal,
              ]}
            >
              <View style={styles.cardLeft}>
                <Text style={styles.cardPlayer}>{name}</Text>
                <Text style={[
                  styles.cardWord,
                  isRev && a.role === 'intrus' && { color: colors.danger },
                  isRev && a.role === 'mister' && { color: colors.accent },
                  isRev && a.role === 'normal' && { color: colors.text },
                ]}>
                  {isRev ? wordDisplay : '● ● ● ● ●'}
                </Text>
              </View>

              <View style={styles.cardRight}>
                {!isRev ? (
                  <Text style={styles.cardTap}>👆 {t('tapToReveal')}</Text>
                ) : (
                  <View style={styles.badgesCol}>
                    {i === starterIdx && (
                      <View style={[styles.badge, { borderColor: '#666' }]}>
                        <Text style={[styles.badgeText, { color: colors.text }]}>{t('roleStarts')}</Text>
                      </View>
                    )}
                    <View style={[styles.badge, { borderColor: badge.color, backgroundColor: badge.bg }]}>
                      <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
                    </View>
                  </View>
                )}
              </View>
            </Pressable>
          );
        })}

        <View style={styles.recapBtns}>
          <TouchableOpacity style={styles.replayBtn} onPress={handleReplay}>
            <Text style={styles.replayBtnText}>{t('replay')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.newBtn} onPress={handleNewGame}>
            <Text style={styles.newBtnText}>{t('newGame')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // ── ECRAN PRINCIPAL ────────────────────────────────────────
  return (
    <View style={styles.container}>
      <Text style={styles.commenceLabel}>{t('startsFirst')}</Text>
      <Animated.Text style={[styles.winnerName, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
        {starterName}
      </Animated.Text>
      <TouchableOpacity style={styles.revealBtn} onPress={() => setShowRecap(true)}>
        <Text style={styles.revealBtnText}>{t('revealPlayers')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, gap: 16 },
  commenceLabel: { fontFamily: 'SpaceMono', fontSize: 10, color: colors.gray, letterSpacing: 3 },
  winnerName:    { fontFamily: 'BebasNeue', fontSize: 88, color: colors.accent, textAlign: 'center', lineHeight: 84, letterSpacing: 2, textShadowColor: 'rgba(232,255,71,0.4)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 30 },
  revealBtn:     { width: '100%', backgroundColor: colors.accent, paddingVertical: 18, alignItems: 'center', marginTop: 8 },
  revealBtnText: { fontFamily: 'BebasNeue', fontSize: 22, color: colors.bg, letterSpacing: 2 },
  recapContainer:{ backgroundColor: colors.bg, paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40, gap: 8 },
  recapTitle:    { fontFamily: 'BebasNeue', fontSize: 48, color: colors.accent, letterSpacing: 2, textAlign: 'center' },
  recapSub:      { fontFamily: 'SpaceMono', fontSize: 9, color: colors.gray, letterSpacing: 3, textAlign: 'center', marginBottom: 10 },
  card:          { borderWidth: 1, borderColor: '#1e1e1e', padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardIntrus:    { borderColor: 'rgba(255,68,68,0.5)',   backgroundColor: 'rgba(255,68,68,0.04)' },
  cardMister:    { borderColor: 'rgba(232,255,71,0.4)',  backgroundColor: 'rgba(232,255,71,0.03)' },
  cardNormal:    { borderColor: 'rgba(255,255,255,0.12)' },
  cardLeft:      { flex: 1, gap: 4 },
  cardPlayer:    { fontFamily: 'SpaceMono', fontSize: 9, color: colors.gray, letterSpacing: 2 },
  cardWord:      { fontFamily: 'BebasNeue', fontSize: 28, color: '#333', letterSpacing: 1 },
  cardRight:     { alignItems: 'flex-end', gap: 4 },
  cardTap:       { fontFamily: 'SpaceMono', fontSize: 9, color: colors.muted, letterSpacing: 1 },
  badgesCol:     { alignItems: 'flex-end', gap: 4 },
  badge:         { borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText:     { fontFamily: 'SpaceMono', fontSize: 8, letterSpacing: 1 },
  recapBtns:     { gap: 10, marginTop: 20 },
  replayBtn:     { backgroundColor: colors.accent, paddingVertical: 16, alignItems: 'center' },
  replayBtnText: { fontFamily: 'BebasNeue', fontSize: 22, color: colors.bg, letterSpacing: 2 },
  newBtn:        { borderWidth: 1, borderColor: colors.accent, paddingVertical: 16, alignItems: 'center' },
  newBtnText:    { fontFamily: 'BebasNeue', fontSize: 22, color: colors.accent, letterSpacing: 2 },
});
