import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getAllPokemon, getPokemonDetails } from '@/lib/pokemon-api';
import { PokemonCard } from '@/components/PokemonCard';

interface CapturedPokemon {
  name: string;
  imageUrl: string;
  isShiny: boolean;
  isLegendary: boolean;
  isMythical: boolean;
  count: number;
}

export default function CatchPokemon() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [availablePokemon, setAvailablePokemon] = useState<{ name: string; url: string }[]>([]);
  const [capturedPokemon, setCapturedPokemon] = useState<CapturedPokemon[]>([]);

  useEffect(() => {
    fetchAvailablePokemon();
  }, []);

  async function fetchAvailablePokemon() {
    setLoading(true);
    const pokemon = await getAllPokemon();
    setAvailablePokemon(pokemon);
    setLoading(false);
  }

  async function checkExistingPokemon(pokemonName: string) {
    const { data } = await supabase
      .from('pokemon_generated')
      .select('id, count, pokemon_image_url, is_shiny, is_legendary, is_mythical')
      .eq('user_id', user?.id)
      .eq('pokemon_name', pokemonName)
      .single();

    return data;
  }

  async function catchPokemon(pokemonName: string) {
    if (!user?.id) return;

    const existingPokemon = await checkExistingPokemon(pokemonName);
    if (existingPokemon) {
      // Atualizar contagem se o Pokémon já existir
      const { error } = await supabase
        .from('pokemon_generated')
        .update({ count: existingPokemon.count + 1 })
        .eq('id', existingPokemon.id);

      if (error) {
        toast.error('Erro ao atualizar contagem do Pokémon');
        return;
      }

      setCapturedPokemon((prev) =>
        prev.map((p) =>
          p.name === pokemonName ? { ...p, count: existingPokemon.count + 1 } : p
        )
      );

      toast.success(`Contagem de ${pokemonName} atualizada!`);
      return;
    }

    try {
      const details = await getPokemonDetails(pokemonName);
      if (!details) throw new Error('Falha ao buscar detalhes do Pokémon');

      const isShiny = Math.random() < 0.01; // 1% chance de ser shiny
      const { error } = await supabase.from('pokemon_generated').insert({
        user_id: user.id,
        pokemon_name: pokemonName,
        pokemon_image_url: details.sprites.front_default,
        is_shiny: isShiny,
        is_legendary: details.is_legendary || false,
        is_mythical: details.is_mythical || false,
        count: 1
      });

      if (error) throw error;

      setCapturedPokemon((prev) => [
        ...prev,
        {
          name: pokemonName,
          imageUrl: details.sprites.front_default,
          isShiny,
          isLegendary: details.is_legendary || false,
          isMythical: details.is_mythical || false,
          count: 1
        }
      ]);

      if (isShiny) {
        toast.success(`✨ Capturou um Shiny ${pokemonName}! ✨`);
      } else if (details.is_legendary || details.is_mythical) {
        toast.success(`🌟 Capturou um ${pokemonName} Lendário/Mítico! 🌟`);
      } else {
        toast.success(`${pokemonName} foi capturado com sucesso!`);
      }
    } catch (error) {
      toast.error('Erro ao capturar Pokémon');
      console.error(error);
    }
  }

  async function catchSinglePokemon() {
    if (!user?.id || capturing) return;

    setCapturing(true);
    try {
      const randomPokemon = availablePokemon[Math.floor(Math.random() * availablePokemon.length)];
      await catchPokemon(randomPokemon.name);
    } finally {
      setCapturing(false);
    }
  }

  async function catchMultiplePokemon() {
    if (!user?.id || capturing) return;

    setCapturing(true);
    try {
      const randomPokemon = availablePokemon.sort(() => Math.random() - 0.5).slice(0, 10);

      for (const pokemon of randomPokemon) {
        await catchPokemon(pokemon.name);
      }
    } finally {
      setCapturing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Capturar Pokémon</h1>
      </div>

      <div className="flex justify-center gap-4">
        <Button onClick={catchSinglePokemon} disabled={capturing}>
          {capturing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Capturando...
            </>
          ) : (
            'Capturar Um'
          )}
        </Button>
        <Button onClick={catchMultiplePokemon} disabled={capturing}>
          {capturing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Capturando...
            </>
          ) : (
            'Capturar Múltiplos (Max 10)'
          )}
        </Button>
      </div>

      {capturedPokemon.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Pokémon Capturados</h2>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {capturedPokemon.map((pokemon, index) => (
              <PokemonCard
                key={index}
                name={pokemon.name}
                imageUrl={pokemon.imageUrl}
                types={[]}
                isShiny={pokemon.isShiny}
                isLegendary={pokemon.isLegendary}
                isMythical={pokemon.isMythical}
                count={pokemon.count}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 