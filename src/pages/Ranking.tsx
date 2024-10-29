import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Trophy, Sparkles, Crown, Star } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RankingUser {
  username: string;
  total: number;
  user_id: number;
}

export default function Ranking() {
  const [loading, setLoading] = useState(true);
  const [totalPokemon, setTotalPokemon] = useState<RankingUser[]>([]);
  const [shinyPokemon, setShinyPokemon] = useState<RankingUser[]>([]);
  const [legendaryPokemon, setLegendaryPokemon] = useState<RankingUser[]>([]);
  const [mythicalPokemon, setMythicalPokemon] = useState<RankingUser[]>([]);

  useEffect(() => {
    fetchRankings();
  }, []);

  async function fetchRankings() {
    try {
      // Total Pokémon Ranking
      const { data: totalData } = await supabase
        .rpc('get_total_ranking');

      if (totalData) {
        setTotalPokemon(totalData);
      }

      // Shiny Pokémon Ranking
      const { data: shinyData } = await supabase
        .rpc('get_shiny_ranking');

      if (shinyData) {
        setShinyPokemon(shinyData);
      }

      // Legendary Pokémon Ranking
      const { data: legendaryData } = await supabase
        .rpc('get_legendary_ranking');

      if (legendaryData) {
        setLegendaryPokemon(legendaryData);
      }

      // Mythical Pokémon Ranking
      const { data: mythicalData } = await supabase
        .rpc('get_mythical_ranking');

      if (mythicalData) {
        setMythicalPokemon(mythicalData);
      }
    } catch (error) {
      console.error('Erro ao buscar rankings:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const RankingTable = ({ data, title, icon: Icon }: { data: RankingUser[], title: string, icon: any }) => (
    <Card className="card-gradient-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl">
          <Icon className="h-6 w-6 text-primary" />
          <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {title}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table className="w-full">
          <TableHeader>
            <TableRow className="hover:bg-accent/50">
              <TableHead className="w-20 sm:w-24">Posição</TableHead>
              <TableHead>Treinador</TableHead>
              <TableHead className="text-right w-20 sm:w-24">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((user, index) => (
              <TableRow key={user.user_id} className="hover:bg-accent/50 transition-colors">
                <TableCell className="font-medium">
                  {index === 0 ? (
                    <span className="text-yellow-500">🥇 1º</span>
                  ) : index === 1 ? (
                    <span className="text-gray-400">🥈 2º</span>
                  ) : index === 2 ? (
                    <span className="text-amber-600">🥉 3º</span>
                  ) : (
                    <span className="text-muted-foreground">#{index + 1}</span>
                  )}
                </TableCell>
                <TableCell className="font-medium">{user.username}</TableCell>
                <TableCell className="text-right font-bold stats-value">
                  {user.total}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      <div className="page-header">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Ranking de Treinadores
        </h1>
      </div>
      
      <Tabs defaultValue="total" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 max-w-[600px] mx-auto">
          <TabsTrigger value="total" className="data-[state=active]:bg-primary/20">Total</TabsTrigger>
          <TabsTrigger value="shiny" className="data-[state=active]:bg-yellow-500/20">Shiny</TabsTrigger>
          <TabsTrigger value="legendary" className="data-[state=active]:bg-purple-500/20">Lendários</TabsTrigger>
          <TabsTrigger value="mythical" className="data-[state=active]:bg-blue-500/20">Míticos</TabsTrigger>
        </TabsList>

        <TabsContent value="total">
          <RankingTable data={totalPokemon} title="Ranking Total" icon={Trophy} />
        </TabsContent>

        <TabsContent value="shiny">
          <RankingTable data={shinyPokemon} title="Ranking Shiny" icon={Sparkles} />
        </TabsContent>

        <TabsContent value="legendary">
          <RankingTable data={legendaryPokemon} title="Ranking Lendários" icon={Crown} />
        </TabsContent>

        <TabsContent value="mythical">
          <RankingTable data={mythicalPokemon} title="Ranking Míticos" icon={Star} />
        </TabsContent>
      </Tabs>
    </div>
  );
} 