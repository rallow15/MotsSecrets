import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated,
} from 'react-native';
import { colors } from '../theme';
import { findWinner } from '../gameLogic';

// ─── AdMob ───────────────────────────────────────────────────────────────────
// Remplace l'ID ci-dessous par ton vrai Ad Unit ID depuis admob.google.com
// Format Android : ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX
// Format iOS     : ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX
const INTERSTITIAL_AD_UNIT_ID = __DEV__
  ? 'ca-app-pub-3940256099942544/1033173712' // ID de test Google
  : 'REMPLACE_PAR_TON_AD_UNIT_ID';

let InterstitialAd, AdEventType, TestIds;
try {
  const admob = require('react-native-google-mobile-ads');
  InterstitialAd = admob.InterstitialAd;
  AdEventType = admob.AdEventType;
  TestIds = admob.TestIds;
} catch (e) {
  // AdMob non installé — mode dev sans pub
}

// ─────────────────────────────────────────────────────────────────────────────

export default function ResultScreen({ navigation, route }) {
  const { numPlayers, playerNumbers } = route.params;
  const [mystery] = useState(() => Math.floor(Math.random() * 10) + 1);
  const winner = findWinner(playerNumbers, mystery);

  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animation d'entrée du chiffre
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 120,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Charger la pub interstitielle
    loadAd();
  }, []);

  const adRef = useRef(null);

  const loadAd = () => {
    if (!InterstitialAd) return;
    try {
      const ad = InterstitialAd.createForAdRequest(INTERSTITIAL_AD_UNIT_ID, {
        requestNonPersonalizedAdsOnly: false,
      });
      adRef.current = ad;
      ad.load();
    } catch (e) {}
  };

  const handleNewGame = () => {
    // Afficher la pub si elle est chargée
    if (adRef.current) {
      try {
        adRef.current.show();
      } catch (e) {}
    }
    navigation.navigate('Menu');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>LE CHIFFRE MYSTÈRE EST</Text>

      <Animated.Text
        style={[
          styles.number,
          { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
        ]}
      >
        {mystery}
      </Animated.Text>

      <Text style={styles.winner}>Joueur {winner + 1}</Text>
      <Text style={styles.winnerSub}>COMMENCE EN PREMIER !</Text>

      <TouchableOpacity style={styles.btn} onPress={handleNewGame}>
        <Text style={styles.btnText}>NOUVELLE PARTIE</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  label: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    color: colors.gray,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  number: {
    fontFamily: 'BebasNeue',
    fontSize: 130,
    color: colors.accent,
    lineHeight: 155,
    textShadowColor: 'rgba(232,255,71,0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 40,
  },
  winner: {
    fontFamily: 'BebasNeue',
    fontSize: 40,
    color: colors.text,
    marginTop: 12,
    letterSpacing: 1,
  },
  winnerSub: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    color: colors.gray,
    letterSpacing: 3,
    marginBottom: 40,
  },
  btn: {
    backgroundColor: colors.accent,
    paddingHorizontal: 40,
    paddingVertical: 16,
  },
  btnText: {
    fontFamily: 'BebasNeue',
    fontSize: 24,
    color: colors.bg,
    letterSpacing: 2,
  },
});
