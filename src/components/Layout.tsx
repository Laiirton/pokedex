import { useAuth } from '@/contexts/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Gamepad2, ListFilter, RefreshCcw, User, CircleDot } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Gamepad2 },
    { name: 'Pokémon List', href: '/pokemon', icon: ListFilter },
    { name: 'Trades', href: '/trades', icon: RefreshCcw },
    { name: 'Companion', href: '/companion', icon: User },
    {
      name: 'Capturar',
      href: '/catch',
      icon: CircleDot
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
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
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => logout()}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}