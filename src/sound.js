// ═════════════════════════════════════════════════════════════
// GESTION DES SONS
// ═════════════════════════════════════════════════════════════

import { Audio } from 'expo-av';
import { AppState, Platform } from 'react-native';

let isInitialized = false;

// État des sons (peut être modifié depuis les paramètres)
export let soundEnabled = true;
export let musicEnabled = true;
export let sfxEnabled = true; // Effets sonores (click, start, reveal)

// Musique d'ambiance
let backgroundMusic = null;
let isMusicPlaying = false;
let isMusicLoading = false; // Évite les chargements multiples

// Sons avec require statique (obligatoire pour Metro/Expo)
// Si un fichier manque, la valeur sera null et on utilisera le fallback
let soundClick = null, soundStart = null, soundReveal = null, soundIntruder = null;
let soundInnocent = null, soundMister = null, soundWin = null, soundLose = null, soundAmbiance = null;

try {
  soundClick = require('../assets/sounds/click.mp3');
} catch (e) {}
try {
  soundStart = require('../assets/sounds/start.mp3');
} catch (e) {}
try {
  soundReveal = require('../assets/sounds/reveal.mp3');
} catch (e) {}
try {
  soundIntruder = require('../assets/sounds/intruder.mp3');
} catch (e) {}
try {
  soundInnocent = require('../assets/sounds/innocent.mp3');
} catch (e) {}
try {
  soundMister = require('../assets/sounds/mister.mp3');
} catch (e) {}
try {
  soundWin = require('../assets/sounds/win.mp3');
} catch (e) {}
try {
  soundLose = require('../assets/sounds/lose.mp3');
} catch (e) {}
try {
  soundAmbiance = require('../assets/sounds/ambiance.mp3');
} catch (e) {}

const SOUND_ASSETS = {
  click: soundClick,
  start: soundStart,
  reveal: soundReveal,
  intruder: soundIntruder,
  innocent: soundInnocent,
  mister: soundMister,
  win: soundWin,
  lose: soundLose,
  ambiance: soundAmbiance,
};

// Vérifier si le téléphone est en mode silencieux
function isSilentMode() {
  if (Platform.OS === 'ios') {
    // iOS gère automatiquement le mode silencieux avec playsInSilentModeIOS
    return false;
  }
  if (Platform.OS === 'android') {
    // Android - on vérifie via Audio API
    return false; // Expo gère cela automatiquement
  }
  return false;
}

// Écouter les changements d'état de l'application
if (AppState) {
  AppState.addEventListener('change', (state) => {
    if (state === 'background' && backgroundMusic) {
      // Pause musique quand l'app est en arrière-plan
      backgroundMusic.pauseAsync().catch(() => {});
    } else if (state === 'active' && backgroundMusic && isMusicPlaying && musicEnabled && soundEnabled) {
      // Reprendre musique quand l'app revient
      backgroundMusic.playAsync().catch(() => {});
    }
  });
}

// Sons en cours de lecture (pour éviter de les couper)
const playingSounds = {};

// Jouer un fichier audio
async function playAsset(soundKey, isMusic = false) {
  const asset = SOUND_ASSETS[soundKey];
  if (!asset) return false;
  try {
    // Stopper le son précédent du même type s'il existe encore
    if (playingSounds[soundKey]) {
      await playingSounds[soundKey].unloadAsync();
    }
    const { sound } = await Audio.Sound.createAsync(asset, {
      volume: isMusic ? 0.3 : 0.5,
      isLooping: isMusic,
    });
    playingSounds[soundKey] = sound;
    await sound.playAsync();
    // Ne pas décharger - laisser le son finir
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinishPlaying && !isMusic) {
        sound.unloadAsync();
        delete playingSounds[soundKey];
      }
    });
    return true;
  } catch (error) {
    return false;
  }
}

// Génère un WAV simple en base64
function generateWav(frequency, duration, type) {
  const sampleRate = 44100;
  const samples = Math.floor(sampleRate * (duration / 1000));
  const buffer = new ArrayBuffer(44 + samples * 2);
  const view = new DataView(buffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + samples * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, samples * 2, true);

  const amplitude = 0.5;
  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    let sample = type === 'sine' ? Math.sin(2 * Math.PI * frequency * t)
      : type === 'square' ? Math.sign(Math.sin(2 * Math.PI * frequency * t))
      : 2 * ((t * frequency) % 1) - 1;
    sample *= amplitude * (1 - i / samples);
    view.setInt16(44 + i * 2, sample * 32767, true);
  }
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i));
}

async function playTone(frequency, duration, type = 'sine', volume = 0.5) {
  try {
    const { sound } = await Audio.Sound.createAsync(
      { uri: `data:audio/wav;base64,${generateWav(frequency, duration, type)}` },
      { volume }
    );
    await sound.playAsync();
  } catch (e) {}
}

export async function initSounds() {
  if (isInitialized) return;
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: false, // Respecte le mode silencieux
      staysActiveInBackground: true,
    });
    isInitialized = true;
  } catch (error) {
    console.log('Erreur init sons:', error);
  }
}

