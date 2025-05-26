
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Waves, Menu, Chrome } from 'lucide-react';

const Header = () => {
  const { user, login, logout, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      setIsLoginOpen(false);
      setEmail('');
      setPassword('');
      setName('');
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // Simulação de login com Google
      await new Promise(resolve => setTimeout(resolve, 1500));
      await login('usuario@gmail.com', 'google-auth');
      setIsLoginOpen(false);
    } catch (error) {
      console.error('Google login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
            <img 
              src="/lovable-uploads/deepsurf.png" 
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
            {isAuthenticated && (
              <button 
                onClick={() => navigate('/profile')}
                className="text-gray-700 hover:text-ocean-600 transition-colors"
              >
                Perfil
              </button>
            )}
            <button 
              onClick={() => navigate('/about')}
              className="text-gray-700 hover:text-ocean-600 transition-colors"
            >
              Sobre
            </button>
          </nav>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-ocean-600" />
                  <span className="text-gray-700">Olá, {user?.name}</span>
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
              <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-ocean-gradient text-white hover:opacity-90 transition-opacity">
                    Entrar
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-center text-2xl font-bold text-gray-900">
                      {isLogin ? 'Entre na DeepSurf' : 'Crie sua conta'}
                    </DialogTitle>
                  </DialogHeader>
                  
                  {/* Google Login Button */}
                  <Button
                    onClick={handleGoogleLogin}
                    variant="outline"
                    className="w-full mb-4"
                    disabled={isLoading}
                  >
                    <Chrome className="h-4 w-4 mr-2" />
                    {isLogin ? 'Entrar' : 'Cadastrar'} com Google
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
                  
                  <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    {!isLogin && (
                      <div>
                        <Label htmlFor="name">Nome Completo</Label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="Seu nome completo"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          className="mt-1"
                        />
                      </div>
                    )}
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">Senha</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-ocean-gradient text-white"
                      disabled={isLoading}
                    >
                      {isLoading ? (isLogin ? 'Entrando...' : 'Cadastrando...') : (isLogin ? 'Entrar' : 'Cadastrar')}
                    </Button>
                  </form>
                  
                  <div className="text-center mt-4">
                    <button
                      onClick={switchMode}
                      className="text-sm text-ocean-600 hover:underline"
                    >
                      {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entre'}
                    </button>
                  </div>
                </DialogContent>
              </Dialog>
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
              {isAuthenticated && (
                <button 
                  onClick={() => { navigate('/profile'); setMobileMenuOpen(false); }}
                  className="text-left text-gray-700 hover:text-ocean-600 transition-colors"
                >
                  Perfil
                </button>
              )}
              <button 
                onClick={() => { navigate('/about'); setMobileMenuOpen(false); }}
                className="text-left text-gray-700 hover:text-ocean-600 transition-colors"
              >
                Sobre
              </button>
              {!isAuthenticated && (
                <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-ocean-gradient text-white">
                      Entrar
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-center text-2xl font-bold text-gray-900">
                        {isLogin ? 'Entre na DeepSurf' : 'Crie sua conta'}
                      </DialogTitle>
                    </DialogHeader>
                    
                    {/* Google Login Button */}
                    <Button
                      onClick={handleGoogleLogin}
                      variant="outline"
                      className="w-full mb-4"
                      disabled={isLoading}
                    >
                      <Chrome className="h-4 w-4 mr-2" />
                      {isLogin ? 'Entrar' : 'Cadastrar'} com Google
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
                    
                    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                      {!isLogin && (
                        <div>
                          <Label htmlFor="name-mobile">Nome Completo</Label>
                          <Input
                            id="name-mobile"
                            type="text"
                            placeholder="Seu nome completo"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="mt-1"
                          />
                        </div>
                      )}
                      <div>
                        <Label htmlFor="email-mobile">Email</Label>
                        <Input
                          id="email-mobile"
                          type="email"
                          placeholder="seu@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="password-mobile">Senha</Label>
                        <Input
                          id="password-mobile"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="mt-1"
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-ocean-gradient text-white"
                        disabled={isLoading}
                      >
                        {isLoading ? (isLogin ? 'Entrando...' : 'Cadastrando...') : (isLogin ? 'Entrar' : 'Cadastrar')}
                      </Button>
                    </form>
                    
                    <div className="text-center mt-4">
                      <button
                        onClick={switchMode}
                        className="text-sm text-ocean-600 hover:underline"
                      >
                        {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entre'}
                      </button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
