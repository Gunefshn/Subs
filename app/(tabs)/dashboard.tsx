import { useCallback, useEffect } from 'react';
import { View, ScrollView, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Link, useFocusEffect } from 'expo-router';
import TransactionCard from '../components/TransactionCard';
import { useUser } from '../../src/hooks/useUser';
import { useTransactions, transactionEvents } from '../../src/hooks/useTransactions';
import { convertCurrency, formatAmount } from '../../src/lib/exchange';
import { useAppContext } from '../../src/contexts/AppContext';
import { useTheme } from '../../src/hooks/useTheme';

// MaterialCommunityIcons kullanılacak şekilde güncellendi
const categoryIconMap: Record<string, { icon: string; color: string; iconLib?: 'mci' | 'ion' }> = {
  Market: { icon: 'cart-outline', color: 'orange' },
  Yemek: { icon: 'silverware-fork-knife', color: 'orange' },
  Ulaşım: { icon: 'train-variant', color: 'blue' },
  Fatura: { icon: 'water', color: 'blue' },
  Spor: { icon: 'basketball', color: 'orange' },
  Eğlence: { icon: 'glass-cocktail', color: 'purple' },
  'Dijital Servis': { icon: 'play-box-outline', color: 'red' },
  Kira: { icon: 'key-outline', color: 'green' },
  Oyun: { icon: 'controller-classic-outline', color: 'blue' },
  Sağlık: { icon: 'pill', color: 'red' },
  Alışveriş: { icon: 'tag-outline', color: 'blue' },
  Eğitim: { icon: 'school-outline', color: 'orange' },
  Maaş: { icon: 'briefcase-outline', color: 'green' },
  'Ek İş': { icon: 'hammer-wrench', color: 'green' },
  'Kira Geliri': { icon: 'home-outline', color: 'green' },
  'İade Ücreti': { icon: 'cash-refund', color: 'green' },
  Prim: { icon: 'gift-outline', color: 'green' },
  Satış: { icon: 'tag-outline', color: 'green' },
  Yatırım: { icon: 'trending-up', color: 'green', iconLib: 'ion' },
  Diğer: { icon: 'shape-outline', color: 'gray' },
};

function calcChangePercent(
  current: number,
  previous: number
): { percent: number; increased: boolean | null } {
  if (previous === 0 && current === 0) return { percent: 0, increased: null };
  if (previous === 0) return { percent: 100, increased: true };
  const diff = ((current - previous) / previous) * 100;
  return { percent: Math.abs(Math.round(diff)), increased: diff > 0 };
}

