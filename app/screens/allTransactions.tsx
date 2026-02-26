import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTransactions, transactionEvents } from '../../src/hooks/useTransactions';
import { useFocusEffect } from 'expo-router';
import { useTheme } from '../../src/hooks/useTheme';
import { useAppContext } from '../../src/contexts/AppContext';
import { convertCurrency, formatAmount } from '../../src/lib/exchange';
import TransactionDetailModal, { Transaction } from '../../src/components/TransactionDetailModal';

const categoryConfig: Record<
  string,
  { icon: string; color: string; bgColor: string; lib: 'ion' | 'mci' }
> = {
  Market: { icon: 'cart-outline', color: '#F97316', bgColor: '#F9731625', lib: 'mci' },
  Yemek: { icon: 'silverware-fork-knife', color: '#EAB308', bgColor: '#EAB30825', lib: 'mci' },
  Ulaşım: { icon: 'train-variant', color: '#6366F1', bgColor: '#6366F125', lib: 'mci' },
  Fatura: { icon: 'water', color: '#06B6D4', bgColor: '#06B6D425', lib: 'mci' },
  Spor: { icon: 'basketball', color: '#EC4899', bgColor: '#EC489925', lib: 'mci' },
  Eğlence: { icon: 'glass-cocktail', color: '#8B5CF6', bgColor: '#8B5CF625', lib: 'mci' },
  'Dijital Servis': {
    icon: 'play-box-outline',
    color: '#EF4444',
    bgColor: '#EF444425',
    lib: 'mci',
  },
  Kira: { icon: 'key-outline', color: '#10B981', bgColor: '#10B98125', lib: 'mci' },
  Oyun: { icon: 'controller-classic-outline', color: '#14B8A6', bgColor: '#14B8A625', lib: 'mci' },
  Sağlık: { icon: 'pill', color: '#F43F5E', bgColor: '#F43F5E25', lib: 'mci' },
  Alışveriş: { icon: 'tag-outline', color: '#3B82F6', bgColor: '#3B82F625', lib: 'mci' },
  Eğitim: { icon: 'school-outline', color: '#F59E0B', bgColor: '#F59E0B25', lib: 'mci' },
  Maaş: { icon: 'briefcase-outline', color: '#10B981', bgColor: '#10B98125', lib: 'mci' },
  'Ek İş': { icon: 'hammer-wrench', color: '#10B981', bgColor: '#10B98125', lib: 'mci' },
  'Kira Geliri': { icon: 'home-outline', color: '#10B981', bgColor: '#10B98125', lib: 'mci' },
  'İade Ücreti': { icon: 'cash-refund', color: '#10B981', bgColor: '#10B98125', lib: 'mci' },
  Prim: { icon: 'gift-outline', color: '#10B981', bgColor: '#10B98125', lib: 'mci' },
  Satış: { icon: 'tag-outline', color: '#10B981', bgColor: '#10B98125', lib: 'mci' },
  Yatırım: { icon: 'trending-up', color: '#10B981', bgColor: '#10B98125', lib: 'ion' },
  Diğer: { icon: 'shape-outline', color: '#94A3B8', bgColor: '#94A3B825', lib: 'mci' },
};

const SORT_OPTIONS = ['Yeni', 'Eski', 'Yüksek', 'Düşük'];
const CATEGORIES = [
  'Tümü',
  'Market',
  'Yemek',
  'Ulaşım',
  'Fatura',
  'Spor',
  'Eğlence',
  'Dijital Servis',
  'Kira',
  'Oyun',
  'Sağlık',
  'Alışveriş',
  'Eğitim',
  'Maaş',
  'Ek İş',
  'Kira Geliri',
  'İade Ücreti',
  'Prim',
  'Satış',
  'Yatırım',
  'Diğer',
];

