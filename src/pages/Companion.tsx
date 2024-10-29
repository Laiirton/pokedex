import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Companion {
  id: number;
  companion_name: string;
  evolution_stage: number;
  capture_count: number;
  companion_image: string;
}

export default function Companion() {
  const { user } = useAuth();
  const [companion, setCompanion] = useState<Companion | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    async function fetchCompanion() {
      try {
        const { data } = await supabase
          .from('companions')
          .select('*')
          .eq('user_id', user?.id)
          .single();

        if (data) {
          setCompanion(data);
          setNewName(data.companion_name);
        }
      } catch (error) {
        console.error('Error fetching companion:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCompanion();
  }, [user?.id]);

  const handleUpdateName = async () => {
    if (!companion) return;

    try {
      const { error } = await supabase
        .from('companions')
        .update({ companion_name: newName })
        .eq('id', companion.id);

      if (error) throw error;

      setCompanion({ ...companion, companion_name: newName });
      setEditing(false);
      toast.success('Companion name updated successfully');
    } catch (error) {
      console.error('Error updating companion name:', error);
      toast.error('Failed to update companion name');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!companion) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No companion found
      </div>
    );
  }

  const evolutionProgress = (companion.capture_count % 10) * 10;
  const capturesUntilEvolution = 10 - (companion.capture_count % 10);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Your Companion</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center">
            <div className="w-48 h-48 rounded-full overflow-hidden bg-accent">
              {companion.companion_image && (
                <img
                  src={companion.companion_image}
                  alt={companion.companion_name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            <div className="mt-4 text-center">
              {editing ? (
                <div className="flex gap-2">
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="max-w-[200px]"
                  />
                  <Button onClick={handleUpdateName}>Save</Button>
                  <Button variant="outline" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold">{companion.companion_name}</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditing(true)}
                  >
                    ✏️
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Evolution Progress</span>
              <span>{capturesUntilEvolution} captures until evolution</span>
            </div>
            <Progress value={evolutionProgress} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-accent rounded-lg">
              <div className="text-2xl font-bold">{companion.evolution_stage}</div>
              <div className="text-sm text-muted-foreground">Evolution Stage</div>
            </div>
            <div className="text-center p-4 bg-accent rounded-lg">
              <div className="text-2xl font-bold">{companion.capture_count}</div>
              <div className="text-sm text-muted-foreground">Total Captures</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}