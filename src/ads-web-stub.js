// Stub vide pour react-native-google-mobile-ads sur le web
// Empêche l'import du module natif qui ne fonctionne pas sur web

export const BannerAd = null;
export const BannerAdSize = { BANNER: 'BANNER' };
export const RewardedAd = {
  createForAdRequest: () => ({ load: () => {}, addAdEventListener: () => () => {} }),
};
export const InterstitialAd = {
  createForAdRequest: () => ({ load: () => {} }),
};
export const TestAdIds = { REWARDED: 'test', BANNER: 'test', INTERSTITIAL: 'test' };
export const MobileAds = () => ({ initialize: async () => {} });
export const AdsConsent = {
  requestInfoUpdate: async () => ({ status: 'NOT_REQUIRED', isConsentFormAvailable: false }),
  loadAndShowConsentFormIfRequired: async () => ({ status: 'OBTAINED' }),
  showConsentForm: async () => ({ status: 'OBTAINED' }),
  reset: async () => {},
};