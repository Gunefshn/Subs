import { useState, useEffect, useCallback } from 'react';
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
  thisMonthExpense: number;  // Bu ayın gideri
  lastMonthExpense: number;  // Geçen ayın gideri
};

// ── Global Event Bus ──────────────────────────────────────────────────────
type Listener = () => void;
const listeners = new Set<Listener>();

export const transactionEvents = {
  emit: () => { listeners.forEach((fn) => fn()); },
  subscribe: (fn: Listener) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};
// ─────────────────────────────────────────────────────────────────────────

export function useTransactions(limit?: number) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<Summary>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    thisMonthExpense: 0,
    lastMonthExpense: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchTransactions = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    try {
      // ── Liste sorgusu ────────────────────────────────────────────────────
      let query = supabase
        .from('transactions')
        .select('id, amount, category, date, note, type')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false }); // aynı tarihli → en son eklenen üste

      if (limit) query = query.limit(limit);

      const { data, error } = await query;
      if (error) { console.error('İşlem çekme hatası:', error); return; }
      setTransactions(data || []);

      // ── Özet sorgusu (tümü, limitsiz) ───────────────────────────────────
      const { data: allData } = await supabase
        .from('transactions')
        .select('amount, type, date')
        .eq('user_id', user.id);

      if (allData) {
        const now = new Date();

        // Bu ayın başı ve sonu
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const thisMonthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

        // Geçen ayın başı ve sonu
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
        const lastMonthEnd   = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();

        const totalIncome  = allData.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const totalExpense = allData.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

        const thisMonthExpense = allData
          .filter((t) => t.type === 'expense' && t.date >= thisMonthStart && t.date <= thisMonthEnd)
          .reduce((s, t) => s + t.amount, 0);

        const lastMonthExpense = allData
          .filter((t) => t.type === 'expense' && t.date >= lastMonthStart && t.date <= lastMonthEnd)
          .reduce((s, t) => s + t.amount, 0);

        setSummary({ totalIncome, totalExpense, balance: totalIncome - totalExpense, thisMonthExpense, lastMonthExpense });
      }
    } finally {
      setLoading(false);
    }
  }, [user, limit]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  useEffect(() => {
    const unsubscribe = transactionEvents.subscribe(() => fetchTransactions());
    return unsubscribe;
  }, [fetchTransactions]);

  return { transactions, summary, loading, refetch: fetchTransactions };
}