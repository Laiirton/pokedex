import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Gamepad2, ListFilter, RefreshCcw, User, CircleDot, Trophy, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Gamepad2 },
    { name: 'Pokémon List', href: '/pokemon', icon: ListFilter },
    { name: 'Trades', href: '/trades', icon: RefreshCcw },
    { name: 'Companion', href: '/companion', icon: User },
    { name: 'Capturar', href: '/catch', icon: CircleDot },
    { name: 'Ranking', href: '/ranking', icon: Trophy },
  ];

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo ou primeiro item sempre visível */}
            <div className="flex items-center">
              <Link
                to="/dashboard"
                className="flex items-center text-primary font-bold text-lg"
              >
                PoggerDex
              </Link>
            </div>

            {/* Menu para desktop */}
            <div className="hidden md:flex">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-4 border-b-2 text-sm font-medium ${
                      location.pathname === item.href
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {/* Botões da direita */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={logout}
                className="hidden md:inline-flex"
              >
                Logout
              </Button>

              {/* Botão do menu mobile */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Menu mobile */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t">
            <div className="space-y-1 px-4 pb-3 pt-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                      location.pathname === item.href
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                );
              })}
              <Button
                variant="ghost"
                onClick={logout}
                className="w-full justify-start px-3 py-2 mt-2"
              >
                Logout
              </Button>
            </div>
          </div>
        )}
      </nav>

      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}