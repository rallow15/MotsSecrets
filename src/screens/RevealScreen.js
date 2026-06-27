import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Animated } from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';
import { colors, screenThemes, useDarkTheme } from '../theme';
import { t, getLang } from '../i18n';
import { playClick, playReveal } from '../sound';
import { generateAssignments } from '../gameLogic';
import { useScaleIn, triggerHaptic } from '../animations';
import { getImageSource as getMimerImageSource, getLieuImage } from '../data/images';

export default function RevealScreen({ navigation, route }) {
  const { numPlayers, assignments, currentPlayer, playerNumbers, playerNames, wordVisible: initialWordVisible, mimerMode } = route.params;
  useKeepAwake();
  const darkTheme = useDarkTheme();
  const theme = darkTheme ? screenThemes.dark : screenThemes.light;

  const [wordVisible, setWordVisible] = useState(initialWordVisible || false);
  const [imageError, setImageError] = useState(false);
  const { animatedStyle: revealStyle, start: startReveal } = useScaleIn();
  const lang = getLang();
  const spyfallUndercover = route.params.spyfallUndercover ?? false;

  const gameMode = route.params.gameMode ?? 0;
  const assignment = assignments[currentPlayer];
  const isMister = assignment.role === 'mister';
  const isSpy = assignment.role === 'spy';
  const isMimer = assignment.isMimer || mimerMode;
  const category = assignment.category ?? assignment.cat ?? '';
  const easyMode = assignment.easyMode || route.params.easyMode || false;
  const playerName = playerNames?.[currentPlayer] ?? '';
  const isSpyfall = gameMode === 3;
  const spyHint = assignment.spyHint || null;

  // Récupérer les données MIMER (paire d'images + indice)
  const mimerData = assignment.mimerData;
  // En mode facile, Mister White connaît la catégorie
  const word = isMister ? (easyMode && category ? category : t('roleMister')) : isSpy ? null : assignment.word;
  const lieuImage = getLieuImage(word);

  const wordLen = word ? word.length : 0;
  const wordFontSize = wordLen > 14 ? 44 : wordLen > 10 ? 58 : wordLen > 7 ? 72 : 88;

  // Reset image error state when player changes + trigger reveal animation
  React.useEffect(() => {
    setImageError(false);
    if (wordVisible) {
      startReveal();
    }
  }, [currentPlayer]);

  // Animate when word becomes visible
  React.useEffect(() => {
    if (wordVisible) {
      startReveal();
      triggerHaptic('light');
    }
  }, [wordVisible]);

  // Obtenir la source de l'image pour le mode MIMER
  // (getMimerImageSource = import aliasé depuis ../data/images, pour éviter
  //  le shadowing qui causait une récursion infinie avec une fn locale homonyme)
  const renderMimerImage = (wordName) => {
    const imgSource = getMimerImageSource(wordName);
    if (!imgSource) return null;
    return (
      <Image
        source={imgSource}
        style={[styles.mimerImage, darkTheme ? { borderColor: theme.mimerBorder } : null]}
        resizeMode="contain"
        onError={() => setImageError(true)}
      />
    );
  };

  // Indice pour Mister White en mode MIMER
  const mimerHint = isMimer && isMister && mimerData
    ? (lang === 'en' ? mimerData.hintEn : mimerData.indice)
    : null;

  const handleNext = () => {
    playClick();
    const next = currentPlayer + 1;

    const nextParams = {
      darkTheme,
      numUndercovers: route.params.numUndercovers ?? 1,
      numMisterWhites: route.params.numMisterWhites ?? 0,
      easyMode: route.params.easyMode ?? false,
      mimerMode: route.params.mimerMode ?? false,
      customWords: route.params.customWords || [],
      spyfallUndercover,
      selectedCategories: route.params.selectedCategories,
    };

    if (next >= numPlayers) {
      playReveal();
      if (gameMode === 3) {
        navigation.navigate('SpyfallGame', {
          numPlayers, assignments, playerNames,
          selectedCategory: route.params.selectedCategory,
          ...nextParams,
        });
      } else {
        navigation.navigate('Result', {
          numPlayers, assignments, playerNumbers, playerNames,
          selectedCategory: route.params.selectedCategory,
          ...nextParams,
        });
      }
    } else {
      navigation.navigate('Prep', {
        numPlayers, assignments,
        currentPlayer: next,
        takenNumbers: [],
        playerNumbers,
        playerNames,
        selectedCategory: route.params.selectedCategory,
        customWords: route.params.customWords || [],
        mimerMode: route.params.mimerMode,
        gameMode,
        ...nextParams,
      });
    }
  };

  const handleSkip = () => {
    playClick();
    triggerHaptic('light');
    const newAssignments = generateAssignments(
      numPlayers, gameMode, route.params.selectedCategory,
      route.params.customWords || [], mimerMode,
      route.params.numUndercovers ?? 1, route.params.numMisterWhites ?? 0,
      easyMode, spyfallUndercover
    );
    if (newAssignments[0]?.error === 'SPECIALE_NEEDS_MORE_WORDS') {
      alert(t('specialNeedMoreAlert'));
      return;
    }
    setWordVisible(false);
    navigation.navigate('Prep', {
      numPlayers,
      assignments: newAssignments,
      currentPlayer,
      takenNumbers: [],
      playerNumbers,
      playerNames,
      selectedCategory: route.params.selectedCategory,
      selectedCategories: route.params.selectedCategories,
      customWords: route.params.customWords || [],
      mimerMode,
      gameMode,
      numUndercovers: route.params.numUndercovers ?? 1,
      numMisterWhites: route.params.numMisterWhites ?? 0,
      easyMode,
      spyfallUndercover,
      darkTheme,
    });
  };

  // Phase 1 : "Touche l'écran"
  if (!wordVisible) {
    return (
      <View style={[styles.root, { backgroundColor: theme.bg }]}>
        {!isSpyfall && (
          <>
            <Image
              source={darkTheme ? require('../../assets/bg-sombre.jpg') : require('../../assets/bg-white.jpg')}
              style={styles.bgImage}
              resizeMode="cover"
            />
            <View style={darkTheme ? styles.bgGradientDark : styles.bgGradientLight} />
          </>
        )}
        <View style={styles.passContainer}>
          <Text style={[styles.playerBadge, { color: theme.textMuted }]}>{t('playerLabel', currentPlayer + 1)}</Text>
          {playerName ? <Text style={[styles.playerName, { color: theme.text }]}>{playerName}</Text> : null}
          <Text style={[styles.passPrompt, { color: theme.text }]}>{t('touchScreen')}</Text>
          <Text style={styles.tapIcon}>👆</Text>
        </View>
      </View>
    );
  }

  // Phase 2 : mot/image visible
  const isSpyfallInnocent = isSpyfall && !isSpy && lieuImage;
  return (
    <View style={[styles.root, { backgroundColor: isSpyfallInnocent ? '#000000' : theme.bg }]}>
      {!isSpyfallInnocent && (
        <>
          <Image
            source={darkTheme ? require('../../assets/bg-sombre.jpg') : require('../../assets/bg-white.jpg')}
            style={styles.bgImage}
            resizeMode="cover"
          />
          <View style={darkTheme ? styles.bgGradientDark : styles.bgGradientLight} />
        </>
      )}
      <Animated.View style={[isSpyfallInnocent ? styles.containerSpyfall : styles.container, revealStyle]}>
        <Text style={[
          { fontFamily: 'BebasNeue', color: '#FFFFFF', letterSpacing: 2 },
          isSpyfall && lieuImage ? { fontSize: 32 } : { fontSize: 26 },
        ]}>{t('playerLabel', currentPlayer + 1)}</Text>
        {playerName ? <Text style={[
          { fontFamily: 'BebasNeue', color: '#FFFFFF', letterSpacing: 2 },
          isSpyfall && lieuImage ? { fontSize: 32 } : { fontSize: 26 },
        ]}>{playerName}</Text> : null}

        {isMimer && !isMister ? (
          // Mode MIMER : afficher l'image + le nom
          <View style={styles.mimerContainer}>
            {renderMimerImage(word)}
            <Text style={[styles.mimerWord, { color: theme.text }]}>{word}</Text>
            <Text style={[styles.mimerInstruction, { color: theme.textMuted }]}>{t('mimeInstruction')}</Text>
          </View>
        ) : isSpy ? (
          // Mode SPYFALL : afficher ESPION
          <View style={styles.spyContainer}>
            <Image source={require('../../assets/spy-icon.png')} style={styles.spyEmoji} resizeMode="contain" />
            <Text style={[styles.spyTitle, { color: theme.text }]}>{t('roleSpy')}</Text>
            <Text style={[styles.spyInstruction, { color: theme.textMuted }]}>{t('spyInstruction')}</Text>
            {spyHint && easyMode && (
              <View style={[styles.easyHint, { backgroundColor: theme.easyHintBg, borderColor: theme.easyHintBorder }]}>
                <Text style={[styles.easyHintText, { color: theme.text }]}>💡 {t('hintColon')} <Text style={[styles.easyHintCategory, { color: theme.text }]}>{spyHint}</Text></Text>
              </View>
            )}
          </View>
        ) : isSpyfall && lieuImage ? (
          // Mode SPYFALL innocent : image plein écran
          <View style={styles.spyfallFullscreen}>
            <Image source={lieuImage} style={styles.spyfallBgImage} resizeMode="cover" />
            <View style={styles.spyfallOverlay} />
            <View style={styles.spyfallContent}>
              <Text style={styles.spyfallLieuWord}>{word}</Text>
            </View>
          </View>
        ) : (
          // Mode normal : afficher le mot
          <>
            {isMister && easyMode && category ? (
              // Mister White en mode facile : titre jaune + indice catégorie
              <>
                <Text style={[styles.misterTitle, { color: theme.textMuted }]}>{t('youAre')}</Text>
                <Text style={styles.misterYellow}>{t('roleMister')}</Text>
                <View style={[styles.easyHint, { backgroundColor: theme.easyHintBg, borderColor: theme.easyHintBorder }]}>
                  <Text style={[styles.easyHintText, { color: theme.text }]}>💡 {t('hintCategory')} <Text style={[styles.easyHintCategory, { color: theme.text }]}>{category}</Text></Text>
                </View>
              </>
            ) : (
              <>
                {!isMister && category && typeof category === 'string' ? (
                  <View style={[styles.catBadge, { backgroundColor: theme.catBadgeBg, borderColor: theme.catBadgeBorder }]}>
                    <Text style={[styles.catText, { color: theme.text }]}>{category}</Text>
                  </View>
                ) : null}
              </>
            )}

            <Text style={[
              styles.word,
              isMister && !easyMode ? [styles.wordMister, { color: theme.misterYellow }] : null,
              { fontSize: isMister && easyMode ? 0 : wordFontSize, color: theme.wordColor },
            ]}>
              {isMister && easyMode ? '' : (typeof word === 'string' ? word : '')}
            </Text>
          </>
        )}

        {isMimer && isMister && mimerHint && (
          <View style={[styles.misterHint, { backgroundColor: theme.easyHintBg, borderColor: theme.easyHintBorder }]}>
            <Text style={[styles.misterHintText, { color: theme.text }]}>💡 {mimerHint}</Text>
          </View>
        )}

        <Text style={[
          { fontFamily: 'BebasNeue', letterSpacing: 2, color: '#FFFFFF' },
          isSpyfall && lieuImage ? { fontSize: 32 } : { fontSize: 26 },
        ]}>{isSpyfall ? t('memorizeLieu') : t('memorize')}</Text>

        <TouchableOpacity accessibilityLabel="OK" accessibilityRole="button" style={isSpyfallInnocent ? styles.okBtnLight : [styles.okBtn, { backgroundColor: theme.okBtnBg, borderColor: theme.okBtnBorder }]} onPress={() => handleNext()} activeOpacity={0.8}>
          <Text style={[styles.okBtnText, { color: theme.okBtnText }]}>OK 👆</Text>
        </TouchableOpacity>

        {!isMimer && currentPlayer === 0 && !isMister && !isSpy && (
          <TouchableOpacity accessibilityLabel={t('changeWord')} accessibilityRole="button" style={[styles.skipBtn, { borderColor: theme.border }]} onPress={handleSkip} activeOpacity={0.7}>
            <Text style={[styles.skipBtnText, { color: theme.textMuted }]}>{t('changeWord')}</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  bgImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  bgGradientDark: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.15)' },
  bgGradientLight: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(180,150,80,0.10)' },
  passContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingTop: 16 },
  passPrompt: { fontFamily: 'BebasNeue', fontSize: 64, textAlign: 'center', lineHeight: 60 },
  tapIcon: { fontSize: 52 },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, gap: 12 },
  playerBadge: { fontFamily: 'SpaceMono', fontSize: 10, letterSpacing: 5 },
  playerName: { fontFamily: 'BebasNeue', fontSize: 44, letterSpacing: 2 },
  catBadge: { borderWidth: 1, paddingHorizontal: 14, paddingVertical: 4, borderRadius: 8 },
  catText: { fontFamily: 'SpaceMono', fontSize: 12, letterSpacing: 2 },
  word: { fontFamily: 'BebasNeue', textAlign: 'center', letterSpacing: 1 },
  wordMister: { fontSize: 52 },
  hint: { fontFamily: 'SpaceMono', fontSize: 11, letterSpacing: 3 },
  okBtn: { marginTop: 20, paddingVertical: 16, paddingHorizontal: 48, borderRadius: 12, borderWidth: 2 },
  okBtnText: { fontFamily: 'BebasNeue', fontSize: 26, letterSpacing: 3 },
  skipBtn: { marginTop: 10, paddingVertical: 14, paddingHorizontal: 32, borderWidth: 2, borderRadius: 12 },
  skipBtnText: { fontFamily: 'BebasNeue', fontSize: 26, letterSpacing: 2 },
  // MIMER
  mimerContainer: { alignItems: 'center', gap: 16 },
  mimerImage: { width: 220, height: 220, borderRadius: 16, borderWidth: 3, borderColor: '#1a1a1a', backgroundColor: '#fff' },
  mimerWord: { fontFamily: 'BebasNeue', fontSize: 32, textAlign: 'center', letterSpacing: 1 },
  mimerInstruction: { fontFamily: 'SpaceMono', fontSize: 11, textAlign: 'center' },
  misterHint: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
  misterHintText: { fontFamily: 'SpaceMono', fontSize: 11 },
  // SPY
  spyContainer: { alignItems: 'center', gap: 12 },
  spyEmoji: { width: 80, height: 80 },
  spyTitle: { fontFamily: 'BebasNeue', fontSize: 52, letterSpacing: 2 },
  spyInstruction: { fontFamily: 'SpaceMono', fontSize: 11, textAlign: 'center' },
  // Spyfall fullscreen
  spyfallFullscreen: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  spyfallBgImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: undefined, height: undefined },
  spyfallOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.35)' },
  spyfallContent: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 60 },
  spyfallLieuWord: { fontFamily: 'BebasNeue', fontSize: 56, color: '#FFFFFF', textAlign: 'center', letterSpacing: 3, textShadowColor: 'rgba(0,0,0,0.75)', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 6 },
  spyfallMangaLabel: { fontFamily: 'BebasNeue', fontSize: 32, color: '#FFFFFF', textAlign: 'center', letterSpacing: 2, marginTop: 8, textShadowColor: 'rgba(0,0,0,0.75)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 4 },
  containerSpyfall: { flex: 1, backgroundColor: '#000000', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, gap: 12 },
  textLight: { color: '#FFFFFF' },
  hintLight: { color: 'rgba(255,255,255,0.7)' },
  okBtnLight: { marginTop: 20, backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 16, paddingHorizontal: 48, borderRadius: 12, borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)' },
  easyHint: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, borderWidth: 1, marginTop: 4 },
  easyHintText: { fontFamily: 'SpaceMono', fontSize: 12 },
  easyHintCategory: { fontFamily: 'BebasNeue', fontSize: 16, letterSpacing: 1 },
  misterTitle: { fontFamily: 'SpaceMono', fontSize: 14, letterSpacing: 3 },
  misterYellow: { fontFamily: 'BebasNeue', fontSize: 48, color: '#e8ff47', letterSpacing: 3, textShadowColor: '#000', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 4 },
});