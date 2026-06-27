// ═════════════════════════════════════════════════════════════
// UTILITAIRES PLATEFORME
// ═════════════════════════════════════════════════════════════
import { Platform } from 'react-native';
import Constants from 'expo-constants';

export const isWeb = Platform.OS === 'web';
export const isExpoGo = !isWeb && Constants.appOwnership === 'expo';