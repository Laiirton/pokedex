import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { getAllPokemon, getPokemonDetails } from '@/lib/pokemon-api';

interface User {
  id: number;
  username: string;
}

interface PokemonOption {
  name: string;
  url: string;
}

export default function AdminPanel() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [pokemonList, setPokemonList] = useState<PokemonOption[]>([]);
  const [selectedPokemon, setSelectedPokemon] = useState<string>('');
  const [isShiny, setIsShiny] = useState(false);
  const [loading, setLoading] = useState(false);
  const [capturesPerHour, setCapturesPerHour] = useState<string>('');

  useEffect(() => {
    if (!user?.is_admin) {
      toast.error('Acesso não autorizado');
      return;
    }
    
    fetchUsers();
    fetchPokemonList();
  }, [user]);

  async function fetchUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('id, username')
      .order('username');

    if (error) {
      toast.error('Erro ao carregar usuários');
      return;
    }

    setUsers(data);
  }

  async function fetchPokemonList() {
    const pokemon = await getAllPokemon();
    setPokemonList(pokemon);
  }

  async function handleGivePokemon() {
    if (!selectedUser || !selectedPokemon) {
      toast.error('Selecione um usuário e um Pokémon');
      return;
    }

    setLoading(true);
    try {
      const details = await getPokemonDetails(selectedPokemon);
      
      if (!details) {
        throw new Error('Não foi possível obter os detalhes do Pokémon');
      }
      
      const { error } = await supabase.from('pokemon_generated').insert({
        user_id: parseInt(selectedUser),
        pokemon_name: selectedPokemon,
        pokemon_image_url: isShiny 
          ? details.sprites.front_shiny || details.sprites.front_default 
          : details.sprites.front_default,
        is_shiny: isShiny,
        is_legendary: details.is_legendary || false,
        is_mythical: details.is_mythical || false,
        count: 1
      });

      if (error) throw error;
      toast.success('Pokémon concedido com sucesso!');
    } catch (error) {
      toast.error('Erro ao conceder Pokémon');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateCaptureLimit() {
    if (!selectedUser || !capturesPerHour) {
      toast.error('Selecione um usuário e defina um limite');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_capture_limits')
        .upsert({
          user_id: parseInt(selectedUser),
          captures_per_hour: parseInt(capturesPerHour),
          last_capture_time: new Date().toISOString(),
          captures_since_last_reset: 0
        });

      if (error) throw error;
      toast.success('Limite de capturas atualizado!');
    } catch (error) {
      toast.error('Erro ao atualizar limite');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (!user?.is_admin) {
    return <div>Acesso não autorizado</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Painel Administrativo</h1>

      <Tabs defaultValue="give-pokemon">
        <TabsList>
          <TabsTrigger value="give-pokemon">Dar Pokémon</TabsTrigger>
          <TabsTrigger value="capture-limits">Limites de Captura</TabsTrigger>
        </TabsList>

        <TabsContent value="give-pokemon">
          <Card>
            <CardHeader>
              <CardTitle>Dar Pokémon para Usuário</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um usuário" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedPokemon} onValueChange={setSelectedPokemon}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um Pokémon" />
                </SelectTrigger>
                <SelectContent>
                  {pokemonList.map((pokemon) => (
                    <SelectItem key={pokemon.name} value={pokemon.name}>
                      {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="shiny"
                  checked={isShiny}
                  onChange={(e) => setIsShiny(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="shiny">Shiny</label>
              </div>

              <Button 
                onClick={handleGivePokemon} 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  'Dar Pokémon'
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="capture-limits">
          <Card>
            <CardHeader>
              <CardTitle>Configurar Limites de Captura</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um usuário" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="number"
                placeholder="Capturas por hora"
                value={capturesPerHour}
                onChange={(e) => setCapturesPerHour(e.target.value)}
              />

              <Button 
                onClick={handleUpdateCaptureLimit} 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Atualizando...
                  </>
                ) : (
                  'Atualizar Limite'
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 