import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OutfitRating } from './src/types';

import OnboardingScreen from './src/screens/OnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import ComparisonScreen from './src/screens/ComparisonScreen';
import ComparisonResultScreen from './src/screens/ComparisonResultScreen';

export type RootStackParamList = {
  Onboarding: undefined;
  Home: undefined;
  Results: { rating: OutfitRating; photoUri: string };
  History: undefined;
  Comparison: undefined;
  ComparisonResult: {
    result: {
      winner: 1 | 2;
      outfit1Score: number;
      outfit2Score: number;
      outfit1Strengths: string[];
      outfit2Strengths: string[];
      verdict: string;
    };
    photoUri1: string;
    photoUri2: string;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [initialRoute, setInitialRoute] = useState<'Onboarding' | 'Home' | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('onboarded').then((value) => {
      setInitialRoute(value === 'true' ? 'Home' : 'Onboarding');
    });
  }, []);

  if (!initialRoute) return null;

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerStyle: { backgroundColor: '#0F0F1A' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: 'bold' },
          contentStyle: { backgroundColor: '#0F0F1A' },
        }}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Results" component={ResultsScreen} options={{ title: 'Your Rating' }} />
        <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'Past Outfits' }} />
        <Stack.Screen name="Comparison" component={ComparisonScreen} options={{ title: 'Compare Outfits' }} />
        <Stack.Screen name="ComparisonResult" component={ComparisonResultScreen} options={{ title: 'The Winner' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
