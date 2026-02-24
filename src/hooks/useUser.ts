import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type Profile = {
  full_name: string;
  email: string;
  currency_preference: string;
};

export function useUser() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    supabase
      .from('profiles')
      .select('full_name, email, currency_preference')
      .eq('id', user.id)
      .single()
      .then(({ data, error }) => {
        if (error) console.error('Profil çekme hatası:', error);
        else setProfile(data);
        setLoading(false);
      });
  }, [user]);

  return { profile, loading };
}