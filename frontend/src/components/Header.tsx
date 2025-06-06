import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, LogOut, Waves, Menu, Chrome, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import LoginModal from '@/components/LoginModal';
import { useAuth } from './AuthContext';

const getFormattedFirstName = (user: any) => {
  // Tenta pegar do perfil
  let fullName = user?.name;
  // Fallback: tenta pegar do user_metadata (Google, etc)
  if ((!fullName || fullName.trim() === '') && user && user.user_metadata) {
    fullName = user.user_metadata.name || user.user_metadata.full_name || '';
  }
  // Fallback: usa email antes do @
  if ((!fullName || fullName.trim() === '') && user?.email) {
    fullName = user.email.split('@')[0];
  }
  if (!fullName) return 'Usuário';
  const firstName = fullName.trim().split(' ')[0];
  return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
};

const Header = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, loading } = useAuth();

  // Verifica se está na página inicial
  const isHomePage = location.pathname === '/';

  // Detectar scroll apenas na home
  useEffect(() => {
    if (!isHomePage) return;
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Helper para verificar se a rota está ativa
  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  // Se não for a página inicial, usar header escuro fixo
  if (!isHomePage) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-800/90 backdrop-blur-md shadow-lg">
        <div className="border-b border-gray-600/20">
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
                  className={`transition-colors ${
                    isActiveRoute('/') 
                      ? 'text-ocean-300' 
                      : 'text-white hover:text-ocean-300'
                  }`}
                >
                  Home
                </button>
                <button 
                  onClick={() => navigate('/map')}
                  className={`transition-colors ${
                    isActiveRoute('/map') 
                      ? 'text-ocean-300' 
                      : 'text-white hover:text-ocean-300'
                  }`}
                >
                  Mapa de Ondas
                </button>
                <button 
                  onClick={() => navigate('/profile')}
                  className={`transition-colors ${
                    isActiveRoute('/profile') 
                      ? 'text-ocean-300' 
                      : 'text-white hover:text-ocean-300'
                  }`}
                >
                  Perfil
                </button>
                <button 
                  onClick={() => navigate('/about')}
                  className={`transition-colors ${
                    isActiveRoute('/about') 
                      ? 'text-ocean-300' 
                      : 'text-white hover:text-ocean-300'
                  }`}
                >
                  Sobre
                </button>
              </nav>

              {/* Auth Section */}
              <div className="hidden md:flex items-center space-x-4">
                {user ? (
                  <div className="flex items-center space-x-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center space-x-2 text-white hover:bg-white/10 transition-colors">
                          <User className="h-5 w-5 text-ocean-300" />
                          <span>{`Aloha, ${getFormattedFirstName(user)}!`}</span>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => navigate('/account')}>
                          <User className="h-4 w-4 mr-2" />
                          Minha Conta
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/profile')} className="hover:bg-ocean-50 hover:text-ocean-700">
                          <Waves className="h-4 w-4 mr-2" />
                          Perfil de Surf
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                          <LogOut className="h-4 w-4 mr-2" />
                          Sair
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ) : (
                  <Button
                    className="bg-ocean-300 text-gray-800 hover:bg-ocean-300/80 transition-all"
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
                  className="text-white hover:bg-white/10 transition-all"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
              <motion.div 
                className="md:hidden py-4 border-t border-gray-600/20"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-col space-y-4">
                  <button 
                    onClick={() => { navigate('/'); setMobileMenuOpen(false); }}
                    className={`text-left transition-colors ${
                      isActiveRoute('/') 
                        ? 'text-ocean-300' 
                        : 'text-white hover:text-ocean-300'
                    }`}
                  >
                    Home
                  </button>
                  <button 
                    onClick={() => { navigate('/map'); setMobileMenuOpen(false); }}
                    className={`text-left transition-colors ${
                      isActiveRoute('/map') 
                        ? 'text-ocean-300' 
                        : 'text-white hover:text-ocean-300'
                    }`}
                  >
                    Mapa de Ondas
                  </button>
                  <button 
                    onClick={() => {
                      navigate('/profile');
                      setMobileMenuOpen(false);
                    }}
                    className={`text-left transition-colors ${
                      isActiveRoute('/profile') 
                        ? 'text-ocean-300' 
                        : 'text-white hover:text-ocean-300'
                    }`}
                  >
                    Perfil
                  </button>
                  <button 
                    onClick={() => { navigate('/about'); setMobileMenuOpen(false); }}
                    className={`text-left transition-colors ${
                      isActiveRoute('/about') 
                        ? 'text-ocean-300' 
                        : 'text-white hover:text-ocean-300'
                    }`}
                  >
                    Sobre
                  </button>
                  {user ? (
                    <div className="space-y-3 pt-2 border-t border-gray-600/20">
                      <div className="flex items-center space-x-2 px-2">
                        <User className="h-5 w-5 text-ocean-300" />
                        <span className="text-white">
                          {`Aloha, ${getFormattedFirstName(user)}!`}
                        </span>
                      </div>
                      <Button 
                        onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                        variant="outline"
                        className="w-full border-ocean-300 text-white bg-transparent hover:bg-ocean-300/20"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sair
                      </Button>
                    </div>
                  ) : (
                    <Button className="w-full bg-ocean-300 text-gray-800" onClick={() => { setIsLoginOpen(true); setMobileMenuOpen(false); }}>
                      Entrar
                    </Button>
                  )}
                </div>
              </motion.div>
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
        </div>
      </header>
    );
  }

  // Header especial para página inicial (mantém a animação original)
  return (
    <nav className="fixed z-50 w-full px-0 transition-transform duration-300 ease-in-out">
      <motion.div
        className={`mx-auto
          ${isScrolled
            ? "mt-2 rounded-2xl border border-gray-700/30 bg-gray-800/60 shadow-lg backdrop-blur-xl"
            : "bg-gray-800/50 backdrop-blur-md shadow-sm"
          }`}
        initial={false}
        animate={
          isScrolled
            ? {
                maxWidth: 'calc(100vw - 90px)',
                borderRadius: 16,
                marginTop: 8,
                paddingLeft: 16,
                paddingRight: 16
              }
            : {
                maxWidth: '100vw',
                borderRadius: 0,
                marginTop: 0,
                paddingLeft: 0,
                paddingRight: 0
              }
        }
        transition={{
          duration: 0.7,
          ease: [0.4, 0, 0.2, 1]
        }}
        style={{ overflow: 'visible' }}
      >
        <header className="border-b border-gray-600/20">
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
                  className={`transition-colors ${
                    isActiveRoute('/') 
                      ? 'text-ocean-300' 
                      : 'text-white hover:text-ocean-300'
                  }`}
                >
                  Home
                </button>
                <button 
                  onClick={() => navigate('/map')}
                  className={`transition-colors ${
                    isActiveRoute('/map') 
                      ? 'text-ocean-300' 
                      : 'text-white hover:text-ocean-300'
                  }`}
                >
                  Mapa de Ondas
                </button>
                <button 
                  onClick={() => navigate('/profile')}
                  className={`transition-colors ${
                    isActiveRoute('/profile') 
                      ? 'text-ocean-300' 
                      : 'text-white hover:text-ocean-300'
                  }`}
                >
                  Perfil
                </button>
                <button 
                  onClick={() => navigate('/about')}
                  className={`transition-colors ${
                    isActiveRoute('/about') 
                      ? 'text-ocean-300' 
                      : 'text-white hover:text-ocean-300'
                  }`}
                >
                  Sobre
                </button>
              </nav>

              {/* Auth Section */}
              <div className="hidden md:flex items-center space-x-4">
                {user ? (
                  <div className="flex items-center space-x-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center space-x-2 text-white hover:bg-white/10 transition-colors">
                          <User className="h-5 w-5 text-ocean-300" />
                          <span>{`Aloha, ${getFormattedFirstName(user)}!`}</span>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => navigate('/account')}>
                          <User className="h-4 w-4 mr-2" />
                          Minha Conta
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/profile')} className="hover:bg-ocean-50 hover:text-ocean-700">
                          <Waves className="h-4 w-4 mr-2" />
                          Perfil de Surf
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                          <LogOut className="h-4 w-4 mr-2" />
                          Sair
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ) : (
                  <Button
                    className="bg-ocean-300 text-gray-800 hover:bg-ocean-300/80 transition-all"
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
                  className="text-white hover:bg-white/10 transition-all"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
              <motion.div 
                className="md:hidden py-4 border-t border-gray-600/20"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-col space-y-4">
                  <button 
                    onClick={() => { navigate('/'); setMobileMenuOpen(false); }}
                    className={`text-left transition-colors ${
                      isActiveRoute('/') 
                        ? 'text-ocean-300' 
                        : 'text-white hover:text-ocean-300'
                    }`}
                  >
                    Home
                  </button>
                  <button 
                    onClick={() => { navigate('/map'); setMobileMenuOpen(false); }}
                    className={`text-left transition-colors ${
                      isActiveRoute('/map') 
                        ? 'text-ocean-300' 
                        : 'text-white hover:text-ocean-300'
                    }`}
                  >
                    Mapa de Ondas
                  </button>
                  <button 
                    onClick={() => {
                      navigate('/profile');
                      setMobileMenuOpen(false);
                    }}
                    className={`text-left transition-colors ${
                      isActiveRoute('/profile') 
                        ? 'text-ocean-300' 
                        : 'text-white hover:text-ocean-300'
                    }`}
                  >
                    Perfil
                  </button>
                  <button 
                    onClick={() => { navigate('/about'); setMobileMenuOpen(false); }}
                    className={`text-left transition-colors ${
                      isActiveRoute('/about') 
                        ? 'text-ocean-300' 
                        : 'text-white hover:text-ocean-300'
                    }`}
                  >
                    Sobre
                  </button>
                  {user ? (
                    <div className="space-y-3 pt-2 border-t border-gray-600/20">
                      <div className="flex items-center space-x-2 px-2">
                        <User className="h-5 w-5 text-ocean-300" />
                        <span className="text-white">
                          {`Aloha, ${getFormattedFirstName(user)}!`}
                        </span>
                      </div>
                      <Button 
                        onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                        variant="outline"
                        className="w-full border-ocean-300 text-white bg-transparent hover:bg-ocean-300/20"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sair
                      </Button>
                    </div>
                  ) : (
                    <Button className="w-full bg-ocean-300 text-gray-800" onClick={() => { setIsLoginOpen(true); setMobileMenuOpen(false); }}>
                      Entrar
                    </Button>
                  )}
                </div>
              </motion.div>
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
      </motion.div>
    </nav>
  );
};

export default Header;
