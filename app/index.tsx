import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import { router } from 'expo-router';

const handeLogin = () => {
  router.replace('/(tabs)/dashboard');
};
const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <KeyboardAvoidingView
      className="flex-1 items-center justify-center bg-gray-900 px-7"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View className="mb-11">
        <Image
          source={require('../assets/img/logo_darkMode.png')}
          className="h-32 w-32"
          resizeMode="contain"
        />
      </View>

      {/* Welcome */}
      <Text className="mb-1.5 text-2xl font-bold tracking-widest text-white">HOŞ GELDİNİZ</Text>
      <Text className="mb-7 text-sm text-gray-400">
        {isLogin ? 'Hesabınıza Giriş Yapın' : 'Bir Hesap Oluşturun'}
      </Text>

      {/* Tab Switcher */}
      <View
        className="mb-6 w-full flex-row rounded-xl bg-gray-800"
        style={{ height: 48, padding: 4 }}>
        <TouchableOpacity
          className={`flex-1 items-center justify-center rounded-lg ${isLogin ? 'bg-white' : ''}`}
          onPress={() => {
            setIsLogin(true);
            setShowPassword(false);
          }}
          activeOpacity={0.7}>
          <Text
            className={
              isLogin ? 'text-sm font-semibold text-gray-900' : 'text-sm font-medium text-gray-400'
            }>
            Giriş Yap
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 items-center justify-center rounded-lg ${!isLogin ? 'bg-white' : ''}`}
          onPress={() => {
            setIsLogin(false);
            setShowPassword(false);
          }}
          activeOpacity={0.7}>
          <Text
            className={
              !isLogin ? 'text-sm font-semibold text-gray-900' : 'text-sm font-medium text-gray-400'
            }>
            Kayıt Ol
          </Text>
        </TouchableOpacity>
      </View>

      {/* Full Name — sadece Register'da */}
      {!isLogin && (
        <View
          className="mb-3 w-full flex-row items-center rounded-xl border border-gray-700 bg-gray-800 px-4"
          style={{ height: 52 }}>
          <Ionicons name="person-outline" size={20} color="#6b7280" />
          <TextInput
            className="ml-3 flex-1 text-sm text-white"
            placeholder="Ad Soyad"
            placeholderTextColor="#6b7280"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
            autoCorrect={false}
          />
        </View>
      )}

      {/* Email */}
      <View
        className="mb-3 w-full flex-row items-center rounded-xl border border-gray-700 bg-gray-800 px-4"
        style={{ height: 52 }}>
        <Ionicons name="mail-outline" size={20} color="#6b7280" />
        <TextInput
          className="ml-3 flex-1 text-sm text-white"
          placeholder="E-posta"
          placeholderTextColor="#6b7280"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* Password */}
      <View
        className="mb-3 w-full flex-row items-center rounded-xl border border-gray-700 bg-gray-800 px-4"
        style={{ height: 52 }}>
        <Ionicons name="lock-closed-outline" size={20} color="#6b7280" />
        <TextInput
          className="ml-3 flex-1 text-sm text-white"
          placeholder="Şifre"
          placeholderTextColor="#6b7280"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} activeOpacity={0.5}>
          <Ionicons
            name={showPassword ? 'eye-outline' : 'eye-off-outline'}
            size={20}
            color="#6b7280"
          />
        </TouchableOpacity>
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        className="mt-2 w-full items-center justify-center rounded-xl bg-white shadow-lg"
        style={{ height: 52 }}
        activeOpacity={0.82}
        onPress={handeLogin}>
        <Text className="text-base font-semibold text-gray-900">
          {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
        </Text>
      </TouchableOpacity>

      {/* Google Button */}
      <TouchableOpacity
        className="mt-3 w-full flex-row items-center justify-center rounded-xl border border-gray-700"
        style={{ height: 52 }}
        activeOpacity={0.82}
        onPress={() => {
          /* TODO */
        }}>
        <AntDesign name="google" size={20} color="#ea4335" />
        <Text className="ml-2 text-sm font-medium text-gray-300">Google ile devam et</Text>
      </TouchableOpacity>

      {/* Forgot Password — sadece Login'de */}
      {isLogin && (
        <TouchableOpacity
          className="mt-5"
          activeOpacity={0.5}
          onPress={() => {
            /* TODO */
          }}>
          <Text className="text-xs text-gray-500 underline">Şifremi unuttum</Text>
        </TouchableOpacity>
      )}
    </KeyboardAvoidingView>
  );
};

export default AuthScreen;
