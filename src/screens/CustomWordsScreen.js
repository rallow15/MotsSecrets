import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  TextInput, ScrollView, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme';

const STORAGE_KEY = 'custom_words';

export default function CustomWordsScreen({ navigation }) {
  const [wordA, setWordA] = useState('');
  const [wordB, setWordB] = useState('');
  const [customWords, setCustomWords] = useState([]);

  useEffect(() => {
    loadWords();
  }, []);

  const loadWords = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) setCustomWords(JSON.parse(saved));
    } catch (e) {}
  };

  const saveWords = async (words) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(words));
    } catch (e) {}
  };

  const addWord = () => {
    if (!wordA.trim() || !wordB.trim()) {
      Alert.alert('Erreur', 'Remplis les deux mots !');
      return;
    }
    const newWords = [...customWords, { a: wordA.trim(), b: wordB.trim() }];
    setCustomWords(newWords);
    saveWords(newWords);
    setWordA('');
    setWordB('');
  };

  const deleteWord = (index) => {
    const newWords = customWords.filter((_, i) => i !== index);
    setCustomWords(newWords);
    saveWords(newWords);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backBtnText}>← RETOUR</Text>
      </TouchableOpacity>

      <Text style={styles.title}>MES MOTS</Text>
      <Text style={styles.subtitle}>AJOUTE TES PROPRES PAIRES</Text>

      {/* Formulaire ajout */}
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="MOT 1  ex: Ronaldo"
          placeholderTextColor="#444"
          value={wordA}
          onChangeText={setWordA}
          autoCapitalize="words"
        />
        <Text style={styles.vs}>VS</Text>
        <TextInput
          style={styles.input}
          placeholder="MOT 2  ex: Messi"
          placeholderTextColor="#444"
          value={wordB}
          onChangeText={setWordB}
          autoCapitalize="words"
        />
        <TouchableOpacity style={styles.addBtn} onPress={addWord}>
          <Text style={styles.addBtnText}>+ AJOUTER</Text>
        </TouchableOpacity>
      </View>

      {/* Liste des mots */}
      <ScrollView style={styles.list}>
        {customWords.length === 0 && (
          <Text style={styles.empty}>Aucun mot ajouté pour l'instant</Text>
        )}
        {customWords.map((pair, i) => (
          <View key={i} style={styles.row}>
            <Text style={styles.rowText}>{pair.a} <Text style={styles.rowVs}>vs</Text> {pair.b}</Text>
            <TouchableOpacity onPress={() => deleteWord(i)}>
              <Text style={styles.deleteBtn}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  backBtn: {
    marginBottom: 24,
  },
  backBtnText: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: '#666',
    letterSpacing: 2,
  },
  title: {
    fontFamily: 'BebasNeue',
    fontSize: 52,
    color: colors.accent,
    letterSpacing: 3,
  },
  subtitle: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    color: '#666',
    letterSpacing: 3,
    marginBottom: 32,
  },
  form: {
    gap: 12,
    marginBottom: 32,
  },
  input: {
    borderWidth: 1,
    borderColor: '#333',
    padding: 14,
    color: colors.text,
    fontFamily: 'SpaceMono',
    fontSize: 12,
  },
  vs: {
    fontFamily: 'BebasNeue',
    fontSize: 20,
    color: '#444',
    textAlign: 'center',
    letterSpacing: 4,
  },
  addBtn: {
    backgroundColor: colors.accent,
    padding: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  addBtnText: {
    fontFamily: 'BebasNeue',
    fontSize: 22,
    color: colors.bg,
    letterSpacing: 2,
  },
  list: {
    flex: 1,
  },
  empty: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    color: '#444',
    textAlign: 'center',
    marginTop: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#222',
    padding: 14,
    marginBottom: 8,
  },
  rowText: {
    fontFamily: 'BebasNeue',
    fontSize: 20,
    color: colors.text,
    letterSpacing: 1,
  },
  rowVs: {
    color: '#444',
    fontSize: 14,
  },
  deleteBtn: {
    color: '#666',
    fontSize: 18,
    padding: 4,
  },
});