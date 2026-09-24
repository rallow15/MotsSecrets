import React, { useEffect } from 'react';
import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';
import { screenThemes, useDarkTheme } from '../theme';
import { t } from '../i18n';
import { playWin } from '../sound';
import BouncePress from '../components/BouncePress';
import ScreenBackground from '../components/ScreenBackground';
import { AUCTION_BUDGET } from '../data/auctionCards';
import { getAuctionCardImage } from '../data/auctionImages';

// Récap final du mercato : collections des 2 joueurs + budgets restants
// + vote à voix haute sur la meilleure équipe (pas d'algorithme : c'est la table qui décide).
export default function AuctionResultScreen({ navigation, route }) {
  const { playerNames, budgets, collections, auctionCategory, gameMode } = route.params;
  useKeepAwake();
  const darkTheme = useDarkTheme();
  const theme = darkTheme ? screenThemes.dark : screenThemes.light;

  useEffect(() => {
    playWin();
  }, []);

  const playerName = (idx) => playerNames?.[idx]?.trim() || t('playerFallback', idx + 1);

  const handleReplay = () => {
    // On repasse par Prep : les noms sont conservés, le deck sera re-mélangé.
    navigation.replace('Prep', {
      numPlayers: 2,
      gameMode: 4,
      selectedCategory: auctionCategory,
      selectedCategories: null,
      customWords: [],
      mimerMode: false,
      numUndercovers: 0,
      numMisterWhites: 0,
      easyMode: false,
      spyfallUndercover: false,
      currentPlayer: 0,
      takenNumbers: [],
      playerNumbers: [null, null],
      playerNames,
      assignments: null,
      drawingMode: false,
      drawRounds: 3,
    });
  };

  const handleMenu = () => {
    navigation.popToTop();
  };

  const renderPlayer = (idx) => (
    <View key={idx} style={[styles.playerBox, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
      <View style={styles.playerHeader}>
        <Text style={[styles.playerName, { color: theme.text }]} numberOfLines={1}>{playerName(idx)}</Text>
        <Text style={[styles.playerBudget, { color: theme.neon }]}>{t('enchBudgetLeft', budgets[idx] ?? AUCTION_BUDGET)}</Text>
      </View>

      {collections[idx]?.length > 0 ? (
        <View style={styles.cardsList}>
          {collections[idx].map((c, i) => (
            <View key={i} style={styles.cardRow}>
              {getAuctionCardImage(c.nom) ? (
                <Image source={getAuctionCardImage(c.nom)} style={styles.cardImage} resizeMode="cover" />
              ) : (
                <Text style={styles.cardEmoji}>{c.emoji}</Text>
              )}
              <Text style={[styles.cardNom, { color: theme.text }]} numberOfLines={1}>{c.nom}</Text>
              <Text style={[styles.cardPrix, { color: c.prix > 0 ? theme.neon : theme.textMuted }]}>
                {c.prix > 0 ? `${c.prix}M` : '🎁'}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={[styles.emptyText, { color: theme.textMuted }]}>—</Text>
      )}
    </View>
  );

  return (
    <ScreenBackground darkTheme={darkTheme} style={{ backgroundColor: theme.bg }} scrim={darkTheme ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.60)'}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={[styles.finalTitle, { color: theme.neon }]}>{t('enchFinalTitle')}</Text>
        <Text style={[styles.votePrompt, { color: theme.text }]}>{t('enchVotePrompt')}</Text>

        <View style={styles.playersRow}>
          {renderPlayer(0)}
          {renderPlayer(1)}
        </View>

        <BouncePress
          accessibilityRole="button"
          accessibilityLabel={t('replay')}
          onPress={handleReplay}
          style={[styles.btn, { backgroundColor: theme.okBtnBg }]}
        >
          <Text style={[styles.btnText, { color: theme.okBtnText }]}>{t('replay')}</Text>
        </BouncePress>
        <BouncePress
          accessibilityRole="button"
          accessibilityLabel={t('newGame')}
          onPress={handleMenu}
          style={[styles.btn, styles.menuBtn, { backgroundColor: theme.counterBtnBg, borderColor: theme.counterBtnBorder }]}
        >
          <Text style={[styles.btnText, { color: theme.text }]}>{t('newGame')}</Text>
        </BouncePress>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 30, gap: 14 },
  finalTitle: { fontFamily: 'BebasNeue', fontSize: 42, letterSpacing: 2, textAlign: 'center', lineHeight: 50 },
  votePrompt: { fontFamily: 'BebasNeue', fontSize: 26, letterSpacing: 2, textAlign: 'center', lineHeight: 34 },
  playersRow: { flexDirection: 'row', gap: 10, width: '100%' },
  playerBox: { flex: 1, borderWidth: 1.5, borderRadius: 12, padding: 10, gap: 6 },
  playerHeader: { alignItems: 'center', gap: 2 },
  playerName: { fontFamily: 'BebasNeue', fontSize: 20, letterSpacing: 1 },
  playerBudget: { fontFamily: 'BebasNeue', fontSize: 24, letterSpacing: 1 },
  cardsList: { gap: 4 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardEmoji: { fontSize: 14, width: 18, textAlign: 'center' },
  cardImage: { width: 24, height: 24, borderRadius: 4 },
  cardNom: { fontFamily: 'SpaceMono', fontSize: 9, flex: 1 },
  cardPrix: { fontFamily: 'BebasNeue', fontSize: 13, letterSpacing: 1 },
  emptyText: { fontFamily: 'SpaceMono', fontSize: 10, textAlign: 'center' },
  btn: { width: '100%', paddingVertical: 14, alignItems: 'center', borderRadius: 12 },
  menuBtn: { borderWidth: 1 },
  btnText: { fontFamily: 'BebasNeue', fontSize: 20, letterSpacing: 2, textAlign: 'center' },
});