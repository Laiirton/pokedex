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
        const parsedUser = JSON.parse(storedUser);
        
        // Verifica se o usuário ainda existe no banco
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', parsedUser.id)
          .single();

        if (error) {
          console.error('Erro ao verificar usuário:', error);
          handleLogout();
          return;
        }

        if (!data) {
          handleLogout();
          return;
        }

        // Atualiza os dados do usuário caso tenha mudado algo no banco
        if (JSON.stringify(data) !== storedUser) {
          localStorage.setItem('pokemon_user', JSON.stringify(data));
        }
        
        setUser(data);
      }
    } catch (error) {
      console.error('Erro ao verificar usuário:', error);
      handleLogout();
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
      if (!data) throw new Error('Usuário não encontrado');

      // Salva a sessão do usuário
      const session = {
        user: data,
        session_id: Date.now(),
        last_activity: new Date().toISOString()
      };

      localStorage.setItem('pokemon_user', JSON.stringify(data));
      localStorage.setItem('pokemon_session', JSON.stringify(session));
      setUser(data);

    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  }

  function handleLogout() {
    localStorage.removeItem('pokemon_user');
    localStorage.removeItem('pokemon_session');
    setUser(null);
  }

  async function logout() {
    try {
      handleLogout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
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