import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ Bu bilgiler grup üyelerinden temin edildiğinde güncellenecektir.
const supabaseUrl = 'https://placeholder-url.supabase.co';
const supabaseAnonKey = 'eyPlaceholderKey...';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
