import '../global.css';

import { Stack } from 'expo-router';

export default function Layout() {
  return (
    // TODO: AuthProvider ile çevrelenerek güncellemeler yapılacak.
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
