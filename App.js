import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import * as SecureStore from 'expo-secure-store';
import { initAds } from './src/ads';
import Constants from 'expo-constants';

import MenuScreen     from './src/screens/MenuScreen';
import PrepScreen     from './src/screens/PrepScreen';
import RevealScreen   from './src/screens/RevealScreen';
import BlackScreen    from './src/screens/BlackScreen';
import ResultScreen   from './src/screens/ResultScreen';
import ConsentScreen  from './src/screens/ConsentScreen';
import { generateAssignments } from './src/gameLogic';
import { colors } from './src/theme';

// Bannières et consentement
let BannerAd, BannerAdSize;

try {
  console.log('🎯 Chargement AdMob...');
  const admob = require('react-native-google-mobile-ads');
  BannerAd     = admob.BannerAd;
  BannerAdSize = admob.BannerAdSize;
  console.log('✅ AdMob chargé avec succès');
} catch (e) {
  console.log('❌ AdMob non disponible:', e.message || e);
}

const Stack = createNativeStackNavigator();
const BANNER_TOP_ID    = 'ca-app-pub-2965679591230669/2407188674';
const BANNER_BOTTOM_ID = 'ca-app-pub-2965679591230669/8830249922';

function PrepScreenWrapper({ navigation, route }) {
  const { numPlayers, gameMode, currentPlayer, takenNumbers, playerNumbers, playerNames } = route.params;

  const _gameMode      = gameMode      ?? 0;
  const _currentPlayer = currentPlayer ?? 0;
  const _takenNumbers  = takenNumbers  ?? [];
  const _playerNumbers = playerNumbers ?? new Array(numPlayers).fill(null);
  const _playerNames   = Array.isArray(playerNames) ? playerNames : new Array(numPlayers).fill('');

  // Générer assignments une seule fois (absent = première entrée dans Prep)
  const assignments = route.params.assignments
    ?? generateAssignments(numPlayers, _gameMode);

  return (
    <PrepScreen
      navigation={navigation}
      route={{
        ...route,
        params: {
          numPlayers,
          gameMode:      _gameMode,
          assignments,
          currentPlayer: _currentPlayer,
          takenNumbers:  _takenNumbers,
          playerNumbers: _playerNumbers,
          playerNames:   _playerNames,
        },
      }}
    />
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    BebasNeue: require('./assets/fonts/BebasNeue-Regular.ttf'),
    SpaceMono: require('./assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [adKey, setAdKey] = useState(0);
  const [showConsent, setShowConsent] = useState(!__DEV__); // En prod, on affiche par défaut
  const [consentGiven, setConsentGiven] = useState('pending');
  const [consentChecked, setConsentChecked] = useState(false);

  // Détecter si on est dans Expo Go (pas de AdMob)
  const isExpoGo = !Constants.expoConfig?.extra?.eas?.projectId;

  // Vérifier le consentement IMMÉDIATEMENT (sans attendre AdMob)
  useEffect(() => {
    const checkConsent = async () => {
      if (__DEV__) {
        setConsentGiven('given');
        setConsentChecked(true);
        return;
      }

      try {
        const savedConsent = await SecureStore.getItemAsync('ump_consent_status');
        if (savedConsent) {
          setConsentGiven(savedConsent);
          setShowConsent(false);
        }
        // Sinon, on garde showConsent à true
      } catch (e) {}
      setConsentChecked(true);
    };
    checkConsent();
  }, []);

  // Initialiser AdMob (en parallèle, ne bloque pas le consentement)
  useEffect(() => {
    if (!__DEV__ && !isExpoGo) {
      initAds();
    }
    const id = setInterval(() => setAdKey(k => k + 1), 30000);
    return () => clearInterval(id);
  }, []);

  const handleConsentGiven = (status) => {
    setConsentGiven(status);
    setShowConsent(false);
  };

  if (!fontsLoaded || !consentChecked) {
    return <View style={styles.loading}><ActivityIndicator color={colors.accent} size="large" /></View>;
  }

  // Afficher l'écran de consentement
  if (showConsent) {
    return <ConsentScreen onConsentGiven={handleConsentGiven} />;
  }

  return (
    <View style={styles.root}>
      {!__DEV__ && !isExpoGo && BannerAd && (
        <View style={styles.banner}>
          <BannerAd
            key={adKey}
            unitId={BANNER_TOP_ID}
            size={BannerAdSize.BANNER}
            requestOptions={{
              requestNonPersonalizedAdsOnly: consentGiven === 'refused'
            }}
          />
        </View>
      )}
      <View style={styles.nav}>
        <NavigationContainer>
          <StatusBar style="light" backgroundColor={colors.bg} />
          <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade', contentStyle: { backgroundColor: colors.bg } }}>
            <Stack.Screen name="Menu"   component={MenuScreen} />
            <Stack.Screen name="Prep"   component={PrepScreenWrapper} />
            <Stack.Screen name="Reveal" component={RevealScreen} />
            <Stack.Screen name="Black"  component={BlackScreen} />
            <Stack.Screen name="Result" component={ResultScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </View>
      {!__DEV__ && !isExpoGo && BannerAd && (
        <View style={styles.banner}>
          <BannerAd
            key={adKey + 1}
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
  nav:     { flex: 1 },
  loading: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' },
  banner:  { alignItems: 'center', backgroundColor: colors.bg },
});
