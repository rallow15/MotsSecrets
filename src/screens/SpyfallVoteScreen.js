import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated } from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';
import { colors } from '../theme';
import { t, getLang } from '../i18n';
import { playClick } from '../sound';
import { useScaleIn, triggerHaptic } from '../animations';
import BouncePress from '../components/BouncePress';

export default function SpyfallVoteScreen({ navigation, route }) {
  const { numPlayers, assignments, playerNames, selectedCategory, currentVoter, votes, spyfallUndercover } = route.params;
  useKeepAwake();
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const selectedScale = React.useRef(new Animated.Value(1)).current;
  const lang = getLang();

  const safeNames = Array.isArray(playerNames) ? playerNames : new Array(numPlayers).fill('');
  const voterName = safeNames[currentVoter] || t('playerFallback', currentVoter + 1);

  const handleSelect = (index) => {
    setSelectedPlayer(index);
    triggerHaptic('light');
    Animated.spring(selectedScale, { toValue: 0.95, friction: 3, tension: 300, useNativeDriver: true }).start(
      () => Animated.spring(selectedScale, { toValue: 1, friction: 3, tension: 300, useNativeDriver: true }).start()
    );
  };

  const handleConfirm = () => {
    if (selectedPlayer === null) return;
    triggerHaptic('medium');
    playClick();

    const newVotes = [...votes, selectedPlayer];

    if (currentVoter + 1 >= numPlayers) {
      // Tous les joueurs ont voté — compter les votes
      const voteCounts = new Array(numPlayers).fill(0);
      newVotes.forEach(v => voteCounts[v]++);

      // Trouver le joueur le plus voté
      const maxVotes = Math.max(...voteCounts);
      const mostVoted = voteCounts.indexOf(maxVotes);
      const tiedPlayers = voteCounts.filter(v => v === maxVotes).length;

      // Égalité → l'espion s'échappe
      if (tiedPlayers > 1) {
        navigation.navigate('Result', {
          numPlayers,
          assignments,
          playerNumbers: new Array(numPlayers).fill(null),
          playerNames,
          selectedCategory,
          gameMode: 3,
          spyfallOutcome: 'spyWinsTie',
          spyfallUndercover,
        });
        return;
      }

      // Le plus voté est-il l'espion / l'intrus ?
      const suspectRole = spyfallUndercover ? 'intrus' : 'spy';
      const isAccusedSuspect = assignments[mostVoted].role === suspectRole;

      if (isAccusedSuspect) {
        // L'espion/intrus est trouvé → il peut deviner le mot
        navigation.navigate('SpyfallGuess', {
          numPlayers,
          assignments,
          playerNames,
          selectedCategory,
          fromGame: false,
          spyfallUndercover,
          votedPlayerIndex: mostVoted,
        });
      } else {
        // Mauvaise accusation → l'espion/intrus gagne
        navigation.navigate('Result', {
          numPlayers,
          assignments,
          playerNumbers: new Array(numPlayers).fill(null),
          playerNames,
          selectedCategory,
          gameMode: 3,
          spyfallOutcome: 'spyWinsWrongAccusation',
          spyfallUndercover,
        });
      }
    } else {
      // Passer au joueur suivant
      navigation.navigate('SpyfallVote', {
        numPlayers,
        assignments,
        playerNames,
        selectedCategory,
        currentVoter: currentVoter + 1,
        votes: newVotes,
        spyfallUndercover,
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{spyfallUndercover ? t('voteTitleUndercover') : t('voteTitle')}</Text>
      <Text style={styles.voterLabel}>{t('playerLabel', currentVoter + 1)}: {voterName}</Text>
      <Text style={styles.instruction}>{t('voteInstruction')}</Text>

      <ScrollView style={styles.playerList} contentContainerStyle={styles.playerListContent}>
        {safeNames.map((name, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.playerCard, selectedPlayer === i && styles.playerCardSelected]}
            onPress={() => handleSelect(i)}
            activeOpacity={0.7}
          >
            <Text style={[styles.playerName, selectedPlayer === i && styles.playerNameSelected]}>
              {name || t('playerFallback', i + 1)}
            </Text>
            {selectedPlayer === i && <Text style={styles.checkMark}>✓</Text>}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <BouncePress
        onPress={handleConfirm}
        style={[styles.confirmBtn, selectedPlayer === null && styles.confirmBtnDisabled]}
        disabled={selectedPlayer === null}
      >
        <Text style={styles.confirmBtnText}>{lang === 'fr' ? 'CONFIRMER' : 'CONFIRM'}</Text>
      </BouncePress>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5DC', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, paddingTop: 16, gap: 10 },
  title: { fontFamily: 'BebasNeue', fontSize: 36, color: '#1a1a1a', letterSpacing: 2, textAlign: 'center' },
  voterLabel: { fontFamily: 'BebasNeue', fontSize: 22, color: '#1a1a1a', letterSpacing: 1 },
  instruction: { fontFamily: 'SpaceMono', fontSize: 10, color: '#666', letterSpacing: 2, textAlign: 'center' },
  playerList: { width: '100%', maxHeight: '50%' },
  playerListContent: { gap: 8, paddingBottom: 10 },
  playerCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(0,0,0,0.05)', borderWidth: 2, borderColor: 'rgba(0,0,0,0.15)', paddingVertical: 14, paddingHorizontal: 20, borderRadius: 10 },
  playerCardSelected: { backgroundColor: 'rgba(0,0,0,0.12)', borderColor: '#1a1a1a' },
  playerName: { fontFamily: 'BebasNeue', fontSize: 20, color: '#1a1a1a', letterSpacing: 1 },
  playerNameSelected: { color: '#000000' },
  checkMark: { fontFamily: 'BebasNeue', fontSize: 24, color: '#1a1a1a' },
  confirmBtn: { width: '100%', backgroundColor: '#1a1a1a', paddingVertical: 16, alignItems: 'center', borderRadius: 12, marginTop: 8 },
  confirmBtnDisabled: { backgroundColor: 'rgba(26,26,26,0.3)' },
  confirmBtnText: { fontFamily: 'BebasNeue', fontSize: 22, color: '#F5F5DC', letterSpacing: 2 },
});