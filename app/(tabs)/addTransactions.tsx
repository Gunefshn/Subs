import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../../src/hooks/useTheme';
import { useAuth } from '../../src/contexts/AuthContext';
import { supabase } from '../../src/lib/supabase';
import { transactionEvents } from '../../src/hooks/useTransactions';
import { useAppContext } from '../../src/contexts/AppContext';
import { CURRENCY_SYMBOLS } from '../../src/lib/exchange';

export default function AddTransactions() {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const { currency, rates } = useAppContext();
  const currencySymbol = CURRENCY_SYMBOLS[currency];

  const params = useLocalSearchParams<{
    mode?: string;
    id?: string;
    amount?: string;
    category?: string;
    date?: string;
    note?: string;
    type?: string;
  }>();

  const isEditMode = params.mode === 'edit';

  const [selectedTab, setSelectedTab] = useState<'Gelir' | 'Gider'>('Gelir');
  const [amountText, setAmountText] = useState('');
  const [details, setDetails] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      if (params.type === 'income') setSelectedTab('Gelir');
      else if (params.type === 'expense') setSelectedTab('Gider');
      if (params.amount) setAmountText(params.amount);
      if (params.category) setSelectedCategory(params.category);
      if (params.note) setDetails(params.note);
      if (params.date) setDate(new Date(params.date));
    }
  }, []);

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) setDate(selectedDate);
  };

  const formatDate = (d: Date) =>
    d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });

  const gelirKategorileri = [
    { name: 'Ek İş', icon: 'construct' },
    { name: 'İade Ücreti', icon: 'refresh' },
    { name: 'Kira Geliri', icon: 'home' },
    { name: 'Maaş', icon: 'briefcase' },
    { name: 'Prim', icon: 'gift' },
    { name: 'Satış', icon: 'cart' },
    { name: 'Yatırım', icon: 'trending-up' },
    { name: 'Diğer', icon: 'ellipsis-horizontal' },
  ];

  const giderKategorileri = [
    { name: 'Alışveriş', icon: 'cart' },
    { name: 'Dijital Servis', icon: 'tv' },
    { name: 'Eğitim', icon: 'school' },
    { name: 'Eğlence', icon: 'game-controller' },
    { name: 'Fatura', icon: 'document-text' },
    { name: 'Kira', icon: 'home' },
    { name: 'Market', icon: 'basket' },
    { name: 'Oyun', icon: 'game-controller' },
    { name: 'Sağlık', icon: 'medkit' },
    { name: 'Ulaşım', icon: 'car' },
    { name: 'Spor', icon: 'barbell' },
    { name: 'Yemek', icon: 'restaurant' },
  ];

  const kategoriler = selectedTab === 'Gelir' ? gelirKategorileri : giderKategorileri;

  const handleTabChange = (tab: 'Gelir' | 'Gider') => {
    setSelectedTab(tab);
    setSelectedCategory('');
  };

  const handleSave = async () => {
    if (!user) return;

    const rawAmount = parseFloat(amountText.replace(',', '.'));
    const amount = currency === 'TRY' ? rawAmount : rawAmount / (rates[currency] ?? 1);
    if (!amountText || isNaN(amount) || amount <= 0) {
      Alert.alert('Hata', 'Lütfen geçerli bir tutar giriniz.');
      return;
    }
    if (!selectedCategory) {
      Alert.alert('Hata', 'Lütfen bir kategori seçiniz.');
      return;
    }

    setSaving(true);
    try {
      if (isEditMode && params.id) {
        const { error } = await supabase
          .from('transactions')
          .update({
            amount,
            category: selectedCategory,
            date: date.toISOString(),
            note: details.trim() || null,
            type: selectedTab === 'Gelir' ? 'income' : 'expense',
          })
          .eq('id', params.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('transactions').insert([
          {
            user_id: user.id,
            amount,
            category: selectedCategory,
            date: date.toISOString(),
            note: details.trim() || null,
            type: selectedTab === 'Gelir' ? 'income' : 'expense',
          },
        ]);
        if (error) throw error;
      }

      // ── Tüm dinleyicileri (Dashboard, AllTransactions) anında bilgilendir
      transactionEvents.emit();

      router.back();
    } catch (error: any) {
      Alert.alert('Kayıt Hatası', error.message);
    } finally {
      setSaving(false);
    }
  };
  const borderColorRaw = isDark ? '#374151' : '#e5e7eb';
  const inputTextColor = isDark ? '#ffffff' : '#111827';
  const placeholderColor = isDark ? '#6b7280' : '#9ca3af';
  const tabActiveBg = isDark ? '#374151' : '#111827';
  const catCircleActiveBg = isDark ? '#ffffff' : '#111827';
  const catIconActiveColor = isDark ? '#111827' : '#ffffff';
  const catIconInactiveColor = isDark ? '#ffffff' : '#374151';
  const saveBtnBg = isDark ? '#ffffff' : '#111827';
  const saveBtnText = isDark ? '#111827' : '#ffffff';

  return (
    <SafeAreaView className={`flex-1 ${colors.bg}`}>
      {/* ── Header ── */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'flex-end',
          paddingHorizontal: 16,
          paddingTop: 10,
        }}>
        <TouchableOpacity
          onPress={() => router.back()}
          className={`h-10 w-10 items-center justify-center rounded-full ${colors.card}`}
          style={{ borderWidth: 1, borderColor: borderColorRaw }}>
          <Ionicons name="close" size={24} color={colors.icon} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
        {/* ── Tab Bar ── */}
        <View
          className={`flex-row rounded-2xl p-1 ${colors.card}`}
          style={{ borderWidth: 1, borderColor: borderColorRaw }}>
          {(['Gelir', 'Gider'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => handleTabChange(tab)}
              className="flex-1 items-center rounded-xl py-2.5"
              style={{ backgroundColor: selectedTab === tab ? tabActiveBg : 'transparent' }}>
              <Text
                className="font-bold"
                style={{ color: selectedTab === tab ? '#ffffff' : isDark ? '#9ca3af' : '#6b7280' }}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Tutar Girişi ── */}
        <View className="my-8 flex-row items-center justify-center">
          <Text className={`mr-1 text-5xl font-bold ${colors.text}`}>{currencySymbol}</Text>
          <TextInput
            value={amountText}
            onChangeText={(val) => setAmountText(val.replace(/[^0-9.,]/g, ''))}
            placeholder="0"
            placeholderTextColor={inputTextColor}
            keyboardType="decimal-pad"
            style={{
              fontSize: 64,
              fontWeight: 'bold',
              color: inputTextColor,
              minWidth: 80,
              textAlign: 'center',
              padding: 0,
            }}
          />
        </View>

        {/* ── Kategori Grid ── */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {kategoriler.map((kat, index) => {
            const isSelected = selectedCategory === kat.name;
            return (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedCategory(kat.name)}
                style={{ width: '48%', marginBottom: 16, alignItems: 'center' }}>
                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: isSelected ? catCircleActiveBg : colors.iconBg },
                  ]}>
                  <Ionicons
                    name={kat.icon as any}
                    size={24}
                    color={isSelected ? catIconActiveColor : catIconInactiveColor}
                  />
                </View>
                <Text
                  style={{
                    color: isSelected ? inputTextColor : isDark ? '#9ca3af' : '#6b7280',
                    marginTop: 8,
                    fontWeight: '500',
                    fontSize: 13,
                  }}>
                  {kat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Tarih + Detay ── */}
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className={`flex-1 flex-row items-center rounded-xl px-4 py-4 ${colors.input}`}
            style={{ borderWidth: 1, borderColor: borderColorRaw }}>
            <Ionicons name="calendar" size={20} color={colors.icon} style={{ marginRight: 8 }} />
            <Text style={{ color: inputTextColor, fontWeight: '500' }}>{formatDate(date)}</Text>
          </TouchableOpacity>

          <View
            className={`flex-1 flex-row items-center rounded-xl px-4 py-4 ${colors.input}`}
            style={{ borderWidth: 1, borderColor: borderColorRaw }}>
            <Ionicons name="pencil" size={20} color={colors.icon} style={{ marginRight: 8 }} />
            <TextInput
              value={details}
              onChangeText={setDetails}
              placeholder="Detay..."
              placeholderTextColor={placeholderColor}
              style={{ color: inputTextColor, flex: 1 }}
            />
          </View>
        </View>

        {/* ── Date Picker ── */}
        {showDatePicker &&
          (Platform.OS === 'ios' ? (
            <View
              className="mt-3 overflow-hidden rounded-2xl"
              style={{
                backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
                borderWidth: 1,
                borderColor: borderColorRaw,
              }}>
              <DateTimePicker
                value={date}
                mode="date"
                display="inline"
                onChange={onDateChange}
                themeVariant={isDark ? 'dark' : 'light'}
              />
              <TouchableOpacity
                onPress={() => setShowDatePicker(false)}
                className="items-center py-3"
                style={{ borderTopWidth: 1, borderTopColor: borderColorRaw }}>
                <Text style={{ color: '#3b82f6', fontWeight: 'bold' }}>Tamam</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <DateTimePicker value={date} mode="date" display="default" onChange={onDateChange} />
          ))}

        {/* ── Kaydet Butonu ── */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          className="mb-6 mt-10 items-center rounded-xl py-4"
          style={{ backgroundColor: saving ? (isDark ? '#4b5563' : '#9ca3af') : saveBtnBg }}>
          {saving ? (
            <ActivityIndicator color={saveBtnText} />
          ) : (
            <Text style={{ color: saveBtnText, fontWeight: 'bold', fontSize: 18 }}>
              {isEditMode ? 'Güncelle' : 'Kaydet'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
