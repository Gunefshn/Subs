import { View, ScrollView, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Fontisto } from '@expo/vector-icons';
import { Link } from 'expo-router';
import TransactionCard from '../components/TransactionCard';
import { useUser } from '../../src/hooks/useUser';
import { useTransactions } from '../../src/hooks/useTransactions';

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
  const { transactions, summary, loading: txLoading } = useTransactions();

  const isLoading = profileLoading || txLoading;

  // Para formatı
  const formatCurrency = (amount: number) =>
    `₺${amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`;

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-900">
        <ActivityIndicator size="large" color="#ffffff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Kullanıcı adı */}
        <Text className="mt-10 self-center text-2xl font-semibold text-white">
          Merhaba <Text className="italic">{profile?.full_name?.split(' ')[0] ?? 'Kullanıcı'}</Text>
        </Text>

        {/* Bakiye Kartı */}
        <View className="mt-6 w-5/6 self-center rounded-2xl bg-gray-800 p-4">
          <View className="flex-row items-center justify-between">
            <Text className="mt-3 px-4 text-lg font-semibold text-gray-400">Toplam Bakiye</Text>
            <TouchableOpacity className="mt-3 rounded-xl bg-gray-700 px-5 py-1">
              <Text className="text-sm font-semibold text-gray-300">
                {profile?.currency_preference ?? 'TRY'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text className="mt-6 px-4 text-3xl font-semibold text-white">
            {formatCurrency(summary.balance)}
          </Text>

          {/* Gelir / Gider */}
          <View className="mb-2 mt-8 flex-row justify-between">
            <View className="flex-row items-center px-4">
              <Feather name="arrow-up-right" size={20} color="#16a34a" />
              <Text className="ml-1 font-semibold text-gray-400">
                Gelir:{' '}
                <Text className="font-bold text-white">{formatCurrency(summary.totalIncome)}</Text>
              </Text>
            </View>
            <View className="flex-row items-center px-4">
              <Feather name="arrow-down-right" size={20} color="#dc2626" />
              <Text className="ml-1 font-semibold text-gray-400">
                Gider:{' '}
                <Text className="font-bold text-white">{formatCurrency(summary.totalExpense)}</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* Info Box */}
        <View className="mt-4 w-5/6 self-center rounded-2xl bg-gray-800 p-4">
          <View className="flex-row items-center px-2">
            <Fontisto name="info" size={16} color="#6b7280" style={{ marginRight: 8 }} />
            <Text className="text-sm text-gray-400">
              {transactions.length === 0
                ? 'Henüz işlem bulunmuyor.'
                : `Son ${transactions.length} işleminiz listeleniyor.`}
            </Text>
          </View>
        </View>

        {/* Son İşlemler */}
        <View className="mt-6 flex-row items-center justify-between px-12">
          <Text className="text-lg font-semibold text-white">Son İşlemler</Text>
          <Link href="/screens/allTransactions" asChild>
            <TouchableOpacity>
              <Text className="text-lg font-semibold text-gray-500">Tümünü Gör</Text>
            </TouchableOpacity>
          </Link>
        </View>

        <ScrollView className="mb-6 mt-4">
          {transactions.length === 0 ? (
            <Text className="mt-8 text-center text-gray-500">Henüz işlem eklenmedi.</Text>
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
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}
