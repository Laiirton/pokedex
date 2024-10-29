import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Gamepad2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  if (isLoading) {
    return null;
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await login(code);
      navigate('/dashboard');
      toast.success('Bem-vindo de volta, treinador!');
    } catch (error) {
      toast.error('Código inválido ou expirado. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1613771404784-3a5686aa2be3')] bg-cover bg-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      <Card className="w-full max-w-md relative z-10 bg-card/50 backdrop-blur-md border-primary/20">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <div className="w-16 h-16 bg-primary/10 backdrop-blur-md rounded-full flex items-center justify-center mb-4 border border-primary/20">
            <Gamepad2 className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            PoggerDex Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Digite seu código de acesso"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="bg-background/50 backdrop-blur-md border-primary/20"
                required
                maxLength={6}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              disabled={loading}
            >
              {loading ? 'Verificando...' : 'Iniciar Jornada'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}