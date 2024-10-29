import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { PokemonCard } from '@/components/PokemonCard';
import { getPokemonDetails } from '@/lib/pokemon-api';

interface Pokemon {
  id: number;
  pokemon_name: string;
  pokemon_image_url: string;
  is_shiny: boolean;
  is_legendary: boolean;
  is_mythical: boolean;
  count: number;
  types?: string[];
}

export default function PokemonList() {
  const { user } = useAuth();
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

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
                  pokemon_image_url: (details?.sprites as any)?.other?.['official-artwork']?.front_default || 
                                   details?.sprites?.front_default
                };
              } catch (error) {
                console.error(`Erro ao buscar detalhes do pokémon ${p.pokemon_name}:`, error);
                return {
                  ...p,
                  types: [],
                  pokemon_image_url: '' // URL padrão ou placeholder
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

  const filteredPokemon = pokemon.filter(p => {
    const matchesSearch = p.pokemon_name.toLowerCase().includes(search.toLowerCase());
    if (filter === 'all') return matchesSearch;
    if (filter === 'shiny') return matchesSearch && p.is_shiny;
    if (filter === 'legendary') return matchesSearch && p.is_legendary;
    if (filter === 'mythical') return matchesSearch && p.is_mythical;
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search Pokémon..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-[300px]"
        />
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="sm:max-w-[200px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Pokémon</SelectItem>
            <SelectItem value="shiny">Shiny</SelectItem>
            <SelectItem value="legendary">Legendary</SelectItem>
            <SelectItem value="mythical">Mythical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {filteredPokemon.map((p) => (
          <PokemonCard
            key={p.id}
            name={p.pokemon_name}
            imageUrl={p.pokemon_image_url}
            types={p.types || []}
            isShiny={p.is_shiny}
            isLegendary={p.is_legendary}
            isMythical={p.is_mythical}
            count={p.count}
          />
        ))}
      </div>

      {filteredPokemon.length === 0 && (
        <div className="text-center text-muted-foreground py-8">
          No Pokémon found
        </div>
      )}
    </div>
  );
}