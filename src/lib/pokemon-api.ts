import { toast } from 'sonner';

interface PokemonDetails {
  id: number;
  name: string;
  sprites: {
    front_default: string;
    front_shiny: string;
  };
  types: {
    type: {
      name: string;
    };
  }[];
  is_legendary: boolean;
  is_mythical: boolean;
}

export async function getPokemonDetails(nameOrId: string | number): Promise<PokemonDetails | null> {
  try {
    const [pokemonRes, speciesRes] = await Promise.all([
      fetch(`https://pokeapi.co/api/v2/pokemon/${nameOrId}`),
      fetch(`https://pokeapi.co/api/v2/pokemon-species/${nameOrId}`)
    ]);

    if (!pokemonRes.ok || !speciesRes.ok) {
      throw new Error('Failed to fetch Pokemon data');
    }

    const pokemonData = await pokemonRes.json();
    const speciesData = await speciesRes.json();

    return {
      ...pokemonData,
      is_legendary: speciesData.is_legendary,
      is_mythical: speciesData.is_mythical
    };
  } catch (error) {
    console.error('Error fetching Pokemon:', error);
    toast.error('Failed to fetch Pokemon data');
    return null;
  }
}

export async function getAllPokemon(limit = 151): Promise<{ name: string; url: string }[]> {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch Pokemon list');
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching Pokemon list:', error);
    toast.error('Failed to fetch Pokemon list');
    return [];
  }
}