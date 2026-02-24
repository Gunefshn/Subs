import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PieChart, BarChart } from 'react-native-gifted-charts';
import { useAnalytics } from '../../src/hooks/useAnalytics';

type FilterType = 'Bu Ay' | 'Geçen Ay' | 'Bu Yıl';

export default function AnalyticsScreen() {
  const [selectedTab, setSelectedTab] = useState<FilterType>('Bu Ay');
  const { categoryData, dailyData, totalExpense, periodLabel, loading } = useAnalytics(selectedTab);

  const formatCurrency = (amount: number) =>
    `₺${amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`;

  const pieData = categoryData.map((item) => ({
    value: item.percentage,
    color: item.color,
    text: `%${item.percentage}`,
    label: item.category,
  }));

  const maxValue = Math.max(...dailyData.map((d) => d.total), 1);
  const barData = dailyData.map((d) => ({
    value: d.total,
    label: d.day,
    frontColor: d.total === maxValue ? '#FFFFFF' : '#334155',
    topLabelComponent:
      d.total === maxValue
        ? () => (
            <Text style={{ color: 'white', fontSize: 9, marginBottom: 2 }}>
              {formatCurrency(d.total)}
            </Text>
          )
        : undefined,
  }));

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-gray-900">
        <ActivityIndicator size="large" color="#3B82F6" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {/* Başlık */}
        <Text className="mb-6 text-center text-2xl font-bold text-white">
          Analiz & İstatistikler
        </Text>

        {/* Tab Switcher */}
        <View className="mb-6 flex-row rounded-2xl border border-gray-700 bg-gray-900 p-1">
          {(['Bu Ay', 'Geçen Ay', 'Bu Yıl'] as FilterType[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setSelectedTab(tab)}
              className={`flex-1 items-center justify-center rounded-xl py-2 ${
                selectedTab === tab ? 'bg-gray-700' : ''
              }`}>
              <Text
                className={`text-sm font-semibold ${
                  selectedTab === tab ? 'text-white' : 'text-gray-500'
                }`}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Dönem & Toplam */}
        <View className="mb-8 flex-row justify-between px-2">
          <View>
            <Text className="text-sm text-gray-500">Harcama Dönemi</Text>
            <Text className="text-lg font-bold text-white">{periodLabel}</Text>
          </View>
          <View className="items-end">
            <Text className="text-sm text-gray-500">Toplam Tutar</Text>
            <Text className="text-2xl font-bold text-white">{formatCurrency(totalExpense)}</Text>
          </View>
        </View>

        {/* Pie Chart + Legend */}
        {pieData.length === 0 ? (
          <View className="items-center justify-center py-12">
            <Text className="text-gray-500">Bu dönemde harcama yok.</Text>
          </View>
        ) : (
          <View className="mb-10 flex-row items-center">
            <PieChart
              data={pieData}
              donut
              radius={90}
              innerRadius={55}
              innerCircleColor="#111827"
            />
            <View className="ml-6 flex-1">
              {categoryData.map((item, index) => (
                <View key={index} className="mb-2 flex-row items-center">
                  <View
                    style={{ backgroundColor: item.color }}
                    className="mr-2 h-3 w-3 rounded-full"
                  />
                  <Text className="text-xs text-gray-400">
                    %{item.percentage} {item.category}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Bar Chart — sadece Bu Ay'da göster */}
        {selectedTab === 'Bu Ay' && (
          <View className="mb-24">
            <Text className="mb-4 font-semibold text-gray-500">Son 7 Gün</Text>
            {dailyData.every((d) => d.total === 0) ? (
              <Text className="py-8 text-center text-gray-500">Bu dönemde veri yok.</Text>
            ) : (
              <BarChart
                data={barData}
                barWidth={28}
                spacing={16}
                roundedTop
                hideRules
                yAxisThickness={0}
                xAxisThickness={0}
                hideYAxisText
                xAxisLabelTextStyle={{ color: '#94a3b8', fontSize: 11 }}
                noOfSections={4}
              />
            )}
          </View>
        )}

        {/* Geçen Ay ve Bu Yıl'da alt boşluk */}
        {selectedTab !== 'Bu Ay' && <View className="mb-24" />}
      </ScrollView>
    </SafeAreaView>
  );
}
