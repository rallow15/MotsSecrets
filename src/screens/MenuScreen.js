import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Modal, Animated, Easing, ImageBackground, Image, Platform,
  TextInput, KeyboardAvoidingView,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  LIEUX: '🏠',
  LOCATIONS: '🏠',
  GROUPES: '👥',
  GROUPS: '👥',
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
    LIEUX: 'LIEUX',
    GROUPES: 'GROUPES',
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
    LOCATIONS: 'LOCATIONS',
    GROUPS: 'GROUPS',
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
    {
      mode: 'SPYFALL',
      desc: '1 espion sans mot ou 1 intrus avec un mot différent, devinez ou démasquez.',
      steps: [
        '2 variantes : Espion (ne connaît pas le mot) ou Intrus (a un mot différent).',
        'Les joueurs se posent des questions pour identifier l\'espion ou l\'intrus.',
        'À tout moment, on peut voter pour accuser quelqu\'un. L\'espion peut aussi deviner le mot.',
        'Si l\'espion/l\'intrus est trouvé au vote, il peut tenter de deviner le mot pour gagner.',
        'Si le temps est écoulé, l\'espion/l\'intrus gagne !',
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
    {
      mode: 'SPYFALL',
      desc: '1 spy with no word or 1 undercover with a different word, guess or expose.',
      steps: [
        '2 variants: Spy (doesn\'t know the word) or Undercover (has a different word).',
        'Players ask each other questions to identify the spy or undercover.',
        'At any time, players can vote to accuse someone. The spy can also guess the word.',
        'If the spy/undercover is caught in a vote, they can try to guess the word to still win.',
        'If time runs out, the spy/undercover wins!',
      ],
    },
  ],
};

// Images pour les cartes de mode
const MODE_IMAGES = {
  normal: require('../../assets/mode-normal.png'),
  misterWhite: require('../../assets/mode-mister-white.png'),
  misterIntrus: require('../../assets/mode-mister-intrus.png'),
  spyfall: require('../../assets/mode-spyfall.png'),
  mime: require('../../assets/mode-mime.png'),
};


const ROLE_UNDERCOVER = require('../../assets/role-undercover.png');
const ROLE_MISTERWHITE = require('../../assets/role-misterwhite.png');

