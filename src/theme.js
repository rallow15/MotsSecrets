import React, { createContext, useContext } from 'react';

// ─── Context pour le thème (accessible partout sans params de navigation) ───
const ThemeContext = createContext(false);

export function ThemeProvider({ children, value }) {
  return (
    <ThemeContext.Provider value={!!value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useDarkTheme() {
  return useContext(ThemeContext);
}

// ─── État global du thème + callback pour App.js ───
let _darkTheme = false;
let _onThemeChange = null;

export function setGlobalDarkTheme(value) {
  _darkTheme = !!value;
  if (_onThemeChange) _onThemeChange(_darkTheme);
}

export function getGlobalDarkTheme() {
  return _darkTheme;
}

export function setOnThemeChange(cb) {
  _onThemeChange = cb;
}

export const themes = {
  dark: {
    colors: {
      bg: '#080808',
      surface: '#0f0f0f',
      accent: '#e8ff47',
      danger: '#ff4444',
      text: '#ffffff',
      dim: '#2a2a2a',
      border: '#1e1e1e',
      gray: '#aaaaaa',
      muted: '#666666',
      black: '#000000',
    },
    name: 'Sombre',
    bgImage: null,
  },
};

export const colors = themes.dark.colors;

export const fonts = {
  mono: 'SpaceMono',
  display: 'BebasNeue',
  shake: 'ShakeAlone',
};

export const screenThemes = {
  dark: {
    bg: '#0a0a0a',
    surface: '#1a0a2e',
    text: '#e8d5ff',
    textMuted: 'rgba(232,213,255,0.7)',
    textSub: '#e8d5ff',
    accent: '#b44dff',
    accentDark: '#9b30ff',
    border: 'rgba(155,48,255,0.25)',
    btnBg: '#9b30ff',
    btnText: '#fff',
    inputBorder: 'rgba(155,48,255,0.3)',
    dotDone: '#b44dff',
    dotCurrent: '#b44dff',
    catBadgeBg: 'rgba(155,48,255,0.15)',
    catBadgeBorder: 'rgba(155,48,255,0.3)',
    wordColor: '#e8d5ff',
    hintColor: 'rgba(232,213,255,0.7)',
    okBtnBg: '#9b30ff',
    okBtnBorder: 'rgba(155,48,255,0.5)',
    okBtnText: '#fff',
    misterYellow: '#e8ff47',
    danger: '#ff4444',
    backBtnBg: 'rgba(155,48,255,0.15)',
    backBtnBorder: 'rgba(155,48,255,0.4)',
    overlayBg: 'rgba(0,0,0,0.3)',
    bgImage: true,
    bgGradient: 'rgba(0,0,0,0.15)',
    mimerBorder: '#b44dff',
    easyHintBg: 'rgba(232,255,71,0.2)',
    easyHintBorder: 'rgba(232,255,71,0.5)',
    // Menu-specific
    neon: '#b44dff',
    neonDark: '#9b30ff',
    neonGlow: 'rgba(180,77,255,0.4)',
    modalBg: '#1a0a2e',
    modalBorder: '#9b30ff',
    modalOverlay: 'rgba(10,5,30,0.85)',
    cardBg: 'rgba(155,48,255,0.08)',
    cardBorder: 'rgba(155,48,255,0.25)',
    cardActiveBg: '#9b30ff',
    cardActiveBorder: '#b44dff',
    inputBg: 'rgba(155,48,255,0.1)',
    counterBg: 'rgba(155,48,255,0.08)',
    counterBorder: 'rgba(155,48,255,0.2)',
    counterBtnBg: 'rgba(155,48,255,0.15)',
    counterBtnBorder: 'rgba(155,48,255,0.3)',
    chipBg: 'rgba(155,48,255,0.12)',
    chipBorder: 'rgba(155,48,255,0.3)',
    chipActiveBg: '#9b30ff',
    closeBtnBg: '#9b30ff',
    closeBtnText: '#fff',
    launchBtnBg: '#9b30ff',
    launchBtnText: '#fff',
    ruleBg: 'rgba(155,48,255,0.08)',
    ruleBorder: 'rgba(155,48,255,0.2)',
    subtitleColor: 'rgba(232,213,255,0.6)',
    // Variantes alpha pour les cartes de mode (bordure/texte inactif vs actif)
    modeActiveBorder: 'rgba(155,48,255,0.4)',
    modeActiveText: 'rgba(180,77,255,0.7)',
  },
  light: {
    bg: '#E5DFC8',
    surface: '#F5F5DC',
    text: '#1a1a1a',
    textMuted: '#333',
    textSub: '#1a1a1a',
    accent: '#1a1a1a',
    accentDark: '#1a1a1a',
    border: 'rgba(0,0,0,0.15)',
    btnBg: 'rgba(0,0,0,0.05)',
    btnText: '#F5F5DC',
    inputBorder: 'rgba(0,0,0,0.2)',
    dotDone: '#1a1a1a',
    dotCurrent: '#4FC3F7',
    catBadgeBg: 'rgba(0,0,0,0.06)',
    catBadgeBorder: 'rgba(0,0,0,0.2)',
    wordColor: '#1a1a1a',
    hintColor: '#666',
    okBtnBg: '#1a1a1a',
    okBtnBorder: 'rgba(0,0,0,0.3)',
    okBtnText: '#F5F5DC',
    misterYellow: '#e8ff47',
    danger: '#ff4444',
    backBtnBg: 'rgba(0,0,0,0.1)',
    backBtnBorder: 'rgba(0,0,0,0.2)',
    overlayBg: 'rgba(0,0,0,0.3)',
    bgImage: true,
    bgGradient: 'rgba(180,150,80,0.10)',
    mimerBorder: '#1a1a1a',
    easyHintBg: 'rgba(232,255,71,0.3)',
    easyHintBorder: '#e8ff47',
    // Menu-specific
    neon: '#1a1a1a',
    neonDark: '#1a1a1a',
    neonGlow: 'transparent',
    modalBg: '#F5F5DC',
    modalBorder: '#1a1a1a',
    modalOverlay: 'rgba(0,0,0,0.3)',
    cardBg: '#F5F5DC',
    cardBorder: 'rgba(0,0,0,0.15)',
    cardActiveBg: '#1a1a1a',
    cardActiveBorder: '#1a1a1a',
    inputBg: 'rgba(0,0,0,0.05)',
    counterBg: 'rgba(0,0,0,0.04)',
    counterBorder: 'rgba(0,0,0,0.08)',
    counterBtnBg: 'rgba(0,0,0,0.08)',
    counterBtnBorder: 'rgba(0,0,0,0.15)',
    chipBg: 'rgba(0,0,0,0.1)',
    chipBorder: 'rgba(0,0,0,0.2)',
    chipActiveBg: '#1a1a1a',
    closeBtnBg: '#1a1a1a',
    closeBtnText: '#F5F5DC',
    launchBtnBg: '#1a1a1a',
    launchBtnText: '#F5F5DC',
    ruleBg: 'rgba(0,0,0,0.05)',
    ruleBorder: 'rgba(0,0,0,0.15)',
    subtitleColor: '#666',
    // Variantes alpha pour les cartes de mode (bordure/texte inactif vs actif)
    modeActiveBorder: 'rgba(0,0,0,0.2)',
    modeActiveText: 'rgba(0,0,0,0.5)',
  },
};