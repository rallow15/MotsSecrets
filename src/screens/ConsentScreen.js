// Écran de consentement RGPD avec Google UMP
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking, ActivityIndicator } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

// Variables UMP (chargées dynamiquement)
let UMPConsentInformation = null;
let loadAndShowConsentForm = null;
let showConsentForm = null;
let initUMP = null;

export default function ConsentScreen({ onConsentGiven }) {
  const [loading, setLoading] = useState(true);
  const [umpError, setUmpError] = useState(null);
  const [consentForm, setConsentForm] = useState(null);

  const isExpoGo = Constants.appOwnership === 'expo';

  // Charger UMP dynamiquement (uniquement si pas Expo Go)
  useEffect(() => {
    if (!isExpoGo) {
      import('../consent/umpConfig')
        .then((mod) => {
          initUMP = mod.initUMP;
          loadAndShowConsentForm = mod.loadAndShowConsentForm;
          showConsentForm = mod.showConsentForm;
          UMPConsentInformation = mod.UMPConsentInformation;
        })
        .catch((e) => {
          console.log('UMP import error:', e);
        });
    }
  }, [isExpoGo]);

  useEffect(() => {
    initConsent();
  }, []);

  async function initConsent() {
    // En Expo Go, on skip UMP (pas de native modules)
    if (isExpoGo) {
      setLoading(false);
      return;
    }

    try {
      const { isFormAvailable } = await initUMP();
      if (isFormAvailable) {
        const form = await loadAndShowConsentForm();
        setConsentForm(form);
      }
    } catch (e) {
      console.log('Erreur UMP:', e);
      setUmpError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  const handleRefuse = async () => {
    if (!isExpoGo) {
      // En prod native, on refuse via UMP
      try {
        UMPConsentInformation.reset();
      } catch (e) {}
    }
    await SecureStore.setItemAsync('ump_consent_status', 'refused');
    onConsentGiven('refused');
  };

  const handleAccept = async () => {
    if (!isExpoGo) {
      // En prod native, on accepte via UMP
      try {
        const { isFormAvailable } = await initUMP();
        if (isFormAvailable) {
          const form = await loadAndShowConsentForm();
          await showConsentForm(form);
          const status = await UMPConsentInformation.getConsentStatus();
          await SecureStore.setItemAsync('ump_consent_status', status);
          onConsentGiven(status);
          return;
        }
      } catch (e) {
        setUmpError(e.message || String(e));
      }
    }
    // Fallback
    await SecureStore.setItemAsync('ump_consent_status', 'given');
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
