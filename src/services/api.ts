import axios from 'axios';
import { ApiResponse } from '../types';
import { supabase } from './supabase';

const API_BASE_URL = 'http://192.168.1.19:3002';

async function authHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};
}

export async function rateOutfit(
  photoUri: string,
  language: string = 'English',
  occasion: string = 'Casual',
  coords?: { lat: number; lon: number }
): Promise<ApiResponse> {
  const formData = new FormData();
  formData.append('photo', { uri: photoUri, type: 'image/jpeg', name: 'outfit.jpg' } as any);
  formData.append('photoUri', photoUri);
  formData.append('language', language);
  formData.append('occasion', occasion);
  if (coords) {
    formData.append('lat', String(coords.lat));
    formData.append('lon', String(coords.lon));
  }

  const response = await axios.post(`${API_BASE_URL}/api/rate-outfit`, formData, {
    headers: { 'Content-Type': 'multipart/form-data', ...(await authHeaders()) },
    timeout: 30000,
  });

  return response.data;
}

export async function getHistory(): Promise<ApiResponse[]> {
  const response = await axios.get(`${API_BASE_URL}/api/history`, {
    headers: await authHeaders(),
  });
  return response.data;
}

export async function compareOutfits(
  photoUri1: string,
  photoUri2: string,
  language: string = 'English',
  occasion: string = 'Casual'
): Promise<{ success: boolean; data?: any; error?: string }> {
  const formData = new FormData();
  formData.append('photo1', { uri: photoUri1, type: 'image/jpeg', name: 'outfit1.jpg' } as any);
  formData.append('photo2', { uri: photoUri2, type: 'image/jpeg', name: 'outfit2.jpg' } as any);
  formData.append('language', language);
  formData.append('occasion', occasion);

  const response = await axios.post(`${API_BASE_URL}/api/compare`, formData, {
    headers: { 'Content-Type': 'multipart/form-data', ...(await authHeaders()) },
    timeout: 45000,
  });

  return response.data;
}
