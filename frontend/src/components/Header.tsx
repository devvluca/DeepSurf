import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, LogOut, Waves, Menu, Chrome } from 'lucide-react';
import { motion } from 'framer-motion';
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

  // Detectar scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Se não for a página inicial, usar header padrão
  if (!isHomePage) {
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
                      {`Aloha, ${getFormattedFirstName(user)}!`}
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
                <Button className="w-full bg-ocean-gradient text-white" onClick={() => { setIsLoginOpen(true); setMobileMenuOpen(false); }}>
                  Entrar
                </Button>
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
  }

  // Header especial para página inicial
  return (
    <nav className="fixed z-50 w-full px-0 transition-transform duration-300 ease-in-out">
      <motion.div
        className={`mx-auto group
          ${isScrolled
            ? "mt-2 rounded-2xl border border-gray-700/30 bg-gray-800/60 shadow-lg backdrop-blur-xl hover:bg-white/80 hover:border-gray-200/40"
            : "bg-gray-800/50 backdrop-blur-md shadow-sm hover:bg-white/75"
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
        <header className="border-b border-gray-600/20 group-hover:border-gray-200/20 transition-colors duration-1000">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo */}
              <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
                <img 
                  src="/img/deepsurf.png" 
                  alt="DeepSurf Logo" 
                  className="h-10 w-10"
                />
                <span className="text-2xl font-bold bg-ocean-gradient bg-clip-text text-transparent group-hover:text-gray-800 transition-colors duration-1000">
                  DeepSurf
                </span>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-8">
                <button 
                  onClick={() => navigate('/')}
                  className="text-white group-hover:text-gray-800 hover:text-ocean-300 group-hover:hover:text-ocean-700 transition-colors duration-1000"
                >
                  Home
                </button>
                <button 
                  onClick={() => navigate('/map')}
                  className="text-white group-hover:text-gray-800 hover:text-ocean-300 group-hover:hover:text-ocean-700 transition-colors duration-1000"
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
                  className="text-white group-hover:text-gray-800 hover:text-ocean-300 group-hover:hover:text-ocean-700 transition-colors duration-1000"
                >
                  Perfil
                </button>
                <button 
                  onClick={() => navigate('/about')}
                  className="text-white group-hover:text-gray-800 hover:text-ocean-300 group-hover:hover:text-ocean-700 transition-colors duration-1000"
                >
                  Sobre
                </button>
              </nav>

              {/* Auth Section */}
              <div className="hidden md:flex items-center space-x-4">
                {user ? (
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <User className="h-5 w-5 text-ocean-300 group-hover:text-ocean-700 transition-colors duration-1000" />
                      <span className="text-white group-hover:text-gray-800 transition-colors duration-1000">
                        {`Aloha, ${getFormattedFirstName(user)}!`}
                      </span>
                    </div>
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      size="sm"
                      className="border-ocean-300 text-white bg-transparent hover:bg-ocean-300/20 group-hover:border-ocean-700 group-hover:text-ocean-700 group-hover:bg-transparent group-hover:hover:bg-ocean-700/20 transition-all duration-1000"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sair
                    </Button>
                  </div>
                ) : (
                  <Button
                    className="bg-ocean-300 text-gray-800 hover:bg-ocean-300/80 group-hover:bg-ocean-700 group-hover:text-white group-hover:hover:bg-ocean-700/80 transition-all duration-1000"
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
                  className="text-white group-hover:text-gray-800 hover:bg-white/10 group-hover:hover:bg-gray-100/20 transition-all duration-1000"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
              <motion.div 
                className="md:hidden py-4 border-t border-gray-600/20 group-hover:border-gray-200/20 transition-colors duration-1000"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-col space-y-4">
                  <button 
                    onClick={() => { navigate('/'); setMobileMenuOpen(false); }}
                    className="text-left text-white group-hover:text-gray-800 hover:text-ocean-300 group-hover:hover:text-ocean-700 transition-colors duration-1000"
                  >
                    Home
                  </button>
                  <button 
                    onClick={() => { navigate('/map'); setMobileMenuOpen(false); }}
                    className="text-left text-white group-hover:text-gray-800 hover:text-ocean-300 group-hover:hover:text-ocean-700 transition-colors duration-1000"
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
                    className="text-left text-white group-hover:text-gray-800 hover:text-ocean-300 group-hover:hover:text-ocean-700 transition-colors duration-1000"
                  >
                    Perfil
                  </button>
                  <button 
                    onClick={() => { navigate('/about'); setMobileMenuOpen(false); }}
                    className="text-left text-white group-hover:text-gray-800 hover:text-ocean-300 group-hover:hover:text-ocean-700 transition-colors duration-1000"
                  >
                    Sobre
                  </button>
                  <Button className="w-full bg-ocean-300 text-gray-800 group-hover:bg-ocean-700 group-hover:text-white transition-all duration-1000" onClick={() => { setIsLoginOpen(true); setMobileMenuOpen(false); }}>
                    Entrar
                  </Button>
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
