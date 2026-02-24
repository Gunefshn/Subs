import { AppState, Platform } from 'react-native'
import 'react-native-url-polyfill/auto'
import * as SecureStore from "expo-secure-store" 
import { createClient, processLock } from '@supabase/supabase-js'

const supabaseUrl = "https://pipxitblyjjxjbcmqdvl.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpcHhpdGJseWpqeGpiY21xZHZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2Nzk0NDIsImV4cCI6MjA4NTI1NTQ0Mn0.w0_HrOlVmGaHEBIx6gLMLJuRGsRZuuy3P7TrkfaYjvk"

const ExpoSecureStoreAdapter ={
  getItem: (key:string) => SecureStore.getItem(key),
  setItem: (key:string,value:string) => SecureStore.setItem(key,value),
  removeItem : (key:string) => SecureStore.deleteItemAsync(key)
 }
 
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage:ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    // lock: processLock,
  },
})
 
// Tells Supabase Auth to continuously refresh the session automatically
// if the app is in the foreground. When this is added, you will continue
// to receive `onAuthStateChange` events with the `TOKEN_REFRESHED` or
// `SIGNED_OUT` event if the user's session is terminated. This should
// only be registered once.
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh()
    } else {
      supabase.auth.stopAutoRefresh()
    }
  })
}