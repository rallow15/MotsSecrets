import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { colors } from '../theme';
import { t, getLang } from '../i18n';
import { playClick } from '../sound';

export default function SpyfallVoteScreen({ navigation, route }) {
  const { numPlayers, assignments, playerNames, selectedCategory, spyfallTimer, currentVoter, votes, timeLeft } = route.params;
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const lang = getLang();

  const safeNames = Array.isArray(playerNames) ? playerNames : new Array(numPlayers).fill('');
  const voterName = safeNames[currentVoter] || t('playerFallback', currentVoter + 1);

  const handleSelect = (index) => {
    setSelectedPlayer(index);
  };

  const handleConfirm = () => {
    if (selectedPlayer === null) return;
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
        });
        return;
      }

      // Le plus voté est-il l'espion ?
      const isAccusedSpy = assignments[mostVoted].role === 'spy';

      if (isAccusedSpy) {
        // L'espion est trouvé → il peut deviner le mot
        navigation.navigate('SpyfallGuess', {
          numPlayers,
          assignments,
          playerNames,
          selectedCategory,
          spyfallTimer,
          fromGame: false,
        });
      } else {
        // Mauvaise accusation → l'espion gagne
        navigation.navigate('Result', {
          numPlayers,
          assignments,
          playerNumbers: new Array(numPlayers).fill(null),
          playerNames,
          selectedCategory,
          gameMode: 3,
          spyfallOutcome: 'spyWinsWrongAccusation',
        });
      }
    } else {
      // Passer au joueur suivant
      navigation.navigate('SpyfallVote', {
        numPlayers,
        assignments,
        playerNames,
        selectedCategory,
        spyfallTimer,
        currentVoter: currentVoter + 1,
        votes: newVotes,
        timeLeft,
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('voteTitle')}</Text>
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

      <TouchableOpacity
        style={[styles.confirmBtn, selectedPlayer === null && styles.confirmBtnDisabled]}
        onPress={handleConfirm}
        disabled={selectedPlayer === null}
      >
        <Text style={styles.confirmBtnText}>{lang === 'fr' ? 'CONFIRMER' : 'CONFIRM'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5DC', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, paddingTop: 40, gap: 10 },
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