import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';
import { screenThemes, useDarkTheme } from '../theme';
import { t } from '../i18n';
import { playReveal, playWin } from '../sound';
import { triggerHaptic } from '../animations';
import BouncePress from '../components/BouncePress';
import ScreenBackground from '../components/ScreenBackground';
import { AUCTION_BUDGET, AUCTION_CARDS_PER_PLAYER, AUCTION_BID_STEP, AUCTION_MIN_BID, AUCTION_CATEGORIES, getAuctionDeck } from '../data/auctionCards';
import { getAuctionCardImage } from '../data/auctionImages';

// Machine à états interne (une seule scène, comme SpyfallGuessScreen) :
// draw → tap pour piocher → card → lancer les enchères → auction (l'enchère
// se fait à voix haute ; le téléphone enregistre qui achète et à quel prix)
// → sold (achetée / gardée / défaussée) → carte suivante → ... → AuctionResult
export default function AuctionScreen({ navigation, route }) {
  const { numPlayers, playerNames, auctionCategory, gameMode, auctionVariant = 'enchere' } = route.params;
  const isPioche = auctionVariant === 'pioche';
  const isClassement = auctionVariant === 'classement';
  useKeepAwake();
  const darkTheme = useDarkTheme();
  const theme = darkTheme ? screenThemes.dark : screenThemes.light;

  const cat = AUCTION_CATEGORIES[auctionCategory] || AUCTION_CATEGORIES.MERCATO_FOOT;
  const catEmoji = cat.emoji;

  // Visuel de la carte : image du perso si dispo (One Piece, recadrée sur la tête),
  // sinon emoji de la catégorie.
  const renderCardVisual = (nom, size) => {
    const img = getAuctionCardImage(nom, auctionCategory);
    if (img) {
      return (
        <Image
          source={img}
          style={{ width: size, height: size, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.85)' }}
          resizeMode="cover"
        />
      );
    }
    return <Text style={size >= 56 ? styles.emoji : styles.emojiSmall}>{catEmoji}</Text>;
  };

  // getAuctionDeck retourne cardsPerPlayer * 2 cartes : 5 → 10 cartes.
  // Enchère 10 cartes (5 tours), pioche 20 (10 tours × 2 cartes), classement 10 (10 tours).
  const [deck] = useState(() => getAuctionDeck(auctionCategory, isClassement ? 5 : isPioche ? 10 : AUCTION_CARDS_PER_PLAYER));
  // Premier piocheur aléatoire ; ensuite tirage alterné, chacun son tour.
  // CLASSEMENT = mode solo : un seul joueur (drawerIdx reste à 0).
  const [drawerIdx, setDrawerIdx] = useState(() => (isClassement ? 0 : Math.floor(Math.random() * 2)));
  const [cardIndex, setCardIndex] = useState(0);
  const [phase, setPhase] = useState('draw'); // 'draw' | 'card' | 'auction' | 'sold'
  const [budgets, setBudgets] = useState([AUCTION_BUDGET, AUCTION_BUDGET]);
  const [collections, setCollections] = useState([[], []]); // [{ nom, prix, kept? }]
  const [buyerIdx, setBuyerIdx] = useState(null); // null = encore en enchère verbale
  const [price, setPrice] = useState(AUCTION_MIN_BID);
  const [soldResult, setSoldResult] = useState(null); // { type: 'bought'|'kept'|'discarded', player, card, price }
  // Variante PIOCHE : 2 cartes piochées + choix de l'adversaire
  const [piocheCards, setPiocheCards] = useState(null); // [carte du haut, carte du bas]
  const [pickResult, setPickResult] = useState(null); // { player, taken: [nom...], overflow: { card, player } | null }
  // Variante CLASSEMENT : échelle fixe de 10 positions (index 0 = 1er).
  // Chaque carte piochée doit être placée sur une position libre (1 à 10).
  const [ranking, setRanking] = useState(() => new Array(10).fill(null));

  const totalCards = deck.length; // 10 en enchère/classement, 20 en pioche
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
      auctionVariant,
      ranking,
      darkTheme,
    });
  };

  // ─── Variante PIOCHE ─────────────────────────────────────
  // À chaque tour, le piocheur tire 2 cartes : une à GAUCHE, une à DROITE.
  // LUI-MÊME choisit :
  //  - PRENDRE LA GAUCHE → elle entre dans SON équipe (la droite est écartée)
  //  - DONNER LA DROITE  → elle entre dans l'équipe de l'ADVERSAIRE (la gauche est écartée)
  // Équipe déjà pleine (5 cartes) ? La carte déborde chez l'autre joueur.
  const handlePiocheDraw = () => {
    playReveal();
    triggerHaptic('light');
    setPiocheCards([deck[cardIndex], deck[cardIndex + 1]]);
    setPhase('pickChoose');
  };

  // Une seule carte distribuée par tour ; si l'équipe visée est pleine,
  // la carte déborde chez l'autre joueur.
  const applyPiocheCard = (receiverIdx, card) => {
    const newCollections = [collections[0].slice(), collections[1].slice()];
    let actualIdx = receiverIdx;
    if (newCollections[actualIdx].length >= AUCTION_CARDS_PER_PLAYER) {
      actualIdx = 1 - actualIdx;
    }
    newCollections[actualIdx].push({ nom: card.nom, emoji: catEmoji });
    setCollections(newCollections);
    setPickResult({ player: actualIdx, fullIntended: actualIdx === receiverIdx ? null : receiverIdx, card: card.nom });
  };

  const handlePiocheChoose = (keepLeft) => {
    playWin();
    triggerHaptic('heavy');
    const chosenCard = piocheCards[keepLeft ? 0 : 1];
    const receiverIdx = keepLeft ? drawerIdx : 1 - drawerIdx;
    applyPiocheCard(receiverIdx, chosenCard);
    setPhase('pickResult');
  };

  const handlePiocheNext = () => {
    setPiocheCards(null);
    setPickResult(null);
    setDrawerIdx(1 - drawerIdx);
    setCardIndex(cardIndex + 2);
    setPhase('draw');
  };

  // ─── Variante CLASSEMENT (solo) ──────────────────────────
  // Un seul classement commun de 10 cartes. Le joueur pioche une carte
  // aléatoire et choisit où l'insérer (1ère place, entre deux cartes,
  // dernière place). Un seul joueur, pas d'alternance de tour.
  const handleClassementDraw = () => {
    playReveal();
    triggerHaptic('light');
    setPhase('classementPlace');
  };

  const handleClassementInsert = (pos) => {
    if (ranking[pos]) return; // position déjà occupée
    playWin();
    triggerHaptic('heavy');
    const next = [...ranking];
    next[pos] = card.nom;
    setRanking(next);
    if (cardIndex + 1 >= totalCards) {
      setPhase('classementEnd');
      return;
    }
    setCardIndex(cardIndex + 1);
    setPhase('draw');
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
      {!isPioche && <Text style={[styles.budgetValue, { color: theme.neon }]}>{t('enchBudget', budgets[idx])}</Text>}
      <Text style={[styles.budgetCards, { color: theme.text }]}>
        📇 {collections[idx].length}/{AUCTION_CARDS_PER_PLAYER}
      </Text>
    </View>
  );

  // ─── Variante PIOCHE : pioche 2 cartes, le piocheur décide ──
  if (isPioche && phase === 'draw') {
    return (
      <ScreenBackground darkTheme={darkTheme} style={{ backgroundColor: theme.bg }} scrim={darkTheme ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.60)'}>
        <TouchableOpacity style={styles.container} activeOpacity={0.8} onPress={handlePiocheDraw}>
          {cat.logo ? (
            <Image source={cat.logo} style={styles.catLogo} resizeMode="contain" />
          ) : (
            <Text style={styles.emoji}>{catEmoji}</Text>
          )}
          <Text style={[styles.title, { color: theme.neon }]}>{t('enchDrawName', playerName(drawerIdx))}</Text>
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

  if (isPioche && phase === 'pickChoose') {
    const otherIdx = 1 - drawerIdx;
    return (
      <ScreenBackground darkTheme={darkTheme} style={{ backgroundColor: theme.bg }} scrim={darkTheme ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.60)'}>
        {renderBackBtn()}
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <Text style={[styles.chooserLabel, { color: theme.text }]}>{t('enchPiocheChoose', playerName(drawerIdx))}</Text>

          <View style={styles.piocheCardsRow}>
            {[piocheCards[0], piocheCards[1]].map((c, i) => (
              <View key={i} style={styles.piocheCardBox}>
                {renderCardVisual(c.nom, 96)}
                <Text style={[styles.piocheCardName, { color: theme.text }]} numberOfLines={1}>{c.nom}</Text>
                <Text style={[styles.piocheCardTag, { color: theme.textMuted }]}>{i === 0 ? '⬅️' : '➡️'}</Text>
              </View>
            ))}
          </View>

          <View style={styles.budgetsRow}>{[0, 1].map(renderBudget)}</View>

          <BouncePress
            accessibilityRole="button"
            accessibilityLabel={t('enchPiocheKeepLeft', playerName(drawerIdx))}
            onPress={() => handlePiocheChoose(true)}
            style={[styles.buyerBtn, { backgroundColor: theme.okBtnBg }]}
          >
            <Text style={[styles.buyerBtnText, { color: theme.okBtnText }]}>{t('enchPiocheKeepLeft', playerName(drawerIdx))}</Text>
            <Text style={[styles.piocheHint, { color: theme.okBtnText }]}>{t('enchPiocheKeepLeftHint', piocheCards[0]?.nom, playerName(drawerIdx))}</Text>
          </BouncePress>

          <BouncePress
            accessibilityRole="button"
            accessibilityLabel={t('enchPiocheGiveRight', playerName(otherIdx))}
            onPress={() => handlePiocheChoose(false)}
            style={[styles.buyerBtn, { backgroundColor: theme.okBtnBg }]}
          >
            <Text style={[styles.buyerBtnText, { color: theme.okBtnText }]}>{t('enchPiocheGiveRight', playerName(otherIdx))}</Text>
            <Text style={[styles.piocheHint, { color: theme.okBtnText }]}>{t('enchPiocheGiveRightHint', piocheCards[1]?.nom, playerName(otherIdx))}</Text>
          </BouncePress>
        </ScrollView>
      </ScreenBackground>
    );
  }

  if (isPioche && phase === 'pickResult') {
    const bothFull = collections[0].length >= AUCTION_CARDS_PER_PLAYER && collections[1].length >= AUCTION_CARDS_PER_PLAYER;
    const done = bothFull || cardIndex + 2 >= totalCards;
    return (
      <ScreenBackground darkTheme={darkTheme} style={{ backgroundColor: theme.bg }} scrim={darkTheme ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.60)'}>
        {renderBackBtn()}
        <View style={styles.container}>
          <Text style={styles.emoji}>🎴</Text>
          <Text style={[styles.soldTitle, { color: theme.neon }]}>
            {t('enchPiocheWon', playerName(pickResult.player), pickResult.card)}
          </Text>
          {pickResult.fullIntended != null ? (
            <Text style={[styles.subtitle, { color: theme.textMuted }]}>
              {t('enchPiocheFullNote', playerName(pickResult.fullIntended))}
            </Text>
          ) : null}
          <View style={styles.budgetsRow}>{[0, 1].map(renderBudget)}</View>
          <BouncePress
            accessibilityRole="button"
            accessibilityLabel={done ? t('enchFinalTitle') : t('enchNextCard', cardIndex + 3, totalCards)}
            onPress={done ? handleFinish : handlePiocheNext}
            style={[styles.startAuctionBtn, { backgroundColor: theme.okBtnBg }]}
          >
            <Text style={[styles.startAuctionBtnText, { color: theme.okBtnText }]}>
              {done ? t('enchFinalTitle') : t('enchNextCard', cardIndex + 3, totalCards)}
            </Text>
          </BouncePress>
        </View>
      </ScreenBackground>
    );
  }

  // ─── Variante CLASSEMENT : rangée d'une carte déjà classée ──
  const renderRankedRow = (nom, pos) => (
    <View key={pos} style={[styles.classementRow, { backgroundColor: theme.counterBg, borderColor: theme.counterBorder }]}>
      <Text style={[styles.classementRank, { color: theme.neon }]}>
        {pos === 0 ? '🥇' : pos === 1 ? '🥈' : pos === 2 ? '🥉' : `${pos + 1}.`}
      </Text>
      {renderCardVisual(nom, 30)}
      <Text style={[styles.classementNom, { color: theme.text }]} numberOfLines={1}>{nom}</Text>
    </View>
  );

  if (isClassement && phase === 'draw') {
    return (
      <ScreenBackground darkTheme={darkTheme} style={{ backgroundColor: theme.bg }} scrim={darkTheme ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.60)'}>
        <TouchableOpacity style={styles.container} activeOpacity={0.8} onPress={handleClassementDraw}>
          {cat.logo ? (
            <Image source={cat.logo} style={styles.catLogo} resizeMode="contain" />
          ) : (
            <Text style={styles.emoji}>{catEmoji}</Text>
          )}
          <Text style={[styles.title, { color: theme.neon }]}>{playerName(drawerIdx)}</Text>
          <Text style={[styles.subtitle, { color: theme.textMuted }]}>{t('enchTapToDraw')}</Text>
          <Text style={[styles.cardProgress, { color: theme.textMuted }]}>
            {t('enchNextCard', cardIndex + 1, totalCards)}
          </Text>
        </TouchableOpacity>
        {renderBackBtn()}
      </ScreenBackground>
    );
  }

  if (isClassement && phase === 'classementPlace') {
    const nameLen = card.nom.length;
    const nameFontSize = nameLen > 16 ? 20 : nameLen > 12 ? 25 : 30;
    return (
      <ScreenBackground darkTheme={darkTheme} style={{ backgroundColor: theme.bg }} scrim={darkTheme ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.60)'}>
        {renderBackBtn()}
        {/* Tout tient à l'écran : en-tête compact + les 10 positions visibles d'un coup */}
        <ScrollView contentContainerStyle={styles.classementContainer} showsVerticalScrollIndicator={false}>
          <Text style={[styles.classementTurn, { color: theme.text }]}>{t('enchClassementPlace', playerName(drawerIdx))}</Text>
          <View style={styles.classementCardRow}>
            {renderCardVisual(card.nom, 46)}
            <Text style={[styles.cardNameSmall, { color: theme.text, fontSize: nameFontSize }]} numberOfLines={1}>{card.nom}</Text>
          </View>
          <Text style={[styles.subtitle, { color: theme.textMuted, fontSize: 14 }]}>{t('enchClassementHint')}</Text>
          {Array.from({ length: 10 }, (_, pos) => (
            ranking[pos] ? (
              <React.Fragment key={`slot-${pos}`}>
                {renderRankedRow(ranking[pos], pos)}
              </React.Fragment>
            ) : (
              <BouncePress
                key={`slot-${pos}`}
                accessibilityRole="button"
                accessibilityLabel={t('enchClassementSlot', pos + 1)}
                onPress={() => handleClassementInsert(pos)}
                style={[styles.classementSlot, { backgroundColor: theme.counterBtnBg, borderColor: theme.counterBtnBorder }]}
              >
                <Text style={[styles.classementSlotText, { color: theme.textMuted }]}>{t('enchClassementSlot', pos + 1)}</Text>
              </BouncePress>
            )
          ))}
        </ScrollView>
      </ScreenBackground>
    );
  }

  if (isClassement && phase === 'classementEnd') {
    return (
      <ScreenBackground darkTheme={darkTheme} style={{ backgroundColor: theme.bg }} scrim={darkTheme ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.60)'}>
        {renderBackBtn()}
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <Text style={styles.emoji}>🏆</Text>
          <Text style={[styles.soldTitle, { color: theme.neon }]}>{t('enchClassementFinal')}</Text>
          {ranking.filter(Boolean).map((nom, pos) => renderRankedRow(nom, pos))}
          <BouncePress
            accessibilityRole="button"
            accessibilityLabel={t('enchClassementFinish')}
            onPress={handleFinish}
            style={[styles.startAuctionBtn, { backgroundColor: theme.okBtnBg }]}
          >
            <Text style={[styles.startAuctionBtnText, { color: theme.okBtnText }]}>{t('enchClassementFinish')}</Text>
          </BouncePress>
        </ScrollView>
      </ScreenBackground>
    );
  }

  // ─── Phases ───────────────────────────────────────────────
  if (phase === 'draw') {
    return (
      <ScreenBackground darkTheme={darkTheme} style={{ backgroundColor: theme.bg }} scrim={darkTheme ? 'rgba(0,0,0,0.45)' : 'rgba(255,255,255,0.60)'}>
        <TouchableOpacity style={styles.container} activeOpacity={0.8} onPress={handleDraw}>
          {cat.logo ? (
            <Image source={cat.logo} style={styles.catLogo} resizeMode="contain" />
          ) : (
            <Text style={styles.emoji}>{catEmoji}</Text>
          )}
          <Text style={[styles.title, { color: theme.neon }]}>{t('enchDrawName', playerName(drawerIdx))}</Text>
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
          {renderCardVisual(card.nom, 130)}
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
            {renderCardVisual(card.nom, 72)}
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
          {renderCardVisual(card.nom, 44)}
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
    ? t('enchBought', playerName(soldResult.player), soldResult.card, soldResult.price)
    : soldResult.type === 'kept'
      ? t('enchKept', playerName(soldResult.player), soldResult.card)
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
  catLogo: { width: 220, height: 120, marginBottom: 4 },
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
  buyerBtn: { width: '100%', minWidth: 300, paddingHorizontal: 30, paddingVertical: 21, alignItems: 'center', borderRadius: 12, gap: 2 },
  buyerBtnText: { fontFamily: 'BebasNeue', fontSize: 15, letterSpacing: 1, textAlign: 'center', color: '#F5F5DC' },
  buyerBtnSub: { fontFamily: 'SpaceMono', fontSize: 8, color: '#ff4444', letterSpacing: 1 },
  nobodyBtn: { width: '88%', minWidth: 240, paddingHorizontal: 24, paddingVertical: 16, alignItems: 'center', borderRadius: 10, borderWidth: 1 },
  nobodyBtnText: { fontFamily: 'BebasNeue', fontSize: 15, letterSpacing: 1, textAlign: 'center' },
  smallCancel: { width: '60%' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 14, width: '100%', justifyContent: 'center' },
  priceStepBtn: { width: 72, height: 64, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  priceStepText: { fontFamily: 'BebasNeue', fontSize: 26, letterSpacing: 1 },
  priceValue: { fontFamily: 'BebasNeue', fontSize: 56, letterSpacing: 2, minWidth: 130, textAlign: 'center' },
  btnDisabled: { opacity: 0.4 },
  startAuctionBtn: { width: '100%', minWidth: 300, paddingHorizontal: 30, paddingVertical: 23, alignItems: 'center', borderRadius: 12 },
  startAuctionBtnText: { fontFamily: 'BebasNeue', fontSize: 16, color: '#F5F5DC', letterSpacing: 1, textAlign: 'center' },
  soldTitle: { fontFamily: 'BebasNeue', fontSize: 34, letterSpacing: 2, textAlign: 'center', lineHeight: 44 },
  // Variante PIOCHE
  piocheCardsRow: { flexDirection: 'row', gap: 12, justifyContent: 'center' },
  piocheCardBox: { alignItems: 'center', gap: 4, width: '42%' },
  piocheCardName: { fontFamily: 'BebasNeue', fontSize: 17, letterSpacing: 1, textAlign: 'center' },
  piocheCardTag: { fontFamily: 'SpaceMono', fontSize: 12 },
  piocheHint: { fontFamily: 'SpaceMono', fontSize: 9, letterSpacing: 1, textAlign: 'center' },
  // Variante CLASSEMENT (compact : les 10 positions tiennent à l'écran)
  classementContainer: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 16, gap: 7 },
  classementTurn: { fontFamily: 'BebasNeue', fontSize: 26, letterSpacing: 2, textAlign: 'center' },
  classementCardRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  classementSlot: { width: '100%', paddingVertical: 9, alignItems: 'center', borderRadius: 10, borderWidth: 1 },
  classementSlotText: { fontFamily: 'SpaceMono', fontSize: 13, letterSpacing: 2, textAlign: 'center' },
  classementRow: { flexDirection: 'row', alignItems: 'center', gap: 8, width: '100%', borderWidth: 1, borderRadius: 10, paddingVertical: 7, paddingHorizontal: 12 },
  classementRank: { fontFamily: 'BebasNeue', fontSize: 18, width: 30, textAlign: 'center' },
  classementNom: { fontFamily: 'SpaceMono', fontSize: 14, flex: 1 },
});