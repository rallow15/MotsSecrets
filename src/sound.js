// ═════════════════════════════════════════════════════════════
// GESTION DES SONS (expo-audio — remplace expo-av déprécié)
// ═════════════════════════════════════════════════════════════

import { AppState, Platform, Vibration } from 'react-native';

const isWeb = Platform.OS === 'web';

// Charger expo-audio dynamiquement (pas disponible sur web)
let createAudioPlayer, setAudioModeAsync;
if (!isWeb) {
  try {
    const audio = require('expo-audio');
    createAudioPlayer = audio.createAudioPlayer;
    setAudioModeAsync = audio.setAudioModeAsync;
  } catch (e) {
    if (__DEV__) console.log('⚠️ expo-audio non disponible');
  }
}

let isInitialized = false;

// État des sons
export let soundEnabled = true;
export let musicEnabled = true;
export let sfxEnabled = true;
export let musicVolume = 0.3;
export let sfxVolume = 0.3;

// Musique d'ambiance
let backgroundMusic = null;
let isMusicPlaying = false;
let isMusicLoading = false;

// Sons avec require statique
let soundClick = null, soundStart = null, soundReveal = null, soundIntruder = null;
let soundInnocent = null, soundMister = null, soundWin = null, soundLose = null, soundAmbiance = null;

try { soundClick = require('../assets/sounds/click.mp3'); } catch (e) {}
try { soundStart = require('../assets/sounds/start.mp3'); } catch (e) {}
try { soundReveal = require('../assets/sounds/reveal.mp3'); } catch (e) {}
try { soundIntruder = require('../assets/sounds/intruder.mp3'); } catch (e) {}
try { soundInnocent = require('../assets/sounds/innocent.mp3'); } catch (e) {}
try { soundMister = require('../assets/sounds/mister.mp3'); } catch (e) {}
try { soundWin = require('../assets/sounds/win.mp3'); } catch (e) {}
try { soundLose = require('../assets/sounds/lose.mp3'); } catch (e) {}
try { soundAmbiance = require('../assets/sounds/ambiance.mp3'); } catch (e) {}

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

// Sons en cours de lecture
const playingSounds = {};

// Écouter les changements d'état de l'application
if (AppState) {
  AppState.addEventListener('change', (state) => {
    try {
      if (state === 'background' && backgroundMusic) {
        backgroundMusic.pause();
        isMusicPlaying = false;
      } else if (state === 'active' && backgroundMusic && musicEnabled && soundEnabled) {
        backgroundMusic.play();
        isMusicPlaying = true;
      }
    } catch (e) {
      if (__DEV__) console.log('Erreur AppState musique:', e);
    }
  });
}

// Jouer un fichier audio avec expo-audio
async function playAsset(soundKey, isMusic = false) {
  const asset = SOUND_ASSETS[soundKey];
  if (!asset) return false;
  try {
    if (playingSounds[soundKey]) {
      try { playingSounds[soundKey].remove(); } catch (e) { /* already removed */ }
    }
    const player = createAudioPlayer(asset);
    player.volume = isMusic ? musicVolume : sfxVolume;
    player.loop = isMusic;
    playingSounds[soundKey] = player;

    // Nettoyage auto des SFX one-shot après fin de lecture (évite l'accumulation
    // de players non-libérés dans playingSounds).
    if (!isMusic) {
      let sub = null;
      try {
        sub = player.addListener?.('playbackStatusUpdate', (status) => {
          if (status && (status.didJustFinish || status.isLoaded === false)) {
            try { player.remove(); } catch (e) {}
            if (playingSounds[soundKey] === player) delete playingSounds[soundKey];
            try { sub && sub.remove(); } catch (e) {}
          }
        });
      } catch (e) { /* listener indisponible */ }
      // Garde de sécurité : nettoyer après 5s quoi qu'il arrive
      setTimeout(() => {
        if (playingSounds[soundKey] === player) {
          try { player.remove(); } catch (e) {}
          delete playingSounds[soundKey];
        }
      }, 5000);
    }

    player.play();
    return true;
  } catch (error) {
    delete playingSounds[soundKey];
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
    const player = createAudioPlayer({ uri: `data:audio/wav;base64,${generateWav(frequency, duration, type)}` });
    player.volume = volume;
    player.play();
  } catch (e) {}
}

export async function initSounds() {
  if (isWeb || !setAudioModeAsync) return;
  if (isInitialized) return;
  try {
    await setAudioModeAsync({
      allowsRecording: false,
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      interruptionMode: 'doNotMix',
    });
    isInitialized = true;
  } catch (error) {
    if (__DEV__) console.log('Erreur init sons:', error);
  }
}

// Démarrer la musique d'ambiance
export async function startBackgroundMusic() {
  if (!soundEnabled || !musicEnabled || isMusicLoading) return;
  isMusicLoading = true;
  try {
    if (backgroundMusic) {
      try { backgroundMusic.pause(); } catch (e) {}
      try { backgroundMusic.remove(); } catch (e) {}
      backgroundMusic = null;
    }
    isMusicPlaying = false;

    if (soundAmbiance) {
      const player = createAudioPlayer(soundAmbiance);
      player.volume = 0.3;
      player.loop = true;
      backgroundMusic = player;
      player.play();
      isMusicPlaying = true;
    }
  } catch (error) {
    if (__DEV__) console.log('Erreur musique ambiance:', error);
  } finally {
    isMusicLoading = false;
  }
}

// Stopper la musique d'ambiance
export async function stopBackgroundMusic() {
  if (!backgroundMusic && !isMusicPlaying) return;
  try {
    if (backgroundMusic) {
      try { backgroundMusic.pause(); } catch (e) {}
      try { backgroundMusic.remove(); } catch (e) {}
      backgroundMusic = null;
    }
    isMusicPlaying = false;
  } catch (error) {
    if (!error.message?.includes('interrupted')) {
      if (__DEV__) console.log('Erreur stop musique:', error);
    }
  }
}

// Pause/Reprendre la musique
export async function toggleMusic(play) {
  if (!backgroundMusic) return;
  try {
    if (play) {
      backgroundMusic.play();
      isMusicPlaying = true;
    } else {
      backgroundMusic.pause();
      isMusicPlaying = false;
    }
  } catch (error) {
    if (__DEV__) console.log('Erreur toggle musique:', error);
  }
}

export function setSoundEnabled(enabled) {
  soundEnabled = enabled;
  if (!enabled) { stopBackgroundMusic(); }
  else if (musicEnabled) { startBackgroundMusic(); }
}

export function setMusicEnabled(enabled) {
  musicEnabled = enabled;
  if (!enabled) { stopBackgroundMusic(); }
  else if (soundEnabled) { startBackgroundMusic(); }
}

export function setSfxEnabled(enabled) {
  sfxEnabled = enabled;
}

// Fallback synthétique si le fichier n'existe pas
async function playSound(key, fallback) {
  if (!isInitialized) await initSounds();
  if (!soundEnabled || !sfxEnabled) return;
  const loaded = await playAsset(key);
  if (!loaded && fallback) fallback();
}

export async function playClick() {
  if (!soundEnabled || !sfxEnabled) return;
  playSound('click', () => playTone(1200, 40, 'sine', 0.15));
}

export function vibrate(pattern = 50) {
  if (Platform.OS === 'web') {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(pattern);
  } else {
    Vibration.vibrate(pattern);
  }
}

export function vibrateIntruderFound() {
  const pattern = [100, 50, 100, 50, 200];
  if (Platform.OS === 'web') {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(pattern);
  } else {
    Vibration.vibrate(pattern);
  }
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