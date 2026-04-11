import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, StatusBar,
  ScrollView, Modal, Animated, Easing, ImageBackground, Image, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { themes, colors } from '../theme';
import { t, getLang, setLang } from '../i18n';
import { CATEGORIES_FR, CATEGORIES_EN } from '../data/words';
import { generateAssignments } from '../gameLogic';
import { initSounds, playClick, playStart, startBackgroundMusic, stopBackgroundMusic, setMusicEnabled, setSfxEnabled, musicEnabled, sfxEnabled, loadAndShowRewardedAd } from '../sound';
import * as SecureStore from 'expo-secure-store';

const CATEGORY_EMOJIS = {
  FOOTBALL: '⚽',
  BASKETBALL: '🏀',
  ACTEURS: '🎭',
  ACTRICES: '🎭',
  ACTORS: '🎭',
  ACTRESSES: '🎭',
  PAYS: '🗺️',
  COUNTRIES: '🗺️',
  ANIMAUX: '🦁',
  ANIMALS: '🦁',
  JEUX_VIDEO: '🎮',
  VIDEO_GAMES: '🎮',
  MUSIQUE: '🎵',
  MUSIC: '🎵',
  VOITURES: '🚗',
  CARS: '🚗',
  MARQUES: '👜',
  BRANDS: '👜',
  FILMS_SERIES: '🎬',
  MOVIES_SERIES: '🎬',
  MANGA: '🍥',
  OBJETS: '📦',
  OBJECTS: '📦',
};

const CATEGORY_NAMES = {
  fr: {
    FOOTBALL: 'FOOTBALL',
    BASKETBALL: 'BASKETBALL',
    ACTEURS: 'ACTEURS',
    ACTRICES: 'ACTRICES',
    PAYS: 'PAYS',
    ANIMAUX: 'ANIMAUX',
    JEUX_VIDEO: 'JEUX VIDÉO',
    MUSIQUE: 'MUSIQUE',
    VOITURES: 'VOITURES',
    MARQUES: 'MARQUES',
    FILMS_SERIES: 'FILMS / SÉRIES',
    MANGA: 'MANGA',
    OBJETS: 'OBJETS',
  },
  en: {
    FOOTBALL: 'FOOTBALL',
    BASKETBALL: 'BASKETBALL',
    ACTORS: 'ACTORS',
    ACTRESSES: 'ACTRESSES',
    COUNTRIES: 'COUNTRIES',
    ANIMALS: 'ANIMALS',
    VIDEO_GAMES: 'VIDEO GAMES',
    MUSIC: 'MUSIC',
    CARS: 'CARS',
    BRANDS: 'BRANDS',
    MOVIES_SERIES: 'MOVIES / SERIES',
    MANGA: 'MANGA',
    OBJECTS: 'OBJECTS',
  },
};

const RULES = {
  fr: [
    {
      mode: 'NORMAL',
      desc: '1 intrus parmi tous les joueurs.',
      steps: [
        'Chaque joueur voit un mot secret. Un seul joueur voit un mot différent : c\'est l\'intrus.',
        'Tout le monde discute sans révéler son mot.',
        'À la fin, les joueurs votent pour désigner l\'intrus.',
        'Si l\'intrus est trouvé, les autres gagnent. Sinon, l\'intrus gagne.',
      ],
    },
    {
      mode: 'MISTER WHITE',
      desc: '1 joueur n\'a aucun mot.',
      steps: [
        'Un joueur (Mister White) ne voit rien. Les autres voient le même mot.',
        'Mister White doit bluffer pour ne pas être découvert.',
        'Si Mister White est voté, il peut tenter de deviner le mot secret.',
        'S\'il devine, il gagne quand même !',
      ],
    },
    {
      mode: 'MISTER WHITE + INTRUS',
      desc: '1 sans mot + 1 intrus + les autres.',
      steps: [
        'Mister White n\'a pas de mot. L\'intrus a un mot différent. Les autres ont le même mot.',
        'Trois camps : les innocents, l\'intrus, Mister White.',
        'Les innocents doivent trouver les deux imposteurs.',
        'L\'intrus et Mister White peuvent s\'allier ou se trahir.',
      ],
    },
  ],
  en: [
    {
      mode: 'NORMAL',
      desc: '1 impostor among all players.',
      steps: [
        'Each player sees a secret word. One player sees a different word: the impostor.',
        'Everyone discusses without revealing their word.',
        'Players vote to identify the impostor.',
        'If the impostor is found, the others win. Otherwise the impostor wins.',
      ],
    },
    {
      mode: 'MISTER WHITE',
      desc: '1 player has no word.',
      steps: [
        'One player (Mister White) sees nothing. The others see the same word.',
        'Mister White must bluff to avoid being caught.',
        'If Mister White is voted out, they can try to guess the secret word.',
        'If they guess correctly, they still win!',
      ],
    },
    {
      mode: 'MISTER WHITE + IMPOSTOR',
      desc: '1 no word + 1 impostor + others.',
      steps: [
        'Mister White has no word. The impostor has a different word. Others share the same word.',
        'Three sides: innocents, impostor, Mister White.',
        'Innocents must find both impostors.',
        'The impostor and Mister White can ally or betray each other.',
      ],
    },
  ],
};

