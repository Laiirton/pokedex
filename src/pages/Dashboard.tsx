import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface Stats {
  totalPokemon: number;
  shinyCount: number;
  legendaryCount: number;
  mythicalCount: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data: pokemonData } = await supabase
          .from('pokemon_generated')
          .select('*')
          .eq('user_id', user?.id);

        if (pokemonData) {
          setStats({
            totalPokemon: pokemonData.length,
            shinyCount: pokemonData.filter(p => p.is_shiny).length,
            legendaryCount: pokemonData.filter(p => p.is_legendary).length,
            mythicalCount: pokemonData.filter(p => p.is_mythical).length,
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="page-header">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Bem-vindo, {user?.username}!
        </h1>
        {user?.is_admin && (
          <Button
            variant="outline"
            onClick={() => navigate('/admin')}
            className="mt-4"
          >
            Acessar Painel Admin
          </Button>
        )}
      </div>
      
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover-effect card-gradient-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Pokémon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold stats-value">
              {stats?.totalPokemon || 0}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Pokémon capturados
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover-effect card-gradient-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pokémon Shiny
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-500">
              {stats?.shinyCount || 0}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              ✨ Raros e brilhantes
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover-effect card-gradient-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pokémon Lendários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-500">
              {stats?.legendaryCount || 0}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              👑 Criaturas lendárias
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover-effect card-gradient-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pokémon Míticos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">
              {stats?.mythicalCount || 0}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              🌟 Poder ancestral
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}