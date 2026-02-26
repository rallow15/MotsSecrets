import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { generateAssignments } from '../gameLogic';

export default function BlackScreen({ navigation, route }) {
  const { numPlayers, assignments, currentPlayer, takenNumbers, playerNumbers } = route.params;

  const handlePress = () => {
    const next = currentPlayer + 1;
    if (next >= numPlayers) {
      // Tous les joueurs ont joué → résultat
      navigation.navigate('Result', { numPlayers, playerNumbers });
    } else {
      navigation.navigate('Prep', {
        numPlayers,
        assignments,
        currentPlayer: next,
        takenNumbers,
        playerNumbers,
      });
    }
  };

  return (
    <TouchableOpacity style={styles.container} activeOpacity={1} onPress={handlePress}>
      <View />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
