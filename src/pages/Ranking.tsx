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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Posição</TableHead>
              <TableHead>Treinador</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((user, index) => (
              <TableRow key={user.user_id}>
                <TableCell>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                </TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell className="text-right">{user.total}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Ranking de Treinadores</h1>
      
      <Tabs defaultValue="total" className="space-y-4">
        <TabsList>
          <TabsTrigger value="total">Total</TabsTrigger>
          <TabsTrigger value="shiny">Shiny</TabsTrigger>
          <TabsTrigger value="legendary">Lendários</TabsTrigger>
          <TabsTrigger value="mythical">Míticos</TabsTrigger>
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