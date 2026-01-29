import { View, Text } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

const Index = () => {
  return (
    <SafeAreaView className="p-4">
      <View className="border bg-slate-200 p-4">
        <Text className="self-center text-2xl font-semibold text-blue-500">
          NativeWind Gerçekten Çalışıyor mu? (Test)
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default Index;
