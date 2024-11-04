import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Loader2, Search, Filter } from 'lucide-react';
import { getAllPokemon, getPokemonDetails } from '@/lib/pokemon-api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface User {
  id: number;
  username: string;
}

interface PokemonOption {
  name: string;
  url: string;
  types?: string[];
  isLegendary?: boolean;
  isMythical?: boolean;
  sprite?: string;
}

export default function AdminPanel() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [pokemonList, setPokemonList] = useState<PokemonOption[]>([]);
  const [filteredPokemon, setFilteredPokemon] = useState<PokemonOption[]>([]);
  const [selectedPokemon, setSelectedPokemon] = useState<string>('');
  const [isShiny, setIsShiny] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingPokemon, setLoadingPokemon] = useState(false);
  const [capturesPerHour, setCapturesPerHour] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [showLegendary, setShowLegendary] = useState(true);
  const [showMythical, setShowMythical] = useState(true);
  const [showNormal, setShowNormal] = useState(true);

  const pokemonTypes = [
    "normal", "fire", "water", "electric", "grass", "ice", "fighting", 
    "poison", "ground", "flying", "psychic", "bug", "rock", "ghost", 
    "dragon", "dark", "steel", "fairy"
  ];

  useEffect(() => {
    if (!user?.is_admin) {
      toast.error('Acesso não autorizado');
      return;
    }
    
    fetchUsers();
    fetchPokemonListWithDetails();
  }, [user]);

  useEffect(() => {
    filterPokemon();
  }, [searchQuery, selectedTypes, showLegendary, showMythical, showNormal, pokemonList]);

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

  async function fetchPokemonListWithDetails() {
    setLoadingPokemon(true);
    try {
      const pokemon = await getAllPokemon();
      const detailedPokemon: PokemonOption[] = [];

      // Processa em lotes de 20 para não sobrecarregar a API
      for (let i = 0; i < pokemon.length; i += 20) {
        const batch = pokemon.slice(i, i + 20);
        const detailsPromises = batch.map(async (p): Promise<PokemonOption | null> => {
          const details = await getPokemonDetails(p.name);
          if (details) {
            return {
              name: p.name,
              url: p.url,
              types: details.types.map((t: any) => t.type.name),
              isLegendary: details.is_legendary,
              isMythical: details.is_mythical,
              sprite: details.sprites.front_default
            };
          }
          return null;
        });

        const batchResults = await Promise.all(detailsPromises);
        detailedPokemon.push(...batchResults.filter((p): p is PokemonOption => p !== null));
      }

      setPokemonList(detailedPokemon);
    } catch (error) {
      console.error('Erro ao carregar lista de Pokémon:', error);
      toast.error('Erro ao carregar lista de Pokémon');
    } finally {
      setLoadingPokemon(false);
    }
  }

  function filterPokemon() {
    let filtered = [...pokemonList];

    // Filtro por nome
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtro por tipos
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(p => 
        p.types?.some(type => selectedTypes.includes(type))
      );
    }

    // Filtro por categoria
    filtered = filtered.filter(p => 
      (p.isLegendary && showLegendary) ||
      (p.isMythical && showMythical) ||
      (!p.isLegendary && !p.isMythical && showNormal)
    );

    setFilteredPokemon(filtered);
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

              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Pesquisar Pokémon..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      <div className="p-2">
                        <h4 className="mb-2 text-sm font-medium">Tipos</h4>
                        {pokemonTypes.map((type) => (
                          <DropdownMenuCheckboxItem
                            key={type}
                            checked={selectedTypes.includes(type)}
                            onCheckedChange={(checked) => {
                              setSelectedTypes(prev => 
                                checked 
                                  ? [...prev, type]
                                  : prev.filter(t => t !== type)
                              );
                            }}
                          >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </DropdownMenuCheckboxItem>
                        ))}
                        <div className="mt-2 pt-2 border-t">
                          <h4 className="mb-2 text-sm font-medium">Categorias</h4>
                          <DropdownMenuCheckboxItem
                            checked={showNormal}
                            onCheckedChange={setShowNormal}
                          >
                            Normais
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem
                            checked={showLegendary}
                            onCheckedChange={setShowLegendary}
                          >
                            Lendários
                          </DropdownMenuCheckboxItem>
                          <DropdownMenuCheckboxItem
                            checked={showMythical}
                            onCheckedChange={setShowMythical}
                          >
                            Míticos
                          </DropdownMenuCheckboxItem>
                        </div>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {loadingPokemon ? (
                  <div className="flex justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <ScrollArea className="h-[300px] rounded-md border p-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {filteredPokemon.map((pokemon) => (
                        <div
                          key={pokemon.name}
                          className={`
                            p-2 rounded-lg border cursor-pointer transition-all
                            ${selectedPokemon === pokemon.name 
                              ? 'border-primary bg-primary/10' 
                              : 'hover:border-primary/50'}
                          `}
                          onClick={() => setSelectedPokemon(pokemon.name)}
                        >
                          {pokemon.sprite && (
                            <img 
                              src={pokemon.sprite} 
                              alt={pokemon.name}
                              className="w-16 h-16 mx-auto"
                            />
                          )}
                          <div className="text-center">
                            <p className="font-medium">
                              {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}
                            </p>
                            <div className="flex flex-wrap gap-1 justify-center mt-1">
                              {pokemon.types?.map((type) => (
                                <span
                                  key={type}
                                  className="text-xs px-2 py-0.5 rounded bg-primary/20"
                                >
                                  {type}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>

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
                disabled={loading || !selectedPokemon}
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