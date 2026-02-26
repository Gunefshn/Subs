import '../global.css';
import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import { AppProvider } from '@/src/contexts/AppContext';

function RootLayoutNav() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup) {
      router.replace('/(tabs)/dashboard');
    }
  }, [session, loading, segments]);

return (
  <Stack>
    <Stack.Screen name="index" options={{ headerShown: false }} />
    <Stack.Screen name="(auth)" options={{ headerShown: false }} />
    <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    <Stack.Screen name="screens" options={{ headerShown: false }} />

    {/* ADD MODAL */}
<Stack.Screen
  name="(tabs)/addTransactions"
  options={{
    presentation: "transparentModal",
    animation: "slide_from_bottom",
    headerShown: false,
    contentStyle: { backgroundColor: 'transparent' },
  }}
/>
  </Stack>
);
}

export default function RootLayout() {
  return (
    <AppProvider>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </AppProvider>
  );
}
