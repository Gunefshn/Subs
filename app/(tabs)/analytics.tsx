import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { PieChart, BarChart } from 'react-native-gifted-charts';
import { useColorScheme } from 'nativewind';
// import { supabase } from '../../lib/supabase'; // ⚠️ Key'ler gelince bu satır açılacak ve fetchRealData fonksiyonu güncellenecek. Şimdilik mock data kullanılıyor.

export default function AnalyticsScreen() {
  const [selectedTab, setSelectedTab] = useState('Bu Ay');
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [loading, setLoading] = useState(true);
  const [totalExpense, setTotalExpense] = useState(0);

  useEffect(() => {
    fetchRealData();
  }, []);

  const fetchRealData = async () => {
    try {
      setLoading(true);
      setTimeout(() => {
        setTotalExpense(8630.75);
        setLoading(false);
      }, 1000);
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  const pieData = [
    { value: 32, color: '#3B82F6', text: '%32', label: 'Kira & Fatura' },
    { value: 21, color: '#22C55E', text: '%21', label: 'Alış. & Market' },
    { value: 17, color: '#EAB308', text: '%17', label: 'Eğl. & Yemek' },
    { value: 12, color: '#EF4444', text: '%12', label: 'Dijital & Oyun' },
    { value: 10, color: '#F97316', text: '%10', label: 'Sağlık & Spor' },
    { value: 8, color: '#A855F7', text: '%8', label: 'Eğit. & Ulaşım' },
  ];

  const barData = [
    { value: 150, label: 'Cum', frontColor: isDark ? '#64748B' : '#CBD5E1' },
    { value: 250, label: 'Cmt', frontColor: isDark ? '#64748B' : '#CBD5E1' },
    { value: 350, label: 'Paz', frontColor: isDark ? '#64748B' : '#CBD5E1' },
    { value: 200, label: 'Pzt', frontColor: isDark ? '#64748B' : '#CBD5E1' },
    { value: 500, label: 'Sal', frontColor: isDark ? '#FFFFFF' : '#3B82F6' },
    { value: 320, label: 'Çrş', frontColor: isDark ? '#64748B' : '#CBD5E1' },
    { value: 180, label: 'Prş', frontColor: isDark ? '#64748B' : '#CBD5E1' },
  ];

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50 dark:bg-[#0F172A]">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50 px-4 pt-12 dark:bg-[#0F172A]">
      <Text className="mb-6 text-center text-2xl font-bold text-slate-900 dark:text-white">
        Analiz & İstatistikler
      </Text>

      <View className="mb-6 flex-row rounded-2xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-[#0F172A]">
        {['Bu Ay', 'Geçen Ay', 'Bu Yıl'].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setSelectedTab(tab)}
            className={`flex-1 items-center justify-center rounded-xl py-2 ${
              selectedTab === tab ? 'bg-slate-800 dark:bg-slate-700' : ''
            }`}>
            <Text
              className={`font-semibold ${selectedTab === tab ? 'text-white' : 'text-slate-500'}`}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="mb-8 flex-row justify-between px-2">
          <View>
            <Text className="text-sm text-slate-500">Harcama Dönemi</Text>
            <Text className="text-lg font-bold dark:text-white">Ocak Ayı</Text>
          </View>
          <View className="items-end">
            <Text className="text-right text-sm text-slate-500">Toplam Tutar</Text>
            <Text className="text-2xl font-bold dark:text-white">
              ₺{totalExpense.toLocaleString('tr-TR')}
            </Text>
          </View>
        </View>

        <View className="mb-10 flex-row items-center justify-between">
          <PieChart
            data={pieData}
            donut
            radius={80}
            innerRadius={50}
            innerCircleColor={isDark ? '#0F172A' : '#F8FAFC'}
          />
          <View className="ml-6 flex-1 space-y-3">
            {pieData.map((item, index) => (
              <View key={index} className="flex-row items-center">
                <View
                  style={{ backgroundColor: item.color }}
                  className="mr-2 h-3 w-3 rounded-full"
                />
                <Text className="text-xs dark:text-slate-400">
                  {item.text} {item.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="mb-20">
          <Text className="mb-6 font-semibold text-slate-500">Son 7 Gün</Text>
          <BarChart
            data={barData}
            barWidth={22}
            spacing={20}
            roundedTop
            hideRules
            yAxisThickness={0}
            xAxisThickness={0}
            hideYAxisText
          />
        </View>
      </ScrollView>
    </View>
  );
}
