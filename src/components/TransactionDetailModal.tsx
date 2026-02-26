import React from 'react';
import { Modal, View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { useAppContext } from '../contexts/AppContext';
import { convertCurrency, formatAmount } from '../lib/exchange';
import { transactionEvents } from '../hooks/useTransactions';
import { supabase } from '../lib/supabase';

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
  onDelete?: (id: string) => void; // opsiyonel — artık içeride hallediyoruz
}

const categoryIconConfig: Record<string, { icon: string; color: string; bgColor: string }> = {
  Market: { icon: 'cart-outline', color: '#F97316', bgColor: '#F9731620' },
  Yemek: { icon: 'silverware-fork-knife', color: '#EAB308', bgColor: '#EAB30820' },
  Ulaşım: { icon: 'train-variant', color: '#6366F1', bgColor: '#6366F120' },
  Fatura: { icon: 'water', color: '#06B6D4', bgColor: '#06B6D420' },
  Spor: { icon: 'basketball', color: '#EC4899', bgColor: '#EC489920' },
  Eğlence: { icon: 'glass-cocktail', color: '#8B5CF6', bgColor: '#8B5CF620' },
  'Dijital Servis': { icon: 'play-box-outline', color: '#EF4444', bgColor: '#EF444420' },
  Kira: { icon: 'key-outline', color: '#10B981', bgColor: '#10B98120' },
  Oyun: { icon: 'controller-classic-outline', color: '#14B8A6', bgColor: '#14B8A620' },
  Sağlık: { icon: 'pill', color: '#F43F5E', bgColor: '#F43F5E20' },
  Alışveriş: { icon: 'tag-outline', color: '#3B82F6', bgColor: '#3B82F620' },
  Eğitim: { icon: 'school-outline', color: '#F59E0B', bgColor: '#F59E0B20' },
  Maaş: { icon: 'briefcase-outline', color: '#10B981', bgColor: '#10B98120' },
  'Ek İş': { icon: 'hammer-wrench', color: '#10B981', bgColor: '#10B98120' },
  'Kira Geliri': { icon: 'home-outline', color: '#10B981', bgColor: '#10B98120' },
  'İade Ücreti': { icon: 'cash-refund', color: '#10B981', bgColor: '#10B98120' },
  Prim: { icon: 'gift-outline', color: '#10B981', bgColor: '#10B98120' },
  Satış: { icon: 'tag-outline', color: '#10B981', bgColor: '#10B98120' },
  Yatırım: { icon: 'trending-up', color: '#10B981', bgColor: '#10B98120' },
  Diğer: { icon: 'shape-outline', color: '#94A3B8', bgColor: '#94A3B820' },
};

