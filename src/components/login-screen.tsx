import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import pokeball from '@/assets/icon/pokeball_gif.gif'

export function LoginScreen() {
  const [isFocused, setIsFocused] = useState(false)
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!code) {
      toast.error("Por favor digite um código de acesso")
      return
    }

    setLoading(true)
    try {
      // Aqui você pode adicionar a lógica de login
      navigate("/dashboard")
      toast.success("Bem-vindo de volta, treinador!")
    } catch (error) {
      toast.error("Código inválido ou expirado")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1613771404784-3a5686aa2be3')] bg-cover bg-center p-4">
      {/* Mantendo os elementos de background animado para o efeito de blur */}
      <div className="absolute inset-0 overflow-hidden backdrop-blur-sm bg-black/40">
        <div className="absolute -inset-[10px] opacity-50">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] animate-[blob_7s_infinite]" />
          <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-[128px] animate-[blob_7s_infinite_2s]" />
          <div className="absolute bottom-1/3 left-1/2 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] animate-[blob_7s_infinite_4s]" />
        </div>
      </div>

      <Card className="w-full max-w-md relative bg-[#1e1a2b]/90 border-0 shadow-2xl backdrop-blur-sm 
        before:absolute before:inset-0 before:bg-gradient-to-br before:from-[#9d7af7]/20 before:to-transparent before:rounded-lg before:opacity-0 hover:before:opacity-100 before:transition-opacity
        after:absolute after:inset-[1px] after:bg-[#1e1a2b]/90 after:rounded-lg">
        <CardContent className="relative z-10 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title with animation */}
            <h1 className="text-7xl font-bold text-center bg-gradient-to-r from-[#9d7af7] via-[#b49af9] to-[#9d7af7] bg-[length:200%_200%] animate-[gradient-x_15s_linear_infinite] bg-clip-text text-transparent leading-normal py-1">
              PoggerDex
            </h1>

            {/* Subtitle Section with fade in */}
            <div className="space-y-1 text-center animate-[fadeIn_0.5s_ease-in]">
              <h2 className="text-[#9d7af7] text-xl font-medium whitespace-normal px-4 hover:text-[#b49af9] transition-colors">
                Sua jornada no mundo Pokémon começa aqui
              </h2>
              <p className="text-[#9d7af7]/70 text-sm">
                Digite seu código de acesso para continuar
              </p>
            </div>

            {/* Pokeball GIF */}
            <div className="flex justify-center py-2">
              <img 
                src={pokeball}
                alt="Pokeball"
                className="w-40 h-40 cursor-pointer"
              />
            </div>

            {/* Input Field with focus animation */}
            <div className="relative group">
              <div className={`absolute -inset-1 bg-gradient-to-r from-[#9d7af7] via-[#b49af9] to-[#9d7af7] rounded-lg blur-sm transition-opacity duration-500
                ${isFocused ? 'opacity-100' : 'opacity-0'}`} />
              <Input 
                type="text"
                placeholder="Digite seu código de acesso"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                maxLength={6}
                required
                className="relative bg-[#2a2438] border-[#3d3650] text-[#9d7af7] placeholder:text-[#9d7af7]/50 h-12
                  focus:ring-2 focus:ring-[#9d7af7] focus:border-transparent transition-all duration-300
                  hover:bg-[#2f293f] hover:border-[#4d4660]"
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
              />
            </div>

            {/* Animated Submit Button */}
            <Button 
              type="submit"
              disabled={loading}
              className="w-full relative overflow-hidden group h-12 bg-gradient-to-r from-[#9d7af7] via-[#b49af9] to-[#9d7af7]
                hover:shadow-[0_0_20px_rgba(157,122,247,0.5)] transition-shadow duration-300 disabled:opacity-50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#9d7af7] via-[#b49af9] to-[#9d7af7] bg-[length:200%_200%] animate-[gradient-x_15s_linear_infinite]" />
              <div className="relative flex items-center justify-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(255,0,0,0.7)]" />
                <span className="text-base font-semibold text-white group-hover:scale-105 transition-transform">
                  {loading ? "Verificando..." : "Iniciar Jornada"}
                </span>
              </div>
            </Button>
          </form>
        </CardContent>
      </Card>

      <style>
        {`
          @keyframes blob {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
          }
          @keyframes gradient-x {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  )
}