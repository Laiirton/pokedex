import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useLocation, useNavigate } from 'react-router-dom';

interface User {
  id: number;
  username: string;
  phone_number?: string;
  is_admin: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (codeOrUsername: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const adminCredentials = {
  username: 'lala',
  password: 'autista',
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
    checkCodeInUrl();
  }, []);

  async function checkCodeInUrl() {
    try {
      // Get the code from the URL using URLSearchParams
      const searchParams = new URLSearchParams(location.search);
      const codeFromUrl = searchParams.get('code');

      if (codeFromUrl && !user) {
        await login(codeFromUrl);
        // Remove the code from the URL after login
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      console.error('Erro ao fazer login com código da URL:', error);
    }
  }

  async function checkUser() {
    try {
      const storedUser = localStorage.getItem('pokemon_user');
      const storedSession = localStorage.getItem('pokemon_session');
      
      if (storedUser && storedSession) {
        const parsedUser = JSON.parse(storedUser);
        const parsedSession = JSON.parse(storedSession);
        
        // Check if the session has not expired (24 hours)
        const lastActivity = new Date(parsedSession.last_activity).getTime();
        const now = new Date().getTime();
        const hoursDiff = (now - lastActivity) / (1000 * 60 * 60);
        
        if (hoursDiff > 24) {
          handleLogout();
          return;
        }

        // Update last activity
        const updatedSession = {
          ...parsedSession,
          last_activity: new Date().toISOString()
        };
        localStorage.setItem('pokemon_session', JSON.stringify(updatedSession));
        
        setUser(parsedUser);
        setIsAdmin(parsedUser.is_admin);
        setIsLoading(false);
        return;
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Erro ao verificar usuário:', error);
      handleLogout();
      setIsLoading(false);
    }
  }

  async function login(codeOrUsername: string, password?: string) {
    if (password !== undefined) {
      // Admin login with username and password
      if (codeOrUsername === adminCredentials.username && password === adminCredentials.password) {
        const adminUser: User = {
          id: 0,
          username: adminCredentials.username,
          is_admin: true,
        };
        localStorage.setItem('pokemon_user', JSON.stringify(adminUser));
        localStorage.removeItem('pokemon_session');
        setUser(adminUser);
        setIsAdmin(true);
        navigate('/admin');
      } else {
        throw new Error('Credenciais de administrador inválidas');
      }
    } else {
      try {
        const { data: verificationData, error: verificationError } = await supabase
          .from('verification_codes')
          .select('*, users(*)')
          .eq('code', codeOrUsername)
          .eq('used', false)
          .gt('expires_at', new Date().toISOString())
          .single();

        if (verificationError || !verificationData) {
          throw new Error('Código inválido ou expirado');
        }

        await supabase
          .from('verification_codes')
          .update({ used: true })
          .eq('id', verificationData.id);

        const userData = verificationData.users;

        // Save user session with timestamp
        const session = {
          user_id: userData.id,
          session_id: Date.now(),
          last_activity: new Date().toISOString(),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        };

        localStorage.setItem('pokemon_user', JSON.stringify(userData));
        localStorage.setItem('pokemon_session', JSON.stringify(session));
        setUser(userData);
        setIsAdmin(userData.is_admin);
        navigate(userData.is_admin ? '/admin' : '/dashboard');

      } catch (error) {
        console.error('Erro ao fazer login:', error);
        throw error;
      }
    }
  }

  function handleLogout() {
    localStorage.removeItem('pokemon_user');
    localStorage.removeItem('pokemon_session');
    setUser(null);
    setIsAdmin(false);
  }

  async function logout() {
    try {
      handleLogout();
      navigate('/');
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
      isLoading,
      isAdmin
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