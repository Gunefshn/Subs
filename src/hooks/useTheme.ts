import { useAppContext } from '../contexts/AppContext';

export function useTheme() {
  const { isDarkMode } = useAppContext();

  return {
    isDark: isDarkMode,
    colors: {
      // Arka planlar
      bg:         isDarkMode ? 'bg-gray-900'  : 'bg-slate-50',
      card:       isDarkMode ? 'bg-gray-800'  : 'bg-white',
      cardAlt:    isDarkMode ? 'bg-gray-700'  : 'bg-gray-100',
      input:      isDarkMode ? 'bg-gray-700'  : 'bg-gray-100',

      // Textler
      text:       isDarkMode ? 'text-white'     : 'text-gray-900',
      textMuted:  isDarkMode ? 'text-gray-400'  : 'text-gray-500',
      textFaint:  isDarkMode ? 'text-gray-500'  : 'text-gray-400',

      // Border
      border:     isDarkMode ? 'border-gray-700' : 'border-gray-200',

      // İkon renkleri (string değer)
      icon:       isDarkMode ? '#9ca3af' : '#6b7280',
      iconBg:     isDarkMode ? '#374151' : '#f3f4f6',
    },
  };
}