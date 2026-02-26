import React from 'react';
import { View, Text } from 'react-native';
import { Entypo } from '@expo/vector-icons';
import { useTheme } from '@/src/hooks/useTheme';

type Props = {
  name: string;
  icon: string;
  color: string;
  amount: string;
  date: string;
  category: string;
};

const colorMap: Record<string, string> = {
  green: '#16a34a',
  red: '#dc2626',
  blue: '#3b82f6',
  orange: '#f97316',
  purple: '#a855f7',
  gray: '#6b7280',
};

const bgColorMapDark: Record<string, string> = {
  green: '#14532d33',
  red: '#7f1d1d33',
  blue: '#1e3a5f33',
  orange: '#7c2d1233',
  purple: '#3b076433',
  gray: '#37415133',
};

const bgColorMapLight: Record<string, string> = {
  green: '#dcfce7',
  red: '#fee2e2',
  blue: '#dbeafe',
  orange: '#ffedd5',
  purple: '#f3e8ff',
  gray: '#f3f4f6',
};

export default function TransactionCard({ name, icon, color, amount, date, category }: Props) {
  const { isDark } = useTheme();
  const iconColor = colorMap[color] ?? '#6b7280';
  const iconBg = isDark
    ? (bgColorMapDark[color] ?? '#37415133')
    : (bgColorMapLight[color] ?? '#f3f4f6');

  return (
    <View
      className={`mx-4 mb-3 rounded-2xl p-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}
      style={{ shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 }}>
      <View className="flex-row items-center justify-between">
        {/* Sol: ikon + isim + kategori */}
        <View className="flex-1 flex-row items-center">
          <View
            className="mr-3 items-center justify-center rounded-full"
            style={{ width: 44, height: 44, backgroundColor: iconBg }}>
            <Entypo name={icon as any} size={22} color={iconColor} />
          </View>
          <View>
            <Text className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {name}
            </Text>
            <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {category}
            </Text>
          </View>
        </View>

        {/* Sağ: tutar + tarih */}
        <View className="items-end">
          <Text className={`text-base font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {amount}
          </Text>
          <Text className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{date}</Text>
        </View>
      </View>
    </View>
  );
}
