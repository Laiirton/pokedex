import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface User {
  id: number;
  username: string;
  phone_number?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (identifier: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const storedUser = localStorage.getItem('pokemon_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  }

  async function login(identifier: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`phone_number.eq.${identifier},username.eq.${identifier}`)
        .single();

      if (error) throw error;
      if (!data) throw new Error('User not found');

      setUser(data);
      localStorage.setItem('pokemon_user', JSON.stringify(data));
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  }

  async function logout() {
    localStorage.removeItem('pokemon_user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}