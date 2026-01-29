import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Index() {
  return (
    <SafeAreaView className="flex-1 bg-white p-4">
      <View className="rounded-2xl bg-slate-200 p-6">
        <Text className="mb-4 text-center text-xl font-semibold text-blue-600">
          NativeWind Test Ediliyor
        </Text>

        <TouchableOpacity className="mb-3 rounded-xl bg-blue-500 py-3">
          <Text className="text-center font-medium text-white">Login</Text>
        </TouchableOpacity>

        <TouchableOpacity className="rounded-xl bg-gray-800 py-3">
          <Text className="text-center font-medium text-white">Sign Up</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
