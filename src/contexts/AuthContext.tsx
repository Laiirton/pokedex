import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface User {
  id: number;
  username: string;
  phone_number?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (code: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const storedUser = localStorage.getItem('pokemon_user');
      const storedSession = localStorage.getItem('pokemon_session');
      
      if (storedUser && storedSession) {
        const parsedUser = JSON.parse(storedUser);
        const parsedSession = JSON.parse(storedSession);
        
        // Verifica se a sessão não expirou (24 horas)
        const lastActivity = new Date(parsedSession.last_activity).getTime();
        const now = new Date().getTime();
        const hoursDiff = (now - lastActivity) / (1000 * 60 * 60);
        
        if (hoursDiff > 24) {
          handleLogout();
          return;
        }

        // Atualiza o último acesso
        const updatedSession = {
          ...parsedSession,
          last_activity: new Date().toISOString()
        };
        localStorage.setItem('pokemon_session', JSON.stringify(updatedSession));
        
        // Resto da verificação do usuário permanece igual
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', parsedUser.id)
          .single();

        if (error || !data) {
          handleLogout();
          return;
        }

        if (JSON.stringify(data) !== storedUser) {
          localStorage.setItem('pokemon_user', JSON.stringify(data));
        }
        
        setUser(data);
      }
    } catch (error) {
      console.error('Erro ao verificar usuário:', error);
      handleLogout();
    } finally {
      setIsLoading(false);
    }
  }

  async function login(code: string) {
    try {
      // Verifica o código na tabela verification_codes
      const { data: verificationData, error: verificationError } = await supabase
        .from('verification_codes')
        .select('*, users(*)')
        .eq('code', code)
        .eq('used', false)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (verificationError || !verificationData) {
        throw new Error('Código inválido ou expirado');
      }

      // Marca o código como usado
      await supabase
        .from('verification_codes')
        .update({ used: true })
        .eq('id', verificationData.id);

      const userData = verificationData.users;

      // Salva a sessão do usuário
      const session = {
        user: userData,
        session_id: Date.now(),
        last_activity: new Date().toISOString()
      };

      localStorage.setItem('pokemon_user', JSON.stringify(userData));
      localStorage.setItem('pokemon_session', JSON.stringify(session));
      setUser(userData);

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
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isLoading
    }}>
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