import React, { useEffect, useState } from 'react';
import 'react-native-gesture-handler';
import { View, Text, ActivityIndicator, StyleSheet, Platform, NativeModules } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts } from 'expo-font';
import { isWeb, isExpoGo } from './src/utils/platform';

const Stack = createNativeStackNavigator();

import MenuScreen        from './src/screens/MenuScreen';
import PrepScreen        from './src/screens/PrepScreen';
import RevealScreen      from './src/screens/RevealScreen';
import ResultScreen      from './src/screens/ResultScreen';
import SpyfallGameScreen from './src/screens/SpyfallGameScreen';
import SpyfallGuessScreen from './src/screens/SpyfallGuessScreen';
import SpyfallVoteScreen from './src/screens/SpyfallVoteScreen';
import DrawScreen        from './src/screens/DrawScreen';
import { generateAssignments } from './src/gameLogic';
import { colors, ThemeProvider, setOnThemeChange } from './src/theme';

// Modules natifs — chargés uniquement sur mobile (pas web)
let SecureStore, ConsentScreen, StatusBar;

if (!isWeb) {
  try {
    SecureStore = require('expo-secure-store');
  } catch (e) {}
  try {
    ConsentScreen = require('./src/screens/ConsentScreen').default;
  } catch (e) {}
  try {
    StatusBar = require('expo-status-bar').StatusBar;
  } catch (e) {}
}

// Vérifier si le module natif AdMob existe AVANT de charger le JS
const hasAdMobNative = !isWeb && !isExpoGo && !!NativeModules.RNGoogleMobileAdsModule;

// Bannières AdMob — chargées dynamiquement
let BannerAd = null;
let BannerAdSize = null;

const BANNER_TOP_ID    = isWeb ? '' : (Platform.OS === 'ios' ? 'ca-app-pub-2965679591230669/1687420131' : 'ca-app-pub-2965679591230669/2407188674');
const BANNER_BOTTOM_ID = isWeb ? '' : (Platform.OS === 'ios' ? 'ca-app-pub-2965679591230669/7168735115' : 'ca-app-pub-2965679591230669/8830249922');

function loadAdMob() {
  if (!hasAdMobNative) return false;
  try {
    const admob = require('react-native-google-mobile-ads');
    BannerAd = admob.BannerAd;
    BannerAdSize = admob.BannerAdSize;
    return true;
  } catch (e) {
    return false;
  }
}

