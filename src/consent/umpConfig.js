// Configuration Google UMP (User Messaging Platform)
import Constants from 'expo-constants';

const APP_ID = 'ca-app-pub-2965679591230669~3729086376';

// Détecter si on est dans Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

// Variables pour les modules UMP (chargés dynamiquement)
let UMPConsentInformation = null;
let UMPConsentForm = null;
let UMPDebugUserInfo = null;

// Charger les modules UMP dynamiquement
function loadUMPModules() {
  if (isExpoGo) {
    console.log('Expo Go détecté - UMP désactivé');
    return false;
  }
  try {
    const ump = require('react-native-google-ump');
    UMPConsentInformation = ump.UMPConsentInformation;
    UMPConsentForm = ump.UMPConsentForm;
    UMPDebugUserInfo = ump.UMPDebugUserInfo;
    console.log('✅ Modules UMP chargés');
    return true;
  } catch (e) {
    console.log('❌ Modules UMP non disponibles:', e.message);
    return false;
  }
}

export async function initUMP() {
  // En Expo Go, UMP n'est pas disponible
  if (isExpoGo) {
    console.log('Expo Go détecté - UMP skip');
    return { status: 'given', isFormAvailable: false };
  }

  if (!loadUMPModules()) {
    console.log('UMP modules non chargés');
    return { status: 'given', isFormAvailable: false };
  }

  return new Promise((resolve, reject) => {
    const debugConfig = new UMPDebugUserInfo();
    debugConfig.debugGeography = 0; // 0 = EEA (par défaut pour test), 1 = Non-EEA, 2 = Disabled
    debugConfig.debugDevice = []; // Ajoute ton device ID ici pour tester

    const consentRequestParameters = {
      debugGeography: debugConfig.debugGeography,
      tagForUnderAgeOfConsent: false,
      testDeviceIdentifiers: debugConfig.debugDevice,
    };

    UMPConsentInformation.requestConsentInfoUpdate(
      consentRequestParameters,
      async () => {
        try {
          const status = await UMPConsentInformation.getConsentStatus();
          const isFormAvailable = await UMPConsentInformation.isConsentFormAvailable();
          resolve({ status, isFormAvailable });
        } catch (e) {
          reject(e);
        }
      },
      (error) => reject(error)
    );
  });
}

export async function loadAndShowConsentForm() {
  if (!UMPConsentForm) {
    console.log('UMPConsentForm non disponible, tentative de chargement...');
    if (!loadUMPModules()) {
      throw new Error('UMP modules non chargés');
    }
  }
  return new Promise((resolve, reject) => {
    UMPConsentForm.loadConsentForm(
      (consentForm) => {
        console.log('Formulaire UMP chargé avec succès');
        resolve(consentForm);
      },
      (error) => {
        console.log('Erreur chargement formulaire UMP:', error);
        reject(error);
      }
    );
  });
}

export async function showConsentForm(consentForm) {
  if (!consentForm) {
    throw new Error('No consent form loaded');
  }
  return new Promise((resolve, reject) => {
    consentForm.show((error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

export async function getConsentStatus() {
  if (!UMPConsentInformation) return null;
  try {
    return await UMPConsentInformation.getConsentStatus();
  } catch (e) {
    return null;
  }
}

export async function resetConsentInformation() {
  if (UMPConsentInformation) {
    UMPConsentInformation.reset();
  }
}

export { UMPConsentInformation, UMPConsentForm };
