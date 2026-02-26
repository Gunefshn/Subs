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
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { useUser } from '../../src/hooks/useUser';
import { useAppContext } from '../../src/contexts/AppContext';
import { useTheme } from '../../src/hooks/useTheme';
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
  const { colors, isDark } = useTheme();

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

  // ─── Tema inline değerleri
  const borderColorRaw = isDark ? '#374151' : '#e5e7eb';
  const inputTextColor = isDark ? '#ffffff' : '#111827';
  const placeholderColor = isDark ? '#6b7280' : '#9ca3af';
  const switchTrackOff = isDark ? '#374151' : '#d1d5db';

  // Profil düzenle modal arka planı
  const modalSheetBg = isDark ? '#1f2937' : '#ffffff';
  const modalInputBg = isDark ? '#374151' : '#f3f4f6';
  const modalDivider = isDark ? '#374151' : '#e5e7eb';

  const saveBtnBg = isDark ? '#ffffff' : '#111827';
  const saveBtnText = isDark ? '#111827' : '#ffffff';

  // Avatar arka plan
  const avatarBg = isDark ? '#4b5563' : '#9ca3af';

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
        const { error: passwordError } = await supabase.auth.updateUser({ password: newPassword });
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
            } catch {
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
      <SafeAreaView className={`flex-1 items-center justify-center ${colors.bg}`}>
        <ActivityIndicator size="large" color={isDark ? '#ffffff' : '#111827'} />
        {deleting && <Text className={`mt-4 ${colors.textMuted}`}>Hesap siliniyor...</Text>}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${colors.bg}`}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Başlık ── */}
        <Text className={`mb-8 mt-6 text-center text-2xl font-bold ${colors.text}`}>
          Profil & Ayarlar
        </Text>

        {/* ── Avatar + Kullanıcı Bilgisi ── */}
        <View className="mb-8 items-center">
          <View
            className="mb-3 h-20 w-20 items-center justify-center rounded-full"
            style={{ backgroundColor: avatarBg }}>
            <Text className="text-3xl font-bold text-white">
              {getInitials(profile?.full_name ?? '')}
            </Text>
          </View>
          <TouchableOpacity className="flex-row items-center gap-2" onPress={openModal}>
            <Text className={`text-xl font-bold ${colors.text}`}>
              {profile?.full_name ?? 'Kullanıcı'}
            </Text>
            <Ionicons name="pencil-outline" size={16} color={colors.icon} />
          </TouchableOpacity>
          <Text className={`mt-1 ${colors.textMuted}`}>{profile?.email ?? user?.email}</Text>
        </View>

        {/* ── Ayarlar Grubu 1 ── */}
        <View
          className={`mx-4 mb-4 overflow-hidden rounded-2xl ${colors.card}`}
          style={{ borderWidth: 1, borderColor: borderColorRaw }}>
          {/* Bildirimler */}
          <View
            className="flex-row items-center justify-between px-4 py-4"
            style={{ borderBottomWidth: 1, borderBottomColor: borderColorRaw }}>
            <View className="flex-row items-center">
              <View
                className="mr-3 h-8 w-8 items-center justify-center rounded-full"
                style={{ backgroundColor: colors.iconBg }}>
                <Ionicons name="notifications-outline" size={18} color={colors.icon} />
              </View>
              <Text className={`font-medium ${colors.text}`}>Bildirimler</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: switchTrackOff, true: '#3b82f6' }}
              thumbColor="#ffffff"
            />
          </View>

          {/* Karanlık Mod */}
          <View
            className="flex-row items-center justify-between px-4 py-4"
            style={{ borderBottomWidth: 1, borderBottomColor: borderColorRaw }}>
            <View className="flex-row items-center">
              <View
                className="mr-3 h-8 w-8 items-center justify-center rounded-full"
                style={{ backgroundColor: colors.iconBg }}>
                <Ionicons name="moon-outline" size={18} color={colors.icon} />
              </View>
              <Text className={`font-medium ${colors.text}`}>Karanlık Mod</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleDarkMode}
              trackColor={{ false: switchTrackOff, true: '#3b82f6' }}
              thumbColor="#ffffff"
            />
          </View>

          {/* Para Birimi */}
          <TouchableOpacity
            className="flex-row items-center justify-between px-4 py-4"
            onPress={() => setShowCurrencyPicker(!showCurrencyPicker)}>
            <View className="flex-row items-center">
              <View
                className="mr-3 h-8 w-8 items-center justify-center rounded-full"
                style={{ backgroundColor: colors.iconBg }}>
                <MaterialIcons name="attach-money" size={18} color={colors.icon} />
              </View>
              <Text className={`font-medium ${colors.text}`}>Para Birimi</Text>
            </View>
            <View className="flex-row items-center">
              <Text className={`mr-2 ${colors.textMuted}`}>
                {currency === 'TRY' ? 'TRY (₺)' : currency === 'USD' ? 'USD ($)' : 'EUR (€)'}
              </Text>
              <Ionicons
                name={showCurrencyPicker ? 'chevron-up' : 'chevron-forward'}
                size={16}
                color={colors.icon}
              />
            </View>
          </TouchableOpacity>

          {/* Açılır Para Birimi Listesi */}
          {showCurrencyPicker && (
            <View style={{ borderTopWidth: 1, borderTopColor: borderColorRaw }}>
              {(
                [
                  { code: 'TRY', label: 'Türk Lirası', symbol: '₺' },
                  { code: 'USD', label: 'Amerikan Doları', symbol: '$' },
                  { code: 'EUR', label: 'Euro', symbol: '€' },
                ] as { code: Currency; label: string; symbol: string }[]
              ).map((item) => (
                <TouchableOpacity
                  key={item.code}
                  className="flex-row items-center justify-between px-4 py-3"
                  style={{
                    backgroundColor:
                      currency === item.code ? (isDark ? '#374151' : '#f3f4f6') : 'transparent',
                  }}
                  onPress={() => {
                    setCurrency(item.code);
                    setShowCurrencyPicker(false);
                  }}>
                  <View className="flex-row items-center">
                    <Text className={`mr-3 text-lg ${colors.textMuted}`}>{item.symbol}</Text>
                    <View>
                      <Text className={`text-sm font-medium ${colors.text}`}>{item.code}</Text>
                      <Text className={`text-xs ${colors.textFaint}`}>{item.label}</Text>
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

        {/* ── Ayarlar Grubu 2 ── */}
        <View
          className={`mx-4 mb-6 overflow-hidden rounded-2xl ${colors.card}`}
          style={{ borderWidth: 1, borderColor: borderColorRaw }}>
          <TouchableOpacity
            className="flex-row items-center justify-between px-4 py-4"
            style={{ borderBottomWidth: 1, borderBottomColor: borderColorRaw }}
            onPress={() => {
              Linking.openURL('https://gunefshn.github.io/SubsPrivacy/');
            }}>
            <View className="flex-row items-center">
              <View
                className="mr-3 h-8 w-8 items-center justify-center rounded-full"
                style={{ backgroundColor: colors.iconBg }}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.icon} />
              </View>
              <Text className={`font-medium ${colors.text}`}>Gizlilik Sözleşmesi</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.icon} />
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center justify-between px-4 py-4"
            onPress={() => {
              Linking.openURL('https://gunefshn.github.io/SubsFaq/');
            }}>
            <View className="flex-row items-center">
              <View
                className="mr-3 h-8 w-8 items-center justify-center rounded-full"
                style={{ backgroundColor: colors.iconBg }}>
                <Ionicons name="help-circle-outline" size={18} color={colors.icon} />
              </View>
              <Text className={`font-medium ${colors.text}`}>Sıkça Sorulan Sorular</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.icon} />
          </TouchableOpacity>
        </View>

        {/* ── Çıkış Yap ── */}
        <TouchableOpacity
          className={`mx-4 mb-3 items-center rounded-2xl py-4 ${colors.card}`}
          style={{ borderWidth: 1, borderColor: borderColorRaw }}
          onPress={handleSignOut}>
          <View className="flex-row items-center">
            <Ionicons
              name="log-out-outline"
              size={20}
              color={isDark ? '#ffffff' : '#111827'}
              style={{ marginRight: 8 }}
            />
            <Text className={`text-base font-semibold ${colors.text}`}>Çıkış Yap</Text>
          </View>
        </TouchableOpacity>

        {/* ── Hesabı Sil ── */}
        <TouchableOpacity className="mb-12 items-center" onPress={handleDeleteAccount}>
          <Text className={`text-sm ${colors.textFaint}`}>Hesabımı Sil</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ── Düzenleme Modali ── */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1">
          <View className="flex-1 justify-end">
            {/* Arka plan karartma */}
            <TouchableOpacity
              className="absolute inset-0 bg-black/60"
              activeOpacity={1}
              onPress={() => setModalVisible(false)}
            />
            <View
              className="rounded-t-3xl px-6 pb-10 pt-4"
              style={{ backgroundColor: modalSheetBg }}>
              {/* Tutamaç */}
              <View
                className="mb-6 h-1 w-12 self-center rounded-full"
                style={{ backgroundColor: isDark ? '#4b5563' : '#d1d5db' }}
              />
              <Text className={`mb-6 text-xl font-bold ${colors.text}`}>Profili Düzenle</Text>

              {/* Ad Soyad */}
              <Text className={`mb-1 text-sm ${colors.textMuted}`}>Ad Soyad</Text>
              <View
                className="mb-4 flex-row items-center rounded-xl px-4"
                style={{ height: 50, backgroundColor: modalInputBg }}>
                <Ionicons name="person-outline" size={18} color={colors.icon} />
                <TextInput
                  className="ml-3 flex-1 text-sm"
                  placeholder="Ad Soyad"
                  placeholderTextColor={placeholderColor}
                  style={{ color: inputTextColor }}
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                />
              </View>

              {/* E-posta — salt okunur */}
              <Text className={`mb-1 text-sm ${colors.textMuted}`}>E-posta</Text>
              <View
                className="mb-4 flex-row items-center rounded-xl px-4"
                style={{
                  height: 50,
                  backgroundColor: isDark ? '#374151' : '#f9fafb',
                  opacity: 0.7,
                }}>
                <Ionicons name="mail-outline" size={18} color={colors.icon} />
                <Text className={`ml-3 flex-1 text-sm ${colors.textMuted}`}>
                  {profile?.email ?? user?.email}
                </Text>
                <Ionicons name="lock-closed" size={14} color={colors.icon} />
              </View>

              <View className="my-4" style={{ borderTopWidth: 1, borderTopColor: modalDivider }} />
              <Text className={`mb-4 text-sm ${colors.textMuted}`}>
                Şifre değiştirmek istemiyorsanız boş bırakın
              </Text>

              {/* Mevcut Şifre */}
              <Text className={`mb-1 text-sm ${colors.textMuted}`}>Mevcut Şifre</Text>
              <View
                className="mb-4 flex-row items-center rounded-xl px-4"
                style={{ height: 50, backgroundColor: modalInputBg }}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.icon} />
                <TextInput
                  className="ml-3 flex-1 text-sm"
                  placeholder="Mevcut şifre"
                  placeholderTextColor={placeholderColor}
                  style={{ color: inputTextColor }}
                  value={oldPassword}
                  onChangeText={setOldPassword}
                  secureTextEntry={!showOldPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowOldPassword(!showOldPassword)}>
                  <Ionicons
                    name={showOldPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={18}
                    color={colors.icon}
                  />
                </TouchableOpacity>
              </View>

              {/* Yeni Şifre */}
              <Text className={`mb-1 text-sm ${colors.textMuted}`}>Yeni Şifre</Text>
              <View
                className="mb-6 flex-row items-center rounded-xl px-4"
                style={{ height: 50, backgroundColor: modalInputBg }}>
                <Ionicons name="lock-open-outline" size={18} color={colors.icon} />
                <TextInput
                  className="ml-3 flex-1 text-sm"
                  placeholder="Yeni şifre (min. 6 karakter)"
                  placeholderTextColor={placeholderColor}
                  style={{ color: inputTextColor }}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNewPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                  <Ionicons
                    name={showNewPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={18}
                    color={colors.icon}
                  />
                </TouchableOpacity>
              </View>

              {/* Kaydet */}
              <TouchableOpacity
                className="items-center rounded-xl py-4"
                style={{
                  backgroundColor: saving ? (isDark ? '#9ca3af' : '#6b7280') : saveBtnBg,
                  opacity: saving ? 0.7 : 1,
                }}
                disabled={saving}
                onPress={handleSave}>
                {saving ? (
                  <ActivityIndicator color={saveBtnText} />
                ) : (
                  <Text style={{ color: saveBtnText }} className="text-base font-semibold">
                    Kaydet
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