function PrepScreenWrapper({ navigation, route }) {
  const { numPlayers, gameMode, currentPlayer, takenNumbers, playerNumbers, playerNames, selectedCategory, selectedCategories, customWords, mimerMode, numUndercovers, numMisterWhites, easyMode, spyfallUndercover, darkTheme, drawingMode, drawRounds } = route.params;

  const _gameMode      = gameMode      ?? 0;
  const _currentPlayer = currentPlayer ?? 0;
  const _takenNumbers  = takenNumbers  ?? [];
  const _playerNumbers = playerNumbers ?? new Array(numPlayers).fill(null);
  const _playerNames   = Array.isArray(playerNames) ? playerNames : new Array(numPlayers).fill('');
  const _customWords = Array.isArray(customWords) ? customWords : [];
  const _mimerMode = mimerMode ?? false;
  const _numUndercovers = numUndercovers ?? 1;
  const _numMisterWhites = numMisterWhites ?? 0;
  const _easyMode = easyMode ?? false;
  const _spyfallUndercover = spyfallUndercover ?? false;
  const _darkTheme = darkTheme ?? false;
  const _drawingMode = drawingMode ?? false;
  const _drawRounds = drawRounds ?? 3;

  // Si multi-sélection de catégories, toujours tirer au sort une nouvelle catégorie
  let _selectedCategory;
  if (Array.isArray(selectedCategories) && selectedCategories.length > 0) {
    _selectedCategory = selectedCategories[Math.floor(Math.random() * selectedCategories.length)];
  } else {
    _selectedCategory = selectedCategory ?? null;
  }

  const assignments = route.params.assignments
    ?? generateAssignments(numPlayers, _gameMode, _selectedCategory, _customWords, _mimerMode, _numUndercovers, _numMisterWhites, _easyMode, _spyfallUndercover);

  // Sécurité : si SPECIALE sans assez de mots, ne pas continuer
  if (Array.isArray(assignments) && assignments[0]?.error === 'SPECIALE_NEEDS_MORE_WORDS') {
    return null;
  }

  return (
    <PrepScreen
      navigation={navigation}
      route={{
        ...route,
        params: {
          numPlayers, gameMode: _gameMode, selectedCategory: _selectedCategory,
          selectedCategories,
          customWords: _customWords, mimerMode: _mimerMode,
          numUndercovers: _numUndercovers, numMisterWhites: _numMisterWhites,
          easyMode: _easyMode, spyfallUndercover: _spyfallUndercover, darkTheme: _darkTheme,
          drawingMode: _drawingMode,
          drawRounds: _drawRounds,
          assignments, currentPlayer: _currentPlayer, takenNumbers: _takenNumbers,
          playerNumbers: _playerNumbers, playerNames: _playerNames,
        },
      }}
    />
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    BebasNeue: require('./assets/fonts/BebasNeue-Regular.ttf'),
    SpaceMono: require('./assets/fonts/SpaceMono-Regular.ttf'),
    ShakeAlone: require('./assets/fonts/ShakeAlone-YqLpj.otf'),
  });
  const [showConsent, setShowConsent] = useState(isWeb ? false : !__DEV__);
  const [consentGiven, setConsentGiven] = useState(isWeb ? 'given' : 'pending');
  const [consentChecked, setConsentChecked] = useState(isWeb);
  const [adMobLoaded, setAdMobLoaded] = useState(false);
  const [darkTheme, setDarkTheme] = useState(false);

  // Register theme change callback in useEffect to avoid side effect during render
  useEffect(() => {
    setOnThemeChange(setDarkTheme);
  }, []);

  // Charger le thème depuis SecureStore au démarrage
  useEffect(() => {
    if (isWeb || !SecureStore) return;
    (async () => {
      try {
        const saved = await SecureStore.getItemAsync('dark_theme');
        if (saved === 'true') setDarkTheme(true);
      } catch (e) {}
    })();
  }, []);

  // Charger AdMob au démarrage (mobile natif avec module natif uniquement)
  useEffect(() => {
    if (!hasAdMobNative) return;
    setAdMobLoaded(loadAdMob());
  }, []);

  // Vérifier le consentement UMP (mobile uniquement)
  useEffect(() => {
    if (isWeb) return;
    const checkConsent = async () => {
      if (__DEV__) {
        setConsentGiven('given');
        setConsentChecked(true);
        return;
      }
      if (isExpoGo) {
        if (SecureStore) {
          const savedConsent = await SecureStore.getItemAsync('ump_consent_status');
          if (savedConsent) {
            setConsentGiven(savedConsent);
            setShowConsent(false);
          }
        }
        setConsentChecked(true);
        return;
      }
      try {
        const { initUMP } = await import('./src/consent/umpConfig');
        const { status, isFormAvailable } = await initUMP();
        if (status === 'OBTAINED' || status === 'NOT_REQUIRED') {
          setConsentGiven('given');
          setShowConsent(false);
        } else if (!isFormAvailable) {
          setConsentGiven('pending');
          setShowConsent(false);
        }
      } catch (e) {
        if (SecureStore) {
          const savedConsent = await SecureStore.getItemAsync('ump_consent_status');
          if (savedConsent) {
            setConsentGiven(savedConsent);
            setShowConsent(false);
          }
        }
      }
      setConsentChecked(true);
    };
    checkConsent();
  }, [isExpoGo]);

  // Initialiser AdMob + rafraîchir les bannières
  useEffect(() => {
    if (!hasAdMobNative) return;
    if (!__DEV__ && adMobLoaded) {
      try {
        const { initAds } = require('./src/ads');
        initAds();
      } catch (e) {}
    }
  }, [adMobLoaded]);

  const handleConsentGiven = (status) => {
    setConsentGiven(status);
    setShowConsent(false);
  };

  if (!fontsLoaded || !consentChecked) {
    return <View style={styles.loading}><ActivityIndicator color={colors.accent} size="large" /></View>;
  }

  if (showConsent && ConsentScreen) {
    return <ConsentScreen onConsentGiven={handleConsentGiven} />;
  }

  return (
    <View style={styles.root}>
      <View style={styles.nav}>
        <ThemeProvider value={darkTheme}>
          <NavigationContainer>
            {!isWeb && StatusBar && <StatusBar style="light" />}
            <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
              <Stack.Screen name="Menu"        component={MenuScreen} options={{ animation: 'fade' }} />
              <Stack.Screen name="Prep"        component={PrepScreenWrapper} options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="Reveal"      component={RevealScreen} options={{ animation: 'fade_from_bottom' }} />
              <Stack.Screen name="Result"      component={ResultScreen} options={{ animation: 'fade_from_bottom' }} />
              <Stack.Screen name="SpyfallGame" component={SpyfallGameScreen} options={{ animation: 'fade_from_bottom' }} />
              <Stack.Screen name="SpyfallGuess" component={SpyfallGuessScreen} options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="SpyfallVote" component={SpyfallVoteScreen} options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="Draw" component={DrawScreen} options={{ animation: 'fade_from_bottom' }} />
            </Stack.Navigator>
          </NavigationContainer>
        </ThemeProvider>
      </View>
      {hasAdMobNative && !__DEV__ && adMobLoaded && BannerAd && (
        <View style={styles.bannerTop}>
          <BannerAd
            unitId={BANNER_TOP_ID}
            size={BannerAdSize.BANNER}
            requestOptions={{
              requestNonPersonalizedAdsOnly: consentGiven === 'refused'
            }}
          />
        </View>
      )}
      {hasAdMobNative && !__DEV__ && adMobLoaded && BannerAd && (
        <View style={styles.bannerBottom}>
          <BannerAd
            unitId={BANNER_BOTTOM_ID}
            size={BannerAdSize.BANNER}
            requestOptions={{
              requestNonPersonalizedAdsOnly: consentGiven === 'refused'
            }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: colors.bg },
  nav:     { flex: 1, paddingTop: 50, paddingBottom: 50 },
  loading: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  bannerTop:    { position: 'absolute', top: 0, left: 0, right: 0, alignItems: 'center', backgroundColor: colors.bg },
  bannerBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, alignItems: 'center', backgroundColor: colors.bg },
});