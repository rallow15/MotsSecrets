import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { colors } from '../theme';

export default function MenuScreen({ navigation }) {
const [numPlayers, setNumPlayers] = useState(4);
const [misterWhite, setMisterWhite] = useState(false);
const [misterMode, setMisterMode] = useState('with_intrus'); // 'solo' ou 'with_intrus'

const handleStart = () => {
navigation.navigate('Prep', { numPlayers, misterWhite, misterMode });
};

return (
<View style={styles.container}>
<Text style={styles.title}>MOTS{'\n'}SECRETS</Text>
<Text style={styles.subtitle}>TROUVEZ L'INTRUS PARMI VOUS</Text>

<View style={styles.selectorRow}>
<Text style={styles.selectorLabel}>JOUEURS</Text>
<View style={styles.counterRow}>
<TouchableOpacity
style={styles.counterBtn}
onPress={() => setNumPlayers(p => Math.max(3, p - 1))}
>
<Text style={styles.counterBtnText}>−</Text>
</TouchableOpacity>
<Text style={styles.counterVal}>{numPlayers}</Text>
<TouchableOpacity
style={styles.counterBtn}
onPress={() => setNumPlayers(p => Math.min(7, p + 1))}
>
<Text style={styles.counterBtnText}>+</Text>
</TouchableOpacity>
</View>
</View>

{/* Bouton Mister White */}
<View style={styles.misterRow}>
<View style={styles.misterInfo}>
<Text style={styles.misterLabel}>MISTER WHITE</Text>
<Text style={styles.misterDesc}>Un joueur ne reçoit aucun mot</Text>
</View>
<Switch
value={misterWhite}
onValueChange={setMisterWhite}
trackColor={{ false: '#333', true: colors.accent }}
thumbColor={misterWhite ? '#0a0a0a' : '#888'}
/>
</View>

{/* Choix du mode Mister White */}
{misterWhite && (
<View style={styles.modeContainer}>
<TouchableOpacity
style={[styles.modeBtn, misterMode === 'solo' && styles.modeBtnActive]}
onPress={() => setMisterMode('solo')}
>
<Text style={[styles.modeBtnTitle, misterMode === 'solo' && styles.modeBtnTitleActive]}>
MISTER WHITE SEUL
</Text>
<Text style={styles.modeBtnDesc}>1 sans mot vs tous avec le même mot</Text>
</TouchableOpacity>

<TouchableOpacity
style={[styles.modeBtn, misterMode === 'with_intrus' && styles.modeBtnActive]}
onPress={() => setMisterMode('with_intrus')}
>
<Text style={[styles.modeBtnTitle, misterMode === 'with_intrus' && styles.modeBtnTitleActive]}>
MISTER WHITE + INTRUS
</Text>
<Text style={styles.modeBtnDesc}>1 sans mot + 1 intrus + les autres</Text>
</TouchableOpacity>
</View>
)}

<TouchableOpacity style={styles.startBtn} onPress={handleStart}>
<Text style={styles.startBtnText}>DÉMARRER</Text>
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
title: {
fontFamily: 'BebasNeue',
fontSize: 65,
color: colors.accent,
textAlign: 'center',
lineHeight: 62,
letterSpacing: 2,
marginBottom: 8,
},
subtitle: {
fontFamily: 'SpaceMono',
fontSize: 10,
color: colors.gray,
letterSpacing: 4,
marginBottom: 40,
textAlign: 'center',
},
selectorRow: {
flexDirection: 'row',
alignItems: 'center',
gap: 20,
marginBottom: 28,
},
selectorLabel: {
fontFamily: 'SpaceMono',
fontSize: 11,
color: '#888',
letterSpacing: 3,
},
counterRow: {
flexDirection: 'row',
alignItems: 'center',
gap: 16,
},
counterBtn: {
width: 40,
height: 40,
borderWidth: 1,
borderColor: colors.dim,
alignItems: 'center',
justifyContent: 'center',
},
counterBtnText: {
color: colors.text,
fontSize: 22,
fontFamily: 'SpaceMono',
lineHeight: 26,
},
counterVal: {
fontFamily: 'BebasNeue',
fontSize: 48,
color: colors.accent,
minWidth: 32,
textAlign: 'center',
},
misterRow: {
flexDirection: 'row',
alignItems: 'center',
justifyContent: 'space-between',
width: '100%',
borderWidth: 1,
borderColor: colors.dim,
padding: 16,
marginBottom: 16,
},
misterInfo: {
flex: 1,
},
misterLabel: {
fontFamily: 'BebasNeue',
fontSize: 22,
color: colors.accent,
letterSpacing: 2,
},
misterDesc: {
fontFamily: 'SpaceMono',
fontSize: 9,
color: '#666',
letterSpacing: 1,
marginTop: 2,
},
modeContainer: {
width: '100%',
gap: 10,
marginBottom: 16,
},
modeBtn: {
borderWidth: 1,
borderColor: '#333',
padding: 14,
width: '100%',
},
modeBtnActive: {
borderColor: colors.accent,
backgroundColor: '#1a1a00',
},
modeBtnTitle: {
fontFamily: 'BebasNeue',
fontSize: 18,
color: '#666',
letterSpacing: 2,
},
modeBtnTitleActive: {
color: colors.accent,
},
modeBtnDesc: {
fontFamily: 'SpaceMono',
fontSize: 9,
color: '#555',
marginTop: 2,
},
startBtn: {
backgroundColor: colors.accent,
paddingHorizontal: 48,
paddingVertical: 16,
marginTop: 8,
},
startBtnText: {
fontFamily: 'BebasNeue',
fontSize: 26,
color: colors.bg,
letterSpacing: 2,
},
});