import React, { useEffect, useState, useCallback } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';

import MenuScreen from './src/screens/MenuScreen';
import PrepScreen from './src/screens/PrepScreen';
import RevealScreen from './src/screens/RevealScreen';
import BlackScreen from './src/screens/BlackScreen';
import ResultScreen from './src/screens/ResultScreen';
import { generateAssignments } from './src/gameLogic';
import { colors } from './src/theme';

const Stack = createNativeStackNavigator();

// Wrapper pour PrepScreen : génère les assignments au démarrage
function PrepScreenWrapper({ navigation, route }) {
  const { numPlayers } = route.params;

  // Si on arrive depuis le Menu (nouvelle partie), on génère les données
  const assignments = route.params.assignments ?? generateAssignments(numPlayers);
  const takenNumbers = route.params.takenNumbers ?? [];
  const playerNumbers = route.params.playerNumbers ?? new Array(numPlayers).fill(null);
  const currentPlayer = route.params.currentPlayer ?? 0;

  return (
    <PrepScreen
      navigation={navigation}
      route={{
        ...route,
        params: { numPlayers, assignments, takenNumbers, playerNumbers, currentPlayer },
      }}
    />
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    BebasNeue: require('./assets/fonts/BebasNeue-Regular.ttf'),
    SpaceMono: require('./assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor={colors.bg} />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen name="Menu" component={MenuScreen} />
        <Stack.Screen name="Prep" component={PrepScreenWrapper} />
        <Stack.Screen name="Reveal" component={RevealScreen} />
        <Stack.Screen name="Black" component={BlackScreen} />
        <Stack.Screen name="Result" component={ResultScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
