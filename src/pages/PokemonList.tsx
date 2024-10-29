import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Loader2, Search, Filter, X } from 'lucide-react';
import { PokemonCard } from '@/components/PokemonCard';
import { getPokemonDetails } from '@/lib/pokemon-api';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectItem, SelectContent } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface PokemonSprites {
  front_default: string;
  front_shiny: string;
  other: {
    'official-artwork': {
      front_default: string;
      front_shiny: string;
    };
  };
}

interface Pokemon {
  id: number;
  user_id: string;
  pokemon_name: string;
  pokemon_image_url: string;
  types: string[];
  sprites: PokemonSprites;
  is_shiny: boolean;
  is_legendary: boolean;
  is_mythical: boolean;
  count: number;
  created_at?: string;
}

export default function PokemonList() {
  const { user } = useAuth();
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    async function fetchPokemon() {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('pokemon_generated')
          .select('*')
          .eq('user_id', user.id);

        if (error) {
          console.error('Erro ao buscar pokémon do Supabase:', error);
          setLoading(false);
          return;
        }

        if (data) {
          const enrichedData = await Promise.all(
            data.map(async (p) => {
              try {
                const details = await getPokemonDetails(p.pokemon_name.toLowerCase());
                return {
                  ...p,
                  types: details?.types?.map((t: any) => t.type.name) || [],
                  sprites: {
                    front_default: p.is_shiny
                      ? (details?.sprites as any)?.other?.['official-artwork']?.front_shiny || 
                        details?.sprites?.front_shiny
                      : (details?.sprites as any)?.other?.['official-artwork']?.front_default || 
                        details?.sprites?.front_default,
                    front_shiny: p.is_shiny
                      ? (details?.sprites as any)?.other?.['official-artwork']?.front_shiny || 
                        details?.sprites?.front_shiny
                      : (details?.sprites as any)?.other?.['official-artwork']?.front_default || 
                        details?.sprites?.front_default,
                    other: {
                      'official-artwork': {
                        front_default: p.is_shiny
                          ? (details?.sprites as any)?.other?.['official-artwork']?.front_shiny || 
                            details?.sprites?.front_shiny
                          : (details?.sprites as any)?.other?.['official-artwork']?.front_default || 
                            details?.sprites?.front_default,
                        front_shiny: p.is_shiny
                          ? (details?.sprites as any)?.other?.['official-artwork']?.front_shiny || 
                            details?.sprites?.front_shiny
                          : (details?.sprites as any)?.other?.['official-artwork']?.front_default || 
                            details?.sprites?.front_default
                      }
                    }
                  }
                };
              } catch (error) {
                console.error(`Erro ao buscar detalhes do pokémon ${p.pokemon_name}:`, error);
                return {
                  ...p,
                  types: [],
                  sprites: {
                    front_default: '',
                    front_shiny: '',
                    other: {
                      'official-artwork': {
                        front_default: '',
                        front_shiny: ''
                      }
                    }
                  }
                };
              }
            })
          );
          setPokemon(enrichedData.filter(p => p !== null));
        }
      } catch (error) {
        console.error('Erro ao buscar pokémon:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPokemon();
  }, [user?.id]);

  const groupedPokemon = pokemon.reduce((acc, p) => {
    const existingPokemon = acc.find(item => 
      item.pokemon_name === p.pokemon_name && 
      item.is_shiny === p.is_shiny
    );

    if (existingPokemon) {
      existingPokemon.count += p.count;
    } else {
      acc.push({...p});
    }

    return acc;
  }, [] as Pokemon[]);

  const filteredAndSortedPokemon = groupedPokemon
    .filter(p => {
      const matchesSearch = p.pokemon_name.toLowerCase().includes(search.toLowerCase());
      if (filter === 'all') return matchesSearch;
      if (filter === 'shiny') return matchesSearch && p.is_shiny;
      if (filter === 'legendary') return matchesSearch && p.is_legendary;
      if (filter === 'mythical') return matchesSearch && p.is_mythical;
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.pokemon_name.localeCompare(b.pokemon_name);
      if (sortBy === 'count') return b.count - a.count;
      return 0;
    });

  const stats = {
    total: groupedPokemon.length,
    shiny: groupedPokemon.filter(p => p.is_shiny).length,
    legendary: groupedPokemon.filter(p => p.is_legendary).length,
    mythical: groupedPokemon.filter(p => p.is_mythical).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="page-header">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Sua Coleção
        </h1>
        <div className="flex flex-wrap gap-3 mt-4">
          <Badge variant="outline" className="bg-accent/50">
            Total: {stats.total}
          </Badge>
          <Badge variant="outline" className="bg-yellow-500/20 text-yellow-500">
            ✨ Shiny: {stats.shiny}
          </Badge>
          <Badge variant="outline" className="bg-purple-500/20 text-purple-500">
            👑 Lendários: {stats.legendary}
          </Badge>
          <Badge variant="outline" className="bg-blue-500/20 text-blue-500">
            🌟 Míticos: {stats.mythical}
          </Badge>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-4 p-4 rounded-lg bg-accent/50 border border-border/50">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar Pokémon..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background/50"
            />
            {search && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                onClick={() => setSearch('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <div className="flex-1">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-full bg-background/50">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Pokémon</SelectItem>
                  <SelectItem value="shiny">✨ Shiny</SelectItem>
                  <SelectItem value="legendary">👑 Lendários</SelectItem>
                  <SelectItem value="mythical">🌟 Míticos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full bg-background/50">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Nome (A-Z)</SelectItem>
                  <SelectItem value="count">Quantidade</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {filteredAndSortedPokemon.length > 0 ? (
          <div className="grid gap-4 grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filteredAndSortedPokemon.map((p) => (
              <div key={`${p.pokemon_name}-${p.is_shiny}`} className="group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
                  <PokemonCard
                    name={p.pokemon_name}
                    imageUrl={p.sprites.front_default}
                    types={p.types || []}
                    isShiny={p.is_shiny}
                    isLegendary={p.is_legendary}
                    isMythical={p.is_mythical}
                    count={p.count}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 bg-accent/30 rounded-lg border border-border/50">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-lg text-muted-foreground">
              Nenhum Pokémon encontrado
            </p>
            {search && (
              <Button 
                variant="link" 
                onClick={() => setSearch('')}
                className="mt-2"
              >
                Limpar busca
              </Button>
            )}
          </div>
        )}
      </div>

      {filteredAndSortedPokemon.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Mostrando {filteredAndSortedPokemon.length} de {groupedPokemon.length} Pokémon
        </div>
      )}
    </div>
  );
}