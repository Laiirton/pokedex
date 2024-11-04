import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

export default function AdminDashboard() {
  const [userId, setUserId] = useState('');
  const [pokemonId, setPokemonId] = useState('');
  const [isShiny, setIsShiny] = useState(false);
  const [loading, setLoading] = useState(false);

  const givePokemon = async () => {
    if (!userId || !pokemonId) {
      toast.error('Por favor, insira o ID do usuário e do Pokémon');
      return;
    }

    setLoading(true);
    try {
      const { data: userExists } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single();

      if (!userExists) {
        toast.error('Usuário não encontrado');
        return;
      }

      const { error } = await supabase.from('pokemon_generated').insert({
        user_id: userId,
        pokemon_id: Number(pokemonId),
        is_shiny: isShiny,
      });

      if (error) throw error;

      toast.success('Pokémon concedido com sucesso');
      setUserId('');
      setPokemonId('');
      setIsShiny(false);
    } catch (error) {
      console.error('Erro ao conceder Pokémon:', error);
      toast.error('Erro ao conceder Pokémon');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Dashboard de Admin</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="userId">ID do Usuário</Label>
            <Input
              id="userId"
              placeholder="Digite o ID do usuário"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="pokemonId">ID do Pokémon</Label>
            <Input
              id="pokemonId"
              placeholder="Digite o ID do Pokémon"
              value={pokemonId}
              onChange={(e) => setPokemonId(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isShiny"
              checked={isShiny}
              onCheckedChange={(checked) => setIsShiny(checked as boolean)}
            />
            <Label htmlFor="isShiny">Pokémon Shiny?</Label>
          </div>

          <Button
            onClick={givePokemon}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Concedendo...
              </>
            ) : (
              'Conceder Pokémon'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
