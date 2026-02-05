import React from 'react';
import { Modal, View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  category: string;
  date: string;
  note?: string | null;
  type: 'expense' | 'income';
  created_at: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onDelete: (id: string) => void;
}

export default function TransactionDetailModal({ visible, onClose, transaction, onDelete }: Props) {
  if (!transaction) return null;

  const handleDelete = () => {
    Alert.alert('İşlemi Sil', 'Bu kaydı silmek istediğinize emin misin?', [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: () => {
          onDelete(transaction.id);
          onClose();
        },
      },
    ]);
  };

  const formattedDate = new Date(transaction.date).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const isIncome = transaction.type === 'income';

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/50">
        <TouchableOpacity className="absolute inset-0" onPress={onClose} />

        <View className="h-[85%] rounded-t-3xl bg-white p-6">
          <View className="mb-6 h-1 w-12 self-center rounded-full bg-slate-200" />

          <View className="mb-6 flex-row items-center justify-between">
            <Text className="text-xl font-bold text-slate-800">İşlem Detayı</Text>
            <TouchableOpacity onPress={onClose} className="rounded-full bg-slate-100 p-2">
              <Text className="px-2 font-bold text-slate-500">✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerClassName="items-center pb-10">
            <View
              className={`mb-4 h-20 w-20 items-center justify-center rounded-3xl ${isIncome ? 'bg-green-100' : 'bg-slate-100'}`}>
              <Text className="text-4xl">{isIncome ? '💰' : '🛒'}</Text>
            </View>

            <Text
              className={`mb-2 text-4xl font-bold tracking-tighter ${isIncome ? 'text-green-600' : 'text-slate-900'}`}>
              {isIncome ? '+' : '-'}
              {transaction.amount} ₺
            </Text>

            <Text className="mb-1 text-xl font-semibold text-slate-800">
              {transaction.category}
            </Text>
            <Text className="mb-6 text-slate-500">{formattedDate}</Text>

            {transaction.note && (
              <View className="mb-6 w-full rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <Text className="mb-1 text-xs font-bold uppercase text-slate-400">Not</Text>
                <Text className="leading-6 text-slate-700">{transaction.note}</Text>
              </View>
            )}

            <View className="mt-4 w-full flex-row gap-4">
              <TouchableOpacity
                className="flex-1 items-center rounded-2xl bg-blue-50 py-4"
                onPress={() => Alert.alert('Bilgi', 'Düzenleme yakında eklenecek.')}>
                <Text className="text-lg font-bold text-blue-600">Düzenle</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 items-center rounded-2xl bg-red-50 py-4"
                onPress={handleDelete}>
                <Text className="text-lg font-bold text-red-600">Sil</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
