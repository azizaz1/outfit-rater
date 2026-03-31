import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
  Modal,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { rateOutfit } from '../services/api';
import { supabase } from '../services/supabase';
import { RootStackParamList } from '../../App';

type HomeNavProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const LANGUAGES = [
  { code: 'English', flag: '🇬🇧' },
  { code: 'French', flag: '🇫🇷' },
  { code: 'Arabic', flag: '🇸🇦' },
  { code: 'Spanish', flag: '🇪🇸' },
];

const OCCASIONS = [
  { label: 'Casual', icon: '👟' },
  { label: 'Work', icon: '💼' },
  { label: 'Date', icon: '💘' },
  { label: 'Party', icon: '🎉' },
  { label: 'Gym', icon: '💪' },
  { label: 'Formal', icon: '🎩' },
];

export default function HomeScreen() {
  const navigation = useNavigation<HomeNavProp>();
  const [loading, setLoading] = React.useState(false);
  const [language, setLanguage] = React.useState('English');
  const [occasion, setOccasion] = React.useState('Casual');
  const [langOpen, setLangOpen] = React.useState(false);

  const selectedLang = LANGUAGES.find((l) => l.code === language)!

  async function pickImage(useCamera: boolean) {
    const permission = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow access to continue.');
      return;
    }
    const result = useCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.8, base64: false })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.8, base64: false });
    if (!result.canceled && result.assets[0]) {
      analyzeOutfit(result.assets[0].uri);
    }
  }

  async function analyzeOutfit(uri: string) {
    setLoading(true);
    let coords: { lat: number; lon: number } | undefined;
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
        coords = { lat: loc.coords.latitude, lon: loc.coords.longitude };
      }
    } catch {}
    try {
      const response = await rateOutfit(uri, language, occasion, coords);
      if (response.success && response.data) {
        navigation.navigate('Results', { rating: response.data, photoUri: uri });
      } else {
        Alert.alert('Error', response.error || 'Failed to analyze outfit.');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || 'Unknown error';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(124,58,237,0.18)', 'rgba(8,8,16,0)', 'rgba(8,8,16,0)']}
        style={styles.bgGlow}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.logoutBtn} onPress={() => supabase.auth.signOut()}>
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
          <View style={styles.logoWrapper}>
            <LinearGradient colors={['#7C3AED', '#EC4899']} style={styles.logoRing}>
              <Image source={require('../../assets/icon.png')} style={styles.logo} />
            </LinearGradient>
          </View>
          <Text style={styles.title}>OUTFIT RATER</Text>
          <Text style={styles.subtitle}>AI-powered style analysis</Text>
        </View>

        {/* Language dropdown */}
        <Text style={styles.sectionLabel}>LANGUAGE</Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setLangOpen(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.dropdownFlag}>{selectedLang.flag}</Text>
          <Text style={styles.dropdownValue}>{selectedLang.code}</Text>
          <Text style={styles.dropdownArrow}>▾</Text>
        </TouchableOpacity>

        {/* Language modal */}
        <Modal visible={langOpen} transparent animationType="fade" onRequestClose={() => setLangOpen(false)}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setLangOpen(false)}>
            <View style={styles.modalSheet}>
              <Text style={styles.modalTitle}>SELECT LANGUAGE</Text>
              <FlatList
                data={LANGUAGES}
                keyExtractor={(l) => l.code}
                renderItem={({ item }) => {
                  const active = item.code === language;
                  return (
                    <TouchableOpacity
                      style={[styles.modalOption, active && styles.modalOptionActive]}
                      onPress={() => { setLanguage(item.code); setLangOpen(false); }}
                      activeOpacity={0.75}
                    >
                      {active && (
                        <LinearGradient
                          colors={['rgba(124,58,237,0.2)', 'rgba(236,72,153,0.2)']}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={StyleSheet.absoluteFill}
                        />
                      )}
                      <Text style={styles.modalOptionFlag}>{item.flag}</Text>
                      <Text style={[styles.modalOptionText, active && styles.modalOptionTextActive]}>
                        {item.code}
                      </Text>
                      {active && <Text style={styles.modalCheck}>✓</Text>}
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Occasion */}
        <Text style={styles.sectionLabel}>OCCASION</Text>
        <View style={styles.wrap}>
          {OCCASIONS.map((o) => (
            <TouchableOpacity
              key={o.label}
              style={[styles.occasionChip, occasion === o.label && styles.chipActive]}
              onPress={() => setOccasion(o.label)}
              activeOpacity={0.75}
            >
              {occasion === o.label && (
                <LinearGradient
                  colors={['rgba(124,58,237,0.35)', 'rgba(236,72,153,0.35)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              )}
              <Text style={styles.chipFlag}>{o.icon}</Text>
              <Text style={[styles.chipText, occasion === o.label && styles.chipTextActive]}>
                {o.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Action */}
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#A855F7" />
            <Text style={styles.loadingText}>Analyzing your style...</Text>
          </View>
        ) : (
          <View style={styles.buttons}>
            <TouchableOpacity onPress={() => pickImage(true)} activeOpacity={0.85}>
              <LinearGradient
                colors={['#7C3AED', '#EC4899']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.primaryBtn}
              >
                <Text style={styles.primaryBtnIcon}>📸</Text>
                <Text style={styles.primaryBtnText}>Take Photo</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.outlineBtn}
              onPress={() => pickImage(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.outlineBtnText}>Upload from Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.ghostBtn}
              onPress={() => navigation.navigate('Comparison')}
              activeOpacity={0.8}
            >
              <Text style={styles.ghostBtnText}>⚔️  Compare Two Outfits</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('History')}>
              <Text style={styles.historyLink}>View Past Ratings</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080810' },
  bgGlow: { position: 'absolute', top: 0, left: 0, right: 0, height: 380 },
  scroll: { paddingHorizontal: 24, paddingTop: 64, paddingBottom: 48 },

  header: { alignItems: 'center', marginBottom: 44 },
  logoWrapper: { marginBottom: 20 },
  logoRing: {
    width: 108,
    height: 108,
    borderRadius: 30,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 12,
  },
  logo: { width: 102, height: 102, borderRadius: 28 },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: '#F1F5F9',
    letterSpacing: 5,
    marginBottom: 6,
  },
  subtitle: { fontSize: 12, color: '#475569', letterSpacing: 2.5, fontWeight: '600' },
  logoutBtn: { position: 'absolute', top: 0, right: 0 },
  logoutText: { color: '#334155', fontSize: 13, fontWeight: '600' },

  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 2.5,
    marginBottom: 10,
  },

  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.35)',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    marginBottom: 28,
    gap: 12,
  },
  dropdownFlag: { fontSize: 22 },
  dropdownValue: { flex: 1, color: '#E2E8F0', fontSize: 16, fontWeight: '700' },
  dropdownArrow: { color: '#7C3AED', fontSize: 16 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#12101E',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 20,
    paddingBottom: 48,
    borderTopWidth: 1,
    borderColor: 'rgba(168,85,247,0.25)',
  },
  modalTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 2.5,
    textAlign: 'center',
    marginBottom: 16,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 28,
    gap: 16,
    overflow: 'hidden',
  },
  modalOptionActive: {},
  modalOptionFlag: { fontSize: 26 },
  modalOptionText: { flex: 1, color: '#94A3B8', fontSize: 17, fontWeight: '600' },
  modalOptionTextActive: { color: '#E2E8F0', fontWeight: '800' },
  modalCheck: { color: '#A855F7', fontSize: 18, fontWeight: '800' },

  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 36 },

  occasionChip: {
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
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  chipFlag: { fontSize: 15 },
  chipText: { color: '#475569', fontSize: 12, fontWeight: '700' },
  chipTextActive: { color: '#C084FC' },

  loadingBox: { alignItems: 'center', gap: 16, paddingVertical: 40 },
  loadingText: { color: '#64748B', fontSize: 15, letterSpacing: 0.5 },

  buttons: { gap: 12 },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 19,
    borderRadius: 100,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  primaryBtnIcon: { fontSize: 18 },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
  outlineBtn: {
    paddingVertical: 19,
    borderRadius: 100,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(168,85,247,0.45)',
    backgroundColor: 'rgba(168,85,247,0.06)',
  },
  outlineBtnText: { color: '#C084FC', fontSize: 16, fontWeight: '700' },
  ghostBtn: {
    paddingVertical: 19,
    borderRadius: 100,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  ghostBtnText: { color: '#64748B', fontSize: 15, fontWeight: '600' },
  historyLink: {
    color: '#475569',
    fontSize: 14,
    textAlign: 'center',
    textDecorationLine: 'underline',
    paddingVertical: 8,
    letterSpacing: 0.3,
  },
});