export default function Dashboard() {
  const { profile, loading: profileLoading } = useUser();
  const { transactions, summary, loading: txLoading, refetch } = useTransactions(5);
  const { currency, rates } = useAppContext();
  const { colors, isDark } = useTheme();
  const isLoading = profileLoading || txLoading;

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

  const formatCurrency = (amountInTRY: number) =>
    formatAmount(convertCurrency(amountInTRY, currency, rates), currency);

  const expenseChange = calcChangePercent(
    summary.thisMonthExpense ?? 0,
    summary.lastMonthExpense ?? 0
  );

  const getComparisonText = () => {
    if (expenseChange.increased === null) return 'Henüz karşılaştırma yapılacak veri yok.';
    if (expenseChange.percent === 0) return 'Harcamalar geçen ayla aynı seviyede.';
    const direction = expenseChange.increased ? 'arttı' : 'azaldı';
    return `Harcamalar geçen aya göre %${expenseChange.percent} ${direction}.`;
  };

  const arrowIcon = expenseChange.increased ? 'trending-up' : 'trending-down';
  const arrowColor =
    expenseChange.increased === null
      ? isDark
        ? '#9ca3af'
        : '#6b7280'
      : expenseChange.increased
        ? '#ef4444'
        : '#10b981';

  if (isLoading) {
    return (
      <SafeAreaView className={`flex-1 items-center justify-center ${colors.bg}`}>
        <ActivityIndicator size="large" color={isDark ? '#ffffff' : '#6b7280'} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${colors.bg}`}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Kullanıcı adı ── */}
        <Text className={`mt-10 self-center text-2xl font-semibold ${colors.text}`}>
          Merhaba <Text className="italic">{profile?.full_name?.split(' ')[0] ?? 'Kullanıcı'}</Text>
        </Text>

        {/* ── Bakiye Kartı ── */}
        <View
          className={`mt-6 w-5/6 self-center rounded-2xl ${colors.card} p-4`}
          style={{ shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 }}>
          <View className="flex-row items-center justify-between">
            <Text className={`mt-3 px-4 text-lg font-semibold ${colors.textMuted}`}>
              Toplam Bakiye
            </Text>
            <View className={`mt-3 rounded-xl ${colors.cardAlt} px-5 py-1`}>
              <Text className={`text-sm font-semibold ${colors.textMuted}`}>{currency}</Text>
            </View>
          </View>

          <Text className={`mt-6 px-4 text-3xl font-semibold ${colors.text}`}>
            {formatCurrency(summary.balance)}
          </Text>

          {/* Gelir / Gider */}
          <View className="mb-2 mt-8 flex-row justify-between">
            <View className="flex-row items-center px-4">
              <Feather name="arrow-up-right" size={20} color="#16a34a" />
              <Text className={`ml-1 font-semibold ${colors.textMuted}`}>
                Gelir:{' '}
                <Text className={`font-bold ${colors.text}`}>
                  {formatCurrency(summary.totalIncome)}
                </Text>
              </Text>
            </View>
            <View className="flex-row items-center px-4">
              <Feather name="arrow-down-right" size={20} color="#dc2626" />
              <Text className={`ml-1 font-semibold ${colors.textMuted}`}>
                Gider:{' '}
                <Text className={`font-bold ${colors.text}`}>
                  {formatCurrency(summary.totalExpense)}
                </Text>
              </Text>
            </View>
          </View>
        </View>

        {/* ── Karşılaştırma Info Box ── */}
        <View
          className={`mt-4 w-5/6 self-center rounded-2xl ${colors.card} p-4`}
          style={{ shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 }}>
          <View className="flex-row items-center px-2">
            <Feather
              name={expenseChange.increased === null ? 'info' : arrowIcon}
              size={16}
              color={arrowColor}
              style={{ marginRight: 8 }}
            />
            <Text className={`flex-1 text-sm ${colors.textMuted}`}>{getComparisonText()}</Text>
            {expenseChange.increased !== null && expenseChange.percent > 0 && (
              <View
                className="ml-2 rounded-full px-2 py-0.5"
                style={{
                  backgroundColor: expenseChange.increased
                    ? 'rgba(239,68,68,0.12)'
                    : 'rgba(16,185,129,0.12)',
                }}>
                <Text className="text-xs font-bold" style={{ color: arrowColor }}>
                  {expenseChange.increased ? '+' : '-'}
                  {expenseChange.percent}%
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* ── Son İşlemler Başlık ── */}
        <View className="mt-6 flex-row items-center justify-between px-12">
          <Text className={`text-lg font-semibold ${colors.text}`}>Son İşlemler</Text>
          <Link href="/screens/allTransactions" asChild>
            <TouchableOpacity>
              <Text className={`text-lg font-semibold ${colors.textFaint}`}>Tümünü Gör</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* ── İşlem Listesi ── */}
        <View className="mb-6 mt-4">
          {transactions.length === 0 ? (
            <Text className={`mt-8 text-center ${colors.textMuted}`}>Henüz işlem eklenmedi.</Text>
          ) : (
            transactions.map((item) => {
              const iconData = categoryIconMap[item.category] ?? {
                icon: 'shape-outline',
                color: 'gray',
                iconLib: 'mci',
              };
              return (
                <TransactionCard
                  key={item.id}
                  name={item.note || item.category}
                  icon={iconData.icon}
                  iconLib={iconData.iconLib ?? 'mci'}
                  color={iconData.color}
                  amount={formatCurrency(item.amount)}
                  date={new Date(item.date).toLocaleDateString('tr-TR')}
                  category={item.category}
                />
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
