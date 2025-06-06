import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/AuthContext';
import { User, Mail, MapPin, Waves, Settings, Bell, Shield, Trash2, MessageSquare, Phone } from 'lucide-react';

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
  if (!fullName) return 'Surfista';
  const firstName = fullName.trim().split(' ')[0];
  return firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
};

const Account = () => {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [selectedCity, setSelectedCity] = useState('recife');
  const [notifications, setNotifications] = useState(true);

  const cities = [
    { value: 'recife', label: 'Recife, PE' },
    { value: 'salvador', label: 'Salvador, BA' },
    { value: 'florianopolis', label: 'Florianópolis, SC' },
    { value: 'rio', label: 'Rio de Janeiro, RJ' },
    { value: 'santos', label: 'Santos, SP' },
    { value: 'natal', label: 'Natal, RN' },
    { value: 'fortaleza', label: 'Fortaleza, CE' },
    { value: 'vitoria', label: 'Vitória, ES' }
  ];

  const surfLevel = [
    { value: 'iniciante', label: 'Iniciante' },
    { value: 'intermediario', label: 'Intermediário' },
    { value: 'avancado', label: 'Avançado' },
    { value: 'profissional', label: 'Profissional' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header da conta */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-ocean-600 to-ocean-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {getFormattedFirstName(user)}
          </h1>
          <p className="text-gray-600">{user?.email}</p>
          <Badge variant="secondary" className="mt-2">
            <Waves className="h-3 w-3 mr-1" />
            Membro desde {user && 'created_at' in user && user.created_at
              ? new Date(user.created_at as string).getFullYear()
              : 'Ano desconhecido'}
          </Badge>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Informações Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2 text-ocean-600" />
                Informações Pessoais
              </CardTitle>
              <CardDescription>
                Gerencie suas informações de perfil
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="city">Cidade Principal</Label>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione sua cidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.value} value={city.value}>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-ocean-600" />
                          {city.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="level">Nível de Surf</Label>
                <Select defaultValue="intermediario">
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione seu nível" />
                  </SelectTrigger>
                  <SelectContent>
                    {surfLevel.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        <div className="flex items-center">
                          <Waves className="h-4 w-4 mr-2 text-ocean-600" />
                          {level.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full bg-ocean-gradient text-white">
                Salvar Alterações
              </Button>
            </CardContent>
          </Card>

          {/* Preferências */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2 text-ocean-600" />
                Preferências
              </CardTitle>
              <CardDescription>
                Configure suas preferências de surf
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bell className="h-4 w-4 text-ocean-600" />
                  <div>
                    <Label className="text-sm font-medium">Notificações Push</Label>
                    <p className="text-xs text-gray-500">Alertas de swells e condições</p>
                  </div>
                </div>
                <Button
                  variant={notifications ? "default" : "outline"}
                  size="sm"
                  onClick={() => setNotifications(!notifications)}
                  className={notifications ? "bg-ocean-600" : ""}
                >
                  {notifications ? "Ativado" : "Desativado"}
                </Button>
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <Label className="text-sm font-medium">Alertas Personalizados</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Ondas {'>'} 1.5m</span>
                    <Button variant="outline" size="sm">Ativar</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Vento offshore</span>
                    <Button variant="outline" size="sm">Ativar</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Período {'>'} 10s</span>
                    <Button variant="outline" size="sm">Ativar</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Suporte */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-ocean-600" />
                Suporte
              </CardTitle>
              <CardDescription>
                Precisa de ajuda? Entre em contato
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Mail className="h-4 w-4 mr-2" />
                Enviar Email
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Phone className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
              <Button variant="outline" className="w-full justify-start text-amber-600 hover:text-amber-700">
                <MessageSquare className="h-4 w-4 mr-2" />
                Relatar um Problema
              </Button>
            </CardContent>
          </Card>

          {/* Configurações de Conta */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2 text-ocean-600" />
                Conta
              </CardTitle>
              <CardDescription>
                Configurações de segurança e conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                Alterar Senha
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Shield className="h-4 w-4 mr-2" />
                Privacidade
              </Button>
              <Separator />
              <Button variant="destructive" className="w-full justify-start">
                <Trash2 className="h-4 w-4 mr-2" />
                Deletar Conta
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Frase inspiracional */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-ocean-600 to-ocean-800 text-white rounded-2xl p-8 relative overflow-hidden">
            <div className="relative z-10">
              <Waves className="h-8 w-8 mx-auto mb-4 text-ocean-200" />
              <blockquote className="text-xl md:text-2xl font-medium italic mb-4">
                "O melhor surfista é aquele que mais se diverte"
              </blockquote>
              <cite className="text-ocean-200 font-normal">— Luca Aguiar</cite>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Account;
