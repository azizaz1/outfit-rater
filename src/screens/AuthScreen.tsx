import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../services/supabase';

export default function AuthScreen() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleAuth() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email: email.trim(), password });
        if (error) throw error;
        Alert.alert('Account created!', 'You are now logged in.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(124,58,237,0.18)', 'rgba(8,8,16,0)', 'rgba(236,72,153,0.08)']}
        style={StyleSheet.absoluteFill}
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.inner}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Logo area */}
          <View style={styles.logoArea}>
            <LinearGradient colors={['#7C3AED', '#EC4899']} style={styles.logoRing}>
              <Text style={styles.logoEmoji}>👗</Text>
            </LinearGradient>
            <Text style={styles.appName}>OUTFIT RATER</Text>
            <Text style={styles.tagline}>AI-powered style analysis</Text>
          </View>

          {/* Tab switcher */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, mode === 'login' && styles.tabActive]}
              onPress={() => setMode('login')}
            >
              {mode === 'login' && (
                <LinearGradient
                  colors={['#7C3AED', '#EC4899']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              )}
              <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>Log In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, mode === 'signup' && styles.tabActive]}
              onPress={() => setMode('signup')}
            >
              {mode === 'signup' && (
                <LinearGradient
                  colors={['#7C3AED', '#EC4899']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFill}
                />
              )}
              <Text style={[styles.tabText, mode === 'signup' && styles.tabTextActive]}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.label}>EMAIL</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor="#334155"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <Text style={styles.label}>PASSWORD</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#334155"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {loading ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color="#A855F7" />
              </View>
            ) : (
              <TouchableOpacity onPress={handleAuth} activeOpacity={0.85}>
                <LinearGradient
                  colors={['#7C3AED', '#EC4899']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.submitBtn}
                >
                  <Text style={styles.submitBtnText}>
                    {mode === 'login' ? 'Log In' : 'Create Account'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.switchHint}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <Text style={styles.switchLink} onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}>
              {mode === 'login' ? 'Sign up' : 'Log in'}
            </Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#080810' },
  inner: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 28, paddingTop: 72 },

  logoArea: { alignItems: 'center', marginBottom: 48 },
  logoRing: {
    width: 90,
    height: 90,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.55,
    shadowRadius: 24,
    elevation: 12,
  },
  logoEmoji: { fontSize: 42 },
  appName: { fontSize: 22, fontWeight: '900', color: '#F1F5F9', letterSpacing: 5, marginBottom: 6 },
  tagline: { fontSize: 11, color: '#475569', letterSpacing: 2.5, fontWeight: '600' },

  tabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 100,
    padding: 4,
    marginBottom: 36,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 100,
    alignItems: 'center',
    overflow: 'hidden',
  },
  tabActive: {},
  tabText: { color: '#475569', fontSize: 15, fontWeight: '700' },
  tabTextActive: { color: '#FFFFFF' },

  form: { gap: 6, marginBottom: 28 },
  label: { fontSize: 10, fontWeight: '800', color: '#475569', letterSpacing: 2.5, marginBottom: 8, marginTop: 10 },
  inputWrapper: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 4,
  },
  input: {
    color: '#F1F5F9',
    fontSize: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
  },

  loadingBox: { alignItems: 'center', paddingVertical: 20 },
  submitBtn: {
    paddingVertical: 19,
    borderRadius: 100,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 10,
  },
  submitBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },

  switchHint: { color: '#475569', fontSize: 14, textAlign: 'center' },
  switchLink: { color: '#A855F7', fontWeight: '700' },
});
