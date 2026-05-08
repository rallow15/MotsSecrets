import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import Slider from '@react-native-community/slider';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Modal, Animated, Easing, Image, ImageBackground,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { t, getLang, setLang } from '../i18n';
import { CATEGORIES_FR, CATEGORIES_EN } from '../data/words';
import { generateAssignments } from '../gameLogic';
import { setGlobalDarkTheme } from '../theme';
import { initSounds, playClick, playStart, startBackgroundMusic, stopBackgroundMusic, setMusicEnabled, setSfxEnabled, musicEnabled, sfxEnabled } from '../sound';
import { loadAndShowRewardedAd } from '../ads';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Détecter si on est dans Expo Go
const isExpoGo = Constants.appOwnership === 'expo';
const isWeb = Platform.OS === 'web';

// SecureStore — uniquement mobile
let SecureStore;
if (!isWeb) {
  try { SecureStore = require('expo-secure-store'); } catch (e) {}
}

// Helpers SafeStore — fallback AsyncStorage ou no-op sur web
const safeGetItem = async (key) => {
  if (!SecureStore) return null;
  try { return await SecureStore.getItemAsync(key); } catch (e) { return null; }
};
const safeSetItem = async (key, value) => {
  if (!SecureStore) return;
  try { await SecureStore.setItemAsync(key, value); } catch (e) {}
};

// Images pour indiquer les pubs à récompense
const AD_REWARD_ICON = require('../../assets/ad-reward-icon.png');

// Icônes SVG de la barre inférieure
import ReglesIcon from '../../assets/regles.svg';
import ParametreIcon from '../../assets/parametre.svg';
import SpecialeIcon from '../../assets/speciale.svg';
import BoutiqueIcon from '../../assets/boutique.svg';

// Icônes SVG thème clair
import ReglesIconLight from '../../assets/regles-claire.svg';
import ParametreIconLight from '../../assets/parametre-claire.svg';
import SpecialeIconLight from '../../assets/speciale-claire.svg';
import BoutiqueIconLight from '../../assets/boutique-claire.svg';

// SVG thème clair
import LogoTitleLight from '../../assets/logo-title-light.svg';
import PlayBtnLight from '../../assets/play-btn-light.svg';

