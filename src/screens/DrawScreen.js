import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';
import { screenThemes, useDarkTheme } from '../theme';
import { t } from '../i18n';
import { playClick, playReveal } from '../sound';
import { triggerHaptic } from '../animations';
import DrawingCanvas, { PLAYER_COLORS } from '../components/DrawingCanvas';

export default function DrawScreen({ navigation, route }) {
  useKeepAwake();
  const darkTheme = useDarkTheme();
  const theme = darkTheme ? screenThemes.dark : screenThemes.light;

  const {
    numPlayers,
    assignments,
    playerNumbers,
    playerNames,
    gameMode,
    selectedCategory,
    selectedCategories,
    customWords,
    mimerMode,
    numUndercovers,
    numMisterWhites,
    easyMode,
    spyfallUndercover,
    drawingMode,
    currentDrawPlayer = 0,
    currentDrawRound = 1,
    drawRounds = 3,
    allStrokes = [],
  } = route.params;

  const [phase, setPhase] = useState('pass');
  const [strokes, setStrokes] = useState(allStrokes);

  const playerName = playerNames?.[currentDrawPlayer] || '';
  const playerNum = (playerNumbers?.[currentDrawPlayer] ?? currentDrawPlayer) + 1;
  const playerColor = PLAYER_COLORS[currentDrawPlayer % PLAYER_COLORS.length];

  // Calculer le prochain joueur/tour
  const isLastPlayer = currentDrawPlayer + 1 >= numPlayers;
  const isLastRound = currentDrawRound >= drawRounds;

  const handleDone = () => {
    playClick();
    triggerHaptic('medium');

    const commonParams = {
      numPlayers,
      assignments,
      playerNumbers,
      playerNames,
      gameMode,
      selectedCategory,
      selectedCategories,
      customWords,
      mimerMode,
      numUndercovers,
      numMisterWhites,
      easyMode,
      spyfallUndercover,
      darkTheme,
      drawingMode: true,
      drawRounds,
    };

    if (isLastPlayer && isLastRound) {
      // Dernier joueur, dernier tour → revue
      playReveal();
      setPhase('review');
    } else {
      // Prochain joueur ou prochain tour
      const nextPlayer = isLastPlayer ? 0 : currentDrawPlayer + 1;
      const nextRound = isLastPlayer ? currentDrawRound + 1 : currentDrawRound;

      navigation.navigate('Draw', {
        ...commonParams,
        currentDrawPlayer: nextPlayer,
        currentDrawRound: nextRound,
        drawRounds,
        allStrokes: strokes,
      });
    }
  };

  const handleStrokeComplete = useCallback((stroke) => {
    setStrokes((prev) => [...prev, stroke]);
  }, []);

  const handleUndo = useCallback(() => {
    setStrokes((prev) => {
      if (prev.length === 0) return prev;
      const previousPlayerStrokes = allStrokes.length;
      if (prev.length <= previousPlayerStrokes) return prev;
      return prev.slice(0, -1);
    });
  }, [allStrokes.length]);

  const resultParams = {
    numPlayers,
    assignments,
    playerNumbers,
    playerNames,
    selectedCategory,
    darkTheme,
    numUndercovers,
    numMisterWhites,
    easyMode,
    mimerMode,
    customWords,
    spyfallUndercover,
    selectedCategories,
    drawingMode: true,
  };

  // Phase "Passez le téléphone"
  if (phase === 'pass') {
    return (
      <View style={[styles.root, { backgroundColor: theme.bg }]}>
        <Image
          source={darkTheme ? require('../../assets/bg-sombre.jpg') : require('../../assets/bg-white.jpg')}
          style={styles.bgImage}
          resizeMode="cover"
        />
        <View style={darkTheme ? styles.bgGradientDark : styles.bgGradientLight} />
        <TouchableOpacity
          style={styles.passContainer}
          activeOpacity={0.8}
          onPress={() => {
            playClick();
            triggerHaptic('light');
            setPhase('drawing');
          }}
        >
          <View style={[styles.colorDot, { backgroundColor: playerColor }]} />
          <Text style={[styles.playerBadge, { color: theme.textMuted }]}>
            {t('drawRoundPass', currentDrawRound, playerNum)}
          </Text>
          <Text style={[styles.roundIndicator, { color: theme.textMuted }]}>
            {t('drawRound', currentDrawRound, drawRounds)}
          </Text>
          {playerName ? (
            <Text style={[styles.playerName, { color: theme.text }]}>{playerName}</Text>
          ) : null}
          <Text style={[styles.passPrompt, { color: theme.text }]}>{t('drawPassPhone')}</Text>
          <Text style={styles.tapIcon}>👆</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Phase "Dessin"
  if (phase === 'drawing') {
    return (
      <View style={[styles.root, { backgroundColor: theme.bg }]}>
        <View style={styles.drawHeader}>
          <View style={styles.drawHeaderTop}>
            <View style={[styles.colorDotSmall, { backgroundColor: playerColor }]} />
            <Text style={[styles.drawRound, { color: theme.textMuted }]}>
              {t('drawRound', currentDrawRound, drawRounds)}
            </Text>
          </View>
          <Text style={[styles.drawTitle, { color: theme.text }]}>
            {playerName || t('drawPlayerTurn', playerNum)}
          </Text>
          <Text style={[styles.drawInstruction, { color: theme.textMuted }]}>
            {t('drawPrompt')}
          </Text>
        </View>

        <DrawingCanvas
          strokes={strokes}
          onStrokeComplete={handleStrokeComplete}
          onUndo={handleUndo}
          darkTheme={darkTheme}
          editable={true}
          playerColor={playerColor}
        />

        <View style={styles.doneBtnContainer}>
          <TouchableOpacity
            style={[styles.doneBtn, { backgroundColor: theme.okBtnBg, borderColor: theme.okBtnBorder }]}
            onPress={handleDone}
            activeOpacity={0.8}
          >
            <Text style={[styles.doneBtnText, { color: theme.okBtnText }]}>{t('drawDone')} 👆</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Phase "Revue du dessin final"
  return (
    <View style={[styles.root, { backgroundColor: theme.bg }]}>
      <Image
        source={darkTheme ? require('../../assets/bg-sombre.jpg') : require('../../assets/bg-white.jpg')}
        style={styles.bgImage}
        resizeMode="cover"
      />
      <View style={darkTheme ? styles.bgGradientDark : styles.bgGradientLight} />

      <View style={styles.reviewContainer}>
        <Text style={[styles.reviewTitle, { color: theme.text }]}>{t('drawReviewTitle')}</Text>

        <DrawingCanvas
          strokes={strokes}
          darkTheme={darkTheme}
          editable={false}
        />

        <TouchableOpacity
          style={[styles.continueBtn, { backgroundColor: theme.okBtnBg, borderColor: theme.okBtnBorder }]}
          onPress={() => {
            playClick();
            triggerHaptic('medium');
            navigation.navigate('Result', resultParams);
          }}
          activeOpacity={0.8}
        >
          <Text style={[styles.continueBtnText, { color: theme.okBtnText }]}>{t('drawContinue')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  bgImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  bgGradientDark: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  bgGradientLight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(180,150,80,0.10)',
  },
  // Pass phase
  passContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingTop: 16,
  },
  colorDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginBottom: 8,
  },
  colorDotSmall: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  playerBadge: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    letterSpacing: 5,
  },
  roundIndicator: {
    fontFamily: 'BebasNeue',
    fontSize: 24,
    letterSpacing: 2,
  },
  playerName: {
    fontFamily: 'BebasNeue',
    fontSize: 44,
    letterSpacing: 2,
  },
  passPrompt: {
    fontFamily: 'BebasNeue',
    fontSize: 48,
    textAlign: 'center',
    lineHeight: 52,
  },
  tapIcon: {
    fontSize: 52,
  },
  // Drawing phase
  drawHeader: {
    paddingTop: 36,
    paddingBottom: 2,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 1,
  },
  drawHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  drawRound: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    letterSpacing: 2,
  },
  drawTitle: {
    fontFamily: 'BebasNeue',
    fontSize: 28,
    letterSpacing: 2,
  },
  drawInstruction: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    letterSpacing: 1,
    textAlign: 'center',
    marginTop: 1,
  },
  doneBtnContainer: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 16,
    alignItems: 'center',
  },
  doneBtn: {
    paddingVertical: 12,
    paddingHorizontal: 44,
    borderRadius: 12,
    borderWidth: 2,
  },
  doneBtnText: {
    fontFamily: 'BebasNeue',
    fontSize: 22,
    letterSpacing: 3,
  },
  // Review phase
  reviewContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    gap: 8,
  },
  reviewTitle: {
    fontFamily: 'BebasNeue',
    fontSize: 34,
    letterSpacing: 3,
    paddingTop: 36,
  },
  continueBtn: {
    marginTop: 6,
    paddingVertical: 14,
    paddingHorizontal: 44,
    borderRadius: 12,
    borderWidth: 2,
  },
  continueBtnText: {
    fontFamily: 'BebasNeue',
    fontSize: 24,
    letterSpacing: 3,
  },
});