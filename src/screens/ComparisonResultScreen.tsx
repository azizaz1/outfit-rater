import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';

type CompResultRouteProp = RouteProp<RootStackParamList, 'ComparisonResult'>;

function AnimatedBar({ value, delay = 0, isWinner }: { value: number; delay?: number; isWinner: boolean }) {
  const width = useRef(new Animated.Value(0)).current;

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
            backgroundColor: isWinner ? '#4ADE80' : '#F87171',
          },
        ]}
      />
    </View>
  );
}

export default function ComparisonResultScreen() {
  const route = useRoute<CompResultRouteProp>();
  const navigation = useNavigation();
  const { result, photoUri1, photoUri2 } = route.params;

  const fadeIn = useRef(new Animated.Value(0)).current;
  const winnerScale = useRef(new Animated.Value(0.85)).current;
  const slideUp = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(winnerScale, { toValue: 1, friction: 6, useNativeDriver: true }),
      Animated.timing(slideUp, { toValue: 0, duration: 550, useNativeDriver: true }),
    ]).start();
  }, []);

  const winner = result.winner;
  const winnerPhoto = winner === 1 ? photoUri1 : photoUri2;
  const winnerScore = winner === 1 ? result.outfit1Score : result.outfit2Score;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <LinearGradient
        colors={['rgba(74,222,128,0.1)', 'rgba(8,8,16,0)']}
        style={styles.bgGlow}
      />

      <Animated.View style={{ opacity: fadeIn }}>
        {/* Winner badge */}
        <View style={styles.winnerBadgeRow}>
          <LinearGradient colors={['#7C3AED', '#EC4899']} style={styles.winnerBadge}>
            <Text style={styles.winnerBadgeText}>🏆  WINNER</Text>
          </LinearGradient>
        </View>

        {/* Winner card */}
        <Animated.View style={[styles.winnerCard, { transform: [{ scale: winnerScale }] }]}>
          <Image source={{ uri: winnerPhoto }} style={styles.winnerPhoto} />
          <LinearGradient
            colors={['transparent', 'rgba(8,8,16,0.85)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.winnerOverlay}>
            <Text style={styles.winnerOutfitLabel}>OUTFIT {winner}</Text>
            <Text style={styles.winnerScore}>{winnerScore.toFixed(1)}</Text>
            <Text style={styles.winnerScoreLabel}>/ 10</Text>
          </View>
        </Animated.View>

        {/* Verdict */}
        <Animated.View style={{ transform: [{ translateY: slideUp }] }}>
          <LinearGradient
            colors={['rgba(124,58,237,0.12)', 'rgba(236,72,153,0.08)']}
            style={styles.verdictCard}
          >
            <Text style={styles.verdictLabel}>THE VERDICT</Text>
            <Text style={styles.verdictText}>{result.verdict}</Text>
          </LinearGradient>

          {/* Side-by-side comparison */}
          <View style={styles.comparison}>
            {/* Outfit 1 */}
            <View style={styles.outfitCol}>
              <View style={styles.thumbWrapper}>
                <Image source={{ uri: photoUri1 }} style={styles.thumb} />
                {winner === 1 && (
                  <View style={styles.winnerBadgeSmall}>
                    <Text style={styles.winnerBadgeSmallText}>🏆</Text>
                  </View>
                )}
              </View>
              <Text style={styles.outfitLabel}>OUTFIT 1</Text>
              <Text style={[styles.scoreText, { color: winner === 1 ? '#4ADE80' : '#F87171' }]}>
                {result.outfit1Score.toFixed(1)}/10
              </Text>
              <AnimatedBar value={result.outfit1Score} delay={300} isWinner={winner === 1} />
              {result.outfit1Strengths.map((s: string, i: number) => (
                <View key={i} style={styles.strengthRow}>
                  <Text style={styles.strengthDot}>✦</Text>
                  <Text style={styles.strengthText}>{s}</Text>
                </View>
              ))}
            </View>

            <View style={styles.divider} />

            {/* Outfit 2 */}
            <View style={styles.outfitCol}>
              <View style={styles.thumbWrapper}>
                <Image source={{ uri: photoUri2 }} style={styles.thumb} />
                {winner === 2 && (
                  <View style={styles.winnerBadgeSmall}>
                    <Text style={styles.winnerBadgeSmallText}>🏆</Text>
                  </View>
                )}
              </View>
              <Text style={styles.outfitLabel}>OUTFIT 2</Text>
              <Text style={[styles.scoreText, { color: winner === 2 ? '#4ADE80' : '#F87171' }]}>
                {result.outfit2Score.toFixed(1)}/10
              </Text>
              <AnimatedBar value={result.outfit2Score} delay={500} isWinner={winner === 2} />
              {result.outfit2Strengths.map((s: string, i: number) => (
                <View key={i} style={styles.strengthRow}>
                  <Text style={styles.strengthDot}>✦</Text>
                  <Text style={styles.strengthText}>{s}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Buttons */}
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.85}>
            <LinearGradient
              colors={['#7C3AED', '#EC4899']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryBtn}
            >
              <Text style={styles.primaryBtnText}>Compare Again</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.outlineBtn}
            onPress={() => navigation.navigate('Home' as any)}
          >
            <Text style={styles.outlineBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080810' },
  content: { padding: 24, paddingBottom: 52 },
  bgGlow: { position: 'absolute', top: 0, left: 0, right: 0, height: 300 },

  winnerBadgeRow: { alignItems: 'center', marginBottom: 20 },
  winnerBadge: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 100,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  winnerBadgeText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900', letterSpacing: 2 },

  winnerCard: {
    borderRadius: 24,
    overflow: 'hidden',
    height: 300,
    marginBottom: 20,
    shadowColor: '#4ADE80',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  winnerPhoto: { width: '100%', height: '100%' },
  winnerOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 24,
  },
  winnerOutfitLabel: { color: '#94A3B8', fontSize: 11, fontWeight: '800', letterSpacing: 3, marginBottom: 4 },
  winnerScore: { color: '#FFFFFF', fontSize: 64, fontWeight: '900', lineHeight: 68 },
  winnerScoreLabel: { color: '#64748B', fontSize: 16 },

  verdictCard: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.25)',
  },
  verdictLabel: { color: '#9D4EDD', fontSize: 10, fontWeight: '800', letterSpacing: 2.5, marginBottom: 8 },
  verdictText: { color: '#E2E8F0', fontSize: 15, lineHeight: 24 },

  comparison: { flexDirection: 'row', gap: 16, marginBottom: 28 },
  outfitCol: { flex: 1 },
  divider: { width: 1, backgroundColor: 'rgba(255,255,255,0.06)' },

  thumbWrapper: { position: 'relative', marginBottom: 10 },
  thumb: { width: '100%', height: 130, borderRadius: 14 },
  winnerBadgeSmall: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(8,8,16,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  winnerBadgeSmallText: { fontSize: 14 },

  outfitLabel: { color: '#475569', fontSize: 10, fontWeight: '800', letterSpacing: 2, marginBottom: 4 },
  scoreText: { fontSize: 20, fontWeight: '900', marginBottom: 8 },
  barTrack: { height: 4, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden', marginBottom: 12 },
  barFill: { height: 4, borderRadius: 2 },
  strengthRow: { flexDirection: 'row', gap: 6, marginBottom: 6, alignItems: 'flex-start' },
  strengthDot: { color: '#7C3AED', fontSize: 10, marginTop: 3 },
  strengthText: { color: '#64748B', fontSize: 12, lineHeight: 17, flex: 1 },

  primaryBtn: {
    paddingVertical: 19,
    borderRadius: 100,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 10,
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
  outlineBtn: {
    paddingVertical: 19,
    borderRadius: 100,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(168,85,247,0.4)',
    backgroundColor: 'rgba(168,85,247,0.05)',
  },
  outlineBtnText: { color: '#C084FC', fontSize: 16, fontWeight: '700' },
});
