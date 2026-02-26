import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Platform, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function AddTransactions() {
  const [selectedTab, setSelectedTab] = useState<"Gelir" | "Gider">("Gelir");
  const [amount, setAmount] = useState<number>(0);
  const [details, setDetails] = useState<string>("");
  
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const onDateChange = (event: any, selectedDate?: Date) => {
    // Android'de seçim yapınca otomatik kapanması için false yapıyoruz
    setShowDatePicker(false); 
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
    });
  };

  const gelirKategorileri = ["Ek İş", "İade Ücreti", "Kira Geliri", "Maaş", "Prim", "Satış", "Yatırım", "Diğer"];
  const giderKategorileri = ["Yemek", "Ulaşım", "Fatura", "Kira", "Eğlence", "Sağlık", "Alışveriş", "Market", "Oyun", "Spor", "Eğitim", "Dijital Servis"];

  const kategoriler = selectedTab === "Gelir" ? gelirKategorileri : giderKategorileri;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#111827' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 16, paddingTop: 10 }}>
        <TouchableOpacity 
          onPress={() => router.back()}
          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#1F2937', alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons name="close" size={26} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
        
        <View style={styles.tabContainer}>
          {(["Gelir", "Gider"] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setSelectedTab(tab)}
              style={[styles.tabButton, selectedTab === tab && styles.activeTab]}
            >
              <Text style={{ color: selectedTab === tab ? 'white' : '#9CA3AF', fontWeight: 'bold' }}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ alignItems: 'center', marginVertical: 30 }}>
          <Text style={{ fontSize: 48, fontWeight: 'bold', color: 'white' }}>₺{amount}</Text>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {kategoriler.map((kategori, index) => {
            let iconName: any = "ellipse"; 
            if (selectedTab === "Gelir") {
              if (kategori === "Maaş") iconName = "briefcase";
              else if (kategori === "Kira Geliri") iconName = "home";
              else if (kategori === "Yatırım") iconName = "trending-up";
              else if (kategori === "Ek İş") iconName = "construct";
              else if (kategori === "İade Ücreti") iconName = "refresh";
              else if (kategori === "Prim") iconName = "gift";
              else if (kategori === "Satış") iconName = "cart";
              else iconName = "ellipsis-horizontal";
            } else {
              if (kategori === "Yemek") iconName = "restaurant";
              else if (kategori === "Ulaşım") iconName = "car";
              else if (kategori === "Fatura") iconName = "document-text";
              else if (kategori === "Kira") iconName = "home";
              else if (kategori === "Eğlence") iconName = "game-controller";
              else if (kategori === "Sağlık") iconName = "medkit";
              else if (kategori === "Alışveriş") iconName = "cart";
              else if (kategori === "Market") iconName = "basket";
              else if (kategori === "Oyun") iconName = "game-controller";
              else if (kategori === "Spor") iconName = "barbell";
              else if (kategori === "Eğitim") iconName = "school";
              else iconName = "tv";
            }

            return (
              <TouchableOpacity key={index} style={{ width: '48%', marginBottom: 16, alignItems: 'center' }}>
                <View style={styles.iconCircle}>
                  <Ionicons name={iconName} size={24} color="white" />
                </View>
                <Text style={{ color: 'white', marginTop: 8, fontWeight: '500' }}>{kategori}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ flexDirection: 'row', marginTop: 20 }}>
          {/* TAKVİMİ AÇAN BUTON BURASI */}
          <TouchableOpacity 
            onPress={() => setShowDatePicker(true)}
            style={styles.inputBox}
          >
            <Ionicons name="calendar" size={20} color="white" style={{ marginRight: 8 }} />
            <Text style={{ color: '#D1D5DB' }}>{formatDate(date)}</Text>
          </TouchableOpacity>

          <View style={[styles.inputBox, { marginLeft: 12 }]}>
            <Ionicons name="pencil" size={20} color="white" style={{ marginRight: 8 }} />
            <TextInput
              value={details}
              onChangeText={setDetails}
              placeholder="Detay..."
              placeholderTextColor="#9CA3AF"
              style={{ color: 'white', flex: 1 }}
            />
          </View>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default" // Android için en güvenli ayar
            onChange={onDateChange}
          />
        )}

        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.saveButton}
        >
          <Text style={{ color: '#111827', fontWeight: 'bold', fontSize: 18 }}>Kaydet</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  tabContainer: { flexDirection: 'row', backgroundColor: '#111827', borderWidth: 1, borderColor: '#374151', borderRadius: 16, padding: 4 },
  tabButton: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12 },
  activeTab: { backgroundColor: '#374151' },
  iconCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#374151', alignItems: 'center', justifyContent: 'center' },
  inputBox: { flex: 1, backgroundColor: '#1F2937', borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center' },
  saveButton: { backgroundColor: 'white', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 40, marginBottom: 20 }
});