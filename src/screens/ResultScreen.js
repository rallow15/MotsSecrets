import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, ScrollView, Pressable, Image, NativeModules } from 'react-native';
import { colors, screenThemes, useDarkTheme } from '../theme';
import { t } from '../i18n';
import { playClick, playWin, playLose, playIntruderReveal, playInnocentReveal, playMisterWhite, vibrate, vibrateIntruderFound } from '../sound';
import { triggerHaptic } from '../animations';

// Images LIEUX - pour l'affichage Spyfall
const LIEUX_IMAGES = {
  'Plage': require('../../assets/lieux/01_Plage.png'),
  'Restaurant': require('../../assets/lieux/02_Restaurant.png'),
  'Cinéma': require('../../assets/lieux/03_Cinema.jpeg'),
  'Hôpital': require('../../assets/lieux/04_Hopital.jpeg'),
  'Avion': require('../../assets/lieux/05_Avion.jpeg'),
  'École': require('../../assets/lieux/06_Ecole.jpeg'),
  'Gare': require('../../assets/lieux/07_Gare.jpeg'),
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
  'Cinema': require('../../assets/lieux/03_Cinema.jpeg'),
  'Hospital': require('../../assets/lieux/04_Hopital.jpeg'),
  'Airplane': require('../../assets/lieux/05_Avion.jpeg'),
  'School': require('../../assets/lieux/06_Ecole.jpeg'),
  'Train Station': require('../../assets/lieux/07_Gare.jpeg'),
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

// Images TRAVAIL - require statiques pour Metro
const TRAVAIL_IMAGES = {
  'Acteur': require('../../assets/travaille/ACTEUR.jpeg'),
  'Avocat': require('../../assets/travaille/avocat.jpeg'),
  'Entraîneur de football': require('../../assets/travaille/entraineur football.jpeg'),
  'Gendarme': require('../../assets/travaille/gendarme.png'),
  'Infirmier': require('../../assets/travaille/infirmiere.png'),
  'Journaliste': require('../../assets/travaille/journaliste.jpeg'),
  'Juge': require('../../assets/travaille/JUGE.jpeg'),
  'Livreur': require('../../assets/travaille/livreur.png'),
  'Médecin': require('../../assets/travaille/medecin.png'),
  'Militaire': require('../../assets/travaille/militaire.png'),
  'Policier': require('../../assets/travaille/policier.png'),
  'Pompier': require('../../assets/travaille/pompier.jpeg'),
  'Professeur': require('../../assets/travaille/professeur.jpeg'),
  // EN
  'Actor': require('../../assets/travaille/ACTEUR.jpeg'),
  'Lawyer': require('../../assets/travaille/avocat.jpeg'),
  'Football Coach': require('../../assets/travaille/entraineur football.jpeg'),
  'Gendarme': require('../../assets/travaille/gendarme.png'),
  'Nurse': require('../../assets/travaille/infirmiere.png'),
  'Journalist': require('../../assets/travaille/journaliste.jpeg'),
  'Judge': require('../../assets/travaille/JUGE.jpeg'),
  'Delivery Driver': require('../../assets/travaille/livreur.png'),
  'Doctor': require('../../assets/travaille/medecin.png'),
  'Soldier': require('../../assets/travaille/militaire.png'),
  'Police Officer': require('../../assets/travaille/policier.png'),
  'Firefighter': require('../../assets/travaille/pompier.jpeg'),
  'Teacher': require('../../assets/travaille/professeur.jpeg'),
};

// Images SPORT - require statiques pour Metro
const SPORT_IMAGES = {
  'Baseball': require('../../assets/sport/baseball.png'),
  'Basketball': require('../../assets/sport/basketball.png'),
  'Boxe': require('../../assets/sport/boxe.png'),
  'Catch': require('../../assets/sport/catch.png'),
  'Football américain': require('../../assets/sport/football americain.jpeg'),
  'Football': require('../../assets/sport/football.png'),
  'Futsal': require('../../assets/sport/futsal.jpeg'),
  'Handball': require('../../assets/sport/handball.png'),
  'Karaté': require('../../assets/sport/karate.png'),
  'MMA': require('../../assets/sport/mma.png'),
  'Natation': require('../../assets/sport/natation.png'),
  'Rugby': require('../../assets/sport/rugby.jpeg'),
  'Tennis': require('../../assets/sport/tennis.png'),
  'Volleyball': require('../../assets/sport/volleyball.png'),
  'Water-polo': require('../../assets/sport/water polo.png'),
  // EN
  'Wrestling': require('../../assets/sport/catch.png'),
  'American Football': require('../../assets/sport/football americain.jpeg'),
  'Swimming': require('../../assets/sport/natation.png'),
  'Karate': require('../../assets/sport/karate.png'),
  'Water Polo': require('../../assets/sport/water polo.png'),
};

import Constants from 'expo-constants';

// Détecter si on est dans Expo Go ou sur le web
const isExpoGo = Constants.appOwnership === 'expo';
const isWebResult = typeof window !== 'undefined' && typeof document !== 'undefined';

// InterstitialAd - chargé dynamiquement uniquement si pas Expo Go ni web
let InterstitialAd = null;
// TODO: remplace par ton vrai ad unit ID interstitiel dans AdMob
const INTERSTITIAL_AD_UNIT_PROD = null;
const AD_UNIT = __DEV__
  ? 'ca-app-pub-3940256099942544/1033173712'
  : INTERSTITIAL_AD_UNIT_PROD;

function loadInterstitialAd() {
  if (isWebResult || isExpoGo || !NativeModules.RNGoogleMobileAdsModule) return false;
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
  const spyfallUndercover = route.params.spyfallUndercover ?? false;
  const isSpyfall = gameMode === 3;
  const darkTheme = useDarkTheme();
  const theme = darkTheme ? screenThemes.dark : screenThemes.light;

  // Joueur aléatoire qui commence
  const [starterIdx] = useState(() => Math.floor(Math.random() * numPlayers));
  const [revealed,   setRevealed]  = useState({});
  const [showRecap,  setShowRecap] = useState(isSpyfall && !spyfallOutcome);

  const scaleAnim   = useRef(new Animated.Value(0.2)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const cardPulseAnim = useRef(new Animated.Value(1)).current;
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
      selectedCategories: route.params.selectedCategories, // ← multi-sélection conservée
      customWords: route.params.customWords || [], // ← mots personnalisés conservés
      mimerMode: route.params.mimerMode ?? false, // ← mode MIMER conservé
      spyfallUndercover: route.params.spyfallUndercover ?? false,
      numUndercovers: route.params.numUndercovers ?? 1,
      numMisterWhites: route.params.numMisterWhites ?? 0,
      easyMode: route.params.easyMode ?? false,
      currentPlayer: 0,
      takenNumbers:  [],
      playerNumbers: new Array(numPlayers).fill(null),
      assignments: null, // forcer la régénération via PrepScreenWrapper
    })
  );

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
          let wordDisplay = a.role === 'mister' ? 'MISTER WHITE' : a.role === 'spy' ? t('roleSpy') : (typeof a.word === 'string' ? a.word : '');
          // Enlever .jpg et .png pour l'affichage en mode MIMER
          if (wordDisplay && (wordDisplay.endsWith('.jpg') || wordDisplay.endsWith('.png'))) {
            wordDisplay = wordDisplay.replace('.jpg', '').replace('.png', '');
          }
          // Image lieu pour Spyfall
          const lieuImg = wordDisplay && (LIEUX_IMAGES[wordDisplay] || TRAVAIL_IMAGES[wordDisplay] || SPORT_IMAGES[wordDisplay]) ? (LIEUX_IMAGES[wordDisplay] || TRAVAIL_IMAGES[wordDisplay] || SPORT_IMAGES[wordDisplay]) : null;

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
              cardPulseAnim.setValue(0.92);
              Animated.spring(cardPulseAnim, {
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
              style={{ transform: [{ scale: isRev ? cardPulseAnim : 1 }] }}
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
          <TouchableOpacity style={[styles.replayBtn, { backgroundColor: theme.okBtnBg }]} onPress={handleReplay}>
            <Text style={[styles.replayBtnText, { color: theme.okBtnText }]}>{t('replay')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.newBtn, { borderColor: theme.text }]} onPress={handleNewGame}>
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
      case 'spyWinsTimer': return t('timerExpired') + '\n' + winsLabel;
      case 'spyWinsTie': return winsLabel;
      case 'spyWinsWrongAccusation': return t('wrongAccusation') + '\n' + winsLabel;
      case 'spyGuessRight': return (spyfallUndercover ? t('undercoverGuessRight') : t('spyGuessRight')) + '\n' + winsLabel;
      case 'spyGuessWrong': return (spyfallUndercover ? t('undercoverGuessWrong') : t('spyGuessWrong')) + '\n' + t('innocentsWin');
      default: return null;
    }
  })();

  if (isSpyfall && spyfallOutcome) {
    const spyWins = spyfallOutcome === 'spyWinsTimer' || spyfallOutcome === 'spyWinsTie' || spyfallOutcome === 'spyWinsWrongAccusation' || spyfallOutcome === 'spyGuessRight';
    return (
      <View style={[styles.container, { backgroundColor: theme.bg }]}>
        <Image
          source={darkTheme ? require('../../assets/bg-sombre.jpg') : require('../../assets/bg-white.jpg')}
          style={styles.bgImage}
          resizeMode="cover"
        />
        <View style={darkTheme ? styles.bgGradientDark : styles.bgGradientLight} />
        <Text style={[styles.commenceLabel, { color: spyWins ? theme.danger : theme.text }]}>
          {spyWins ? (spyfallUndercover ? '🥸' : '🕵️') : '🎉'}
        </Text>
        <Animated.Text style={[styles.winnerName, { transform: [{ scale: scaleAnim }], opacity: opacityAnim, color: theme.text }]}>
          {spyfallTitle}
        </Animated.Text>
        <TouchableOpacity style={[styles.revealBtn, { backgroundColor: theme.okBtnBg }]} onPress={() => setShowRecap(true)}>
          <Text style={[styles.revealBtnText, { color: theme.okBtnText }]}>{t('revealPlayers')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <Image
        source={darkTheme ? require('../../assets/bg-sombre.jpg') : require('../../assets/bg-white.jpg')}
        style={styles.bgImage}
        resizeMode="cover"
      />
      <View style={darkTheme ? styles.bgGradientDark : styles.bgGradientLight} />
      <Text style={[styles.commenceLabel, { color: theme.textMuted }]}>{t('startsFirst')}</Text>
      <Animated.Text style={[styles.winnerName, { transform: [{ scale: scaleAnim }], opacity: opacityAnim, color: theme.text }]}>
        {starterName}
      </Animated.Text>
      <TouchableOpacity style={[styles.revealBtn, { backgroundColor: theme.okBtnBg }]} onPress={() => setShowRecap(true)}>
        <Text style={[styles.revealBtnText, { color: theme.okBtnText }]}>{t('revealPlayers')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, gap: 16 },
  bgImage:       { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  bgGradientDark: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.15)' },
  bgGradientLight: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(180,150,80,0.10)' },
  commenceLabel: { fontFamily: 'SpaceMono', fontSize: 10, letterSpacing: 3 },
  winnerName:    { fontFamily: 'BebasNeue', fontSize: 88, textAlign: 'center', lineHeight: 84, letterSpacing: 2 },
  revealBtn:     { width: '100%', paddingVertical: 18, alignItems: 'center', marginTop: 8, borderRadius: 12 },
  revealBtnText: { fontFamily: 'BebasNeue', fontSize: 22, letterSpacing: 2 },
  recapContainer:{ paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40, gap: 8 },
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
  cardMangaLabel: { fontFamily: 'BebasNeue', fontSize: 20, letterSpacing: 1, marginTop: 2, color: '#FFFFFF' },
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
