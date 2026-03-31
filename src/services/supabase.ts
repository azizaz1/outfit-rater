import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://llxtmhlcplmozillwgdl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxseHRtaGxjcGxtb3ppbGx3Z2RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NzQyODIsImV4cCI6MjA5MDQ1MDI4Mn0.ukGofCuOyjaKokZn996yZiA5tV1HT7OUufRUzM4nraA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
