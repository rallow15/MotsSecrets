// ═════════════════════════════════════════════════════════════
// UTILITAIRES STOCKAGE SÉCURISÉ
// ═════════════════════════════════════════════════════════════
import { Platform } from 'react-native';

const isWeb = Platform.OS === 'web';

let SecureStore;
if (!isWeb) {
  try { SecureStore = require('expo-secure-store'); } catch (e) {}
}

export async function safeGetItem(key) {
  if (!SecureStore) return null;
  try { return await SecureStore.getItemAsync(key); } catch (e) { return null; }
}

export async function safeSetItem(key, value) {
  if (!SecureStore) return;
  try { await SecureStore.setItemAsync(key, value); } catch (e) {}
}