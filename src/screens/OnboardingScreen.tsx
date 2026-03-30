import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Animated,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';

type OnboardingNavProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    emoji: '👗',
    title: 'AI Outfit Rater',
    description: 'Get instant, honest feedback on your outfit from an AI fashion stylist.',
  },
  {
    id: '2',
    emoji: '📸',
    title: 'Snap or Upload',
    description: 'Take a photo or pick one from your gallery. Results in seconds.',
  },
  {
    id: '3',
    emoji: '🌍',
    title: 'Your Language',
    description: 'Get feedback in English, French, Arabic, or Spanish.',
  },
  {
    id: '4',
    emoji: '🎯',
    title: 'Pick Your Occasion',
    description: 'Casual, work, date night, party — get ratings tailored to the moment.',
  },
  {
    id: '5',
    emoji: '⭐',
    title: 'Celebrity Match',
    description: 'Discover which celebrity your style matches. Ready to find out?',
  },
];

export default function OnboardingScreen() {
  const navigation = useNavigation<OnboardingNavProp>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  async function finish() {
    await AsyncStorage.setItem('onboarded', 'true');
    navigation.replace('Home');
  }

  function next() {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      finish();
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.skipButton} onPress={finish}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <Animated.FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
        })}
        onMomentumScrollEnd={(e) => {
          setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / width));
        }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => {
            const opacity = scrollX.interpolate({
              inputRange: [(i - 1) * width, i * width, (i + 1) * width],
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });
            const dotWidth = scrollX.interpolate({
              inputRange: [(i - 1) * width, i * width, (i + 1) * width],
              outputRange: [8, 20, 8],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View key={i} style={[styles.dot, { opacity, width: dotWidth }]} />
            );
          })}
        </View>

        <TouchableOpacity style={styles.button} onPress={next}>
          <Text style={styles.buttonText}>
            {currentIndex === SLIDES.length - 1 ? "Let's Go" : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },
  skipButton: { position: 'absolute', top: 56, right: 24, zIndex: 10 },
  skipText: { color: '#9B9BB4', fontSize: 16 },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emoji: { fontSize: 80, marginBottom: 32 },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 17,
    color: '#9B9BB4',
    textAlign: 'center',
    lineHeight: 26,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    alignItems: 'center',
    gap: 24,
  },
  dots: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6C63FF',
  },
  button: {
    backgroundColor: '#6C63FF',
    paddingVertical: 16,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
});
