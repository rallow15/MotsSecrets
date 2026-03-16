import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';

import MenuScreen   from './src/screens/MenuScreen';
import PrepScreen   from './src/screens/PrepScreen';
import RevealScreen from './src/screens/RevealScreen';
import BlackScreen  from './src/screens/BlackScreen';
import ResultScreen from './src/screens/ResultScreen';
import { generateAssignments } from './src/gameLogic';
import { colors } from './src/theme';

// Bannières masquées en DEV (Expo Go)
let BannerAd, BannerAdSize;
if (!__DEV__) {
  const admob = require('react-native-google-mobile-ads');
  BannerAd     = admob.BannerAd;
  BannerAdSize = admob.BannerAdSize;
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

  useEffect(() => {
    if (__DEV__) return;
    const id = setInterval(() => setAdKey(k => k + 1), 30000);
    return () => clearInterval(id);
  }, []);

  if (!fontsLoaded) {
    return <View style={styles.loading}><ActivityIndicator color={colors.accent} size="large" /></View>;
  }

  return (
    <View style={styles.root}>
      {!__DEV__ && BannerAd && (
        <View style={styles.banner}>
          <BannerAd key={adKey} unitId={BANNER_TOP_ID} size={BannerAdSize.BANNER} requestOptions={{ requestNonPersonalizedAdsOnly: false }} />
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
      {!__DEV__ && BannerAd && (
        <View style={styles.banner}>
          <BannerAd key={adKey + 1} unitId={BANNER_BOTTOM_ID} size={BannerAdSize.BANNER} requestOptions={{ requestNonPersonalizedAdsOnly: false }} />
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
