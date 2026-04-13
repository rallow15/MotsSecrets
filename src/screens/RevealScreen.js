import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { colors } from '../theme';
import { t, getLang } from '../i18n';
import { playClick, playReveal } from '../sound';

// Images MIMER - require statiques pour Metro
const COUPE_2018 = require('../../assets/mimer/Coupe Du monde 2018.jpg');
const COUPE_1998 = require('../../assets/mimer/Coupe Du monde 1998.jpg');
const COVID_19 = require('../../assets/mimer/Covid 19.png');
const PASSE_VACCINAL = require('../../assets/mimer/Passe Vaccinal.jpg');
const OM_93 = require('../../assets/mimer/OM 93.png');
const PSG_25 = require('../../assets/mimer/PSG 25.png');
const ONE_PIECE_ACE = require('../../assets/mimer/La mort de ace.png');
const ONE_PIECE_ZORO = require('../../assets/mimer/sacrifice de zoro.png');
// JO - require dynamique pour éviter problème apostrophe
const getJoImages = () => ({
  ete: require('../../assets/mimer/jeux olympique d\'été.jpg'),
  hiver: require('../../assets/mimer/jeux olympique d\'hiver.png'),
});

export default function RevealScreen({ navigation, route }) {
  const { numPlayers, assignments, currentPlayer, playerNumbers, playerNames, wordVisible: initialWordVisible, mimerMode } = route.params;
  const [wordVisible, setWordVisible] = useState(initialWordVisible || false);
  const [imageError, setImageError] = useState(false);
  const lang = getLang();

  const assignment = assignments[currentPlayer];
  const isMister = assignment.role === 'mister';
  const isMimer = assignment.isMimer || mimerMode;
  const category = assignment.category ?? assignment.cat ?? '';
  const playerName = playerNames?.[currentPlayer] ?? '';

  // Récupérer les données MIMER (paire d'images + indice)
  const mimerData = assignment.mimerData;
  // word = nom de l'image à afficher (image1 ou image2)
  const word = isMister ? 'MISTER WHITE' : assignment.word;

  const wordLen = word ? word.length : 0;
  const wordFontSize = wordLen > 14 ? 44 : wordLen > 10 ? 58 : wordLen > 7 ? 72 : 88;

  // Reset image error state when player changes
  React.useEffect(() => {
    setImageError(false);
  }, [currentPlayer]);

  // Obtenir la source de l'image pour le mode MIMER
  const getImageSource = (wordName) => {
    // Enlever l'extension (.jpg, .png, etc.) pour la comparaison
    const wordNameClean = wordName ? wordName.replace(/\.(jpg|jpeg|png|gif|webp)$/i, '') : '';

    // Images JO dynamiques (à cause des apostrophes dans les noms de fichiers)
    const joImages = getJoImages();

    // Utiliser les images importées directement (comparaison sans extension)
    let imgSource = null;
    if (wordNameClean === 'Coupe Du monde 2018') imgSource = COUPE_2018;
    else if (wordNameClean === 'Coupe Du monde 1998') imgSource = COUPE_1998;
    else if (wordNameClean === 'Covid 19') imgSource = COVID_19;
    else if (wordNameClean === 'Passe Vaccinal') imgSource = PASSE_VACCINAL;
    else if (wordNameClean === 'OM 93') imgSource = OM_93;
    else if (wordNameClean === 'PSG 25') imgSource = PSG_25;
    else if (wordNameClean === 'La mort de ace') imgSource = ONE_PIECE_ACE;
    else if (wordNameClean === 'sacrifice de zoro') imgSource = ONE_PIECE_ZORO;
    else if (wordNameClean === 'jeux olympique d\'été') imgSource = joImages.ete;
    else if (wordNameClean === 'jeux olympique d\'hiver') imgSource = joImages.hiver;

    if (!imgSource) {
      return null;
    }

    return (
      <Image
        source={imgSource}
        style={styles.mimerImage}
        resizeMode="contain"
        onError={() => setImageError(true)}
      />
    );
  };

  // Indice pour Mister White en mode MIMER - juste le nom de la paire
  const mimerHint = isMimer && isMister && mimerData
    ? mimerData.nom
    : null;

  const handleNext = () => {
    playClick();
    const next = currentPlayer + 1;
    if (next >= numPlayers) {
      playReveal();
      navigation.navigate('Result', {
        numPlayers, assignments, playerNumbers, playerNames,
        selectedCategory: route.params.selectedCategory,
        customWords: route.params.customWords || [],
        mimerMode: route.params.mimerMode,
      });
    } else {
      navigation.navigate('Prep', {
        numPlayers, assignments,
        currentPlayer: next,
        takenNumbers: [],
        playerNumbers,
        playerNames,
        selectedCategory: route.params.selectedCategory,
        customWords: route.params.customWords || [],
        mimerMode: route.params.mimerMode,
      });
    }
  };

  // Phase 1 : "Touche l'écran"
  if (!wordVisible) {
    return (
      <TouchableOpacity style={styles.passContainer} activeOpacity={1} onPress={() => setWordVisible(true)}>
        <Text style={styles.playerBadge}>{t('playerLabel', currentPlayer + 1)}</Text>
        {playerName ? <Text style={styles.playerName}>{playerName}</Text> : null}
        <Text style={styles.passPrompt}>{t('touchScreen')}</Text>
        <Text style={styles.tapIcon}>👆</Text>
      </TouchableOpacity>
    );
  }

  // Phase 2 : mot/image visible
  return (
    <View style={styles.container}>
      <Text style={styles.playerBadge}>{t('playerLabel', currentPlayer + 1)}</Text>
      {playerName ? <Text style={styles.playerName}>{playerName}</Text> : null}

      {isMimer && !isMister ? (
        // Mode MIMER : afficher l'image + le nom
        <View style={styles.mimerContainer}>
          {getImageSource(word)}
          <Text style={styles.mimerWord}>{word}</Text>
          <Text style={styles.mimerInstruction}>{t('mimeInstruction')}</Text>
        </View>
      ) : (
        // Mode normal : afficher le mot
        <>
          {!isMister && category && typeof category === 'string' ? (
            <View style={styles.catBadge}>
              <Text style={styles.catText}>{category}</Text>
            </View>
          ) : null}

          <Text style={[styles.word, isMister && styles.wordMister, { fontSize: wordFontSize }]}>
            {typeof word === 'string' ? word : ''}
          </Text>
        </>
      )}

      {isMimer && isMister && mimerHint && (
        <View style={styles.misterHint}>
          <Text style={styles.misterHintText}>💡 {mimerHint}</Text>
        </View>
      )}

      <Text style={styles.hint}>{t('memorize')}</Text>

      <TouchableOpacity style={styles.okBtn} onPress={() => handleNext()} activeOpacity={0.8}>
        <Text style={styles.okBtnText}>OK 👆</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  passContainer: { flex: 1, backgroundColor: '#F5F5DC', alignItems: 'center', justifyContent: 'center', gap: 12, paddingTop: 40 },
  passPrompt: { fontFamily: 'BebasNeue', fontSize: 64, color: '#000000', textAlign: 'center', lineHeight: 60 },
  tapIcon: { fontSize: 52 },
  container: { flex: 1, backgroundColor: '#F5F5DC', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, gap: 12 },
  playerBadge: { fontFamily: 'SpaceMono', fontSize: 10, color: '#000000', letterSpacing: 5 },
  playerName: { fontFamily: 'BebasNeue', fontSize: 44, color: '#000000', letterSpacing: 2 },
  catBadge: { borderWidth: 1, borderColor: 'rgba(0,0,0,0.2)', paddingHorizontal: 14, paddingVertical: 4, borderRadius: 8 },
  catText: { fontFamily: 'SpaceMono', fontSize: 12, color: '#000000', letterSpacing: 2 },
  word: { fontFamily: 'BebasNeue', color: '#000000', textAlign: 'center', letterSpacing: 1 },
  wordMister: { color: '#000000', fontSize: 52 },
  hint: { fontFamily: 'SpaceMono', fontSize: 11, color: '#000000', letterSpacing: 3 },
  okBtn: { marginTop: 20, backgroundColor: '#1a1a1a', paddingVertical: 16, paddingHorizontal: 48, borderRadius: 12, borderWidth: 2, borderColor: 'rgba(0,0,0,0.3)' },
  okBtnText: { fontFamily: 'BebasNeue', fontSize: 26, color: '#F5F5DC', letterSpacing: 3 },
  // Styles pour le mode MIMER
  mimerContainer: { alignItems: 'center', gap: 16 },
  mimerImage: { width: 220, height: 220, borderRadius: 16, borderWidth: 3, borderColor: '#1a1a1a', backgroundColor: '#fff' },
  mimerWord: { fontFamily: 'BebasNeue', fontSize: 32, color: '#000000', textAlign: 'center', letterSpacing: 1 },
  mimerInstruction: { fontFamily: 'SpaceMono', fontSize: 11, color: '#666', textAlign: 'center' },
  misterHint: { backgroundColor: 'rgba(232,255,71,0.3)', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#e8ff47' },
  misterHintText: { fontFamily: 'SpaceMono', fontSize: 11, color: '#1a1a1a' },
});
