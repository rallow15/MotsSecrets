// ═════════════════════════════════════════════════════════════
// GESTION DES PUBLICITÉS (AdMob)
// ═════════════════════════════════════════════════════════════

import { RewardedAd, TestAdIds, MobileAds, AdsConsent } from 'react-native-google-mobile-ads';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Détecter si on est dans Expo Go (appartenance à Expo)
const isExpoGo = Constants.appOwnership === 'expo';

// Événements pour les pubs récompensées (v16+)
const REWARDED_EVENT = {
  LOADED: 'rewarded_loaded',
  ERROR: 'error',
  EARNED_REWARD: 'rewarded_earned_reward',
  CLOSED: 'closed',
};

// Initialiser AdMob au démarrage
export async function initAds() {
  if (isExpoGo) {
    console.log('📱 Expo Go détecté - AdMob désactivé');
    return;
  }
  try {
    console.log('🎯 Initialisation AdMob...');
    const adsInstance = MobileAds();
    await adsInstance.initialize();
    console.log('✅ AdMob initialisé avec succès');
  } catch (error) {
    console.log('❌ Erreur init AdMob:', error.message || error);
  }
}

// ────────────────────────────────────────────────────────
// PUBLICITÉ RÉCOMPENSÉE (pour débloquer la catégorie OBJETS)
// ────────────────────────────────────────────────────────

const REWARDED_AD_UNIT = __DEV__
  ? TestAdIds.REWARDED
  : 'ca-app-pub-2965679591230669/8849548689';

let rewardedAdInstance = null;
let onAdEarnedRewardCallback = null;
let isAdLoading = false;

// Charger une pub récompensée
export async function loadRewardedAd() {
  if (isExpoGo) {
    console.log('Expo Go - pub récompensée ignorée');
    return null;
  }
  if (!RewardedAd) {
    console.log('Rewarded Ad non disponible');
    return null;
  }

  if (isAdLoading) {
    console.log('Pub déjà en chargement...');
    return null;
  }

  isAdLoading = true;

  try {
    console.log('Chargement pub récompensée:', REWARDED_AD_UNIT);

    rewardedAdInstance = RewardedAd.createForAdRequest(REWARDED_AD_UNIT, {
      requestNonPersonalizedAdsOnly: false,
      networkExtras: {
        npa: '1'
      }
    });

    return new Promise((resolve) => {
      const unsubscribeLoaded = rewardedAdInstance.addAdEventListener(
        REWARDED_EVENT.LOADED,
        () => {
          console.log('Pub récompensée chargée avec succès');
          unsubscribeLoaded();
          resolve(rewardedAdInstance);
        }
      );

      const unsubscribeError = rewardedAdInstance.addAdEventListener(
        REWARDED_EVENT.ERROR,
        (error) => {
          console.log('Erreur chargement pub:', error);
          unsubscribeError();
          unsubscribeLoaded();
          isAdLoading = false;
          rewardedAdInstance = null;
          resolve(null);
        }
      );

      rewardedAdInstance.load();

      // Timeout après 10 secondes
      setTimeout(() => {
        if (rewardedAdInstance) {
          console.log('Timeout chargement pub');
          isAdLoading = false;
          rewardedAdInstance = null;
          resolve(null);
        }
      }, 10000);
    });
  } catch (error) {
    console.log('Erreur chargement pub récompensée:', error);
    isAdLoading = false;
    return null;
  }
}

// Montrer une pub récompensée
export async function showRewardedAd(onReward) {
  if (!rewardedAdInstance) {
    console.log('Pas de pub récompensée chargée');
    return false;
  }

  return new Promise((resolve) => {
    onAdEarnedRewardCallback = onReward;

    const unsubscribeEarned = rewardedAdInstance.addAdEventListener(
      REWARDED_EVENT.EARNED_REWARD,
      (reward) => {
        console.log('Récompense gagnée:', reward);
        if (onAdEarnedRewardCallback) {
          onAdEarnedRewardCallback(reward);
        }
        unsubscribeEarned();
        resolve(true);
      }
    );

    const unsubscribeClosed = rewardedAdInstance.addAdEventListener(
      REWARDED_EVENT.CLOSED,
      () => {
        console.log('Pub fermée');
        unsubscribeClosed();
        unsubscribeEarned();
        rewardedAdInstance = null;
        isAdLoading = false;
        // Si la pub est fermée sans récompense, on résout quand même
        resolve(false);
      }
    );

    rewardedAdInstance.show().catch((error) => {
      console.log('Erreur affichage pub:', error);
      isAdLoading = false;
      resolve(false);
    });
  });
}

// Charger et montrer une pub récompensée (tout-en-un)
export async function loadAndShowRewardedAd(onReward) {
  console.log('loadAndShowRewardedAd appelé');
  const ad = await loadRewardedAd();
  if (ad) {
    console.log('Pub chargée, affichage...');
    return await showRewardedAd(onReward);
  }
  console.log('Pub non chargée');
  return false;
}

// Vérifier si une pub est prête
export function isRewardedAdReady() {
  return rewardedAdInstance !== null;
}
