import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Animated,
  Linking,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { RootStackParamList } from '../../App';

type ResultsRouteProp = RouteProp<RootStackParamList, 'Results'>;

function AnimatedScore({ score, delay = 0 }: { score: number; delay?: number }) {
  const animated = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = React.useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.timing(animated, {
        toValue: score,
        duration: 1000,
        useNativeDriver: false,
      }).start();
    }, delay);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const listener = animated.addListener(({ value }) => setDisplay(Math.round(value * 10) / 10));
    return () => animated.removeListener(listener);
  }, []);

  return display;
}

function ScoreRing({ score }: { score: number }) {
  const color = score >= 8 ? '#4CAF50' : score >= 6 ? '#FFC107' : '#F44336';
  const animated = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = React.useState(0);

  useEffect(() => {
    Animated.timing(animated, {
      toValue: score,
      duration: 1200,
      useNativeDriver: false,
    }).start();
    const listener = animated.addListener(({ value }) =>
      setDisplay(Math.round(value * 10) / 10)
    );
    return () => animated.removeListener(listener);
  }, []);

  return (
    <View style={[styles.scoreRing, { borderColor: color }]}>
      <Text style={[styles.scoreNumber, { color }]}>{display.toFixed(1)}</Text>
      <Text style={styles.scoreLabel}>/ 10</Text>
    </View>
  );
}

function AnimatedBar({ value, delay = 0 }: { value: number; delay?: number }) {
  const width = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.timing(width, {
        toValue: (value / 10) * 100,
        duration: 900,
        useNativeDriver: false,
      }).start();
    }, delay);
    return () => clearTimeout(timeout);
  }, []);

  const color = value >= 8 ? '#4CAF50' : value >= 6 ? '#FFC107' : '#F44336';

  return (
    <View style={styles.barTrack}>
      <Animated.View
        style={[
          styles.barFill,
          {
            width: width.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
}

function SubScoreRow({ label, value, delay }: { label: string; value: number; delay: number }) {
  const animated = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = React.useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.timing(animated, {
        toValue: value,
        duration: 900,
        useNativeDriver: false,
      }).start();
    }, delay);
    const listener = animated.addListener(({ value: v }) => setDisplay(Math.round(v * 10) / 10));
    return () => {
      clearTimeout(timeout);
      animated.removeListener(listener);
    };
  }, []);

  return (
    <View style={styles.subScoreRow}>
      <View style={styles.subScoreHeader}>
        <Text style={styles.subScoreLabel}>{label}</Text>
        <Text style={styles.subScoreValue}>{display.toFixed(1)}/10</Text>
      </View>
      <AnimatedBar value={value} delay={delay} />
    </View>
  );
}