export default function TransactionDetailModal({ visible, onClose, transaction, onDelete }: Props) {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { currency, rates } = useAppContext();

  if (!transaction) return null;

  const isIncome = transaction.type === 'income';
  const cfg = categoryIconConfig[transaction.category] ?? {
    icon: 'shape-outline',
    color: '#94A3B8',
    bgColor: '#94A3B820',
  };

  const displayAmount = formatAmount(
    convertCurrency(transaction.amount, currency, rates),
    currency
  );

  const formattedDate = new Date(transaction.date).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handleDelete = () => {
    Alert.alert('İşlemi Sil', 'Bu kaydı silmek istediğinize emin misin?', [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          try {
            const { error } = await supabase.from('transactions').delete().eq('id', transaction.id);
            if (error) throw error;
            transactionEvents.emit();
            onDelete?.(transaction.id);
            onClose();
          } catch (e: any) {
            Alert.alert('Silme Hatası', e.message);
          }
        },
      },
    ]);
  };

  const handleEdit = () => {
    onClose();
    router.push({
      pathname: '/(tabs)/addTransactions',
      params: {
        mode: 'edit',
        id: transaction.id,
        amount: transaction.amount.toString(),
        category: transaction.category,
        date: transaction.date,
        note: transaction.note || '',
        type: transaction.type,
      },
    });
  };

  // Tema renkleri
  const modalBg = isDark ? '#111827' : '#ffffff';
  const handleColor = isDark ? '#374151' : '#e2e8f0';
  const cardBg = isDark ? '#1f2937' : '#f8fafc';
  const cardBorder = isDark ? '#374151' : '#e2e8f0';
  const labelColor = isDark ? '#6b7280' : '#94a3b8';
  const textColor = isDark ? '#ffffff' : '#1e293b';
  const mutedColor = isDark ? '#9ca3af' : '#64748b';
  const editBg = isDark ? '#1e3a5f' : '#eff6ff';
  const editText = isDark ? '#93c5fd' : '#2563eb';
  const deleteBg = isDark ? '#450a0a' : '#fff1f2';
  const deleteText = isDark ? '#fca5a5' : '#dc2626';

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <TouchableOpacity
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          onPress={onClose}
        />

        <View
          style={{
            height: '80%',
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            backgroundColor: modalBg,
            padding: 24,
          }}>
          {/* Handle */}
          <View
            style={{
              width: 48,
              height: 4,
              borderRadius: 2,
              backgroundColor: handleColor,
              alignSelf: 'center',
              marginBottom: 24,
            }}
          />

          {/* Başlık */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 24,
            }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: textColor }}>İşlem Detayı</Text>
            <TouchableOpacity
              onPress={onClose}
              style={{
                backgroundColor: cardBg,
                borderRadius: 20,
                width: 36,
                height: 36,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: cardBorder,
              }}>
              <Text style={{ color: mutedColor, fontWeight: 'bold' }}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ alignItems: 'center', paddingBottom: 40 }}>
            {/* Kategori İkonu */}
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 24,
                backgroundColor: cfg.bgColor,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
              }}>
              <MaterialCommunityIcons name={cfg.icon as any} size={40} color={cfg.color} />
            </View>

            {/* Tutar */}
            <Text
              style={{
                fontSize: 36,
                fontWeight: 'bold',
                color: isIncome ? '#10b981' : textColor,
                marginBottom: 8,
                letterSpacing: -1,
              }}>
              {isIncome ? '+' : '-'}
              {displayAmount}
            </Text>

            {/* Kategori */}
            <Text style={{ fontSize: 18, fontWeight: '600', color: textColor, marginBottom: 4 }}>
              {transaction.category}
            </Text>

            {/* Tarih */}
            <Text style={{ color: mutedColor, marginBottom: 24 }}>{formattedDate}</Text>

            {/* Not */}
            {transaction.note ? (
              <View
                style={{
                  width: '100%',
                  borderRadius: 16,
                  backgroundColor: cardBg,
                  borderWidth: 1,
                  borderColor: cardBorder,
                  padding: 16,
                  marginBottom: 24,
                }}>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: 'bold',
                    color: labelColor,
                    marginBottom: 6,
                    letterSpacing: 1,
                  }}>
                  NOT
                </Text>
                <Text style={{ color: textColor, lineHeight: 22 }}>{transaction.note}</Text>
              </View>
            ) : null}

            {/* Tür */}
            <View
              style={{
                width: '100%',
                borderRadius: 16,
                backgroundColor: cardBg,
                borderWidth: 1,
                borderColor: cardBorder,
                padding: 16,
                marginBottom: 24,
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}>
              <Text style={{ color: labelColor, fontWeight: '600' }}>Tür</Text>
              <Text style={{ color: isIncome ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>
                {isIncome ? 'Gelir' : 'Gider'}
              </Text>
            </View>

            {/* Düzenle / Sil */}
            <View style={{ width: '100%', flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  alignItems: 'center',
                  borderRadius: 16,
                  backgroundColor: editBg,
                  paddingVertical: 16,
                }}
                onPress={handleEdit}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: editText }}>Düzenle</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  alignItems: 'center',
                  borderRadius: 16,
                  backgroundColor: deleteBg,
                  paddingVertical: 16,
                }}
                onPress={handleDelete}>
                <Text style={{ fontSize: 16, fontWeight: 'bold', color: deleteText }}>Sil</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
