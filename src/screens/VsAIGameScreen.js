import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, StatusBar,
  TextInput, ScrollView, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme';
import { t } from '../i18n';
import {
  generateVsAIAssignments,
  calculateVsAIResult,
  generateUniqueBotClue,
  botVote,
} from '../gameLogic';

// Phases du jeu
const PHASES = {
  CONFIG: 'config',
  CLUES: 'clues',
  VOTE: 'vote',
  RESULT: 'result',
};

export default function VsAIGameScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  // Configuration
  const [numBots, setNumBots] = useState(2);
  const [humanName, setHumanName] = useState('');
  const [gameStarted, setGameStarted] = useState(false); // Pour savoir si on peut modifier les noms

  // État du jeu
  const [phase, setPhase] = useState(PHASES.CONFIG);
  const [assignments, setAssignments] = useState([]);
  const [playerNames, setPlayerNames] = useState([]);
  const [playerTypes, setPlayerTypes] = useState([]);

  // Tours d'indices
  const [currentTour, setCurrentTour] = useState(1);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [allClues, setAllClues] = useState([[], [], []]); // 3 tours
  const [humanClueInput, setHumanClueInput] = useState('');
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [showNextBtn, setShowNextBtn] = useState(false); // Bouton pour continuer
  const [lastBotClue, setLastBotClue] = useState(null); // Dernier indice du bot

  // Affichage du mot (humain)
  const [showWord, setShowWord] = useState(false);
  const [wordRevealed, setWordRevealed] = useState(false);

  // Vote
  const [votes, setVotes] = useState({});
  const [currentVoter, setCurrentVoter] = useState(0);
  const [isBotVoting, setIsBotVoting] = useState(false);

  // Résultats
  const [result, setResult] = useState(null);

  // État pour rejouer (key change pour forcer re-render)
  const [gameKey, setGameKey] = useState(0);

  // Ajouter un bot
  const addBot = () => {
    if (numBots < 6) {
      setNumBots(n => n + 1);
    }
  };

  // Retirer un bot
  const removeBot = () => {
    if (numBots > 1) {
      setNumBots(n => n - 1);
    }
  };

  // Démarrer la partie
  const startGame = () => {
    const { assignments: newAssignments, playerNames: newNames, playerTypes: newTypes } =
      generateVsAIAssignments(numBots, humanName.trim());

    setAssignments(newAssignments);
    setPlayerNames(newNames);
    setPlayerTypes(newTypes);
    setPhase(PHASES.CLUES);
    setCurrentTour(1);
    setCurrentPlayer(0);
    setAllClues([[], [], []]);
    setVotes({});
    setShowWord(false);
    setWordRevealed(false);
    setGameStarted(true); // Bloquer la modification des noms
  };

  // Donner un indice (interne)
  const giveClue = (clue) => {
    const newClues = [...allClues];
    newClues[currentTour - 1][currentPlayer] = clue;
    setAllClues(newClues);
    setLastBotClue(null);
    setShowNextBtn(false);

    // Passer au joueur suivant
    if (currentPlayer < assignments.length - 1) {
      setCurrentPlayer(currentPlayer + 1);
    } else {
      // Tour suivant ou phase de vote
      if (currentTour < 3) {
        setCurrentTour(currentTour + 1);
        setCurrentPlayer(0);
      } else {
        setPhase(PHASES.VOTE);
        setCurrentVoter(0);
      }
    }
  };

  // Bouton pour continuer après l'indice d'un bot
  const handleNextClue = () => {
    if (lastBotClue) {
      giveClue(lastBotClue);
    }
  };

  // Gérer le vote d'un humain
  const handleHumanVote = (targetIndex) => {
    const newVotes = { ...votes, [currentVoter]: targetIndex };
    setVotes(newVotes);

    if (currentVoter < assignments.length - 1) {
      setCurrentVoter(currentVoter + 1);
    } else {
      // Tous les votes sont exprimés, calculer le résultat
      const gameResult = calculateVsAIResult(assignments, newVotes, playerTypes);
      setResult(gameResult);

      // En cas d'égalité, on retourne à la phase de vote
      if (gameResult.winner === 'tie') {
        setPhase(PHASES.VOTE);
        setCurrentVoter(0);
        setVotes({}); // Reset votes pour nouveau tour
      } else {
        setPhase(PHASES.RESULT);
      }
    }
  };

  // Effet : bot donne un indice
  useEffect(() => {
    if (phase !== PHASES.CLUES) return;

    const currentPlayerType = playerTypes[currentPlayer];
    if (currentPlayerType !== 'bot') return;

    setIsBotThinking(true);

    const timer = setTimeout(() => {
      const assignment = assignments[currentPlayer];
      // Générer un indice unique pour ce tour
      const clue = generateUniqueBotClue(
        assignment.word,
        assignment.role,
        assignment.category,
        currentTour,
        currentPlayer
      );

      setIsBotThinking(false);
      setLastBotClue(clue);
      setShowNextBtn(true);
    }, 1500 + Math.random() * 1000); // 1.5-2.5s de réflexion

    return () => clearTimeout(timer);
  }, [phase, currentPlayer, currentTour, assignments, playerTypes]);

  // Effet : bot vote
  useEffect(() => {
    if (phase !== PHASES.VOTE) return;

    const currentVoterType = playerTypes[currentVoter];
    if (currentVoterType !== 'bot') return;

    setIsBotVoting(true);

    const timer = setTimeout(() => {
      // Récupérer les votes humains déjà exprimés
      const humanVotes = Object.entries(votes)
        .filter(([voterIdx]) => playerTypes[parseInt(voterIdx)] === 'human')
        .map(([, target]) => parseInt(target));

      const botChoice = botVote(currentVoter, assignments, allClues, humanVotes);

      setIsBotVoting(false);
      handleHumanVote(botChoice);
    }, 1000 + Math.random() * 1000);

    return () => clearTimeout(timer);
  }, [phase, currentVoter, assignments, allClues, votes, playerTypes]);

  // Effet : afficher le mot au joueur humain quand c'est son tour
  useEffect(() => {
    if (phase !== PHASES.CLUES) return;
    const currentPlayerType = playerTypes[currentPlayer];
    if (currentPlayerType !== 'human') return;

    setShowWord(true);
    setWordRevealed(true);
  }, [phase, currentPlayer, currentTour, playerTypes]);

  // Rejouer (mêmes noms)
  const handleReplay = () => {
    setGameKey(k => k + 1);
    // Régénérer de nouvelles assignments avec les mêmes noms
    const { assignments: newAssignments, playerNames: newNames, playerTypes: newTypes } =
      generateVsAIAssignments(numBots, humanName.trim());
    setAssignments(newAssignments);
    setPlayerNames(newNames);
    setPlayerTypes(newTypes);
    setCurrentTour(1);
    setCurrentPlayer(0);
    setAllClues([[], [], []]);
    setVotes({});
    setShowWord(false);
    setWordRevealed(false);
    setResult(null);
    setCurrentVoter(0);
    setPhase(PHASES.CLUES);
    // gameStarted reste à true pour garder les noms bloqués
  };

  // Retour menu (reset complet)
  const handleMenu = () => {
    setGameStarted(false); // Reset pour pouvoir modifier les noms
    setPhase(PHASES.CONFIG);
    setAssignments([]);
    setPlayerNames([]);
    setPlayerTypes([]);
    setCurrentTour(1);
    setCurrentPlayer(0);
    setAllClues([[], [], []]);
    setVotes({});
    setShowWord(false);
    setWordRevealed(false);
    setResult(null);
    setCurrentVoter(0);
    navigation.navigate('Menu');
  };

  // ─────────────────────────────────────────────────────────────
  // PHASE CONFIG
  // ─────────────────────────────────────────────────────────────
  if (phase === PHASES.CONFIG) {
    const isGameStarted = gameStarted; // Les noms sont-ils bloqués ?
    return (
      <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
        <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

        <Text style={styles.title}>{t('vsAI_title')}</Text>

        {/* Nom de l'humain */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('vsAI_you')}</Text>
          <TextInput
            style={styles.nameInput}
            placeholder={t('vsAI_namePlaceholder')}
            placeholderTextColor={colors.gray}
            value={humanName}
            onChangeText={setHumanName}
            maxLength={20}
            editable={!isGameStarted}
            selectTextOnFocus={!isGameStarted}
          />
        </View>

        {/* Bots */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('vsAI_bots')}</Text>
          <View style={styles.counterRow}>
            <TouchableOpacity
              style={[styles.counterBtn, isGameStarted && styles.counterBtnDisabled]}
              onPress={removeBot}
              disabled={isGameStarted}
            >
              <Text style={styles.counterBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.counterVal}>{numBots}</Text>
            <TouchableOpacity
              style={[styles.counterBtn, isGameStarted && styles.counterBtnDisabled]}
              onPress={addBot}
              disabled={isGameStarted}
            >
              <Text style={styles.counterBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Total */}
        <Text style={styles.totalText}>{t('vsAI_total', 1 + numBots)}</Text>

        {/* Bouton démarrer / rejouer */}
        <TouchableOpacity
          style={[styles.startBtn, 1 + numBots > 7 && styles.startBtnDisabled]}
          onPress={isGameStarted ? handleReplay : startGame}
          disabled={1 + numBots > 7}
        >
          <Text style={styles.startBtnText}>{isGameStarted ? t('vsAI_replay') : t('vsAI_start')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // PHASE CLUES
  // ─────────────────────────────────────────────────────────────
  if (phase === PHASES.CLUES) {
    const isHuman = playerTypes[currentPlayer] === 'human';
    const playerName = playerNames[currentPlayer] || t('playerFallback', currentPlayer + 1);
    const currentAssignment = assignments[currentPlayer];
    const currentWord = currentAssignment?.word;
    const currentRole = currentAssignment?.role;

    // Écran d'affichage du mot pour l'humain
    if (showWord && isHuman) {
      return (
        <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
          <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

          <Text style={styles.tourTitle}>{t('vsAI_tour', currentTour)}</Text>

          <View style={styles.playerCard}>
            <Text style={styles.playerName}>{playerName}</Text>
            <Text style={styles.playerType}>{t('vsAI_you')}</Text>
          </View>

          <View style={styles.wordRevealBox}>
            <Text style={styles.wordRevealLabel}>TON MOT EST</Text>
            {currentRole === 'mister' ? (
              <Text style={styles.misterWord}>MYSTÈRE</Text>
            ) : currentWord ? (
              <Text style={styles.wordText}>{currentWord}</Text>
            ) : (
              <Text style={styles.wordText}>???</Text>
            )}
            {currentRole === 'mister' && (
              <Text style={styles.roleHint}>Tu n'as pas de mot, fais attention !</Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.continueBtn}
            onPress={() => {
              setShowWord(false);
              setHumanClueInput('');
            }}
          >
            <Text style={styles.continueBtnText}>CONTINUER</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
        <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

        <Text style={styles.tourTitle}>{t('vsAI_tour', currentTour)}</Text>

        {/* Joueur actuel */}
        <View style={styles.playerCard}>
          <Text style={styles.playerName}>{playerName}</Text>
          <Text style={styles.playerType}>
            {isHuman ? t('vsAI_you') : t('vsAI_bot')}
          </Text>
        </View>

        {!isHuman && isBotThinking ? (
          <View style={styles.botThinking}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={styles.botThinkingText}>{t('vsAI_waiting')}</Text>
          </View>
        ) : !isHuman && showNextBtn && lastBotClue ? (
          <View style={styles.botClueResult}>
            <Text style={styles.botClueLabel}>{playerName} a donné :</Text>
            <Text style={styles.botClueText}>"{lastBotClue}"</Text>
            <TouchableOpacity
              style={styles.continueBtn}
              onPress={handleNextClue}
            >
              <Text style={styles.continueBtnText}>CONTINUER</Text>
            </TouchableOpacity>
          </View>
        ) : isHuman ? (
          <View style={styles.clueInputContainer}>
            <Text style={styles.clueLabel}>{t('vsAI_giveClue')}</Text>
            <TextInput
              style={styles.clueInput}
              placeholder={t('vsAI_clueHint')}
              placeholderTextColor={colors.gray}
              value={humanClueInput}
              onChangeText={setHumanClueInput}
              maxLength={50}
              autoFocus
            />
            <TouchableOpacity
              style={[styles.submitClueBtn, !humanClueInput.trim() && styles.submitClueBtnDisabled]}
              onPress={() => {
                giveClue(humanClueInput.trim());
                setShowWord(false);
                setWordRevealed(false);
              }}
              disabled={!humanClueInput.trim()}
            >
              <Text style={styles.submitClueText}>{t('vsAI_giveClue')}</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Indices déjà donnés (récap) */}
        <ScrollView style={styles.cluesRecap}>
          <Text style={styles.cluesRecapTitle}>INDICES DONNÉS</Text>
          {allClues.map((tourClues, tourIdx) => (
            <View key={tourIdx} style={styles.tourRow}>
              <Text style={styles.tourRowTitle}>{t('vsAI_tour', tourIdx + 1)}</Text>
              {tourClues.map((clue, playerIdx) => (
                clue && (
                  <View key={playerIdx} style={styles.clueRow}>
                    <Text style={styles.cluePlayerName}>
                      {playerNames[playerIdx]?.substring(0, 10) || `J${playerIdx + 1}`}:
                    </Text>
                    <Text style={styles.clueText}>{clue}</Text>
                  </View>
                )
              ))}
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // PHASE VOTE
  // ─────────────────────────────────────────────────────────────
  if (phase === PHASES.VOTE) {
    const isHuman = playerTypes[currentVoter] === 'human';
    const voterName = playerNames[currentVoter] || t('playerFallback', currentVoter + 1);

    return (
      <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
        <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

        <Text style={styles.title}>{t('vsAI_vote')}</Text>
        <Text style={styles.voteHint}>{t('vsAI_voteHint')}</Text>

        {!isHuman && isBotVoting ? (
          <View style={styles.botThinking}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text style={styles.botThinkingText}>{t('vsAI_botVote')}</Text>
          </View>
        ) : isHuman ? (
          <>
            <Text style={styles.voteSubTitle}>
              {voterName}, qui soupçonnes-tu ?
            </Text>

            <ScrollView style={styles.voteList}>
              {assignments.map((assignment, idx) => {
                if (idx === currentVoter) return null; // On ne peut pas voter pour soi

                const name = playerNames[idx] || t('playerFallback', idx + 1);
                const type = playerTypes[idx];

                return (
                  <TouchableOpacity
                    key={idx}
                    style={styles.voteOption}
                    onPress={() => handleHumanVote(idx)}
                  >
                    <Text style={styles.voteOptionName}>{name}</Text>
                    <Text style={styles.voteOptionType}>
                      {type === 'human' ? t('vsAI_you') : t('vsAI_bot')}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </>
        ) : null}

        {/* Récap des indices */}
        <ScrollView style={styles.cluesRecapSmall}>
          <Text style={styles.cluesRecapTitle}>TOUS LES INDICES</Text>
          {allClues.map((tourClues, tourIdx) =>
            tourClues.map((clue, playerIdx) =>
              clue ? (
                <Text key={`${tourIdx}-${playerIdx}`} style={styles.smallClue}>
                  {t('vsAI_tour', tourIdx + 1)} - {playerNames[playerIdx]?.substring(0, 8)}: {clue}
                </Text>
              ) : null
            )
          )}
        </ScrollView>
      </View>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // PHASE RESULT
  // ─────────────────────────────────────────────────────────────
  if (phase === PHASES.RESULT) {
    const intruderName = playerNames[result.intruderIndex] || 'Inconnu';
    const mostVotedName = result.mostVoted !== null
      ? (playerNames[result.mostVoted] || 'Inconnu')
      : 'Personne';

    return (
      <View style={[styles.container, { paddingTop: insets.top + 10, paddingHorizontal: 10 }]}>
        <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

        <Text style={[styles.resultTitle, { fontSize: 36, marginBottom: 10 }]}>{t('vsAI_results')}</Text>

        {/* Résultat principal */}
        <View style={[styles.resultBox, result.winner === 'innocents' ? styles.winBox : styles.loseBox, { padding: 12, marginBottom: 10 }]}>
          <Text style={[styles.resultMainText, { fontSize: 22 }]}>
            {result.winner === 'innocents'
              ? t('vsAI_innocentsWin')
              : result.winner === 'tie'
              ? 'ÉGALITÉ - NOUVEAU VOTE'
              : t('vsAI_intruderWin')}
          </Text>
        </View>

        {/* L'intrus était... */}
        <View style={styles.intruderReveal}>
          <Text style={[styles.intruderRevealLabel, { fontSize: 8, marginBottom: 4 }]}>L'INTRUS ÉTAIT</Text>
          <Text style={[styles.intruderRevealName, { fontSize: 24 }]}>{intruderName}</Text>
        </View>

        {/* Boutons */}
        <View style={styles.resultButtons}>
          {result.winner === 'tie' ? (
            <TouchableOpacity style={styles.replayBtn} onPress={() => {
              setPhase(PHASES.VOTE);
              setCurrentVoter(0);
              setVotes({});
            }}>
              <Text style={styles.replayBtnText}>NOUVEAU VOTE</Text>
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity style={styles.replayBtn} onPress={handleReplay}>
                <Text style={styles.replayBtnText}>{t('vsAI_replay')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuBtn} onPress={handleMenu}>
                <Text style={styles.menuBtnText}>{t('vsAI_menu')}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Détails des votes - SCROLLABLE */}
        <ScrollView style={[styles.votesRecap, { flex: 1, minHeight: 100, maxHeight: 150, marginBottom: 10 }]}>
          <Text style={[styles.votesRecapTitle, { fontSize: 14, marginBottom: 6 }]}>VOTES</Text>
          {Object.entries(votes).map(([voterIdx, targetIdx]) => {
            const voterNameEntry = playerNames[voterIdx] || t('playerFallback', parseInt(voterIdx) + 1);
            const targetName = playerNames[targetIdx] || t('playerFallback', targetIdx + 1);
            const isTargetIntruder = targetIdx === result.intruderIndex;

            return (
              <View key={voterIdx} style={styles.voteDetailRow}>
                <Text style={[styles.voteDetailText, { fontSize: 9 }]}>
                  {voterNameEntry} → {targetName}
                </Text>
                {isTargetIntruder && (
                  <Text style={[styles.correctVote, { fontSize: 12 }]}>✓</Text>
                )}
              </View>
            );
          })}
        </ScrollView>

        {/* Mots de chacun - SCROLLABLE */}
        <ScrollView style={[styles.wordsReveal, { flex: 1, minHeight: 100, maxHeight: 150, marginBottom: 10 }]}>
          <Text style={[styles.wordsRevealTitle, { fontSize: 14, marginBottom: 6 }]}>MOTS</Text>
          {assignments.map((assignment, idx) => {
            const name = playerNames[idx] || t('playerFallback', idx + 1);
            const type = playerTypes[idx];
            const word = assignment.word;
            const role = assignment.role;

            return (
              <View key={idx} style={styles.wordRow}>
                <View>
                  <Text style={[styles.wordRowName, { fontSize: 8 }]}>
                    {name} {type === 'bot' && <Text style={styles.botTag}>(BOT)</Text>}
                  </Text>
                  {role === 'intrus' && <Text style={[styles.intruderLabel, { fontSize: 8 }]}>INTRUS</Text>}
                </View>
                <Text style={[
                  styles.wordRowWord,
                  role === 'intrus' && styles.intruderWordRow,
                  { fontSize: 14 },
                ]}>
                  {word || '???'}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 20 },

  // Titres
  title: { fontFamily: 'BebasNeue', fontSize: 52, color: colors.accent, textAlign: 'center', letterSpacing: 2, marginBottom: 30 },
  tourTitle: { fontFamily: 'BebasNeue', fontSize: 42, color: colors.accent, textAlign: 'center', letterSpacing: 2, marginBottom: 20 },
  sectionLabel: { fontFamily: 'SpaceMono', fontSize: 9, color: colors.gray, letterSpacing: 3, marginBottom: 8 },

  // Compteurs
  section: { marginBottom: 24 },
  counterRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 12 },
  counterBtn: { width: 42, height: 42, borderWidth: 1, borderColor: '#333', alignItems: 'center', justifyContent: 'center' },
  counterBtnDisabled: { opacity: 0.3 },
  counterBtnText: { color: colors.text, fontSize: 22, fontFamily: 'SpaceMono', lineHeight: 26 },
  counterVal: { fontFamily: 'BebasNeue', fontSize: 48, color: colors.text, minWidth: 40, textAlign: 'center' },

  // Inputs noms
  nameInput: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 12,
    color: colors.text,
    fontFamily: 'SpaceMono',
    fontSize: 14,
    marginBottom: 8,
  },

  // Total
  totalText: { fontFamily: 'SpaceMono', fontSize: 11, color: colors.gray, textAlign: 'center', marginBottom: 20 },

  // Bouton démarrer
  startBtn: { backgroundColor: colors.accent, paddingVertical: 16, alignItems: 'center', borderRadius: 8 },
  startBtnText: { fontFamily: 'BebasNeue', fontSize: 26, color: colors.bg, letterSpacing: 3 },
  startBtnDisabled: { opacity: 0.5 },

  // Player card
  playerCard: { alignItems: 'center', marginBottom: 30 },
  playerName: { fontFamily: 'BebasNeue', fontSize: 38, color: colors.text, letterSpacing: 1 },
  playerType: { fontFamily: 'SpaceMono', fontSize: 10, color: colors.gray, marginTop: 4 },

  // Word reveal
  wordRevealBox: { alignItems: 'center', padding: 30, backgroundColor: '#1a1a1a', borderRadius: 12, borderWidth: 2, borderColor: colors.accent, marginBottom: 30 },
  wordRevealLabel: { fontFamily: 'SpaceMono', fontSize: 10, color: colors.gray, marginBottom: 12, letterSpacing: 2 },
  wordText: { fontFamily: 'BebasNeue', fontSize: 56, color: colors.accent, textAlign: 'center', letterSpacing: 3 },
  intruderWord: { fontFamily: 'BebasNeue', fontSize: 48, color: '#ff4747', textAlign: 'center', letterSpacing: 2 },
  misterWord: { fontFamily: 'BebasNeue', fontSize: 48, color: '#ffd700', textAlign: 'center', letterSpacing: 2 },
  roleHint: { fontFamily: 'SpaceMono', fontSize: 9, color: colors.gray, textAlign: 'center', marginTop: 12, fontStyle: 'italic' },
  continueBtn: { backgroundColor: colors.accent, paddingVertical: 16, alignItems: 'center', borderRadius: 8 },
  continueBtnText: { fontFamily: 'BebasNeue', fontSize: 24, color: colors.bg, letterSpacing: 2 },

  // Bot thinking
  botThinking: { alignItems: 'center', padding: 30 },
  botThinkingText: { fontFamily: 'SpaceMono', fontSize: 11, color: colors.gray, marginTop: 12, letterSpacing: 1 },

  // Bot clue result (affichage indice du bot)
  botClueResult: { alignItems: 'center', padding: 20, backgroundColor: '#1a1a1a', borderRadius: 12, borderWidth: 1, borderColor: '#333', marginBottom: 20 },
  botClueLabel: { fontFamily: 'SpaceMono', fontSize: 10, color: colors.gray, marginBottom: 12, letterSpacing: 1 },
  botClueText: { fontFamily: 'BebasNeue', fontSize: 32, color: colors.accent, textAlign: 'center', letterSpacing: 2, marginBottom: 16 },

  // Clue input
  clueInputContainer: { width: '100%' },
  clueLabel: { fontFamily: 'BebasNeue', fontSize: 24, color: colors.accent, textAlign: 'center', marginBottom: 12 },
  clueInput: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 14,
    color: colors.text,
    fontFamily: 'SpaceMono',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  submitClueBtn: { backgroundColor: colors.accent, paddingVertical: 14, alignItems: 'center', borderRadius: 8 },
  submitClueBtnDisabled: { opacity: 0.5 },
  submitClueText: { fontFamily: 'BebasNeue', fontSize: 20, color: colors.bg, letterSpacing: 2 },

  // Clues recap
  cluesRecap: { flex: 1, marginTop: 20, borderTopWidth: 1, borderTopColor: '#222' },
  cluesRecapSmall: { flex: 1, marginTop: 10, borderTopWidth: 1, borderTopColor: '#222' },
  cluesRecapTitle: { fontFamily: 'BebasNeue', fontSize: 18, color: colors.accent, textAlign: 'center', marginTop: 12, marginBottom: 10 },
  tourRow: { marginBottom: 16 },
  tourRowTitle: { fontFamily: 'BebasNeue', fontSize: 16, color: colors.muted, marginBottom: 6 },
  clueRow: { flexDirection: 'row', marginBottom: 4, gap: 8 },
  cluePlayerName: { fontFamily: 'SpaceMono', fontSize: 9, color: colors.gray, minWidth: 70 },
  clueText: { fontFamily: 'SpaceMono', fontSize: 10, color: colors.text, flex: 1 },
  smallClue: { fontFamily: 'SpaceMono', fontSize: 9, color: colors.gray, marginBottom: 4 },

  // Vote
  voteHint: { fontFamily: 'SpaceMono', fontSize: 10, color: colors.gray, textAlign: 'center', marginBottom: 20 },
  voteSubTitle: { fontFamily: 'BebasNeue', fontSize: 28, color: colors.text, textAlign: 'center', marginBottom: 20 },
  voteList: { flex: 1, width: '100%' },
  voteOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    padding: 16,
    marginBottom: 10,
  },
  voteOptionName: { fontFamily: 'BebasNeue', fontSize: 24, color: colors.text },
  voteOptionType: { fontFamily: 'SpaceMono', fontSize: 9, color: colors.gray },

  // Result
  resultTitle: { fontFamily: 'BebasNeue', fontSize: 48, color: colors.accent, textAlign: 'center', marginBottom: 20 },
  resultBox: { padding: 24, borderRadius: 12, alignItems: 'center', marginBottom: 20 },
  winBox: { backgroundColor: 'rgba(232,255,71,0.1)', borderWidth: 2, borderColor: colors.accent },
  loseBox: { backgroundColor: 'rgba(255,71,71,0.1)', borderWidth: 2, borderColor: '#ff4747' },
  resultMainText: { fontFamily: 'BebasNeue', fontSize: 32, color: colors.text, textAlign: 'center', letterSpacing: 1 },

  votesRecap: { width: '100%', borderWidth: 1, borderColor: '#222', borderRadius: 8, padding: 16, marginBottom: 16 },
  votesRecapTitle: { fontFamily: 'BebasNeue', fontSize: 18, color: colors.accent, textAlign: 'center', marginBottom: 12 },
  voteDetailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  voteDetailText: { fontFamily: 'SpaceMono', fontSize: 10, color: colors.text },
  correctVote: { fontFamily: 'BebasNeue', fontSize: 16, color: colors.accent },
  votesTotalTitle: { fontFamily: 'BebasNeue', fontSize: 16, color: colors.muted, marginTop: 12, marginBottom: 8 },
  voteCountRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  voteCountName: { fontFamily: 'SpaceMono', fontSize: 10, color: colors.text },
  voteCount: { fontFamily: 'SpaceMono', fontSize: 9, color: colors.gray },
  intruderTag: { fontFamily: 'BebasNeue', fontSize: 10, color: '#ff4747' },

  intruderReveal: { alignItems: 'center', marginBottom: 20 },
  intruderRevealLabel: { fontFamily: 'SpaceMono', fontSize: 9, color: colors.gray, marginBottom: 6 },
  intruderRevealName: { fontFamily: 'BebasNeue', fontSize: 32, color: '#ff4747' },

  // Words reveal
  wordsReveal: { width: '100%', borderWidth: 1, borderColor: '#222', borderRadius: 8, padding: 16, marginBottom: 20 },
  wordsRevealTitle: { fontFamily: 'BebasNeue', fontSize: 18, color: colors.accent, textAlign: 'center', marginBottom: 12 },
  wordRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  wordRowName: { fontFamily: 'SpaceMono', fontSize: 10, color: colors.text },
  botTag: { fontFamily: 'SpaceMono', fontSize: 8, color: colors.gray },
  intruderLabel: { fontFamily: 'BebasNeue', fontSize: 10, color: '#ff4747', letterSpacing: 1 },
  wordRowWord: { fontFamily: 'BebasNeue', fontSize: 18, color: colors.text, letterSpacing: 1 },
  intruderWordRow: { color: '#ff4747' },
  misterWordRow: { color: '#ffd700' },
  categoryReveal: { fontFamily: 'SpaceMono', fontSize: 9, color: colors.gray, textAlign: 'center', marginTop: 12 },
  categoryValue: { fontFamily: 'SpaceMono', fontSize: 10, color: colors.accent },

  resultButtons: { width: '100%', gap: 10 },
  replayBtn: { backgroundColor: colors.accent, paddingVertical: 16, alignItems: 'center', borderRadius: 8 },
  replayBtnText: { fontFamily: 'BebasNeue', fontSize: 24, color: colors.bg, letterSpacing: 2 },
  menuBtn: { borderWidth: 1, borderColor: '#333', paddingVertical: 16, alignItems: 'center', borderRadius: 8 },
  menuBtnText: { fontFamily: 'BebasNeue', fontSize: 24, color: colors.gray, letterSpacing: 2 },
});
