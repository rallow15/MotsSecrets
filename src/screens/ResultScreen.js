import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, ScrollView, Pressable, Image } from 'react-native';
import { colors } from '../theme';
import { t } from '../i18n';
import { playClick, playWin, playLose, playIntruderReveal, playInnocentReveal, playMisterWhite, vibrate, vibrateIntruderFound } from '../sound';

// Images LIEUX - pour l'affichage Spyfall
const LIEUX_IMAGES = {
  'Plage': require('../../assets/lieux/01_Plage.png'),
  'Restaurant': require('../../assets/lieux/02_Restaurant.png'),
  'Cinéma': require('../../assets/lieux/03_Cinema.png'),
  'Hôpital': require('../../assets/lieux/04_Hopital.png'),
  'Avion': require('../../assets/lieux/05_Avion.png'),
  'École': require('../../assets/lieux/06_Ecole.png'),
  'Gare': require('../../assets/lieux/07_Gare.png'),
  'Supermarché': require('../../assets/lieux/08_Supermarche.png'),
  "Parc d'attractions": require('../../assets/lieux/09_Parc_attractions.png'),
  'Stade': require('../../assets/lieux/10_Stade.png'),
  'Bibliothèque': require('../../assets/lieux/11_Bibliotheque.png'),
  'Musée': require('../../assets/lieux/12_Musee.png'),
  'Aéroport': require('../../assets/lieux/13_Aeroport.png'),
  'Hôtel': require('../../assets/lieux/14_Hotel.png'),
  'Banque': require('../../assets/lieux/15_Banque.png'),
  'Casino': require('../../assets/lieux/16_Casino.png'),
  'Église': require('../../assets/lieux/17_Eglise.png'),
  'Prison': require('../../assets/lieux/18_Prison.png'),
  'Ambassade': require('../../assets/lieux/19_Ambassade.png'),
  'Théâtre': require('../../assets/lieux/20_Theatre.png'),
  'Cirque': require('../../assets/lieux/21_Cirque.png'),
  'Bateau de croisière': require('../../assets/lieux/22_Bateau_croisiere.png'),
  'Camp militaire': require('../../assets/lieux/23_Camp_militaire.png'),
  'Station spatiale': require('../../assets/lieux/24_Station_spatiale.png'),
  'Sous-marin': require('../../assets/lieux/25_Sous-marin.png'),
  'Pôle Nord': require('../../assets/lieux/26_Pole_Nord.png'),
  'Désert': require('../../assets/lieux/27_Desert.png'),
  'Forêt tropicale': require('../../assets/lieux/28_Foret_tropicale.png'),
  'Île déserte': require('../../assets/lieux/29_Ile_deserte.png'),
  'Volcan': require('../../assets/lieux/30_Volcan.png'),
  'Marché': require('../../assets/lieux/31_Marche.png'),
  'Usine': require('../../assets/lieux/32_Usine.png'),
  'Laboratoire': require('../../assets/lieux/33_Laboratoire.png'),
  'Opéra': require('../../assets/lieux/34_Opera.png'),
  'Stade olympique': require('../../assets/lieux/35_Stade_olympique.png'),
  'Spa': require('../../assets/lieux/36_Spa.png'),
  'Festival': require('../../assets/lieux/37_Festival.png'),
  'Caravane': require('../../assets/lieux/38_Caravane.png'),
  'Phare': require('../../assets/lieux/39_Phare.png'),
  'Château': require('../../assets/lieux/40_Chateau.png'),
  'Beach': require('../../assets/lieux/01_Plage.png'),
  'Cinema': require('../../assets/lieux/03_Cinema.png'),
  'Hospital': require('../../assets/lieux/04_Hopital.png'),
  'Airplane': require('../../assets/lieux/05_Avion.png'),
  'School': require('../../assets/lieux/06_Ecole.png'),
  'Train Station': require('../../assets/lieux/07_Gare.png'),
  'Supermarket': require('../../assets/lieux/08_Supermarche.png'),
  'Amusement Park': require('../../assets/lieux/09_Parc_attractions.png'),
  'Stadium': require('../../assets/lieux/10_Stade.png'),
  'Library': require('../../assets/lieux/11_Bibliotheque.png'),
  'Museum': require('../../assets/lieux/12_Musee.png'),
  'Airport': require('../../assets/lieux/13_Aeroport.png'),
  'Hotel': require('../../assets/lieux/14_Hotel.png'),
  'Bank': require('../../assets/lieux/15_Banque.png'),
  'Church': require('../../assets/lieux/17_Eglise.png'),
  'Embassy': require('../../assets/lieux/19_Ambassade.png'),
  'Theater': require('../../assets/lieux/20_Theatre.png'),
  'Circus': require('../../assets/lieux/21_Cirque.png'),
  'Cruise Ship': require('../../assets/lieux/22_Bateau_croisiere.png'),
  'Military Camp': require('../../assets/lieux/23_Camp_militaire.png'),
  'Space Station': require('../../assets/lieux/24_Station_spatiale.png'),
  'Submarine': require('../../assets/lieux/25_Sous-marin.png'),
  'North Pole': require('../../assets/lieux/26_Pole_Nord.png'),
  'Desert': require('../../assets/lieux/27_Desert.png'),
  'Rainforest': require('../../assets/lieux/28_Foret_tropicale.png'),
  'Desert Island': require('../../assets/lieux/29_Ile_deserte.png'),
  'Volcano': require('../../assets/lieux/30_Volcan.png'),
  'Market': require('../../assets/lieux/31_Marche.png'),
  'Factory': require('../../assets/lieux/32_Usine.png'),
  'Laboratory': require('../../assets/lieux/33_Laboratoire.png'),
  'Opera': require('../../assets/lieux/34_Opera.png'),
  'Olympic Stadium': require('../../assets/lieux/35_Stade_olympique.png'),
  'Spa': require('../../assets/lieux/36_Spa.png'),
  'Festival': require('../../assets/lieux/37_Festival.png'),
  'Caravan': require('../../assets/lieux/38_Caravane.png'),
  'Lighthouse': require('../../assets/lieux/39_Phare.png'),
  'Castle': require('../../assets/lieux/40_Chateau.png'),
  'Restaurant': require('../../assets/lieux/02_Restaurant.png'),
  'Casino': require('../../assets/lieux/16_Casino.png'),
  'Prison': require('../../assets/lieux/18_Prison.png'),
};
import Constants from 'expo-constants';

