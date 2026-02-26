import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PieChart } from 'react-native-gifted-charts';
import { useTheme } from '../../src/hooks/useTheme';
import { useAppContext } from '../../src/contexts/AppContext';
import { convertCurrency, formatAmount } from '../../src/lib/exchange';
import { GROUP_SHORT_NAMES, useAnalytics } from '../../src/hooks/useAnalytics';
type FilterType = 'Bu Ay' | 'Geçen Ay' | 'Bu Yıl';

export default function AnalyticsScreen() {
  const [selectedTab, setSelectedTab] = useState<FilterType>('Bu Ay');
  const { categoryData, dailyData, totalExpense, periodLabel, loading } = useAnalytics(selectedTab);
  const { colors, isDark } = useTheme();
  const { currency, rates } = useAppContext();

  const formatCurrency = (amountInTRY: number) => {
    const converted = convertCurrency(amountInTRY, currency, rates);
    return formatAmount(converted, currency);
  };

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
    frontColor:
      d.total === maxValue ? (isDark ? '#FFFFFF' : '#111827') : isDark ? '#334155' : '#cbd5e1',
    topLabelComponent:
      d.total === maxValue
        ? () => (
            <Text style={{ color: isDark ? 'white' : '#111827', fontSize: 9, marginBottom: 2 }}>
              {formatCurrency(d.total)}
            </Text>
          )
        : undefined,
  }));

  if (loading) {
    return (
      <SafeAreaView className={`flex-1 items-center justify-center ${colors.bg}`}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${colors.bg}`}>
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {/* Başlık */}
        <Text className={`mb-6 text-center text-2xl font-bold ${colors.text}`}>
          Analiz & İstatistikler
        </Text>

        {/* Tab Switcher */}
        <View
          className="mb-6 flex-row rounded-2xl p-1"
          style={{
            backgroundColor: isDark ? '#111827' : '#f1f5f9',
            borderWidth: 1,
            borderColor: isDark ? '#374151' : '#e2e8f0',
          }}>
          {(['Bu Ay', 'Geçen Ay', 'Bu Yıl'] as FilterType[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setSelectedTab(tab)}
              className="flex-1 items-center justify-center rounded-xl py-2"
              style={{
                backgroundColor:
                  selectedTab === tab ? (isDark ? '#374151' : '#ffffff') : 'transparent',
                shadowColor: selectedTab === tab ? '#000' : 'transparent',
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: selectedTab === tab ? 2 : 0,
              }}>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '600',
                  color:
                    selectedTab === tab
                      ? isDark
                        ? '#ffffff'
                        : '#111827'
                      : isDark
                        ? '#6b7280'
                        : '#94a3b8',
                }}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Dönem & Toplam */}
        <View className="mb-8 flex-row justify-between px-2">
          <View>
            <Text className={`text-sm ${colors.textMuted}`}>Harcama Dönemi</Text>
            <Text className={`text-lg font-bold ${colors.text}`}>{periodLabel}</Text>
          </View>
          <View className="items-end">
            <Text className={`text-sm ${colors.textMuted}`}>Toplam Tutar</Text>
            <Text className={`text-2xl font-bold ${colors.text}`}>
              {formatCurrency(totalExpense)}
            </Text>
          </View>
        </View>

        {/* Pie Chart + Legend */}
        {pieData.length === 0 ? (
          <View className="items-center justify-center py-12">
            <Text className={colors.textMuted}>Bu dönemde harcama yok.</Text>
          </View>
        ) : (
          <View className="mb-10 flex-row items-center">
            <PieChart
              data={pieData}
              donut
              radius={90}
              innerRadius={55}
              innerCircleColor={isDark ? '#111827' : '#f8fafc'}
            />

            {/* İkili legend */}
            <View className="ml-4 flex-1">
              {Array.from({ length: Math.ceil(categoryData.length / 2) }).map((_, rowIndex) => {
                const left = categoryData[rowIndex * 2];
                const right = categoryData[rowIndex * 2 + 1];
                return (
                  <View key={rowIndex} className="mb-3 flex-row">
                    {/* Sol */}
                    <View className="flex-1">
                      <Text style={{ color: left.color, fontSize: 13, fontWeight: '700' }}>
                        %{left.percentage}
                      </Text>
                      <Text className={`text-xs ${colors.textMuted}`} numberOfLines={1}>
                        {GROUP_SHORT_NAMES[left.category] ?? left.category}
                      </Text>
                    </View>
                    {/* Sağ */}
                    {right && (
                      <View className="flex-1">
                        <Text style={{ color: right.color, fontSize: 13, fontWeight: '700' }}>
                          %{right.percentage}
                        </Text>
                        <Text className={`text-xs ${colors.textMuted}`} numberOfLines={1}>
                          {right.category}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Bar Chart */}
        {selectedTab === 'Bu Ay' && (
          <View className="mb-24">
            <Text className={`mb-4 font-semibold ${colors.textMuted}`}>Son 7 Gün</Text>
            {dailyData.every((d) => d.total === 0) ? (
              <Text className={`py-8 text-center ${colors.textMuted}`}>Bu dönemde veri yok.</Text>
            ) : (
              <View className="flex-row items-end justify-between px-1" style={{ height: 180 }}>
                {dailyData.map((d, index) => {
                  const maxValue = Math.max(...dailyData.map((x) => x.total));
                  const isMax = d.total === maxValue && d.total > 0;
                  const barHeight =
                    maxValue > 0 ? Math.max((d.total / maxValue) * 150, d.total > 0 ? 6 : 2) : 2;

                  const barColor = isMax
                    ? isDark
                      ? '#ffffff'
                      : '#111827'
                    : isDark
                      ? '#1e293b'
                      : '#e2e8f0';

                  return (
                    <View
                      key={index}
                      className="flex-1 items-center justify-end"
                      style={{ marginHorizontal: 5 }}>
                      <View
                        style={{
                          width: '55%',
                          height: barHeight,
                          backgroundColor: barColor,
                          borderTopLeftRadius: 3,
                          borderTopRightRadius: 3,
                        }}
                      />
                      <Text
                        style={{
                          marginTop: 8,
                          fontSize: 11,
                          color: isMax
                            ? isDark
                              ? '#ffffff'
                              : '#111827'
                            : isDark
                              ? '#475569'
                              : '#94a3b8',
                          fontWeight: isMax ? '700' : '400',
                        }}>
                        {d.day}
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}
        {selectedTab !== 'Bu Ay' && <View className="mb-24" />}
      </ScrollView>
    </SafeAreaView>
  );
}
