import React from 'react';
import { View, Text } from 'react-native';
import { Entypo } from '@expo/vector-icons';

type Props = {
  name: string;
  icon: string;
  color: string;
  amount: string;
  date: string;
  category: string;
};

// Renk adını hex'e çevir
const colorMap: Record<string, string> = {
  green: '#16a34a',
  red: '#dc2626',
  blue: '#3b82f6',
  orange: '#f97316',
  purple: '#a855f7',
  gray: '#6b7280',
};

// Arka plan rengi (soluk ton)
const bgColorMap: Record<string, string> = {
  green: '#14532d33',
  red: '#7f1d1d33',
  blue: '#1e3a5f33',
  orange: '#7c2d1233',
  purple: '#3b0764 33',
  gray: '#37415133',
};

export default function TransactionCard({ name, icon, color, amount, date, category }: Props) {
  const iconColor = colorMap[color] ?? '#6b7280';
  const iconBg = bgColorMap[color] ?? '#37415133';

  return (
    <View className="mx-1 mt-3 rounded-2xl bg-gray-800 p-4" style={{ minHeight: 72 }}>
      <View className="flex-row items-center justify-between">
        {/* Sol: ikon + isim + kategori */}
        <View className="flex-1 flex-row items-center">
          <View
            className="mr-3 items-center justify-center rounded-full"
            style={{ width: 44, height: 44, backgroundColor: iconBg }}>
            <Entypo name={icon as any} size={22} color={iconColor} />
          </View>
          <View className="flex-col">
            <Text className="text-base font-semibold text-white">{name}</Text>
            <Text className="text-sm text-gray-400">{category}</Text>
          </View>
        </View>

        {/* Sağ: tutar + tarih */}
        <View className="items-end">
          <Text className="text-base font-bold text-white">{amount}</Text>
          <Text className="text-sm text-gray-400">{date}</Text>
        </View>
      </View>
    </View>
  );
}