// Détecter si on est dans Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

// InterstitialAd - chargé dynamiquement uniquement si pas Expo Go
let InterstitialAd = null;
// TODO: remplace par ton vrai ad unit ID interstitiel dans AdMob
const INTERSTITIAL_AD_UNIT_PROD = null;
const AD_UNIT = __DEV__
  ? 'ca-app-pub-3940256099942544/1033173712'
  : INTERSTITIAL_AD_UNIT_PROD;

function loadInterstitialAd() {
  if (isExpoGo) return false;
  try {
    const admob = require('react-native-google-mobile-ads');
    InterstitialAd = admob.InterstitialAd;
    return true;
  } catch (e) {
    console.log('❌ InterstitialAd non disponible:', e.message);
    return false;
  }
}

export default function ResultScreen({ navigation, route }) {
  const { numPlayers, assignments, playerNumbers, playerNames, gameMode, spyfallOutcome } = route.params;
  const isSpyfall = gameMode === 3;

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
    if (!isExpoGo && AD_UNIT && loadInterstitialAd() && InterstitialAd) {
      try {
        const ad = InterstitialAd.createForAdRequest(AD_UNIT);
        adRef.current = ad;
        ad.load();
      } catch (e) {}
    }
  }, []);

  const go = (cb) => { try { adRef.current?.show(); } catch (e) {} cb(); };

  const handleNewGame = () => go(() => navigation.navigate('Menu'));

  // REJOUER : noms conservés, catégorie conservée, nouveaux assignments générés par PrepScreenWrapper
  const handleReplay = () => go(() =>
    navigation.navigate('Prep', {
      numPlayers,
      gameMode:     gameMode ?? 0,
      playerNames:  safeNames,          // ← noms conservés
      selectedCategory: route.params.selectedCategory, // ← catégorie conservée
      customWords: route.params.customWords || [], // ← mots personnalisés conservés
      mimerMode: route.params.mimerMode ?? false, // ← mode MIMER conservé
      spyfallTimer: route.params.spyfallTimer ?? null, // ← timer Spyfall conservé
      currentPlayer: 0,
      takenNumbers:  [],
      playerNumbers: new Array(numPlayers).fill(null),
      // PAS d'assignments → PrepScreenWrapper en génère de nouveaux
    })
  );

  const getRoleBadge = (role) => {
    if (role === 'intrus') return { label: t('roleIntrus'),   color: colors.danger, bg: 'rgba(255,68,68,0.12)' };
    if (role === 'mister') return { label: t('roleMister'),   color: colors.accent, bg: 'rgba(232,255,71,0.1)' };
    if (role === 'spy')    return { label: t('roleSpy'),       color: '#ff4444',    bg: 'rgba(255,68,68,0.15)' };
    return                        { label: t('roleInnocent'), color: '#000000',   bg: 'rgba(255,255,255,0.06)' };
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
          let wordDisplay = a.role === 'mister' ? 'MISTER WHITE' : a.role === 'spy' ? t('roleSpy') : (typeof a.word === 'string' ? a.word : '');
          // Enlever .jpg et .png pour l'affichage en mode MIMER
          if (wordDisplay && (wordDisplay.endsWith('.jpg') || wordDisplay.endsWith('.png'))) {
            wordDisplay = wordDisplay.replace('.jpg', '').replace('.png', '');
          }
          // Image lieu pour Spyfall
          const lieuImg = wordDisplay && LIEUX_IMAGES[wordDisplay] ? LIEUX_IMAGES[wordDisplay] : null;

          const handleReveal = () => {
            if (!isRev) {
              // Première révélation de cette carte
              if (a.role === 'intrus' || a.role === 'spy') {
                playIntruderReveal();
                vibrateIntruderFound();
              } else if (a.role === 'mister') {
                playMisterWhite();
                vibrate([50, 30, 50]);
              } else {
                playInnocentReveal();
              }
            }
            setRevealed(prev => ({ ...prev, [i]: !prev[i] }));
          };

          return (
            <Pressable
              key={i}
              onPress={() => { playClick(); handleReveal(); }}
              style={[
                styles.card,
                isRev && a.role === 'intrus' && styles.cardIntrus,
                isRev && a.role === 'mister' && styles.cardMister,
                isRev && a.role === 'spy' && styles.cardSpy,
                isRev && a.role === 'normal' && styles.cardNormal,
              ]}
            >
              <View style={styles.cardLeft}>
                <Text style={styles.cardPlayer}>{name}</Text>
                {isRev && lieuImg ? (
                  <View style={styles.cardLieuRow}>
                    <Image source={lieuImg} style={styles.cardLieuImage} resizeMode="contain" />
                    <Text style={[
                      styles.cardWord,
                      a.role === 'intrus' && { color: colors.danger },
                      a.role === 'mister' && { color: colors.accent },
                      a.role === 'spy' && { color: '#ff4444' },
                      a.role === 'normal' && { color: '#000000' },
                    ]}>
                      {wordDisplay}
                    </Text>
                  </View>
                ) : (
                  <Text style={[
                    styles.cardWord,
                    isRev && a.role === 'intrus' && { color: colors.danger },
                    isRev && a.role === 'mister' && { color: colors.accent },
                    isRev && a.role === 'spy' && { color: '#ff4444' },
                    isRev && a.role === 'normal' && { color: '#000000' },
                  ]}>
                    {isRev ? wordDisplay : '● ● ● ● ●'}
                  </Text>
                )}
              </View>

              <View style={styles.cardRight}>
                {!isRev ? (
                  <Text style={styles.cardTap}>👆 {t('tapToReveal')}</Text>
                ) : (
                  <View style={styles.badgesCol}>
                    {i === starterIdx && (
                      <View style={[styles.badge, { borderColor: '#666' }]}>
                        <Text style={[styles.badgeText, { color: '#000000' }]}>{t('roleStarts')}</Text>
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
  // Spyfall outcomes
  const spyfallTitle = (() => {
    if (!isSpyfall || !spyfallOutcome) return null;
    switch (spyfallOutcome) {
      case 'spyWinsTimer': return t('timerExpired') + '\n' + t('spyWins');
      case 'spyWinsTie': return t('spyWins');
      case 'spyWinsWrongAccusation': return t('wrongAccusation') + '\n' + t('spyWins');
      case 'spyGuessRight': return t('spyGuessRight') + '\n' + t('spyWins');
      case 'spyGuessWrong': return t('spyGuessWrong') + '\n' + t('innocentsWin');
      default: return null;
    }
  })();

  if (isSpyfall && spyfallOutcome) {
    const spyWins = spyfallOutcome === 'spyWinsTimer' || spyfallOutcome === 'spyWinsTie' || spyfallOutcome === 'spyWinsWrongAccusation' || spyfallOutcome === 'spyGuessRight';
    return (
      <View style={styles.container}>
        <Text style={[styles.commenceLabel, { color: spyWins ? '#ff4444' : '#000000' }]}>
          {spyWins ? '🕵️' : '🎉'}
        </Text>
        <Animated.Text style={[styles.winnerName, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
          {spyfallTitle}
        </Animated.Text>
        <TouchableOpacity style={styles.revealBtn} onPress={() => setShowRecap(true)}>
          <Text style={styles.revealBtnText}>{t('revealPlayers')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
  container:     { flex: 1, backgroundColor: '#F5F5DC', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, gap: 16 },
  commenceLabel: { fontFamily: 'SpaceMono', fontSize: 10, color: '#666', letterSpacing: 3 },
  winnerName:    { fontFamily: 'BebasNeue', fontSize: 88, color: '#1a1a1a', textAlign: 'center', lineHeight: 84, letterSpacing: 2 },
  revealBtn:     { width: '100%', backgroundColor: '#1a1a1a', paddingVertical: 18, alignItems: 'center', marginTop: 8, borderRadius: 12 },
  revealBtnText: { fontFamily: 'BebasNeue', fontSize: 22, color: '#F5F5DC', letterSpacing: 2 },
  recapContainer:{ backgroundColor: '#F5F5DC', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40, gap: 8 },
  recapTitle:    { fontFamily: 'BebasNeue', fontSize: 48, color: '#1a1a1a', letterSpacing: 2, textAlign: 'center' },
  recapSub:      { fontFamily: 'SpaceMono', fontSize: 9, color: '#666', letterSpacing: 3, textAlign: 'center', marginBottom: 10 },
  card:          { borderWidth: 1, borderColor: 'rgba(0,0,0,0.15)', padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.05)' },
  cardIntrus:    { borderColor: 'rgba(255,68,68,0.4)',   backgroundColor: 'rgba(255,68,68,0.1)' },
  cardSpy:       { borderColor: 'rgba(255,68,68,0.5)',   backgroundColor: 'rgba(255,68,68,0.12)' },
  cardMister:    { borderColor: 'rgba(0,0,0,0.3)',  backgroundColor: 'rgba(0,0,0,0.08)' },
  cardNormal:    { borderColor: 'rgba(0,0,0,0.15)' },
  cardLeft:      { flex: 1, gap: 4 },
  cardPlayer:    { fontFamily: 'SpaceMono', fontSize: 9, color: '#000000', letterSpacing: 2 },
  cardLieuRow:   { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardLieuImage: { width: 36, height: 36, borderRadius: 4 },
  cardWord:      { fontFamily: 'BebasNeue', fontSize: 28, color: '#000000', letterSpacing: 1 },
  cardRight:     { alignItems: 'flex-end', gap: 4 },
  cardTap:       { fontFamily: 'SpaceMono', fontSize: 9, color: '#666', letterSpacing: 1 },
  badgesCol:     { alignItems: 'flex-end', gap: 4 },
  badge:         { borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText:     { fontFamily: 'SpaceMono', fontSize: 8, letterSpacing: 1 },
  recapBtns:     { gap: 10, marginTop: 20 },
  replayBtn:     { backgroundColor: '#1a1a1a', paddingVertical: 16, alignItems: 'center', borderRadius: 12 },
  replayBtnText: { fontFamily: 'BebasNeue', fontSize: 22, color: '#F5F5DC', letterSpacing: 2 },
  newBtn:        { borderWidth: 1, borderColor: '#1a1a1a', paddingVertical: 16, alignItems: 'center', borderRadius: 12 },
  newBtnText:    { fontFamily: 'BebasNeue', fontSize: 22, color: '#1a1a1a', letterSpacing: 2 },
});
