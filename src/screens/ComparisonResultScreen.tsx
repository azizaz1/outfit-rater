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
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';

type CompResultRouteProp = RouteProp<RootStackParamList, 'ComparisonResult'>;

function AnimatedBar({ value, delay = 0, color }: { value: number; delay?: number; color: string }) {
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
            backgroundColor: color,
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
  const winnerScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(winnerScale, { toValue: 1, friction: 5, useNativeDriver: true }),
    ]).start();
  }, []);

  const winner = result.winner;
  const winnerPhoto = winner === 1 ? photoUri1 : photoUri2;
  const loserPhoto = winner === 1 ? photoUri2 : photoUri1;
  const winnerScore = winner === 1 ? result.outfit1Score : result.outfit2Score;
  const loserScore = winner === 1 ? result.outfit2Score : result.outfit1Score;
  const winnerStrengths = winner === 1 ? result.outfit1Strengths : result.outfit2Strengths;
  const loserStrengths = winner === 1 ? result.outfit2Strengths : result.outfit1Strengths;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Animated.View style={{ opacity: fadeIn }}>
        <Text style={styles.winnerLabel}>🏆 Winner</Text>

        <Animated.View style={[styles.winnerCard, { transform: [{ scale: winnerScale }] }]}>
          <Image source={{ uri: winnerPhoto }} style={styles.winnerPhoto} />
          <View style={styles.winnerOverlay}>
            <Text style={styles.winnerOutfitLabel}>Outfit {winner}</Text>
            <Text style={styles.winnerScore}>{winnerScore.toFixed(1)}</Text>
            <Text style={styles.winnerScoreLabel}>/ 10</Text>
          </View>
        </Animated.View>

        <View style={styles.verdictCard}>
          <Text style={styles.verdictTitle}>The Verdict</Text>
          <Text style={styles.verdictText}>{result.verdict}</Text>
        </View>

        <View style={styles.comparison}>
          <View style={styles.outfitColumn}>
            <Image source={{ uri: photoUri1 }} style={styles.thumbPhoto} />
            <Text style={styles.outfitTitle}>Outfit 1</Text>
            <Text style={[styles.scoreText, { color: winner === 1 ? '#4CAF50' : '#F44336' }]}>
              {result.outfit1Score.toFixed(1)}/10
            </Text>
            <AnimatedBar value={result.outfit1Score} delay={300} color={winner === 1 ? '#4CAF50' : '#F44336'} />
            {result.outfit1Strengths.map((s: string, i: number) => (
              <Text key={i} style={styles.strengthText}>• {s}</Text>
            ))}
          </View>

          <View style={styles.divider} />

          <View style={styles.outfitColumn}>
            <Image source={{ uri: photoUri2 }} style={styles.thumbPhoto} />
            <Text style={styles.outfitTitle}>Outfit 2</Text>
            <Text style={[styles.scoreText, { color: winner === 2 ? '#4CAF50' : '#F44336' }]}>
              {result.outfit2Score.toFixed(1)}/10
            </Text>
            <AnimatedBar value={result.outfit2Score} delay={500} color={winner === 2 ? '#4CAF50' : '#F44336'} />
            {result.outfit2Strengths.map((s: string, i: number) => (
              <Text key={i} style={styles.strengthText}>• {s}</Text>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Compare Again</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.homeButton} onPress={() => navigation.navigate('Home' as any)}>
          <Text style={styles.homeButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },
  content: { padding: 24, paddingBottom: 48 },
  winnerLabel: { fontSize: 18, color: '#FFC107', fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
  winnerCard: { borderRadius: 20, overflow: 'hidden', height: 280, marginBottom: 20 },
  winnerPhoto: { width: '100%', height: '100%' },
  winnerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,15,26,0.55)',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: 20,
  },
  winnerOutfitLabel: { color: '#9B9BB4', fontSize: 14, marginBottom: 4 },
  winnerScore: { color: '#FFFFFF', fontSize: 56, fontWeight: 'bold', lineHeight: 60 },
  winnerScoreLabel: { color: '#9B9BB4', fontSize: 16 },
  verdictCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#6C63FF',
  },
  verdictTitle: { color: '#6C63FF', fontSize: 13, fontWeight: '600', marginBottom: 6 },
  verdictText: { color: '#FFFFFF', fontSize: 16, lineHeight: 24 },
  comparison: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  outfitColumn: { flex: 1 },
  divider: { width: 1, backgroundColor: '#2A2A3E' },
  thumbPhoto: { width: '100%', height: 120, borderRadius: 12, marginBottom: 10 },
  outfitTitle: { color: '#9B9BB4', fontSize: 13, marginBottom: 4 },
  scoreText: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  barTrack: { height: 6, backgroundColor: '#2A2A3E', borderRadius: 3, overflow: 'hidden', marginBottom: 10 },
  barFill: { height: 6, borderRadius: 3 },
  strengthText: { color: '#D0D0E8', fontSize: 12, lineHeight: 18, marginBottom: 4 },
  button: {
    backgroundColor: '#6C63FF',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '600' },
  homeButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#6C63FF',
  },
  homeButtonText: { color: '#6C63FF', fontSize: 18, fontWeight: '600' },
});
