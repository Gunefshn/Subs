import { View, ScrollView, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Fontisto } from '@expo/vector-icons';
import { Link } from 'expo-router';
import TransactionCard from '../components/TransactionCard';
import { useUser } from '../../src/hooks/useUser';
import { useTransactions } from '../../src/hooks/useTransactions';
import { convertCurrency, formatAmount } from '../../src/lib/exchange';
import { useAppContext } from '../../src/contexts/AppContext';
import { useTheme } from '../../src/hooks/useTheme';

// Kategori → ikon eşleştirmesi
const categoryIconMap: Record<string, { icon: string; color: string }> = {
  Market: { icon: 'shopping-cart', color: 'green' },
  Yemek: { icon: 'shop', color: 'orange' },
  Ulaşım: { icon: 'car', color: 'blue' },
  Fatura: { icon: 'drop', color: 'blue' },
  Spor: { icon: 'dribbble', color: 'orange' },
  Eğlence: { icon: 'tv', color: 'red' },
  'Dijital Servis': { icon: 'tv', color: 'red' },
  Gelir: { icon: 'attach-money', color: 'green' },
  Diğer: { icon: 'dots-three-horizontal', color: 'gray' },
};

export default function Dashboard() {
  const { profile, loading: profileLoading } = useUser();
  const { transactions, summary, loading: txLoading } = useTransactions(5);
  const { currency, rates } = useAppContext();
  const { colors, isDark } = useTheme();
  const isLoading = profileLoading || txLoading;

  // Para formatı
  const formatCurrency = (amountInTRY: number) => {
    const converted = convertCurrency(amountInTRY, currency, rates);
    return formatAmount(converted, currency);
  };

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
        {/* Kullanıcı adı */}
        <Text className={`mt-10 self-center text-2xl font-semibold ${colors.text}`}>
          Merhaba <Text className="italic">{profile?.full_name?.split(' ')[0] ?? 'Kullanıcı'}</Text>
        </Text>

        {/* Bakiye Kartı */}
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

        {/* Info Box */}
        <View
          className={`mt-4 w-5/6 self-center rounded-2xl ${colors.card} p-4`}
          style={{ shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 }}>
          <View className="flex-row items-center px-2">
            <Fontisto name="info" size={16} color={colors.icon} style={{ marginRight: 8 }} />
            <Text className={`text-sm ${colors.textMuted}`}>
              {transactions.length === 0
                ? 'Henüz işlem bulunmuyor.'
                : `Son ${transactions.length} işleminiz listeleniyor.`}
            </Text>
          </View>
        </View>

        {/* Son İşlemler */}
        <View className="mt-6 flex-row items-center justify-between px-12">
          <Text className={`text-lg font-semibold ${colors.text}`}>Son İşlemler</Text>
          <Link href="/screens/allTransactions" asChild>
            <TouchableOpacity>
              <Text className={`text-lg font-semibold ${colors.textFaint}`}>Tümünü Gör</Text>
            </TouchableOpacity>
          </Link>
        </View>

        <View className="mb-6 mt-4">
          {transactions.length === 0 ? (
            <Text className={`mt-8 text-center ${colors.textMuted}`}>Henüz işlem eklenmedi.</Text>
          ) : (
            transactions.map((item) => {
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
