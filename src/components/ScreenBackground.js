import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

/**
 * Fond d'écran thématique réutilisable.
 * Remplace le pattern dupliqué : <Image bgImage> + <View bgGradient>
 * dans 7+ écrans.
 *
 * Props :
 * - darkTheme: boolean — thème sombre ou clair
 * - style: style supplémentaire sur le conteneur racine
 * - children: contenu de l'écran
 */
export default function ScreenBackground({ darkTheme, style, children }) {
  return (
    <View style={[styles.root, style]}>
      <Image
        source={darkTheme ? require('../../assets/bg-sombre.jpg') : require('../../assets/bg-white.jpg')}
        style={styles.bgImage}
        resizeMode="cover"
      />
      <View style={darkTheme ? styles.bgGradientDark : styles.bgGradientLight} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  bgImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  bgGradientDark: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.15)' },
  bgGradientLight: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(180,150,80,0.10)' },
});