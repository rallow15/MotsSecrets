import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, StatusBar,
  ScrollView, Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme';
import { t, getLang, setLang } from '../i18n';
import { CATEGORIES } from '../data/words';
import { generateAssignments } from '../gameLogic';
import { initSounds, playClick, playStart } from '../sound';

const CATEGORY_EMOJIS = {
  FOOTBALL: '⚽',
  BASKETBALL: '🏀',
  ACTEURS: '🎭',
  ACTRICES: '🎭',
  PAYS: '🗺️',
  ANIMAUX: '🦁',
  JEUX_VIDEO: '🎮',
  MUSIQUE: '🎵',
  VOITURES: '🚗',
  MARQUES: '👜',
  FILMS_SERIES: '🎬',
  MANGA: '🍥',
  OBJETS: '📦',
};

const RULES = {
  fr: [
    {
      mode: 'NORMAL',
      desc: '1 intrus parmi tous les joueurs.',
      steps: [
        'Chaque joueur voit un mot secret. Un seul joueur voit un mot différent : c\'est l\'intrus.',
        'Tout le monde discute sans révéler son mot.',
        'À la fin, les joueurs votent pour désigner l\'intrus.',
        'Si l\'intrus est trouvé, les autres gagnent. Sinon, l\'intrus gagne.',
      ],
    },
    {
      mode: 'MISTER WHITE',
      desc: '1 joueur n\'a aucun mot.',
      steps: [
        'Un joueur (Mister White) ne voit rien. Les autres voient le même mot.',
        'Mister White doit bluffer pour ne pas être découvert.',
        'Si Mister White est voté, il peut tenter de deviner le mot secret.',
        'S\'il devine, il gagne quand même !',
      ],
    },
    {
      mode: 'MISTER WHITE + INTRUS',
      desc: '1 sans mot + 1 intrus + les autres.',
      steps: [
        'Mister White n\'a pas de mot. L\'intrus a un mot différent. Les autres ont le même mot.',
        'Trois camps : les innocents, l\'intrus, Mister White.',
        'Les innocents doivent trouver les deux imposteurs.',
        'L\'intrus et Mister White peuvent s\'allier ou se trahir.',
      ],
    },
  ],
  en: [
    {
      mode: 'NORMAL',
      desc: '1 impostor among all players.',
      steps: [
        'Each player sees a secret word. One player sees a different word: the impostor.',
        'Everyone discusses without revealing their word.',
        'Players vote to identify the impostor.',
        'If the impostor is found, the others win. Otherwise the impostor wins.',
      ],
    },
    {
      mode: 'MISTER WHITE',
      desc: '1 player has no word.',
      steps: [
        'One player (Mister White) sees nothing. The others see the same word.',
        'Mister White must bluff to avoid being caught.',
        'If Mister White is voted out, they can try to guess the secret word.',
        'If they guess correctly, they still win!',
      ],
    },
    {
      mode: 'MISTER WHITE + IMPOSTOR',
      desc: '1 no word + 1 impostor + others.',
      steps: [
        'Mister White has no word. The impostor has a different word. Others share the same word.',
        'Three sides: innocents, impostor, Mister White.',
        'Innocents must find both impostors.',
        'The impostor and Mister White can ally or betray each other.',
      ],
    },
  ],
};

