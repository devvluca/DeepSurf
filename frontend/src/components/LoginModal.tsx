import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Chrome } from 'lucide-react';
import { useAuth } from './AuthContext';

interface LoginModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ open, setOpen }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { login, signup, loginWithGoogle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(name, email, password);
      }
      setOpen(false);
      setEmail('');
      setPassword('');
      setName('');
    } catch (error: any) {
      alert('Erro: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
      setOpen(false);
    } catch (error: any) {
      alert('Erro ao logar com Google: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin((prev) => !prev);
    setEmail('');
    setPassword('');
    setName('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-gray-900">
            {isLogin ? 'Entre na DeepSurf' : 'Crie sua conta'}
          </DialogTitle>
        </DialogHeader>
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
  );
};

export default LoginModal;
