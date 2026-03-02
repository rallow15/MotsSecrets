import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, ScrollView } from 'react-native';
import { colors } from '../theme';

export default function ResultScreen({ navigation, route }) {
const { numPlayers, playerNumbers, assignments } = route.params;
const mystery = Math.floor(Math.random() * 10) + 1;
const [showRecap, setShowRecap] = useState(false);
const popAnim = useRef(new Animated.Value(0)).current;

let winner = 0;
let bestDiff = Math.abs(playerNumbers[0] - mystery);
for (let i = 1; i < numPlayers; i++) {
const diff = Math.abs(playerNumbers[i] - mystery);
if (diff < bestDiff) {
bestDiff = diff;
winner = i;
}
}

useEffect(() => {
Animated.spring(popAnim, {
toValue: 1,
friction: 4,
useNativeDriver: true,
}).start();
}, []);

if (showRecap) {
return (
<View style={styles.container}>
<Text style={styles.recapTitle}>QUI AVAIT QUOI ?</Text>
<Text style={styles.recapSub}>RÉCAPITULATIF DE LA PARTIE</Text>

<ScrollView style={styles.recapList} contentContainerStyle={{ gap: 12 }}>
{assignments.map((a, i) => (
<View key={i} style={[
styles.recapRow,
i === winner && styles.recapRowWinner,
]}>
<Text style={styles.recapPlayer}>JOUEUR {i + 1}</Text>
<Text style={[
styles.recapWord,
a.isMisterWhite && styles.recapWordMister,
]}>
{a.isMisterWhite ? 'MISTER WHITE' : a.word}
</Text>
{i === winner && (
<Text style={styles.recapWinnerBadge}>⭐ COMMENCE</Text>
)}
</View>
))}
</ScrollView>

<TouchableOpacity
style={styles.startBtn}
onPress={() => navigation.navigate('Menu')}
>
<Text style={styles.startBtnText}>NOUVELLE PARTIE</Text>
</TouchableOpacity>
</View>
);
}

return (
<View style={styles.container}>
<Text style={styles.label}>LE CHIFFRE MYSTÈRE EST</Text>
<Animated.Text style={[styles.number, { transform: [{ scale: popAnim }] }]}>
{mystery}
</Animated.Text>
<Text style={styles.winner}>JOUEUR {winner + 1}</Text>
<Text style={styles.sublabel}>COMMENCE EN PREMIER !</Text>

<TouchableOpacity
style={styles.startBtn}
onPress={() => setShowRecap(true)}
>
<Text style={styles.startBtnText}>NOUVELLE PARTIE</Text>
</TouchableOpacity>
</View>
);
}

const styles = StyleSheet.create({
container: {
flex: 1,
backgroundColor: colors.bg,
alignItems: 'center',
justifyContent: 'center',
paddingHorizontal: 32,
},
label: {
fontFamily: 'SpaceMono',
fontSize: 10,
color: '#888',
letterSpacing: 4,
marginBottom: 16,
},
number: {
fontFamily: 'BebasNeue',
fontSize: 180,
color: colors.accent,
textShadowColor: colors.accent,
textShadowRadius: 30,
lineHeight: 190,
},
winner: {
fontFamily: 'BebasNeue',
fontSize: 48,
color: colors.text,
letterSpacing: 3,
marginTop: 16,
},
sublabel: {
fontFamily: 'SpaceMono',
fontSize: 10,
color: '#888',
letterSpacing: 4,
marginBottom: 40,
},
startBtn: {
backgroundColor: colors.accent,
paddingHorizontal: 48,
paddingVertical: 16,
marginTop: 16,
},
startBtnText: {
fontFamily: 'BebasNeue',
fontSize: 26,
color: colors.bg,
letterSpacing: 2,
},
recapTitle: {
fontFamily: 'BebasNeue',
fontSize: 42,
color: colors.accent,
letterSpacing: 3,
marginBottom: 4,
},
recapSub: {
fontFamily: 'SpaceMono',
fontSize: 9,
color: '#666',
letterSpacing: 3,
marginBottom: 32,
},
recapList: {
width: '100%',
marginBottom: 24,
},
recapRow: {
flexDirection: 'row',
alignItems: 'center',
justifyContent: 'space-between',
borderWidth: 1,
borderColor: '#222',
padding: 16,
},
recapRowWinner: {
borderColor: colors.accent,
backgroundColor: '#1a1a00',
},
recapPlayer: {
fontFamily: 'SpaceMono',
fontSize: 11,
color: '#666',
letterSpacing: 2,
flex: 1,
},
recapWord: {
fontFamily: 'BebasNeue',
fontSize: 24,
color: colors.accent,
letterSpacing: 1,
flex: 1,
textAlign: 'center',
},
recapWordMister: {
color: '#ffffff',
},
recapWinnerBadge: {
fontFamily: 'SpaceMono',
fontSize: 9,
color: colors.accent,
letterSpacing: 1,
flex: 1,
textAlign: 'right',
},
});