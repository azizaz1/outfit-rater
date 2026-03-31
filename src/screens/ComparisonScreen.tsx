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
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { compareOutfits } from '../services/api';
import { RootStackParamList } from '../../App';

type CompareNavProp = NativeStackNavigationProp<RootStackParamList, 'Comparison'>;

const OCCASIONS = ['Casual', 'Work', 'Date', 'Party', 'Gym', 'Formal'];
const OCCASION_ICONS: Record<string, string> = {
  Casual: '👟', Work: '💼', Date: '💘', Party: '🎉', Gym: '💪', Formal: '🎩',
};

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

  function PhotoSlot({ slot, photo }: { slot: 1 | 2; photo: string | null }) {
    return (
      <TouchableOpacity style={styles.photoSlot} onPress={() => pickPhoto(slot)} activeOpacity={0.8}>
        {photo ? (
          <>
            <Image source={{ uri: photo }} style={styles.photo} />
            <LinearGradient
              colors={['transparent', 'rgba(8,8,16,0.7)']}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.photoLabel}>
              <Text style={styles.photoLabelText}>Outfit {slot}</Text>
              <Text style={styles.photoTapHint}>Tap to change</Text>
            </View>
          </>
        ) : (
          <LinearGradient
            colors={['rgba(124,58,237,0.08)', 'rgba(236,72,153,0.04)']}
            style={styles.photoEmpty}
          >
            <Text style={styles.photoEmptyIcon}>{slot === 1 ? '👗' : '👔'}</Text>
            <Text style={styles.photoEmptyText}>Outfit {slot}</Text>
            <Text style={styles.photoEmptyHint}>Tap to pick</Text>
          </LinearGradient>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(124,58,237,0.12)', 'rgba(8,8,16,0)']}
        style={styles.bgGlow}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Which Outfit Wins?</Text>
        <Text style={styles.subtitle}>Let AI be the judge</Text>

        {/* Photo pickers */}
        <View style={styles.photoPickers}>
          <PhotoSlot slot={1} photo={photo1} />
          <View style={styles.vsWrapper}>
            <LinearGradient colors={['#7C3AED', '#EC4899']} style={styles.vsBadge}>
              <Text style={styles.vsText}>VS</Text>
            </LinearGradient>
          </View>
          <PhotoSlot slot={2} photo={photo2} />
        </View>

        {/* Occasion */}
        <Text style={styles.sectionLabel}>OCCASION</Text>
        <View style={styles.occasionWrap}>
          {OCCASIONS.map((o) => (
            <TouchableOpacity
              key={o}
              style={[styles.chip, occasion === o && styles.chipActive]}
              onPress={() => setOccasion(o)}
              activeOpacity={0.75}
            >
              {occasion === o && (
                <LinearGradient
                  colors={['rgba(124,58,237,0.35)', 'rgba(236,72,153,0.35)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              )}
              <Text style={styles.chipIcon}>{OCCASION_ICONS[o]}</Text>
              <Text style={[styles.chipText, occasion === o && styles.chipTextActive]}>{o}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Compare button */}
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#A855F7" />
            <Text style={styles.loadingText}>AI is judging...</Text>
          </View>
        ) : (
          <TouchableOpacity
            onPress={compare}
            activeOpacity={(!photo1 || !photo2) ? 1 : 0.85}
          >
            <LinearGradient
              colors={(!photo1 || !photo2) ? ['#2A2A3E', '#2A2A3E'] : ['#7C3AED', '#EC4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.compareBtn, (!photo1 || !photo2) && styles.compareBtnDisabled]}
            >
              <Text style={styles.compareBtnText}>Compare Now ⚔️</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080810' },
  bgGlow: { position: 'absolute', top: 0, left: 0, right: 0, height: 300 },
  content: { padding: 24, paddingBottom: 48 },

  title: { fontSize: 26, fontWeight: '900', color: '#F1F5F9', textAlign: 'center', marginBottom: 6, letterSpacing: 0.5 },
  subtitle: { fontSize: 13, color: '#475569', textAlign: 'center', marginBottom: 32, letterSpacing: 1.5, fontWeight: '600' },

  photoPickers: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 32 },
  photoSlot: { flex: 1, height: 210, borderRadius: 20, overflow: 'hidden' },
  photo: { width: '100%', height: '100%', resizeMode: 'cover' },
  photoLabel: {
    position: 'absolute',
    bottom: 12,
    left: 12,
  },
  photoLabelText: { color: '#F1F5F9', fontSize: 13, fontWeight: '800' },
  photoTapHint: { color: '#94A3B8', fontSize: 11 },
  photoEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.2)',
    borderStyle: 'dashed',
  },
  photoEmptyIcon: { fontSize: 36 },
  photoEmptyText: { color: '#94A3B8', fontSize: 13, fontWeight: '700' },
  photoEmptyHint: { color: '#475569', fontSize: 11 },

  vsWrapper: { alignItems: 'center' },
  vsBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  vsText: { color: '#FFFFFF', fontWeight: '900', fontSize: 12, letterSpacing: 1 },

  sectionLabel: { fontSize: 10, fontWeight: '800', color: '#475569', letterSpacing: 2.5, marginBottom: 10 },
  occasionWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 36 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    overflow: 'hidden',
  },
  chipActive: {
    borderColor: 'rgba(168,85,247,0.55)',
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  chipIcon: { fontSize: 14 },
  chipText: { color: '#475569', fontSize: 13, fontWeight: '700' },
  chipTextActive: { color: '#C084FC' },

  loadingBox: { alignItems: 'center', gap: 14, paddingVertical: 32 },
  loadingText: { color: '#64748B', fontSize: 15 },

  compareBtn: {
    paddingVertical: 19,
    borderRadius: 100,
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 10,
  },
  compareBtnDisabled: { opacity: 0.4, shadowOpacity: 0 },
  compareBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
});
