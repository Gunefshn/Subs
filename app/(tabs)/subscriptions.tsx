import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AddFinanceModal from '../../src/components/AddFinanceModal';
import { supabase } from '../../src/lib/supabase';
import { useAuth } from '../../src/contexts/AuthContext';
import { useTheme } from '../../src/hooks/useTheme';
import { useAppContext } from '../../src/contexts/AppContext';
import { convertCurrency, formatAmount } from '../../src/lib/exchange';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.78;
const CARD_MARGIN = 12;

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

const getDaysUntilRenewal = (renewalDay: number): string => {
  const today = new Date();
  const currentDay = today.getDate();
  const daysLeft =
    renewalDay >= currentDay
      ? renewalDay - currentDay
      : new Date(today.getFullYear(), today.getMonth() + 1, renewalDay).getDate() +
        (new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate() - currentDay);
  if (daysLeft === 0) return 'Bugün';
  if (daysLeft === 1) return 'Yarın';
  return `${daysLeft} Gün Sonra`;
};

const isRenewingSoon = (renewalDay: number): boolean => {
  const today = new Date();
  const currentDay = today.getDate();
  const daysLeft =
    renewalDay >= currentDay ? renewalDay - currentDay : 30 - currentDay + renewalDay;
  return daysLeft <= 3;
};

