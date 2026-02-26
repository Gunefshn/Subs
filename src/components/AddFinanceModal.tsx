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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  visible: boolean;
  onClose: () => void;
  initialTab?: 'card' | 'sub';
  onSuccess: () => void;
}

export default function AddFinanceModal({
  visible,
  onClose,
  initialTab = 'card',
  onSuccess,
}: Props) {
  const { user } = useAuth();

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
    if (visible) {
      setActiveTab(initialTab);
    }
  }, [visible, initialTab]);

  // Arkadaşının tarzında ikonlar (Ionicons ağırlıklı)
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

  // --- Dinamik Tarih Hesaplama ---
  const getDynamicDates = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const selectedDay = parseInt(cutoffDay) || 1;

    const cutoffDate = new Date(year, month, selectedDay);
    const dueDate = new Date(year, month, selectedDay + 10);

    const format = (d: Date) => {
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      return `${dd}.${mm}.${yyyy}`;
    };

    return {
      cutoffFormatted: format(cutoffDate),
      dueFormatted: format(dueDate),
    };
  };

  const { cutoffFormatted, dueFormatted } = getDynamicDates();

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);

    try {
      if (activeTab === 'card') {
        const { error } = await supabase.from('credit_cards').insert([
          {
            user_id: user.id,
            card_name: cardName,
            cutoff_day: parseInt(cutoffDay),
            due_day: parseInt(cutoffDay) + 10,
          },
        ]);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('subscriptions').insert([
          {
            user_id: user.id,
            name: subName,
            cost: parseFloat(subCost || '0'),
            renewal_day: parseInt(renewalDay),
            active: true,
          },
        ]);
        if (error) throw error;
      }
      onSuccess();
      onClose();

      setCardName('');
      setCardNumber('');
      setSubName('');
      setSubCost('');
    } catch (error: any) {
      Alert.alert('Kayıt Hatası', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Kart Numarası Maskeleme (İlk 12 yıldız, son 4 rakam)
  const getMaskedDisplayNumber = (num: string) => {
    const cleaned = num.replace(/\D/g, '');
    let res = '';
    for (let i = 0; i < 16; i++) {
      if (i < 12) res += cleaned[i] ? '*' : '*';
      else res += cleaned[i] || '*';
      if ((i + 1) % 4 === 0 && i !== 15) res += ' ';
    }
    return res;
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <SafeAreaView style={styles.container}>
        {/* Üst Kısım: Kapatma Butonu */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={26} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
          {/* Arkadaşının Kodundan Alınan Tab Switcher */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              onPress={() => setActiveTab('card')}
              style={[styles.tabButton, activeTab === 'card' && styles.activeTab]}>
              <Text
                style={{ color: activeTab === 'card' ? 'white' : '#9CA3AF', fontWeight: 'bold' }}>
                Kart Ekle
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab('sub')}
              style={[styles.tabButton, activeTab === 'sub' && styles.activeTab]}>
              <Text
                style={{ color: activeTab === 'sub' ? 'white' : '#9CA3AF', fontWeight: 'bold' }}>
                Abonelik Ekle
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'card' ? (
            <View>
              {/* KART ÖN İZLEME */}
              <View style={styles.cardPreview}>
                <Text style={styles.cardPreviewTitle}>{cardName || 'Banka Adı'}</Text>
                <View style={styles.cardChip} />
                <View style={styles.cardBottomRow}>
                  <Text style={styles.cardNumberText}>{getMaskedDisplayNumber(cardNumber)}</Text>
                  <View style={styles.cardLogoContainer}>
                    {cardBrand === 'Visa' ? (
                      <Text style={styles.visaText}>VISA</Text>
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
              </View>

              {/* DİNAMİK TARİH BİLGİLERİ */}
              <View style={styles.dateInfoContainer}>
                <View>
                  <Text style={styles.dateInfoLabel}>Hesap Kesim Tarihi</Text>
                  <Text style={styles.dateInfoValue}>{cutoffFormatted}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.dateInfoLabel}>Son Ödeme Tarihi</Text>
                  <Text style={styles.dateInfoValue}>{dueFormatted}</Text>
                </View>
              </View>

              {/* KART GİRDİLERİ */}
              <View style={styles.inputBox}>
                <Ionicons name="business" size={20} color="#9CA3AF" style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Banka adı yazınız."
                  placeholderTextColor="#9CA3AF"
                  style={styles.textInput}
                  onChangeText={setCardName}
                  value={cardName}
                />
              </View>

              <View style={styles.inputBox}>
                <Ionicons name="card" size={20} color="#9CA3AF" style={{ marginRight: 8 }} />
                <TextInput
                  placeholder="Kart numarası (16 Hane)"
                  placeholderTextColor="#9CA3AF"
                  style={styles.textInput}
                  keyboardType="numeric"
                  maxLength={16}
                  onChangeText={(val) => setCardNumber(val.replace(/[^0-9]/g, ''))}
                  value={cardNumber}
                />
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                <View
                  style={[
                    styles.inputBox,
                    { flex: 1, marginRight: 8, paddingVertical: Platform.OS === 'ios' ? 0 : 4 },
                  ]}>
                  <Picker
                    selectedValue={cardBrand}
                    onValueChange={setCardBrand}
                    dropdownIconColor="white"
                    style={styles.pickerStyle}>
                    <Picker.Item
                      label="Mastercard"
                      value="Mastercard"
                      color={Platform.OS === 'ios' ? 'white' : 'black'}
                    />
                    <Picker.Item
                      label="Visa"
                      value="Visa"
                      color={Platform.OS === 'ios' ? 'white' : 'black'}
                    />
                  </Picker>
                </View>
                <View
                  style={[
                    styles.inputBox,
                    { flex: 1, marginLeft: 8, paddingVertical: Platform.OS === 'ios' ? 0 : 4 },
                  ]}>
                  <Picker
                    selectedValue={cutoffDay}
                    onValueChange={setCutoffDay}
                    dropdownIconColor="white"
                    style={styles.pickerStyle}>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <Picker.Item
                        key={day}
                        label={`Kesim: ${day}`}
                        value={day.toString()}
                        color={Platform.OS === 'ios' ? 'white' : 'black'}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>
          ) : (
            <View>
              {/* DEVASA TUTAR ALANI */}
              <View style={styles.amountContainer}>
                <Text style={styles.currencySymbol}>₺</Text>
                <TextInput
                  keyboardType="numeric"
                  value={subCost}
                  onChangeText={setSubCost}
                  placeholder="0"
                  placeholderTextColor="white"
                  style={styles.amountInput}
                />
              </View>

              {/* ARKADAŞININ 2 SÜTUNLU KATEGORİ GRID YAPISI */}
              <View style={styles.gridContainer}>
                {categories.map((cat, index) => {
                  const isSelected = selectedCategory === cat.name;
                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => setSelectedCategory(cat.name)}
                      style={styles.gridItem}>
                      <View style={[styles.iconCircle, isSelected && styles.activeIconCircle]}>
                        <Ionicons
                          name={cat.icon as any}
                          size={24}
                          color={isSelected ? '#111827' : 'white'}
                        />
                      </View>
                      <Text
                        style={{
                          color: isSelected ? 'white' : '#9CA3AF',
                          marginTop: 8,
                          fontWeight: '500',
                        }}>
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* ABONELİK GİRDİLERİ */}
              <View style={{ flexDirection: 'row', marginTop: 20 }}>
                <View
                  style={[
                    styles.inputBox,
                    { flex: 1, paddingVertical: Platform.OS === 'ios' ? 0 : 4 },
                  ]}>
                  <Ionicons name="calendar" size={20} color="white" style={{ marginRight: 8 }} />
                  <Picker
                    selectedValue={renewalDay}
                    onValueChange={setRenewalDay}
                    dropdownIconColor="white"
                    style={styles.pickerStyle}>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <Picker.Item
                        key={day}
                        label={`Ayın ${day}'i`}
                        value={day.toString()}
                        color={Platform.OS === 'ios' ? 'white' : 'black'}
                      />
                    ))}
                  </Picker>
                </View>

                <View style={[styles.inputBox, { flex: 1, marginLeft: 12 }]}>
                  <Ionicons name="pencil" size={20} color="white" style={{ marginRight: 8 }} />
                  <TextInput
                    value={subName}
                    onChangeText={setSubName}
                    placeholder="Netflix vb..."
                    placeholderTextColor="#9CA3AF"
                    style={styles.textInput}
                  />
                </View>
              </View>
            </View>
          )}

          {/* KAYDET BUTONU */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={loading}
            style={[styles.saveButton, loading && { backgroundColor: '#9CA3AF' }]}>
            {loading ? (
              <ActivityIndicator color="#111827" />
            ) : (
              <Text style={{ color: '#111827', fontWeight: 'bold', fontSize: 18 }}>Kaydet</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// Arkadaşının addTransaction dosyasından uyarlanan StyleSheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: '#374151',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 30,
  },
  currencySymbol: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    marginRight: 4,
  },
  amountInput: {
    fontSize: 64,
    fontWeight: 'bold',
    color: 'white',
    minWidth: 80,
    textAlign: 'center',
    padding: 0,
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
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconCircle: {
    backgroundColor: 'white',
  },
  inputBox: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  textInput: {
    color: 'white',
    flex: 1,
    fontSize: 16,
  },
  pickerStyle: {
    color: 'white',
    flex: 1,
    marginLeft: Platform.OS === 'ios' ? 0 : -10,
  },
  saveButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  // Karta Özel Stiller
  cardPreview: {
    backgroundColor: '#1F2937',
    height: 190,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#374151',
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
    backgroundColor: '#374151',
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
    fontSize: 18,
    letterSpacing: 3,
  },
  cardLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
  },
  visaText: {
    color: 'white',
    fontSize: 28,
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: -1,
  },
  mastercardCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    opacity: 0.9,
  },
  dateInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  dateInfoLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  dateInfoValue: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
