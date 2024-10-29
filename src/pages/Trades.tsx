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
    <div className="space-y-8">
      <div className="page-header">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Histórico de Trocas
        </h1>
      </div>

      <div className="space-y-4">
        {trades.map((trade) => (
          <Card key={trade.id} className="card-hover-effect card-gradient-border">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="text-xl flex items-center gap-2">
                <span className="text-primary">{trade.initiator.username}</span>
                <span className="text-sm text-muted-foreground">↔️</span>
                <span className="text-primary">{trade.receiver.username}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-center gap-8 justify-center">
                <div className="text-center group w-full sm:w-auto">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent rounded-lg blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-70" />
                    <img
                      src={trade.initiator_pokemon.pokemon_image_url}
                      alt={trade.initiator_pokemon.pokemon_name}
                      className="w-40 h-40 object-contain relative z-10 group-hover:scale-110 transition-transform"
                    />
                  </div>
                  <p className="mt-4 font-medium capitalize text-lg">
                    {trade.initiator_pokemon.pokemon_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    De: {trade.initiator.username}
                  </p>
                </div>

                <div className="text-3xl text-primary/60 rotate-90 sm:rotate-0">⇄</div>

                <div className="text-center group w-full sm:w-auto">
                  {trade.receiver_pokemon ? (
                    <>
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent rounded-lg blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-70" />
                        <img
                          src={trade.receiver_pokemon.pokemon_image_url}
                          alt={trade.receiver_pokemon.pokemon_name}
                          className="w-40 h-40 object-contain relative z-10 group-hover:scale-110 transition-transform"
                        />
                      </div>
                      <p className="mt-4 font-medium capitalize text-lg">
                        {trade.receiver_pokemon.pokemon_name}
                      </p>
                    </>
                  ) : (
                    <div className="w-40 h-40 flex items-center justify-center border-2 border-dashed border-primary/20 rounded-lg">
                      <span className="text-muted-foreground">Nenhum Pokémon selecionado</span>
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">
                    De: {trade.receiver.username}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row justify-end gap-2">
                {trade.status === 'pending' && trade.receiver_user_id === user?.id && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => handleTradeAction(trade.id, 'reject')}
                      className="hover:bg-destructive/10 hover:text-destructive"
                    >
                      Recusar
                    </Button>
                    <Button
                      onClick={() => handleTradeAction(trade.id, 'accept')}
                      className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                    >
                      Aceitar
                    </Button>
                  </>
                )}
                {trade.status !== 'pending' && (
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                    trade.status === 'accepted' 
                      ? 'bg-green-500/10 text-green-500'
                      : 'bg-red-500/10 text-red-500'
                  }`}>
                    {trade.status === 'accepted' ? 'Aceita' : 'Recusada'}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {trades.length === 0 && (
          <div className="text-center py-12 bg-accent/50 rounded-lg border border-border/50">
            <p className="text-lg text-muted-foreground">Nenhuma troca encontrada</p>
          </div>
        )}
      </div>
    </div>
  );
}