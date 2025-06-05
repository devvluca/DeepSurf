import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Waves, Menu, Chrome } from 'lucide-react';
import LoginModal from '@/components/LoginModal';
import { useAuth } from './AuthContext';

const Header = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
            <img 
              src="/img/deepsurf.png" 
              alt="DeepSurf Logo" 
              className="h-10 w-10"
            />
            <span className="text-2xl font-bold bg-ocean-gradient bg-clip-text text-transparent">
              DeepSurf
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => navigate('/')}
              className="text-gray-700 hover:text-ocean-600 transition-colors"
            >
              Home
            </button>
            <button 
              onClick={() => navigate('/map')}
              className="text-gray-700 hover:text-ocean-600 transition-colors"
            >
              Mapa de Ondas
            </button>
            <button 
              onClick={() => {
                if (user) {
                  navigate('/profile');
                } else {
                  setShowLoginPrompt(true);
                }
              }}
              className="text-gray-700 hover:text-ocean-600 transition-colors"
            >
              Perfil
            </button>
            <button 
              onClick={() => navigate('/about')}
              className="text-gray-700 hover:text-ocean-600 transition-colors"
            >
              Sobre
            </button>
          </nav>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-ocean-600" />
                  <span className="text-gray-700">
                    {user?.name
                      ? (() => {
                          const first = user.name.split(' ')[0];
                          return `Aloha, ${first.charAt(0).toUpperCase()}${first.slice(1).toLowerCase()}!`;
                        })()
                      : 'Aloha!'}
                  </span>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="border-ocean-200 text-ocean-600 hover:bg-ocean-50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </div>
            ) : (
              <Button
                className="bg-ocean-gradient text-white hover:opacity-90 transition-opacity"
                onClick={() => { setIsLoginOpen(true); }}
              >
                Entrar
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <button 
                onClick={() => { navigate('/'); setMobileMenuOpen(false); }}
                className="text-left text-gray-700 hover:text-ocean-600 transition-colors"
              >
                Home
              </button>
              <button 
                onClick={() => { navigate('/map'); setMobileMenuOpen(false); }}
                className="text-left text-gray-700 hover:text-ocean-600 transition-colors"
              >
                Mapa de Ondas
              </button>
              <button 
                onClick={() => {
                  if (user) {
                    navigate('/profile');
                    setMobileMenuOpen(false);
                  } else {
                    setShowLoginPrompt(true);
                    setMobileMenuOpen(false);
                  }
                }}
                className="text-left text-gray-700 hover:text-ocean-600 transition-colors"
              >
                Perfil
              </button>
              <button 
                onClick={() => { navigate('/about'); setMobileMenuOpen(false); }}
                className="text-left text-gray-700 hover:text-ocean-600 transition-colors"
              >
                Sobre
              </button>
              <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full bg-ocean-gradient text-white">
                    Entrar
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-center text-2xl font-bold text-gray-900">
                      Entre na DeepSurf
                    </DialogTitle>
                  </DialogHeader>
                  
                  {/* Google Login Button */}
                  <Button
                    variant="outline"
                    className="w-full mb-4"
                  >
                    <Chrome className="h-4 w-4 mr-2" />
                    Entrar com Google
                  </Button>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Ou
                      </span>
                    </div>
                  </div>
                  
                  <form className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="email-mobile">Email</Label>
                      <Input
                        id="email-mobile"
                        type="email"
                        placeholder="seu@email.com"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="password-mobile">Senha</Label>
                      <Input
                        id="password-mobile"
                        type="password"
                        placeholder="••••••••"
                        className="mt-1"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-ocean-gradient text-white"
                    >
                      Entrar
                    </Button>
                  </form>
                  
                  <div className="text-center mt-4">
                    <button
                      onClick={() => { setIsLoginOpen(false); }}
                      className="text-sm text-ocean-600 hover:underline"
                    >
                      Já tem conta? Entre
                    </button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        )}

        {/* Modal de login para acesso ao perfil */}
        <LoginModal open={isLoginOpen} setOpen={setIsLoginOpen} />
        <Dialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
          <DialogContent className="sm:max-w-md bg-white/90 backdrop-blur">
            <DialogHeader>
              <DialogTitle className="text-center text-2xl font-bold text-gray-900">
                Faça login para acessar seu perfil
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center space-y-4 py-4">
              <Button
                className="w-full bg-ocean-gradient text-white"
                onClick={() => {
                  setShowLoginPrompt(false);
                  setIsLoginOpen(true);
                }}
              >
                Fazer Login
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowLoginPrompt(false)}
              >
                Cancelar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
};

export default Header;
