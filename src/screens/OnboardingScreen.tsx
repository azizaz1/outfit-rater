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
import { LinearGradient } from 'expo-linear-gradient';
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
    color: '#7C3AED',
  },
  {
    id: '2',
    emoji: '📸',
    title: 'Snap or Upload',
    description: 'Take a photo or pick one from your gallery. Results in seconds.',
    color: '#9333EA',
  },
  {
    id: '3',
    emoji: '🌍',
    title: 'Your Language',
    description: 'Get feedback in English, French, Arabic, or Spanish.',
    color: '#A855F7',
  },
  {
    id: '4',
    emoji: '🎯',
    title: 'Pick Your Occasion',
    description: 'Casual, work, date night, party — get ratings tailored to the moment.',
    color: '#C026D3',
  },
  {
    id: '5',
    emoji: '⭐',
    title: 'Celebrity Match',
    description: 'Discover which celebrity your style matches. Ready to find out?',
    color: '#EC4899',
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

  const isLast = currentIndex === SLIDES.length - 1;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(124,58,237,0.2)', 'rgba(8,8,16,0)', 'rgba(236,72,153,0.1)']}
        style={StyleSheet.absoluteFill}
      />

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
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onMomentumScrollEnd={(e) => {
          setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / width));
        }}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <View style={[styles.emojiWrapper, { shadowColor: item.color }]}>
              <LinearGradient
                colors={[item.color + '22', item.color + '08']}
                style={styles.emojiBackground}
              >
                <Text style={styles.emoji}>{item.emoji}</Text>
              </LinearGradient>
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((slide, i) => {
            const opacity = scrollX.interpolate({
              inputRange: [(i - 1) * width, i * width, (i + 1) * width],
              outputRange: [0.25, 1, 0.25],
              extrapolate: 'clamp',
            });
            const dotWidth = scrollX.interpolate({
              inputRange: [(i - 1) * width, i * width, (i + 1) * width],
              outputRange: [6, 22, 6],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={i}
                style={[styles.dot, { opacity, width: dotWidth, backgroundColor: slide.color }]}
              />
            );
          })}
        </View>

        <TouchableOpacity onPress={next} activeOpacity={0.85} style={styles.btnWrapper}>
          <LinearGradient
            colors={['#7C3AED', '#EC4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>{isLast ? "Let's Go  🚀" : 'Next'}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080810' },
  skipButton: { position: 'absolute', top: 56, right: 24, zIndex: 10 },
  skipText: { color: '#475569', fontSize: 15, fontWeight: '600', letterSpacing: 0.5 },

  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emojiWrapper: {
    marginBottom: 36,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 10,
  },
  emojiBackground: {
    width: 140,
    height: 140,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  emoji: { fontSize: 64 },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: '#F1F5F9',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 26,
    fontWeight: '500',
  },

  footer: {
    paddingHorizontal: 24,
    paddingBottom: 52,
    alignItems: 'center',
    gap: 28,
  },
  dots: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dot: { height: 6, borderRadius: 3 },

  btnWrapper: { width: '100%' },
  button: {
    paddingVertical: 19,
    borderRadius: 100,
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 10,
  },
  buttonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '800', letterSpacing: 0.5 },
});
