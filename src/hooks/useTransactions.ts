import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type Transaction = {
  id: string;
  amount: number;
  category: string;
  date: string;
  note: string;
  type: 'income' | 'expense';
};

type Summary = {
  totalIncome: number;
  totalExpense: number;
  balance: number;
};

export function useTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<Summary>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchTransactions();
  }, [user]);

  const fetchTransactions = async () => {
    if (!user) return;
    setLoading(true);

    // Son 5 işlemi çek (dashboard için)
    const { data, error } = await supabase
      .from('transactions')
      .select('id, amount, category, date, note, type')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(5);

    if (error) {
      console.error('İşlem çekme hatası:', error);
      setLoading(false);
      return;
    }

    setTransactions(data || []);

    // Gelir/gider toplamlarını hesapla (tüm kayıtlar)
    const { data: allData } = await supabase
      .from('transactions')
      .select('amount, type')
      .eq('user_id', user.id);

    if (allData) {
      const totalIncome = allData
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      const totalExpense = allData
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      setSummary({
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
      });
    }

    setLoading(false);
  };

  return { transactions, summary, loading, refetch: fetchTransactions };
}