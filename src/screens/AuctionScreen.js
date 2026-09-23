import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';
import { screenThemes, useDarkTheme } from '../theme';
import { t } from '../i18n';
import { playReveal, playWin } from '../sound';
import { triggerHaptic } from '../animations';
import BouncePress from '../components/BouncePress';
import ScreenBackground from '../components/ScreenBackground';
import { AUCTION_BUDGET, AUCTION_CARDS_PER_PLAYER, AUCTION_BID_STEP, AUCTION_MIN_BID, AUCTION_CATEGORIES, getAuctionDeck } from '../data/auctionCards';

// Machine à états interne (une seule scène, comme SpyfallGuessScreen) :
// draw → tap pour piocher → card → lancer les enchères → auction (l'enchère
// se fait à voix haute ; le téléphone enregistre qui achète et à quel prix)
// → sold (achetée / gardée / défaussée) → carte suivante → ... → AuctionResult
export default function AuctionScreen({ navigation, route }) {
  const { numPlayers, playerNames, auctionCategory, gameMode } = route.params;
  useKeepAwake();
  const darkTheme = useDarkTheme();
  const theme = darkTheme ? screenThemes.dark : screenThemes.light;

  const cat = AUCTION_CATEGORIES[auctionCategory] || AUCTION_CATEGORIES.MERCATO_FOOT;
  const catEmoji = cat.emoji;

  const [deck] = useState(() => getAuctionDeck(auctionCategory));
  // Premier piocheur aléatoire ; ensuite tirage alterné, chacun son tour
  const [drawerIdx, setDrawerIdx] = useState(() => Math.floor(Math.random() * 2));
  const [cardIndex, setCardIndex] = useState(0);
  const [phase, setPhase] = useState('draw'); // 'draw' | 'card' | 'auction' | 'sold'
  const [budgets, setBudgets] = useState([AUCTION_BUDGET, AUCTION_BUDGET]);
  const [collections, setCollections] = useState([[], []]); // [{ nom, prix, kept? }]
  const [buyerIdx, setBuyerIdx] = useState(null); // null = encore en enchère verbale
  const [price, setPrice] = useState(AUCTION_MIN_BID);
  const [soldResult, setSoldResult] = useState(null); // { type: 'bought'|'kept'|'discarded', player, card, price }

  const totalCards = deck.length; // 10 (5 tours de pioche chacun)
  const card = deck[cardIndex];

  const playerName = (idx) => playerNames?.[idx]?.trim() || t('playerFallback', idx + 1);
  const cardsLeft = (idx) => collections[idx].length < AUCTION_CARDS_PER_PLAYER;

  const handleDraw = () => {
    playReveal();
    triggerHaptic('light');
    setPhase('card');
  };

  const handleStartAuction = () => {
    triggerHaptic('medium');
    setBuyerIdx(null);
    setPrice(AUCTION_MIN_BID);
    setPhase('auction');
  };

  const handleChooseBuyer = (idx) => {
    triggerHaptic('light');
    setBuyerIdx(idx);
    setPrice(Math.min(AUCTION_MIN_BID, budgets[idx]));
  };

  const handlePriceChange = (delta) => {
    triggerHaptic('light');
    setPrice((p) => Math.max(AUCTION_MIN_BID, Math.min(budgets[buyerIdx], p + delta)));
  };

  const handleConfirmSale = () => {
    playWin();
    triggerHaptic('heavy');
    const newBudgets = [...budgets];
    newBudgets[buyerIdx] -= price;
    setBudgets(newBudgets);
    const newCollections = [collections[0].slice(), collections[1].slice()];
    newCollections[buyerIdx].push({ nom: card.nom, emoji: catEmoji, prix: price });
    setCollections(newCollections);
    setSoldResult({ type: 'bought', player: buyerIdx, card: card.nom, price });
    setPhase('sold');
  };

  // Personne ne veut la carte → le piocheur la garde gratuitement
  // (ou défausse si son équipe est déjà pleine).
  const handleNobodyWants = () => {
    if (cardsLeft(drawerIdx)) {
      triggerHaptic('light');
      const newCollections = [collections[0].slice(), collections[1].slice()];
      newCollections[drawerIdx].push({ nom: card.nom, emoji: catEmoji, prix: 0, kept: true });
      setCollections(newCollections);
      setSoldResult({ type: 'kept', player: drawerIdx, card: card.nom });
    } else {
      setSoldResult({ type: 'discarded', card: card.nom });
    }
    setPhase('sold');
  };

  // Carte suivante : tirage alterné, chacun son tour
  // (peu importe qui a acheté ou gardé la carte).
  const handleNextCard = () => {
    setDrawerIdx(1 - drawerIdx);
    setCardIndex(cardIndex + 1);
    setBuyerIdx(null);
    setPrice(AUCTION_MIN_BID);
    setSoldResult(null);
    setPhase('draw');
  };

  const handleFinish = () => {
    navigation.navigate('AuctionResult', {
      numPlayers,
      playerNames,
      budgets,
      collections,
      auctionCategory,
      gameMode,
      darkTheme,
    });
  };

  const goBackToMenu = () => {
    navigation.popToTop();
  };

  const renderBackBtn = () => (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel="Back"
      style={[styles.backBtn, { backgroundColor: theme.backBtnBg, borderColor: theme.backBtnBorder }]}
      onPress={goBackToMenu}
      activeOpacity={0.7}
    >
      <Text style={[styles.backBtnText, { color: theme.text }]}>✕</Text>
    </TouchableOpacity>
  );

  const renderBudget = (idx) => (
    <View key={idx} style={[styles.budgetBox, idx === buyerIdx && phase === 'auction' ? { borderColor: theme.neon } : null, { backgroundColor: theme.counterBg, borderColor: theme.counterBorder }]}>
      <Text style={[styles.budgetName, { color: theme.text }]} numberOfLines={1}>{playerName(idx)}</Text>
      <Text style={[styles.budgetValue, { color: theme.neon }]}>{t('enchBudget', budgets[idx])}</Text>
      <Text style={[styles.budgetCards, { color: theme.text }]}>
        📇 {collections[idx].length}/{AUCTION_CARDS_PER_PLAYER}
      </Text>
    </View>
  );

  // ─── Phases ───────────────────────────────────────────────
  if (phase === 'draw') {
    return (
      <ScreenBackground darkTheme={darkTheme} style={{ backgroundColor: theme.bg }} scrim={darkTheme ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.60)'}>
        <TouchableOpacity style={styles.container} activeOpacity={0.8} onPress={handleDraw}>
          <Text style={styles.emoji}>{catEmoji}</Text>
          <Text style={[styles.title, { color: theme.text }]}>{t('enchDrawTurn', drawerIdx + 1)}</Text>
          <Text style={[styles.playerName, { color: theme.neon }]}>{playerName(drawerIdx)}</Text>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>{t('enchTapToDraw')}</Text>
          <View style={styles.budgetsRow}>{[0, 1].map(renderBudget)}</View>
          <Text style={[styles.cardProgress, { color: theme.textMuted }]}>
            {t('enchNextCard', cardIndex + 1, totalCards)}
          </Text>
        </TouchableOpacity>
        {renderBackBtn()}
      </ScreenBackground>
    );
  }

  if (phase === 'card') {
    const nameLen = card.nom.length;
    const nameFontSize = nameLen > 16 ? 36 : nameLen > 12 ? 44 : 54;
    return (
      <ScreenBackground darkTheme={darkTheme} style={{ backgroundColor: theme.bg }} scrim={darkTheme ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.60)'}>
        {renderBackBtn()}
        <View style={styles.container}>
          <Text style={styles.emoji}>{catEmoji}</Text>
          <Text style={[styles.cardName, { color: theme.text, fontSize: nameFontSize }]}>{card.nom}</Text>
          <Text style={[styles.cardValue, { color: theme.textMuted }]}>{t('enchCardValue', card.valeur)}</Text>
          <View style={styles.budgetsRow}>{[0, 1].map(renderBudget)}</View>
          <BouncePress
            accessibilityRole="button"
            accessibilityLabel={t('enchStartAuction')}
            onPress={handleStartAuction}
            style={[styles.startAuctionBtn, { backgroundColor: theme.okBtnBg }]}
          >
            <Text style={[styles.startAuctionBtnText, { color: theme.okBtnText }]}>{t('enchStartAuction')}</Text>
          </BouncePress>
        </View>
      </ScreenBackground>
    );
  }

  if (phase === 'auction') {
    // Enchère à voix haute : on enregistre juste l'issue sur le téléphone.
    if (buyerIdx === null) {
      return (
        <ScreenBackground darkTheme={darkTheme} style={{ backgroundColor: theme.bg }} scrim={darkTheme ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.60)'}>
          {renderBackBtn()}
          <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.emojiSmall}>{catEmoji}</Text>
            <Text style={[styles.cardNameSmall, { color: theme.text }]} numberOfLines={1}>{card.nom}</Text>
            <Text style={[styles.subtitle, { color: theme.textMuted }]}>{t('enchVerbalHint')}</Text>

            <View style={styles.budgetsRow}>{[0, 1].map(renderBudget)}</View>

            <Text style={[styles.chooserLabel, { color: theme.text }]}>{t('enchWhoBought')}</Text>

            {[0, 1].map((idx) => {
              const canBuy = budgets[idx] >= AUCTION_MIN_BID && cardsLeft(idx);
              return (
                <BouncePress
                  key={idx}
                  onPress={() => canBuy && handleChooseBuyer(idx)}
                  disabled={!canBuy}
                  style={[styles.buyerBtn, { backgroundColor: theme.okBtnBg }, !canBuy && styles.btnDisabled]}
                >
                  <Text style={[styles.buyerBtnText, { color: theme.okBtnText }]}>
                    {playerName(idx)}
                  </Text>
                  <Text style={styles.buyerBtnSub}>
                    {canBuy ? '' : (budgets[idx] < AUCTION_MIN_BID ? t('enchCantBidBudget') : t('enchCantBidCards'))}
                  </Text>
                </BouncePress>
              );
            })}

            <BouncePress
              onPress={handleNobodyWants}
              style={[styles.nobodyBtn, { backgroundColor: theme.counterBtnBg, borderColor: theme.counterBtnBorder }]}
            >
              <Text style={[styles.nobodyBtnText, { color: theme.text }]}>{t('enchNobody')}</Text>
            </BouncePress>
          </ScrollView>
        </ScreenBackground>
      );
    }

    // Prix payé : réglé à voix haute, on l'entre par paliers de 10M.
    return (
      <ScreenBackground darkTheme={darkTheme} style={{ backgroundColor: theme.bg }} scrim={darkTheme ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.60)'}>
        {renderBackBtn()}
        <View style={styles.container}>
          <Text style={styles.emojiSmall}>{catEmoji}</Text>
          <Text style={[styles.cardNameSmall, { color: theme.text }]} numberOfLines={1}>{card.nom}</Text>
          <Text style={[styles.speakerLabel, { color: theme.text }]}>{playerName(buyerIdx)}</Text>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>{t('enchPrice')}</Text>

          <View style={styles.priceRow}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="-10"
              onPress={() => handlePriceChange(-AUCTION_BID_STEP)}
              disabled={price <= AUCTION_MIN_BID}
              style={[styles.priceStepBtn, { backgroundColor: theme.counterBtnBg, borderColor: theme.counterBtnBorder }, price <= AUCTION_MIN_BID && styles.btnDisabled]}
            >
              <Text style={[styles.priceStepText, { color: theme.text }]}>−10</Text>
            </TouchableOpacity>
            <Text style={[styles.priceValue, { color: theme.neon }]}>{price}M</Text>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="+10"
              onPress={() => handlePriceChange(AUCTION_BID_STEP)}
              disabled={price >= budgets[buyerIdx]}
              style={[styles.priceStepBtn, { backgroundColor: theme.counterBtnBg, borderColor: theme.counterBtnBorder }, price >= budgets[buyerIdx] && styles.btnDisabled]}
            >
              <Text style={[styles.priceStepText, { color: theme.text }]}>+10</Text>
            </TouchableOpacity>
          </View>

          <BouncePress
            onPress={handleConfirmSale}
            style={[styles.startAuctionBtn, { backgroundColor: theme.okBtnBg }]}
          >
            <Text style={[styles.startAuctionBtnText, { color: theme.okBtnText }]}>{t('enchConfirm')}</Text>
          </BouncePress>
          <BouncePress
            onPress={() => setBuyerIdx(null)}
            style={[styles.nobodyBtn, styles.smallCancel, { backgroundColor: theme.counterBtnBg, borderColor: theme.counterBtnBorder }]}
          >
            <Text style={[styles.nobodyBtnText, { color: theme.text }]}>{t('enchChangeBuyer')}</Text>
          </BouncePress>
        </View>
      </ScreenBackground>
    );
  }

  // ─── phase 'sold' ─────────────────────────────────────────
  const soldMsg = soldResult.type === 'bought'
    ? t('enchBought', soldResult.player + 1, soldResult.card, soldResult.price)
    : soldResult.type === 'kept'
      ? t('enchKept', soldResult.player + 1, soldResult.card)
      : t('enchDiscarded', soldResult.card);
  const isLastCard = cardIndex + 1 >= totalCards;

  return (
    <ScreenBackground darkTheme={darkTheme} style={{ backgroundColor: theme.bg }} scrim={darkTheme ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.60)'}>
      {renderBackBtn()}
      <View style={styles.container}>
        <Text style={styles.emoji}>{soldResult.type === 'bought' ? '🤑' : soldResult.type === 'kept' ? '🎁' : '🗑️'}</Text>
        <Text style={[styles.soldTitle, { color: theme.neon }]}>{soldMsg}</Text>
        <View style={styles.budgetsRow}>{[0, 1].map(renderBudget)}</View>
        <BouncePress
          accessibilityRole="button"
          accessibilityLabel={isLastCard ? t('enchFinalTitle') : t('enchNextCard', cardIndex + 2, totalCards)}
          onPress={isLastCard ? handleFinish : handleNextCard}
          style={[styles.startAuctionBtn, { backgroundColor: theme.okBtnBg }]}
        >
          <Text style={[styles.startAuctionBtnText, { color: theme.okBtnText }]}>
            {isLastCard ? t('enchFinalTitle') : t('enchNextCard', cardIndex + 2, totalCards)}
          </Text>
        </BouncePress>
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, gap: 14, paddingVertical: 30 },
  backBtn: { position: 'absolute', left: 20, top: 20, width: 44, height: 44, borderRadius: 22, borderWidth: 2, alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  backBtnText: { fontFamily: 'BebasNeue', fontSize: 20 },
  emoji: { fontSize: 56 },
  emojiSmall: { fontSize: 30 },
  title: { fontFamily: 'BebasNeue', fontSize: 38, letterSpacing: 2, textAlign: 'center' },
  playerName: { fontFamily: 'BebasNeue', fontSize: 30, letterSpacing: 2, textAlign: 'center' },
  subtitle: { fontFamily: 'SpaceMono', fontSize: 11, letterSpacing: 2, textAlign: 'center' },
  cardProgress: { fontFamily: 'SpaceMono', fontSize: 10, letterSpacing: 2 },
  cardName: { fontFamily: 'BebasNeue', letterSpacing: 2, textAlign: 'center', lineHeight: 64 },
  cardNameSmall: { fontFamily: 'BebasNeue', fontSize: 34, letterSpacing: 2, maxWidth: '90%' },
  cardValue: { fontFamily: 'SpaceMono', fontSize: 11, letterSpacing: 2 },
  budgetsRow: { flexDirection: 'row', gap: 10, width: '100%' },
  budgetBox: { flex: 1, borderWidth: 1, borderRadius: 10, alignItems: 'center', paddingVertical: 8, gap: 2 },
  budgetName: { fontFamily: 'SpaceMono', fontSize: 11, letterSpacing: 1, maxWidth: '100%' },
  budgetValue: { fontFamily: 'BebasNeue', fontSize: 22, letterSpacing: 1 },
  budgetCards: { fontFamily: 'SpaceMono', fontSize: 10 },
  speakerLabel: { fontFamily: 'BebasNeue', fontSize: 22, letterSpacing: 2, textAlign: 'center' },
  chooserLabel: { fontFamily: 'BebasNeue', fontSize: 26, letterSpacing: 2, textAlign: 'center' },
  buyerBtn: { width: '100%', paddingVertical: 14, alignItems: 'center', borderRadius: 12, gap: 2 },
  buyerBtnText: { fontFamily: 'BebasNeue', fontSize: 18, letterSpacing: 2, textAlign: 'center', color: '#F5F5DC' },
  buyerBtnSub: { fontFamily: 'SpaceMono', fontSize: 8, color: '#ff4444', letterSpacing: 1 },
  nobodyBtn: { width: '80%', paddingVertical: 10, alignItems: 'center', borderRadius: 10, borderWidth: 1 },
  nobodyBtnText: { fontFamily: 'BebasNeue', fontSize: 16, letterSpacing: 2, textAlign: 'center' },
  smallCancel: { width: '60%' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 14, width: '100%', justifyContent: 'center' },
  priceStepBtn: { width: 72, height: 64, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  priceStepText: { fontFamily: 'BebasNeue', fontSize: 26, letterSpacing: 1 },
  priceValue: { fontFamily: 'BebasNeue', fontSize: 56, letterSpacing: 2, minWidth: 130, textAlign: 'center' },
  btnDisabled: { opacity: 0.4 },
  startAuctionBtn: { width: '100%', paddingVertical: 16, alignItems: 'center', borderRadius: 12 },
  startAuctionBtnText: { fontFamily: 'BebasNeue', fontSize: 18, color: '#F5F5DC', letterSpacing: 2, textAlign: 'center' },
  soldTitle: { fontFamily: 'BebasNeue', fontSize: 34, letterSpacing: 2, textAlign: 'center', lineHeight: 44 },
});