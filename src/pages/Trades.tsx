import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Trade {
  id: number;
  initiator_user_id: number;
  receiver_user_id: number;
  initiator_pokemon_id: number;
  receiver_pokemon_id: number | null;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  initiator_pokemon: {
    pokemon_name: string;
    pokemon_image_url: string;
  };
  receiver_pokemon?: {
    pokemon_name: string;
    pokemon_image_url: string;
  };
  initiator: {
    username: string;
  };
  receiver: {
    username: string;
  };
}

export default function Trades() {
  const { user } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrades() {
      try {
        const { data } = await supabase
          .from('pokemon_trades')
          .select(`
            *,
            initiator_pokemon:pokemon_generated!initiator_pokemon_id(pokemon_name, pokemon_image_url),
            receiver_pokemon:pokemon_generated!receiver_pokemon_id(pokemon_name, pokemon_image_url),
            initiator:users!initiator_user_id(username),
            receiver:users!receiver_user_id(username)
          `)
          .or(`initiator_user_id.eq.${user?.id},receiver_user_id.eq.${user?.id}`)
          .order('created_at', { ascending: false });

        if (data) {
          setTrades(data);
        }
      } catch (error) {
        console.error('Error fetching trades:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTrades();
  }, [user?.id]);

  const handleTradeAction = async (tradeId: number, action: 'accept' | 'reject') => {
    try {
      const { error } = await supabase
        .from('pokemon_trades')
        .update({ status: action === 'accept' ? 'accepted' : 'rejected' })
        .eq('id', tradeId);

      if (error) throw error;

      setTrades(trades.map(trade => 
        trade.id === tradeId 
          ? { ...trade, status: action === 'accept' ? 'accepted' : 'rejected' }
          : trade
      ));

      toast.success(`Trade ${action}ed successfully`);
    } catch (error) {
      console.error(`Error ${action}ing trade:`, error);
      toast.error(`Failed to ${action} trade`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Trade History</h1>

      <div className="space-y-4">
        {trades.map((trade) => (
          <Card key={trade.id}>
            <CardHeader>
              <CardTitle className="text-lg">
                Trade between {trade.initiator.username} and {trade.receiver.username}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="text-center">
                  <img
                    src={trade.initiator_pokemon.pokemon_image_url}
                    alt={trade.initiator_pokemon.pokemon_name}
                    className="w-32 h-32 object-contain"
                  />
                  <p className="mt-2 font-medium capitalize">
                    {trade.initiator_pokemon.pokemon_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    From: {trade.initiator.username}
                  </p>
                </div>

                <div className="text-2xl">↔️</div>

                <div className="text-center">
                  {trade.receiver_pokemon ? (
                    <>
                      <img
                        src={trade.receiver_pokemon.pokemon_image_url}
                        alt={trade.receiver_pokemon.pokemon_name}
                        className="w-32 h-32 object-contain"
                      />
                      <p className="mt-2 font-medium capitalize">
                        {trade.receiver_pokemon.pokemon_name}
                      </p>
                    </>
                  ) : (
                    <div className="w-32 h-32 flex items-center justify-center border-2 border-dashed rounded-lg">
                      No Pokémon selected
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">
                    From: {trade.receiver.username}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                {trade.status === 'pending' && trade.receiver_user_id === user?.id && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => handleTradeAction(trade.id, 'reject')}
                    >
                      Reject
                    </Button>
                    <Button
                      onClick={() => handleTradeAction(trade.id, 'accept')}
                    >
                      Accept
                    </Button>
                  </>
                )}
                {trade.status !== 'pending' && (
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    trade.status === 'accepted' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {trade.status.charAt(0).toUpperCase() + trade.status.slice(1)}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {trades.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            No trades found
          </div>
        )}
      </div>
    </div>
  );
}