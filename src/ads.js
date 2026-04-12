// ═════════════════════════════════════════════════════════════
// GESTION DES PUBLICITÉS (AdMob)
// ═════════════════════════════════════════════════════════════

import Constants from 'expo-constants';

// Détecter si on est dans Expo Go (appartenance à Expo)
const isExpoGo = Constants.appOwnership === 'expo';

// Événements pour les pubs récompensées (v16+)
const REWARDED_EVENT = {
  LOADED: 'rewarded_loaded',
  ERROR: 'error',
  EARNED_REWARD: 'rewarded_earned_reward',
  CLOSED: 'closed',
};

// Variables pour les modules AdMob (chargés dynamiquement)
let RewardedAd = null;
let TestAdIds = null;
let MobileAds = null;

// Charger les modules AdMob dynamiquement
function loadAdMobModules() {
  if (isExpoGo) return false;
  try {
    const admob = require('react-native-google-mobile-ads');
    RewardedAd = admob.RewardedAd;
    TestAdIds = admob.TestAdIds;
    MobileAds = admob.MobileAds;
    return true;
  } catch (e) {
    console.log('❌ AdMob modules non disponibles:', e.message);
    return false;
  }
}

// Initialiser AdMob au démarrage
export async function initAds() {
  if (isExpoGo) {
    console.log('📱 Expo Go détecté - AdMob désactivé');
    return;
  }
  if (!loadAdMobModules()) {
    console.log('❌ Modules AdMob non chargés');
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

const REWARDED_AD_UNIT_PROD = 'ca-app-pub-2965679591230669/1666315394';

let rewardedAdInstance = null;
let onAdEarnedRewardCallback = null;
let isAdLoading = false;

// Charger une pub récompensée
export async function loadRewardedAd() {
  if (isExpoGo) {
    console.log('Expo Go - pub récompensée ignorée');
    return null;
  }
  if (!loadAdMobModules() || !RewardedAd) {
    console.log('Rewarded Ad non disponible');
    return null;
  }

  if (isAdLoading) {
    console.log('Pub déjà en chargement...');
    return null;
  }

  isAdLoading = true;

  const adUnitId = __DEV__ ? TestAdIds.REWARDED : REWARDED_AD_UNIT_PROD;

  try {
    console.log('Chargement pub récompensée:', adUnitId);

    rewardedAdInstance = RewardedAd.createForAdRequest(adUnitId, {
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
