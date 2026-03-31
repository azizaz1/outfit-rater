import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { compareOutfits } from '../services/api';
import { RootStackParamList } from '../../App';

type CompareNavProp = NativeStackNavigationProp<RootStackParamList, 'Comparison'>;

const OCCASIONS = ['Casual', 'Work', 'Date', 'Party', 'Gym', 'Formal'];

export default function ComparisonScreen() {
  const navigation = useNavigation<CompareNavProp>();
  const [photo1, setPhoto1] = useState<string | null>(null);
  const [photo2, setPhoto2] = useState<string | null>(null);
  const [occasion, setOccasion] = useState('Casual');
  const [loading, setLoading] = useState(false);

  async function pickPhoto(slot: 1 | 2) {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Please allow access to continue.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });
    if (!result.canceled && result.assets[0]) {
      slot === 1 ? setPhoto1(result.assets[0].uri) : setPhoto2(result.assets[0].uri);
    }
  }

  async function compare() {
    if (!photo1 || !photo2) {
      Alert.alert('Pick both outfits first');
      return;
    }
    setLoading(true);
    try {
      const response = await compareOutfits(photo1, photo2, 'English', occasion);
      if (response.success && response.data) {
        navigation.navigate('ComparisonResult', {
          result: response.data,
          photoUri1: photo1,
          photoUri2: photo2,
        });
      } else {
        Alert.alert('Error', response.error || 'Failed to compare outfits.');
      }
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not connect to server.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Which outfit wins?</Text>
      <Text style={styles.subtitle}>Pick two outfits and let AI decide</Text>

      <View style={styles.photoPickers}>
        <TouchableOpacity style={styles.photoPicker} onPress={() => pickPhoto(1)}>
          {photo1 ? (
            <Image source={{ uri: photo1 }} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPlaceholderIcon}>👗</Text>
              <Text style={styles.photoPlaceholderText}>Outfit 1</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.vsContainer}>
          <Text style={styles.vs}>VS</Text>
        </View>

        <TouchableOpacity style={styles.photoPicker} onPress={() => pickPhoto(2)}>
          {photo2 ? (
            <Image source={{ uri: photo2 }} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPlaceholderIcon}>👔</Text>
              <Text style={styles.photoPlaceholderText}>Outfit 2</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionLabel}>Occasion</Text>
      <View style={styles.occasionContainer}>
        {OCCASIONS.map((o) => (
          <TouchableOpacity
            key={o}
            style={[styles.occasionButton, occasion === o && styles.occasionButtonActive]}
            onPress={() => setOccasion(o)}
          >
            <Text style={[styles.occasionText, occasion === o && styles.occasionTextActive]}>
              {o}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6C63FF" />
          <Text style={styles.loadingText}>AI is judging...</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.compareButton, (!photo1 || !photo2) && styles.compareButtonDisabled]}
          onPress={compare}
        >
          <Text style={styles.compareButtonText}>Compare Now</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },
  content: { padding: 24, paddingBottom: 48 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#9B9BB4', textAlign: 'center', marginBottom: 32 },
  photoPickers: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 32 },
  photoPicker: { flex: 1, height: 200, borderRadius: 16, overflow: 'hidden' },
  photo: { width: '100%', height: '100%' },
  photoPlaceholder: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#2A2A3E',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  photoPlaceholderIcon: { fontSize: 32 },
  photoPlaceholderText: { color: '#9B9BB4', fontSize: 14 },
  vsContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6C63FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vs: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  sectionLabel: { color: '#9B9BB4', fontSize: 13, marginBottom: 10 },
  occasionContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 32 },
  occasionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2A2A3E',
    backgroundColor: '#1A1A2E',
  },
  occasionButtonActive: { borderColor: '#6C63FF', backgroundColor: '#2A2040' },
  occasionText: { color: '#9B9BB4', fontSize: 14 },
  occasionTextActive: { color: '#6C63FF', fontWeight: '600' },
  loadingContainer: { alignItems: 'center', gap: 12 },
  loadingText: { color: '#9B9BB4', fontSize: 16 },
  compareButton: {
    backgroundColor: '#6C63FF',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  compareButtonDisabled: { opacity: 0.4 },
  compareButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
});
