import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Modal, Animated, Easing, Image, ImageBackground,
  TextInput, useColorScheme, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { t, getLang, setLang } from '../i18n';
import { CATEGORIES_FR, CATEGORIES_EN } from '../data/words';
import { CATEGORY_EMOJIS, CATEGORY_NAMES } from '../data/categories';
import { RULES } from '../data/rules';
import { MODE_IMAGES, ROLE_UNDERCOVER, ROLE_MISTERWHITE } from '../data/modeAssets';
import { generateAssignments } from '../gameLogic';
import { setGlobalDarkTheme, screenThemes } from '../theme';
import { initSounds, playClick, playStart, startBackgroundMusic, stopBackgroundMusic, setMusicEnabled, setSfxEnabled, musicEnabled, sfxEnabled } from '../sound';
import { loadAndShowRewardedAd, setOnLoadingChange, isAdLoadingState } from '../ads';
import { triggerHaptic, useModalAnimation, setHapticEnabled } from '../animations';
import BouncePress from '../components/BouncePress';
import ToggleSwitch from '../components/ToggleSwitch';
import ModeSlider from '../components/ModeSlider';
import ThemedButton from '../components/ThemedButton';
import Constants from 'expo-constants';
import { isWeb, isExpoGo } from '../utils/platform';
import { safeGetItem, safeSetItem } from '../utils/storage';

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
import PlayBtnLight from '../../assets/play-btn-light.svg';



