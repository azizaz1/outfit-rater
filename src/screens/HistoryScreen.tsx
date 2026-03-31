import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getHistory } from '../services/api';
import { OutfitRating } from '../types';
import { RootStackParamList } from '../../App';

type HistoryNavProp = NativeStackNavigationProp<RootStackParamList, 'History'>;

function ScoreBadge({ score }: { score: number }) {
  const colors: [string, string] =
    score >= 8 ? ['#065F46', '#4ADE80'] : score >= 6 ? ['#78350F', '#FACC15'] : ['#7F1D1D', '#F87171'];
  return (
    <LinearGradient colors={colors} style={styles.scoreBadge}>
      <Text style={styles.scoreBadgeText}>{score.toFixed(1)}</Text>
    </LinearGradient>
  );
}

export default function HistoryScreen() {
  const navigation = useNavigation<HistoryNavProp>();
  const [history, setHistory] = useState<OutfitRating[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHistory()
      .then((data) => setHistory(data.map((r) => r.data!).filter(Boolean)))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#A855F7" />
      </View>
    );
  }

  if (history.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyEmoji}>👗</Text>
        <Text style={styles.emptyTitle}>No outfits yet</Text>
        <Text style={styles.emptySubtitle}>Rate your first outfit to see it here</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Home')} activeOpacity={0.8}>
          <LinearGradient colors={['#7C3AED', '#EC4899']} style={styles.emptyBtn}>
            <Text style={styles.emptyBtnText}>Rate an Outfit</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={history}
      keyExtractor={(_, i) => i.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Results', { rating: item, photoUri: item.photoUri })}
        >
          <Image source={{ uri: item.photoUri }} style={styles.thumb} />
          <LinearGradient
            colors={['transparent', 'rgba(8,8,16,0.6)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.cardContent}>
            <View style={styles.cardTop}>
              <ScoreBadge score={item.score} />
              <Text style={styles.cardDate}>{item.createdAt?.slice(0, 10)}</Text>
            </View>
            <Text style={styles.cardCategory}>{item.styleCategory}</Text>
            <Text style={styles.cardOccasion} numberOfLines={1}>{item.occasionFit}</Text>
          </View>
        </TouchableOpacity>
      )}
      numColumns={2}
      contentContainerStyle={styles.grid}
      columnWrapperStyle={styles.columnWrapper}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080810' },
  grid: { padding: 16, paddingBottom: 32 },
  columnWrapper: { gap: 12 },

  center: {
    flex: 1,
    backgroundColor: '#080810',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { color: '#F1F5F9', fontSize: 20, fontWeight: '800', marginBottom: 8 },
  emptySubtitle: { color: '#475569', fontSize: 14, textAlign: 'center', marginBottom: 28, lineHeight: 21 },
  emptyBtn: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 100,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  emptyBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },

  card: {
    flex: 1,
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: '#1A1A2E',
  },
  thumb: { width: '100%', height: '100%', resizeMode: 'cover' },
  cardContent: {
    ...StyleSheet.absoluteFillObject,
    padding: 12,
    justifyContent: 'flex-end',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  scoreBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  scoreBadgeText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  cardDate: { color: '#94A3B8', fontSize: 11, fontWeight: '600' },
  cardCategory: { color: '#F1F5F9', fontSize: 14, fontWeight: '800', marginBottom: 2 },
  cardOccasion: { color: '#64748B', fontSize: 11, lineHeight: 15 },
});