// Icônes (utilisent les PNG personnalisés)
// Les icônes SVG sont gardées en fallback si les PNG ne sont pas disponibles



export default function MenuScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [showLoading, setShowLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [numPlayers, setNumPlayers] = useState(3);
  const [lang, setLangState] = useState(getLang());
  const [showRules, setShowRules] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showGameSetup, setShowGameSetup] = useState(false);
  const [intrus, setIntrus] = useState(true);
  const [misterWhite, setMisterWhite] = useState(false);
  // États des sons (synchronisés avec sound.js)
  const [musicOn, setMusicOn] = useState(musicEnabled);
  const [sfxOn, setSfxOn] = useState(sfxEnabled);
  // Catégorie OBJETS débloquée ou non
  const [objectsUnlocked, setObjectsUnlocked] = useState(false);

  // Charger l'état de déblocage OBJETS au démarrage
  useEffect(() => {
    const loadObjectsState = async () => {
      try {
        const unlocked = await SecureStore.getItemAsync('objects_category_unlocked');
        if (unlocked === 'true') {
          setObjectsUnlocked(true);
        }
      } catch (e) {}
    };
    loadObjectsState();
  }, []);

  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    initSounds();
    // Simulation chargement 2 secondes
    const startTime = Date.now();
    const duration = 2000;
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setLoadingProgress(progress);
      if (progress >= 1) {
        clearInterval(interval);
        setShowLoading(false);
      }
    }, 16);

    // Animation pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 800, easing: Easing.ease, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, easing: Easing.ease, useNativeDriver: true }),
      ])
    ).start();

    return () => clearInterval(interval);
  }, []);

  // Démarrer la musique d'ambiance après le chargement
  useEffect(() => {
    if (!showLoading && musicOn) {
      startBackgroundMusic();
    }
  }, [showLoading]);

  // Gérer les changements de musique
  useEffect(() => {
    if (musicOn && !showLoading) {
      startBackgroundMusic();
    } else {
      stopBackgroundMusic();
    }
  }, [musicOn]);

  const toggleLang = () => {
    const next = lang === 'fr' ? 'en' : 'fr';
    setLang(next);
    setLangState(next);
  };

  const toggleMusic = () => {
    const newVal = !musicOn;
    setMusicOn(newVal);
    setMusicEnabled(newVal);
    if (newVal) startBackgroundMusic();
    else stopBackgroundMusic();
  };

  const toggleSfx = () => {
    const newVal = !sfxOn;
    setSfxOn(newVal);
    setSfxEnabled(newVal);
  };


  const handleStart = () => {
    playClick();
    setShowGameSetup(true);
  };

  const handleLaunchGame = () => {
    playClick();
    let gameMode = 0; // NORMAL
    if (misterWhite && intrus) gameMode = 2; // MISTER WHITE + INTRUS
    else if (intrus) gameMode = 0; // NORMAL avec intrus (défaut)
    else if (misterWhite) gameMode = 1; // MISTER WHITE

    if (gameMode === 2 && numPlayers < 4) { return; }

    setShowGameSetup(false);
    const assignments = generateAssignments(numPlayers, gameMode, selectedCategory);
    navigation.navigate('Prep', { numPlayers, gameMode, selectedCategory, assignments });
  };

  const handleCategorySelect = async (cat) => {
    playClick();

    // Si c'est la catégorie OBJETS/OBJECTS et qu'elle n'est pas débloquée
    const isObjectsCategory = cat === 'OBJETS' || cat === 'OBJECTS';
    if (isObjectsCategory && !objectsUnlocked) {
      // Afficher la pub récompensée
      const rewarded = await loadAndShowRewardedAd(() => {
        // Callback quand la récompense est gagnée
        setObjectsUnlocked(true);
        SecureStore.setItemAsync('objects_category_unlocked', 'true');
        setSelectedCategory(cat);
        setShowCategories(false);
      });

      if (!rewarded) {
        // Pub non disponible (Expo Go), on sélectionne quand même
        console.log('Pub non disponible, catégorie accessible');
        setSelectedCategory(cat);
        setShowCategories(false);
      }
      return;
    }

    setSelectedCategory(cat);
    setShowCategories(false);
  };

  const rules = RULES[lang];
  const currentCategories = lang === 'en' ? CATEGORIES_EN : CATEGORIES_FR;
  const categoryKeys = Object.keys(currentCategories);

  if (showLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Image source={require('../../assets/icon.png')} style={styles.loadingLogo} />
        <Text style={styles.loadingTitle}>MOTS SECRETS</Text>
        <View style={styles.loadingBarContainer}>
          <View style={[styles.loadingBar, { width: `${loadingProgress * 100}%` }]} />
        </View>
        <Text style={styles.loadingText}>{Math.round(loadingProgress * 100)}%</Text>
      </View>
    );
  }

  return (
    <>
      <View style={styles.fullContainer}>
        <ImageBackground source={require('../../assets/bg-menu.png')} style={styles.bg} resizeMode="cover">
          <View style={styles.overlay}>
            <View style={{ flex: 1 }}>
              <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 45 }]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.topRow}>
                  <TouchableOpacity style={styles.iconBtn} onPress={() => setShowRules(true)}>
                    <Image source={require('../../assets/regles.png')} style={styles.iconBtnImage} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconBtn} onPress={toggleLang}>
                    <Text style={styles.iconBtnText}>{lang === 'fr' ? '🇫🇷' : '🇬🇧'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconBtn} onPress={() => setShowSettings(true)}>
                    <Image source={require('../../assets/reglage.png')} style={styles.iconBtnImage} />
                  </TouchableOpacity>
                </View>
              </ScrollView>

              <Animated.View style={[styles.playContainer, { transform: [{ scale: pulseAnim }] }]}>
                <TouchableOpacity onPress={handleStart} activeOpacity={0.8}>
                  <Image source={require('../../assets/video.png')} style={styles.playIcon} />
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>
        </ImageBackground>
      </View>

      <Modal visible={showRules} animationType="slide" transparent onRequestClose={() => setShowRules(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '85%' }]}>
            <Text style={styles.modalTitle}>{lang === 'fr' ? 'RÈGLES' : 'RULES'}</Text>
            <ScrollView>
              {rules.map((r, i) => (
                <View key={i} style={styles.ruleBlock}>
                  <Text style={styles.ruleMode}>{r.mode}</Text>
                  <Text style={styles.ruleDesc}>{r.desc}</Text>
                  {r.steps.map((s, j) => (
                    <View key={j} style={styles.ruleStep}><Text style={styles.ruleStepText}>{j + 1}. {s}</Text></View>
                  ))}
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowRules(false)}>
              <Text style={styles.closeBtnText}>{lang === 'fr' ? 'FERMER' : 'CLOSE'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showSettings} animationType="slide" transparent onRequestClose={() => setShowSettings(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{lang === 'fr' ? 'PARAMÈTRES' : 'SETTINGS'}</Text>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>{lang === 'fr' ? 'Langue' : 'Language'}</Text>
              <TouchableOpacity style={styles.settingPill} onPress={toggleLang}>
                <Text style={styles.settingPillText}>{lang === 'fr' ? '🇫🇷' : '🇬🇧'}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>{lang === 'fr' ? 'Musique' : 'Music'}</Text>
              <TouchableOpacity
                style={[styles.toggleBtn, musicOn && styles.toggleBtnActive]}
                onPress={toggleMusic}
              >
                <Text style={styles.toggleBtnText}>{musicOn ? 'ON' : 'OFF'}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>{lang === 'fr' ? 'Effets' : 'SFX'}</Text>
              <TouchableOpacity
                style={[styles.toggleBtn, sfxOn && styles.toggleBtnActive]}
                onPress={toggleSfx}
              >
                <Text style={styles.toggleBtnText}>{sfxOn ? 'ON' : 'OFF'}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowSettings(false)}>
              <Text style={styles.closeBtnText}>{lang === 'fr' ? 'FERMER' : 'CLOSE'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showGameSetup} animationType="slide" transparent onRequestClose={() => setShowGameSetup(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{lang === 'fr' ? 'CONFIGURATION' : 'CONFIGURATION'}</Text>

            <View style={styles.setupSection}>
              <Text style={styles.setupLabel}>{lang === 'fr' ? 'Nombre de joueurs' : 'Number of players'}</Text>
              <View style={styles.counterRowLarge}>
                <TouchableOpacity style={styles.counterBtnLarge} onPress={() => setNumPlayers(p => Math.max(3, p - 1))}><Text style={styles.counterBtnTextLarge}>−</Text></TouchableOpacity>
                <Text style={styles.counterValLarge}>{numPlayers}</Text>
                <TouchableOpacity style={styles.counterBtnLarge} onPress={() => setNumPlayers(p => Math.min(20, p + 1))}><Text style={styles.counterBtnTextLarge}>+</Text></TouchableOpacity>
              </View>
            </View>

            <View style={styles.setupSection}>
              <Text style={styles.setupLabel}>{lang === 'fr' ? 'Options' : 'Options'}</Text>

              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>🎭 {lang === 'fr' ? 'Intrus' : 'Impostor'}</Text>
                <TouchableOpacity
                  style={[styles.toggleBtn, intrus && styles.toggleBtnActive]}
                  onPress={() => setIntrus(!intrus)}
                >
                  <Text style={styles.toggleBtnText}>{intrus ? 'ON' : 'OFF'}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>🤵 Mister White</Text>
                <TouchableOpacity
                  style={[styles.toggleBtn, misterWhite && styles.toggleBtnActive]}
                  onPress={() => setMisterWhite(!misterWhite)}
                >
                  <Text style={styles.toggleBtnText}>{misterWhite ? 'ON' : 'OFF'}</Text>
                </TouchableOpacity>
              </View>

              {misterWhite && intrus && numPlayers < 4 && (
                <Text style={styles.warningText}>⚠️ {lang === 'fr' ? '4 joueurs minimum' : '4 players minimum'}</Text>
              )}
            </View>

            <View style={styles.setupSection}>
              <Text style={styles.setupLabel}>{lang === 'fr' ? 'Catégorie' : 'Category'}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScrollHorizontal}>
                <TouchableOpacity
                  style={[styles.categoryChip, selectedCategory === null && styles.categoryChipActive]}
                  onPress={() => setSelectedCategory(null)}
                >
                  <Text style={[styles.categoryChipText, selectedCategory === null && styles.categoryChipTextActive]}>
                    🎲 {lang === 'fr' ? 'Aléatoire' : 'Random'}
                  </Text>
                </TouchableOpacity>
                {categoryKeys.map(cat => {
                  const isObjectsLocked = cat === 'OBJECTS' && !objectsUnlocked;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryChip,
                        selectedCategory === cat && styles.categoryChipActive,
                        isObjectsLocked && styles.categoryChipLocked
                      ]}
                      onPress={() => handleCategorySelect(cat)}
                      disabled={isObjectsLocked}
                    >
                      <Text style={[
                        styles.categoryChipText,
                        selectedCategory === cat && styles.categoryChipTextActive,
                        isObjectsLocked && styles.categoryChipTextLocked
                      ]}>
                        {isObjectsLocked ? '🔒' : (CATEGORY_EMOJIS[cat] || '🎯')} {CATEGORY_NAMES[lang][cat] || cat.replace('_', ' ')}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <TouchableOpacity
              style={[styles.launchBtn, misterWhite && intrus && numPlayers < 4 && styles.launchBtnDisabled]}
              onPress={handleLaunchGame}
              disabled={misterWhite && intrus && numPlayers < 4}
            >
              <Text style={styles.launchBtnText}>{lang === 'fr' ? 'LANCER LA PARTIE' : 'START GAME'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowGameSetup(false)}>
              <Text style={styles.closeBtnText}>{lang === 'fr' ? 'FERMER' : 'CLOSE'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </>
  );
}

const styles = StyleSheet.create({
  fullContainer: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5DC' },
  loadingLogo: { width: 100, height: 100, marginBottom: 20 },
  loadingTitle: { fontFamily: 'BebasNeue', fontSize: 32, color: '#1a1a1a', letterSpacing: 3, marginBottom: 30 },
  loadingBarContainer: { width: 200, height: 4, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 2, overflow: 'hidden' },
  loadingBar: { height: '100%', backgroundColor: '#1a1a1a' },
  loadingText: { fontFamily: 'SpaceMono', fontSize: 14, color: '#333', marginTop: 10 },
  bg: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.1)' },
  scrollContent: { alignItems: 'center', paddingHorizontal: 20, paddingBottom: 10 },
  playContainer: { alignItems: 'center', paddingBottom: 40 },
  playGlowContainer: { shadowColor: '#FFFFFF', shadowOffset: { width: 0, height: 0 }, elevation: 8 },
  topRow: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  iconBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.35)', alignItems: 'center', justifyContent: 'center' },
  iconBtnImage: { width: 28, height: 28 },
  iconBtnText: { fontSize: 22 },
  playIcon: { width: 120, height: 120 },
  modesSection: { width: '100%', marginTop: 15 },
  modesTitle: { fontFamily: 'SpaceMono', fontSize: 10, color: 'rgba(255,255,255,0.8)', letterSpacing: 2, marginBottom: 8, textAlign: 'center' },
  modeBtn: { backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', padding: 12, borderRadius: 12, marginBottom: 8 },
  modeBtnActive: { backgroundColor: 'rgba(255,255,255,0.3)', borderColor: '#fff' },
  modeBtnContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  modeTitle: { fontFamily: 'BebasNeue', fontSize: 16, color: 'rgba(255,255,255,0.7)', letterSpacing: 1 },
  modeTitleActive: { color: '#fff' },
  modeDot: { fontFamily: 'SpaceMono', fontSize: 12, color: 'rgba(255,255,255,0.3)' },
  modeDotActive: { color: '#fff' },
  modeDesc: { fontFamily: 'SpaceMono', fontSize: 9, color: 'rgba(255,255,255,0.6)' },
  modeBtnLarge: { padding: 16, marginBottom: 12 },
  modeTitleLarge: { fontFamily: 'BebasNeue', fontSize: 20, color: '#fff', letterSpacing: 1 },
  modeDescLarge: { fontFamily: 'SpaceMono', fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  warningText: { fontFamily: 'SpaceMono', fontSize: 10, color: '#ff6b6b', marginTop: 6, textAlign: 'center' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: '85%', backgroundColor: '#F5F5DC', borderRadius: 20, padding: 20, borderWidth: 2, borderColor: '#1a1a1a', maxHeight: '85%' },
  modalTitle: { fontFamily: 'BebasNeue', fontSize: 24, color: '#1a1a1a', letterSpacing: 2, textAlign: 'center', marginBottom: 15 },
  categoryScrollHorizontal: { flexDirection: 'row', gap: 8, paddingVertical: 8 },
  categoryChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.1)', borderWidth: 1, borderColor: 'rgba(0,0,0,0.2)' },
  categoryChipActive: { backgroundColor: '#1a1a1a', borderColor: '#1a1a1a' },
  categoryChipLocked: { backgroundColor: 'rgba(0,0,0,0.2)', opacity: 0.7 },
  categoryChipText: { fontFamily: 'BebasNeue', fontSize: 14, color: '#1a1a1a' },
  categoryChipTextActive: { color: '#F5F5DC' },
  categoryChipTextLocked: { color: '#666' },
  closeBtn: { backgroundColor: '#1a1a1a', paddingVertical: 10, alignItems: 'center', marginTop: 12, borderRadius: 10 },
  closeBtnText: { fontFamily: 'BebasNeue', fontSize: 16, color: '#F5F5DC', letterSpacing: 2 },
  ruleBlock: { marginBottom: 15, borderWidth: 1, borderColor: 'rgba(0,0,0,0.15)', padding: 12, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.05)' },
  ruleMode: { fontFamily: 'BebasNeue', fontSize: 16, color: '#1a1a1a', marginBottom: 4 },
  ruleDesc: { fontFamily: 'SpaceMono', fontSize: 9, color: '#333', marginBottom: 8 },
  ruleStep: { flexDirection: 'row', gap: 6, marginBottom: 4 },
  ruleStepText: { fontFamily: 'SpaceMono', fontSize: 9, color: '#333', flex: 1 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 },
  settingLabel: { fontFamily: 'SpaceMono', fontSize: 11, color: '#333' },
  settingPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.1)', borderWidth: 1, borderColor: '#1a1a1a' },
  settingPillText: { fontFamily: 'BebasNeue', fontSize: 14, color: '#1a1a1a' },
  counterRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  counterBtn: { width: 34, height: 34, backgroundColor: 'rgba(0,0,0,0.1)', borderWidth: 1, borderColor: '#1a1a1a', alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  counterBtnText: { fontSize: 18, fontFamily: 'SpaceMono', color: '#1a1a1a' },
  counterVal: { fontFamily: 'BebasNeue', fontSize: 28, minWidth: 28, textAlign: 'center', color: '#1a1a1a' },
  setupSection: { width: '100%', marginBottom: 20 },
  setupLabel: { fontFamily: 'SpaceMono', fontSize: 12, color: '#333', marginBottom: 10 },
  counterRowLarge: { flexDirection: 'row', alignItems: 'center', gap: 15, justifyContent: 'center' },
  counterBtnLarge: { width: 45, height: 45, backgroundColor: 'rgba(0,0,0,0.1)', borderWidth: 2, borderColor: '#1a1a1a', alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  counterBtnTextLarge: { fontSize: 24, fontFamily: 'SpaceMono', color: '#1a1a1a' },
  counterValLarge: { fontFamily: 'BebasNeue', fontSize: 36, minWidth: 50, textAlign: 'center', color: '#1a1a1a' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingVertical: 8 },
  toggleLabel: { fontFamily: 'BebasNeue', fontSize: 18, color: '#1a1a1a' },
  toggleBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.15)', borderWidth: 2, borderColor: 'rgba(0,0,0,0.3)' },
  toggleBtnActive: { backgroundColor: '#1a1a1a', borderColor: '#1a1a1a' },
  toggleBtnText: { fontFamily: 'SpaceMono', fontSize: 12, color: '#F5F5DC', fontWeight: 'bold' },
  launchBtn: { backgroundColor: '#1a1a1a', paddingVertical: 15, alignItems: 'center', borderRadius: 15, marginTop: 10, marginBottom: 10 },
  launchBtnDisabled: { backgroundColor: 'rgba(26,26,26,0.3)' },
  launchBtnText: { fontFamily: 'BebasNeue', fontSize: 20, color: '#F5F5DC', letterSpacing: 2 },
});
