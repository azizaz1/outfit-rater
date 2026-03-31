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
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { RootStackParamList } from '../../App';

type ResultsRouteProp = RouteProp<RootStackParamList, 'Results'>;

function ScoreRing({ score }: { score: number }) {
  const animated = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = React.useState(0);
  const color = score >= 8 ? '#4ADE80' : score >= 6 ? '#FACC15' : '#F87171';

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
    <View style={[styles.scoreRing, { borderColor: color, shadowColor: color }]}>
      <Text style={[styles.scoreNumber, { color }]}>{display.toFixed(1)}</Text>
      <Text style={styles.scoreLabel}>/ 10</Text>
    </View>
  );
}

function AnimatedBar({ value, delay = 0 }: { value: number; delay?: number }) {
  const width = useRef(new Animated.Value(0)).current;
  const color = value >= 8 ? '#4ADE80' : value >= 6 ? '#FACC15' : '#F87171';

  useEffect(() => {
    const t = setTimeout(() => {
      Animated.timing(width, {
        toValue: (value / 10) * 100,
        duration: 900,
        useNativeDriver: false,
      }).start();
    }, delay);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={styles.barTrack}>
      <Animated.View
        style={[
          styles.barFill,
          {
            width: width.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
            backgroundColor: color,
            shadowColor: color,
          },
        ]}
      />
    </View>
  );
}

function SubScoreRow({ label, value, delay }: { label: string; value: number; delay: number }) {
  const animated = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = React.useState(0);
  const color = value >= 8 ? '#4ADE80' : value >= 6 ? '#FACC15' : '#F87171';

  useEffect(() => {
    const t = setTimeout(() => {
      Animated.timing(animated, {
        toValue: value,
        duration: 900,
        useNativeDriver: false,
      }).start();
    }, delay);
    const listener = animated.addListener(({ value: v }) => setDisplay(Math.round(v * 10) / 10));
    return () => {
      clearTimeout(t);
      animated.removeListener(listener);
    };
  }, []);

  return (
    <View style={styles.subScoreRow}>
      <View style={styles.subScoreHeader}>
        <Text style={styles.subScoreLabel}>{label}</Text>
        <Text style={[styles.subScoreValue, { color }]}>{display.toFixed(1)}/10</Text>
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
  const slideUp = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideUp, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  async function shareCard() {
    try {
      const uri = await cardRef.current!.capture!();
      await Sharing.shareAsync(uri, { mimeType: 'image/png' });
    } catch {}
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Hero photo with gradient overlay */}
      <View style={styles.heroContainer}>
        <Image source={{ uri: photoUri }} style={styles.photo} />
        <LinearGradient
          colors={['transparent', 'rgba(8,8,16,0.7)', '#080810']}
          style={styles.photoGradient}
        />
        {/* Floating score ring */}
        <Animated.View style={[styles.scoreFloat, { opacity: fadeIn }]}>
          <ScoreRing score={rating.score} />
          <View style={styles.scoreDetails}>
            <Text style={styles.styleCategory}>{rating.styleCategory}</Text>
            <Text style={styles.occasion}>{rating.occasionFit}</Text>
          </View>
        </Animated.View>
      </View>

      <Animated.View style={{ opacity: fadeIn, transform: [{ translateY: slideUp }] }}>
        {/* Sub scores */}
        <View style={styles.section}>
          <SubScoreRow label="Color Harmony" value={rating.colorScore} delay={200} />
          <SubScoreRow label="Fit & Silhouette" value={rating.fitScore} delay={400} />
        </View>

        {/* Weather tip */}
        {rating.weatherTip && (
          <View style={[styles.card, styles.weatherCard]}>
            <Text style={styles.weatherLabel}>🌤️  WEATHER CHECK</Text>
            <Text style={styles.weatherText}>{rating.weatherTip}</Text>
          </View>
        )}

        {/* Celebrity match */}
        {rating.celebrityMatch && (
          <LinearGradient
            colors={['rgba(124,58,237,0.15)', 'rgba(236,72,153,0.15)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.card, styles.celebCard]}
          >
            <Text style={styles.celebLabel}>YOUR STYLE MATCHES</Text>
            <Text style={styles.celebName}>⭐  {rating.celebrityMatch}</Text>
          </LinearGradient>
        )}

        {/* What Works */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>What Works</Text>
          {rating.strengths.map((s, i) => (
            <View key={i} style={styles.feedbackRow}>
              <Text style={styles.feedbackIcon}>✦</Text>
              <Text style={styles.feedbackText}>{s}</Text>
            </View>
          ))}
        </View>

        {/* Room to Improve */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Room to Improve</Text>
          {rating.improvements.map((s, i) => (
            <View key={i} style={styles.feedbackRow}>
              <Text style={styles.feedbackIcon}>→</Text>
              <Text style={styles.feedbackText}>{s}</Text>
            </View>
          ))}
        </View>

        {/* Shopping */}
        {rating.shoppingSuggestions && rating.shoppingSuggestions.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>🛍️  Shop to Elevate</Text>
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
                  <Text style={styles.shopName}>{s.item}</Text>
                  <Text style={styles.shopReason}>{s.reason}</Text>
                </View>
                <LinearGradient colors={['#7C3AED', '#EC4899']} style={styles.shopArrowBadge}>
                  <Text style={styles.shopArrow}>→</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Hidden card for sharing */}
        <ViewShot ref={cardRef} options={{ format: 'png', quality: 1 }} style={styles.hiddenCard}>
          <View style={styles.scoreCard}>
            <Image source={{ uri: photoUri }} style={styles.cardPhoto} />
            <LinearGradient
              colors={['transparent', 'rgba(8,8,16,0.85)']}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.cardOverlay}>
              <Text style={styles.cardAppName}>AI OUTFIT RATER</Text>
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

        {/* Buttons */}
        <TouchableOpacity onPress={shareCard} activeOpacity={0.85}>
          <LinearGradient
            colors={['#7C3AED', '#EC4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryBtn}
          >
            <Text style={styles.primaryBtnText}>Share Score Card</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity style={styles.outlineBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.outlineBtnText}>Rate Another Outfit</Text>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080810' },
  content: { paddingBottom: 48 },

  heroContainer: { height: 380, position: 'relative', marginBottom: 24 },
  photo: { width: '100%', height: '100%', resizeMode: 'cover' },
  photoGradient: { ...StyleSheet.absoluteFillObject },
  scoreFloat: {
    position: 'absolute',
    bottom: 20,
    left: 24,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  scoreRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(8,8,16,0.7)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 8,
  },
  scoreNumber: { fontSize: 26, fontWeight: '900' },
  scoreLabel: { color: '#475569', fontSize: 11, fontWeight: '600' },
  scoreDetails: { flex: 1 },
  styleCategory: { color: '#F1F5F9', fontSize: 20, fontWeight: '800', marginBottom: 4 },
  occasion: { color: '#64748B', fontSize: 13, lineHeight: 18 },

  section: { marginHorizontal: 20, marginBottom: 12, gap: 10 },

  card: {
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  weatherCard: { borderColor: 'rgba(56,189,248,0.25)' },
  celebCard: { borderColor: 'rgba(168,85,247,0.3)', alignItems: 'center' },

  weatherLabel: { color: '#38BDF8', fontSize: 10, fontWeight: '800', letterSpacing: 2, marginBottom: 8 },
  weatherText: { color: '#CBD5E1', fontSize: 14, lineHeight: 21 },

  celebLabel: { color: '#9D4EDD', fontSize: 10, fontWeight: '800', letterSpacing: 2, marginBottom: 6 },
  celebName: { color: '#F1F5F9', fontSize: 19, fontWeight: '800' },

  cardTitle: { color: '#F1F5F9', fontSize: 14, fontWeight: '800', letterSpacing: 0.5, marginBottom: 14 },
  feedbackRow: { flexDirection: 'row', gap: 10, marginBottom: 10, alignItems: 'flex-start' },
  feedbackIcon: { color: '#7C3AED', fontSize: 12, marginTop: 3, fontWeight: '800' },
  feedbackText: { color: '#94A3B8', fontSize: 14, flex: 1, lineHeight: 21 },

  shopItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    gap: 12,
  },
  shopInfo: { flex: 1 },
  shopName: { color: '#E2E8F0', fontSize: 14, fontWeight: '700', marginBottom: 2 },
  shopReason: { color: '#64748B', fontSize: 12 },
  shopArrowBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shopArrow: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },

  subScoreRow: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  subScoreHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  subScoreLabel: { color: '#64748B', fontSize: 13, fontWeight: '600' },
  subScoreValue: { fontSize: 14, fontWeight: '800' },
  barTrack: { height: 5, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' },
  barFill: { height: 5, borderRadius: 3, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 6 },

  hiddenCard: { position: 'absolute', top: -9999, left: 0 },
  scoreCard: { width: 360, height: 480, borderRadius: 24, overflow: 'hidden' },
  cardPhoto: { width: '100%', height: '100%', position: 'absolute' },
  cardOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 24,
    paddingBottom: 32,
  },
  cardAppName: { color: '#64748B', fontSize: 11, letterSpacing: 3, marginBottom: 8, fontWeight: '700' },
  cardScore: { color: '#FFFFFF', fontSize: 72, fontWeight: '900', lineHeight: 76 },
  cardScoreLabel: { color: '#64748B', fontSize: 16, marginBottom: 10 },
  cardStyle: { color: '#FFFFFF', fontSize: 20, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  cardCelebrity: { color: '#C084FC', fontSize: 14, marginBottom: 16 },
  cardBadges: { flexDirection: 'row', gap: 8 },
  cardBadge: {
    backgroundColor: 'rgba(124,58,237,0.4)',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.5)',
  },
  cardBadgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },

  primaryBtn: {
    marginHorizontal: 20,
    marginTop: 12,
    paddingVertical: 18,
    borderRadius: 100,
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 10,
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
  outlineBtn: {
    marginHorizontal: 20,
    marginTop: 10,
    paddingVertical: 18,
    borderRadius: 100,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(168,85,247,0.4)',
    backgroundColor: 'rgba(168,85,247,0.05)',
  },
  outlineBtnText: { color: '#C084FC', fontSize: 16, fontWeight: '700' },
});
