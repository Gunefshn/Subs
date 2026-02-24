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

const CATEGORY_COLORS: Record<string, string> = {
  'Kira':           '#3B82F6',
  'Fatura':         '#3B82F6',
  'Market':         '#22C55E',
  'Yemek':          '#EAB308',
  'Eğlence':        '#EAB308',
  'Dijital Servis': '#EF4444',
  'Oyun':           '#EF4444',
  'Spor':           '#F97316',
  'Sağlık':         '#F97316',
  'Ulaşım':         '#A855F7',
  'Diğer':          '#64748B',
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

    // Gelir / gider toplamları
    const expenses = data.filter(t => t.type === 'expense');
    const incomes = data.filter(t => t.type === 'income');
    const expenseTotal = expenses.reduce((sum, t) => sum + t.amount, 0);
    const incomeTotal = incomes.reduce((sum, t) => sum + t.amount, 0);
    setTotalExpense(expenseTotal);
    setTotalIncome(incomeTotal);

    // Kategoriye göre dağılım
    const categoryMap: Record<string, number> = {};
    expenses.forEach(t => {
      categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    });

    const categoryList = Object.entries(categoryMap)
      .map(([category, total]) => ({
        category,
        total,
        percentage: expenseTotal > 0 ? Math.round((total / expenseTotal) * 100) : 0,
        color: CATEGORY_COLORS[category] ?? '#64748B',
      }))
      .sort((a, b) => b.total - a.total);

    setCategoryData(categoryList);

    // Son 7 gün
    const last7: DailyData[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().split('T')[0];
      const dayTotal = expenses
       .filter(t => new Date(t.date).toISOString().split('T')[0] === dayStr)
        .reduce((sum, t) => sum + t.amount, 0);
      last7.push({ day: DAY_NAMES[d.getDay()], total: dayTotal });
    }
    setDailyData(last7);

    setLoading(false);
  };

  return { categoryData, dailyData, totalExpense, totalIncome, periodLabel, loading };
}