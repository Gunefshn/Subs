import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchRates, Currency } from '../lib/exchange';

type AppContextType = {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  notificationsEnabled: boolean;
  toggleNotifications: () => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  rates: Record<string, number>;
  ratesLoading: boolean;
};

const AppContext = createContext<AppContextType>({
  isDarkMode: true,
  toggleDarkMode: () => {},
  notificationsEnabled: false,
  toggleNotifications: () => {},
  currency: 'TRY',
  setCurrency: () => {},
  rates: { TRY: 1, USD: 0.026, EUR: 0.024 },
  ratesLoading: false,
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [currency, setCurrencyState] = useState<Currency>('TRY');
  const [rates, setRates] = useState<Record<string, number>>({ TRY: 1, USD: 0.026, EUR: 0.024 });
  const [ratesLoading, setRatesLoading] = useState(false);

  useEffect(() => {
    // Kayıtlı tercihleri yükle
    AsyncStorage.multiGet(['darkMode', 'notifications', 'currency']).then((values) => {
      if (values[0][1] !== null) setIsDarkMode(values[0][1] === 'true');
      if (values[1][1] !== null) setNotificationsEnabled(values[1][1] === 'true');
      if (values[2][1] !== null) setCurrencyState(values[2][1] as Currency);
    });

    // Kurları çek
    loadRates();
  }, []);

  const loadRates = async () => {
    setRatesLoading(true);
    const newRates = await fetchRates();
    setRates(newRates);
    setRatesLoading(false);
  };

  const toggleDarkMode = async () => {
    const newValue = !isDarkMode;
    setIsDarkMode(newValue);
    await AsyncStorage.setItem('darkMode', String(newValue));
  };

  const toggleNotifications = async () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    await AsyncStorage.setItem('notifications', String(newValue));
  };

  const setCurrency = async (c: Currency) => {
    setCurrencyState(c);
    await AsyncStorage.setItem('currency', c);
  };

  return (
    <AppContext.Provider
      value={{
        isDarkMode,
        toggleDarkMode,
        notificationsEnabled,
        toggleNotifications,
        currency,
        setCurrency,
        rates,
        ratesLoading,
      }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