export default function MenuScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [showLoading, setShowLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [numPlayers, setNumPlayers] = useState(3);
  const [lang, setLangState] = useState(getLang());
  const [showRules, setShowRules] = useState(false);
  const [rulesPage, setRulesPage] = useState(0);
  const [showCategories, setShowCategories] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState(null); // null = aléatoire, [] = aucune, ['FOOTBALL', 'PERSONNES_CONNUES'] = multi-sélection
  const [showSettings, setShowSettings] = useState(false);
  const [showUnlockShop, setShowUnlockShop] = useState(false);
  const [showSpecialeMode, setShowSpecialeMode] = useState(false);
  const [showWordList, setShowWordList] = useState(false);
  const rulesModalStyle = useModalAnimation(showRules);
  const settingsModalStyle = useModalAnimation(showSettings);
  const shopModalStyle = useModalAnimation(showUnlockShop);
  const specialeModalStyle = useModalAnimation(showSpecialeMode);
  const wordListModalStyle = useModalAnimation(showWordList);
  const [specialeNumPlayers, setSpecialeNumPlayers] = useState(3);
  const [specialeGameMode, setSpecialeGameMode] = useState(0);
  const [specialeNumUndercovers, setSpecialeNumUndercovers] = useState(1);
  const [specialeNumMisterWhites, setSpecialeNumMisterWhites] = useState(0);
  const [showGameSetup, setShowGameSetup] = useState(false);
  const [gameMode, setGameMode] = useState(0); // 0=Normal, 1=MW, 2=MW+Intrus, 3=Spyfall
  const [mimerMode, setMimerMode] = useState(false);
  const [drawingMode, setDrawingMode] = useState(false);
  const [drawRounds, setDrawRounds] = useState(3);
  // Toggles pour Intrus et Mister White (mode Normal)
  const [numUndercovers, setNumUndercovers] = useState(1);
  const [numMisterWhites, setNumMisterWhites] = useState(0);
  const [easyMode, setEasyMode] = useState(false);
  const [spyfallUndercover, setSpyfallUndercover] = useState(false);
  const [numSpies, setNumSpies] = useState(1);

  // Les rôles spéciaux doivent être 2x moins nombreux que les normaux
  // => specials ≤ floor((players + 1) / 3) — permet Mister White à partir de 5 joueurs
  const maxTotalSpecials = Math.floor((numPlayers + 1) / 3);

  const canAddUC = (numUndercovers + 1 + numMisterWhites) <= maxTotalSpecials;
  const canAddSpy = (numSpies + 1 + numUndercovers) <= maxTotalSpecials;
  const canAddSpyfallUC = (numUndercovers + 1 + numSpies) <= maxTotalSpecials;
  const canAddMW = (numUndercovers + numMisterWhites + 1) <= maxTotalSpecials;

  // Synchroniser gameMode avec les compteurs
  useEffect(() => {
    if (gameMode !== 3 && !mimerMode) {
      if (numUndercovers > 0 && numMisterWhites > 0) setGameMode(2);
      else if (numMisterWhites > 0) setGameMode(1);
      else setGameMode(0);
    }
  }, [numUndercovers, numMisterWhites]);

  // En mode Spyfall, l'intrus est à 0 par défaut
  useEffect(() => {
    if (gameMode === 3 && numUndercovers > 0) {
      setNumUndercovers(0);
    }
  }, [gameMode]);

  // Synchroniser specialeGameMode avec les compteurs spéciaux
  useEffect(() => {
    if (specialeNumUndercovers > 0 && specialeNumMisterWhites > 0) setSpecialeGameMode(2);
    else if (specialeNumMisterWhites > 0) setSpecialeGameMode(1);
    else setSpecialeGameMode(0);
  }, [specialeNumUndercovers, specialeNumMisterWhites]);

  // Quand le nombre de joueurs change, ajuster les compteurs pour rester cohérent
  useEffect(() => {
    const maxTotal = Math.floor((numPlayers + 1) / 3);

    let newUC = numUndercovers;
    let newMW = numMisterWhites;

    // Règle : intrus + mister whites ≤ maxTotal
    while (newUC + newMW > maxTotal && newMW > 0) newMW--;
    while (newUC + newMW > maxTotal && newUC > 0) newUC--;

    if (newUC !== numUndercovers) setNumUndercovers(newUC);
    if (newMW !== numMisterWhites) setNumMisterWhites(newMW);

    // Règle Spyfall : espions + intrus ≤ maxTotal (uniquement en mode Spyfall)
    if (gameMode === 3) {
      let newSpies = numSpies;
      while (newSpies + newUC > maxTotal && newUC > 0) newUC--;
      while (newSpies + newUC > maxTotal && newSpies > 1) newSpies--;
      if (newUC !== numUndercovers) setNumUndercovers(newUC);
      if (newSpies !== numSpies) setNumSpies(newSpies);
    }
  }, [numPlayers]);
  // États des sons (synchronisés avec sound.js)
  const [musicOn, setMusicOn] = useState(musicEnabled);
  const [sfxOn, setSfxOn] = useState(sfxEnabled);
  const [hapticOn, setHapticOn] = useState(true);
  const [darkTheme, setDarkTheme] = useState(false);
  const [adLoading, setAdLoading] = useState(false);
  const systemColorScheme = useColorScheme();
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
        } else if (theme !== 'false') {
          // Pas de préférence sauvegardée → suivre le thème du système
          const isSystemDark = systemColorScheme === 'dark';
          setDarkTheme(isSystemDark);
          setGlobalDarkTheme(isSystemDark);
        }
      } catch (e) {}
    };
    loadStates();
    // Enregistrer le callback de chargement des pubs
    setOnLoadingChange(setAdLoading);
  }, []);

  // Suivre le thème système en direct, UNIQUEMENT si l'utilisateur n'a pas
  // de préférence explicite sauvegardée (true/false).
  useEffect(() => {
    (async () => {
      try {
        const savedTheme = await safeGetItem('dark_theme');
        if (savedTheme === 'true' || savedTheme === 'false') return; // préférence explicite
        const isSystemDark = systemColorScheme === 'dark';
        setDarkTheme(isSystemDark);
        setGlobalDarkTheme(isSystemDark);
      } catch (e) {}
    })();
  }, [systemColorScheme]);

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
          // Silently fail - custom words will be empty
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
      setGameMode(0);
      setMimerMode(false);
      setNumUndercovers(1);
      setNumMisterWhites(0);
      setNumSpies(1);
      setEasyMode(false);
      setSpyfallUndercover(false);
      setDrawingMode(false);
      setDrawRounds(3);
      setSelectedCategories(null);

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
    triggerHaptic('medium');
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
    triggerHaptic('light');
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
    triggerHaptic('medium');

    // Vérifier si la catégorie SPÉCIALE est sélectionnée sans mots
    const isSpecialeSelected = Array.isArray(selectedCategories) && selectedCategories.includes('SPECIALE');
    if (isSpecialeSelected && customWords.length < 2) {
      alert(t('specialNeedMoreAlert'));
      return;
    }

    if (gameMode === 2 && numPlayers < 4) { return; }
    // Il faut toujours plus de joueurs normaux que de rôles spéciaux
    if (gameMode !== 3 && !mimerMode && numUndercovers + numMisterWhites >= numPlayers) {
      alert(t('menuNeedMorePlayers'));
      return;
    }

    // En mode MIMER, la catégorie est automatiquement MIMER
    // En mode SPYFALL, la catégorie est LIEUX selon sélection (défaut LIEUX)
    // Multi-catégories : choisir une catégorie au hasard parmi la sélection
    let finalCategory;
    if (mimerMode) {
      finalCategory = 'MIMER';
    } else if (gameMode === 3) {
      // Spyfall : LIEUX ou TRAVAIL selon sélection (défaut LIEUX)
      if (Array.isArray(selectedCategories) && selectedCategories.length > 0) {
        const spyfallCats = selectedCategories.filter(c => c === 'LIEUX' || c === 'LOCATIONS' || c === 'TRAVAIL' || c === 'JOBS' || c === 'SPORT');
        finalCategory = spyfallCats.length > 0 ? spyfallCats[Math.floor(Math.random() * spyfallCats.length)] : t('catLieux');
      } else {
        finalCategory = t('catLieux');
      }
    } else if (Array.isArray(selectedCategories) && selectedCategories.length > 0) {
      // Multi-sélection : choisir au hasard
      finalCategory = selectedCategories[Math.floor(Math.random() * selectedCategories.length)];
    } else {
      finalCategory = null; // aléatoire parmi toutes
    }

    // Animation de sortie : le game setup disparaît en fondu
    Animated.timing(gameSetupAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      gameSetupAnim.setValue(0);
      playOpenAnim.setValue(0);
      setIsPlayOpening(false);
      setShowGameSetup(false);

      navigation.navigate('Prep', {
        numPlayers,
        gameMode,
        selectedCategory: finalCategory,
        selectedCategories,
        customWords,
        mimerMode,
        numUndercovers: gameMode === 3 ? (numUndercovers > 0 ? numUndercovers : numSpies) : numUndercovers,
        spyfallUndercover: gameMode === 3 ? (numUndercovers > 0) : false,
        numMisterWhites,
        easyMode,
        darkTheme,
        drawingMode,
        drawRounds,
      });
    });
  };

  const handleCategorySelect = async (cat) => {
    playClick();

    // Vérifier si c'est SPÉCIALE et afficher pub si nécessaire
    const isSpeciale = cat === 'SPECIALE';
    const isObjects = cat === 'OBJECTS' || cat === 'OBJETS';

    if (isSpeciale && customWords.length < 2) {
      alert(t('specialNeedMoreAlert'));
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

    setSelectedCategories([cat]);
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
  const theme = useMemo(() => darkTheme ? screenThemes.dark : screenThemes.light, [darkTheme]);
  // Exclure MIMER de la liste des catégories (activé via le toggle)
  // Exclure OBJETS si pas débloqué
  // Exclure SPÉCIALE (accessible uniquement via le bouton ⭐ du menu)
  const categoryKeys = useMemo(() => Object.keys(currentCategories).filter(cat => {
    if (cat === 'MIMER') return false;
    if (cat === 'SPECIALE') return false;
    if ((cat === 'OBJECTS' || cat === 'OBJETS') && !objectsUnlocked) return false;
    if (gameMode !== 3 && (cat === 'TRAVAIL' || cat === 'JOBS')) return false;
    return true;
  }), [currentCategories, gameMode, objectsUnlocked]);

  return (
    <View style={styles.rootWrapper}>
      {/* Menu principal */}
      <Animated.View style={[styles.fullContainer, { opacity: menuOpacity }]}>
        <View style={darkTheme ? styles.bgDark : styles.bgBeige}>
          <Image source={darkTheme ? require('../../assets/bg-sombre.jpg') : require('../../assets/bg-white.jpg')} style={styles.bgImage} resizeMode="cover" />
          <View style={darkTheme ? styles.bgGradientDark : styles.bgGradient} />

          {/* Drapeau langue en haut à gauche */}
          <TouchableOpacity
            style={[styles.langBtn, { top: insets.top + 55 }]}
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
                <Image source={require('../../assets/logo-title.png')} style={styles.logoTitle} resizeMode="contain" />
            </Animated.View>

            {/* Sous-titre - positionné absolument pour ne pas affecter les autres éléments */}
            <Text style={[styles.subtitleAbsolute, { color: theme.textSub }]}>{t('subtitle')}</Text>

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
                  <PlayBtnLight width={200} height={200} />
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* Indice en bas */}
            {!isPlayOpening && (
              <Text style={[styles.hintText, { color: theme.textMuted }]}>
                {t('menuPressPlay')}
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
            <BouncePress accessibilityLabel={t('menuRules')} accessibilityRole="button" style={[styles.bottomBtn, { backgroundColor: theme.btnBg, borderColor: theme.border }]} onPress={() => { setRulesPage(0); setShowRules(true); }}>
              {darkTheme ? <ReglesIcon width={28} height={28} /> : <ReglesIconLight width={28} height={28} />}
            </BouncePress>
            <BouncePress accessibilityLabel={t('menuSettings')} accessibilityRole="button" style={[styles.bottomBtn, { backgroundColor: theme.btnBg, borderColor: theme.border }]} onPress={() => setShowSettings(true)}>
              {darkTheme ? <ParametreIcon width={28} height={28} /> : <ParametreIconLight width={28} height={28} />}
            </BouncePress>
            <View style={styles.bottomBtnWrapper}>
              <View style={styles.adIconSmallContainer}>
                <Image source={AD_REWARD_ICON} style={styles.adIconSmall} resizeMode="contain" />
              </View>
              <BouncePress accessibilityLabel="⭐" accessibilityRole="button" style={[styles.bottomBtn, { backgroundColor: theme.btnBg, borderColor: theme.border }]} onPress={() => {
                playClick();
                setSpecialeNumPlayers(3);
                setSpecialeGameMode(0);
                setShowSpecialeMode(true);
              }}>
                {darkTheme ? <SpecialeIcon width={28} height={28} /> : <SpecialeIconLight width={28} height={28} />}
              </BouncePress>
            </View>
            <BouncePress accessibilityLabel={t('menuShop')} accessibilityRole="button" style={[styles.bottomBtn, { backgroundColor: theme.btnBg, borderColor: theme.border }]} onPress={() => setShowUnlockShop(true)}>
              {darkTheme ? <BoutiqueIcon width={28} height={28} /> : <BoutiqueIconLight width={28} height={28} />}
            </BouncePress>
          </Animated.View>

          {/* Version */}
          <Text style={[styles.versionText, { color: darkTheme ? 'rgba(245,245,220,0.2)' : 'rgba(26,26,26,0.15)' }]}>v{Constants.expoConfig?.version || ''}</Text>
        </View>
      </Animated.View>

      <Modal visible={showRules} animationType="fade" transparent onRequestClose={() => setShowRules(false)}>
        <View style={[styles.modalOverlay, { backgroundColor: theme.modalOverlay }]}>
          <Animated.View style={[styles.modalContent, { backgroundColor: theme.modalBg, borderColor: theme.modalBorder }, rulesModalStyle]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>{t('menuRules')}</Text>

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

            <ThemedButton darkTheme={darkTheme && !isWeb} onPress={() => { setRulesPage(0); setShowRules(false); }} text={t('menuClose')} />
          </Animated.View>
        </View>
      </Modal>

      <Modal visible={showSettings} animationType="fade" transparent onRequestClose={() => setShowSettings(false)}>
        <View style={[styles.modalOverlay, { backgroundColor: theme.modalOverlay }]}>
          <Animated.View style={[styles.modalContent, { backgroundColor: theme.modalBg, borderColor: theme.modalBorder }, settingsModalStyle]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>{t('menuSettings')}</Text>
            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>{t('menuLanguage')}</Text>
              <TouchableOpacity style={[styles.settingPill, { backgroundColor: theme.chipBg, borderColor: theme.chipBorder }]} onPress={toggleLang}>
                <Text style={[styles.settingPillText, { color: theme.text }]}>{lang === 'fr' ? '🇫🇷' : '🇬🇧'}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>{t('menuMusic')}</Text>
              <ToggleSwitch value={musicOn} onValueChange={toggleMusic} activeColor={theme.neon} inactiveColor={theme.border} />
            </View>
            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>{t('menuSfx')}</Text>
              <ToggleSwitch value={sfxOn} onValueChange={toggleSfx} activeColor={theme.neon} inactiveColor={theme.border} />
            </View>
            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>{t('menuVibration')}</Text>
              <ToggleSwitch value={hapticOn} onValueChange={() => { setHapticOn(!hapticOn); setHapticEnabled(!hapticOn); }} activeColor={theme.neon} inactiveColor={theme.border} />
            </View>
            <View style={styles.settingRow}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>{t('menuDarkTheme')}</Text>
              <ToggleSwitch value={darkTheme} onValueChange={toggleTheme} activeColor={theme.neon} inactiveColor={theme.border} />
            </View>
            <ThemedButton darkTheme={darkTheme && !isWeb} onPress={() => setShowSettings(false)} text={t('menuClose')} />
          </Animated.View>
        </View>
      </Modal>

      {/* Modal pour débloquer la catégorie OBJETS */}
      <Modal visible={showUnlockShop} animationType="fade" transparent onRequestClose={() => setShowUnlockShop(false)}>
        <View style={[styles.modalOverlay, { backgroundColor: theme.modalOverlay }]}>
          <Animated.View style={[styles.modalContent, { backgroundColor: theme.modalBg, borderColor: theme.modalBorder }, shopModalStyle]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>{t('menuShop')}</Text>
            <Text style={[styles.modalSubtitle, { color: theme.subtitleColor }]}>
              {t('menuShopSubtitle')}
            </Text>

            {/* Catégorie OBJETS */}
            <View style={[styles.unlockItem, { backgroundColor: theme.cardBg, borderColor: theme.neon }]}>
              <View style={styles.unlockItemHeader}>
                <Text style={styles.unlockItemIcon}>📦</Text>
                <View style={styles.unlockItemInfo}>
                  <Text style={[styles.unlockItemTitle, { color: theme.text }]}>{t('menuObjects')}</Text>
                  <Text style={[styles.unlockItemDesc, { color: theme.textMuted }]}>
                    {t('menuObjectsDesc')}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.unlockBtn, objectsUnlocked && styles.unlockBtnOwned, !objectsUnlocked && { backgroundColor: theme.neon }]}
                onPress={async () => {
                  if (objectsUnlocked) {
                    alert(t('menuObjectsAlreadyUnlocked'));
                    return;
                  }
                  if (isExpoGo) {
                    setObjectsUnlocked(true);
                    alert(t('menuObjectsUnlocked'));
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
                    ? t('menuUnlocked')
                    : t('menuUnlock')}
                </Text>
              </TouchableOpacity>
            </View>

            <ThemedButton darkTheme={darkTheme && !isWeb} onPress={() => setShowUnlockShop(false)} text={t('menuClose')} />
          </Animated.View>
        </View>
      </Modal>

      {/* Modal pour le mode SPÉCIALE (bouton étoile) - mode Undercover */}
      <Modal visible={showSpecialeMode} animationType="fade" transparent onRequestClose={() => setShowSpecialeMode(false)}>
        <View style={[styles.modalOverlay, { backgroundColor: theme.modalOverlay }]}>
          <Animated.View style={[styles.modalContent, { backgroundColor: theme.modalBg, borderColor: theme.modalBorder }, specialeModalStyle]}>
            <Text style={[styles.modalTitle, { color: theme.neon }]}>{t('menuSpecialeTitle')}</Text>
            <Text style={[styles.modalSubtitle, { color: theme.subtitleColor }]}>
              {t('menuSpecialeSubtitle')}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Section: Nombre de joueurs */}
              <View style={styles.setupSection}>
                <Text style={[styles.setupLabel, { color: theme.text }]}>{t('menuNumPlayers')}</Text>
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
                    <Text style={[styles.roleCounterLabel, { color: theme.textMuted }]}>{t('menuUndercover')}</Text>
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
                  <Text style={styles.warningText}>⚠️ {t('menuMinPlayers')}</Text>
                )}
              </View>

              {/* Section: Mots personnalisés */}
              <View style={styles.setupSection}>
                <Text style={[styles.setupLabel, { color: theme.text }]}>{t('menuCustomWords')}</Text>
                <View style={{ alignItems: 'center', gap: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, width: '100%' }}>
                    <TextInput
                      style={[styles.wordInput, { flex: 1, fontFamily: 'SpaceMono', fontSize: 15, borderWidth: 1, borderColor: theme.inputBorder, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, color: theme.text, backgroundColor: theme.inputBg, textAlign: 'center' }]}
                      value={newWord}
                      onChangeText={setNewWord}
                      onSubmitEditing={handleAddWord}
                      placeholder={t('menuAddWord')}
                      placeholderTextColor={darkTheme ? 'rgba(232,213,255,0.4)' : '#999'}
                      maxLength={30}
                      returnKeyType="done"
                    />
                    <TouchableOpacity
                      style={[styles.addWordBtn, !newWord.trim() && styles.addWordBtnDisabled, { backgroundColor: theme.neon }]}
                      onPress={handleAddWord}
                      disabled={!newWord.trim()}
                    >
                      <Text style={styles.addWordBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                  {customWords.length > 0 && (
                    <TouchableOpacity
                      style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, backgroundColor: theme.btnBg, borderWidth: 1, borderColor: theme.border, gap: 8 }}
                      onPress={() => { playClick(); setShowWordList(true); }}
                      activeOpacity={0.7}
                    >
                      <Text style={{ fontFamily: 'SpaceMono', fontSize: 12, color: theme.text, letterSpacing: 1 }}>📝</Text>
                      <Text style={{ fontFamily: 'BebasNeue', fontSize: 16, color: theme.text, letterSpacing: 2 }}>
                        {t('menuWordsCount', customWords.length)}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Bouton Lancer la partie */}
              <ThemedButton
                darkTheme={darkTheme && !isWeb}
                onPress={async () => {
                  if (specialeGameMode === 2 && specialeNumPlayers < 4) return;
                  if (customWords.length < 2) {
                    alert(t('menuAddMoreWords'));
                    return;
                  }
                  // Pub récompensée au lancement (et non à l'ouverture du modal)
                  if (!isExpoGo) {
                    const rewarded = await loadAndShowRewardedAd(() => {});
                    if (!rewarded) return;
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
                text={t('menuStartGame')}
              />
            </ScrollView>

            <ThemedButton darkTheme={darkTheme && !isWeb} onPress={() => setShowSpecialeMode(false)} text={t('menuClose')} />
          </Animated.View>
          {showWordList && (
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
              <Animated.View style={[styles.modalContent, { backgroundColor: theme.modalBg, borderColor: theme.modalBorder }, wordListModalStyle]}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>{t('menuMyWords')}</Text>
                <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
                  <View style={{ gap: 8 }}>
                    {customWords.map((word, i) => (
                      <View key={i} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.btnBg, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: theme.cardBorder }}>
                        <Text style={{ flex: 1, fontFamily: 'SpaceMono', fontSize: 14, color: theme.text, letterSpacing: 2 }}>
                          {revealedWords[i] ? word : '•••'}
                        </Text>
                        <TouchableOpacity onPress={() => setRevealedWords(prev => ({ ...prev, [i]: !prev[i] }))} style={{ marginLeft: 8, paddingHorizontal: 6 }}>
                          <Text style={{ fontSize: 16 }}>{revealedWords[i] ? '🙈' : '👁️'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleRemoveWord(i)} style={{ marginLeft: 4, paddingHorizontal: 6 }}>
                          <Text style={{ color: '#ff4444', fontSize: 18, fontWeight: 'bold' }}>×</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </ScrollView>
                <ThemedButton darkTheme={darkTheme && !isWeb} onPress={() => { playClick(); setShowWordList(false); }} text={t('menuClose')} />
              </Animated.View>
            </View>
          )}
        </View>
      </Modal>

      {showGameSetup && (
        <View style={[styles.gameSetupOverlay, { backgroundColor: theme.modalOverlay }]} collapsable={false}>
          <Animated.View style={[styles.modalContent, { maxHeight: '90%', backgroundColor: theme.modalBg, borderColor: theme.modalBorder }, { transform: [{ scale: gameSetupAnim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }], opacity: gameSetupAnim }]} collapsable={false}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>{t('menuConfig')}</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.setupSection}>
                <Text style={[styles.setupLabel, { color: theme.text }]}>{t('menuNumPlayers')}</Text>
                <ModeSlider
                  value={numPlayers}
                  onValueChange={setNumPlayers}
                  min={3}
                  max={20}
                  themeColors={theme}
                />
              </View>

              <View style={styles.setupSection}>
                <Text style={[styles.setupLabel, { color: theme.text }]}>{t('menuGameMode')}</Text>

                <View style={styles.modeGrid}>
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={`UNDERCOVER — ${t('modeMWIntrusCardDesc')}`}
                    style={[styles.modeCard, { backgroundColor: 'transparent', borderColor: (!mimerMode && gameMode !== 3) ? (theme.neonDark) : (theme.modeActiveBorder) }]}
                    onPress={() => {
                      playClick();
                      setMimerMode(false);
                      setSelectedCategories(null);
                      if (numUndercovers === 0) setNumUndercovers(1);
                      setGameMode((numUndercovers === 0 ? 1 : numUndercovers) > 0 && numMisterWhites > 0 ? 2 : numMisterWhites > 0 ? 1 : 0);
                    }}
                    activeOpacity={0.7}
                  >
                    <Image source={ROLE_UNDERCOVER} style={styles.modeCardImage} resizeMode="contain" />
                    <Text style={[styles.modeCardTitle, { color: (!mimerMode && gameMode !== 3) ? (theme.neon) : theme.text }]}>UNDERCOVER</Text>
                    <Text style={[styles.modeCardDesc, { color: (!mimerMode && gameMode !== 3) ? (theme.modeActiveText) : theme.textMuted }]}>{t('modeMWIntrusCardDesc')}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={`SPYFALL — ${t('menuSpyUndercover')}`}
                    style={[styles.modeCard, { backgroundColor: 'transparent', borderColor: gameMode === 3 ? (theme.neonDark) : (theme.modeActiveBorder) }]}
                    onPress={() => {
                      playClick();
                      setSelectedCategories([t('catLieux')]);
                      setMimerMode(false);
                      setNumSpies(1);
                      setNumUndercovers(0);
                      setNumMisterWhites(0);
                      setSpyfallUndercover(false);
                      setGameMode(3);
                    }}
                    activeOpacity={0.7}
                  >
                    <Image source={MODE_IMAGES.spyfall} style={styles.modeCardImage} resizeMode="contain" />
                    <Text style={[styles.modeCardTitle, { color: gameMode === 3 ? (theme.neon) : theme.text }]}>{t('modeSpyfall')}</Text>
                    <Text style={[styles.modeCardDesc, { color: gameMode === 3 ? (theme.modeActiveText) : theme.textMuted }]}>
                      {t('menuSpyUndercover')}
                    </Text>
                  </TouchableOpacity>

                  <View style={styles.modeCardOuter}>
                    {!mimerMode && <Image source={AD_REWARD_ICON} style={styles.modeCardAdBadge} resizeMode="contain" />}
                    <TouchableOpacity
                      accessibilityRole="button"
                      accessibilityLabel={`MIME — ${t('modeMimerDesc')}`}
                      style={[styles.modeCard, { width: '100%', backgroundColor: 'transparent', borderColor: mimerMode ? (theme.neonDark) : (theme.modeActiveBorder) }]}
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
                      <Text style={[styles.modeCardTitle, { color: mimerMode ? (theme.neon) : theme.text }]}>{t('modeMimer')}</Text>
                      <Text style={[styles.modeCardDesc, { color: mimerMode ? (theme.modeActiveText) : theme.textMuted }]}>{t('modeMimerDesc')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {!mimerMode && !(Array.isArray(selectedCategories) && selectedCategories.includes('SPECIALE')) && (
                  <View style={styles.roleCounters}>
                    {gameMode === 3 ? (
                      <View>
                        <View style={[styles.roleCounterRow, { backgroundColor: theme.counterBg, borderColor: theme.counterBorder }]}>
                          <Image source={require('../../assets/spy-icon.png')} style={styles.roleCounterIcon} resizeMode="contain" />
                          <Text style={[styles.roleCounterLabel, { color: theme.textMuted }]}>{t('menuSpy')}</Text>
                          <View style={styles.roleCounterControls}>
                            <TouchableOpacity style={[styles.roleCounterBtn, { backgroundColor: theme.counterBtnBg, borderColor: theme.counterBtnBorder }]} onPress={() => { playClick(); setNumSpies(v => Math.max(0, v - 1)); }}><Text style={[styles.roleCounterBtnText, { color: theme.text }]}>-</Text></TouchableOpacity>
                            <Text style={[styles.roleCounterVal, { color: theme.neon }]}>{numSpies}</Text>
                            <TouchableOpacity style={[styles.roleCounterBtn, !canAddSpy && styles.roleCounterBtnDisabled, { backgroundColor: theme.counterBtnBg, borderColor: theme.counterBtnBorder }]} onPress={() => { playClick(); if (canAddSpy) setNumSpies(v => v + 1); }} disabled={!canAddSpy}><Text style={[styles.roleCounterBtnText, { color: theme.text }]}>+</Text></TouchableOpacity>
                          </View>
                        </View>
                        <View style={[styles.roleCounterRow, { backgroundColor: theme.counterBg, borderColor: theme.counterBorder }]}>
                          <Image source={MODE_IMAGES.normal} style={styles.roleCounterIcon} resizeMode="contain" />
                          <Text style={[styles.roleCounterLabel, { color: theme.textMuted }]}>{t('menuUndercover')}</Text>
                          <View style={styles.roleCounterControls}>
                            <TouchableOpacity style={[styles.roleCounterBtn, { backgroundColor: theme.counterBtnBg, borderColor: theme.counterBtnBorder }]} onPress={() => { playClick(); setNumUndercovers(v => Math.max(0, v - 1)); }}><Text style={[styles.roleCounterBtnText, { color: theme.text }]}>-</Text></TouchableOpacity>
                            <Text style={[styles.roleCounterVal, { color: theme.neon }]}>{numUndercovers}</Text>
                            <TouchableOpacity style={[styles.roleCounterBtn, !canAddSpyfallUC && styles.roleCounterBtnDisabled, { backgroundColor: theme.counterBtnBg, borderColor: theme.counterBtnBorder }]} onPress={() => { playClick(); if (canAddSpyfallUC) setNumUndercovers(v => v + 1); }} disabled={!canAddSpyfallUC}><Text style={[styles.roleCounterBtnText, { color: theme.text }]}>+</Text></TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    ) : (
                      <View>
                        <View style={[styles.roleCounterRow, { backgroundColor: theme.counterBg, borderColor: theme.counterBorder }]}>
                          <Image source={MODE_IMAGES.normal} style={styles.roleCounterIcon} resizeMode="contain" />
                          <Text style={[styles.roleCounterLabel, { color: theme.textMuted }]}>{t('menuUndercover')}</Text>
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

                {(numMisterWhites > 0 && !mimerMode && gameMode !== 3 || gameMode === 3) && !mimerMode && (
                  <View style={[styles.easyModeRow, { backgroundColor: theme.counterBg, borderColor: theme.counterBorder }]}>
                    <View style={styles.easyModeInfo}>
                      <Text style={[styles.easyModeLabel, { color: theme.text }]}>{t('menuEasy')}</Text>
                      <Text style={[styles.easyModeDesc, { color: theme.textMuted }]}>{gameMode === 3 ? t('menuEasyHintSpy') : t('menuEasyHintMW')}</Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.toggleBtn, easyMode && styles.toggleBtnActive, { backgroundColor: easyMode ? theme.neon : theme.counterBtnBg, borderColor: easyMode ? theme.neon : theme.counterBtnBorder }]}
                      onPress={() => { playClick(); setEasyMode(!easyMode); }}
                    >
                      <Text style={[styles.toggleBtnText, { color: easyMode ? '#fff' : theme.text }]}>{easyMode ? 'ON' : 'OFF'}</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {!mimerMode && gameMode !== 3 && (
                  <View style={[styles.easyModeRow, { backgroundColor: theme.counterBg, borderColor: theme.counterBorder }]}>
                    <View style={styles.easyModeInfo}>
                      <Text style={[styles.easyModeLabel, { color: theme.text }]}>{t('menuDrawingMode')}</Text>
                      <Text style={[styles.easyModeDesc, { color: theme.textMuted }]}>{t('menuDrawingModeDesc')}</Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.toggleBtn, drawingMode && styles.toggleBtnActive, { backgroundColor: drawingMode ? theme.neon : theme.counterBtnBg, borderColor: drawingMode ? theme.neon : theme.counterBtnBorder }]}
                      onPress={() => { playClick(); setDrawingMode(!drawingMode); }}
                    >
                      <Text style={[styles.toggleBtnText, { color: drawingMode ? '#fff' : theme.text }]}>{drawingMode ? 'ON' : 'OFF'}</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {!mimerMode && gameMode !== 3 && drawingMode && (
                  <View style={[styles.easyModeRow, { backgroundColor: theme.counterBg, borderColor: theme.counterBorder }]}>
                    <View style={styles.easyModeInfo}>
                      <Text style={[styles.easyModeLabel, { color: theme.text }]}>{t('menuDrawRounds')}</Text>
                    </View>
                    <View style={styles.roleCounterControls}>
                      <TouchableOpacity style={[styles.roleCounterBtn, { backgroundColor: theme.counterBtnBg, borderColor: theme.counterBtnBorder }]} onPress={() => { playClick(); setDrawRounds(v => Math.max(1, v - 1)); }}>
                        <Text style={[styles.roleCounterBtnText, { color: theme.text }]}>-</Text>
                      </TouchableOpacity>
                      <Text style={[styles.roleCounterVal, { color: theme.neon }]}>{drawRounds}</Text>
                      <TouchableOpacity style={[styles.roleCounterBtn, drawRounds >= 5 && styles.roleCounterBtnDisabled, { backgroundColor: theme.counterBtnBg, borderColor: theme.counterBtnBorder }]} onPress={() => { playClick(); if (drawRounds < 5) setDrawRounds(v => v + 1); }} disabled={drawRounds >= 5}>
                        <Text style={[styles.roleCounterBtnText, { color: theme.text }]}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {gameMode === 2 && !mimerMode && numPlayers < 4 && (
                  <Text style={styles.warningText}>⚠️ {t('menuMinPlayers')}</Text>
                )}
              </View>

              {!mimerMode && gameMode !== 3 && (
                <View style={styles.setupSection}>
                  <Text style={[styles.setupLabel, { color: theme.text }]}>{t('menuCategory')}</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScrollHorizontal}>
                    <TouchableOpacity
                      accessibilityRole="button"
                      accessibilityLabel={t('menuRandom')}
                      style={[styles.categoryChip, selectedCategories === null ? { backgroundColor: theme.chipActiveBg, borderColor: theme.chipActiveBg } : { backgroundColor: theme.chipBg, borderColor: theme.chipBorder }]}
                      onPress={() => { playClick(); setSelectedCategories(null); }}
                    >
                      <Text style={styles.categoryChipEmoji}>🎲</Text>
                      <Text style={[styles.categoryChipText, selectedCategories === null && { color: '#fff' }, selectedCategories !== null && { color: theme.text }]}>
                        {t('menuRandom')}
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
                            accessibilityRole="button"
                            accessibilityLabel={CATEGORY_NAMES[lang][cat] || cat.replace(/_/g, ' ')}
                            style={[styles.categoryChip, (selectedCategories !== null && selectedCategories.includes(cat)) ? { backgroundColor: theme.chipActiveBg, borderColor: theme.chipActiveBg } : { backgroundColor: theme.chipBg, borderColor: theme.chipBorder }]}
                            onPress={() => {
                              playClick();
                              setSelectedCategories(prev => {
                                if (prev === null) return [cat];
                                if (prev.includes(cat)) return prev.length === 1 ? null : prev.filter(c => c !== cat);
                                return [...prev, cat];
                              });
                            }}
                          >
                            <Text style={styles.categoryChipEmoji}>{emoji}</Text>
                            <Text style={[styles.categoryChipText, (selectedCategories !== null && selectedCategories.includes(cat)) && { color: '#fff' }, (selectedCategories === null || !selectedCategories.includes(cat)) && { color: theme.text }]}>
                              {CATEGORY_NAMES[lang][cat] || cat.replace(/_/g, ' ')}
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
                  <Text style={[styles.setupLabel, { color: theme.text }]}>{t('menuMimerActive')}</Text>
                  <View style={[styles.mimerInfoBox, { backgroundColor: theme.cardBg, borderColor: theme.neon }]}>
                    <Text style={[styles.mimerInfoText, { color: theme.neon }]}>{t('menuMimerInfo')}</Text>
                  </View>
                </View>
              )}

              {gameMode === 3 && !mimerMode && (
                <View style={styles.setupSection}>
                  <Text style={[styles.setupLabel, { color: theme.text }]}>{t('menuCategory')}</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScrollHorizontal}>
                    <TouchableOpacity
                      style={[styles.categoryChip, (selectedCategories === null || (Array.isArray(selectedCategories) && (selectedCategories.includes('LIEUX') || selectedCategories.includes('LOCATIONS')))) ? { backgroundColor: theme.chipActiveBg, borderColor: theme.chipActiveBg } : { backgroundColor: theme.chipBg, borderColor: theme.chipBorder }]}
                      onPress={() => { playClick(); setSelectedCategories(prev => {
                        const lieux = t('catLieux');
                        if (prev === null) return [lieux];
                        if (prev.includes(lieux)) return prev.length === 1 ? null : prev.filter(c => c !== lieux);
                        return [...prev, lieux];
                      }); }}
                    >
                      <Text style={styles.categoryChipEmoji}>🏠</Text>
                      <Text style={[styles.categoryChipText, (selectedCategories === null || (Array.isArray(selectedCategories) && (selectedCategories.includes('LIEUX') || selectedCategories.includes('LOCATIONS')))) ? { color: '#fff' } : { color: theme.text }]}>
                        {t('catLieux')}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.categoryChip, (Array.isArray(selectedCategories) && (selectedCategories.includes('TRAVAIL') || selectedCategories.includes('JOBS'))) ? { backgroundColor: theme.chipActiveBg, borderColor: theme.chipActiveBg } : { backgroundColor: theme.chipBg, borderColor: theme.chipBorder }]}
                      onPress={() => { playClick(); setSelectedCategories(prev => {
                        const jobs = t('catTravail');
                        if (prev === null) return [jobs];
                        if (prev.includes(jobs)) return prev.length === 1 ? null : prev.filter(c => c !== jobs);
                        return [...prev, jobs];
                      }); }}
                    >
                      <Text style={styles.categoryChipEmoji}>💼</Text>
                      <Text style={[styles.categoryChipText, (Array.isArray(selectedCategories) && (selectedCategories.includes('TRAVAIL') || selectedCategories.includes('JOBS'))) ? { color: '#fff' } : { color: theme.text }]}>
                        {t('catTravail')}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.categoryChip, (Array.isArray(selectedCategories) && selectedCategories.includes('SPORT')) ? { backgroundColor: theme.chipActiveBg, borderColor: theme.chipActiveBg } : { backgroundColor: theme.chipBg, borderColor: theme.chipBorder }]}
                      onPress={() => { playClick(); setSelectedCategories(prev => {
                        if (prev === null) return ['SPORT'];
                        if (prev.includes('SPORT')) return prev.length === 1 ? null : prev.filter(c => c !== 'SPORT');
                        return [...prev, 'SPORT'];
                      }); }}
                    >
                      <Text style={styles.categoryChipEmoji}>🏅</Text>
                      <Text style={[styles.categoryChipText, (Array.isArray(selectedCategories) && selectedCategories.includes('SPORT')) ? { color: '#fff' } : { color: theme.text }]}>
                        {t('catSport')}
                      </Text>
                    </TouchableOpacity>
                  </ScrollView>
                </View>
              )}
            </ScrollView>

            <ThemedButton darkTheme={darkTheme && !isWeb} onPress={handleLaunchGame} text={t('menuStartGame')} disabled={gameMode === 2 && numPlayers < 4} />

            <ThemedButton darkTheme={darkTheme && !isWeb} onPress={closeGameSetup} text={t('menuClose')} />
          </Animated.View>
        </View>
      )}

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

      {/* Overlay de chargement pour les pubs récompensées */}
      {adLoading && (
        <View style={styles.adLoadingOverlay}>
          <ActivityIndicator size="large" color={theme.neon} />
          <Text style={[styles.adLoadingText, { color: theme.text }]}>
            {t('loading')}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  rootWrapper: { flex: 1 },
  fullContainer: { flex: 1 },
  loadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5DC', zIndex: 100 },
  loadingLogo: { width: 100, height: 100, marginBottom: 20 },
  loadingTitle: { fontFamily: 'BebasNeue', fontSize: 32, color: '#1a1a1a', letterSpacing: 3, marginBottom: 30 },
  loadingBarContainer: { width: 200, height: 4, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 2, overflow: 'hidden' },
  loadingBar: { height: '100%', backgroundColor: '#1a1a1a' },
  loadingText: { fontFamily: 'SpaceMono', fontSize: 14, color: '#333', marginTop: 10 },
  adLoadingOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 200 },
  adLoadingText: { fontFamily: 'SpaceMono', fontSize: 14, marginTop: 12, letterSpacing: 2 },

  // ─── Background ───
  bgBeige: { flex: 1, backgroundColor: '#E5DFC8' },
  bgDark: { flex: 1, backgroundColor: '#0a0a0a' },
  bgGradient: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(180,150,80,0.10)' },
  bgGradientDark: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.15)' },
  bgImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },

  // ─── Mots flottants ───

  // ─── Drapeau langue ───
  langBtn: { position: 'absolute', left: 16, zIndex: 20 },
  flagImage: { width: 52, height: 36, borderRadius: 8, borderWidth: 2.5, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 6 },

  // ─── Zone centrale ───
  centerArea: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60, paddingBottom: 100 },
  centerAreaLight: { justifyContent: 'center', paddingTop: 60 },

  // ─── Titre ───
  titleArea: { alignItems: 'center', marginBottom: 0 },
  titleAreaLight: { marginBottom: 10 },
  logoTitle: { width: 750, height: 250, resizeMode: 'contain' },
  subtitleAbsolute: { textAlign: 'center', fontFamily: 'SpaceMono', fontSize: 11, letterSpacing: 3, fontWeight: 'bold', marginTop: 8 },

  // ─── Bouton Play ───
  safeArea: { alignItems: 'center', justifyContent: 'center' },
  safeAreaLight: { marginTop: 0 },
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
  gameSetupOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  modalContent: { width: '85%', backgroundColor: '#F5F5DC', borderRadius: 20, padding: 16, borderWidth: 2, borderColor: '#1a1a1a', maxHeight: '85%' },
  modalTitle: { fontFamily: 'BebasNeue', fontSize: 24, color: '#1a1a1a', letterSpacing: 2, textAlign: 'center', marginBottom: 10 },
  modalSubtitle: { fontFamily: 'SpaceMono', fontSize: 11, color: '#666', textAlign: 'center', marginBottom: 16 },
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
  modeCard: { width: '47%', backgroundColor: 'transparent', borderWidth: 2, borderRadius: 12, paddingVertical: 8, paddingHorizontal: 6, alignItems: 'center', gap: 1 },
  modeCardImage: { width: '85%', height: 40, marginBottom: 2 },
  modeCardTitle: { fontFamily: 'BebasNeue', fontSize: 13, color: '#1a1a1a', letterSpacing: 1, textAlign: 'center' },
  modeCardDesc: { fontFamily: 'SpaceMono', fontSize: 7, color: '#666', textAlign: 'center', lineHeight: 10 },
  modeCardOuter: { width: '47%', position: 'relative' },
  modeCardAdBadge: { position: 'absolute', top: 2, right: 2, width: 24, height: 24, zIndex: 10 },
  setupSection: { width: '100%', marginBottom: 6 },
  setupLabel: { fontFamily: 'SpaceMono', fontSize: 11, color: '#333', marginBottom: 4 },
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
  categoryChipEmoji: { fontSize: 16 },
  categoryChipText: { fontFamily: 'BebasNeue', fontSize: 14, letterSpacing: 1 },
  categoryWrapper: { alignItems: 'center' },
  adRewardIconSmall: { width: 32, height: 16, marginBottom: 2, alignSelf: 'center' },
  wordInput: { flex: 1, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 10, paddingHorizontal: 15, paddingVertical: 10, fontFamily: 'SpaceMono', fontSize: 14, color: '#1a1a1a', borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)' },
  addWordBtn: { backgroundColor: '#1a1a1a', paddingHorizontal: 20, borderRadius: 10, justifyContent: 'center' },
  addWordBtnDisabled: { backgroundColor: 'rgba(26,26,26,0.3)' },
  addWordBtnText: { fontFamily: 'BebasNeue', fontSize: 14, color: '#F5F5DC', letterSpacing: 1 },
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
});
