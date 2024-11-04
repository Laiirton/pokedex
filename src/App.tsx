import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { LoginScreen } from '@/components/login-screen';
import Dashboard from '@/pages/Dashboard';
import PokemonList from '@/pages/PokemonList';
import Trades from '@/pages/Trades';
import Companion from '@/pages/Companion';
import CatchPokemon from '@/pages/CatchPokemon';
import Ranking from '@/pages/Ranking';
import Layout from '@/components/Layout';
import { Loader2 } from 'lucide-react';
import AdminDashboard from '@/pages/AdminDashboard';

// Componente para proteger rotas
function ProtectedRoutes() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pokemon" element={<PokemonList />} />
        <Route path="/catch" element={<CatchPokemon />} />
        <Route path="/trades" element={<Trades />} />
        <Route path="/companion" element={<Companion />} />
        <Route path="/ranking" element={<Ranking />} />
      </Routes>
    </Layout>
  );
}

// Componente para a rota pública de login
function PublicRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to={user.is_admin ? '/admin' : '/dashboard'} replace />;
  }

  return <LoginScreen />;
}

// Componente para proteger rotas de administrador
function AdminRoute() {
  const { user, isLoading, isAdmin } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <Layout>
      <AdminDashboard />
    </Layout>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<PublicRoute />} />
          <Route path="/admin" element={<AdminRoute />} />
          <Route path="/*" element={<ProtectedRoutes />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
}