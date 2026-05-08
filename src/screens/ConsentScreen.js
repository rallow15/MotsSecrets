import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking, ActivityIndicator, Platform } from 'react-native';
import Constants from 'expo-constants';

const isWeb = Platform.OS === 'web';

// SecureStore — uniquement mobile
let SecureStore;
if (!isWeb) {
  try { SecureStore = require('expo-secure-store'); } catch (e) {}
}

const safeSetItem = async (key, value) => {
  if (!SecureStore) return;
  try { await SecureStore.setItemAsync(key, value); } catch (e) {}
};

let AdsConsent = null;
let initUMP = null;
let loadAndShowConsentForm = null;
let showConsentForm = null;

export default function ConsentScreen({ onConsentGiven }) {
  const [loading, setLoading] = useState(true);
  const [umpError, setUmpError] = useState(null);

  const isExpoGo = Constants.appOwnership === 'expo';

  useEffect(() => {
    if (!isExpoGo) {
      import('../consent/umpConfig')
        .then((mod) => {
          initUMP = mod.initUMP;
          loadAndShowConsentForm = mod.loadAndShowConsentForm;
          showConsentForm = mod.showConsentForm;
          AdsConsent = mod.AdsConsent;
        })
        .catch((e) => console.log('UMP import error:', e));
    }
  }, [isExpoGo]);

  useEffect(() => {
    initConsent();
  }, []);

  async function initConsent() {
    if (isExpoGo) {
      setLoading(false);
      return;
    }

    try {
      if (!initUMP) {
        const mod = await import('../consent/umpConfig');
        initUMP = mod.initUMP;
        loadAndShowConsentForm = mod.loadAndShowConsentForm;
        showConsentForm = mod.showConsentForm;
        AdsConsent = mod.AdsConsent;
      }

      const { isFormAvailable, status } = await initUMP();

      // Si consentement déjà obtenu ou pas requis, on valide directement
      if (status === 'OBTAINED' || status === 'NOT_REQUIRED') {
        await safeSetItem('ump_consent_status', 'given');
        onConsentGiven('given');
        return;
      }

      // Si un formulaire est disponible, le montrer automatiquement
      if (isFormAvailable) {
        const result = await loadAndShowConsentForm();
        const finalStatus = result?.status || 'UNKNOWN';
        if (finalStatus === 'OBTAINED') {
          await safeSetItem('ump_consent_status', 'given');
          onConsentGiven('given');
          return;
        }
      }
    } catch (e) {
      console.log('Erreur UMP:', e);
      setUmpError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  const handleRefuse = async () => {
    if (!isExpoGo && AdsConsent) {
      try { await AdsConsent.reset(); } catch (e) {}
    }
    await safeSetItem('ump_consent_status', 'refused');
    onConsentGiven('refused');
  };

  const handleAccept = async () => {
    if (!isExpoGo) {
      try {
        if (!initUMP) {
          const mod = await import('../consent/umpConfig');
          initUMP = mod.initUMP;
          loadAndShowConsentForm = mod.loadAndShowConsentForm;
          showConsentForm = mod.showConsentForm;
          AdsConsent = mod.AdsConsent;
        }

        const { isFormAvailable } = await initUMP();
        if (isFormAvailable) {
          const result = await showConsentForm();
          const status = result?.status;
          if (status === 'OBTAINED') {
            await safeSetItem('ump_consent_status', 'given');
            onConsentGiven('given');
            return;
          }
        }
      } catch (e) {
        setUmpError(e.message || String(e));
      }
    }
    await safeSetItem('ump_consent_status', 'given');
    onConsentGiven('given');
  };

  const openPrivacyPolicy = () => {
    Linking.openURL('https://policies.google.com/privacy');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color="#1a1a1a" size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Respect de votre vie privée</Text>

        <ScrollView style={styles.scrollView}>
          <Text style={styles.text}>
            Cette application utilise des publicités personnalisées pour financer son développement.
          </Text>

          <Text style={styles.text}>
            Conformément au RGPD et à la réglementation européenne, vous pouvez choisir d'accepter ou de refuser les publicités personnalisées.
          </Text>

          <Text style={styles.text}>
            Vos données sont traitées conformément à la politique de confidentialité de Google :
          </Text>

          <TouchableOpacity onPress={openPrivacyPolicy}>
            <Text style={styles.link}>policies.google.com/privacy</Text>
          </TouchableOpacity>

          {umpError && (
            <Text style={styles.error}>
             Erreur de chargement: {umpError}
            </Text>
          )}
        </ScrollView>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.refuseButton]}
            onPress={handleRefuse}
          >
            <Text style={styles.refuseButtonText}>REFUSER</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.acceptButton]}
            onPress={handleAccept}
          >
            <Text style={styles.acceptButtonText}>ACCEPTER</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: '#F5F5DC',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  title: {
    fontFamily: 'BebasNeue',
    fontSize: 28,
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 2,
  },
  scrollView: {
    maxHeight: 250,
    marginBottom: 16,
  },
  text: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  link: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: '#0066cc',
    textDecorationLine: 'underline',
    marginBottom: 12,
  },
  error: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: '#cc0000',
    backgroundColor: '#ffe6e6',
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  refuseButton: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderWidth: 2,
    borderColor: '#1a1a1a',
  },
  refuseButtonText: {
    fontFamily: 'BebasNeue',
    fontSize: 18,
    color: '#1a1a1a',
    letterSpacing: 1,
  },
  acceptButton: {
    backgroundColor: '#1a1a1a',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  acceptButtonText: {
    fontFamily: 'BebasNeue',
    fontSize: 18,
    color: '#F5F5DC',
    letterSpacing: 1,
  },
});