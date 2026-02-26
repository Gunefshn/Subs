import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import React from 'react';
import { router } from "expo-router";

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1F2937',
          borderTopWidth: 0,
          height: 65, // Biraz yükseltmek ikonları rahatlatır
          paddingBottom: 8,
          paddingTop: 8,
          position: 'absolute', // Görseldeki kaymaları önlemek için önemli
        },
        tabBarActiveTintColor: '#FFFFFF',
        tabBarInactiveTintColor: '#6B7280',
        tabBarShowLabel: false,
      }}>
      
      <Tabs.Screen
        name="dashboard"
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="analytics"
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="stats-chart" size={24} color={color} />,
        }}
      />

      {/* 1. DEĞİŞİKLİK: name kısmını dosya adıyla aynı yapıyoruz */}
      <Tabs.Screen
        name="addTransactions"
        options={{
          // 2. DEĞİŞİKLİK: tabBarButton kullanarak tüm alanı kontrol ediyoruz
          tabBarButton: (props) => (
            <TouchableOpacity
              {...props}
              activeOpacity={0.8}
              onPress={() => router.push('/(tabs)/addTransactions')}
              style={styles.addButtonContainer}
            >
              <View style={styles.addButton}>
                <FontAwesome6 name="add" size={24} color="#fff" />
              </View>
            </TouchableOpacity>
          ),
        }}
      />

      <Tabs.Screen
        name="subscriptions"
        options={{
          tabBarIcon: ({ color }) => <MaterialIcons name="subscriptions" size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  // Butonun tab barda düzgün ortalanması için konteyner
  addButtonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    // Butonu biraz yukarı taşımak için (Floating efekti)
    top: -15, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});