export default function SubscriptionsScreen() {
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const { currency, rates } = useAppContext();

  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'card' | 'sub'>('card');
  const [cards, setCards] = useState<any[]>([]);
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [editItem, setEditItem] = useState<any>(null);
  const [editType, setEditType] = useState<'card' | 'sub'>('card');

  const formatCurrency = (amount: number) => {
    const converted = convertCurrency(amount, currency, rates);
    return formatAmount(converted, currency);
  };

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const { data: cardData } = await supabase
        .from('credit_cards')
        .select('*')
        .eq('user_id', user.id);
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

  const handleCardScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / (CARD_WIDTH + CARD_MARGIN));
    setActiveCardIndex(index);
  };

  // ── Karta tıklanınca düzenleme modalını aç ──
  const handleCardPress = (card: any) => {
    setEditItem(card);
    setEditType('card');
    setModalVisible(true);
  };

  // ── Aboneliğe tıklanınca düzenleme modalını aç ──
  const handleSubPress = (sub: any) => {
    setEditItem(sub);
    setEditType('sub');
    setModalVisible(true);
  };

  // ── Modal kapat ve state'i sıfırla ──
  const handleModalClose = () => {
    setModalVisible(false);
    setEditItem(null);
  };

  const activeCard = cards[activeCardIndex];

  const getCardDates = (card: any) => {
    if (!card) return { cutoff: '-', due: '-' };
    const today = new Date();
    const cutoffDate = new Date(today.getFullYear(), today.getMonth(), card.cutoff_day);
    const dueDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      card.due_day || card.cutoff_day + 10
    );
    const format = (d: Date) =>
      `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
    return { cutoff: format(cutoffDate), due: format(dueDate) };
  };

  const getMaskedNumber = (num: string) => {
    const cleaned = (num || '').replace(/\D/g, '');
    const last4 = cleaned.slice(-4).padStart(4, '*');
    return `**** **** **** ${last4}`;
  };

  const cardTextColor = '#ffffff';
  const chipColor = isDark ? '#4A5568' : '#ffffff40';

  if (loading) {
    return (
      <SafeAreaView className={`flex-1 items-center justify-center ${colors.bg}`}>
        <ActivityIndicator color={isDark ? 'white' : '#111827'} size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${colors.bg}`}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDark ? 'white' : '#111827'}
          />
        }>
        {/* ── Başlık ── */}
        <Text className={`mb-6 mt-4 text-center text-2xl font-bold ${colors.text}`}>
          Kartlar & Abonelikler
        </Text>

        {/* ── Kartlar Başlık ── */}
        <View className="mb-4 flex-row items-center justify-between px-5">
          <Text className={`text-sm font-bold uppercase tracking-wider ${colors.textMuted}`}>
            Kayıtlı Kartlar
          </Text>
          <TouchableOpacity
            onPress={() => {
              setEditItem(null);
              setModalType('card');
              setModalVisible(true);
            }}
            className={`rounded-xl p-1.5 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}
            style={{ borderWidth: 1, borderColor: isDark ? '#2D3748' : '#e5e7eb' }}>
            <Ionicons name="add" size={24} color={isDark ? 'white' : '#111827'} />
          </TouchableOpacity>
        </View>

        {/* ── Kart Carousel ── */}
        {cards.length === 0 ? (
          <View
            className="mx-5 mb-4 items-center justify-center rounded-3xl"
            style={{
              height: 190,
              borderWidth: 1,
              borderStyle: 'dashed',
              borderColor: isDark ? '#4A5568' : '#cbd5e1',
              backgroundColor: isDark ? '#1a2332' : '#f8fafc',
            }}>
            <Ionicons name="card-outline" size={48} color={isDark ? '#4A5568' : '#94a3b8'} />
            <Text className={`mt-2 text-sm italic ${colors.textMuted}`}>
              Henüz kart eklemediniz
            </Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={CARD_WIDTH + CARD_MARGIN}
            decelerationRate="fast"
            onMomentumScrollEnd={handleCardScroll}
            contentContainerStyle={{ paddingHorizontal: 20 }}>
            {cards.map((card) => (
              <TouchableOpacity
                key={card.id}
                activeOpacity={0.85}
                onPress={() => handleCardPress(card)}>
                <LinearGradient
                  colors={isDark ? ['#1e293b', '#0f172a'] : ['#D3D8DE', '#939598']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={{
                    width: CARD_WIDTH,
                    height: 190,
                    marginRight: CARD_MARGIN,
                    borderRadius: 24,
                    padding: 24,
                    justifyContent: 'space-between',
                    borderWidth: 1,
                    borderColor: isDark ? '#334155' : '#a0a4a8',
                  }}>
                  {/* Kart adı + chip */}
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                    <Text
                      style={{
                        color: cardTextColor,
                        fontSize: 22,
                        fontWeight: 'bold',
                        letterSpacing: 1,
                      }}>
                      {card.card_name}
                    </Text>
                    <View
                      style={{
                        width: 40,
                        height: 28,
                        backgroundColor: chipColor,
                        borderRadius: 6,
                        opacity: 0.85,
                      }}
                    />
                  </View>

                  <View />

                  {/* Alt: numara + logo */}
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'flex-end',
                      justifyContent: 'space-between',
                    }}>
                    <Text
                      style={{
                        color: cardTextColor,
                        fontSize: 16,
                        letterSpacing: 3,
                        fontFamily: 'monospace',
                      }}>
                      {getMaskedNumber(card.card_number ?? '')}
                    </Text>

                    {card.card_brand === 'Visa' ? (
                      <Text
                        style={{
                          color: cardTextColor,
                          fontSize: 24,
                          fontWeight: '900',
                          fontStyle: 'italic',
                        }}>
                        VISA
                      </Text>
                    ) : (
                      <View style={{ flexDirection: 'row' }}>
                        <View
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: 13,
                            backgroundColor: '#EF4444',
                            opacity: 0.9,
                          }}
                        />
                        <View
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: 13,
                            backgroundColor: '#F59E0B',
                            opacity: 0.9,
                            marginLeft: -10,
                          }}
                        />
                      </View>
                    )}
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* ── Aktif Kart Tarihleri ── */}
        {cards.length > 0 &&
          activeCard &&
          (() => {
            const { cutoff, due } = getCardDates(activeCard);
            return (
              <View className="mx-5 mb-8 mt-4 flex-row justify-between">
                <View>
                  <Text className={`text-xs font-bold uppercase ${colors.textMuted}`}>
                    Hesap Kesim Tarihi
                  </Text>
                  <Text className={`mt-1 text-base font-bold ${colors.text}`}>{cutoff}</Text>
                </View>
                <View className="items-end">
                  <Text className={`text-xs font-bold uppercase ${colors.textMuted}`}>
                    Son Ödeme Tarihi
                  </Text>
                  <Text className={`mt-1 text-base font-bold ${colors.text}`}>{due}</Text>
                </View>
              </View>
            );
          })()}

        {/* ── Nokta İndikatör ── */}
        {cards.length > 1 && (
          <View className="mb-6 flex-row justify-center gap-1">
            {cards.map((_, i) => (
              <View
                key={i}
                style={{
                  width: i === activeCardIndex ? 16 : 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor:
                    i === activeCardIndex
                      ? isDark
                        ? '#ffffff'
                        : '#111827'
                      : isDark
                        ? '#374151'
                        : '#cbd5e1',
                }}
              />
            ))}
          </View>
        )}

        {/* ── Abonelikler Başlık ── */}
        <View className="mb-4 flex-row items-center justify-between px-5">
          <Text className={`text-sm font-bold uppercase tracking-wider ${colors.textMuted}`}>
            Abonelikler
          </Text>
          <TouchableOpacity
            onPress={() => {
              setEditItem(null);
              setModalType('sub');
              setModalVisible(true);
            }}
            className={`rounded-xl p-1.5 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}
            style={{ borderWidth: 1, borderColor: isDark ? '#2D3748' : '#e5e7eb' }}>
            <Ionicons name="add" size={24} color={isDark ? 'white' : '#111827'} />
          </TouchableOpacity>
        </View>

        {/* ── Abonelik Listesi ── */}
        <View className="px-5 pb-24">
          {subs.length === 0 ? (
            <View className="items-center justify-center py-8">
              <MaterialCommunityIcons
                name="calendar-blank-outline"
                size={48}
                color={isDark ? '#4A5568' : '#94a3b8'}
              />
              <Text className={`mt-4 italic ${colors.textMuted}`}>Henüz abonelik bulunmuyor.</Text>
            </View>
          ) : (
            subs.map((sub) => {
              const config = categoryConfig[sub.category] || {
                icon: 'shape-outline',
                color: '#94A3B8',
                bgColor: '#2D3748',
              };
              const soon = isRenewingSoon(sub.renewal_day);
              const daysText = getDaysUntilRenewal(sub.renewal_day);

              return (
                // ── View → TouchableOpacity ──
                <TouchableOpacity
                  key={sub.id}
                  onPress={() => handleSubPress(sub)}
                  activeOpacity={0.75}
                  className="mb-3 flex-row items-center rounded-3xl p-4"
                  style={{
                    backgroundColor: isDark ? '#1C2533' : '#ffffff',
                    borderWidth: 1,
                    borderColor: soon ? '#EF4444' : isDark ? '#2D3748' : '#e5e7eb',
                    shadowColor: '#000',
                    shadowOpacity: 0.05,
                    shadowRadius: 6,
                    elevation: 2,
                  }}>
                  <View
                    className="mr-4 h-14 w-14 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: config.bgColor }}>
                    <MaterialCommunityIcons name={config.icon} size={28} color={config.color} />
                  </View>

                  <View className="flex-1">
                    <Text className={`text-base font-bold ${colors.text}`}>{sub.name}</Text>
                    <Text className={`mt-0.5 text-xs font-medium ${colors.textMuted}`}>
                      {sub.category}
                    </Text>
                  </View>

                  <View className="items-end">
                    <Text className={`text-base font-bold ${colors.text}`}>
                      {formatCurrency(sub.cost)}
                    </Text>
                    <Text
                      className="mt-0.5 text-xs font-bold"
                      style={{ color: soon ? '#EF4444' : isDark ? '#64748B' : '#94a3b8' }}>
                      {daysText}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      <AddFinanceModal
        visible={modalVisible}
        onClose={handleModalClose}
        initialTab={editItem ? editType : modalType}
        onSuccess={fetchData}
        editItem={editItem}
        editType={editType}
      />
    </SafeAreaView>
  );
}