export default function AllTransactions() {
  const { transactions, loading, refetch } = useTransactions();
  const { colors, isDark } = useTheme();
  const { currency, rates } = useAppContext();

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('Yeni');
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // ── Modal state ──
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // addTransactions sayfasından geri dönünce listeyi yenile
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  // Silme/güncelleme eventlerini dinle
  useEffect(() => {
    const unsub = transactionEvents.subscribe(() => refetch());
    return unsub;
  }, [refetch]);

  const formatCurrency = (amount: number) =>
    formatAmount(convertCurrency(amount, currency, rates), currency);

  const filtered = useMemo(() => {
    let result = [...transactions];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) => t.note?.toLowerCase().includes(q) || t.category?.toLowerCase().includes(q)
      );
    }
    if (selectedCategory !== 'Tümü') {
      result = result.filter((t) => t.category === selectedCategory);
    }
    switch (sortBy) {
      case 'Yeni':
        result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case 'Eski':
        result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'Yüksek':
        result.sort((a, b) => b.amount - a.amount);
        break;
      case 'Düşük':
        result.sort((a, b) => a.amount - b.amount);
        break;
    }
    return result;
  }, [transactions, search, sortBy, selectedCategory]);

  // ─── Tema ────────────────────────────────────────────────────────────────
  const borderColor = isDark ? '#2D3748' : '#e5e7eb';
  const dropdownBg = isDark ? '#1f2937' : '#ffffff';
  const activeItemBg = isDark ? '#374151' : '#f3f4f6';
  const activeText = isDark ? '#ffffff' : '#111827';
  const inactiveText = isDark ? '#9ca3af' : '#6b7280';
  const cardBg = isDark ? '#1C2533' : '#ffffff';
  const mutedColor = isDark ? '#4B5563' : '#9ca3af';

  if (loading && !refreshing) {
    return (
      <SafeAreaView className={`flex-1 items-center justify-center ${colors.bg}`}>
        <ActivityIndicator size="large" color={isDark ? '#ffffff' : '#111827'} />
      </SafeAreaView>
    );
  }

  const renderItem = ({ item }: { item: any }) => {
    const cfg = categoryConfig[item.category] ?? {
      icon: 'shape-outline',
      color: '#94A3B8',
      bgColor: '#94A3B825',
      lib: 'mci',
    };
    const isIncome = item.type === 'income';
    const amountColor = isIncome ? '#10B981' : isDark ? '#ffffff' : '#111827';
    const amountStr = `${isIncome ? '+' : '-'}${formatCurrency(item.amount)}`;
    const dateStr = new Date(item.date).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    return (
      <TouchableOpacity
        onPress={() => {
          setSelectedTx(item as Transaction);
          setModalVisible(true);
        }}
        activeOpacity={0.75}
        className="mb-2 flex-row items-center rounded-2xl px-4 py-3"
        style={{ backgroundColor: cardBg, borderWidth: 1, borderColor }}>
        {/* İkon */}
        <View
          className="mr-4 h-12 w-12 items-center justify-center rounded-2xl"
          style={{ backgroundColor: cfg.bgColor }}>
          {cfg.lib === 'mci' ? (
            <MaterialCommunityIcons name={cfg.icon as any} size={24} color={cfg.color} />
          ) : (
            <Ionicons name={cfg.icon as any} size={24} color={cfg.color} />
          )}
        </View>
        {/* İsim + Kategori */}
        <View className="flex-1">
          <Text
            className="text-sm font-bold"
            style={{ color: isDark ? '#ffffff' : '#111827' }}
            numberOfLines={1}>
            {item.note || item.category}
          </Text>
          <Text className="mt-0.5 text-xs" style={{ color: mutedColor }}>
            {item.category}
          </Text>
        </View>
        {/* Tutar + Tarih */}
        <View className="items-end">
          <Text className="text-sm font-bold" style={{ color: amountColor }}>
            {amountStr}
          </Text>
          <Text className="mt-0.5 text-xs" style={{ color: mutedColor }}>
            {dateStr}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className={`flex-1 ${colors.bg}`}>
      {/* ── Header ── */}
      <View className="mb-2 mt-2 flex-row items-center justify-center px-4">
        <TouchableOpacity className="absolute left-4" onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color={isDark ? '#ffffff' : '#111827'} />
        </TouchableOpacity>
        <Text className={`text-xl font-semibold ${colors.text}`}>Tüm İşlemler</Text>
      </View>

      {/* ── Arama ── */}
      <View
        className="mx-4 mb-3 mt-3 h-12 flex-row items-center rounded-2xl px-4"
        style={{ backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb' }}>
        <Ionicons name="search-outline" size={18} color="#9ca3af" />
        <TextInput
          className="ml-2 flex-1 text-sm"
          style={{ color: '#111827' }}
          placeholder="İşlem ara..."
          placeholderTextColor="#9ca3af"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>

      {/* ── Filtre Butonları ── */}
      <View className="mx-4 mb-4 flex-row gap-2">
        {/* Sıralama */}
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            className="flex-row items-center justify-center rounded-full px-3 py-2.5"
            style={{ backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb' }}
            onPress={() => {
              setShowSortMenu(!showSortMenu);
              setShowCategoryMenu(false);
            }}>
            <Text className="mr-1 text-xs font-semibold" style={{ color: '#111827' }}>
              Sırala: {sortBy}
            </Text>
            <Ionicons name="chevron-down" size={12} color="#111827" />
          </TouchableOpacity>
          {showSortMenu && (
            <View
              className="absolute left-0 top-11 z-50 w-36 overflow-hidden rounded-xl"
              style={{ backgroundColor: dropdownBg, borderWidth: 1, borderColor, elevation: 10 }}>
              {SORT_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  className="px-4 py-3"
                  style={{ backgroundColor: sortBy === opt ? activeItemBg : 'transparent' }}
                  onPress={() => {
                    setSortBy(opt);
                    setShowSortMenu(false);
                  }}>
                  <Text
                    style={{
                      color: sortBy === opt ? activeText : inactiveText,
                      fontSize: 13,
                      fontWeight: sortBy === opt ? '600' : '400',
                    }}>
                    {opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Kategori */}
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            className="flex-row items-center justify-center rounded-full px-3 py-2.5"
            style={{ backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb' }}
            onPress={() => {
              setShowCategoryMenu(!showCategoryMenu);
              setShowSortMenu(false);
            }}>
            <Text
              className="mr-1 text-xs font-semibold"
              numberOfLines={1}
              style={{ color: '#111827' }}>
              {selectedCategory === 'Tümü' ? 'Kategori' : selectedCategory}
            </Text>
            <Ionicons name="chevron-down" size={12} color="#111827" />
          </TouchableOpacity>
          {showCategoryMenu && (
            <View
              className="absolute left-0 top-11 z-50 w-44 overflow-hidden rounded-xl"
              style={{ backgroundColor: dropdownBg, borderWidth: 1, borderColor, elevation: 10 }}>
              <ScrollView style={{ maxHeight: 260 }} showsVerticalScrollIndicator={false}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    className="px-4 py-3"
                    style={{
                      backgroundColor: selectedCategory === cat ? activeItemBg : 'transparent',
                    }}
                    onPress={() => {
                      setSelectedCategory(cat);
                      setShowCategoryMenu(false);
                    }}>
                    <Text
                      style={{
                        color: selectedCategory === cat ? activeText : inactiveText,
                        fontSize: 13,
                        fontWeight: selectedCategory === cat ? '600' : '400',
                      }}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Tutar Aralığı */}
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            className="flex-row items-center justify-center rounded-full px-3 py-2.5"
            style={{ backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e5e7eb' }}>
            <Text className="mr-1 text-xs font-semibold" style={{ color: '#111827' }}>
              Tutar Aralığı
            </Text>
            <Ionicons name="chevron-down" size={12} color="#111827" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── FlatList ── */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        onStartShouldSetResponder={() => {
          setShowSortMenu(false);
          setShowCategoryMenu(false);
          return false;
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDark ? 'white' : '#111827'}
          />
        }
        ListEmptyComponent={
          <View className="mt-24 items-center">
            <Ionicons name="receipt-outline" size={52} color={isDark ? '#374151' : '#e5e7eb'} />
            <Text className="mt-4 text-center text-sm" style={{ color: mutedColor }}>
              {transactions.length === 0
                ? 'Henüz işlem eklenmedi.'
                : 'Kriterlere uygun işlem bulunamadı.'}
            </Text>
          </View>
        }
      />

      {/* ── İşlem Detay Modalı ── */}
      <TransactionDetailModal
        visible={modalVisible}
        transaction={selectedTx}
        onClose={() => {
          setModalVisible(false);
          setSelectedTx(null);
        }}
        onDelete={() => {
          setModalVisible(false);
          setSelectedTx(null);
          refetch();
        }}
      />
    </SafeAreaView>
  );
}
