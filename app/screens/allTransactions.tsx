import React from "react";
import { View, ScrollView, Text, TouchableOpacity } from "react-native";
import TransactionCard from "../components/TransactionCard";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const transactions = [
  { id: 0, name: "Macrocenter", icon: "shopping-cart", color: "green", amount: "₺783.50", date: "28.01.2026", category: "Market" },
  { id: 1, name: "HBO Max", icon: "tv", color: "red", amount: "₺229.90", date: "24.01.2026", category: "Dijital Servis" },
  { id: 2, name: "Pure Gym", icon: "dribbble", color: "orange", amount: "₺1150.00", date: "23.01.2026", category: "Spor" },
  { id: 3, name: "İSKİ", icon: "drop", color: "blue", amount: "₺345.25", date: "19.01.2026", category: "Fatura" },
  { id: 4, name: "Gail’s Bakery", icon: "shop", color: "orange", amount: "£240.00", date: "17.01.2026", category: "Yemek" },
  { id: 5, name: "DİĞER", icon: "shop", color: "orange", amount: "£240.00", date: "17.01.2026", category: "Diğer" },
];

export default function AllTransactions() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white">
      {/* Üst bar */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-200">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>

        <Text className="flex-1 text-center text-lg font-semibold text-black">
          Tüm İşlemler
        </Text>

        {/* Sağ taraf boş bırakıldı ki başlık ortalansın */}
        <View style={{ width: 24 }} />
      </View>

      {/* İşlemler listesi */}
      <ScrollView className="mt-4">
        <View className="mb-10">
          {transactions.map((tx) => (
            <TransactionCard
              key={tx.id}
              name={tx.name}
              icon={tx.icon}
              color={tx.color}
              amount={tx.amount}
              date={tx.date}
              category={tx.category}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}