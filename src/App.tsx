import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import PokemonList from '@/pages/PokemonList';
import Trades from '@/pages/Trades';
import Companion from '@/pages/Companion';
import CatchPokemon from '@/pages/CatchPokemon';
import Ranking from '@/pages/Ranking';
import Layout from '@/components/Layout';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/pokemon" element={<PokemonList />} />
            <Route path="/catch" element={<CatchPokemon />} />
            <Route path="/trades" element={<Trades />} />
            <Route path="/companion" element={<Companion />} />
            <Route path="/ranking" element={<Ranking />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
}