export default function MenuScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [numPlayers, setNumPlayers] = useState(3);
  const [gameMode, setGameMode] = useState(0);
  const [lang, setLangState] = useState(getLang());
  const [showRules, setShowRules] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    initSounds();
  }, []);

  // Ajuster le nombre de joueurs selon le mode
  useEffect(() => {
    if (gameMode === 2 && numPlayers < 4) {
      setNumPlayers(4);
    }
  }, [gameMode]);

  const toggleLang = () => {
    const next = lang === 'fr' ? 'en' : 'fr';
    setLang(next);
    setLangState(next);
  };

  const MODES = [
    { id: 0, titleKey: 'mode0title', descKey: 'mode0desc' },
    { id: 1, titleKey: 'mode1title', descKey: 'mode1desc' },
    { id: 2, titleKey: 'mode2title', descKey: 'mode2desc' },
  ];

  const handleStart = () => {
    // Mode 2 (INTRUS + MISTER WHITE) nécessite 4 joueurs minimum
    if (gameMode === 2 && numPlayers < 4) {
      setNumPlayers(4);
      return;
    }

    const assignments = generateAssignments(numPlayers, gameMode, selectedCategory);

    navigation.navigate('Prep', {
      numPlayers,
      gameMode,
      selectedCategory,
      assignments,
    });
  };

  const handleCategorySelect = (cat) => {
    if (selectedCategory === cat) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(cat);
    }
    setShowCategories(false);
  };

  const rules = RULES[lang];
  const categoryKeys = Object.keys(CATEGORIES);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={[styles.container, { paddingTop: insets.top + 60 }]}
      keyboardShouldPersistTaps="handled"
    >
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      {/* Ligne haut : règles + langue */}
      <View style={styles.topRow}>
        <TouchableOpacity style={styles.rulesBtn} onPress={() => setShowRules(true)}>
          <Text style={styles.rulesBtnText}>{lang === 'fr' ? '📖 RÈGLES' : '📖 RULES'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.langBtn} onPress={toggleLang}>
          <Text style={styles.langBtnText}>{lang === 'fr' ? '🇬🇧 EN' : '🇫🇷 FR'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>MOTS{'\n'}SECRETS</Text>
      <Text style={styles.subtitle}>{t('subtitle')}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>{t('players')}</Text>
        <View style={styles.counterRow}>
          <TouchableOpacity style={styles.counterBtn} onPress={() => setNumPlayers(p => Math.max(gameMode === 2 ? 4 : 3, p - 1))}>
            <Text style={styles.counterBtnText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.counterVal}>{numPlayers}</Text>
          <TouchableOpacity style={styles.counterBtn} onPress={() => setNumPlayers(p => Math.min(7, p + 1))}>
            <Text style={styles.counterBtnText}>+</Text>
          </TouchableOpacity>
        </View>
        {gameMode === 2 && numPlayers < 4 && (
          <Text style={styles.warningText}>⚠️ 4 joueurs minimum pour ce mode</Text>
        )}
      </View>

      {/* Section Catégorie */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>📚 CATÉGORIE</Text>
        <TouchableOpacity
          style={styles.categoryBtn}
          onPress={() => setShowCategories(true)}
        >
          <Text style={styles.categoryBtnText}>
            {selectedCategory
              ? `${CATEGORY_EMOJIS[selectedCategory] || '🎯'} ${selectedCategory.replace('_', ' ')}`
              : 'Toutes les catégories (aléatoire)'}
          </Text>
          <Text style={styles.categoryArrow}>→</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>{t('gameMode')}</Text>
        {MODES.map(mode => (
          <TouchableOpacity
            key={mode.id}
            style={[styles.modeBtn, gameMode === mode.id && styles.modeBtnActive]}
            onPress={() => setGameMode(mode.id)}
          >
            <Text style={[styles.modeTitle, gameMode === mode.id && styles.modeTitleActive]}>
              {t(mode.titleKey)}
            </Text>
            <Text style={styles.modeDesc}>{t(mode.descKey)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.startBtn} onPress={() => handleStart()}>
        <Text style={styles.startBtnText}>{t('start')}</Text>
      </TouchableOpacity>

      {/* ── MODAL CATÉGORIES ── */}
      <Modal
        visible={showCategories}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCategories(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCategoryContent}>
            <Text style={styles.modalCategoryTitle}>CHOISIR UNE CATÉGORIE</Text>

            <ScrollView style={styles.categoryScrollView} showsVerticalScrollIndicator={true}>
              <TouchableOpacity
                style={[styles.categoryOption, selectedCategory === null && styles.categoryOptionActive]}
                onPress={() => handleCategorySelect(null)}
              >
                <Text style={[styles.categoryOptionText, selectedCategory === null && styles.categoryOptionTextActive]}>
                  🎲 Aléatoire (toutes)
                </Text>
              </TouchableOpacity>

              {categoryKeys.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryOption, selectedCategory === cat && styles.categoryOptionActive]}
                  onPress={() => handleCategorySelect(cat)}
                >
                  <Text style={[styles.categoryOptionText, selectedCategory === cat && styles.categoryOptionTextActive]}>
                    {CATEGORY_EMOJIS[cat] || '🎯'} {cat.replace('_', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.closeCategoryBtn}
              onPress={() => setShowCategories(false)}
            >
              <Text style={styles.closeCategoryBtnText}>FERMER</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── MODAL RÈGLES ── */}
      <Modal visible={showRules} animationType="slide" transparent={false} onRequestClose={() => setShowRules(false)}>
        <ScrollView style={styles.modalBg} contentContainerStyle={styles.modalContent}>
          <Text style={styles.modalTitle}>{lang === 'fr' ? 'RÈGLES DU JEU' : 'GAME RULES'}</Text>

          {rules.map((r, i) => (
            <View key={i} style={styles.ruleBlock}>
              <Text style={styles.ruleMode}>{r.mode}</Text>
              <Text style={styles.ruleDesc}>{r.desc}</Text>
              {r.steps.map((s, j) => (
                <View key={j} style={styles.ruleStepRow}>
                  <Text style={styles.ruleNum}>{j + 1}.</Text>
                  <Text style={styles.ruleStep}>{s}</Text>
                </View>
              ))}
            </View>
          ))}

          <TouchableOpacity style={styles.closeBtn} onPress={() => setShowRules(false)}>
            <Text style={styles.closeBtnText}>{lang === 'fr' ? 'FERMER' : 'CLOSE'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:      { backgroundColor: colors.bg, alignItems: 'center', paddingHorizontal: 28, paddingBottom: 24 },
  topRow:         { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 8 },
  rulesBtn:       { borderWidth: 1, borderColor: '#333', paddingHorizontal: 14, paddingVertical: 7 },
  rulesBtnText:   { fontFamily: 'SpaceMono', fontSize: 11, color: colors.gray, letterSpacing: 2 },
  langBtn:        { borderWidth: 1, borderColor: '#333', paddingHorizontal: 14, paddingVertical: 7 },
  langBtnText:    { fontFamily: 'SpaceMono', fontSize: 11, color: colors.accent, letterSpacing: 2 },
  title:          { fontFamily: 'BebasNeue', fontSize: 78, color: colors.accent, textAlign: 'center', lineHeight: 78, letterSpacing: 2, marginBottom: 4 },
  subtitle:       { fontFamily: 'SpaceMono', fontSize: 9, color: colors.gray, letterSpacing: 4, marginBottom: 20, textAlign: 'center' },
  section:        { width: '100%', marginBottom: 14 },
  sectionLabel:   { fontFamily: 'SpaceMono', fontSize: 9, color: colors.gray, letterSpacing: 3, marginBottom: 8 },
  counterRow:     { flexDirection: 'row', alignItems: 'center', gap: 16 },
  counterBtn:     { width: 42, height: 42, borderWidth: 1, borderColor: '#333', alignItems: 'center', justifyContent: 'center' },
  counterBtnText: { color: colors.text, fontSize: 22, fontFamily: 'SpaceMono', lineHeight: 26 },
  counterVal:     { fontFamily: 'BebasNeue', fontSize: 48, color: colors.text, minWidth: 40, textAlign: 'center' },
  warningText:    { fontFamily: 'SpaceMono', fontSize: 10, color: colors.danger, letterSpacing: 1, marginTop: 6 },

  // Bouton catégorie
  categoryBtn: {
    borderWidth: 1,
    borderColor: '#1e1e1e',
    padding: 12,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(232,255,71,0.02)',
  },
  categoryBtnText: {
    fontFamily: 'BebasNeue',
    fontSize: 18,
    color: colors.text,
    letterSpacing: 1,
  },
  categoryArrow: {
    fontFamily: 'BebasNeue',
    fontSize: 24,
    color: colors.accent,
  },

  modeBtn:        { borderWidth: 1, borderColor: '#1e1e1e', padding: 10, marginBottom: 6 },
  modeBtnActive:  { borderColor: colors.accent, backgroundColor: 'rgba(232,255,71,0.05)' },
  modeTitle:      { fontFamily: 'BebasNeue', fontSize: 18, color: colors.muted, letterSpacing: 1, marginBottom: 2 },
  modeTitleActive:{ color: colors.accent },
  modeDesc:       { fontFamily: 'SpaceMono', fontSize: 9, color: colors.gray, letterSpacing: 1 },
  startBtn:       { width: '100%', backgroundColor: colors.accent, paddingVertical: 16, alignItems: 'center', marginTop: 6 },
  startBtnText:   { fontFamily: 'BebasNeue', fontSize: 26, color: colors.bg, letterSpacing: 3 },

  // Modal overlay
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCategoryContent: {
    backgroundColor: colors.bg,
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxHeight: '75%',
    borderWidth: 1,
    borderColor: colors.accent,
  },
  categoryScrollView: {
    maxHeight: 400,
  },
  modalCategoryTitle: {
    fontFamily: 'BebasNeue',
    fontSize: 32,
    color: colors.accent,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 20,
  },
  categoryOption: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  categoryOptionActive: {
    backgroundColor: 'rgba(232,255,71,0.1)',
    borderRadius: 8,
  },
  categoryOptionText: {
    fontFamily: 'BebasNeue',
    fontSize: 20,
    color: colors.text,
    letterSpacing: 1,
  },
  categoryOptionTextActive: {
    color: colors.accent,
  },
  closeCategoryBtn: {
    backgroundColor: colors.accent,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
    borderRadius: 8,
  },
  closeCategoryBtnText: {
    fontFamily: 'BebasNeue',
    fontSize: 20,
    color: colors.bg,
    letterSpacing: 2,
  },

  // Modal règles
  modalBg:        { flex: 1, backgroundColor: colors.bg },
  modalContent:   { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 50 },
  modalTitle:     { fontFamily: 'BebasNeue', fontSize: 52, color: colors.accent, letterSpacing: 2, textAlign: 'center', marginBottom: 32 },
  ruleBlock:      { marginBottom: 32, borderWidth: 1, borderColor: '#1e1e1e', padding: 18 },
  ruleMode:       { fontFamily: 'BebasNeue', fontSize: 24, color: colors.accent, letterSpacing: 2, marginBottom: 4 },
  ruleDesc:       { fontFamily: 'SpaceMono', fontSize: 9, color: colors.gray, letterSpacing: 1, marginBottom: 14 },
  ruleStepRow:    { flexDirection: 'row', gap: 10, marginBottom: 8 },
  ruleNum:        { fontFamily: 'BebasNeue', fontSize: 18, color: colors.accent, width: 20 },
  ruleStep:       { fontFamily: 'SpaceMono', fontSize: 10, color: colors.text, letterSpacing: 1, flex: 1, lineHeight: 18 },
  closeBtn:       { backgroundColor: colors.accent, paddingVertical: 18, alignItems: 'center', marginTop: 10 },
  closeBtnText:   { fontFamily: 'BebasNeue', fontSize: 24, color: colors.bg, letterSpacing: 3 },
});
