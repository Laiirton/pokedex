import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

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

      // Insert the Pokémon into the user's collection
      const { error } = await supabase.from('pokemon_generated').insert({
        user_id: userId,
        pokemon_id: Number(pokemonId),
        is_shiny: isShiny,
        // Add other necessary fields if any
      });

      if (error) {
        throw error;
      }

      toast.success('Pokémon concedido com sucesso');
      // Clear the form
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
    <div className="p-6 max-w-lg mx-auto mt-10 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Dashboard de Admin</h1>
      <div className="space-y-4">
        <input
          type="text"
          placeholder="ID do Usuário"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        />
        <input
          type="text"
          placeholder="ID do Pokémon"
          value={pokemonId}
          onChange={(e) => setPokemonId(e.target.value)}
          className="w-full px-3 py-2 border rounded"
        />
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={isShiny}
            onChange={(e) => setIsShiny(e.target.checked)}
            className="mr-2"
          />
          Pokémon Shiny?
        </label>
        <button
          onClick={givePokemon}
          disabled={loading}
          className="w-full py-2 px-4 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600"
        >
          {loading ? 'Concedendo...' : 'Conceder Pokémon'}
        </button>
      </div>
    </div>
  );
}
