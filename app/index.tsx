import { Redirect } from 'expo-router';

// Bu dosya artık sadece yönlendirme yapıyor
// Gerçek auth kontrolü _layout.tsx'te yapılıyor
export default function Index() {
  return <Redirect href="/(auth)/login" />;
}
