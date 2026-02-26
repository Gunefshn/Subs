import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type CategoryData = {
  category: string;
  total: number;
  percentage: number;
  color: string;
};

type DailyData = {
  day: string;
  total: number;
};

// Gruplama haritası
const CATEGORY_GROUPS: Record<string, string> = {
  'Fatura':         'Fatura & Kira',
  'Kira':           'Fatura & Kira',
  'Market':         'Alışveriş & Market',
  'Alışveriş':      'Alışveriş & Market',
  'Eğlence':        'Eğlence & Yemek',
  'Yemek':          'Eğlence & Yemek',
  'Dijital Servis': 'Dijital & Oyun',
  'Oyun':           'Dijital & Oyun',
  'Sağlık':         'Sağlık & Spor',
  'Spor':           'Sağlık & Spor',
  'Eğitim':         'Eğitim & Ulaşım',
  'Ulaşım':         'Eğitim & Ulaşım',
};

const GROUP_COLORS: Record<string, string> = {
  'Fatura & Kira':       '#3B82F6',
  'Alışveriş & Market':  '#22C55E',
  'Eğlence & Yemek':     '#EAB308',
  'Dijital & Oyun':      '#EF4444',
  'Sağlık & Spor':       '#F97316',
  'Eğitim & Ulaşım':     '#A855F7',
  'Diğer':               '#64748B',
};

export const GROUP_SHORT_NAMES: Record<string, string> = {
  'Fatura & Kira':      'Kira & Fatura',
  'Alışveriş & Market': 'Alış. & Market',
  'Eğlence & Yemek':    'Eğl. & Yemek',
  'Dijital & Oyun':     'Dij. & Oyun',
  'Sağlık & Spor':      'Sağlık & Spor',
  'Eğitim & Ulaşım':    'Eğit. & Ulaşım',
  'Diğer':              'Diğer',
};
const DAY_NAMES = ['Paz', 'Pzt', 'Sal', 'Çrş', 'Prş', 'Cum', 'Cmt'];

export function useAnalytics(filter: 'Bu Ay' | 'Geçen Ay' | 'Bu Yıl') {
  const { user } = useAuth();
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [periodLabel, setPeriodLabel] = useState('');
  const [loading, setLoading] = useState(true);

  const MONTH_NAMES = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user, filter]);

  const getDateRange = () => {
    const now = new Date();
    let start: Date, end: Date;

    if (filter === 'Bu Ay') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      setPeriodLabel(MONTH_NAMES[now.getMonth()] + ' Ayı');
    } else if (filter === 'Geçen Ay') {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0);
      setPeriodLabel(MONTH_NAMES[now.getMonth() - 1] + ' Ayı');
    } else {
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear(), 11, 31);
      setPeriodLabel(now.getFullYear() + ' Yılı');
    }

    return { start, end };
  };

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);

    const { start, end } = getDateRange();

    const { data, error } = await supabase
      .from('transactions')
      .select('amount, category, type, date')
      .eq('user_id', user.id)
      .gte('date', start.toISOString())
      .lte('date', end.toISOString());

    if (error || !data) {
      console.error('Analytics veri hatası:', error);
      setLoading(false);
      return;
    }

    const expenses = data.filter(t => t.type === 'expense');
    const incomes = data.filter(t => t.type === 'income');
    const expenseTotal = expenses.reduce((sum, t) => sum + t.amount, 0);
    setTotalExpense(expenseTotal);
    setTotalIncome(incomes.reduce((sum, t) => sum + t.amount, 0));

    // Gruplandırılmış kategori dağılımı
    const groupMap: Record<string, number> = {};
    expenses.forEach(t => {
      const group = CATEGORY_GROUPS[t.category] ?? 'Diğer';
      groupMap[group] = (groupMap[group] || 0) + t.amount;
    });

    const categoryList = Object.entries(groupMap)
      .map(([category, total]) => ({
        category,
        total,
        percentage: expenseTotal > 0 ? Math.round((total / expenseTotal) * 100) : 0,
        color: GROUP_COLORS[category] ?? '#64748B',
      }))
      .sort((a, b) => b.total - a.total);

    setCategoryData(categoryList);

    // Son 7 gün
   // Son 7 gün — bugün dahil, yarın yok
const last7: DailyData[] = [];
const today = new Date();
today.setHours(23, 59, 59, 999); 

for (let i = 6; i >= 0; i--) {
  const d = new Date();
  d.setDate(d.getDate() - i);
  
  
  const dayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  
  const dayTotal = expenses
    .filter(t => {
      
      const txDate = new Date(new Date(t.date).getTime() + 3 * 60 * 60 * 1000);
      const txStr = `${txDate.getUTCFullYear()}-${String(txDate.getUTCMonth() + 1).padStart(2, '0')}-${String(txDate.getUTCDate()).padStart(2, '0')}`;
      return txStr === dayStr;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  last7.push({ day: DAY_NAMES[d.getDay()], total: dayTotal });
  console.log(`i:${i} | tarih:${dayStr} | getDay:${d.getDay()} | gün:${DAY_NAMES[d.getDay()]} | total:${dayTotal}`);
}
console.log('Bugün getDay():', new Date().getDay());
console.log('last7:', JSON.stringify(last7));
    setDailyData(last7);

    setLoading(false);
  };

  return { categoryData, dailyData, totalExpense, totalIncome, periodLabel, loading };
}