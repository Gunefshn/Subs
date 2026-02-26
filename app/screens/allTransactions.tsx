import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import TransactionCard from '../components/TransactionCard';
import { useTransactions } from '../../src/hooks/useTransactions';

const categoryIconMap: Record<string, { icon: string; color: string }> = {
  Market: { icon: 'shopping-cart', color: 'green' },
  Yemek: { icon: 'shop', color: 'orange' },
  Ulaşım: { icon: 'car', color: 'blue' },
  Fatura: { icon: 'drop', color: 'blue' },
  Spor: { icon: 'dribbble', color: 'orange' },
  Eğlence: { icon: 'tv', color: 'red' },
  'Dijital Servis': { icon: 'tv', color: 'red' },
  Gelir: { icon: 'attach-money', color: 'green' },
  Kira: { icon: 'home', color: 'purple' },
  Oyun: { icon: 'controller', color: 'red' },
  Diğer: { icon: 'dots-three-horizontal', color: 'gray' },
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
  'Gelir',
  'Diğer',
];

export default function AllTransactions() {
  const { transactions, loading } = useTransactions();
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('Yeni');
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);

  const formatCurrency = (amount: number) =>
    `₺${amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`;

  const filtered = useMemo(() => {
    let result = [...transactions];

    if (search.trim()) {
      result = result.filter(
        (t) =>
          t.note?.toLowerCase().includes(search.toLowerCase()) ||
          t.category?.toLowerCase().includes(search.toLowerCase())
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

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-900">
        <ActivityIndicator size="large" color="#ffffff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      {/* Header */}
      <View className="mb-4 mt-2 flex-row items-center justify-center px-4">
        <TouchableOpacity className="absolute left-4" onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color="white" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold text-white">Tüm İşlemler</Text>
      </View>

      {/* Arama — beyaz arka plan */}
      <View
        className="mx-4 mt-4 mb-3 flex-row items-center rounded-2xl bg-white px-4 h-12">
        <Ionicons name="search-outline" size={18} color="#9ca3af" />
          <TextInput
            className="ml-2 flex-1 text-sm text-gray-800"
            placeholder="İşlem adı ara..."
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


{/* Filtre Butonları */}
<View className="mx-4 mt-4 mb-4 flex-row gap-2">
  {/* Sıralama */}
  <View className="flex-1">
    <TouchableOpacity
      className="flex-row items-center justify-center rounded-full bg-white px-4 py-2"
      onPress={() => {
        setShowSortMenu(!showSortMenu);
        setShowCategoryMenu(false);
      }}>
      <Text className="mr-1 text-sm font-medium text-gray-900">Sırala: {sortBy}</Text>
      <Ionicons name="chevron-down" size={14} color="#111827" />
    </TouchableOpacity>
    {showSortMenu && (
      <View
        className="absolute left-0 top-12 z-50 w-36 rounded-xl bg-white"
        style={{ elevation: 10, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8 }}>
        {SORT_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option}
            className={`px-4 py-3 ${sortBy === option ? 'bg-gray-100' : ''}`}
            onPress={() => {
              setSortBy(option);
              setShowSortMenu(false);
            }}>
            <Text
              className={`text-sm ${sortBy === option ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    )}
  </View>

  {/* Kategori */}
  <View className="flex-1">
    <TouchableOpacity
      className="flex-row items-center justify-center rounded-full bg-white px-4 py-2"
      onPress={() => {
        setShowCategoryMenu(!showCategoryMenu);
        setShowSortMenu(false);
      }}>
      <Text className="mr-1 text-sm font-medium text-gray-900">
        {selectedCategory === 'Tümü' ? 'Kategori' : selectedCategory}
      </Text>
      <Ionicons name="chevron-down" size={14} color="#111827" />
    </TouchableOpacity>
    {showCategoryMenu && (
      <View
        className="absolute left-0 top-12 z-50 w-44 rounded-xl bg-white"
        style={{ elevation: 10, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8 }}>
        <ScrollView style={{ maxHeight: 240 }} showsVerticalScrollIndicator={false}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              className={`px-4 py-3 ${selectedCategory === cat ? 'bg-gray-100' : ''}`}
              onPress={() => {
                setSelectedCategory(cat);
                setShowCategoryMenu(false);
              }}>
              <Text
                className={`text-sm ${selectedCategory === cat ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    )}
  </View>

  {/* Tutar Aralığı */}
  <TouchableOpacity className="flex-1 flex-row items-center justify-center rounded-full bg-white px-4 py-2">
    <Text className="mr-1 text-sm font-medium text-gray-900">Tutar Aralığı</Text>
    <Ionicons name="chevron-down" size={14} color="#111827" />
  </TouchableOpacity>
</View>
      {/* İşlem Listesi */}
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        onStartShouldSetResponder={() => {
          setShowSortMenu(false);
          setShowCategoryMenu(false);
          return false;
        }}>
        {filtered.length === 0 ? (
          <Text className="mt-16 text-center text-gray-500">İşlem bulunamadı.</Text>
        ) : (
          filtered.map((item) => {
            const iconData = categoryIconMap[item.category] ?? {
              icon: 'dots-three-horizontal',
              color: 'gray',
            };
            return (
              <TransactionCard
                key={item.id}
                name={item.note || item.category}
                icon={iconData.icon}
                color={iconData.color}
                amount={formatCurrency(item.amount)}
                date={new Date(item.date).toLocaleDateString('tr-TR')}
                category={item.category}
              />
            );
          })
        )}
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
