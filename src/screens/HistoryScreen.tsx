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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getHistory } from '../services/api';
import { OutfitRating } from '../types';
import { RootStackParamList } from '../../App';

type HistoryNavProp = NativeStackNavigationProp<RootStackParamList, 'History'>;

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
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  if (history.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No outfits rated yet.</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Text style={styles.link}>Rate your first outfit</Text>
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
          onPress={() => navigation.navigate('Results', { rating: item, photoUri: item.photoUri })}
        >
          <Image source={{ uri: item.photoUri }} style={styles.thumb} />
          <View style={styles.cardInfo}>
            <Text style={styles.score}>{item.score}/10</Text>
            <Text style={styles.category}>{item.styleCategory}</Text>
            <Text style={styles.date}>{item.createdAt?.slice(0, 10)}</Text>
          </View>
        </TouchableOpacity>
      )}
      contentContainerStyle={{ padding: 16, gap: 12 }}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F1A' },
  center: { flex: 1, backgroundColor: '#0F0F1A', alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#9B9BB4', fontSize: 16, marginBottom: 12 },
  link: { color: '#6C63FF', fontSize: 16, textDecorationLine: 'underline' },
  card: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  thumb: { width: 90, height: 90 },
  cardInfo: { flex: 1, padding: 14, justifyContent: 'center' },
  score: { color: '#6C63FF', fontSize: 22, fontWeight: 'bold' },
  category: { color: '#FFFFFF', fontSize: 15, marginTop: 2 },
  date: { color: '#9B9BB4', fontSize: 13, marginTop: 4 },
});
