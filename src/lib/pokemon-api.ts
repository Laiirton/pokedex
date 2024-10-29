import { toast } from 'sonner';

interface PokemonType {
  slot: number;
  type: {
    name: string;
    url: string;
  };
}

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

interface PokemonDetails {
  id: number;
  name: string;
  sprites: PokemonSprites;
  types: PokemonType[];
  is_legendary: boolean;
  is_mythical: boolean;
}

export async function getPokemonDetails(pokemonName: string): Promise<PokemonDetails | null> {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`);
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar pokémon: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro na API do Pokémon:', error);
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