// Slider simple avec valeur affichée
function ModeSlider({ value, onValueChange, min, max }) {
  return (
    <View style={styles.sliderRow}>
      <Slider
        style={styles.slider}
        minimumValue={min}
        maximumValue={max}
        step={1}
        value={value}
        onValueChange={onValueChange}
        minimumTrackTintColor="#1a1a1a"
        maximumTrackTintColor="rgba(0,0,0,0.15)"
        thumbTintColor="#1a1a1a"
      />
      <Text style={styles.sliderValue}>{value}</Text>
    </View>
  );
}

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
  const [specialeGameMode, setSpecialeGameMode] = useState(0); // 0=Normal, 1=MW, 2=MW+Intrus
  const [showGameSetup, setShowGameSetup] = useState(false);
  const [showOtherModes, setShowOtherModes] = useState(false);
  const [modePage, setModePage] = useState(0);
  const [gameMode, setGameMode] = useState(0); // 0=Normal, 1=MW, 2=MW+Intrus, 3=Spyfall
  const [mimerMode, setMimerMode] = useState(false);
  const [spyfallTimer, setSpyfallTimer] = useState(8);
  // Toggles pour Intrus et Mister White (mode Normal)
  const [numUndercovers, setNumUndercovers] = useState(1);
  const [numMisterWhites, setNumMisterWhites] = useState(0);
  const [easyMode, setEasyMode] = useState(false);
  const [spyfallUndercover, setSpyfallUndercover] = useState(false);

  // Les rôles spéciaux doivent être 2x moins nombreux que les normaux
  // => specials ≤ floor(players / 3)
  const maxTotalSpecials = Math.floor(numPlayers / 3);

  const canAddUC = (numUndercovers + 1 + numMisterWhites) <= maxTotalSpecials;
  const canAddMW = (numUndercovers + numMisterWhites + 1) <= maxTotalSpecials;

  // Synchroniser gameMode avec les compteurs
  useEffect(() => {
    if (gameMode !== 3 && !mimerMode) {
      if (numUndercovers > 0 && numMisterWhites > 0) setGameMode(2);
      else if (numMisterWhites > 0) setGameMode(1);
      else setGameMode(0);
    }
  }, [numUndercovers, numMisterWhites]);

  // Quand le nombre de joueurs change, ajuster les compteurs pour rester cohérent
  useEffect(() => {
    const maxTotal = Math.floor(numPlayers / 3);

    let newUC = numUndercovers;
    let newMW = numMisterWhites;

    // Règle : intrus + mister whites ≤ floor(players / 3)
    while (newUC + newMW > maxTotal && newMW > 0) newMW--;
    while (newUC + newMW > maxTotal && newUC > 0) newUC--;

    if (newUC !== numUndercovers) setNumUndercovers(newUC);
    if (newMW !== numMisterWhites) setNumMisterWhites(newMW);
  }, [numPlayers]);
  // États des sons (synchronisés avec sound.js)
  const [musicOn, setMusicOn] = useState(musicEnabled);
  const [sfxOn, setSfxOn] = useState(sfxEnabled);
  // Catégorie OBJETS débloquée ou non
  const [objectsUnlocked, setObjectsUnlocked] = useState(false);
  // Mots personnalisés pour la catégorie SPÉCIALE
  const [customWords, setCustomWords] = useState([]);
  const [newWord, setNewWord] = useState('');
  const [isPlayOpening, setIsPlayOpening] = useState(false);
  const playOpenAnim = useRef(new Animated.Value(0)).current;
  const gameSetupAnim = useRef(new Animated.Value(0)).current;

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

  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Animations de transition loading → menu
  const loadingOpacity = useRef(new Animated.Value(1)).current;
  const loadingScale = useRef(new Animated.Value(1)).current;
  const menuOpacity = useRef(new Animated.Value(0)).current;

  // Référence pour l'animation pulse (permet de l'annuler proprement)
  const pulseAnimRef = useRef(null);

  const startPulseAnimation = () => {
    pulseAnim.setValue(1);
    if (pulseAnimRef.current) { pulseAnimRef.current.stop(); }
    pulseAnimRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 800, easing: Easing.ease, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, easing: Easing.ease, useNativeDriver: true }),
      ])
    );
    pulseAnimRef.current.start();
  };

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
        // Transition fluide : fade-out du chargement puis fade-in du menu
        Animated.parallel([
          Animated.timing(loadingOpacity, { toValue: 0, duration: 500, useNativeDriver: true }),
          Animated.timing(loadingScale, { toValue: 1.15, duration: 500, useNativeDriver: true }),
        ]).start(() => {
          setShowLoading(false);
          Animated.timing(menuOpacity, { toValue: 1, duration: 500, useNativeDriver: true }).start();
        });
      }
    }, 16);

    startPulseAnimation();

    return () => {
      clearInterval(interval);
      if (pulseAnimRef.current) { pulseAnimRef.current.stop(); }
    };
  }, []);

  // Réinitialiser l'état quand l'écran revient au premier plan
  useFocusEffect(
    useCallback(() => {
      console.log('MenuScreen focus - réinitialisation');

      // S'assurer que le menu est visible (pas de re-transition au retour)
      menuOpacity.setValue(1);

      // Recharger les mots personnalisés SPÉCIALE depuis SecureStore
      const loadCustomWords = async () => {
        try {
          const savedWords = await SecureStore.getItemAsync('speciale_custom_words');
          if (savedWords) {
            setCustomWords(JSON.parse(savedWords));
          }
        } catch (e) {
          console.log('Erreur chargement custom words:', e);
        }
      };
      loadCustomWords();

      // Fermer toutes les modales
      setShowGameSetup(false);
      gameSetupAnim.setValue(0);
      playOpenAnim.setValue(0);
      setIsPlayOpening(false);
      setShowRules(false);
      setShowSettings(false);
      setShowUnlockShop(false);
      setShowSpecialeMode(false);
      setShowCategories(false);
      setNumUndercovers(1);
      setNumMisterWhites(0);
      setEasyMode(false);
      setSpyfallUndercover(false);
      setShowOtherModes(false);

      // Redémarrer l'animation pulse
      startPulseAnimation();

      // Redémarrer la musique si elle est activée
      if (musicOn && !showLoading) {
        startBackgroundMusic();
      }

      return () => {
        if (pulseAnimRef.current) { pulseAnimRef.current.stop(); }
      };
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

  // Animer l'entrée du modal de configuration quand il apparaît
  useEffect(() => {
    if (showGameSetup) {
      Animated.spring(gameSetupAnim, {
        toValue: 1,
        friction: 7,
        tension: 50,
        useNativeDriver: true,
      }).start();
    }
  }, [showGameSetup]);

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
    setIsPlayOpening(true);
    if (pulseAnimRef.current) { pulseAnimRef.current.stop(); }
    Animated.timing(playOpenAnim, {
      toValue: 1,
      duration: 350,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setShowGameSetup(true);
    });
  };

  const closeGameSetup = () => {
    playClick();
    Animated.parallel([
      Animated.timing(gameSetupAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(playOpenAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowGameSetup(false);
      gameSetupAnim.setValue(0);
      setIsPlayOpening(false);
      startPulseAnimation();
    });
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

    if (gameMode === 2 && numPlayers < 4) { return; }
    // Il faut toujours plus de joueurs normaux que de rôles spéciaux
    if (gameMode !== 3 && !mimerMode && numUndercovers + numMisterWhites >= numPlayers) {
      alert(lang === 'fr' ? 'Il faut plus de joueurs normaux que d\'intrus et Mister White réunis.' : 'Need more normal players than Undercover + Mister White combined.');
      return;
    }

    // En mode MIMER, la catégorie est automatiquement MIMER
    // En mode SPYFALL, la catégorie est LIEUX/GROUPES selon sélection (défaut LIEUX)
    let finalCategory = selectedCategory;
    if (mimerMode) finalCategory = 'MIMER';
    if (gameMode === 3 && !finalCategory) finalCategory = lang === 'fr' ? 'LIEUX' : 'LOCATIONS';
    if (gameMode === 3 && finalCategory !== 'LIEUX' && finalCategory !== 'LOCATIONS' && finalCategory !== 'GROUPES' && finalCategory !== 'GROUPS') {
      finalCategory = lang === 'fr' ? 'LIEUX' : 'LOCATIONS';
    }

    setShowGameSetup(false);
    setIsPlayOpening(false);
    playOpenAnim.setValue(0);
    gameSetupAnim.setValue(0);
    navigation.navigate('Prep', {
      numPlayers,
      gameMode,
      selectedCategory: finalCategory,
      customWords,
      mimerMode,
      spyfallTimer: gameMode === 3 ? spyfallTimer : null,
      numUndercovers,
      numMisterWhites,
      easyMode,
      spyfallUndercover,
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
      }, 'objects');
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

  return (
    <>
      {/* Menu toujours rendu en dessous */}
      <Animated.View style={[styles.fullContainer, { opacity: menuOpacity }]}>
        <ImageBackground source={require('../../assets/bg-menu.png')} style={styles.bg} resizeMode="cover">
          <View style={styles.overlay}>
            <View style={{ flex: 1 }}>

              <ScrollView
                style={{ flex: 1, zIndex: 1 }}
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
                      // Pub requise pour accéder au mode SPÉCIALE
                      if (!isExpoGo) {
                        const rewarded = await loadAndShowRewardedAd(() => {});
                        if (!rewarded) return;
                      }
                      setSpecialeNumPlayers(3);
                      setSpecialeGameMode(0);
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

              <Animated.View style={[
                styles.playContainer,
                {
                  transform: [{
                    scale: isPlayOpening
                      ? playOpenAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.8] })
                      : pulseAnim
                  }],
                  opacity: isPlayOpening
                    ? playOpenAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] })
                    : 1,
                }
              ]}>
                <TouchableOpacity onPress={handleStart} activeOpacity={0.8} disabled={isPlayOpening}>
                  <Image source={require('../../assets/video.png')} style={styles.playIcon} />
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>
        </ImageBackground>
      </Animated.View>

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
                    }, 'objects');
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
                <ModeSlider
                  value={specialeNumPlayers}
                  onValueChange={setSpecialeNumPlayers}
                  min={3}
                  max={20}
                />
              </View>

              {/* Section: Mode de jeu */}
              <View style={styles.setupSection}>
                <Text style={styles.setupLabel}>{lang === 'fr' ? 'Mode de jeu' : 'Game mode'}</Text>

                <View style={styles.modeGrid}>
                  {[
                    { mode: 0, imageKey: 'normal', titleKey: 'modeNormal', descKey: 'modeNormalDesc' },
                    { mode: 1, imageKey: 'misterWhite', titleKey: 'modeMisterWhite', descKey: 'modeMisterWhiteDesc' },
                    { mode: 2, imageKey: 'misterIntrus', titleKey: 'modeMWIntrus', descKey: 'modeMWIntrusDesc' },
                  ].map(({ mode, imageKey, titleKey, descKey }) => (
                    <TouchableOpacity
                      key={mode}
                      style={[styles.modeCard, specialeGameMode === mode && styles.modeCardActive]}
                      onPress={() => setSpecialeGameMode(mode)}
                      activeOpacity={0.7}
                    >
                      <Image source={MODE_IMAGES[imageKey]} style={styles.modeCardImage} resizeMode="contain" />
                      <Text style={[styles.modeCardTitle, specialeGameMode === mode && styles.modeCardTitleActive]}>{t(titleKey)}</Text>
                      <Text style={[styles.modeCardDesc, specialeGameMode === mode && styles.modeCardDescActive]}>{t(descKey)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {specialeGameMode === 2 && specialeNumPlayers < 4 && (
                  <Text style={styles.warningText}>⚠️ {lang === 'fr' ? '4 joueurs minimum' : '4 players minimum'}</Text>
                )}
              </View>

              {/* Bouton Lancer la partie */}
              <TouchableOpacity
                style={[styles.launchBtn, specialeGameMode === 2 && specialeNumPlayers < 4 && styles.launchBtnDisabled]}
                onPress={async () => {
                  if (customWords.length === 0) {
                    alert(lang === 'fr'
                      ? 'Ajoutez au moins 1 mot personnalisé.'
                      : 'Add at least 1 custom word.'
                    );
                    return;
                  }
                  if (specialeGameMode === 2 && specialeNumPlayers < 4) return;
                  playClick();
                  setShowSpecialeMode(false);

                  navigation.navigate('Prep', {
                    numPlayers: specialeNumPlayers,
                    gameMode: specialeGameMode,
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

      <Modal visible={showGameSetup} animationType="none" transparent onRequestClose={closeGameSetup}>
        <Animated.View style={[styles.modalOverlay, { opacity: gameSetupAnim }]}>
          <Animated.View style={[styles.modalContent, { maxHeight: '90%',
            transform: [{ scale: gameSetupAnim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }]
          }]}>
            <Text style={styles.modalTitle}>{lang === 'fr' ? 'CONFIGURATION' : 'CONFIGURATION'}</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.setupSection}>
                <Text style={styles.setupLabel}>{lang === 'fr' ? 'Nombre de joueurs' : 'Number of players'}</Text>
                <ModeSlider
                  value={numPlayers}
                  onValueChange={setNumPlayers}
                  min={3}
                  max={20}
                />
              </View>

              <View style={styles.setupSection}>
                <Text style={styles.setupLabel}>{lang === 'fr' ? 'Mode de jeu' : 'Game mode'}</Text>

                <View style={styles.modeGrid}>
                  {/* UNDERCOVER */}
                  <TouchableOpacity
                    style={[styles.modeCard, !mimerMode && gameMode !== 3 && styles.modeCardActive]}
                    onPress={() => {
                      playClick();
                      setMimerMode(false);
                      setGameMode(numUndercovers > 0 && numMisterWhites > 0 ? 2 : numMisterWhites > 0 ? 1 : 0);
                    }}
                    activeOpacity={0.7}
                  >
                    <Image source={ROLE_UNDERCOVER} style={styles.modeCardImage} resizeMode="contain" />
                    <Text style={[styles.modeCardTitle, !mimerMode && gameMode !== 3 && styles.modeCardTitleActive]}>UNDERCOVER</Text>
                    <Text style={[styles.modeCardDesc, !mimerMode && gameMode !== 3 && styles.modeCardDescActive]}>{lang === 'fr' ? 'Intrus + Mister White' : 'Undercover + Mister White'}</Text>
                  </TouchableOpacity>

                  {/* Spyfall */}
                  <TouchableOpacity
                    style={[styles.modeCard, gameMode === 3 && styles.modeCardActive]}
                    onPress={() => {
                      playClick();
                      setSelectedCategory(lang === 'fr' ? 'LIEUX' : 'LOCATIONS');
                      setMimerMode(false);
                      setNumUndercovers(1);
                      setNumMisterWhites(0);
                      setSpyfallUndercover(false);
                      setSelectedCategory(lang === 'fr' ? 'LIEUX' : 'LOCATIONS');
                      setGameMode(3);
                    }}
                    activeOpacity={0.7}
                  >
                    <Image source={MODE_IMAGES.spyfall} style={styles.modeCardImage} resizeMode="contain" />
                    <Text style={[styles.modeCardTitle, gameMode === 3 && styles.modeCardTitleActive]}>{t('modeSpyfall')}</Text>
                    <Text style={[styles.modeCardDesc, gameMode === 3 && styles.modeCardDescActive]}>
                      {spyfallUndercover
                        ? (lang === 'fr' ? '1 intrus avec un mot différent' : '1 undercover with a different word')
                        : t('modeSpyfallDesc')}
                    </Text>
                  </TouchableOpacity>

                  {/* MIME */}
                  <View style={styles.modeCardOuter}>
                    {!mimerMode ? (
                      <Image source={AD_REWARD_ICON} style={styles.modeCardAdBadge} resizeMode="contain" />
                    ) : null}
                    <TouchableOpacity
                      style={[styles.modeCard, { width: '100%' }, mimerMode && styles.modeCardActive]}
                      onPress={async () => {
                        if (!mimerMode && !isExpoGo) {
                          const rewarded = await loadAndShowRewardedAd(() => {}, 'mime');
                          if (!rewarded) return;
                        }
                        playClick();
                        setMimerMode(!mimerMode);
                        if (!mimerMode) {
                          setGameMode(0);
                          setNumUndercovers(1);
                          setNumMisterWhites(0);
                        }
                      }}
                      activeOpacity={0.7}
                    >
                      <Image source={MODE_IMAGES.mime} style={styles.modeCardImage} resizeMode="contain" />
                      <Text style={[styles.modeCardTitle, mimerMode && styles.modeCardTitleActive]}>{t('modeMimer')}</Text>
                      <Text style={[styles.modeCardDesc, mimerMode && styles.modeCardDescActive]}>{t('modeMimerDesc')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Compteurs Intrus/Espion + Mister White */}
                {!mimerMode && selectedCategory !== 'SPECIALE' && (
                  <View style={styles.roleCounters}>
                    <View style={styles.roleCounterRow}>
                      <Image source={MODE_IMAGES.normal} style={styles.roleCounterIcon} resizeMode="contain" />
                      <Text style={styles.roleCounterLabel}>{gameMode === 3 && !spyfallUndercover ? (lang === 'fr' ? 'Espion' : 'Spy') : (lang === 'fr' ? 'Intrus' : 'Undercover')}</Text>
                      <View style={styles.roleCounterControls}>
                        <TouchableOpacity style={styles.roleCounterBtn} onPress={() => { playClick(); setNumUndercovers(v => Math.max(gameMode === 3 ? 1 : 0, v - 1)); }}><Text style={styles.roleCounterBtnText}>−</Text></TouchableOpacity>
                        <Text style={styles.roleCounterVal}>{numUndercovers}</Text>
                        <TouchableOpacity style={[styles.roleCounterBtn, !canAddUC && styles.roleCounterBtnDisabled]} onPress={() => { playClick(); if (canAddUC) setNumUndercovers(v => v + 1); }} disabled={!canAddUC}><Text style={styles.roleCounterBtnText}>+</Text></TouchableOpacity>
                      </View>
                    </View>
                    {!(gameMode === 3) && (
                    <View style={styles.roleCounterRow}>
                      <Image source={ROLE_MISTERWHITE} style={styles.roleCounterIcon} resizeMode="contain" />
                      <Text style={styles.roleCounterLabel}>Mister White</Text>
                      <View style={styles.roleCounterControls}>
                        <TouchableOpacity style={styles.roleCounterBtn} onPress={() => { playClick(); setNumMisterWhites(v => Math.max(0, v - 1)); }}><Text style={styles.roleCounterBtnText}>−</Text></TouchableOpacity>
                        <Text style={styles.roleCounterVal}>{numMisterWhites}</Text>
                        <TouchableOpacity style={[styles.roleCounterBtn, !canAddMW && styles.roleCounterBtnDisabled]} onPress={() => { playClick(); if (canAddMW) setNumMisterWhites(v => v + 1); }} disabled={!canAddMW}><Text style={styles.roleCounterBtnText}>+</Text></TouchableOpacity>
                      </View>
                    </View>
                    )}
                  </View>
                )}

                {/* Option Facile */}
                {numMisterWhites > 0 && !mimerMode && gameMode !== 3 && (
                  <View style={styles.easyModeRow}>
                    <View style={styles.easyModeInfo}>
                      <Text style={styles.easyModeLabel}>{lang === 'fr' ? '🪶 Facile' : '🪶 Easy'}</Text>
                      <Text style={styles.easyModeDesc}>{lang === 'fr' ? 'Mister White connaît la catégorie' : 'Mister White knows the category'}</Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.toggleBtn, easyMode && styles.toggleBtnActive]}
                      onPress={() => { playClick(); setEasyMode(!easyMode); }}
                    >
                      <Text style={styles.toggleBtnText}>{easyMode ? 'ON' : 'OFF'}</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {gameMode === 2 && !mimerMode && numPlayers < 4 && (
                  <Text style={styles.warningText}>⚠️ {lang === 'fr' ? '4 joueurs minimum' : '4 players minimum'}</Text>
                )}
              </View>

              {gameMode === 3 && (
                <View style={styles.setupSection}>
                  <Text style={styles.setupLabel}>{lang === 'fr' ? 'Timer' : 'Timer'}</Text>
                  <View style={styles.counterRowLarge}>
                    {[3, 5, 8, 10].map(m => (
                      <TouchableOpacity
                        key={m}
                        style={[styles.timerChip, spyfallTimer === m && styles.timerChipActive]}
                        onPress={() => setSpyfallTimer(m)}
                      >
                        <Text style={[styles.timerChipText, spyfallTimer === m && styles.timerChipTextActive]}>{m} {t('timerLabel')}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {gameMode === 3 && (
                <View style={styles.setupSection}>
                  <Text style={styles.setupLabel}>{lang === 'fr' ? 'Mode Espion / Intrus' : 'Spy / Undercover Mode'}</Text>
                  <View style={styles.spyfallVariantRow}>
                    <TouchableOpacity
                      style={[styles.variantBtn, !spyfallUndercover && styles.variantBtnActive]}
                      onPress={() => { playClick(); setSpyfallUndercover(false); setNumUndercovers(1); }}
                    >
                      <Text style={styles.variantBtnEmoji}>🕵️</Text>
                      <Text style={[styles.variantBtnText, !spyfallUndercover && styles.variantBtnTextActive]}>{lang === 'fr' ? 'ESPION' : 'SPY'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.variantBtn, spyfallUndercover && styles.variantBtnActive]}
                      onPress={() => { playClick(); setSpyfallUndercover(true); setNumUndercovers(1); }}
                    >
                      <Text style={styles.variantBtnEmoji}>🥸</Text>
                      <Text style={[styles.variantBtnText, spyfallUndercover && styles.variantBtnTextActive]}>{lang === 'fr' ? 'INTRUS' : 'UNDERCOVER'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {!mimerMode && gameMode !== 3 && (
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

              {gameMode === 3 && !mimerMode && (
                <View style={styles.setupSection}>
                  <Text style={styles.setupLabel}>{lang === 'fr' ? 'Catégorie' : 'Category'}</Text>
                  <View style={styles.categoryScrollHorizontal}>
                    <TouchableOpacity
                      style={[styles.categoryChip, (selectedCategory === null || selectedCategory === 'LIEUX' || selectedCategory === 'LOCATIONS') && styles.categoryChipActive]}
                      onPress={() => { playClick(); setSelectedCategory(lang === 'fr' ? 'LIEUX' : 'LOCATIONS'); }}
                    >
                      <Text style={[styles.categoryChipText, (selectedCategory === null || selectedCategory === 'LIEUX' || selectedCategory === 'LOCATIONS') && styles.categoryChipTextActive]}>
                        🏠 {CATEGORY_NAMES[lang][lang === 'fr' ? 'LIEUX' : 'LOCATIONS'] || (lang === 'fr' ? 'LIEUX' : 'LOCATIONS')}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.categoryChip, (selectedCategory === 'GROUPES' || selectedCategory === 'GROUPS') && styles.categoryChipActive]}
                      onPress={() => { playClick(); setSelectedCategory(lang === 'fr' ? 'GROUPES' : 'GROUPS'); }}
                    >
                      <Text style={[styles.categoryChipText, (selectedCategory === 'GROUPES' || selectedCategory === 'GROUPS') && styles.categoryChipTextActive]}>
                        👥 {CATEGORY_NAMES[lang][lang === 'fr' ? 'GROUPES' : 'GROUPS'] || (lang === 'fr' ? 'GROUPES' : 'GROUPS')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </ScrollView>

            {/* Bouton LANCER toujours visible en bas */}
            <TouchableOpacity
              style={[styles.launchBtn, gameMode === 2 && numPlayers < 4 && styles.launchBtnDisabled]}
              onPress={handleLaunchGame}
              disabled={gameMode === 2 && numPlayers < 4}
            >
              <Text style={styles.launchBtnText}>{lang === 'fr' ? 'LANCER LA PARTIE' : 'START GAME'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.closeBtn} onPress={closeGameSetup}>
              <Text style={styles.closeBtnText}>{lang === 'fr' ? 'FERMER' : 'CLOSE'}</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </Modal>

      {/* Écran de chargement en superposition */}

      {/* Écran de chargement en superposition */}
      {showLoading && (
        <Animated.View style={[styles.loadingOverlay, { opacity: loadingOpacity }]}>
          <Animated.View style={{ transform: [{ scale: loadingScale }] }}>
            <Image source={require('../../assets/icon.png')} style={styles.loadingLogo} />
          </Animated.View>
          <Text style={styles.loadingTitle}>MOTS SECRETS</Text>
          <View style={styles.loadingBarContainer}>
            <View style={[styles.loadingBar, { width: `${loadingProgress * 100}%` }]} />
          </View>
          <Text style={styles.loadingText}>{Math.round(loadingProgress * 100)}%</Text>
        </Animated.View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  fullContainer: { flex: 1 },
  loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5DC', zIndex: 100 },
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
  modeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginTop: 6 },
  otherModesBtn: { backgroundColor: 'rgba(0,0,0,0.06)', borderWidth: 1, borderColor: 'rgba(0,0,0,0.12)', borderRadius: 8, paddingVertical: 8, alignItems: 'center', marginTop: 6 },
  otherModesBtnText: { fontFamily: 'BebasNeue', fontSize: 13, color: '#666', letterSpacing: 1 },
  roleCounters: { width: '100%', gap: 4, marginTop: 6 },
  roleCounterRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.04)', borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)', borderRadius: 6, paddingVertical: 4, paddingHorizontal: 8, gap: 6 },
  roleCounterIcon: { width: 20, height: 20 },
  roleCounterLabel: { fontFamily: 'SpaceMono', fontSize: 10, color: '#666', flex: 1 },
  roleCounterControls: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  roleCounterBtn: { width: 22, height: 22, backgroundColor: 'rgba(0,0,0,0.08)', borderWidth: 1, borderColor: 'rgba(0,0,0,0.15)', alignItems: 'center', justifyContent: 'center', borderRadius: 4 },
  roleCounterBtnDisabled: { opacity: 0.25 },
  roleCounterBtnText: { fontSize: 12, fontFamily: 'SpaceMono', color: '#1a1a1a' },
  roleCounterVal: { fontFamily: 'BebasNeue', fontSize: 15, minWidth: 16, textAlign: 'center', color: '#1a1a1a' },
  modeCard: { width: '47%', backgroundColor: '#F5F5DC', borderWidth: 1.5, borderColor: 'rgba(0,0,0,0.15)', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 6, alignItems: 'center', gap: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  modeCardActive: { backgroundColor: '#1a1a1a', borderColor: '#1a1a1a', shadowOpacity: 0.4, shadowRadius: 6, elevation: 8 },
  modeCardEmoji: { fontSize: 22, marginBottom: 1 },
  modeCardImage: { width: '85%', height: 40, marginBottom: 2 },
  modeCardTitle: { fontFamily: 'BebasNeue', fontSize: 13, color: '#1a1a1a', letterSpacing: 1, textAlign: 'center' },
  modeCardTitleActive: { color: '#F5F5DC' },
  modeCardDesc: { fontFamily: 'SpaceMono', fontSize: 7, color: '#666', textAlign: 'center', lineHeight: 10 },
  modeCardDescActive: { color: 'rgba(245,245,220,0.7)' },
  modeCardOuter: { width: '47%', position: 'relative' },
  modeCardAdBadge: { position: 'absolute', top: 2, right: 2, width: 24, height: 24, zIndex: 10 },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: '85%', backgroundColor: '#F5F5DC', borderRadius: 20, padding: 16, borderWidth: 2, borderColor: '#1a1a1a', maxHeight: '85%' },
  modalTitle: { fontFamily: 'BebasNeue', fontSize: 24, color: '#1a1a1a', letterSpacing: 2, textAlign: 'center', marginBottom: 10 },
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
  setupSection: { width: '100%', marginBottom: 6 },
  setupLabel: { fontFamily: 'SpaceMono', fontSize: 11, color: '#333', marginBottom: 4 },
  counterRowLarge: { flexDirection: 'row', alignItems: 'center', gap: 12, justifyContent: 'center' },
  counterBtnLarge: { width: 40, height: 40, backgroundColor: 'rgba(0,0,0,0.1)', borderWidth: 2, borderColor: '#1a1a1a', alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  counterBtnTextLarge: { fontSize: 20, fontFamily: 'SpaceMono', color: '#1a1a1a' },
  counterValLarge: { fontFamily: 'BebasNeue', fontSize: 28, minWidth: 40, textAlign: 'center', color: '#1a1a1a' },
  sliderRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  slider: { flex: 1 },
  sliderValue: { fontFamily: 'BebasNeue', fontSize: 28, color: '#1a1a1a', minWidth: 36, textAlign: 'center' },
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
  toggleBtnDisabled: { opacity: 0.3 },
  easyModeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(0,0,0,0.05)', borderWidth: 1.5, borderColor: 'rgba(0,0,0,0.12)', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 10, marginTop: 6 },
  easyModeInfo: { flex: 1 },
  easyModeLabel: { fontFamily: 'BebasNeue', fontSize: 14, color: '#1a1a1a', letterSpacing: 1 },
  easyModeDesc: { fontFamily: 'SpaceMono', fontSize: 9, color: '#666', marginTop: 1 },
  timerChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.1)', borderWidth: 1, borderColor: 'rgba(0,0,0,0.2)' },
  timerChipActive: { backgroundColor: '#1a1a1a', borderColor: '#1a1a1a' },
  timerChipText: { fontFamily: 'BebasNeue', fontSize: 14, color: '#1a1a1a' },
  timerChipTextActive: { color: '#F5F5DC' },
  spyfallVariantRow: { flexDirection: 'row', gap: 10, justifyContent: 'center', marginTop: 6 },
  variantBtn: { flex: 1, backgroundColor: 'rgba(0,0,0,0.06)', borderWidth: 1.5, borderColor: 'rgba(0,0,0,0.15)', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12, alignItems: 'center', gap: 4 },
  variantBtnActive: { backgroundColor: '#1a1a1a', borderColor: '#1a1a1a' },
  variantBtnEmoji: { fontSize: 24 },
  variantBtnText: { fontFamily: 'BebasNeue', fontSize: 13, color: '#1a1a1a', letterSpacing: 1, textAlign: 'center' },
  variantBtnTextActive: { color: '#F5F5DC' },
});
