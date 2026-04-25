import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { colors } from '../theme';
import { t, getLang } from '../i18n';
import { playClick, playReveal } from '../sound';

// Images LIEUX - require statiques pour Metro
const LIEUX_IMAGES = {
  'Plage': require('../../assets/lieux/01_Plage.png'),
  'Restaurant': require('../../assets/lieux/02_Restaurant.png'),
  'Cinéma': require('../../assets/lieux/03_Cinema.png'),
  'Hôpital': require('../../assets/lieux/04_Hopital.png'),
  'Avion': require('../../assets/lieux/05_Avion.png'),
  'École': require('../../assets/lieux/06_Ecole.png'),
  'Gare': require('../../assets/lieux/07_Gare.png'),
  'Supermarché': require('../../assets/lieux/08_Supermarche.png'),
  "Parc d'attractions": require('../../assets/lieux/09_Parc_attractions.png'),
  'Stade': require('../../assets/lieux/10_Stade.png'),
  'Bibliothèque': require('../../assets/lieux/11_Bibliotheque.png'),
  'Musée': require('../../assets/lieux/12_Musee.png'),
  'Aéroport': require('../../assets/lieux/13_Aeroport.png'),
  'Hôtel': require('../../assets/lieux/14_Hotel.png'),
  'Banque': require('../../assets/lieux/15_Banque.png'),
  'Casino': require('../../assets/lieux/16_Casino.png'),
  'Église': require('../../assets/lieux/17_Eglise.png'),
  'Prison': require('../../assets/lieux/18_Prison.png'),
  'Ambassade': require('../../assets/lieux/19_Ambassade.png'),
  'Théâtre': require('../../assets/lieux/20_Theatre.png'),
  'Cirque': require('../../assets/lieux/21_Cirque.png'),
  'Bateau de croisière': require('../../assets/lieux/22_Bateau_croisiere.png'),
  'Camp militaire': require('../../assets/lieux/23_Camp_militaire.png'),
  'Station spatiale': require('../../assets/lieux/24_Station_spatiale.png'),
  'Sous-marin': require('../../assets/lieux/25_Sous-marin.png'),
  'Pôle Nord': require('../../assets/lieux/26_Pole_Nord.png'),
  'Désert': require('../../assets/lieux/27_Desert.png'),
  'Forêt tropicale': require('../../assets/lieux/28_Foret_tropicale.png'),
  'Île déserte': require('../../assets/lieux/29_Ile_deserte.png'),
  'Volcan': require('../../assets/lieux/30_Volcan.png'),
  'Marché': require('../../assets/lieux/31_Marche.png'),
  'Usine': require('../../assets/lieux/32_Usine.png'),
  'Laboratoire': require('../../assets/lieux/33_Laboratoire.png'),
  'Opéra': require('../../assets/lieux/34_Opera.png'),
  'Stade olympique': require('../../assets/lieux/35_Stade_olympique.png'),
  'Spa': require('../../assets/lieux/36_Spa.png'),
  'Festival': require('../../assets/lieux/37_Festival.png'),
  'Caravane': require('../../assets/lieux/38_Caravane.png'),
  'Phare': require('../../assets/lieux/39_Phare.png'),
  'Château': require('../../assets/lieux/40_Chateau.png'),
  // EN locations (même image que FR)
  'Beach': require('../../assets/lieux/01_Plage.png'),
  'Cinema': require('../../assets/lieux/03_Cinema.png'),
  'Hospital': require('../../assets/lieux/04_Hopital.png'),
  'Airplane': require('../../assets/lieux/05_Avion.png'),
  'School': require('../../assets/lieux/06_Ecole.png'),
  'Train Station': require('../../assets/lieux/07_Gare.png'),
  'Supermarket': require('../../assets/lieux/08_Supermarche.png'),
  'Amusement Park': require('../../assets/lieux/09_Parc_attractions.png'),
  'Stadium': require('../../assets/lieux/10_Stade.png'),
  'Library': require('../../assets/lieux/11_Bibliotheque.png'),
  'Museum': require('../../assets/lieux/12_Musee.png'),
  'Airport': require('../../assets/lieux/13_Aeroport.png'),
  'Hotel': require('../../assets/lieux/14_Hotel.png'),
  'Bank': require('../../assets/lieux/15_Banque.png'),
  'Church': require('../../assets/lieux/17_Eglise.png'),
  'Embassy': require('../../assets/lieux/19_Ambassade.png'),
  'Theater': require('../../assets/lieux/20_Theatre.png'),
  'Circus': require('../../assets/lieux/21_Cirque.png'),
  'Cruise Ship': require('../../assets/lieux/22_Bateau_croisiere.png'),
  'Military Camp': require('../../assets/lieux/23_Camp_militaire.png'),
  'Space Station': require('../../assets/lieux/24_Station_spatiale.png'),
  'Submarine': require('../../assets/lieux/25_Sous-marin.png'),
  'North Pole': require('../../assets/lieux/26_Pole_Nord.png'),
  'Desert': require('../../assets/lieux/27_Desert.png'),
  'Rainforest': require('../../assets/lieux/28_Foret_tropicale.png'),
  'Desert Island': require('../../assets/lieux/29_Ile_deserte.png'),
  'Volcano': require('../../assets/lieux/30_Volcan.png'),
  'Market': require('../../assets/lieux/31_Marche.png'),
  'Factory': require('../../assets/lieux/32_Usine.png'),
  'Laboratory': require('../../assets/lieux/33_Laboratoire.png'),
  'Opera': require('../../assets/lieux/34_Opera.png'),
  'Olympic Stadium': require('../../assets/lieux/35_Stade_olympique.png'),
  'Spa': require('../../assets/lieux/36_Spa.png'),
  'Festival': require('../../assets/lieux/37_Festival.png'),
  'Caravan': require('../../assets/lieux/38_Caravane.png'),
  'Lighthouse': require('../../assets/lieux/39_Phare.png'),
  'Castle': require('../../assets/lieux/40_Chateau.png'),
  'Restaurant': require('../../assets/lieux/02_Restaurant.png'),
  'Casino': require('../../assets/lieux/16_Casino.png'),
  'Prison': require('../../assets/lieux/18_Prison.png'),
};

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

  const gameMode = route.params.gameMode ?? 0;
  const assignment = assignments[currentPlayer];
  const isMister = assignment.role === 'mister';
  const isSpy = assignment.role === 'spy';
  const isMimer = assignment.isMimer || mimerMode;
  const category = assignment.category ?? assignment.cat ?? '';
  const playerName = playerNames?.[currentPlayer] ?? '';
  const isSpyfall = gameMode === 3;

  // Récupérer les données MIMER (paire d'images + indice)
  const mimerData = assignment.mimerData;
  // word = nom de l'image à afficher (image1 ou image2)
  const word = isMister ? 'MISTER WHITE' : isSpy ? null : assignment.word;
  const lieuImage = word && LIEUX_IMAGES[word] ? LIEUX_IMAGES[word] : null;

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

  // Indice pour Mister White en mode MIMER
  const mimerHint = isMimer && isMister && mimerData
    ? (lang === 'en' ? mimerData.hintEn : mimerData.indice)
    : null;

  const handleNext = () => {
    playClick();
    const next = currentPlayer + 1;

    if (next >= numPlayers) {
      playReveal();
      if (gameMode === 3) {
        navigation.navigate('SpyfallGame', {
          numPlayers, assignments, playerNames,
          selectedCategory: route.params.selectedCategory,
          spyfallTimer: route.params.spyfallTimer ?? 8,
        });
      } else {
        navigation.navigate('Result', {
          numPlayers, assignments, playerNumbers, playerNames,
          selectedCategory: route.params.selectedCategory,
          customWords: route.params.customWords || [],
          mimerMode: route.params.mimerMode,
        });
      }
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
        gameMode,
        spyfallTimer: route.params.spyfallTimer ?? 8,
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
      ) : isSpy ? (
        // Mode SPYFALL : afficher ESPION
        <View style={styles.spyContainer}>
          <Text style={styles.spyEmoji}>🕵️</Text>
          <Text style={styles.spyTitle}>{t('roleSpy')}</Text>
          <Text style={styles.spyInstruction}>{t('spyInstruction')}</Text>
        </View>
      ) : isSpyfall && lieuImage ? (
        // Mode SPYFALL innocent : afficher image + lieu
        <View style={styles.lieuContainer}>
          <Image source={lieuImage} style={styles.lieuImage} resizeMode="contain" />
          <Text style={styles.lieuWord}>{word}</Text>
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
  spyContainer: { alignItems: 'center', gap: 12 },
  spyEmoji: { fontSize: 64 },
  spyTitle: { fontFamily: 'BebasNeue', fontSize: 52, color: '#000000', letterSpacing: 2 },
  spyInstruction: { fontFamily: 'SpaceMono', fontSize: 11, color: '#666', textAlign: 'center' },
  lieuContainer: { alignItems: 'center', gap: 12, backgroundColor: 'rgba(0,0,0,0.06)', paddingHorizontal: 32, paddingVertical: 24, borderRadius: 20, borderWidth: 2, borderColor: 'rgba(0,0,0,0.15)' },
  lieuImage: { width: 220, height: 220, borderRadius: 16, borderWidth: 3, borderColor: '#1a1a1a', backgroundColor: '#fff' },
  lieuWord: { fontFamily: 'BebasNeue', fontSize: 44, color: '#000000', textAlign: 'center', letterSpacing: 2 },
});
