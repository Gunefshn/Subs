import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
  ActivityIndicator,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { useUser } from '../../src/hooks/useUser';
import { useAppContext } from '../../src/contexts/AppContext';
import { supabase } from '../../src/lib/supabase';
import { router } from 'expo-router';
import { Currency } from '../../src/lib/exchange';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { profile, loading, refetch } = useUser();
  const {
    isDarkMode,
    toggleDarkMode,
    notificationsEnabled,
    toggleNotifications,
    currency,
    setCurrency,
  } = useAppContext();
  const [deleting, setDeleting] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const openModal = () => {
    setFullName(profile?.full_name ?? '');
    setOldPassword('');
    setNewPassword('');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Hata', 'Ad Soyad boş bırakılamaz.');
      return;
    }

    setSaving(true);
    try {
      if (newPassword.trim()) {
        if (!oldPassword.trim()) {
          Alert.alert('Hata', 'Yeni şifre için mevcut şifrenizi girin.');
          setSaving(false);
          return;
        }
        if (newPassword.length < 6) {
          Alert.alert('Hata', 'Yeni şifre en az 6 karakter olmalıdır.');
          setSaving(false);
          return;
        }

        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user?.email ?? '',
          password: oldPassword,
        });

        if (signInError) {
          Alert.alert('Hata', 'Mevcut şifreniz yanlış.');
          setSaving(false);
          return;
        }

        const { error: passwordError } = await supabase.auth.updateUser({
          password: newPassword,
        });

        if (passwordError) {
          Alert.alert('Hata', 'Şifre güncellenirken hata oluştu.');
          setSaving(false);
          return;
        }
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: fullName.trim() })
        .eq('id', user?.id);

      if (profileError) {
        Alert.alert('Hata', 'Profil güncellenirken hata oluştu.');
        setSaving(false);
        return;
      }

      Alert.alert('Başarılı', 'Bilgileriniz güncellendi.', [
        {
          text: 'Tamam',
          onPress: () => {
            refetch();
            setModalVisible(false);
          },
        },
      ]);
    } catch (error) {
      Alert.alert('Hata', 'Beklenmeyen bir hata oluştu.');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Çıkış Yap', 'Hesabınızdan çıkış yapmak istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Çıkış Yap',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Hesabı Sil',
      'Hesabınızı ve tüm verilerinizi kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Evet, Sil',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              if (!user) return;
              await supabase.from('transactions').delete().eq('user_id', user.id);
              await supabase.from('subscriptions').delete().eq('user_id', user.id);
              await supabase.from('profiles').delete().eq('id', user.id);
              const { error } = await supabase.rpc('delete_user');
              if (error) throw error;
              await signOut();
              router.replace('/(auth)/login');
            } catch (error) {
              Alert.alert('Hata', 'Hesap silinirken bir hata oluştu.');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  if (loading || deleting) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-900">
        <ActivityIndicator size="large" color="#ffffff" />
        {deleting && <Text className="mt-4 text-gray-400">Hesap siliniyor...</Text>}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Başlık */}
        <Text className="mb-8 mt-6 text-center text-2xl font-bold text-white">
          Profil & Ayarlar
        </Text>

        {/* Avatar + Kullanıcı Bilgisi */}
        <View className="mb-8 items-center">
          <View className="mb-3 h-20 w-20 items-center justify-center rounded-full bg-gray-500">
            <Text className="text-3xl font-bold text-white">
              {getInitials(profile?.full_name ?? '')}
            </Text>
          </View>
          <TouchableOpacity className="flex-row items-center gap-2" onPress={openModal}>
            <Text className="text-xl font-bold text-white">
              {profile?.full_name ?? 'Kullanıcı'}
            </Text>
            <Ionicons name="pencil-outline" size={16} color="#9ca3af" />
          </TouchableOpacity>
          <Text className="mt-1 text-gray-400">{profile?.email ?? user?.email}</Text>
        </View>

        {/* Ayarlar Grubu 1 */}
        <View className="mx-4 mb-4 overflow-hidden rounded-2xl bg-gray-800">
          {/* Bildirimler */}
          <View className="flex-row items-center justify-between border-b border-gray-700 px-4 py-4">
            <View className="flex-row items-center">
              <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-gray-700">
                <Ionicons name="notifications-outline" size={18} color="#9ca3af" />
              </View>
              <Text className="font-medium text-white">Bildirimler</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: '#374151', true: '#3b82f6' }}
              thumbColor="#ffffff"
            />
          </View>

          {/* Karanlık Mod */}
          <View className="flex-row items-center justify-between border-b border-gray-700 px-4 py-4">
            <View className="flex-row items-center">
              <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-gray-700">
                <Ionicons name="moon-outline" size={18} color="#9ca3af" />
              </View>
              <Text className="font-medium text-white">Karanlık Mod</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: '#374151', true: '#3b82f6' }}
              thumbColor="#ffffff"
            />
          </View>

          {/* Para Birimi */}
          <TouchableOpacity
            className="flex-row items-center justify-between px-4 py-4"
            onPress={() => setShowCurrencyPicker(!showCurrencyPicker)}>
            <View className="flex-row items-center">
              <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-gray-700">
                <MaterialIcons name="attach-money" size={18} color="#9ca3af" />
              </View>
              <Text className="font-medium text-white">Para Birimi</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="mr-2 text-gray-400">
                {currency === 'TRY' ? 'TRY (₺)' : currency === 'USD' ? 'USD ($)' : 'EUR (€)'}
              </Text>
              <Ionicons
                name={showCurrencyPicker ? 'chevron-up' : 'chevron-forward'}
                size={16}
                color="#9ca3af"
              />
            </View>
          </TouchableOpacity>

          {/* Açılır Para Birimi Listesi */}
          {showCurrencyPicker && (
            <View className="border-t border-gray-700">
              {(
                [
                  { code: 'TRY', label: 'Türk Lirası', symbol: '₺' },
                  { code: 'USD', label: 'Amerikan Doları', symbol: '$' },
                  { code: 'EUR', label: 'Euro', symbol: '€' },
                ] as { code: Currency; label: string; symbol: string }[]
              ).map((item) => (
                <TouchableOpacity
                  key={item.code}
                  className={`flex-row items-center justify-between px-4 py-3 ${
                    currency === item.code ? 'bg-gray-700' : ''
                  }`}
                  onPress={() => {
                    setCurrency(item.code);
                    setShowCurrencyPicker(false);
                  }}>
                  <View className="flex-row items-center">
                    <Text className="mr-3 text-lg text-gray-400">{item.symbol}</Text>
                    <View>
                      <Text className="text-sm font-medium text-white">{item.code}</Text>
                      <Text className="text-xs text-gray-500">{item.label}</Text>
                    </View>
                  </View>
                  {currency === item.code && (
                    <Ionicons name="checkmark" size={18} color="#3b82f6" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Ayarlar Grubu 2 */}
        <View className="mx-4 mb-6 overflow-hidden rounded-2xl bg-gray-800">
          <TouchableOpacity
            className="flex-row items-center justify-between border-b border-gray-700 px-4 py-4"
            onPress={() => Alert.alert('Yakında', 'Gizlilik sözleşmesi linki eklenecek.')}>
            <View className="flex-row items-center">
              <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-gray-700">
                <Ionicons name="lock-closed-outline" size={18} color="#9ca3af" />
              </View>
              <Text className="font-medium text-white">Gizlilik Sözleşmesi</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-between px-4 py-4"
            onPress={() => Alert.alert('Yakında', 'SSS linki eklenecek.')}>
            <View className="flex-row items-center">
              <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-gray-700">
                <Ionicons name="help-circle-outline" size={18} color="#9ca3af" />
              </View>
              <Text className="font-medium text-white">Sıkça Sorulan Sorular</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {/* Çıkış Yap */}
        <TouchableOpacity
          className="mx-4 mb-3 items-center rounded-2xl bg-gray-800 py-4"
          onPress={handleSignOut}>
          <View className="flex-row items-center">
            <Ionicons name="log-out-outline" size={20} color="#ffffff" style={{ marginRight: 8 }} />
            <Text className="text-base font-semibold text-white">Çıkış Yap</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity className="mb-12 items-center" onPress={handleDeleteAccount}>
          <Text className="text-sm text-gray-500">Hesabımı Sil</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Düzenleme Modali */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1">
          <View className="flex-1 justify-end">
            <TouchableOpacity
              className="absolute inset-0 bg-black/60"
              activeOpacity={1}
              onPress={() => setModalVisible(false)}
            />
            <View className="rounded-t-3xl bg-gray-800 px-6 pb-10 pt-4">
              <View className="mb-6 h-1 w-12 self-center rounded-full bg-gray-600" />
              <Text className="mb-6 text-xl font-bold text-white">Profili Düzenle</Text>

              {/* Ad Soyad */}
              <Text className="mb-1 text-sm text-gray-400">Ad Soyad</Text>
              <View
                className="mb-4 flex-row items-center rounded-xl bg-gray-700 px-4"
                style={{ height: 50 }}>
                <Ionicons name="person-outline" size={18} color="#9ca3af" />
                <TextInput
                  className="ml-3 flex-1 text-sm text-white"
                  placeholder="Ad Soyad"
                  placeholderTextColor="#6b7280"
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                />
              </View>

              {/* E-posta - salt okunur */}
              <Text className="mb-1 text-sm text-gray-400">E-posta</Text>
              <View
                className="mb-4 flex-row items-center rounded-xl bg-gray-700/50 px-4"
                style={{ height: 50 }}>
                <Ionicons name="mail-outline" size={18} color="#6b7280" />
                <Text className="ml-3 flex-1 text-sm text-gray-500">
                  {profile?.email ?? user?.email}
                </Text>
                <Ionicons name="lock-closed" size={14} color="#4b5563" />
              </View>

              <View className="my-4 border-t border-gray-700" />
              <Text className="mb-4 text-sm text-gray-400">
                Şifre değiştirmek istemiyorsanız boş bırakın
              </Text>

              {/* Mevcut Şifre */}
              <Text className="mb-1 text-sm text-gray-400">Mevcut Şifre</Text>
              <View
                className="mb-4 flex-row items-center rounded-xl bg-gray-700 px-4"
                style={{ height: 50 }}>
                <Ionicons name="lock-closed-outline" size={18} color="#9ca3af" />
                <TextInput
                  className="ml-3 flex-1 text-sm text-white"
                  placeholder="Mevcut şifre"
                  placeholderTextColor="#6b7280"
                  value={oldPassword}
                  onChangeText={setOldPassword}
                  secureTextEntry={!showOldPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowOldPassword(!showOldPassword)}>
                  <Ionicons
                    name={showOldPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={18}
                    color="#6b7280"
                  />
                </TouchableOpacity>
              </View>

              {/* Yeni Şifre */}
              <Text className="mb-1 text-sm text-gray-400">Yeni Şifre</Text>
              <View
                className="mb-6 flex-row items-center rounded-xl bg-gray-700 px-4"
                style={{ height: 50 }}>
                <Ionicons name="lock-open-outline" size={18} color="#9ca3af" />
                <TextInput
                  className="ml-3 flex-1 text-sm text-white"
                  placeholder="Yeni şifre (min. 6 karakter)"
                  placeholderTextColor="#6b7280"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNewPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                  <Ionicons
                    name={showNewPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={18}
                    color="#6b7280"
                  />
                </TouchableOpacity>
              </View>

              {/* Kaydet */}
              <TouchableOpacity
                className="items-center rounded-xl bg-white py-4"
                style={{ opacity: saving ? 0.7 : 1 }}
                disabled={saving}
                onPress={handleSave}>
                {saving ? (
                  <ActivityIndicator color="#111827" />
                ) : (
                  <Text className="text-base font-semibold text-gray-900">Kaydet</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
