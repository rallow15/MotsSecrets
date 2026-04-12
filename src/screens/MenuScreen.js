import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View, Text, TouchableOpacity, StyleSheet, StatusBar,
  ScrollView, Modal, Animated, Easing, ImageBackground, Image, Platform,
  TextInput, KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { themes, colors } from '../theme';
import { t, getLang, setLang } from '../i18n';
import { CATEGORIES_FR, CATEGORIES_EN } from '../data/words';
import { generateAssignments } from '../gameLogic';
import { initSounds, playClick, playStart, startBackgroundMusic, stopBackgroundMusic, setMusicEnabled, setSfxEnabled, musicEnabled, sfxEnabled } from '../sound';
import { loadAndShowRewardedAd } from '../ads';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

// Détecter si on est dans Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

// Image pour indiquer les pubs à récompense
const AD_REWARD_ICON = require('../../assets/ad-reward-icon.png');
const SURPRISE_BOX_ICON = require('../../assets/surprise-box.png');
const STAR_ICON = require('../../assets/star-icon.png');

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
  SPECIALE: '⭐',
  MIMER: '🎭',
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
    SPECIALE: 'SPÉCIALE',
    MIMER: 'MIMER',
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
    SPECIALE: 'SPECIAL',
    MIMER: 'MIMER',
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
    {
      mode: 'SPÉCIALE',
      desc: 'Chaque joueur ajoute 3 mots personnalisés avant de jouer.',
      steps: [
        'Avant la partie, chaque joueur ajoute 3 mots dans la catégorie SPÉCIALE via le bouton "GÉRER LES MOTS SPÉCIAUX".',
        'Pendant la partie, un mot est choisi aléatoirement parmi tous les mots personnalisés.',
        'Fonctionne comme le mode NORMAL : 1 intrus avec un mot différent, les autres ont le même mot.',
        'Si aucun mot personnalisé n\'a été ajouté, tous les joueurs n\'ont pas de mot (bluff pur).',
      ],
    },
    {
      mode: 'MIME',
      desc: 'Une image s\'affiche, il faut mimer l\'événement.',
      steps: [
        'Une image montrant un événement s\'affiche pour chaque joueur.',
        'Un joueur a une image différente : c\'est l\'intrus.',
        'Mister White n\'a pas d\'image, mais reçoit un indice texte sur l\'événement.',
        'Chacun donne des indices en mimant sans parler.',
        'Les innocents doivent trouver l\'intrus. Mister White peut gagner s\'il n\'est pas découvert.',
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
    {
      mode: 'SPECIAL',
      desc: 'Each player adds 3 custom words before playing.',
      steps: [
        'Before the game, each player adds 3 words to the SPECIAL category via the "MANAGE SPECIAL WORDS" button.',
        'During the game, a word is randomly chosen from all custom words.',
        'Works like NORMAL mode: 1 impostor with a different word, others share the same word.',
        'If no custom words were added, all players have no word (pure bluff).',
      ],
    },
    {
      mode: 'MIME',
      desc: 'An image appears, you must mime the event.',
      steps: [
        'An image showing an event appears for each player.',
        'One player has a different image: the impostor.',
        'Mister White has no image, but receives a text clue about the event.',
        'Everyone gives clues by miming without talking.',
        'Innocents must find the impostor. Mister White can win if not discovered.',
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
  const [showUnlockShop, setShowUnlockShop] = useState(false);
  const [showSpecialeMode, setShowSpecialeMode] = useState(false);
  const [specialeNumPlayers, setSpecialeNumPlayers] = useState(3);
  const [specialeIntrus, setSpecialeIntrus] = useState(true);
  const [specialeMisterWhite, setSpecialeMisterWhite] = useState(false);
  const [showGameSetup, setShowGameSetup] = useState(false);
  const [intrus, setIntrus] = useState(true);
  const [misterWhite, setMisterWhite] = useState(false);
  const [mimerMode, setMimerMode] = useState(false);
  // États des sons (synchronisés avec sound.js)
  const [musicOn, setMusicOn] = useState(musicEnabled);
  const [sfxOn, setSfxOn] = useState(sfxEnabled);
  // Catégorie OBJETS débloquée ou non
  const [objectsUnlocked, setObjectsUnlocked] = useState(false);
  // Mots personnalisés pour la catégorie SPÉCIALE
  const [customWords, setCustomWords] = useState([]);
  const [newWord, setNewWord] = useState('');

  // Charger l'état de déblocage OBJETS et les mots personnalisés au démarrage
  useEffect(() => {
    const loadStates = async () => {
      try {
        const unlocked = await SecureStore.getItemAsync('objects_category_unlocked');
        if (unlocked === 'true') {
          setObjectsUnlocked(true);
        }
        const savedWords = await SecureStore.getItemAsync('speciale_custom_words');
        if (savedWords) {
          setCustomWords(JSON.parse(savedWords));
        }
      } catch (e) {}
    };
    loadStates();
  }, []);

  const pulseAnim = new Animated.Value(1);

  // Initialisation des sons et chargement initial (une seule fois)
  useEffect(() => {
    initSounds();
    // Simulation chargement 2 secondes au premier montage uniquement
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

  // Réinitialiser l'état quand l'écran revient au premier plan
  useFocusEffect(
    useCallback(() => {
      console.log('MenuScreen focus - réinitialisation');

      // Fermer toutes les modales
      setShowGameSetup(false);
      setShowRules(false);
      setShowSettings(false);
      setShowUnlockShop(false);
      setShowSpecialeMode(false);
      setShowCategories(false);

      // Réinitialiser l'animation pulse
      pulseAnim.setValue(1);
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.1, duration: 800, easing: Easing.ease, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, easing: Easing.ease, useNativeDriver: true }),
        ])
      ).start();

      // Redémarrer la musique si elle est activée
      if (musicOn && !showLoading) {
        startBackgroundMusic();
      }
    }, [])
  );

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

  const handleLaunchGame = async () => {
    playClick();

    // Vérifier si la catégorie SPÉCIALE est sélectionnée sans mots
    const isSpecialeSelected = selectedCategory === 'SPECIALE';
    if (isSpecialeSelected && customWords.length === 0) {
      alert(lang === 'fr'
        ? 'La catégorie SPÉCIALE nécessite au moins 1 mot personnalisé.\n\nAjoutez des mots via le bouton "GÉRER LES MOTS SPÉCIAUX".'
        : 'SPECIAL category requires at least 1 custom word.\n\nAdd words via the "MANAGE SPECIAL WORDS" button.'
      );
      return;
    }

    let gameMode = 0; // NORMAL
    if (misterWhite && intrus) gameMode = 2; // MISTER WHITE + INTRUS
    else if (intrus) gameMode = 0; // NORMAL avec intrus (défaut)
    else if (misterWhite) gameMode = 1; // MISTER WHITE

    if (gameMode === 2 && numPlayers < 4) { return; }

    // En mode MIMER, la catégorie est automatiquement MIMER
    const finalCategory = mimerMode ? 'MIMER' : selectedCategory;

    setShowGameSetup(false);
    navigation.navigate('Prep', {
      numPlayers,
      gameMode,
      selectedCategory: finalCategory,
      customWords,
      mimerMode
    });
  };

  const handleCategorySelect = async (cat) => {
    playClick();

    // Vérifier si c'est SPÉCIALE et afficher pub si nécessaire
    const isSpeciale = cat === 'SPECIALE';
    const isObjects = cat === 'OBJECTS' || cat === 'OBJETS';

    if (isSpeciale && customWords.length === 0) {
      alert(lang === 'fr'
        ? 'La catégorie SPÉCIALE nécessite au moins 1 mot personnalisé.\n\nAjoutez des mots via le bouton "GÉRER LES MOTS SPÉCIAUX".'
        : 'SPECIAL category requires at least 1 custom word.\n\nAdd words via the "MANAGE SPECIAL WORDS" button.'
      );
      return;
    }

    // Pub pour SPÉCIALE (si mots existent)
    if (isSpeciale && customWords.length > 0 && !isExpoGo) {
      const rewarded = await loadAndShowRewardedAd(() => {});
      if (!rewarded) return;
    }

    // Pub pour OBJETS (si pas encore débloqué)
    if (isObjects && !objectsUnlocked && !isExpoGo) {
      const rewarded = await loadAndShowRewardedAd(() => {
        setObjectsUnlocked(true);
        SecureStore.setItemAsync('objects_category_unlocked', 'true');
      });
      if (!rewarded) return;
    }

    setSelectedCategory(cat);
    setShowCategories(false);
  };

  const handleAddWord = async () => {
    if (!newWord.trim()) return;
    const updatedWords = [...customWords, newWord.trim()];
    setCustomWords(updatedWords);
    await SecureStore.setItemAsync('speciale_custom_words', JSON.stringify(updatedWords));
    setNewWord('');
  };

  const handleRemoveWord = async (index) => {
    const updatedWords = customWords.filter((_, i) => i !== index);
    setCustomWords(updatedWords);
    await SecureStore.setItemAsync('speciale_custom_words', JSON.stringify(updatedWords));
  };

  const rules = RULES[lang];
  const currentCategories = lang === 'en' ? CATEGORIES_EN : CATEGORIES_FR;
  // Exclure MIMER de la liste des catégories (activé via le toggle)
  // Exclure OBJETS si pas débloqué
  // Exclure SPÉCIALE (accessible uniquement via le bouton ⭐ du menu)
  const categoryKeys = Object.keys(currentCategories).filter(cat => {
    if (cat === 'MIMER') return false;
    if (cat === 'SPECIALE') return false;
    if ((cat === 'OBJECTS' || cat === 'OBJETS') && !objectsUnlocked) return false;
    return true;
  });

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
                  <View style={styles.iconBtnWithAd}>
                    <View style={styles.adIconContainer}>
                      <Image source={AD_REWARD_ICON} style={styles.adIcon} resizeMode="contain" />
                    </View>
                    <TouchableOpacity style={styles.iconBtn} onPress={async () => {
                      playClick();
                      if (customWords.length === 0) {
                        alert(lang === 'fr'
                          ? 'La catégorie SPÉCIALE nécessite au moins 1 mot personnalisé.\n\nAjoutez des mots via le bouton étoile.'
                          : 'SPECIAL category requires at least 1 custom word.\n\nAdd words via the star button.'
                        );
                        return;
                      }
                      // Pub requise pour accéder au mode SPÉCIALE
                      const rewarded = await loadAndShowRewardedAd(() => {});
                      if (!rewarded) return;

                      setSpecialeNumPlayers(3);
                      setSpecialeIntrus(true);
                      setSpecialeMisterWhite(false);
                      setShowSpecialeMode(true);
                    }}>
                      <Image source={STAR_ICON} style={styles.iconBtnImage} resizeMode="contain" />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity style={styles.iconBtn} onPress={() => setShowUnlockShop(true)}>
                    <Image source={SURPRISE_BOX_ICON} style={styles.iconBtnImage} resizeMode="contain" />
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

      {/* Modal pour débloquer la catégorie OBJETS */}
      <Modal visible={showUnlockShop} animationType="slide" transparent onRequestClose={() => setShowUnlockShop(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{lang === 'fr' ? 'BOUTIQUE' : 'SHOP'}</Text>
            <Text style={styles.modalSubtitle}>
              {lang === 'fr'
                ? 'Débloquez la catégorie OBJETS avec une publicité !'
                : 'Unlock the OBJECTS category with a rewarded ad!'}
            </Text>

            {/* Catégorie OBJETS */}
            <View style={styles.unlockItem}>
              <View style={styles.unlockItemHeader}>
                <Text style={styles.unlockItemIcon}>📦</Text>
                <View style={styles.unlockItemInfo}>
                  <Text style={styles.unlockItemTitle}>{lang === 'fr' ? 'OBJETS' : 'OBJECTS'}</Text>
                  <Text style={styles.unlockItemDesc}>
                    {lang === 'fr'
                      ? 'Catégorie spéciale avec des objets du quotidien'
                      : 'Special category with everyday objects'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.unlockBtn, objectsUnlocked && styles.unlockBtnOwned]}
                onPress={async () => {
                  if (objectsUnlocked) {
                    alert(lang === 'fr'
                      ? 'Déjà débloqué !\n\nLa catégorie OBJETS est disponible.'
                      : 'Already unlocked!\n\nOBJECTS category is available.'
                    );
                    return;
                  }
                  if (isExpoGo) {
                    setObjectsUnlocked(true);
                    alert(lang === 'fr'
                      ? 'Catégorie OBJETS débloquée !\n\n(En production, une publicité serait requise)'
                      : 'OBJECTS category unlocked!\n\n(In production, a rewarded ad would be required)'
                    );
                  } else {
                    const rewarded = await loadAndShowRewardedAd(() => {
                      setObjectsUnlocked(true);
                      SecureStore.setItemAsync('objects_category_unlocked', 'true');
                    });
                    if (!rewarded) return;
                  }
                }}
              >
                {!objectsUnlocked && (
                  <View style={styles.unlockBtnAdIcon}>
                    <Image source={AD_REWARD_ICON} style={styles.unlockBtnAdIconImg} resizeMode="contain" />
                  </View>
                )}
                <Text style={styles.unlockBtnText}>
                  {objectsUnlocked
                    ? (lang === 'fr' ? 'DÉBLOQUÉ' : 'UNLOCKED')
                    : (lang === 'fr' ? 'DÉBLOQUER' : 'UNLOCK')}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowUnlockShop(false)}>
              <Text style={styles.closeBtnText}>{lang === 'fr' ? 'FERMER' : 'CLOSE'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal pour le mode SPÉCIALE (bouton étoile) */}
      <Modal visible={showSpecialeMode} animationType="slide" transparent onRequestClose={() => setShowSpecialeMode(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '90%' }]}>
            <Text style={styles.modalTitle}>⭐ {lang === 'fr' ? 'MODE SPÉCIALE' : 'SPECIAL MODE'}</Text>
            <Text style={styles.modalSubtitle}>
              {lang === 'fr'
                ? 'Gérez vos mots et lancez la partie'
                : 'Manage your words and start the game'}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Section: Gérer les mots */}
              <View style={styles.setupSection}>
                <Text style={styles.setupLabel}>{lang === 'fr' ? 'Mots personnalisés' : 'Custom words'}</Text>
                <View style={styles.addWordRow}>
                  <TextInput
                    style={styles.wordInput}
                    placeholder={lang === 'fr' ? 'Nouveau mot...' : 'New word...'}
                    placeholderTextColor="#999"
                    value={newWord}
                    onChangeText={setNewWord}
                    autoCapitalize="words"
                  />
                  <TouchableOpacity
                    style={[styles.addWordBtn, !newWord.trim() && styles.addWordBtnDisabled]}
                    onPress={handleAddWord}
                    disabled={!newWord.trim()}
                  >
                    <Text style={styles.addWordBtnText}>{lang === 'fr' ? 'AJOUTER' : 'ADD'}</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.wordsCount}>{customWords.length} {lang === 'fr' ? 'mots' : 'words'}</Text>
                <ScrollView style={styles.wordsList} showsVerticalScrollIndicator={false}>
                  {customWords.length === 0 ? (
                    <Text style={styles.emptyWords}>{lang === 'fr' ? 'Aucun mot personnalisé' : 'No custom words'}</Text>
                  ) : (
                    customWords.map((word, index) => (
                      <View key={index} style={styles.wordItem}>
                        <Text style={styles.wordItemText}>••••</Text>
                        <TouchableOpacity
                          style={styles.removeBtn}
                          onPress={() => handleRemoveWord(index)}
                        >
                          <Text style={styles.removeBtnText}>×</Text>
                        </TouchableOpacity>
                      </View>
                    ))
                  )}
                </ScrollView>
              </View>

              {/* Section: Nombre de joueurs */}
              <View style={styles.setupSection}>
                <Text style={styles.setupLabel}>{lang === 'fr' ? 'Nombre de joueurs' : 'Number of players'}</Text>
                <View style={styles.counterRowLarge}>
                  <TouchableOpacity style={styles.counterBtnLarge} onPress={() => setSpecialeNumPlayers(p => Math.max(3, p - 1))}><Text style={styles.counterBtnTextLarge}>−</Text></TouchableOpacity>
                  <Text style={styles.counterValLarge}>{specialeNumPlayers}</Text>
                  <TouchableOpacity style={styles.counterBtnLarge} onPress={() => setSpecialeNumPlayers(p => Math.min(20, p + 1))}><Text style={styles.counterBtnTextLarge}>+</Text></TouchableOpacity>
                </View>
              </View>

              {/* Section: Options */}
              <View style={styles.setupSection}>
                <Text style={styles.setupLabel}>{lang === 'fr' ? 'Options' : 'Options'}</Text>

                <View style={styles.toggleRow}>
                  <Text style={styles.toggleLabel}>🎭 {lang === 'fr' ? 'Intrus' : 'Impostor'}</Text>
                  <TouchableOpacity
                    style={[styles.toggleBtn, specialeIntrus && styles.toggleBtnActive]}
                    onPress={() => setSpecialeIntrus(!specialeIntrus)}
                  >
                    <Text style={styles.toggleBtnText}>{specialeIntrus ? 'ON' : 'OFF'}</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.toggleRow}>
                  <Text style={styles.toggleLabel}>🤵 Mister White</Text>
                  <TouchableOpacity
                    style={[styles.toggleBtn, specialeMisterWhite && styles.toggleBtnActive]}
                    onPress={() => setSpecialeMisterWhite(!specialeMisterWhite)}
                  >
                    <Text style={styles.toggleBtnText}>{specialeMisterWhite ? 'ON' : 'OFF'}</Text>
                  </TouchableOpacity>
                </View>

                {specialeMisterWhite && specialeIntrus && specialeNumPlayers < 4 && (
                  <Text style={styles.warningText}>⚠️ {lang === 'fr' ? '4 joueurs minimum' : '4 players minimum'}</Text>
                )}
              </View>

              {/* Bouton Lancer la partie */}
              <TouchableOpacity
                style={[styles.launchBtn, specialeMisterWhite && specialeIntrus && specialeNumPlayers < 4 && styles.launchBtnDisabled]}
                onPress={async () => {
                  if (customWords.length === 0) {
                    alert(lang === 'fr'
                      ? 'Ajoutez au moins 1 mot personnalisé.'
                      : 'Add at least 1 custom word.'
                    );
                    return;
                  }
                  if (specialeMisterWhite && specialeIntrus && specialeNumPlayers < 4) return;
                  playClick();
                  setShowSpecialeMode(false);

                  let gameMode = 0;
                  if (specialeMisterWhite && specialeIntrus) gameMode = 2;
                  else if (specialeIntrus) gameMode = 0;
                  else if (specialeMisterWhite) gameMode = 1;

                  navigation.navigate('Prep', {
                    numPlayers: specialeNumPlayers,
                    gameMode,
                    selectedCategory: 'SPECIALE',
                    customWords,
                    mimerMode: false
                  });
                }}
              >
                <Text style={styles.launchBtnText}>{lang === 'fr' ? 'LANCER LA PARTIE' : 'START GAME'}</Text>
              </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowSpecialeMode(false)}>
              <Text style={styles.closeBtnText}>{lang === 'fr' ? 'FERMER' : 'CLOSE'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showGameSetup} animationType="slide" transparent onRequestClose={() => setShowGameSetup(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '85%' }]}>
            <Text style={styles.modalTitle}>{lang === 'fr' ? 'CONFIGURATION' : 'CONFIGURATION'}</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
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

                <View style={styles.toggleRow}>
                  <View style={styles.toggleLabelContainer}>
                    <Text style={styles.toggleLabel}>🖼️ {lang === 'fr' ? 'Mime' : 'Mime'}</Text>
                  </View>
                  <View style={styles.toggleRightContainer}>
                    {!mimerMode && (
                      <Image source={AD_REWARD_ICON} style={styles.adIconInline} resizeMode="contain" />
                    )}
                    <TouchableOpacity
                      style={[styles.toggleBtn, mimerMode && styles.toggleBtnActive]}
                      onPress={async () => {
                        if (!mimerMode && !isExpoGo) {
                          const rewarded = await loadAndShowRewardedAd(() => {});
                          if (!rewarded) return;
                        }
                        setMimerMode(!mimerMode);
                      }}
                    >
                      <Text style={styles.toggleBtnText}>{mimerMode ? 'ON' : 'OFF'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {misterWhite && intrus && numPlayers < 4 && (
                  <Text style={styles.warningText}>⚠️ {lang === 'fr' ? '4 joueurs minimum' : '4 players minimum'}</Text>
                )}
              </View>

              {!mimerMode && (
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
                      const isSpeciale = cat === 'SPECIALE';
                      const isObjects = cat === 'OBJECTS' || cat === 'OBJETS';
                      const showAdIndicator = (isSpeciale && customWords.length > 0) || (isObjects && !objectsUnlocked);
                      return (
                        <View key={cat} style={styles.categoryWrapper}>
                          {!isExpoGo && showAdIndicator && <Image source={AD_REWARD_ICON} style={styles.adRewardIconSmall} resizeMode="contain" />}
                          <TouchableOpacity
                            style={[
                              styles.categoryChip,
                              selectedCategory === cat && styles.categoryChipActive
                            ]}
                            onPress={() => handleCategorySelect(cat)}
                          >
                            <Text style={[
                              styles.categoryChipText,
                              selectedCategory === cat && styles.categoryChipTextActive
                            ]}>
                              {CATEGORY_EMOJIS[cat] || '🎯'} {CATEGORY_NAMES[lang][cat] || cat.replace('_', ' ')}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </ScrollView>
                </View>
              )}

              {mimerMode && (
                <View style={styles.setupSection}>
                  <Text style={styles.setupLabel}>{lang === 'fr' ? 'Mode MIMER activé' : 'MIME Mode enabled'}</Text>
                  <View style={styles.mimerInfoBox}>
                    <Text style={styles.mimerInfoText}>🎭 {lang === 'fr' ? 'Des paires d\'images à mimer' : 'Image pairs to mime'}</Text>
                  </View>
                </View>
              )}

              <TouchableOpacity
                style={[styles.launchBtn, misterWhite && intrus && numPlayers < 4 && styles.launchBtnDisabled]}
                onPress={handleLaunchGame}
                disabled={misterWhite && intrus && numPlayers < 4}
              >
                <Text style={styles.launchBtnText}>{lang === 'fr' ? 'LANCER LA PARTIE' : 'START GAME'}</Text>
              </TouchableOpacity>
            </ScrollView>

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
  iconBtnWithAd: { alignItems: 'center' },
  adIconContainer: { position: 'absolute', top: -28, alignItems: 'center' },
  adIcon: { width: 28, height: 28 },
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
  setupSection: { width: '100%', marginBottom: 16 },
  setupLabel: { fontFamily: 'SpaceMono', fontSize: 11, color: '#333', marginBottom: 8 },
  counterRowLarge: { flexDirection: 'row', alignItems: 'center', gap: 12, justifyContent: 'center' },
  counterBtnLarge: { width: 40, height: 40, backgroundColor: 'rgba(0,0,0,0.1)', borderWidth: 2, borderColor: '#1a1a1a', alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  counterBtnTextLarge: { fontSize: 20, fontFamily: 'SpaceMono', color: '#1a1a1a' },
  counterValLarge: { fontFamily: 'BebasNeue', fontSize: 28, minWidth: 40, textAlign: 'center', color: '#1a1a1a' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, paddingVertical: 4 },
  toggleLabelContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  toggleRightContainer: { alignItems: 'center', gap: 4 },
  toggleLabel: { fontFamily: 'BebasNeue', fontSize: 16, color: '#1a1a1a' },
  adLabel: { fontFamily: 'SpaceMono', fontSize: 9, color: '#ff6b6b', marginRight: 6 },
  adIconInline: { width: 20, height: 20, marginRight: 4 },
  adRewardIcon: { width: 40, height: 20, marginBottom: 2 },
  adRewardIconSmall: { width: 32, height: 16, marginBottom: 2, alignSelf: 'center' },
  categoryWrapper: { alignItems: 'center' },
  adBanner: { backgroundColor: 'rgba(255,107,107,0.15)', borderWidth: 1, borderColor: '#ff6b6b', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12, marginBottom: 12, flexDirection: 'row', alignItems: 'center' },
  adBannerText: { fontFamily: 'SpaceMono', fontSize: 10, color: '#ff6b6b' },
  toggleSection: { marginBottom: 8 },
  adBadgeContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,107,107,0.15)', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 10, marginBottom: 6, alignSelf: 'center' },
  adBadgeText: { fontFamily: 'SpaceMono', fontSize: 10, color: '#ff6b6b', marginLeft: 6 },
  adRewardBadge: { width: 50, height: 50 },
  adBannerIcon: { width: 24, height: 24, marginRight: 6 },
  toggleBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.15)', borderWidth: 2, borderColor: 'rgba(0,0,0,0.3)' },
  toggleBtnActive: { backgroundColor: '#1a1a1a', borderColor: '#1a1a1a' },
  toggleBtnText: { fontFamily: 'SpaceMono', fontSize: 11, color: '#F5F5DC', fontWeight: 'bold' },
  launchBtn: { backgroundColor: '#1a1a1a', paddingVertical: 12, alignItems: 'center', borderRadius: 15, marginTop: 8, marginBottom: 8 },
  launchBtnDisabled: { backgroundColor: 'rgba(26,26,26,0.3)' },
  launchBtnText: { fontFamily: 'BebasNeue', fontSize: 18, color: '#F5F5DC', letterSpacing: 2 },
  addWordsBtn: { backgroundColor: 'rgba(0,0,0,0.1)', borderWidth: 2, borderColor: '#1a1a1a', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, marginTop: 10, alignItems: 'center' },
  addWordsBtnText: { fontFamily: 'BebasNeue', fontSize: 16, color: '#1a1a1a', letterSpacing: 1 },
  modalSubtitle: { fontFamily: 'SpaceMono', fontSize: 11, color: '#666', textAlign: 'center', marginBottom: 16 },
  addWordRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  wordInput: { flex: 1, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 10, paddingHorizontal: 15, paddingVertical: 10, fontFamily: 'SpaceMono', fontSize: 14, color: '#1a1a1a', borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)' },
  addWordBtn: { backgroundColor: '#1a1a1a', paddingHorizontal: 20, borderRadius: 10, justifyContent: 'center' },
  addWordBtnDisabled: { backgroundColor: 'rgba(26,26,26,0.3)' },
  addWordBtnText: { fontFamily: 'BebasNeue', fontSize: 14, color: '#F5F5DC', letterSpacing: 1 },
  wordsCount: { fontFamily: 'SpaceMono', fontSize: 10, color: '#666', marginBottom: 8, textAlign: 'center' },
  // Styles pour la boutique
  unlockItem: { backgroundColor: 'rgba(0,0,0,0.05)', borderWidth: 2, borderColor: '#1a1a1a', borderRadius: 12, padding: 12, marginBottom: 12 },
  unlockItemHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  unlockItemIcon: { fontSize: 32, marginRight: 12 },
  unlockItemInfo: { flex: 1 },
  unlockItemTitle: { fontFamily: 'BebasNeue', fontSize: 18, color: '#1a1a1a', letterSpacing: 1 },
  unlockItemDesc: { fontFamily: 'SpaceMono', fontSize: 9, color: '#666', marginTop: 2 },
  unlockBtn: { backgroundColor: '#1a1a1a', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10, alignItems: 'center', position: 'relative' },
  unlockBtnOwned: { backgroundColor: '#4a4a4a' },
  unlockBtnText: { fontFamily: 'BebasNeue', fontSize: 14, color: '#F5F5DC', letterSpacing: 1 },
  unlockBtnAdIcon: { position: 'absolute', top: -20, left: 0, right: 0, alignItems: 'center' },
  unlockBtnAdIconImg: { width: 18, height: 18 },
  adBannerModal: { backgroundColor: 'rgba(255,107,107,0.15)', borderWidth: 1, borderColor: '#ff6b6b', borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  adBannerModalIcon: { width: 24, height: 24, marginRight: 6 },
  adBannerModalText: { fontFamily: 'SpaceMono', fontSize: 10, color: '#ff6b6b' },
  wordsList: { maxHeight: 150, width: '100%', marginBottom: 10 },
  emptyWords: { fontFamily: 'SpaceMono', fontSize: 11, color: '#999', textAlign: 'center', paddingVertical: 20 },
  wordItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(0,0,0,0.05)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginBottom: 6 },
  wordItemText: { fontFamily: 'SpaceMono', fontSize: 12, color: '#1a1a1a', flex: 1 },
  removeBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#ff6b6b', alignItems: 'center', justifyContent: 'center' },
  removeBtnText: { fontFamily: 'BebasNeue', fontSize: 20, color: '#F5F5DC', lineHeight: 28 },
  mimerInfoBox: { backgroundColor: 'rgba(0,0,0,0.05)', borderWidth: 2, borderColor: '#1a1a1a', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, alignItems: 'center' },
  mimerInfoText: { fontFamily: 'BebasNeue', fontSize: 16, color: '#1a1a1a', letterSpacing: 1 },
  // Styles pour la boutique
  unlockItem: { backgroundColor: 'rgba(0,0,0,0.05)', borderWidth: 2, borderColor: '#1a1a1a', borderRadius: 12, padding: 12, marginBottom: 12 },
  unlockItemHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  unlockItemIcon: { fontSize: 32, marginRight: 12 },
  unlockItemInfo: { flex: 1 },
  unlockItemTitle: { fontFamily: 'BebasNeue', fontSize: 18, color: '#1a1a1a', letterSpacing: 1 },
  unlockItemDesc: { fontFamily: 'SpaceMono', fontSize: 9, color: '#666', marginTop: 2 },
  unlockBtn: { backgroundColor: '#1a1a1a', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10, alignItems: 'center' },
  unlockBtnOwned: { backgroundColor: '#4a4a4a' },
  unlockBtnText: { fontFamily: 'BebasNeue', fontSize: 14, color: '#F5F5DC', letterSpacing: 1 },
});
