// ═════════════════════════════════════════════════════════════
// GESTION DES PUBLICITÉS (AdMob)
// ═════════════════════════════════════════════════════════════

import { Platform, NativeModules } from 'react-native';
import { isWeb, isExpoGo } from './utils/platform';

const hasAdMobNative = !isWeb && !isExpoGo && !!NativeModules.RNGoogleMobileAdsModule;

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
  if (!hasAdMobNative) return false;
  try {
    const admob = require('react-native-google-mobile-ads');
    RewardedAd = admob.RewardedAd;
    TestAdIds = admob.TestAdIds;
    MobileAds = admob.MobileAds;
    return true;
  } catch (e) {
    if (__DEV__) console.log('❌ AdMob modules non disponibles:', e.message);
    return false;
  }
}

// Initialiser AdMob au démarrage
export async function initAds() {
  if (!hasAdMobNative) {
    if (__DEV__) console.log('📱 AdMob désactivé (module natif absent)');
    return;
  }
  if (!loadAdMobModules()) {
    if (__DEV__) console.log('❌ Modules AdMob non chargés');
    return;
  }
  try {
    if (__DEV__) console.log('🎯 Initialisation AdMob...');
    const adsInstance = MobileAds();
    await adsInstance.initialize();
    if (__DEV__) console.log('✅ AdMob initialisé avec succès');
  } catch (error) {
    if (__DEV__) console.log('❌ Erreur init AdMob:', error.message || error);
  }
}

// ────────────────────────────────────────────────────────
// PUBLICITÉ RÉCOMPENSÉE (pour débloquer la catégorie OBJETS)
// ────────────────────────────────────────────────────────

const REWARDED_AD_UNIT_PROD = Platform.OS === 'ios' ? 'ca-app-pub-2965679591230669/5719922073' : 'ca-app-pub-2965679591230669/1666315394';
const REWARDED_AD_UNIT_MIME_PROD = Platform.OS === 'ios' ? 'ca-app-pub-2965679591230669/5855653449' : 'ca-app-pub-2965679591230669/2045589346';
const REWARDED_AD_UNIT_OBJECTS_PROD = Platform.OS === 'ios' ? 'ca-app-pub-2965679591230669/5435093458' : 'ca-app-pub-2965679591230669/8849548689';

let rewardedAdInstance = null;
let onAdEarnedRewardCallback = null;
let isAdLoading = false;

// Callback pour notifier l'UI du chargement
let _onLoadingChange = null;

export function setOnLoadingChange(cb) {
  _onLoadingChange = cb;
}

export function isAdLoadingState() {
  return isAdLoading;
}

// Charger une pub récompensée
export async function loadRewardedAd(adType = 'default') {
  if (!hasAdMobNative) {
    if (__DEV__) console.log('Expo Go - pub récompensée ignorée');
    return null;
  }
  if (!loadAdMobModules() || !RewardedAd) {
    if (__DEV__) console.log('Rewarded Ad non disponible');
    return null;
  }

  if (isAdLoading) {
    if (__DEV__) console.log('Pub déjà en chargement...');
    return null;
  }

  isAdLoading = true;
  if (_onLoadingChange) _onLoadingChange(true);

  const prodId = adType === 'mime' ? REWARDED_AD_UNIT_MIME_PROD : adType === 'objects' ? REWARDED_AD_UNIT_OBJECTS_PROD : REWARDED_AD_UNIT_PROD;
  const adUnitId = __DEV__ ? TestAdIds.REWARDED : prodId;

  try {
    if (__DEV__) console.log('Chargement pub récompensée:', adUnitId);

    rewardedAdInstance = RewardedAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: false,
      networkExtras: {
        npa: '1'
      }
    });

    return new Promise((resolve) => {
      let settled = false;
      const finish = (value) => {
        if (settled) return;
        settled = true;
        isAdLoading = false;
        if (_onLoadingChange) _onLoadingChange(false);
        clearTimeout(timeoutId);
        resolve(value);
      };

      const unsubscribeLoaded = rewardedAdInstance.addAdEventListener(
        REWARDED_EVENT.LOADED,
        () => {
          if (__DEV__) console.log('Pub récompensée chargée avec succès');
          unsubscribeLoaded();
          unsubscribeError();
          finish(rewardedAdInstance);
        }
      );

      const unsubscribeError = rewardedAdInstance.addAdEventListener(
        REWARDED_EVENT.ERROR,
        (error) => {
          if (__DEV__) console.log('Erreur chargement pub:', error);
          unsubscribeLoaded();
          unsubscribeError();
          rewardedAdInstance = null;
          finish(null);
        }
      );

      rewardedAdInstance.load();

      // Timeout après 10 secondes — unsubscribe proprement les listeners
      const timeoutId = setTimeout(() => {
        if (settled) return;
        if (__DEV__) console.log('Timeout chargement pub');
        unsubscribeLoaded();
        unsubscribeError();
        rewardedAdInstance = null;
        finish(null);
      }, 10000);
    });
  } catch (error) {
    if (__DEV__) console.log('Erreur chargement pub récompensée:', error);
    isAdLoading = false;
    if (_onLoadingChange) _onLoadingChange(false);
    return null;
  }
}

// Montrer une pub récompensée
export async function showRewardedAd(onReward) {
  if (!rewardedAdInstance) {
    if (__DEV__) console.log('Pas de pub récompensée chargée');
    return false;
  }

  return new Promise((resolve) => {
    let settled = false;
    const finish = (value) => {
      if (settled) return;
      settled = true;
      onAdEarnedRewardCallback = null;
      rewardedAdInstance = null;
      isAdLoading = false;
      if (_onLoadingChange) _onLoadingChange(false);
      resolve(value);
    };

    onAdEarnedRewardCallback = onReward;

    const unsubscribeEarned = rewardedAdInstance.addAdEventListener(
      REWARDED_EVENT.EARNED_REWARD,
      (reward) => {
        if (__DEV__) console.log('Récompense gagnée:', reward);
        if (onAdEarnedRewardCallback) {
          onAdEarnedRewardCallback(reward);
        }
        unsubscribeEarned();
        unsubscribeClosed();
        finish(true);
      }
    );

    const unsubscribeClosed = rewardedAdInstance.addAdEventListener(
      REWARDED_EVENT.CLOSED,
      () => {
        if (__DEV__) console.log('Pub fermée');
        unsubscribeClosed();
        unsubscribeEarned();
        finish(false);
      }
    );

    rewardedAdInstance.show().catch((error) => {
      if (__DEV__) console.log('Erreur affichage pub:', error);
      unsubscribeEarned();
      unsubscribeClosed();
      finish(false);
    });
  });
}

// Charger et montrer une pub récompensée (tout-en-un)
export async function loadAndShowRewardedAd(onReward, adType = 'default') {
  if (__DEV__) console.log('loadAndShowRewardedAd appelé, type:', adType);
  const ad = await loadRewardedAd(adType);
  if (ad) {
    if (__DEV__) console.log('Pub chargée, affichage...');
    return await showRewardedAd(onReward);
  }
  if (__DEV__) console.log('Pub non chargée');
  return false;
}

// Vérifier si une pub est prête
export function isRewardedAdReady() {
  return rewardedAdInstance !== null;
}