export default function ResultsScreen() {
  const route = useRoute<ResultsRouteProp>();
  const navigation = useNavigation();
  const { rating, photoUri } = route.params;
  const cardRef = useRef<ViewShot>(null);

  const fadeIn = useRef(new Animated.Value(0)).current;

  async function shareCard() {
    try {
      const uri = await cardRef.current!.capture!();
      await Sharing.shareAsync(uri, { mimeType: 'image/png' });
    } catch {
      // fallback
    }
  }

  useEffect(() => {
    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  async function shareResult() {
    await Share.share({
      message: `I got ${rating.score}/10 on AI Outfit Rater! Style: ${rating.styleCategory}. Try it yourself!`,
    });
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Image source={{ uri: photoUri }} style={styles.photo} />

      <Animated.View style={[styles.scoreContainer, { opacity: fadeIn }]}>
        <ScoreRing score={rating.score} />
        <View style={styles.scoreDetails}>
          <Text style={styles.styleCategory}>{rating.styleCategory}</Text>
          <Text style={styles.occasion}>{rating.occasionFit}</Text>
        </View>
      </Animated.View>

      <Animated.View style={[styles.subScores, { opacity: fadeIn }]}>
        <SubScoreRow label="Colors" value={rating.colorScore} delay={200} />
        <SubScoreRow label="Fit" value={rating.fitScore} delay={400} />
      </Animated.View>

      {rating.weatherTip && (
        <View style={styles.weatherCard}>
          <Text style={styles.weatherLabel}>🌤️ Weather Check</Text>
          <Text style={styles.weatherText}>{rating.weatherTip}</Text>
        </View>
      )}

      {rating.celebrityMatch && (
        <View style={styles.celebrityCard}>
          <Text style={styles.celebrityLabel}>Your style matches</Text>
          <Text style={styles.celebrityName}>⭐ {rating.celebrityMatch}</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What Works</Text>
        {rating.strengths.map((s, i) => (
          <View key={i} style={styles.feedbackRow}>
            <Text style={styles.checkmark}>✅</Text>
            <Text style={styles.feedbackText}>{s}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Room to Improve</Text>
        {rating.improvements.map((s, i) => (
          <View key={i} style={styles.feedbackRow}>
            <Text style={styles.checkmark}>💡</Text>
            <Text style={styles.feedbackText}>{s}</Text>
          </View>
        ))}
      </View>

      {rating.shoppingSuggestions && rating.shoppingSuggestions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛍️ Shop to Elevate</Text>
          {rating.shoppingSuggestions.map((s, i) => (
            <TouchableOpacity
              key={i}
              style={styles.shopItem}
              onPress={() =>
                Linking.openURL(
                  `https://www.google.com/search?tbm=shop&q=${encodeURIComponent(s.item)}`
                )
              }
            >
              <View style={styles.shopInfo}>
                <Text style={styles.shopItemName}>{s.item}</Text>
                <Text style={styles.shopItemReason}>{s.reason}</Text>
              </View>
              <Text style={styles.shopArrow}>→</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Hidden score card for sharing */}
      <ViewShot ref={cardRef} options={{ format: 'png', quality: 1 }} style={styles.hiddenCard}>
        <View style={styles.scoreCard}>
          <Image source={{ uri: photoUri }} style={styles.cardPhoto} />
          <View style={styles.cardOverlay}>
            <Text style={styles.cardAppName}>AI Outfit Rater</Text>
            <Text style={styles.cardScore}>{rating.score.toFixed(1)}</Text>
            <Text style={styles.cardScoreLabel}>/ 10</Text>
            <Text style={styles.cardStyle}>{rating.styleCategory}</Text>
            {rating.celebrityMatch ? (
              <Text style={styles.cardCelebrity}>⭐ {rating.celebrityMatch} vibes</Text>
            ) : null}
            <View style={styles.cardBadges}>
              <View style={styles.cardBadge}>
                <Text style={styles.cardBadgeText}>Colors {rating.colorScore}/10</Text>
              </View>
              <View style={styles.cardBadge}>
                <Text style={styles.cardBadgeText}>Fit {rating.fitScore}/10</Text>
              </View>
            </View>
          </View>
        </View>
      </ViewShot>

      <TouchableOpacity style={styles.shareButton} onPress={shareCard}>
        <Text style={styles.shareButtonText}>Share Score Card</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>Rate Another Outfit</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },
  content: { paddingBottom: 40 },
  weatherCard: {
    marginHorizontal: 24,
    marginBottom: 16,
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2A6C8C',
  },
  weatherLabel: { color: '#5BC4E8', fontSize: 13, fontWeight: '600', marginBottom: 6 },
  weatherText: { color: '#D0D0E8', fontSize: 15, lineHeight: 22 },
  celebrityCard: {
    marginHorizontal: 24,
    marginBottom: 20,
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6C63FF',
  },
  celebrityLabel: { color: '#9B9BB4', fontSize: 13, marginBottom: 6 },
  celebrityName: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
  photo: { width: '100%', height: 320, resizeMode: 'cover' },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    gap: 20,
  },
  scoreRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNumber: { fontSize: 28, fontWeight: 'bold' },
  scoreLabel: { color: '#9B9BB4', fontSize: 12 },
  scoreDetails: { flex: 1 },
  styleCategory: { color: '#FFFFFF', fontSize: 22, fontWeight: 'bold' },
  occasion: { color: '#9B9BB4', fontSize: 14, marginTop: 4 },
  subScores: {
    marginHorizontal: 24,
    marginBottom: 24,
    gap: 12,
  },
  subScoreRow: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
  },
  subScoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  subScoreValue: { color: '#6C63FF', fontSize: 16, fontWeight: 'bold' },
  subScoreLabel: { color: '#9B9BB4', fontSize: 14 },
  barTrack: {
    height: 6,
    backgroundColor: '#2A2A3E',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: 6,
    borderRadius: 3,
  },
  section: {
    marginHorizontal: 24,
    marginBottom: 20,
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 16,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  feedbackRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  checkmark: { fontSize: 16 },
  feedbackText: { color: '#D0D0E8', fontSize: 15, flex: 1, lineHeight: 22 },
  shopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F0F1A',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2A2A3E',
  },
  shopInfo: { flex: 1 },
  shopItemName: { color: '#FFFFFF', fontSize: 15, fontWeight: '600', marginBottom: 2 },
  shopItemReason: { color: '#9B9BB4', fontSize: 13 },
  shopArrow: { color: '#6C63FF', fontSize: 18, fontWeight: 'bold' },
  hiddenCard: { position: 'absolute', top: -9999, left: 0 },
  scoreCard: { width: 360, height: 480, borderRadius: 24, overflow: 'hidden' },
  cardPhoto: { width: '100%', height: '100%', position: 'absolute' },
  cardOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,15,26,0.78)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  cardAppName: { color: '#9B9BB4', fontSize: 13, letterSpacing: 2, marginBottom: 12 },
  cardScore: { color: '#FFFFFF', fontSize: 72, fontWeight: 'bold', lineHeight: 76 },
  cardScoreLabel: { color: '#9B9BB4', fontSize: 18, marginBottom: 12 },
  cardStyle: { color: '#FFFFFF', fontSize: 22, fontWeight: '600', marginBottom: 8, textAlign: 'center' },
  cardCelebrity: { color: '#6C63FF', fontSize: 15, marginBottom: 16 },
  cardBadges: { flexDirection: 'row', gap: 10 },
  cardBadge: {
    backgroundColor: 'rgba(108,99,255,0.3)',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#6C63FF',
  },
  cardBadgeText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  shareButton: {
    backgroundColor: '#6C63FF',
    marginHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  shareButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
  backButton: {
    marginHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#6C63FF',
  },
  backButtonText: { color: '#6C63FF', fontSize: 18, fontWeight: '600' },
});
