import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import AddFinanceModal from '../../src/components/AddFinanceModal';
import { supabase } from '../../src/lib/supabase';
import { useAuth } from '../../src/contexts/AuthContext';

// Abonelik kategorilerine göre özel ikon ve renk tanımlamaları
const categoryConfig: Record<string, { icon: any; color: string; bgColor: string }> = {
  Alışveriş: { icon: 'tag-outline', color: '#3B82F6', bgColor: '#3B82F620' },
  'Dijital Servis': { icon: 'play-box-outline', color: '#EF4444', bgColor: '#EF444420' },
  Eğitim: { icon: 'school-outline', color: '#F59E0B', bgColor: '#F59E0B20' },
  Eğlence: { icon: 'glass-cocktail', color: '#8B5CF6', bgColor: '#8B5CF620' },
  Fatura: { icon: 'water', color: '#06B6D4', bgColor: '#06B6D420' },
  Kira: { icon: 'key-outline', color: '#10B981', bgColor: '#10B98120' },
  Market: { icon: 'cart-outline', color: '#F97316', bgColor: '#F9731620' },
  Oyun: { icon: 'controller-classic-outline', color: '#14B8A6', bgColor: '#14B8A620' },
  Sağlık: { icon: 'pill', color: '#F43F5E', bgColor: '#F43F5E20' },
  Ulaşım: { icon: 'train-variant', color: '#6366F1', bgColor: '#6366F120' },
  Spor: { icon: 'basketball', color: '#EC4899', bgColor: '#EC489920' },
  Yemek: { icon: 'silverware-fork-knife', color: '#EAB308', bgColor: '#EAB30820' },
};

export default function SubscriptionsScreen() {
  const { user } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'card' | 'sub'>('card');
  const [cards, setCards] = useState<any[]>([]);
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      // credit_cards tablosu
      const { data: cardData } = await supabase
        .from('credit_cards')
        .select('*')
        .eq('user_id', user.id);

      // subscriptions tablosu
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id);

      setCards(cardData || []);
      setSubs(subData || []);
    } catch (error) {
      console.error('Veri çekme hatası:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#0F172A]">
        <ActivityIndicator color="white" size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0F172A]">
      <BlurView intensity={modalVisible ? 40 : 0} tint="dark" className="flex-1">
        <ScrollView
          className="flex-1 px-5 pt-4"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="white" />
          }>
          <Text className="mb-10 text-center text-2xl font-bold tracking-wide text-white">
            Kartlar & Abonelikler
          </Text>

          {/* ================= KARTLAR BÖLÜMÜ ================= */}
          <View className="mb-6 flex-row items-center justify-between">
            <Text className="text-sm font-bold uppercase tracking-wider text-[#64748B]">
              Kayıtlı Kartlar
            </Text>
            {/* KART EKLEME BUTONU */}
            <TouchableOpacity
              onPress={() => {
                setModalType('card');
                setModalVisible(true);
              }}
              className="rounded-xl border border-[#2D3748] bg-[#1C2533] p-1.5">
              <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-10">
            {cards.length === 0 ? (
              <View className="h-48 w-[320px] items-center justify-center rounded-[30px] border border-dashed border-[#4A5568] bg-[#2D3748]/20">
                <Ionicons name="card-outline" size={48} color="#4A5568" className="mb-2" />
                <Text className="text-sm italic text-slate-500">Henüz kart eklemediniz</Text>
              </View>
            ) : (
              cards.map((card) => (
                <View
                  key={card.id}
                  className="mr-4 h-48 w-[320px] justify-between rounded-[30px] border border-[#4A5568] bg-[#2D3748]/50 p-6">
                  <Text className="text-xl font-bold tracking-widest text-white">
                    {card.card_name}
                  </Text>
                  <View className="h-7 w-10 self-end rounded-md bg-[#4A5568] opacity-60" />
                  <View className="flex-row items-end justify-between">
                    <View>
                      <Text className="mb-1 text-[10px] font-bold uppercase text-[#64748B]">
                        Hesap Kesim
                      </Text>
                      <Text className="text-base font-bold text-white">
                        Ayın {card.cutoff_day}'i
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <View className="h-6 w-6 rounded-full bg-red-500 opacity-80" />
                      <View className="-ml-3 h-6 w-6 rounded-full bg-yellow-500 opacity-80" />
                    </View>
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          {/* ================= ABONELİKLER BÖLÜMÜ ================= */}
          <View className="mb-6 flex-row items-center justify-between">
            <Text className="text-sm font-bold uppercase tracking-wider text-[#64748B]">
              Abonelikler
            </Text>
            {/* ABONELİK EKLEME BUTONU */}
            <TouchableOpacity
              onPress={() => {
                setModalType('sub');
                setModalVisible(true);
              }}
              className="rounded-xl border border-[#2D3748] bg-[#1C2533] p-1.5">
              <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>

          <View className="pb-20">
            {subs.length === 0 ? (
              <View className="items-center justify-center py-8">
                <MaterialCommunityIcons name="calendar-blank-outline" size={48} color="#4A5568" />
                <Text className="mt-4 italic text-slate-500">Henüz abonelik bulunmuyor.</Text>
              </View>
            ) : (
              subs.map((sub) => {
                // Kategoriye uygun ikon/renk konfigürasyonunu çek, yoksa varsayılanı kullan
                const config = categoryConfig[sub.category] || {
                  icon: 'shape-outline',
                  color: '#94A3B8',
                  bgColor: '#2D3748',
                };

                return (
                  <View
                    key={sub.id}
                    className="mb-4 flex-row items-center rounded-3xl border border-[#2D3748] bg-[#1C2533] p-4 shadow-lg shadow-black/20">
                    <View
                      className="mr-4 h-14 w-14 items-center justify-center rounded-2xl"
                      style={{ backgroundColor: config.bgColor }}>
                      <MaterialCommunityIcons name={config.icon} size={28} color={config.color} />
                    </View>

                    <View className="flex-1">
                      <Text className="text-base font-bold text-white">{sub.name}</Text>
                      <Text className="mt-1 text-[11px] font-medium text-[#64748B]">
                        Yenileme: Ayın {sub.renewal_day}. Günü
                      </Text>
                    </View>

                    <View className="items-end">
                      <Text className="text-lg font-bold text-white">₺{sub.cost}</Text>
                      <Text
                        className={`mt-1 text-[10px] font-bold uppercase tracking-wider ${
                          sub.active ? 'text-green-500' : 'text-red-500'
                        }`}>
                        {sub.active ? 'Aktif' : 'Pasif'}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      </BlurView>

      <AddFinanceModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        initialTab={modalType}
        onSuccess={fetchData}
      />
    </SafeAreaView>
  );
}
