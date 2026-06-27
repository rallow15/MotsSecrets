import React from 'react';
import { TouchableOpacity, ImageBackground, Text, StyleSheet } from 'react-native';

/**
 * Bouton thématique qui change d'image de fond selon le thème.
 * Remplace le pattern répété : darkTheme ? LAUNCH_BTN : LAUNCH_BTN_LIGHT
 */
export default function ThemedButton({ darkTheme, onPress, text, disabled, style }) {
  const source = darkTheme ? require('../../assets/launch-btn.png') : require('../../assets/launch-btn-light.png');
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled}
      style={style}
    >
      <ImageBackground source={source} style={styles.launchBtnImage} resizeMode="stretch">
        <Text style={styles.launchBtnOverlayText}>{text}</Text>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  launchBtnImage: { width: '100%', height: 56, justifyContent: 'center', alignItems: 'center' },
  launchBtnOverlayText: { fontFamily: 'BebasNeue', fontSize: 16, color: '#F5F5DC', letterSpacing: 2, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
});