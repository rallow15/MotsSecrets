// Écran de consentement RGPD personnalisé
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export default function ConsentScreen({ onConsentGiven }) {
  const [accepted, setAccepted] = useState(false);

  const handleAccept = async () => {
    if (!accepted) return;
    await SecureStore.setItemAsync('ump_consent_status', 'given');
    onConsentGiven('given');
  };

  const handleRefuse = async () => {
    await SecureStore.setItemAsync('ump_consent_status', 'refused');
    onConsentGiven('refused');
  };

  const openPrivacyPolicy = () => {
    Linking.openURL('https://policies.google.com/privacy');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Respect de votre vie privée</Text>

        <ScrollView style={styles.scrollView}>
          <Text style={styles.text}>
            Cette application utilise des publicités personnalisées pour financer son développement.
          </Text>

          <Text style={styles.text}>
            En acceptant, vous autorisez l'affichage de publicités adaptées à vos centres d'intérêt.
            Vous pouvez refuser et continuer à utiliser l'application avec des publicités non personnalisées.
          </Text>

          <Text style={styles.text}>
            Vos données sont traitées conformément à la politique de confidentialité de Google :
          </Text>

          <TouchableOpacity onPress={openPrivacyPolicy}>
            <Text style={styles.link}>policies.google.com/privacy</Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.checkboxContainer}>
          <TouchableOpacity
            style={[styles.checkbox, accepted && styles.checkboxChecked]}
            onPress={() => setAccepted(!accepted)}
          >
            {accepted && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
          <Text style={styles.checkboxLabel}>
            J'accepte les publicités personnalisées
          </Text>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.refuseButton]}
            onPress={handleRefuse}
          >
            <Text style={styles.refuseButtonText}>REFUSER</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.acceptButton, !accepted && styles.buttonDisabled]}
            onPress={handleAccept}
            disabled={!accepted}
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#1a1a1a',
  },
  checkmark: {
    color: '#F5F5DC',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: '#333',
    flex: 1,
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
