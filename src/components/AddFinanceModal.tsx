import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { useAppContext } from '../contexts/AppContext';
import { CURRENCY_SYMBOLS } from '../lib/exchange';

interface Props {
  visible: boolean;
  onClose: () => void;
  initialTab?: 'card' | 'sub';
  onSuccess: () => void;
  editItem?: any;
  editType?: 'card' | 'sub';
}

export default function AddFinanceModal({
  visible,
  onClose,
  initialTab = 'card',
  onSuccess,
  editItem,
  editType,
}: Props) {
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const { currency, rates } = useAppContext();
  const currencySymbol = CURRENCY_SYMBOLS[currency];

  const isEditMode = !!editItem;

  const [activeTab, setActiveTab] = useState<'card' | 'sub'>(initialTab);
  const [loading, setLoading] = useState(false);

  // --- Kredi Kartı State ---
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cutoffDay, setCutoffDay] = useState('1');
  const [cardBrand, setCardBrand] = useState('Mastercard');

  // --- Abonelik State ---
  const [subName, setSubName] = useState('');
  const [subCost, setSubCost] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Dijital Servis');
  const [renewalDay, setRenewalDay] = useState('1');

  useEffect(() => {
    if (!visible) return;

    if (editItem) {
      // Edit modunda formu mevcut verilerle doldur
      const tab = editType ?? initialTab;
      setActiveTab(tab);
      if (tab === 'card') {
        setCardName(editItem.card_name ?? '');
        setCardNumber(editItem.card_number ?? '');
        setCutoffDay(String(editItem.cutoff_day ?? 1));
        setCardBrand(editItem.card_brand ?? 'Mastercard');
      } else {
        setSubName(editItem.name ?? '');
        const costInTRY = editItem.cost ?? 0;
        const displayCost = currency === 'TRY' ? costInTRY : costInTRY * (rates[currency] ?? 1);
        setSubCost(String(displayCost));
        setSelectedCategory(editItem.category ?? 'Dijital Servis');
        setRenewalDay(String(editItem.renewal_day ?? 1));
      }
    } else {
      // Yeni ekleme — formu sıfırla
      setActiveTab(initialTab);
      setCardName('');
      setCardNumber('');
      setCutoffDay('1');
      setCardBrand('Mastercard');
      setSubName('');
      setSubCost('');
      setSelectedCategory('Dijital Servis');
      setRenewalDay('1');
    }
    // editItem obje referansı her seferinde yeni geldiği için JSON ile karşılaştır
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, editItem?.id, editType]);

  const categories = [
    { name: 'Yemek', icon: 'restaurant' },
    { name: 'Ulaşım', icon: 'car' },
    { name: 'Fatura', icon: 'document-text' },
    { name: 'Kira', icon: 'home' },
    { name: 'Eğlence', icon: 'game-controller' },
    { name: 'Sağlık', icon: 'medkit' },
    { name: 'Alışveriş', icon: 'cart' },
    { name: 'Market', icon: 'basket' },
    { name: 'Oyun', icon: 'game-controller' },
    { name: 'Spor', icon: 'barbell' },
    { name: 'Eğitim', icon: 'school' },
    { name: 'Dijital Servis', icon: 'tv' },
  ];

  const getDynamicDates = () => {
    const today = new Date();
    const selectedDay = parseInt(cutoffDay) || 1;
    const cutoffDate = new Date(today.getFullYear(), today.getMonth(), selectedDay);
    const dueDate = new Date(today.getFullYear(), today.getMonth(), selectedDay + 10);
    const format = (d: Date) =>
      `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
    return { cutoffFormatted: format(cutoffDate), dueFormatted: format(dueDate) };
  };

  const { cutoffFormatted, dueFormatted } = getDynamicDates();

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      if (activeTab === 'card') {
        const parsedCutoff = parseInt(cutoffDay);
        const cardData = {
          card_name: cardName,
          card_number: cardNumber,
          card_brand: cardBrand,
          cutoff_day: parsedCutoff,
          due_day: parsedCutoff + 10,
        };
        if (isEditMode) {
          console.log('KART GUNCELLEME id:', editItem?.id, 'tip:', typeof editItem?.id);
          const { data, error } = await supabase
            .from('credit_cards')
            .update(cardData)
            .eq('id', editItem.id)
            .select();
          console.log('Guncelleme sonucu data:', data, 'error:', error);
          if (error) throw error;
          if (!data || data.length === 0) {
            throw new Error('Kart guncellenemedi. ID eslesmedi: ' + editItem.id);
          }
        } else {
          const { error } = await supabase
            .from('credit_cards')
            .insert([{ user_id: user.id, ...cardData }]);
          if (error) throw error;
        }
      } else {
        // Kullanıcının girdiği tutarı TRY'ye çevirerek kaydet
        const rawCost = parseFloat(subCost || '0');
        const costInTRY = currency === 'TRY' ? rawCost : rawCost / (rates[currency] ?? 1);

        const subData = {
          name: subName,
          cost: costInTRY,
          renewal_day: parseInt(renewalDay),
          category: selectedCategory,
          active: true,
        };
        if (isEditMode) {
          const { error } = await supabase
            .from('subscriptions')
            .update(subData)
            .eq('id', editItem.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('subscriptions')
            .insert([{ user_id: user.id, ...subData }]);
          if (error) throw error;
        }
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      Alert.alert('Kayıt Hatası', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    const table = activeTab === 'card' ? 'credit_cards' : 'subscriptions';
    const itemName = activeTab === 'card' ? editItem?.card_name : editItem?.name;

    Alert.alert('Silmek istediğinize emin misiniz?', `"${itemName}" kalıcı olarak silinecek.`, [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            const { error } = await supabase.from(table).delete().eq('id', editItem.id);
            if (error) throw error;
            onSuccess();
            onClose();
          } catch (error: any) {
            Alert.alert('Silme Hatası', error.message);
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const getMaskedDisplayNumber = (num: string) => {
    const cleaned = num.replace(/\D/g, '');
    let res = '';
    for (let i = 0; i < 16; i++) {
      res += i < 12 ? '*' : cleaned[i] || '*';
      if ((i + 1) % 4 === 0 && i !== 15) res += ' ';
    }
    return res;
  };

  // ─── Tema değerleri ───────────────────────────────────────────────────────
  const inputTextColor = isDark ? '#ffffff' : '#111827';
  const placeholderColor = isDark ? '#6b7280' : '#9ca3af';
  const borderColorRaw = isDark ? '#374151' : '#e5e7eb';
  const pickerItemColor = Platform.OS === 'ios' ? (isDark ? 'white' : 'black') : 'black';
  const tabActiveBg = isDark ? '#374151' : '#111827';
  const tabActiveText = '#ffffff';
  const tabInactiveText = isDark ? '#9ca3af' : '#6b7280';
  const saveBtnBg = isDark ? '#ffffff' : '#111827';
  const saveBtnText = isDark ? '#111827' : '#ffffff';
  const catCircleActiveBg = isDark ? '#ffffff' : '#111827';
  const catIconActiveColor = isDark ? '#111827' : '#ffffff';
  const catIconInactiveColor = isDark ? '#ffffff' : '#374151';
  const cardGradientColors = isDark
    ? (['#1e293b', '#0f172a'] as const)
    : (['#D3D8DE', '#939598'] as const);
  const cardPreviewBorder = isDark ? '#334155' : '#a0a4a8';
  const cardInnerText = '#ffffff';

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className={`flex-1 pt-12 ${colors.bg}`}>
        {/* ── Header ── */}
        <View className="flex-row items-center justify-between px-4 pt-5">
          <Text className={`text-xl font-bold ${colors.text}`}>
            {isEditMode
              ? activeTab === 'card'
                ? 'Kartı Düzenle'
                : 'Aboneliği Düzenle'
              : activeTab === 'card'
                ? 'Kart Ekle'
                : 'Abonelik Ekle'}
          </Text>
          <TouchableOpacity
            onPress={onClose}
            className={`h-10 w-10 items-center justify-center rounded-full ${colors.card}`}
            style={{ borderWidth: 1, borderColor: borderColorRaw }}>
            <Ionicons name="close" size={24} color={colors.icon} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
          {/* ── Tab Bar — sadece yeni eklemede göster ── */}
          {!isEditMode && (
            <View
              className={`mb-5 flex-row rounded-2xl p-1 ${colors.card}`}
              style={{ borderWidth: 1, borderColor: borderColorRaw }}>
              <TouchableOpacity
                onPress={() => setActiveTab('card')}
                className="flex-1 items-center rounded-xl py-2.5"
                style={{ backgroundColor: activeTab === 'card' ? tabActiveBg : 'transparent' }}>
                <Text
                  className="font-bold"
                  style={{ color: activeTab === 'card' ? tabActiveText : tabInactiveText }}>
                  Kart Ekle
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActiveTab('sub')}
                className="flex-1 items-center rounded-xl py-2.5"
                style={{ backgroundColor: activeTab === 'sub' ? tabActiveBg : 'transparent' }}>
                <Text
                  className="font-bold"
                  style={{ color: activeTab === 'sub' ? tabActiveText : tabInactiveText }}>
                  Abonelik Ekle
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ════════════════════════════════
              KART FORMU
          ════════════════════════════════ */}
          {activeTab === 'card' ? (
            <View>
              {/* Kart Önizleme */}
              <LinearGradient
                colors={cardGradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={[styles.cardPreview, { borderColor: cardPreviewBorder }]}>
                <Text style={[styles.cardPreviewTitle, { color: cardInnerText }]}>
                  {cardName || 'Banka Adı'}
                </Text>
                <View
                  style={[styles.cardChip, { backgroundColor: isDark ? '#4A5568' : '#ffffff40' }]}
                />
                <View style={styles.cardBottomRow}>
                  <Text style={[styles.cardNumberText, { color: cardInnerText }]}>
                    {getMaskedDisplayNumber(cardNumber)}
                  </Text>
                  <View style={styles.cardLogoContainer}>
                    {cardBrand === 'Visa' ? (
                      <Text style={[styles.visaText, { color: cardInnerText }]}>VISA</Text>
                    ) : (
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={[styles.mastercardCircle, { backgroundColor: '#EF4444' }]} />
                        <View
                          style={[
                            styles.mastercardCircle,
                            { backgroundColor: '#F59E0B', marginLeft: -12 },
                          ]}
                        />
                      </View>
                    )}
                  </View>
                </View>
              </LinearGradient>

              {/* Tarih Bilgisi */}
              <View className="mb-6 flex-row justify-between px-2">
                <View>
                  <Text className={`mb-1 text-xs font-bold uppercase ${colors.textMuted}`}>
                    Hesap Kesim Tarihi
                  </Text>
                  <Text className={`text-base font-bold ${colors.text}`}>{cutoffFormatted}</Text>
                </View>
                <View className="items-end">
                  <Text className={`mb-1 text-xs font-bold uppercase ${colors.textMuted}`}>
                    Son Ödeme Tarihi
                  </Text>
                  <Text className={`text-base font-bold ${colors.text}`}>{dueFormatted}</Text>
                </View>
              </View>

              {/* Banka Adı */}
              <View
                className={`mb-4 flex-row items-center rounded-xl px-4 py-4 ${colors.input}`}
                style={{ borderWidth: 1, borderColor: borderColorRaw }}>
                <Ionicons
                  name="business"
                  size={20}
                  color={colors.icon}
                  style={{ marginRight: 8 }}
                />
                <TextInput
                  placeholder="Banka adı yazınız."
                  placeholderTextColor={placeholderColor}
                  style={[styles.textInput, { color: inputTextColor }]}
                  onChangeText={setCardName}
                  value={cardName}
                />
              </View>

              {/* Kart Numarası */}
              <View
                className={`mb-4 flex-row items-center rounded-xl px-4 py-4 ${colors.input}`}
                style={{ borderWidth: 1, borderColor: borderColorRaw }}>
                <Ionicons name="card" size={20} color={colors.icon} style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Kart numarası (16 Hane)"
                  placeholderTextColor={placeholderColor}
                  style={[styles.textInput, { color: inputTextColor }]}
                  keyboardType="numeric"
                  maxLength={16}
                  onChangeText={(val) => setCardNumber(val.replace(/[^0-9]/g, ''))}
                  value={cardNumber}
                />
              </View>

              {/* Kart Markası + Kesim Günü */}
              <View style={{ flexDirection: 'row' }}>
                <View
                  className={`flex-1 flex-row items-center rounded-xl px-2 ${colors.input}`}
                  style={{
                    borderWidth: 1,
                    borderColor: borderColorRaw,
                    marginRight: 8,
                    paddingVertical: Platform.OS === 'ios' ? 0 : 4,
                  }}>
                  <Picker
                    selectedValue={cardBrand}
                    onValueChange={setCardBrand}
                    dropdownIconColor={colors.icon}
                    style={[styles.pickerStyle, { color: inputTextColor }]}>
                    <Picker.Item label="Mastercard" value="Mastercard" color={pickerItemColor} />
                    <Picker.Item label="Visa" value="Visa" color={pickerItemColor} />
                  </Picker>
                </View>
                <View
                  className={`flex-1 flex-row items-center rounded-xl px-2 ${colors.input}`}
                  style={{
                    borderWidth: 1,
                    borderColor: borderColorRaw,
                    marginLeft: 8,
                    paddingVertical: Platform.OS === 'ios' ? 0 : 4,
                  }}>
                  <Picker
                    selectedValue={cutoffDay}
                    onValueChange={setCutoffDay}
                    dropdownIconColor={colors.icon}
                    style={[styles.pickerStyle, { color: inputTextColor }]}>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <Picker.Item
                        key={day}
                        label={`Kesim: ${day}`}
                        value={day.toString()}
                        color={pickerItemColor}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>
          ) : (
            /* ════════════════════════════════
                ABONELİK FORMU
            ════════════════════════════════ */
            <View>
              {/* Büyük Tutar Girişi */}
              <View className="my-8 flex-row items-center justify-center">
                <Text className={`mr-1 text-5xl font-bold ${colors.text}`}>{currencySymbol}</Text>
                <TextInput
                  keyboardType="numeric"
                  value={subCost}
                  onChangeText={setSubCost}
                  placeholder="0"
                  placeholderTextColor={inputTextColor}
                  style={[styles.amountInput, { color: inputTextColor }]}
                />
              </View>

              {/* Kategori Grid */}
              <View style={styles.gridContainer}>
                {categories.map((cat, index) => {
                  const isSelected = selectedCategory === cat.name;
                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => setSelectedCategory(cat.name)}
                      style={styles.gridItem}>
                      <View
                        style={[
                          styles.iconCircle,
                          { backgroundColor: isSelected ? catCircleActiveBg : colors.iconBg },
                        ]}>
                        <Ionicons
                          name={cat.icon as any}
                          size={24}
                          color={isSelected ? catIconActiveColor : catIconInactiveColor}
                        />
                      </View>
                      <Text
                        className="mt-2 text-sm font-medium"
                        style={{
                          color: isSelected ? inputTextColor : isDark ? '#9ca3af' : '#6b7280',
                        }}>
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Yenileme Günü + Abonelik Adı */}
              <View style={{ flexDirection: 'row', marginTop: 20 }}>
                <View
                  className={`flex-1 flex-row items-center rounded-xl px-2 ${colors.input}`}
                  style={{
                    borderWidth: 1,
                    borderColor: borderColorRaw,
                    paddingVertical: Platform.OS === 'ios' ? 0 : 4,
                  }}>
                  <Ionicons
                    name="calendar"
                    size={20}
                    color={colors.icon}
                    style={{ marginRight: 4 }}
                  />
                  <Picker
                    selectedValue={renewalDay}
                    onValueChange={setRenewalDay}
                    dropdownIconColor={colors.icon}
                    style={[styles.pickerStyle, { color: inputTextColor }]}>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <Picker.Item
                        key={day}
                        label={`Ayın ${day}'i`}
                        value={day.toString()}
                        color={pickerItemColor}
                      />
                    ))}
                  </Picker>
                </View>
                <View
                  className={`ml-3 flex-1 flex-row items-center rounded-xl px-4 py-4 ${colors.input}`}
                  style={{ borderWidth: 1, borderColor: borderColorRaw }}>
                  <Ionicons
                    name="pencil"
                    size={20}
                    color={colors.icon}
                    style={{ marginRight: 8 }}
                  />
                  <TextInput
                    value={subName}
                    onChangeText={setSubName}
                    placeholder="Netflix vb..."
                    placeholderTextColor={placeholderColor}
                    style={[styles.textInput, { color: inputTextColor }]}
                  />
                </View>
              </View>
            </View>
          )}

          {/* ── Güncelle / Kaydet Butonu ── */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={loading}
            className="mt-8 items-center rounded-xl py-4"
            style={{
              backgroundColor: loading ? (isDark ? '#4b5563' : '#9ca3af') : saveBtnBg,
            }}>
            {loading ? (
              <ActivityIndicator color={saveBtnText} />
            ) : (
              <Text style={{ color: saveBtnText, fontWeight: 'bold', fontSize: 18 }}>
                {isEditMode ? 'Güncelle' : 'Kaydet'}
              </Text>
            )}
          </TouchableOpacity>

          {/* ── Sil Butonu — sadece düzenleme modunda ── */}
          {isEditMode && (
            <TouchableOpacity
              onPress={handleDelete}
              disabled={loading}
              className="mb-10 mt-3 items-center rounded-xl py-4"
              style={{
                backgroundColor: 'transparent',
                borderWidth: 1,
                borderColor: '#EF4444',
              }}>
              <Text style={{ color: '#EF4444', fontWeight: 'bold', fontSize: 18 }}>Sil</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  textInput: {
    flex: 1,
    fontSize: 16,
  },
  amountInput: {
    fontSize: 64,
    fontWeight: 'bold',
    minWidth: 80,
    textAlign: 'center',
    padding: 0,
  },
  pickerStyle: {
    flex: 1,
    marginLeft: Platform.OS === 'ios' ? 0 : -10,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    marginBottom: 16,
    alignItems: 'center',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardPreview: {
    height: 190,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    justifyContent: 'space-between',
  },
  cardPreviewTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  cardChip: {
    width: 40,
    height: 28,
    borderRadius: 6,
    alignSelf: 'flex-end',
    opacity: 0.8,
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardNumberText: {
    color: 'white',
    fontSize: 16,
    letterSpacing: 3,
    fontFamily: 'monospace',
  },
  cardLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
  },
  visaText: {
    color: 'white',
    fontSize: 26,
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: -1,
  },
  mastercardCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    opacity: 0.9,
  },
});