// Démarrer la musique d'ambiance
export async function startBackgroundMusic() {
  if (!soundEnabled || !musicEnabled || isMusicLoading) return;
  isMusicLoading = true;
  try {
    // Stopper l'ancienne musique si elle existe
    if (backgroundMusic) {
      try {
        await backgroundMusic.stopAsync();
        await backgroundMusic.unloadAsync();
      } catch (e) {}
      backgroundMusic = null;
    }
    isMusicPlaying = false;

    if (soundAmbiance) {
      const { sound } = await Audio.Sound.createAsync(soundAmbiance, {
        volume: 0.3,
        isLooping: true,
      });
      backgroundMusic = sound;
      await sound.playAsync();
      isMusicPlaying = true;
    }
  } catch (error) {
    console.log('Erreur musique ambiance:', error);
  } finally {
    isMusicLoading = false;
  }
}

// Stopper la musique d'ambiance
export async function stopBackgroundMusic() {
  if (!backgroundMusic && !isMusicPlaying) return;
  try {
    if (backgroundMusic) {
      try {
        await backgroundMusic.stopAsync();
      } catch (e) {}
      try {
        await backgroundMusic.unloadAsync();
      } catch (e) {}
      backgroundMusic = null;
    }
    isMusicPlaying = false;
  } catch (error) {
    // Ignorer les erreurs de type "Seeking interrupted"
    if (!error.message?.includes('interrupted')) {
      console.log('Erreur stop musique:', error);
    }
  }
}

// Pause/Reprendre la musique
export async function toggleMusic(play) {
  if (!backgroundMusic) return;
  try {
    if (play) {
      await backgroundMusic.playAsync();
      isMusicPlaying = true;
    } else {
      await backgroundMusic.pauseAsync();
      isMusicPlaying = false;
    }
  } catch (error) {
    console.log('Erreur toggle musique:', error);
  }
}

// Définir l'état des sons (depuis les paramètres)
export function setSoundEnabled(enabled) {
  soundEnabled = enabled;
  if (!enabled) {
    stopBackgroundMusic();
  } else if (musicEnabled) {
    startBackgroundMusic();
  }
}

export function setMusicEnabled(enabled) {
  musicEnabled = enabled;
  if (!enabled) {
    stopBackgroundMusic();
  } else if (soundEnabled) {
    startBackgroundMusic();
  }
}

export function setSfxEnabled(enabled) {
  sfxEnabled = enabled;
}

// Fallback synthétique si le fichier n'existe pas
async function playSound(key, fallback) {
  if (!isInitialized) await initSounds();
  // Vérifier si les sons sont activés
  if (!soundEnabled || !sfxEnabled) return;
  const loaded = await playAsset(key);
  if (!loaded && fallback) fallback();
}

export async function playClick() {
  if (!soundEnabled || !sfxEnabled) return;
  playSound('click', () => playTone(1200, 40, 'sine', 0.15));
}

export function vibrate(pattern = 50) {
  if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(pattern);
}

export function vibrateIntruderFound() {
  if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
}

export async function playStart() {
  if (!soundEnabled || !sfxEnabled) return;
  playSound('start', () => {
    [523, 659, 784].forEach((f, i) => setTimeout(() => playTone(f, 120, 'sine', 0.4), i * 100));
  });
}

export async function playReveal() {
  if (!soundEnabled || !sfxEnabled) return;
  playSound('reveal', () => {
    playTone(440, 100, 'sine', 0.3);
    setTimeout(() => playTone(554, 100, 'sine', 0.3), 100);
  });
}

export async function playIntruderReveal() {
  if (!soundEnabled || !sfxEnabled) return;
  playSound('intruder', () => {
    [180, 150, 120, 100, 80].forEach((f, i) => setTimeout(() => playTone(f, 300, 'sawtooth', 0.5), i * 100));
    setTimeout(() => playTone(60, 400, 'square', 0.4), 400);
  });
  vibrateIntruderFound();
}

export async function playInnocentReveal() {
  if (!soundEnabled || !sfxEnabled) return;
  playSound('innocent', () => {
    [440, 554, 659, 784].forEach((f, i) => setTimeout(() => playTone(f, 150, 'sine', 0.35), i * 100));
  });
}

export async function playMisterWhite() {
  if (!soundEnabled || !sfxEnabled) return;
  playSound('mister', () => {
    playTone(200, 300, 'square', 0.3);
    setTimeout(() => playTone(150, 400, 'square', 0.3), 250);
  });
  vibrate([50, 30, 50]);
}

export async function playWin() {
  if (!soundEnabled || !sfxEnabled) return;
  playSound('win', () => {
    [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => playTone(f, 200, 'sine', 0.4), i * 120));
  });
}

export async function playLose() {
  if (!soundEnabled || !sfxEnabled) return;
  playSound('lose', () => {
    [400, 350, 300, 250].forEach((f, i) => setTimeout(() => playTone(f, 250, 'sawtooth', 0.35), i * 180));
  });
}