// Image bouton lancer (thème sombre)
const LAUNCH_BTN = require('../../assets/launch-btn.png');
// Image bouton lancer (thème clair)
const LAUNCH_BTN_LIGHT = require('../../assets/launch-btn-light.png');

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
  AGE_OF_EMPIRE_4: '🏰',
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
    AGE_OF_EMPIRE_4: 'AGE OF EMPIRE 4',
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
    AGE_OF_EMPIRE_4: 'AGE OF EMPIRE 4',
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
function ModeSlider({ value, onValueChange, min, max, themeColors }) {
  const sliderTheme = themeColors || { neon: '#1a1a1a', border: 'rgba(0,0,0,0.15)', text: '#1a1a1a' };
  return (
    <View style={styles.sliderRow}>
      <Slider
        style={styles.slider}
        minimumValue={min}
        maximumValue={max}
        step={1}
        value={value}
        onValueChange={onValueChange}
        minimumTrackTintColor={sliderTheme.neon}
        maximumTrackTintColor={sliderTheme.border}
        thumbTintColor={sliderTheme.neon}
      />
      <Text style={[styles.sliderValue, { color: sliderTheme.neon }]}>{value}</Text>
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
  const [rulesPage, setRulesPage] = useState(0);
  const [showCategories, setShowCategories] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showUnlockShop, setShowUnlockShop] = useState(false);
  const [showSpecialeMode, setShowSpecialeMode] = useState(false);
  const [specialeNumPlayers, setSpecialeNumPlayers] = useState(3);
  const [specialeGameMode, setSpecialeGameMode] = useState(0);
  const [specialeNumUndercovers, setSpecialeNumUndercovers] = useState(1);
  const [specialeNumMisterWhites, setSpecialeNumMisterWhites] = useState(0);
  const [showGameSetup, setShowGameSetup] = useState(false);
  const [showOtherModes, setShowOtherModes] = useState(false);
  const [modePage, setModePage] = useState(0);
  const [gameMode, setGameMode] = useState(0); // 0=Normal, 1=MW, 2=MW+Intrus, 3=Spyfall
  const [mimerMode, setMimerMode] = useState(false);
  // Toggles pour Intrus et Mister White (mode Normal)
  const [numUndercovers, setNumUndercovers] = useState(1);
  const [numMisterWhites, setNumMisterWhites] = useState(0);
  const [easyMode, setEasyMode] = useState(false);
  const [spyfallUndercover, setSpyfallUndercover] = useState(false);
  const [numSpies, setNumSpies] = useState(1);

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

  // Synchroniser specialeGameMode avec les compteurs spéciaux
  useEffect(() => {
    if (specialeNumUndercovers > 0 && specialeNumMisterWhites > 0) setSpecialeGameMode(2);
    else if (specialeNumMisterWhites > 0) setSpecialeGameMode(1);
    else setSpecialeGameMode(0);
  }, [specialeNumUndercovers, specialeNumMisterWhites]);

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
  const [darkTheme, setDarkTheme] = useState(false);
  // Catégorie OBJETS débloquée ou non
  const [objectsUnlocked, setObjectsUnlocked] = useState(false);
  // Mots personnalisés pour la catégorie SPÉCIALE
  const [customWords, setCustomWords] = useState([]);
  const [newWord, setNewWord] = useState('');
  const [revealedWords, setRevealedWords] = useState({});
  const [isPlayOpening, setIsPlayOpening] = useState(false);
  const playOpenAnim = useRef(new Animated.Value(0)).current;
  const gameSetupAnim = useRef(new Animated.Value(0)).current;

  // Animations du bouton play
  const safeScale = useRef(new Animated.Value(1)).current;

  // Titre flicker
  const titleOpacity = useRef(new Animated.Value(1)).current;

  // Charger l'état de déblocage OBJETS et les mots personnalisés au démarrage
  useEffect(() => {
    const loadStates = async () => {
      try {
        const unlocked = await safeGetItem('objects_category_unlocked');
        if (unlocked === 'true') {
          setObjectsUnlocked(true);
        }
        const savedWords = await safeGetItem('speciale_custom_words');
        if (savedWords) {
          setCustomWords(JSON.parse(savedWords));
        }
        const theme = await safeGetItem('dark_theme');
        if (theme === 'true') {
          setDarkTheme(true);
          setGlobalDarkTheme(true);
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
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 800, easing: Easing.ease, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, easing: Easing.ease, useNativeDriver: true }),
      ])
    );
    pulseAnimRef.current.start();
  };

  // Animation titre flicker (60% opacity toutes les 5s)
  const startTitleFlicker = () => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(4250),
        Animated.timing(titleOpacity, { toValue: 0.6, duration: 200, useNativeDriver: true }),
        Animated.timing(titleOpacity, { toValue: 1, duration: 100, useNativeDriver: true }),
        Animated.timing(titleOpacity, { toValue: 0.6, duration: 200, useNativeDriver: true }),
        Animated.timing(titleOpacity, { toValue: 1, duration: 100, useNativeDriver: true }),
      ])
    );
    loop.start();
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
    startTitleFlicker();

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
          const savedWords = await safeGetItem('speciale_custom_words');
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
      safeScale.setValue(1);
      setShowRules(false);
      setShowSettings(false);
      setShowUnlockShop(false);
      setShowSpecialeMode(false);
      setShowCategories(false);
      setNumUndercovers(1);
      setNumMisterWhites(0);
      setNumSpies(1);
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

  const toggleTheme = () => {
    const newVal = !darkTheme;
    setDarkTheme(newVal);
    setGlobalDarkTheme(newVal);
    safeSetItem('dark_theme', newVal ? 'true' : 'false');
  };


  const handleStart = () => {
    playClick();
    setIsPlayOpening(true);
    if (pulseAnimRef.current) { pulseAnimRef.current.stop(); }

    // Animation : le bouton pulse puis disparaît → modal
    Animated.sequence([
      Animated.timing(safeScale, { toValue: 1.1, duration: 200, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      Animated.timing(safeScale, { toValue: 0.3, duration: 400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
    ]).start(() => {
      Animated.parallel([
        Animated.timing(playOpenAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
      ]).start(() => {
        setShowGameSetup(true);
      });
    });
  };

  const closeGameSetup = () => {
    playClick();
    safeScale.setValue(1);
    playOpenAnim.setValue(0);
    setIsPlayOpening(false);
    Animated.timing(gameSetupAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowGameSetup(false);
      gameSetupAnim.setValue(0);
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
      numUndercovers: gameMode === 3 ? (numSpies > 0 ? numSpies : numUndercovers) : numUndercovers,
      spyfallUndercover: gameMode === 3 ? (numUndercovers > 0 && numSpies === 0) : false,
      numMisterWhites,
      easyMode,
      spyfallUndercover,
      darkTheme,
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
        safeSetItem('objects_category_unlocked', 'true');
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
    await safeSetItem('speciale_custom_words', JSON.stringify(updatedWords));
    setNewWord('');
  };

  const handleRemoveWord = async (index) => {
    const updatedWords = customWords.filter((_, i) => i !== index);
    setCustomWords(updatedWords);
    await safeSetItem('speciale_custom_words', JSON.stringify(updatedWords));
  };

  const rules = RULES[lang];
  const currentCategories = lang === 'en' ? CATEGORIES_EN : CATEGORIES_FR;
  const theme = darkTheme ? {
    bg: '#0a0a0a',
    text: '#e8d5ff',
    textMuted: 'rgba(232,213,255,0.7)',
    textSub: '#e8d5ff',
    border: '#9b30ff',
    btnBg: 'rgba(155,48,255,0.15)',
    modalBg: '#1a0a2e',
    modalBorder: '#9b30ff',
    modalOverlay: 'rgba(10,5,30,0.85)',
    neon: '#b44dff',
    neonDark: '#9b30ff',
    neonGlow: 'rgba(180,77,255,0.4)',
    cardBg: 'rgba(155,48,255,0.08)',
    cardBorder: 'rgba(155,48,255,0.25)',
    cardActiveBg: '#9b30ff',
    cardActiveBorder: '#b44dff',
    inputBg: 'rgba(155,48,255,0.1)',
    inputBorder: 'rgba(155,48,255,0.3)',
    counterBg: 'rgba(155,48,255,0.08)',
    counterBorder: 'rgba(155,48,255,0.2)',
    counterBtnBg: 'rgba(155,48,255,0.15)',
    counterBtnBorder: 'rgba(155,48,255,0.3)',
    chipBg: 'rgba(155,48,255,0.12)',
    chipBorder: 'rgba(155,48,255,0.3)',
    chipActiveBg: '#9b30ff',
    closeBtnBg: '#9b30ff',
    closeBtnText: '#fff',
    launchBtnBg: '#9b30ff',
    launchBtnText: '#fff',
    ruleBg: 'rgba(155,48,255,0.08)',
    ruleBorder: 'rgba(155,48,255,0.2)',
    subtitleColor: 'rgba(232,213,255,0.6)',
  } : {
    bg: '#E5DFC8',
    text: '#1a1a1a',
    textMuted: '#333',
    textSub: '#1a1a1a',
    border: 'rgba(0,0,0,0.15)',
    btnBg: 'rgba(0,0,0,0.05)',
    modalBg: '#F5F5DC',
    modalBorder: '#1a1a1a',
    modalOverlay: 'rgba(0,0,0,0.3)',
    neon: '#1a1a1a',
    neonDark: '#1a1a1a',
    neonGlow: 'transparent',
    cardBg: '#F5F5DC',
    cardBorder: 'rgba(0,0,0,0.15)',
    cardActiveBg: '#1a1a1a',
    cardActiveBorder: '#1a1a1a',
    inputBg: 'rgba(0,0,0,0.05)',
    inputBorder: 'rgba(0,0,0,0.1)',
    counterBg: 'rgba(0,0,0,0.04)',
    counterBorder: 'rgba(0,0,0,0.08)',
    counterBtnBg: 'rgba(0,0,0,0.08)',
    counterBtnBorder: 'rgba(0,0,0,0.15)',
    chipBg: 'rgba(0,0,0,0.1)',
    chipBorder: 'rgba(0,0,0,0.2)',
    chipActiveBg: '#1a1a1a',
    closeBtnBg: '#1a1a1a',
    closeBtnText: '#F5F5DC',
    launchBtnBg: '#1a1a1a',
    launchBtnText: '#F5F5DC',
    ruleBg: 'rgba(0,0,0,0.05)',
    ruleBorder: 'rgba(0,0,0,0.15)',
    subtitleColor: '#666',
  };
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
    <View style={styles.rootWrapper}>
      {/* Menu principal */}
      <Animated.View style={[styles.fullContainer, { opacity: menuOpacity }]}>
        <View style={darkTheme ? styles.bgDark : styles.bgBeige}>
          <Image source={darkTheme ? require('../../assets/bg-sombre.jpg') : require('../../assets/bg-white.jpg')} style={styles.bgImage} resizeMode="cover" />
          <View style={darkTheme ? styles.bgGradientDark : styles.bgGradient} />

          {/* Drapeau langue en haut à gauche */}
          <TouchableOpacity
            style={[styles.langBtn, { top: insets.top + 12 }]}
            onPress={toggleLang}
            activeOpacity={0.7}
          >
            <Image
              source={lang === 'fr' ? require('../../assets/flag-fr.png') : require('../../assets/flag-uk.jpg')}
              style={[styles.flagImage, { borderColor: theme.border }]}
              resizeMode="cover"
            />
          </TouchableOpacity>

          {/* Zone centrale : titre + coffre */}
          <View style={[styles.centerArea, !darkTheme && styles.centerAreaLight]}>
            {/* Titre MOTS SECRETS */}
            <Animated.View style={[styles.titleArea, { opacity: titleOpacity }, !darkTheme && styles.titleAreaLight]}>
              {darkTheme ? (
                <Image source={require('../../assets/logo-title.png')} style={styles.logoTitle} resizeMode="contain" />
              ) : (
                <LogoTitleLight width={1500} height={500} />
              )}
            </Animated.View>

            {/* Sous-titre - positionné absolument pour ne pas affecter les autres éléments */}
            <Text style={[styles.subtitleAbsolute, { color: theme.textSub }]}>{lang === 'fr' ? 'TROUVEZ L\'INTRUS PARMI VOUS' : 'FIND THE IMPOSTOR AMONG YOU'}</Text>

            {/* Coffre-fort */}
            <Animated.View style={[
              styles.safeArea,
              !darkTheme && styles.safeAreaLight,
              {
                transform: [{ scale: isPlayOpening ? safeScale : pulseAnim }],
                opacity: isPlayOpening
                  ? playOpenAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] })
                  : 1,
              },
            ]}>
              <TouchableOpacity onPress={handleStart} activeOpacity={0.8} disabled={isPlayOpening}>
                {darkTheme ? (
                  <Image source={require('../../assets/play-btn.png')} style={styles.playBtnImage} resizeMode="contain" />
                ) : (
                  <PlayBtnLight width={250} height={250} />
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* Indice en bas */}
            {!isPlayOpening && (
              <Text style={[styles.hintText, { color: theme.textMuted }]}>
                {lang === 'fr' ? 'APPUYEZ SUR PLAY POUR COMMENCER' : 'PRESS PLAY TO START'}
              </Text>
            )}
          </View>

          {/* Barre du bas */}
          <Animated.View style={[
            styles.bottomBar,
            {
              bottom: insets.bottom + 16,
              opacity: isPlayOpening
                ? playOpenAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] })
                : 1,
            },
          ]}>
            <TouchableOpacity style={[styles.bottomBtn, { backgroundColor: theme.btnBg, borderColor: theme.border }]} onPress={() => { setRulesPage(0); setShowRules(true); }}>
              {darkTheme ? <ReglesIcon width={28} height={28} /> : <ReglesIconLight width={28} height={28} />}
            </TouchableOpacity>
            <TouchableOpacity style={[styles.bottomBtn, { backgroundColor: theme.btnBg, borderColor: theme.border }]} onPress={() => setShowSettings(true)}>
              {darkTheme ? <ParametreIcon width={28} height={28} /> : <ParametreIconLight width={28} height={28} />}
            </TouchableOpacity>
            <View style={styles.bottomBtnWrapper}>
              <View style={styles.adIconSmallContainer}>
                <Image source={AD_REWARD_ICON} style={styles.adIconSmall} resizeMode="contain" />
              </View>
              <TouchableOpacity style={[styles.bottomBtn, { backgroundColor: theme.btnBg, borderColor: theme.border }]} onPress={async () => {
                playClick();
                if (!isExpoGo) {
                  const rewarded = await loadAndShowRewardedAd(() => {});
                  if (!rewarded) return;
                }
                setSpecialeNumPlayers(3);
                setSpecialeGameMode(0);
                setShowSpecialeMode(true);
              }}>
                {darkTheme ? <SpecialeIcon width={28} height={28} /> : <SpecialeIconLight width={28} height={28} />}
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={[styles.bottomBtn, { backgroundColor: theme.btnBg, borderColor: theme.border }]} onPress={() => setShowUnlockShop(true)}>
              {darkTheme ? <BoutiqueIcon width={28} height={28} /> : <BoutiqueIconLight width={28} height={28} />}
            </TouchableOpacity>
          </Animated.View>

          {/* Version */}
          <Text style={[styles.versionText, { color: darkTheme ? 'rgba(245,245,220,0.2)' : 'rgba(26,26,26,0.15)' }]}>v1.0.9</Text>
        </View>
      </Animated.View>

      <Modal visible={showRules} animationType="slide" transparent onRequestClose={() => setShowRules(false)}>
        <View style={[styles.modalOverlay, { backgroundColor: theme.modalOverlay }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.modalBg, borderColor: theme.modalBorder }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>{lang === 'fr' ? 'RÈGLES' : 'RULES'}</Text>

            <View style={styles.rulePageContainer}>
              <TouchableOpacity
                style={[styles.ruleArrowBtn, { backgroundColor: theme.btnBg, borderColor: theme.border }, rulesPage === 0 && styles.ruleArrowBtnDisabled]}
                onPress={() => setRulesPage(p => Math.max(0, p - 1))}
                disabled={rulesPage === 0}
              >
                <Text style={[styles.ruleArrowText, { color: theme.text }]}>‹</Text>
              </TouchableOpacity>

              <View style={styles.rulePageContent}>
                {(() => {
                  const r = rules[rulesPage];
                  return (
                    <View style={[styles.ruleBlock, { backgroundColor: theme.ruleBg, borderColor: theme.ruleBorder }]}>
                      <Text style={[styles.ruleMode, { color: theme.neon }]}>{r.mode}</Text>
                      <Text style={[styles.ruleDesc, { color: theme.textMuted }]}>{r.desc}</Text>
                      {r.steps.map((s, j) => (
                        <View key={j} style={styles.ruleStep}><Text style={[styles.ruleStepText, { color: theme.textMuted }]}>{j + 1}. {s}</Text></View>
                      ))}
                    </View>
                  );
                })()}
              </View>

              <TouchableOpacity
                style={[styles.ruleArrowBtn, { backgroundColor: theme.btnBg, borderColor: theme.border }, rulesPage === rules.length - 1 && styles.ruleArrowBtnDisabled]}
                onPress={() => setRulesPage(p => Math.min(rules.length - 1, p + 1))}
                disabled={rulesPage === rules.length - 1}
              >
                <Text style={[styles.ruleArrowText, { color: theme.text }]}>›</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.ruleDots}>
              {rules.map((_, i) => (
                <TouchableOpacity key={i} onPress={() => setRulesPage(i)}>
                  <View style={[styles.ruleDot, { backgroundColor: i === rulesPage ? theme.neon : theme.border }]} />
                </TouchableOpacity>
              ))}
            </View>

            {(darkTheme && !isWeb) ? (
              <TouchableOpacity onPress={() => { setRulesPage(0); setShowRules(false); }} activeOpacity={0.8}>
                <ImageBackground source={LAUNCH_BTN} style={styles.launchBtnImage} resizeMode="stretch"><Text style={styles.launchBtnOverlayText}>{lang === 'fr' ? 'FERMER' : 'CLOSE'}</Text></ImageBackground>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => { setRulesPage(0); setShowRules(false); }} activeOpacity={0.8}>
                <ImageBackground source={LAUNCH_BTN_LIGHT} style={styles.launchBtnImage} resizeMode="stretch"><Text style={styles.launchBtnOverlayText}>{lang === 'fr' ? 'FERMER' : 'CLOSE'}</Text></ImageBackground>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={showSettings} animationType="slide" transparent onRequestClose={() => setShowSettings(false)}>
        <View style={[styles.modalOverlay, { backgroundColor: theme.modalOverlay }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.modalBg, borderColor: theme.modalBorder }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>{lang === 'fr' ? 'PARAMÈTRES' : 'SETTINGS'}</Text>
            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>{lang === 'fr' ? 'Langue' : 'Language'}</Text>
              <TouchableOpacity style={[styles.settingPill, { backgroundColor: theme.chipBg, borderColor: theme.chipBorder }]} onPress={toggleLang}>
                <Text style={[styles.settingPillText, { color: theme.text }]}>{lang === 'fr' ? '🇫🇷' : '🇬🇧'}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>{lang === 'fr' ? 'Musique' : 'Music'}</Text>
              <TouchableOpacity
                style={[styles.toggleBtn, musicOn && styles.toggleBtnActive, { backgroundColor: musicOn ? theme.neon : theme.counterBtnBg, borderColor: musicOn ? theme.neon : theme.counterBtnBorder }]}
                onPress={toggleMusic}
              >
                <Text style={[styles.toggleBtnText, { color: musicOn ? '#fff' : theme.text }]}>{musicOn ? 'ON' : 'OFF'}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>{lang === 'fr' ? 'Effets' : 'SFX'}</Text>
              <TouchableOpacity
                style={[styles.toggleBtn, sfxOn && styles.toggleBtnActive, { backgroundColor: sfxOn ? theme.neon : theme.counterBtnBg, borderColor: sfxOn ? theme.neon : theme.counterBtnBorder }]}
                onPress={toggleSfx}
              >
                <Text style={[styles.toggleBtnText, { color: sfxOn ? '#fff' : theme.text }]}>{sfxOn ? 'ON' : 'OFF'}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>{lang === 'fr' ? 'Thème sombre' : 'Dark theme'}</Text>
              <TouchableOpacity
                style={[styles.toggleBtn, darkTheme && styles.toggleBtnActive, { backgroundColor: darkTheme ? theme.neon : theme.counterBtnBg, borderColor: darkTheme ? theme.neon : theme.counterBtnBorder }]}
                onPress={toggleTheme}
              >
                <Text style={[styles.toggleBtnText, { color: darkTheme ? '#fff' : theme.text }]}>{darkTheme ? 'ON' : 'OFF'}</Text>
              </TouchableOpacity>
            </View>
            {(darkTheme && !isWeb) ? (
              <TouchableOpacity onPress={() => setShowSettings(false)} activeOpacity={0.8}>
                <ImageBackground source={LAUNCH_BTN} style={styles.launchBtnImage} resizeMode="stretch"><Text style={styles.launchBtnOverlayText}>{lang === 'fr' ? 'FERMER' : 'CLOSE'}</Text></ImageBackground>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => setShowSettings(false)} activeOpacity={0.8}>
                <ImageBackground source={LAUNCH_BTN_LIGHT} style={styles.launchBtnImage} resizeMode="stretch"><Text style={styles.launchBtnOverlayText}>{lang === 'fr' ? 'FERMER' : 'CLOSE'}</Text></ImageBackground>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal pour débloquer la catégorie OBJETS */}
      <Modal visible={showUnlockShop} animationType="slide" transparent onRequestClose={() => setShowUnlockShop(false)}>
        <View style={[styles.modalOverlay, { backgroundColor: theme.modalOverlay }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.modalBg, borderColor: theme.modalBorder }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>{lang === 'fr' ? 'BOUTIQUE' : 'SHOP'}</Text>
            <Text style={[styles.modalSubtitle, { color: theme.subtitleColor }]}>
              {lang === 'fr'
                ? 'Débloquez la catégorie OBJETS avec une publicité !'
                : 'Unlock the OBJECTS category with a rewarded ad!'}
            </Text>

            {/* Catégorie OBJETS */}
            <View style={[styles.unlockItem, { backgroundColor: theme.cardBg, borderColor: theme.neon }]}>
              <View style={styles.unlockItemHeader}>
                <Text style={styles.unlockItemIcon}>📦</Text>
                <View style={styles.unlockItemInfo}>
                  <Text style={[styles.unlockItemTitle, { color: theme.text }]}>{lang === 'fr' ? 'OBJETS' : 'OBJECTS'}</Text>
                  <Text style={[styles.unlockItemDesc, { color: theme.textMuted }]}>
                    {lang === 'fr'
                      ? 'Catégorie spéciale avec des objets du quotidien'
                      : 'Special category with everyday objects'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.unlockBtn, objectsUnlocked && styles.unlockBtnOwned, !objectsUnlocked && { backgroundColor: theme.neon }]}
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
                      safeSetItem('objects_category_unlocked', 'true');
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

            {(darkTheme && !isWeb) ? (
              <TouchableOpacity onPress={() => setShowUnlockShop(false)} activeOpacity={0.8}>
                <ImageBackground source={LAUNCH_BTN} style={styles.launchBtnImage} resizeMode="stretch"><Text style={styles.launchBtnOverlayText}>{lang === 'fr' ? 'FERMER' : 'CLOSE'}</Text></ImageBackground>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => setShowUnlockShop(false)} activeOpacity={0.8}>
                <ImageBackground source={LAUNCH_BTN_LIGHT} style={styles.launchBtnImage} resizeMode="stretch"><Text style={styles.launchBtnOverlayText}>{lang === 'fr' ? 'FERMER' : 'CLOSE'}</Text></ImageBackground>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal pour le mode SPÉCIALE (bouton étoile) - mode Undercover */}
      <Modal visible={showSpecialeMode} animationType="slide" transparent onRequestClose={() => setShowSpecialeMode(false)}>
        <View style={[styles.modalOverlay, { backgroundColor: theme.modalOverlay }]}>
          <View style={[styles.modalContent, { maxHeight: '90%', backgroundColor: theme.modalBg, borderColor: theme.modalBorder }]}>
            <Text style={[styles.modalTitle, { color: theme.neon }]}>⭐ SPÉCIALE</Text>
            <Text style={[styles.modalSubtitle, { color: theme.subtitleColor }]}>
              {lang === 'fr'
                ? 'Trouvez l\'intrus parmi vous'
                : 'Find the undercover among you'}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Section: Nombre de joueurs */}
              <View style={styles.setupSection}>
                <Text style={[styles.setupLabel, { color: theme.text }]}>{lang === 'fr' ? 'Nombre de joueurs' : 'Number of players'}</Text>
                <ModeSlider
                  value={specialeNumPlayers}
                  onValueChange={setSpecialeNumPlayers}
                  min={3}
                  max={20}
                  themeColors={theme}
                />
              </View>

              {/* Section: Compteurs de rôles */}
              <View style={styles.setupSection}>
                <View style={styles.roleCounters}>
                  <View style={[styles.roleCounterRow, { backgroundColor: theme.counterBg, borderColor: theme.counterBorder }]}>
                    <Image source={MODE_IMAGES.normal} style={styles.roleCounterIcon} resizeMode="contain" />
                    <Text style={[styles.roleCounterLabel, { color: theme.textMuted }]}>{lang === 'fr' ? 'Intrus' : 'Undercover'}</Text>
                    <View style={styles.roleCounterControls}>
                      <TouchableOpacity style={[styles.roleCounterBtn, { backgroundColor: theme.counterBtnBg, borderColor: theme.counterBtnBorder }]} onPress={() => { playClick(); setSpecialeNumUndercovers(v => Math.max(1, v - 1)); }}><Text style={[styles.roleCounterBtnText, { color: theme.text }]}>-</Text></TouchableOpacity>
                      <Text style={[styles.roleCounterVal, { color: theme.neon }]}>{specialeNumUndercovers}</Text>
                      <TouchableOpacity style={[styles.roleCounterBtn, (specialeNumUndercovers + 1 + specialeNumMisterWhites) > Math.floor(specialeNumPlayers / 3) && styles.roleCounterBtnDisabled, { backgroundColor: theme.counterBtnBg, borderColor: theme.counterBtnBorder }]} onPress={() => { playClick(); if ((specialeNumUndercovers + 1 + specialeNumMisterWhites) <= Math.floor(specialeNumPlayers / 3)) setSpecialeNumUndercovers(v => v + 1); }} disabled={(specialeNumUndercovers + 1 + specialeNumMisterWhites) > Math.floor(specialeNumPlayers / 3)}><Text style={[styles.roleCounterBtnText, { color: theme.text }]}>+</Text></TouchableOpacity>
                    </View>
                  </View>
                  <View style={[styles.roleCounterRow, { backgroundColor: theme.counterBg, borderColor: theme.counterBorder }]}>
                    <Image source={ROLE_MISTERWHITE} style={styles.roleCounterIcon} resizeMode="contain" />
                    <Text style={[styles.roleCounterLabel, { color: theme.textMuted }]}>Mister White</Text>
                    <View style={styles.roleCounterControls}>
                      <TouchableOpacity style={[styles.roleCounterBtn, { backgroundColor: theme.counterBtnBg, borderColor: theme.counterBtnBorder }]} onPress={() => { playClick(); setSpecialeNumMisterWhites(v => Math.max(0, v - 1)); }}><Text style={[styles.roleCounterBtnText, { color: theme.text }]}>-</Text></TouchableOpacity>
                      <Text style={[styles.roleCounterVal, { color: theme.neon }]}>{specialeNumMisterWhites}</Text>
                      <TouchableOpacity style={[styles.roleCounterBtn, (specialeNumUndercovers + specialeNumMisterWhites + 1) > Math.floor(specialeNumPlayers / 3) && styles.roleCounterBtnDisabled, { backgroundColor: theme.counterBtnBg, borderColor: theme.counterBtnBorder }]} onPress={() => { playClick(); if ((specialeNumUndercovers + specialeNumMisterWhites + 1) <= Math.floor(specialeNumPlayers / 3)) setSpecialeNumMisterWhites(v => v + 1); }} disabled={(specialeNumUndercovers + specialeNumMisterWhites + 1) > Math.floor(specialeNumPlayers / 3)}><Text style={[styles.roleCounterBtnText, { color: theme.text }]}>+</Text></TouchableOpacity>
                    </View>
                  </View>
                </View>

                {specialeGameMode === 2 && specialeNumPlayers < 4 && (
                  <Text style={styles.warningText}>⚠️ {lang === 'fr' ? '4 joueurs minimum' : '4 players minimum'}</Text>
                )}
              </View>

              {/* Section: Mots personnalisés */}
              <View style={styles.setupSection}>
                <Text style={[styles.setupLabel, { color: theme.text }]}>{lang === 'fr' ? 'Mots personnalisés' : 'Custom words'}</Text>
                <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                  <TextInput
                    style={[styles.wordInput, { flex: 1, fontFamily: 'SpaceMono', fontSize: 13, borderWidth: 1, borderColor: theme.inputBorder, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, color: theme.text, backgroundColor: theme.inputBg }]}
                    value={newWord}
                    onChangeText={setNewWord}
                    placeholder={lang === 'fr' ? 'Ajouter un mot...' : 'Add a word...'}
                    placeholderTextColor={darkTheme ? 'rgba(232,213,255,0.4)' : '#999'}
                    maxLength={30}
                  />
                  <TouchableOpacity
                    style={[styles.addWordBtn, !newWord.trim() && styles.addWordBtnDisabled, { backgroundColor: theme.neon }]}
                    onPress={() => { handleAddWord(); }}
                    disabled={!newWord.trim()}
                  >
                    <Text style={styles.addWordBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
                {customWords.length > 0 && (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                    {customWords.map((word, i) => (
                      <View key={i} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.btnBg, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: theme.cardBorder }}>
                        <Text style={{ fontFamily: 'SpaceMono', fontSize: 12, color: theme.text, letterSpacing: 2 }}>
                          {revealedWords[i] ? word : '•'.repeat(word.length)}
                        </Text>
                        <TouchableOpacity onPress={() => setRevealedWords(prev => ({ ...prev, [i]: !prev[i] }))} style={{ marginLeft: 6 }}>
                          <Text style={{ fontSize: 14 }}>{revealedWords[i] ? '🙈' : '👁️'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleRemoveWord(i)} style={{ marginLeft: 4 }}>
                          <Text style={{ color: '#ff4444', fontSize: 14, fontWeight: 'bold' }}>×</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {/* Bouton Lancer la partie */}
              {(darkTheme && !isWeb) ? (
                <TouchableOpacity
                  onPress={async () => {
                    if (specialeGameMode === 2 && specialeNumPlayers < 4) return;
                    if (customWords.length === 0) {
                      alert(lang === 'fr'
                        ? 'Ajoutez au moins 1 mot personnalisé pour lancer la partie.'
                        : 'Add at least 1 custom word to start the game.');
                      return;
                    }
                    playClick();
                    setShowSpecialeMode(false);

                    navigation.navigate('Prep', {
                      numPlayers: specialeNumPlayers,
                      gameMode: specialeGameMode,
                      selectedCategory: 'SPECIALE',
                      customWords,
                      numUndercovers: specialeNumUndercovers,
                      numMisterWhites: specialeNumMisterWhites,
                      darkTheme,
                    });
                  }}
                  activeOpacity={0.8}
                >
                  <ImageBackground source={LAUNCH_BTN} style={styles.launchBtnImage} resizeMode="stretch"><Text style={styles.launchBtnOverlayText}>{lang === 'fr' ? 'LANCER LA PARTIE' : 'START GAME'}</Text></ImageBackground>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={async () => {
                    if (specialeGameMode === 2 && specialeNumPlayers < 4) return;
                    if (customWords.length === 0) {
                      alert(lang === 'fr'
                        ? 'Ajoutez au moins 1 mot personnalisé pour lancer la partie.'
                        : 'Add at least 1 custom word to start the game.');
                      return;
                    }
                    playClick();
                    setShowSpecialeMode(false);

                    navigation.navigate('Prep', {
                      numPlayers: specialeNumPlayers,
                      gameMode: specialeGameMode,
                      selectedCategory: 'SPECIALE',
                      customWords,
                      numUndercovers: specialeNumUndercovers,
                      numMisterWhites: specialeNumMisterWhites,
                      darkTheme,
                    });
                  }}
                  activeOpacity={0.8}
                  disabled={specialeGameMode === 2 && specialeNumPlayers < 4}
                >
                  <ImageBackground source={LAUNCH_BTN_LIGHT} style={styles.launchBtnImage} resizeMode="stretch"><Text style={styles.launchBtnOverlayText}>{lang === 'fr' ? 'LANCER LA PARTIE' : 'START GAME'}</Text></ImageBackground>
                </TouchableOpacity>
              )}
            </ScrollView>

            {(darkTheme && !isWeb) ? (
              <TouchableOpacity onPress={() => setShowSpecialeMode(false)} activeOpacity={0.8}>
                <ImageBackground source={LAUNCH_BTN} style={styles.launchBtnImage} resizeMode="stretch"><Text style={styles.launchBtnOverlayText}>{lang === 'fr' ? 'FERMER' : 'CLOSE'}</Text></ImageBackground>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={() => setShowSpecialeMode(false)} activeOpacity={0.8}>
                <ImageBackground source={LAUNCH_BTN_LIGHT} style={styles.launchBtnImage} resizeMode="stretch"><Text style={styles.launchBtnOverlayText}>{lang === 'fr' ? 'FERMER' : 'CLOSE'}</Text></ImageBackground>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      <Modal visible={showGameSetup} animationType="slide" transparent onRequestClose={closeGameSetup}>
        <View style={[styles.modalOverlay, { backgroundColor: theme.modalOverlay }]} collapsable={false}>
          <View style={[styles.modalContent, { maxHeight: '90%', backgroundColor: theme.modalBg, borderColor: theme.modalBorder }]} collapsable={false}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>{lang === 'fr' ? 'CONFIGURATION' : 'CONFIGURATION'}</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.setupSection}>
                <Text style={[styles.setupLabel, { color: theme.text }]}>{lang === 'fr' ? 'Nombre de joueurs' : 'Number of players'}</Text>
                <ModeSlider
                  value={numPlayers}
                  onValueChange={setNumPlayers}
                  min={3}
                  max={20}
                  themeColors={theme}
                />
              </View>

              <View style={styles.setupSection}>
                <Text style={[styles.setupLabel, { color: theme.text }]}>{lang === 'fr' ? 'Mode de jeu' : 'Game mode'}</Text>

                <View style={styles.modeGrid}>
                  <TouchableOpacity
                    style={[styles.modeCard, { backgroundColor: (!mimerMode && gameMode !== 3) ? theme.cardActiveBg : theme.cardBg, borderColor: (!mimerMode && gameMode !== 3) ? theme.cardActiveBorder : theme.cardBorder }]}
                    onPress={() => {
                      playClick();
                      setMimerMode(false);
                      setGameMode(numUndercovers > 0 && numMisterWhites > 0 ? 2 : numMisterWhites > 0 ? 1 : 0);
                    }}
                    activeOpacity={0.7}
                  >
                    <Image source={ROLE_UNDERCOVER} style={styles.modeCardImage} resizeMode="contain" />
                    <Text style={[styles.modeCardTitle, { color: (!mimerMode && gameMode !== 3) ? '#fff' : theme.text }]}>UNDERCOVER</Text>
                    <Text style={[styles.modeCardDesc, { color: (!mimerMode && gameMode !== 3) ? 'rgba(255,255,255,0.7)' : theme.textMuted }]}>{lang === 'fr' ? 'Intrus + Mister White' : 'Undercover + Mister White'}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modeCard, { backgroundColor: gameMode === 3 ? theme.cardActiveBg : theme.cardBg, borderColor: gameMode === 3 ? theme.cardActiveBorder : theme.cardBorder }]}
                    onPress={() => {
                      playClick();
                      setSelectedCategory(lang === 'fr' ? 'LIEUX' : 'LOCATIONS');
                      setMimerMode(false);
                      setNumUndercovers(1);
                      setNumMisterWhites(0);
                      setNumSpies(1);
                      setNumUndercovers(0);
                      setSpyfallUndercover(false);
                      setSelectedCategory(lang === 'fr' ? 'LIEUX' : 'LOCATIONS');
                      setGameMode(3);
                    }}
                    activeOpacity={0.7}
                  >
                    <Image source={MODE_IMAGES.spyfall} style={styles.modeCardImage} resizeMode="contain" />
                    <Text style={[styles.modeCardTitle, { color: gameMode === 3 ? '#fff' : theme.text }]}>{t('modeSpyfall')}</Text>
                    <Text style={[styles.modeCardDesc, { color: gameMode === 3 ? 'rgba(255,255,255,0.7)' : theme.textMuted }]}>
                      {lang === 'fr' ? 'Espion + Intrus' : 'Spy + Undercover'}
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.modeCardOuter}>
                    {!mimerMode && <Image source={AD_REWARD_ICON} style={styles.modeCardAdBadge} resizeMode="contain" />}
                    <TouchableOpacity
                      style={[styles.modeCard, { width: '100%', backgroundColor: mimerMode ? theme.cardActiveBg : theme.cardBg, borderColor: mimerMode ? theme.cardActiveBorder : theme.cardBorder }]}
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
                      <Text style={[styles.modeCardTitle, { color: mimerMode ? '#fff' : theme.text }]}>{t('modeMimer')}</Text>
                      <Text style={[styles.modeCardDesc, { color: mimerMode ? 'rgba(255,255,255,0.7)' : theme.textMuted }]}>{t('modeMimerDesc')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {!mimerMode && selectedCategory !== 'SPECIALE' && (
                  <View style={styles.roleCounters}>
                    {gameMode === 3 ? (
                      <View>
                        <View style={[styles.roleCounterRow, { backgroundColor: theme.counterBg, borderColor: theme.counterBorder }]}>
                          <Text style={styles.roleCounterEmoji}>{"🕵️"}</Text>
                          <Text style={[styles.roleCounterLabel, { color: theme.textMuted }]}>{lang === 'fr' ? 'Espion' : 'Spy'}</Text>
                          <View style={styles.roleCounterControls}>
                            <TouchableOpacity style={[styles.roleCounterBtn, { backgroundColor: theme.counterBtnBg, borderColor: theme.counterBtnBorder }]} onPress={() => { playClick(); setNumSpies(v => Math.max(0, v - 1)); }}><Text style={[styles.roleCounterBtnText, { color: theme.text }]}>-</Text></TouchableOpacity>
                            <Text style={[styles.roleCounterVal, { color: theme.neon }]}>{numSpies}</Text>
                            <TouchableOpacity style={[styles.roleCounterBtn, !canAddUC && styles.roleCounterBtnDisabled, { backgroundColor: theme.counterBtnBg, borderColor: theme.counterBtnBorder }]} onPress={() => { playClick(); if (canAddUC) setNumSpies(v => v + 1); }} disabled={!canAddUC}><Text style={[styles.roleCounterBtnText, { color: theme.text }]}>+</Text></TouchableOpacity>
                          </View>
                        </View>
                        <View style={[styles.roleCounterRow, { backgroundColor: theme.counterBg, borderColor: theme.counterBorder }]}>
                          <Image source={MODE_IMAGES.normal} style={styles.roleCounterIcon} resizeMode="contain" />
                          <Text style={[styles.roleCounterLabel, { color: theme.textMuted }]}>{lang === 'fr' ? 'Intrus' : 'Undercover'}</Text>
                          <View style={styles.roleCounterControls}>
                            <TouchableOpacity style={[styles.roleCounterBtn, { backgroundColor: theme.counterBtnBg, borderColor: theme.counterBtnBorder }]} onPress={() => { playClick(); setNumUndercovers(v => Math.max(0, v - 1)); }}><Text style={[styles.roleCounterBtnText, { color: theme.text }]}>-</Text></TouchableOpacity>
                            <Text style={[styles.roleCounterVal, { color: theme.neon }]}>{numUndercovers}</Text>
                            <TouchableOpacity style={[styles.roleCounterBtn, !canAddUC && styles.roleCounterBtnDisabled, { backgroundColor: theme.counterBtnBg, borderColor: theme.counterBtnBorder }]} onPress={() => { playClick(); if (canAddUC) setNumUndercovers(v => v + 1); }} disabled={!canAddUC}><Text style={[styles.roleCounterBtnText, { color: theme.text }]}>+</Text></TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    ) : (
                      <View>
                        <View style={[styles.roleCounterRow, { backgroundColor: theme.counterBg, borderColor: theme.counterBorder }]}>
                          <Image source={MODE_IMAGES.normal} style={styles.roleCounterIcon} resizeMode="contain" />
                          <Text style={[styles.roleCounterLabel, { color: theme.textMuted }]}>{lang === 'fr' ? 'Intrus' : 'Undercover'}</Text>
                          <View style={styles.roleCounterControls}>
                            <TouchableOpacity style={[styles.roleCounterBtn, { backgroundColor: theme.counterBtnBg, borderColor: theme.counterBtnBorder }]} onPress={() => { playClick(); setNumUndercovers(v => Math.max(0, v - 1)); }}><Text style={[styles.roleCounterBtnText, { color: theme.text }]}>-</Text></TouchableOpacity>
                            <Text style={[styles.roleCounterVal, { color: theme.neon }]}>{numUndercovers}</Text>
                            <TouchableOpacity style={[styles.roleCounterBtn, !canAddUC && styles.roleCounterBtnDisabled, { backgroundColor: theme.counterBtnBg, borderColor: theme.counterBtnBorder }]} onPress={() => { playClick(); if (canAddUC) setNumUndercovers(v => v + 1); }} disabled={!canAddUC}><Text style={[styles.roleCounterBtnText, { color: theme.text }]}>+</Text></TouchableOpacity>
                          </View>
                        </View>
                        <View style={[styles.roleCounterRow, { backgroundColor: theme.counterBg, borderColor: theme.counterBorder }]}>
                          <Image source={ROLE_MISTERWHITE} style={styles.roleCounterIcon} resizeMode="contain" />
                          <Text style={[styles.roleCounterLabel, { color: theme.textMuted }]}>Mister White</Text>
                          <View style={styles.roleCounterControls}>
                            <TouchableOpacity style={[styles.roleCounterBtn, { backgroundColor: theme.counterBtnBg, borderColor: theme.counterBtnBorder }]} onPress={() => { playClick(); setNumMisterWhites(v => Math.max(0, v - 1)); }}><Text style={[styles.roleCounterBtnText, { color: theme.text }]}>-</Text></TouchableOpacity>
                            <Text style={[styles.roleCounterVal, { color: theme.neon }]}>{numMisterWhites}</Text>
                            <TouchableOpacity style={[styles.roleCounterBtn, !canAddMW && styles.roleCounterBtnDisabled, { backgroundColor: theme.counterBtnBg, borderColor: theme.counterBtnBorder }]} onPress={() => { playClick(); if (canAddMW) setNumMisterWhites(v => v + 1); }} disabled={!canAddMW}><Text style={[styles.roleCounterBtnText, { color: theme.text }]}>+</Text></TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    )}
                  </View>
                )}

                {numMisterWhites > 0 && !mimerMode && gameMode !== 3 && (
                  <View style={[styles.easyModeRow, { backgroundColor: theme.counterBg, borderColor: theme.counterBorder }]}>
                    <View style={styles.easyModeInfo}>
                      <Text style={[styles.easyModeLabel, { color: theme.text }]}>{lang === 'fr' ? 'Facile' : 'Easy'}</Text>
                      <Text style={[styles.easyModeDesc, { color: theme.textMuted }]}>{lang === 'fr' ? 'Mister White connait la categorie' : 'Mister White knows the category'}</Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.toggleBtn, easyMode && styles.toggleBtnActive, { backgroundColor: easyMode ? theme.neon : theme.counterBtnBg, borderColor: easyMode ? theme.neon : theme.counterBtnBorder }]}
                      onPress={() => { playClick(); setEasyMode(!easyMode); }}
                    >
                      <Text style={[styles.toggleBtnText, { color: easyMode ? '#fff' : theme.text }]}>{easyMode ? 'ON' : 'OFF'}</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {gameMode === 2 && !mimerMode && numPlayers < 4 && (
                  <Text style={styles.warningText}>{lang === 'fr' ? '4 joueurs minimum' : '4 players minimum'}</Text>
                )}
              </View>

              {!mimerMode && gameMode !== 3 && (
                <View style={styles.setupSection}>
                  <Text style={[styles.setupLabel, { color: theme.text }]}>{lang === 'fr' ? 'Categorie' : 'Category'}</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScrollHorizontal}>
                    <TouchableOpacity
                      style={[styles.categoryChip, selectedCategory === null ? { backgroundColor: theme.chipActiveBg, borderColor: theme.chipActiveBg } : { backgroundColor: theme.chipBg, borderColor: theme.chipBorder }]}
                      onPress={() => { playClick(); setSelectedCategory(null); }}
                    >
                      <Text style={styles.categoryChipEmoji}>🎲</Text>
                      <Text style={[styles.categoryChipText, selectedCategory === null && { color: '#fff' }, selectedCategory !== null && { color: theme.text }]}>
                        {lang === 'fr' ? 'Aleatoire' : 'Random'}
                      </Text>
                    </TouchableOpacity>
                    {categoryKeys.map(cat => {
                      const isSpeciale = cat === 'SPECIALE';
                      const isObjects = cat === 'OBJECTS' || cat === 'OBJETS';
                      const showAdIndicator = (isSpeciale && customWords.length > 0) || (isObjects && !objectsUnlocked);
                      const emoji = CATEGORY_EMOJIS[cat] || '📌';
                      return (
                        <View key={cat} style={styles.categoryWrapper}>
                          {!isExpoGo && showAdIndicator && <Image source={AD_REWARD_ICON} style={styles.adRewardIconSmall} resizeMode="contain" />}
                          <TouchableOpacity
                            style={[styles.categoryChip, selectedCategory === cat ? { backgroundColor: theme.chipActiveBg, borderColor: theme.chipActiveBg } : { backgroundColor: theme.chipBg, borderColor: theme.chipBorder }]}
                            onPress={() => handleCategorySelect(cat)}
                          >
                            <Text style={styles.categoryChipEmoji}>{emoji}</Text>
                            <Text style={[styles.categoryChipText, selectedCategory === cat && { color: '#fff' }, selectedCategory !== cat && { color: theme.text }]}>
                              {CATEGORY_NAMES[lang][cat] || cat}
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
                  <Text style={[styles.setupLabel, { color: theme.text }]}>{lang === 'fr' ? 'Mode MIMER active' : 'MIME Mode enabled'}</Text>
                  <View style={[styles.mimerInfoBox, { backgroundColor: theme.cardBg, borderColor: theme.neon }]}>
                    <Text style={[styles.mimerInfoText, { color: theme.neon }]}>{lang === 'fr' ? 'Des paires d images a mimer' : 'Image pairs to mime'}</Text>
                  </View>
                </View>
              )}

              {gameMode === 3 && !mimerMode && (
                <View style={styles.setupSection}>
                  <Text style={[styles.setupLabel, { color: theme.text }]}>{lang === 'fr' ? 'Categorie' : 'Category'}</Text>
                  <View style={styles.categoryScrollHorizontal}>
                    <TouchableOpacity
                      style={[styles.categoryChip, (selectedCategory === null || selectedCategory === 'LIEUX' || selectedCategory === 'LOCATIONS') ? { backgroundColor: theme.chipActiveBg, borderColor: theme.chipActiveBg } : { backgroundColor: theme.chipBg, borderColor: theme.chipBorder }]}
                      onPress={() => { playClick(); setSelectedCategory(lang === 'fr' ? 'LIEUX' : 'LOCATIONS'); }}
                    >
                      <Text style={styles.categoryChipEmoji}>🏠</Text>
                      <Text style={[styles.categoryChipText, (selectedCategory === null || selectedCategory === 'LIEUX' || selectedCategory === 'LOCATIONS') ? { color: '#fff' } : { color: theme.text }]}>
                        {lang === 'fr' ? 'LIEUX' : 'LOCATIONS'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.categoryChip, (selectedCategory === 'GROUPES' || selectedCategory === 'GROUPS') ? { backgroundColor: theme.chipActiveBg, borderColor: theme.chipActiveBg } : { backgroundColor: theme.chipBg, borderColor: theme.chipBorder }]}
                      onPress={() => { playClick(); setSelectedCategory(lang === 'fr' ? 'GROUPES' : 'GROUPS'); }}
                    >
                      <Text style={styles.categoryChipEmoji}>👥</Text>
                      <Text style={[styles.categoryChipText, (selectedCategory === 'GROUPES' || selectedCategory === 'GROUPS') ? { color: '#fff' } : { color: theme.text }]}>
                        {lang === 'fr' ? 'GROUPES' : 'GROUPS'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </ScrollView>

            {(darkTheme && !isWeb) ? (
              <TouchableOpacity
                onPress={handleLaunchGame}
                disabled={gameMode === 2 && numPlayers < 4}
                activeOpacity={0.8}
              >
                <ImageBackground source={LAUNCH_BTN} style={styles.launchBtnImage} resizeMode="stretch"><Text style={styles.launchBtnOverlayText}>{lang === 'fr' ? 'LANCER LA PARTIE' : 'START GAME'}</Text></ImageBackground>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handleLaunchGame}
                disabled={gameMode === 2 && numPlayers < 4}
                activeOpacity={0.8}
              >
                <ImageBackground source={LAUNCH_BTN_LIGHT} style={styles.launchBtnImage} resizeMode="stretch"><Text style={styles.launchBtnOverlayText}>{lang === 'fr' ? 'LANCER LA PARTIE' : 'START GAME'}</Text></ImageBackground>
              </TouchableOpacity>
            )}

            {(darkTheme && !isWeb) ? (
              <TouchableOpacity onPress={closeGameSetup} activeOpacity={0.8}>
                <ImageBackground source={LAUNCH_BTN} style={styles.launchBtnImage} resizeMode="stretch"><Text style={styles.launchBtnOverlayText}>{lang === 'fr' ? 'FERMER' : 'CLOSE'}</Text></ImageBackground>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={closeGameSetup} activeOpacity={0.8}>
                <ImageBackground source={LAUNCH_BTN_LIGHT} style={styles.launchBtnImage} resizeMode="stretch"><Text style={styles.launchBtnOverlayText}>{lang === 'fr' ? 'FERMER' : 'CLOSE'}</Text></ImageBackground>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>


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
    </View>
  );
}

const styles = StyleSheet.create({
  rootWrapper: { flex: 1 },
  fullContainer: { flex: 1 },
  loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5DC', zIndex: 100 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5DC' },
  loadingLogo: { width: 100, height: 100, marginBottom: 20 },
  loadingTitle: { fontFamily: 'BebasNeue', fontSize: 32, color: '#1a1a1a', letterSpacing: 3, marginBottom: 30 },
  loadingBarContainer: { width: 200, height: 4, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 2, overflow: 'hidden' },
  loadingBar: { height: '100%', backgroundColor: '#1a1a1a' },
  loadingText: { fontFamily: 'SpaceMono', fontSize: 14, color: '#333', marginTop: 10 },

  // ─── Background ───
  bgBeige: { flex: 1, backgroundColor: '#E5DFC8' },
  bgDark: { flex: 1, backgroundColor: '#0a0a0a' },
  bgGradient: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(180,150,80,0.10)' },
  bgGradientDark: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.15)' },
  bgImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' },

  // ─── Mots flottants ───

  // ─── Drapeau langue ───
  langBtn: { position: 'absolute', left: 16, zIndex: 20 },
  flagImage: { width: 52, height: 36, borderRadius: 8, borderWidth: 2.5, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 6 },

  // ─── Zone centrale ───
  centerArea: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60, paddingBottom: 100 },
  centerAreaLight: { justifyContent: 'flex-start', paddingTop: 40 },

  // ─── Titre ───
  titleArea: { alignItems: 'center', marginBottom: 0 },
  titleAreaLight: { marginBottom: 10 },
  logoTitle: { width: 750, height: 250, resizeMode: 'contain' },
  subtitle: { fontFamily: 'SpaceMono', fontSize: 9, letterSpacing: 3, marginTop: 0 },
  subtitleAbsolute: { position: 'absolute', top: '55%', left: 0, right: 0, textAlign: 'center', fontFamily: 'SpaceMono', fontSize: 11, letterSpacing: 3, fontWeight: 'bold' },

  // ─── Bouton Play ───
  safeArea: { alignItems: 'center', justifyContent: 'center' },
  safeAreaLight: { marginTop: -175 },
  playBtnImage: { width: 200, height: 200 },


  // ─── Indice ───
  hintText: { fontFamily: 'SpaceMono', fontSize: 11, letterSpacing: 3, marginTop: 16, fontWeight: 'bold' },

  // ─── Barre du bas ───
  bottomBar: { position: 'absolute', left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 12 },
  bottomBtn: { width: 46, height: 46, borderRadius: 10, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  bottomBtnWrapper: { alignItems: 'center' },
  adIconSmallContainer: { position: 'absolute', top: -12, zIndex: 10 },
  adIconSmall: { width: 24, height: 24 },

  // ─── Version ───
  versionText: { position: 'absolute', bottom: 8, right: 16, fontFamily: 'SpaceMono', fontSize: 8, letterSpacing: 2 },

  // ─── Modals (existants, inchangés) ───
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
  modalContent: { width: '85%', backgroundColor: '#F5F5DC', borderRadius: 20, padding: 16, borderWidth: 2, borderColor: '#1a1a1a', maxHeight: '85%' },
  modalTitle: { fontFamily: 'BebasNeue', fontSize: 24, color: '#1a1a1a', letterSpacing: 2, textAlign: 'center', marginBottom: 10 },
  modalSubtitle: { fontFamily: 'SpaceMono', fontSize: 11, color: '#666', textAlign: 'center', marginBottom: 16 },
  closeBtn: { backgroundColor: '#1a1a1a', paddingVertical: 12, paddingHorizontal: 32, alignItems: 'center', borderRadius: 15 },
  closeBtnText: { fontFamily: 'BebasNeue', fontSize: 18, color: '#F5F5DC', letterSpacing: 2 },
  rulePageContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rulePageContent: { flex: 1 },
  ruleArrowBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
  ruleArrowBtnDisabled: { opacity: 0.25 },
  ruleArrowText: { fontFamily: 'BebasNeue', fontSize: 28, color: '#1a1a1a' },
  ruleBlock: { borderWidth: 1, borderColor: 'rgba(0,0,0,0.15)', padding: 16, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.05)' },
  ruleMode: { fontFamily: 'BebasNeue', fontSize: 22, color: '#1a1a1a', marginBottom: 6 },
  ruleDesc: { fontFamily: 'SpaceMono', fontSize: 12, color: '#333', marginBottom: 12 },
  ruleStep: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  ruleStepText: { fontFamily: 'SpaceMono', fontSize: 12, color: '#333', flex: 1 },
  ruleDots: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingVertical: 10 },
  ruleDot: { width: 8, height: 8, borderRadius: 4 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 },
  settingLabel: { fontFamily: 'SpaceMono', fontSize: 11, color: '#333' },
  settingPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.1)', borderWidth: 1, borderColor: '#1a1a1a' },
  settingPillText: { fontFamily: 'BebasNeue', fontSize: 14, color: '#1a1a1a' },
  toggleBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.15)', borderWidth: 2, borderColor: 'rgba(0,0,0,0.3)' },
  toggleBtnActive: { backgroundColor: '#1a1a1a', borderColor: '#1a1a1a' },
  toggleBtnText: { fontFamily: 'SpaceMono', fontSize: 11, color: '#F5F5DC', fontWeight: 'bold' },
  toggleBtnDisabled: { opacity: 0.3 },
  modeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginTop: 6 },
  modeCard: { width: '47%', backgroundColor: '#F5F5DC', borderWidth: 1.5, borderColor: 'rgba(0,0,0,0.15)', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 6, alignItems: 'center', gap: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  modeCardActive: { backgroundColor: '#1a1a1a', borderColor: '#1a1a1a', shadowOpacity: 0.4, shadowRadius: 6, elevation: 8 },
  modeCardImage: { width: '85%', height: 40, marginBottom: 2 },
  modeCardTitle: { fontFamily: 'BebasNeue', fontSize: 13, color: '#1a1a1a', letterSpacing: 1, textAlign: 'center' },
  modeCardTitleActive: { color: '#F5F5DC' },
  modeCardDesc: { fontFamily: 'SpaceMono', fontSize: 7, color: '#666', textAlign: 'center', lineHeight: 10 },
  modeCardDescActive: { color: 'rgba(245,245,220,0.7)' },
  modeCardOuter: { width: '47%', position: 'relative' },
  modeCardAdBadge: { position: 'absolute', top: 2, right: 2, width: 24, height: 24, zIndex: 10 },
  setupSection: { width: '100%', marginBottom: 6 },
  setupLabel: { fontFamily: 'SpaceMono', fontSize: 11, color: '#333', marginBottom: 4 },
  sliderRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  slider: { flex: 1 },
  sliderValue: { fontFamily: 'BebasNeue', fontSize: 28, color: '#1a1a1a', minWidth: 36, textAlign: 'center' },
  launchBtn: { backgroundColor: '#1a1a1a', paddingVertical: 12, paddingHorizontal: 32, alignItems: 'center', borderRadius: 15 },
  launchBtnImage: { width: '100%', height: 56, justifyContent: 'center', alignItems: 'center' },
  launchBtnOverlayText: { fontFamily: 'BebasNeue', fontSize: 16, color: '#F5F5DC', letterSpacing: 2, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
  launchBtnDisabled: { backgroundColor: 'rgba(26,26,26,0.3)' },
  launchBtnText: { fontFamily: 'BebasNeue', fontSize: 18, color: '#F5F5DC', letterSpacing: 2 },
  warningText: { fontFamily: 'SpaceMono', fontSize: 10, color: '#ff6b6b', marginTop: 6, textAlign: 'center' },
  roleCounters: { width: '100%', gap: 4, marginTop: 6 },
  roleCounterRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.04)', borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)', borderRadius: 6, paddingVertical: 4, paddingHorizontal: 8, gap: 6 },
  roleCounterIcon: { width: 20, height: 20 },
  roleCounterEmoji: { fontSize: 16 },
  roleCounterLabel: { fontFamily: 'SpaceMono', fontSize: 10, color: '#666', flex: 1 },
  roleCounterControls: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  roleCounterBtn: { width: 22, height: 22, backgroundColor: 'rgba(0,0,0,0.08)', borderWidth: 1, borderColor: 'rgba(0,0,0,0.15)', alignItems: 'center', justifyContent: 'center', borderRadius: 4 },
  roleCounterBtnDisabled: { opacity: 0.25 },
  roleCounterBtnText: { fontSize: 12, fontFamily: 'SpaceMono', color: '#1a1a1a' },
  roleCounterVal: { fontFamily: 'BebasNeue', fontSize: 15, minWidth: 16, textAlign: 'center', color: '#1a1a1a' },
  categoryScrollHorizontal: { flexDirection: 'row', gap: 8, paddingVertical: 8 },
  categoryChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 25, shadowColor: '#b44dff', shadowOffset: { width: 0, height: 0 }, shadowRadius: 8, shadowOpacity: 0.3, elevation: 4 },
  categoryChipActive: { backgroundColor: '#9b30ff', borderColor: '#b44dff' },
  categoryChipEmoji: { fontSize: 16 },
  categoryChipText: { fontFamily: 'BebasNeue', fontSize: 14, letterSpacing: 1 },
  categoryChipTextActive: { color: '#fff' },
  categoryWrapper: { alignItems: 'center' },
  adRewardIconSmall: { width: 32, height: 16, marginBottom: 2, alignSelf: 'center' },
  addWordRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  wordInput: { flex: 1, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 10, paddingHorizontal: 15, paddingVertical: 10, fontFamily: 'SpaceMono', fontSize: 14, color: '#1a1a1a', borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)' },
  addWordBtn: { backgroundColor: '#1a1a1a', paddingHorizontal: 20, borderRadius: 10, justifyContent: 'center' },
  addWordBtnDisabled: { backgroundColor: 'rgba(26,26,26,0.3)' },
  addWordBtnText: { fontFamily: 'BebasNeue', fontSize: 14, color: '#F5F5DC', letterSpacing: 1 },
  wordsCount: { fontFamily: 'SpaceMono', fontSize: 10, color: '#666', marginBottom: 8, textAlign: 'center' },
  wordsList: { maxHeight: 150, width: '100%', marginBottom: 10 },
  emptyWords: { fontFamily: 'SpaceMono', fontSize: 11, color: '#999', textAlign: 'center', paddingVertical: 20 },
  wordItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(0,0,0,0.05)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginBottom: 6 },
  wordItemText: { fontFamily: 'SpaceMono', fontSize: 12, color: '#1a1a1a', flex: 1 },
  removeBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#ff6b6b', alignItems: 'center', justifyContent: 'center' },
  removeBtnText: { fontFamily: 'BebasNeue', fontSize: 20, color: '#F5F5DC', lineHeight: 28 },
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
  mimerInfoBox: { backgroundColor: 'rgba(0,0,0,0.05)', borderWidth: 2, borderColor: '#1a1a1a', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, alignItems: 'center' },
  mimerInfoText: { fontFamily: 'BebasNeue', fontSize: 16, color: '#1a1a1a', letterSpacing: 1 },
  easyModeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(0,0,0,0.05)', borderWidth: 1.5, borderColor: 'rgba(0,0,0,0.12)', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 10, marginTop: 6 },
  easyModeInfo: { flex: 1 },
  easyModeLabel: { fontFamily: 'BebasNeue', fontSize: 14, color: '#1a1a1a', letterSpacing: 1 },
  easyModeDesc: { fontFamily: 'SpaceMono', fontSize: 9, color: '#666', marginTop: 1 },
  timerChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.1)', borderWidth: 1, borderColor: 'rgba(0,0,0,0.2)' },
  timerChipActive: { backgroundColor: '#1a1a1a', borderColor: '#1a1a1a' },
  timerChipText: { fontFamily: 'BebasNeue', fontSize: 14, color: '#1a1a1a' },
  timerChipTextActive: { color: '#F5F5DC' },
  variantSmall: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, backgroundColor: 'rgba(0,0,0,0.06)', borderWidth: 1, borderColor: 'rgba(0,0,0,0.15)' },
  variantSmallActive: { backgroundColor: '#1a1a1a', borderColor: '#1a1a1a' },
  variantSmallText: { fontFamily: 'SpaceMono', fontSize: 9, color: '#1a1a1a' },
  variantSmallTextActive: { color: '#F5F5DC' },
});
