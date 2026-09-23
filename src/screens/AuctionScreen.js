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
// draw → tap pour piocher → card → lancer les enchères → auction (paliers 10M)
// → sold (achetée / gardée / défaussée) → carte suivante → ... → AuctionResult
export default function AuctionScreen({ navigation, route }) {
  const { numPlayers, playerNames, auctionCategory, gameMode } = route.params;
  useKeepAwake();
  const darkTheme = useDarkTheme();
  const theme = darkTheme ? screenThemes.dark : screenThemes.light;

  const cat = AUCTION_CATEGORIES[auctionCategory] || AUCTION_CATEGORIES.MERCATO_FOOT;
  const catEmoji = cat.emoji;

  const [deck] = useState(() => getAuctionDeck(auctionCategory));
  // Premier piocheur aléatoire ; ensuite le gagnant de la carte pioche la suivante
  const [drawerIdx, setDrawerIdx] = useState(() => Math.floor(Math.random() * 2));
  const [cardIndex, setCardIndex] = useState(0);
  const [phase, setPhase] = useState('draw'); // 'draw' | 'card' | 'auction' | 'sold'
  const [budgets, setBudgets] = useState([AUCTION_BUDGET, AUCTION_BUDGET]);
  const [collections, setCollections] = useState([[], []]); // [{ nom, prix, kept? }]
  const [currentBid, setCurrentBid] = useState(0);
  const [bidHolder, setBidHolder] = useState(null); // null = aucune offre
  const [passed, setPassed] = useState([false, false]);
  const [soldResult, setSoldResult] = useState(null); // { type: 'bought'|'kept'|'discarded', player, card, price }

  const totalCards = deck.length; // 10 (5 tours de pioche chacun)
  const card = deck[cardIndex];

  const playerName = (idx) => playerNames?.[idx]?.trim() || t('playerFallback', idx + 1);
  const cardsLeft = (idx) => collections[idx].length < AUCTION_CARDS_PER_PLAYER;

  // Celui qui doit parler : le piocheur lance l'enchère, puis l'adversaire du
  // dernier enchérisseur. Si le piocheur a passé sans enchère, l'autre prend le relais.
  const speaker = bidHolder === null
    ? (passed[drawerIdx] ? 1 - drawerIdx : drawerIdx)
    : 1 - bidHolder;

  const nextBid = currentBid === 0 ? AUCTION_MIN_BID : currentBid + AUCTION_BID_STEP;
  const canRaise = (idx) => bidHolder !== idx && budgets[idx] >= nextBid && cardsLeft(idx);
  const cantReason = (idx) => (!cardsLeft(idx) ? t('enchCantBidCards') : t('enchCantBidBudget'));

  const handleDraw = () => {
    playReveal();
    triggerHaptic('light');
    setPhase('card');
  };

  const handleStartAuction = () => {
    triggerHaptic('medium');
    setCurrentBid(0);
    setBidHolder(null);
    setPassed([false, false]);
    setPhase('auction');
  };

  const handleBid = (idx) => {
    triggerHaptic('light');
    setCurrentBid(nextBid);
    setBidHolder(idx);
  };

  const handlePass = (idx) => {
    triggerHaptic('medium');
    const newPassed = [...passed];
    newPassed[idx] = true;
    setPassed(newPassed);
    evaluateEnd(newPassed);
  };

  // Fin de la carte : les 2 ont passé → le dernier enchérisseur achète,
  // sinon le piocheur garde gratuitement (ou défausse si son équipe est pleine).
  const evaluateEnd = (newPassed) => {
    if (!(newPassed[0] && newPassed[1])) return;

    if (bidHolder !== null) {
      sellTo(bidHolder, currentBid);
    } else if (cardsLeft(drawerIdx)) {
      keepFree(drawerIdx);
    } else {
      discard();
    }
  };

  const sellTo = (winner, price) => {
    playWin();
    triggerHaptic('heavy');
    const newBudgets = [...budgets];
    newBudgets[winner] -= price;
    setBudgets(newBudgets);
    const newCollections = [collections[0].slice(), collections[1].slice()];
    newCollections[winner].push({ nom: card.nom, emoji: catEmoji, prix: price });
    setCollections(newCollections);
    setSoldResult({ type: 'bought', player: winner, card: card.nom, price });
    setPhase('sold');
  };

  const keepFree = (idx) => {
    triggerHaptic('light');
    const newCollections = [collections[0].slice(), collections[1].slice()];
    newCollections[idx].push({ nom: card.nom, emoji: catEmoji, prix: 0, kept: true });
    setCollections(newCollections);
    setSoldResult({ type: 'kept', player: idx, card: card.nom });
    setPhase('sold');
  };

  const discard = () => {
    setSoldResult({ type: 'discarded', card: card.nom });
    setPhase('sold');
  };

  // Carte suivante : c'est le gagnant de la carte qui pioche
  // (si personne n'a acheté, l'autre joueur prend le relais).
  const handleNextCard = () => {
    const winner = soldResult?.type === 'bought' ? soldResult.player : null;
    setDrawerIdx(winner ?? 1 - drawerIdx);
    setCardIndex(cardIndex + 1);
    setCurrentBid(0);
    setBidHolder(null);
    setPassed([false, false]);
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
    <View key={idx} style={[styles.budgetBox, idx === speaker && phase === 'auction' ? { borderColor: theme.neon } : null, { backgroundColor: theme.counterBg, borderColor: theme.counterBorder }]}>
      <Text style={[styles.budgetName, { color: theme.textMuted }]} numberOfLines={1}>{playerName(idx)}</Text>
      <Text style={[styles.budgetValue, { color: theme.neon }]}>{t('enchBudget', budgets[idx])}</Text>
      <Text style={[styles.budgetCards, { color: theme.textMuted }]}>
        📇 {collections[idx].length}/{AUCTION_CARDS_PER_PLAYER}
      </Text>
    </View>
  );

  const renderPlayerPanel = (idx) => {
    const isSpeaker = idx === speaker;
    const disabled = !isSpeaker || phase !== 'auction';
    return (
      <View style={[
        styles.playerPanel,
        { backgroundColor: theme.counterBg, borderColor: isSpeaker ? theme.neon : theme.counterBorder },
        disabled && styles.panelDisabled,
      ]}>
        <Text style={[styles.panelName, { color: theme.text }]} numberOfLines={1}>{playerName(idx)}</Text>
        <Text style={[styles.panelBid, { color: theme.textMuted }]}>
          {bidHolder === idx ? t('enchHeldBy', idx + 1, currentBid) : ''}
        </Text>
        <BouncePress
          accessibilityRole="button"
          accessibilityLabel={t('enchRaise', nextBid)}
          onPress={() => handleBid(idx)}
          disabled={disabled || !canRaise(idx)}
          style={[styles.raiseBtn, { backgroundColor: theme.okBtnBg }, (disabled || !canRaise(idx)) && styles.btnDisabled]}
        >
          <Text style={[styles.raiseBtnText, { color: theme.okBtnText }]}>{t('enchRaise', nextBid)}</Text>
          {disabled === false && !canRaise(idx) && (
            <Text style={styles.cantBidText}>{cantReason(idx)}</Text>
          )}
        </BouncePress>
        <BouncePress
          accessibilityRole="button"
          accessibilityLabel={t('enchPass')}
          onPress={() => handlePass(idx)}
          disabled={disabled}
          style={[styles.passBtn, { backgroundColor: theme.counterBtnBg, borderColor: theme.counterBtnBorder }, disabled && styles.btnDisabled]}
        >
          <Text style={[styles.passBtnText, { color: theme.text }]}>{t('enchPass')}</Text>
        </BouncePress>
      </View>
    );
  };

  // ─── Phases ───────────────────────────────────────────────
  if (phase === 'draw') {
    return (
      <ScreenBackground darkTheme={darkTheme} style={{ backgroundColor: theme.bg }}>
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
      <ScreenBackground darkTheme={darkTheme} style={{ backgroundColor: theme.bg }}>
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
    return (
      <ScreenBackground darkTheme={darkTheme} style={{ backgroundColor: theme.bg }}>
        {renderBackBtn()}
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <Text style={styles.emojiSmall}>{catEmoji}</Text>
          <Text style={[styles.cardNameSmall, { color: theme.text }]} numberOfLines={1}>{card.nom}</Text>

          <View style={[styles.bidBox, { backgroundColor: theme.cardBg, borderColor: theme.cardBorder }]}>
            <Text style={[styles.bidLabel, { color: theme.textMuted }]}>{t('enchCurrentBid')}</Text>
            <Text style={[styles.bidValue, { color: theme.neon }]}>
              {bidHolder === null ? t('enchNoBid') : `${currentBid}M`}
            </Text>
          </View>

          <Text style={[styles.speakerLabel, { color: theme.text }]}>
            {t('enchBidTurn', speaker + 1)}
          </Text>

          {renderPlayerPanel(speaker)}
          {renderPlayerPanel(1 - speaker)}
        </ScrollView>
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
    <ScreenBackground darkTheme={darkTheme} style={{ backgroundColor: theme.bg }}>
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
  budgetName: { fontFamily: 'SpaceMono', fontSize: 9, letterSpacing: 1, maxWidth: '100%' },
  budgetValue: { fontFamily: 'BebasNeue', fontSize: 22, letterSpacing: 1 },
  budgetCards: { fontFamily: 'SpaceMono', fontSize: 9 },
  bidBox: { width: '100%', borderWidth: 1, borderRadius: 12, alignItems: 'center', paddingVertical: 10, gap: 2 },
  bidLabel: { fontFamily: 'SpaceMono', fontSize: 10, letterSpacing: 2 },
  bidValue: { fontFamily: 'BebasNeue', fontSize: 40, letterSpacing: 2 },
  speakerLabel: { fontFamily: 'BebasNeue', fontSize: 22, letterSpacing: 2, textAlign: 'center' },
  playerPanel: { width: '100%', borderWidth: 1.5, borderRadius: 12, alignItems: 'center', paddingVertical: 12, gap: 8 },
  panelDisabled: { opacity: 0.4 },
  panelName: { fontFamily: 'BebasNeue', fontSize: 20, letterSpacing: 2 },
  panelBid: { fontFamily: 'SpaceMono', fontSize: 9, letterSpacing: 1, minHeight: 11 },
  raiseBtn: { width: '85%', paddingVertical: 12, alignItems: 'center', borderRadius: 10 },
  raiseBtnText: { fontFamily: 'BebasNeue', fontSize: 18, letterSpacing: 2, color: '#F5F5DC' },
  cantBidText: { fontFamily: 'SpaceMono', fontSize: 8, color: '#ff4444', letterSpacing: 1 },
  passBtn: { width: '60%', paddingVertical: 8, alignItems: 'center', borderRadius: 10, borderWidth: 1 },
  passBtnText: { fontFamily: 'BebasNeue', fontSize: 14, letterSpacing: 2 },
  btnDisabled: { opacity: 0.4 },
  startAuctionBtn: { width: '100%', paddingVertical: 16, alignItems: 'center', borderRadius: 12 },
  startAuctionBtnText: { fontFamily: 'BebasNeue', fontSize: 22, color: '#F5F5DC', letterSpacing: 2, textAlign: 'center' },
  soldMsg: { fontFamily: 'BebasNeue', fontSize: 34, letterSpacing: 2, textAlign: 'center', lineHeight: 44 },
});