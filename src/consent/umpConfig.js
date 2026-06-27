import { NativeModules } from 'react-native';
import { isExpoGo } from '../utils/platform';

let AdsConsent = null;

function loadAdsConsent() {
  if (isExpoGo || !NativeModules.RNGoogleMobileAdsModule) {
    if (__DEV__) console.log('AdsConsent désactivé (Expo Go ou module natif absent)');
    return false;
  }
  try {
    const admob = require('react-native-google-mobile-ads');
    AdsConsent = admob.AdsConsent;
    if (__DEV__) console.log('AdsConsent chargé');
    return true;
  } catch (e) {
    if (__DEV__) console.log('AdsConsent non disponible:', e.message);
    return false;
  }
}

export async function initUMP() {
  if (isExpoGo) {
    return { status: 'OBTAINED', isFormAvailable: false };
  }

  if (!loadAdsConsent()) {
    return { status: 'OBTAINED', isFormAvailable: false };
  }

  try {
    const consentInfo = await AdsConsent.requestInfoUpdate();
    return {
      status: consentInfo.status,
      isFormAvailable: consentInfo.isConsentFormAvailable,
    };
  } catch (e) {
    if (__DEV__) console.log('AdsConsent requestInfoUpdate error:', e.message);
    return { status: 'UNKNOWN', isFormAvailable: false };
  }
}

export async function loadAndShowConsentForm() {
  if (!AdsConsent && !loadAdsConsent()) {
    throw new Error('AdsConsent non disponible');
  }
  const result = await AdsConsent.loadAndShowConsentFormIfRequired();
  return result;
}

export async function showConsentForm() {
  if (!AdsConsent && !loadAdsConsent()) {
    throw new Error('AdsConsent non disponible');
  }
  return await AdsConsent.showConsentForm();
}

export async function getConsentStatus() {
  if (!AdsConsent) return null;
  try {
    const info = await AdsConsent.requestInfoUpdate();
    return info.status;
  } catch (e) {
    return null;
  }
}

export async function resetConsentInformation() {
  if (AdsConsent) {
    try { await AdsConsent.reset(); } catch (e) {}
  }
}

export { AdsConsent };