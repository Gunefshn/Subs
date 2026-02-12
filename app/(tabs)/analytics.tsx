import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { PieChart, BarChart } from 'react-native-gifted-charts';
import { useColorScheme } from 'nativewind';

const screenWidth = Dimensions.get('window').width;

const Colors = {
  dark: {
    bg: '#0F172A',
    card: '#1E293B',
    text: '#FFFFFF',
    subText: '#94A3B8',
  },
  light: {
    bg: '#F8FAFC',
    card: '#FFFFFF',
    text: '#0F172A',
    subText: '#64748B',
  },
};

const TabButton = ({
  title,
  selectedTab,
  setSelectedTab,
  isDark,
}: {
  title: string;
  selectedTab: string;
  setSelectedTab: (t: string) => void;
  isDark: boolean;
}) => (
  <TouchableOpacity
    onPress={() => setSelectedTab(title)}
    className={`flex-1 items-center justify-center rounded-xl py-2 ${
      selectedTab === title ? 'bg-slate-800 dark:bg-slate-700' : 'bg-transparent'
    }`}>
    <Text
      className={`font-semibold ${
        selectedTab === title ? 'text-white' : 'text-slate-500 dark:text-slate-400'
      }`}>
      {title}
    </Text>
  </TouchableOpacity>
);

export default function AnalyticsScreen() {
  const [selectedTab, setSelectedTab] = useState('Bu Ay');
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const theme = isDark ? Colors.dark : Colors.light;

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

  return (
    <View className="flex-1 bg-slate-50 px-4 pt-12 dark:bg-[#0F172A]">
      <Text className="mb-6 text-center text-2xl font-bold text-slate-900 dark:text-white">
        Analiz & İstatistikler
      </Text>

      <View className="mb-6 flex-row rounded-2xl border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-[#0F172A]">
        <TabButton
          title="Bu Ay"
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
          isDark={isDark}
        />
        <TabButton
          title="Geçen Ay"
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
          isDark={isDark}
        />
        <TabButton
          title="Bu Yıl"
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
          isDark={isDark}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="mb-8 flex-row justify-between px-2">
          <View>
            <Text className="mb-1 text-sm text-slate-500 dark:text-slate-400">Harcama Dönemi</Text>
            <Text className="text-lg font-bold text-slate-900 dark:text-white">Ocak Ayı</Text>
          </View>

          <View className="items-end">
            <Text className="mb-1 text-right text-sm text-slate-500 dark:text-slate-400">
              Toplam Tutar
            </Text>
            <Text className="text-2xl font-bold text-slate-900 dark:text-white">₺8.630,75</Text>
          </View>
        </View>

        <View className="mb-10 flex-row items-center justify-between">
          <View>
            <PieChart
              data={pieData}
              donut
              radius={80}
              innerRadius={50}
              innerCircleColor={theme.bg}
              centerLabelComponent={() => <View />}
            />
          </View>

          <View className="ml-6 flex-1 space-y-3">
            {pieData.map((item, index) => (
              <View key={index} className="flex-row items-center">
                <View
                  style={{ backgroundColor: item.color }}
                  className="mr-2 h-3 w-3 rounded-full"
                />
                <Text className="mr-2 text-xs text-slate-500 dark:text-slate-400">{item.text}</Text>
                <Text
                  className="text-xs font-medium text-slate-800 dark:text-white"
                  numberOfLines={1}>
                  {item.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="mb-20">
          <Text className="mb-6 font-semibold text-slate-500 dark:text-slate-400">Son 7 Gün</Text>

          <BarChart
            data={barData}
            barWidth={22}
            spacing={20}
            roundedTop
            roundedBottom
            hideRules
            xAxisThickness={0}
            yAxisThickness={0}
            yAxisTextStyle={{ color: 'transparent' }}
            xAxisLabelTextStyle={{ color: theme.subText, fontSize: 12 }}
            noOfSections={3}
            maxValue={600}
          />
        </View>
      </ScrollView>
    </View>
  );
}
