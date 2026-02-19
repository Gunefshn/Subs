import React from "react";
import { View, Text } from "react-native";
import { Entypo, FontAwesome5, MaterialIcons } from "@expo/vector-icons";

type Props = {
  name: string;
  icon: string;
  color: string;
  amount: number;
  date: string;
  category: string;
};

export default function TransactionCard({ name, icon, color, amount, date, category }: Props) {
  return (
    <View className="bg-white rounded-2xl p-4 mt-4 w-5/6 h-20 self-center">
      <View className="flex-row justify-between items-center">

        {/* Sol taraf: ikon + isim + category */}
        <View className="flex-row items-center">
          <Entypo name={icon as any} size={25} color={color} />
          <View className="ml-2 flex-col">
            <Text className="text-xl font-semibold text-black">{name}</Text>
            <Text className="text-lg text-gray-500">{category}</Text>
          </View>

        </View>

        {/* Sağ taraf: ücret + tarih */}
        <View className="items-end">
          <Text className="text-xl font-bold text-black">{amount}</Text>
          <Text className="text-lg text-gray-500">{date}</Text>
        </View>

      </View>
    </View>
  );
}