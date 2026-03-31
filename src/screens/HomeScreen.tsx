import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { rateOutfit } from '../services/api';
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
    try {
      const response = await rateOutfit(uri, language, occasion);
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
      <Text style={styles.title}>AI Outfit Rater</Text>
      <Text style={styles.subtitle}>Get instant AI feedback on your style</Text>

      <Image source={require('../../assets/icon.png')} style={styles.logo} />

      <View style={styles.langContainer}>
        {LANGUAGES.map((l) => (
          <TouchableOpacity
            key={l.code}
            style={[styles.langButton, language === l.code && styles.langButtonActive]}
            onPress={() => setLanguage(l.code)}
          >
            <Text style={styles.langFlag}>{l.flag}</Text>
            <Text style={[styles.langText, language === l.code && styles.langTextActive]}>
              {l.code}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionLabel}>Occasion</Text>
      <View style={styles.occasionContainer}>
        {OCCASIONS.map((o) => (
          <TouchableOpacity
            key={o.label}
            style={[styles.occasionButton, occasion === o.label && styles.occasionButtonActive]}
            onPress={() => setOccasion(o.label)}
          >
            <Text style={styles.occasionIcon}>{o.icon}</Text>
            <Text style={[styles.occasionText, occasion === o.label && styles.occasionTextActive]}>
              {o.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6C63FF" />
          <Text style={styles.loadingText}>Analyzing your outfit...</Text>
        </View>
      ) : (
        <>
          <TouchableOpacity style={styles.primaryButton} onPress={() => pickImage(true)}>
            <Text style={styles.buttonText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={() => pickImage(false)}>
            <Text style={styles.secondaryButtonText}>Upload from Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.compareButton} onPress={() => navigation.navigate('Comparison')}>
            <Text style={styles.compareButtonText}>⚔️ Compare Two Outfits</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.historyButton} onPress={() => navigation.navigate('History')}>
            <Text style={styles.historyButtonText}>View Past Ratings</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9B9BB4',
    marginBottom: 40,
    textAlign: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 24,
    marginBottom: 30,
  },
  langContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  langButton: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2A3E',
    backgroundColor: '#1A1A2E',
  },
  langButtonActive: {
    borderColor: '#6C63FF',
    backgroundColor: '#2A2040',
  },
  langFlag: {
    fontSize: 18,
    marginBottom: 2,
  },
  langText: {
    color: '#9B9BB4',
    fontSize: 11,
  },
  langTextActive: {
    color: '#6C63FF',
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#6C63FF',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    borderColor: '#6C63FF',
    borderWidth: 2,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  secondaryButtonText: {
    color: '#6C63FF',
    fontSize: 18,
    fontWeight: '600',
  },
  compareButton: {
    borderColor: '#2A2A3E',
    borderWidth: 2,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#1A1A2E',
  },
  compareButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  historyButton: {
    padding: 12,
  },
  historyButtonText: {
    color: '#9B9BB4',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  loadingContainer: {
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#9B9BB4',
    fontSize: 16,
  },
  sectionLabel: {
    color: '#9B9BB4',
    fontSize: 13,
    alignSelf: 'flex-start',
    marginBottom: 8,
    marginTop: 4,
  },
  occasionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  occasionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2A2A3E',
    backgroundColor: '#1A1A2E',
  },
  occasionButtonActive: {
    borderColor: '#6C63FF',
    backgroundColor: '#2A2040',
  },
  occasionIcon: { fontSize: 15 },
  occasionText: { color: '#9B9BB4', fontSize: 13 },
  occasionTextActive: { color: '#6C63FF', fontWeight: '600' },
});
