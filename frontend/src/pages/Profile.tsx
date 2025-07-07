import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { User, Settings, History, TrendingUp, Waves, MapPin, Star, Calendar, Pencil, Trash2, Mail, Weight, Award, Heart, UserCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/lib/supabaseClient';

const Profile = () => {
  const { user, updateProfile, loading: authLoading } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    boardType: user?.board_type || '',
    weight: user?.weight || 0,
    level: user?.level || '',
    preferences: user?.preferences || ''
  });

  // Sessões de surf do Supabase
  const [surfSessions, setSurfSessions] = useState<any[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [editingSessionId, setEditingSessionId] = useState<number | null>(null);
  const [progressFilter, setProgressFilter] = useState<'all' | 'year' | 'month'>('all');
  const [newSession, setNewSession] = useState({
    date: new Date().toISOString().split('T')[0], // Data de hoje como padrão
    location: '',
    duration: '',
    waves: '',
    rating: 3,
    notes: ''
  });

  // Estatísticas reais - MOVIDO PARA CIMA ANTES DOS RETURNS
  const stats = React.useMemo(() => {
    if (!surfSessions.length) {
      return {
        total: 0,
        avgRating: 0,
        totalHours: 0,
        beaches: 0,
      };
    }
    const total = surfSessions.length;
    const avgRating = (
      surfSessions.reduce((acc, s) => acc + (s.rating || 0), 0) / total
    ).toFixed(1);
    // Soma horas a partir do campo duration (espera formato "2h 30min")
    let totalMinutes = 0;
    surfSessions.forEach(s => {
      const match = s.duration.match(/(\d+)h\s*(\d+)?/);
      if (match) {
        totalMinutes += parseInt(match[1]) * 60 + (parseInt(match[2]) || 0);
      }
    });
    const totalHours = Math.round(totalMinutes / 60);
    const beaches = new Set(surfSessions.map(s => s.location)).size;
    return { total, avgRating, totalHours, beaches };
  }, [surfSessions]);

  // Progresso dos últimos meses para o gráfico - MOVIDO PARA CIMA
  const progressData = React.useMemo(() => {
    if (!surfSessions.length) return [];

    const now = new Date();
    let filteredSessions = surfSessions;

    // Filtrar sessões baseado no período selecionado
    if (progressFilter === 'year') {
      const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      filteredSessions = surfSessions.filter(s => new Date(s.date) >= yearAgo);
    } else if (progressFilter === 'month') {
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      filteredSessions = surfSessions.filter(s => new Date(s.date) >= monthAgo);
    }

    // Agrupa sessões por período baseado no filtro
    const periodsMap: { [key: string]: { sessions: number; totalRating: number } } = {};
    
    filteredSessions.forEach((s) => {
      const date = new Date(s.date);
      let period: string;
      
      if (progressFilter === 'month') {
        // Para filtro mensal, agrupa por semana
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        period = `Sem ${Math.ceil(date.getDate() / 7)} - ${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      } else {
        // Para filtro anual ou tudo, agrupa por mês
        period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }
      
      if (!periodsMap[period]) {
        periodsMap[period] = { sessions: 0, totalRating: 0 };
      }
      periodsMap[period].sessions += 1;
      periodsMap[period].totalRating += s.rating || 0;
    });

    // Ordena períodos e prepara dados
    const periods = Object.keys(periodsMap).sort();
    return periods.map((period) => ({
      period: progressFilter === 'month' ? period : period.substring(5), // Remove ano se não for filtro mensal
      sessions: periodsMap[period].sessions,
      avgRating: periodsMap[period].sessions
        ? Number((periodsMap[period].totalRating / periodsMap[period].sessions).toFixed(2))
        : 0,
    }));
  }, [surfSessions, progressFilter]);

  // Recomendações baseadas no histórico real - MOVIDO PARA CIMA
  const recommendations = React.useMemo(() => {
    if (!surfSessions.length) {
      return [
        {
          location: 'Comece seu histórico',
          confidence: 'Média',
          reason: 'Adicione sua primeira sessão para receber recomendações personalizadas!',
          time: 'Registre suas experiências',
        }
      ];
    }

    const recs = [];
    
    // 1. Local favorito (mais frequentado)
    const locationCounts = surfSessions.reduce((acc, session) => {
      acc[session.location] = (acc[session.location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const favoriteLocation = Object.entries(locationCounts)
      .sort(([,a], [,b]) => Number(b) - Number(a))[0];
    
    if (favoriteLocation && Number(favoriteLocation[1]) > 1) {
      const sessions = surfSessions.filter(s => s.location === favoriteLocation[0]);
      const avgRating = sessions.reduce((acc, s) => acc + s.rating, 0) / sessions.length;
      const lastSession = sessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      
      recs.push({
        location: favoriteLocation[0],
        confidence: 'Alta',
        reason: `Seu local favorito! ${favoriteLocation[1]} sessões com média ${avgRating.toFixed(1)} estrelas. Última vez: ondas de ${lastSession.waves}.`,
        time: `Melhor experiência: ${lastSession.duration}`,
      });
    }

    // 2. Local com melhor avaliação (se diferente do favorito)
    const locationRatings = surfSessions.reduce((acc, session) => {
      if (!acc[session.location]) {
        acc[session.location] = { total: 0, count: 0, sessions: [] };
      }
      acc[session.location].total += session.rating;
      acc[session.location].count += 1;
      acc[session.location].sessions.push(session);
      return acc;
    }, {} as Record<string, { total: number; count: number; sessions: any[] }>);

    const bestRatedLocation = Object.entries(locationRatings)
      .map(([location, data]: [string, { total: number; count: number; sessions: any[] }]) => ({
        location,
        avgRating: data.total / data.count,
        count: data.count,
        sessions: data.sessions
      }))
      .filter(item => item.count >= 1 && item.location !== favoriteLocation?.[0])
      .sort((a, b) => b.avgRating - a.avgRating)[0];

    if (bestRatedLocation) {
      const bestSession = bestRatedLocation.sessions
        .sort((a, b) => b.rating - a.rating)[0];
      
      recs.push({
        location: bestRatedLocation.location,
        confidence: 'Alta',
        reason: `Sua melhor avaliação: ${bestRatedLocation.avgRating.toFixed(1)} estrelas! Melhor sessão teve ${bestSession.rating} estrelas com ondas de ${bestSession.waves}.`,
        time: `Duração da melhor: ${bestSession.duration}`,
      });
    }

    // 3. Baseado na última sessão bem avaliada (4+ estrelas)
    const recentGoodSessions = surfSessions
      .filter(s => s.rating >= 4)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    if (recentGoodSessions.length > 0) {
      const lastGoodSession = recentGoodSessions[0];
      if (!recs.some(r => r.location === lastGoodSession.location)) {
        const daysSince = Math.floor((Date.now() - new Date(lastGoodSession.date).getTime()) / (1000 * 60 * 60 * 24));
        
        recs.push({
          location: lastGoodSession.location,
          confidence: daysSince <= 14 ? 'Alta' : 'Média',
          reason: `Última boa sessão há ${daysSince} dias! Você deu ${lastGoodSession.rating} estrelas para ondas de ${lastGoodSession.waves}.`,
          time: `Experiência: ${lastGoodSession.duration}`,
        });
      }
    }

    // 4. Se ainda não tem 3 recomendações, usar qualquer local visitado
    if (recs.length < 3) {
      const otherLocations = Object.keys(locationCounts)
        .filter(location => !recs.some(r => r.location === location))
        .map(location => {
          const sessions = surfSessions.filter(s => s.location === location);
          const avgRating = sessions.reduce((acc, s) => acc + s.rating, 0) / sessions.length;
          const lastSession = sessions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
          return { location, avgRating, lastSession, count: sessions.length };
        })
        .sort((a, b) => b.avgRating - a.avgRating);

      otherLocations.slice(0, 3 - recs.length).forEach(item => {
        const daysSince = Math.floor((Date.now() - new Date(item.lastSession.date).getTime()) / (1000 * 60 * 60 * 24));
        recs.push({
          location: item.location,
          confidence: 'Média',
          reason: `${item.count} ${item.count === 1 ? 'sessão' : 'sessões'} com média ${item.avgRating.toFixed(1)} estrelas. Vale revisitar!`,
          time: `Última vez há ${daysSince} dias`,
        });
      });
    }

    return recs.slice(0, 3); // Máximo 3 recomendações
  }, [surfSessions]);

  // Busca perfil do banco quando usuário carrega
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      setProfileLoading(true);
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (data) {
        setProfileData(data);
      } else {
        // Cria perfil se não existir
        await supabase.from('profiles').upsert({
          id: user.id,
          name: user.name,
          email: user.email
        });
        setProfileData({ id: user.id, name: user.name, email: user.email });
      }
      setProfileLoading(false);
    };
    fetchProfile();
  }, [user]);

  // Atualiza formData quando profileData mudar
  useEffect(() => {
    if (profileData) {
      setFormData({
        name: profileData.name || '',
        email: profileData.email || '',
        boardType: profileData.board_type || '',
        weight: profileData.weight || 0,
        level: profileData.level || '',
        preferences: profileData.preferences || ''
      });
    }
  }, [profileData]);

  // Busca sessões do usuário
  useEffect(() => {
    const fetchSessions = async () => {
      if (!user) return;
      setSessionsLoading(true);
      const { data, error } = await supabase
        .from('surf_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      if (!error && data) setSurfSessions(data);
      setSessionsLoading(false);
    };
    if (user) fetchSessions();
  }, [user]);

  const handleSave = async () => {
    await updateProfile({
      name: formData.name,
      board_type: formData.boardType,
      weight: formData.weight,
      level: formData.level,
      preferences: formData.preferences,
    });
    setEditMode(false);
  };

  // Adicionar nova sessão
  const handleAddSession = async () => {
    if (!user) return;
    if (!newSession.date || !newSession.location || !newSession.duration || !newSession.waves) return;
    
    // Validação de limite de caracteres para notas
    if (newSession.notes.length > 500) {
      alert('As notas devem ter no máximo 500 caracteres.');
      return;
    }
    
    try {
      const { data, error } = await supabase.from('surf_sessions').insert([
        { ...newSession, user_id: user.id }
      ]).select();
      
      if (!error && data) {
        setSurfSessions([data[0], ...surfSessions]);
        // Feedback visual positivo
        const successMessage = document.createElement('div');
        successMessage.textContent = '✅ Sessão adicionada com sucesso!';
        successMessage.className = 'fixed top-20 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in';
        document.body.appendChild(successMessage);
        setTimeout(() => successMessage.remove(), 3000);
        
        // Reset do formulário
        setNewSession({
          date: new Date().toISOString().split('T')[0],
          location: '',
          duration: '',
          waves: '',
          rating: 3,
          notes: ''
        });
      } else {
        throw new Error(error?.message || 'Erro ao adicionar sessão');
      }
    } catch (error) {
      console.error('Erro ao adicionar sessão:', error);
      const errorMessage = document.createElement('div');
      errorMessage.textContent = '❌ Erro ao adicionar sessão. Tente novamente.';
      errorMessage.className = 'fixed top-20 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in';
      document.body.appendChild(errorMessage);
      setTimeout(() => errorMessage.remove(), 3000);
    }
  };

  // Excluir sessão
  const handleDeleteSession = async (id: number) => {
    await supabase.from('surf_sessions').delete().eq('id', id);
    setSurfSessions(surfSessions.filter(s => s.id !== id));
  };

  // Editar sessão
  const handleEditSession = (id: number) => {
    setEditingSessionId(id);
  };

  // Salvar edição de sessão
  const handleSaveSession = async (id: number, updated: typeof newSession) => {
    const { error } = await supabase.from('surf_sessions').update(updated).eq('id', id);
    if (!error) {
      setSurfSessions(surfSessions.map(s => s.id === id ? { ...s, ...updated } : s));
      setEditingSessionId(null);
    }
  };

  // MUDAR ESTA CONDIÇÃO - só esperar o auth, não as sessões
  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 pt-16">
        <Header />
        
        {/* Hero Section com fundo oceânico */}
        <section className="relative overflow-hidden bg-gradient-to-br from-ocean-900 via-ocean-800 to-ocean-600 min-h-[calc(100vh-4rem)] flex items-center">
          {/* Fundo com ondas animadas */}
          <div className="absolute inset-0 wave-animation opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
          
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <div className="space-y-8">
              {/* Ícone de usuário grande */}
              <div className="mx-auto w-24 h-24 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
                <User className="h-12 w-12 text-ocean-300" />
              </div>
              
              {/* Título e descrição */}
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                  Acesso Restrito
                </h1>
                <p className="text-xl text-ocean-100 max-w-2xl mx-auto">
                  Você precisa estar logado para acessar seu perfil e gerenciar suas sessões de surf.
                </p>
              </div>
              
              {/* Card com informações */}
              <div className="max-w-md mx-auto">
                <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center text-ocean-200">
                        <Waves className="h-5 w-5 mr-3 text-ocean-300" />
                        <span>Registre suas sessões de surf</span>
                      </div>
                      <div className="flex items-center text-ocean-200">
                        <TrendingUp className="h-5 w-5 mr-3 text-ocean-300" />
                        <span>Acompanhe seu progresso</span>
                      </div>
                      <div className="flex items-center text-ocean-200">
                        <MapPin className="h-5 w-5 mr-3 text-ocean-300" />
                        <span>Receba recomendações personalizadas</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Botões de ação */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-white text-ocean-900 hover:bg-ocean-50 text-lg px-8 py-4 font-semibold"
                  onClick={() => window.location.href = '/account'}
                >
                  Fazer Login
                  <User className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white bg-transparent hover:bg-white/10 text-lg px-8 py-4 font-semibold"
                  onClick={() => window.location.href = '/'}
                >
                  Voltar ao Início
                </Button>
              </div>
              
              {/* Estatísticas motivacionais */}
              <div className="flex items-center justify-center space-x-8 text-ocean-200 pt-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">500+</div>
                  <div className="text-sm">Surfistas Ativos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">2.5k+</div>
                  <div className="text-sm">Sessões Registradas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">95%</div>
                  <div className="text-sm">Satisfação</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Renderizar profile normalmente, mesmo se sessões estão carregando
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-gray-800 to-slate-700 pt-16">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Meu Perfil
          </h1>
          <p className="text-lg text-slate-200">
            Gerencie suas informações e acompanhe seu progresso no surf
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-ocean-800/40 backdrop-blur-sm border-ocean-600/30">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-white">
                  <span className="flex items-center">
                    <User className="h-5 w-5 mr-2 text-ocean-200" />
                    Informações Pessoais
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditMode(!editMode)}
                    className="text-ocean-200 hover:text-white hover:bg-ocean-700/50"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {editMode ? (
                  <>
                    <div>
                      <Label htmlFor="name" className="text-ocean-100">Nome</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="bg-ocean-700/30 border-ocean-600/30 text-white placeholder:text-ocean-200"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-ocean-100">Email</Label>
                      <Input
                        id="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="bg-ocean-700/30 border-ocean-600/30 text-white placeholder:text-ocean-200"
                      />
                    </div>
                    <div>
                      <Label htmlFor="boardType" className="text-ocean-100">Tipo de Prancha</Label>
                      <Select value={formData.boardType} onValueChange={(value) => setFormData({...formData, boardType: value})}>
                        <SelectTrigger className="bg-ocean-700/30 border-ocean-600/30 text-white">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Longboard">Longboard</SelectItem>
                          <SelectItem value="Shortboard">Shortboard</SelectItem>
                          <SelectItem value="Funboard">Funboard</SelectItem>
                          <SelectItem value="Fish">Fish</SelectItem>
                          <SelectItem value="Gun">Gun</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="weight" className="text-ocean-100">Peso (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        value={formData.weight}
                        onChange={(e) => setFormData({...formData, weight: parseInt(e.target.value)})}
                        className="bg-ocean-700/30 border-ocean-600/30 text-white placeholder:text-ocean-200"
                      />
                    </div>
                    <div>
                      <Label htmlFor="level" className="text-ocean-100">Nível</Label>
                      <Select value={formData.level} onValueChange={(value) => setFormData({...formData, level: value})}>
                        <SelectTrigger className="bg-ocean-700/30 border-ocean-600/30 text-white">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Iniciante">Iniciante</SelectItem>
                          <SelectItem value="Intermediário">Intermediário</SelectItem>
                          <SelectItem value="Avançado">Avançado</SelectItem>
                          <SelectItem value="Profissional">Profissional</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="preferences" className="text-ocean-100">Preferências</Label>
                      <Textarea
                        id="preferences"
                        placeholder="Ex: Ondas grandes, Manhã cedo, Direitas"
                        value={formData.preferences}
                        onChange={(e) => setFormData({...formData, preferences: e.target.value})}
                        className="bg-ocean-700/30 border-ocean-600/30 text-white placeholder:text-ocean-200"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={handleSave} className="bg-ocean-gradient text-white">
                        Salvar
                      </Button>
                      <Button variant="outline" onClick={() => setEditMode(false)} className="border-ocean-600/30 text-ocean-100 hover:bg-ocean-700/50">
                        Cancelar
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-sm text-ocean-200 flex items-center">
                        <UserCircle className="h-4 w-4 mr-2 text-ocean-200" />
                        Nome
                      </p>
                      <p className="font-medium ml-6 text-white">{formData.name || 'Não informado'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-ocean-200 flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-ocean-200" />
                        Email
                      </p>
                      <p className="font-medium ml-6 text-white">{formData.email || 'Não informado'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-ocean-200 flex items-center">
                        <Waves className="h-4 w-4 mr-2 text-ocean-200" />
                        Tipo de Prancha
                      </p>
                      <p className="font-medium ml-6 text-white">{formData.boardType || 'Não informado'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-ocean-200 flex items-center">
                        <Weight className="h-4 w-4 mr-2 text-ocean-200" />
                        Peso
                      </p>
                      <p className="font-medium ml-6 text-white">{formData.weight ? `${formData.weight} kg` : 'Não informado'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-ocean-200 flex items-center">
                        <Award className="h-4 w-4 mr-2 text-ocean-200" />
                        Nível
                      </p>
                      <div className="ml-6">
                        <Badge variant="secondary" className="bg-ocean-700/50 text-ocean-100 border-ocean-600/30">{formData.level || 'Não informado'}</Badge>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-ocean-200 flex items-center">
                        <Heart className="h-4 w-4 mr-2 text-ocean-200" />
                        Preferências
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1 ml-6">
                        {formData.preferences
                          ? formData.preferences.split(',').map((pref, index) => (
                              <Badge key={index} variant="outline" className="text-xs bg-ocean-700/30 text-ocean-100 border-ocean-600/30">
                                {pref.trim()}
                              </Badge>
                            ))
                          : <p className="text-ocean-200">Nenhuma preferência definida</p>}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="bg-ocean-800/40 backdrop-blur-sm border-ocean-600/30">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <TrendingUp className="h-5 w-5 mr-2 text-ocean-200" />
                  Estatísticas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-ocean-200">{stats.total}</p>
                    <p className="text-sm text-ocean-100">Sessões</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-ocean-200">{stats.avgRating}</p>
                    <p className="text-sm text-ocean-100">Média ★</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-ocean-200">{stats.totalHours}h</p>
                    <p className="text-sm text-ocean-100">Total</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-ocean-200">{stats.beaches}</p>
                    <p className="text-sm text-ocean-100">Praias</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Chart */}
            <Card className="bg-ocean-800/40 backdrop-blur-sm border-ocean-600/30">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center text-white">
                      <TrendingUp className="h-5 w-5 mr-2 text-ocean-200" />
                      Progresso no Surf
                    </CardTitle>
                    <CardDescription className="text-ocean-100">
                      Sessões e avaliações por período
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Label className="text-ocean-100 text-sm font-medium hidden sm:block">Período:</Label>
                    <Select value={progressFilter} onValueChange={(value: 'all' | 'year' | 'month') => setProgressFilter(value)}>
                      <SelectTrigger className="w-32 bg-ocean-700/30 border-ocean-600/30 text-white hover:bg-ocean-600/30 transition-colors">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          <span className="flex items-center">
                            📊 Tudo
                          </span>
                        </SelectItem>
                        <SelectItem value="year">
                          <span className="flex items-center">
                            📅 Último Ano
                          </span>
                        </SelectItem>
                        <SelectItem value="month">
                          <span className="flex items-center">
                            📋 Último Mês
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Indicadores do filtro ativo */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-ocean-700/30 text-ocean-100 border-ocean-600/30">
                    {progressFilter === 'all' && `${progressData.length} períodos total`}
                    {progressFilter === 'year' && `${progressData.length} meses no último ano`}
                    {progressFilter === 'month' && `${progressData.length} semanas no último mês`}
                  </Badge>
                  {progressData.length > 0 && (
                    <Badge variant="outline" className="bg-green-700/30 text-green-100 border-green-600/30">
                      {progressData.reduce((sum, item) => sum + item.sessions, 0)} sessões
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {progressData.length > 0 ? (
                  <div className="w-full">
                    <ResponsiveContainer width="100%" height={350}>
                      <LineChart data={progressData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(186,230,253,0.2)" />
                        <XAxis 
                          dataKey="period" 
                          tick={{ fill: '#bae6fd', fontSize: 12 }}
                          angle={progressData.length > 6 ? -45 : 0}
                          textAnchor={progressData.length > 6 ? 'end' : 'middle'}
                          height={progressData.length > 6 ? 80 : 60}
                        />
                        <YAxis tick={{ fill: '#bae6fd', fontSize: 12 }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(12,74,110,0.95)', 
                            border: '1px solid rgba(186,230,253,0.3)', 
                            borderRadius: '12px',
                            color: '#fff',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                          }}
                          labelStyle={{ color: '#bae6fd', fontWeight: 'bold' }}
                          formatter={(value, name) => [
                            `${value}${name === 'avgRating' ? ' ★' : ''}`,
                            name === 'sessions' ? 'Sessões' : 'Avaliação Média'
                          ]}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="sessions" 
                          stroke="#bae6fd" 
                          strokeWidth={3}
                          name="Sessões"
                          dot={{ fill: '#bae6fd', strokeWidth: 2, r: 5 }}
                          activeDot={{ r: 7, stroke: '#bae6fd', strokeWidth: 2, fill: '#0369a1' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="avgRating" 
                          stroke="#fde047" 
                          strokeWidth={3}
                          name="Avaliação Média"
                          dot={{ fill: '#fde047', strokeWidth: 2, r: 5 }}
                          activeDot={{ r: 7, stroke: '#fde047', strokeWidth: 2, fill: '#eab308' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <TrendingUp className="h-16 w-16 text-ocean-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">Nenhum dado no período</h3>
                    <p className="text-ocean-200 max-w-md mx-auto">
                      {progressFilter === 'month' && 'Nenhuma sessão no último mês.'}
                      {progressFilter === 'year' && 'Nenhuma sessão no último ano.'}
                      {progressFilter === 'all' && 'Adicione suas primeiras sessões para ver o gráfico de progresso.'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Sessions */}
            <Card className="bg-ocean-800/40 backdrop-blur-sm border-ocean-600/30">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <History className="h-5 w-5 mr-2 text-ocean-200" />
                  Últimas Sessões
                </CardTitle>
                <CardDescription className="text-ocean-100">
                  Suas sessões de surf mais recentes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Formulário para adicionar nova sessão */}
                <div className="mb-6 border border-ocean-600/30 rounded-lg p-6 bg-ocean-700/20">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-ocean-300" />
                    Nova Sessão de Surf
                  </h4>
                  
                  {/* Primeira linha: Data, Local, Duração */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <Label htmlFor="date" className="text-ocean-100 text-sm font-medium">Data</Label>
                      <Input
                        id="date"
                        type="date"
                        value={newSession.date}
                        onChange={e => setNewSession({ ...newSession, date: e.target.value })}
                        className="mt-1 bg-ocean-700/30 border-ocean-600/30 text-white cursor-pointer"
                        onClick={(e) => e.currentTarget.showPicker?.()}
                      />
                    </div>
                    <div>
                      <Label htmlFor="location" className="text-ocean-100 text-sm font-medium">Local</Label>
                      <Select
                        value={newSession.location}
                        onValueChange={v => setNewSession({ ...newSession, location: v })}
                      >
                        <SelectTrigger className="mt-1 bg-ocean-700/30 border-ocean-600/30 text-white">
                          <SelectValue placeholder="Escolha o local..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Paiva">Praia do Paiva</SelectItem>
                          <SelectItem value="Porto de Galinhas">Porto de Galinhas</SelectItem>
                          <SelectItem value="Cupe">Praia do Cupe</SelectItem>
                          <SelectItem value="Maracaípe">Praia de Maracaípe</SelectItem>
                          <SelectItem value="Carneiros">Praia dos Carneiros</SelectItem>
                          <SelectItem value="Muro Alto">Muro Alto</SelectItem>
                          <SelectItem value="Outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="duration" className="text-ocean-100 text-sm font-medium">Duração</Label>
                      <Select
                        value={newSession.duration}
                        onValueChange={v => setNewSession({ ...newSession, duration: v })}
                      >
                        <SelectTrigger className="mt-1 bg-ocean-700/30 border-ocean-600/30 text-white">
                          <SelectValue placeholder="Tempo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30min">30min</SelectItem>
                          <SelectItem value="1h">1h</SelectItem>
                          <SelectItem value="1h 30min">1h 30min</SelectItem>
                          <SelectItem value="2h">2h</SelectItem>
                          <SelectItem value="2h 30min">2h 30min</SelectItem>
                          <SelectItem value="3h">3h</SelectItem>
                          <SelectItem value="4h">4h</SelectItem>
                          <SelectItem value="5h+">5h+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Segunda linha: Ondas, Nota */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label htmlFor="waves" className="text-ocean-100 text-sm font-medium">Altura das Ondas</Label>
                      <Select
                        value={newSession.waves}
                        onValueChange={v => setNewSession({ ...newSession, waves: v })}
                      >
                        <SelectTrigger className="mt-1 bg-ocean-700/30 border-ocean-600/30 text-white">
                          <SelectValue placeholder="Tamanho das ondas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0.5m">0.5m - Pequenas</SelectItem>
                          <SelectItem value="1.0m">1.0m - Médias</SelectItem>
                          <SelectItem value="1.5m">1.5m - Boas</SelectItem>
                          <SelectItem value="2.0m">2.0m - Grandes</SelectItem>
                          <SelectItem value="2.5m">2.5m - Muito grandes</SelectItem>
                          <SelectItem value="3.0m">3.0m - Enormes</SelectItem>
                          <SelectItem value="3.0m+">3.0m+ - Gigantes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="rating" className="text-ocean-100 text-sm font-medium">Avaliação da Sessão</Label>
                      <Select
                        value={String(newSession.rating)}
                        onValueChange={v => setNewSession({ ...newSession, rating: Number(v) })}
                      >
                        <SelectTrigger className="mt-1 bg-ocean-700/30 border-ocean-600/30 text-white">
                          <SelectValue placeholder="Nota da sessão" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1★ - Muito ruim</SelectItem>
                          <SelectItem value="2">2★ - Ruim</SelectItem>
                          <SelectItem value="3">3★ - Ok</SelectItem>
                          <SelectItem value="4">4★ - Boa</SelectItem>
                          <SelectItem value="5">5★ - Excelente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Terceira linha: Notas (campo maior) */}
                  <div className="mb-6">
                    <Label htmlFor="notes" className="text-ocean-100 text-sm font-medium mb-2 block">
                      Notas e Observações
                      <span className="text-ocean-300 text-xs ml-2">(opcional)</span>
                    </Label>
                    <Textarea
                      id="notes"
                      placeholder="Ex: Ondas perfeitas pela manhã, vento offshore, maré cheia. Pratiquei backside e consegui algumas boas ondas. Prancha 6'2 funcionou bem."
                      value={newSession.notes}
                      onChange={e => {
                        const value = e.target.value;
                        if (value.length <= 500) {
                          setNewSession({ ...newSession, notes: value });
                        }
                      }}
                      className="mt-1 bg-ocean-700/30 border-ocean-600/30 text-white placeholder:text-ocean-200/70 min-h-[100px] resize-y focus:ring-2 focus:ring-ocean-400 transition-all duration-200"
                      rows={4}
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-ocean-300">
                        Dica: Descreva condições do mar, vento, maré, equipamentos e manobras
                      </span>
                      <span className={`text-xs transition-colors ${
                        newSession.notes.length > 450 
                          ? 'text-amber-300' 
                          : newSession.notes.length > 480 
                          ? 'text-orange-300' 
                          : 'text-ocean-300'
                      }`}>
                        {newSession.notes.length}/500
                      </span>
                    </div>
                  </div>

                  {/* Status de validação */}
                  {(!newSession.date || !newSession.location || !newSession.duration || !newSession.waves) && (
                    <div className="mb-4 p-3 bg-amber-900/20 border border-amber-600/30 rounded-lg">
                      <p className="text-sm text-amber-200 flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        Preencha os campos obrigatórios: Data, Local, Duração e Altura das Ondas
                      </p>
                    </div>
                  )}

                  {/* Botões */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-end">
                    <Button 
                      variant="outline"
                      className="border-ocean-600/30 text-ocean-200 bg-transparent hover:bg-ocean-700/30 transition-all duration-200"
                      onClick={() => setNewSession({
                        date: new Date().toISOString().split('T')[0],
                        location: '',
                        duration: '',
                        waves: '',
                        rating: 3,
                        notes: ''
                      })}
                    >
                      Limpar Formulário
                    </Button>
                    <Button 
                      className="bg-ocean-gradient text-white hover:opacity-90 px-6 py-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed" 
                      onClick={handleAddSession}
                      disabled={!newSession.date || !newSession.location || !newSession.duration || !newSession.waves}
                    >
                      <Waves className="h-4 w-4 mr-2" />
                      Adicionar Sessão
                    </Button>
                  </div>
                </div>
                {/* Lista de sessões */}
                <div className="space-y-4">
                  {surfSessions.map((session) =>
                    editingSessionId === session.id ? (
                      <div key={session.id} className="border border-ocean-600/30 rounded-lg p-4 bg-ocean-700/20">
                        <div className="flex flex-wrap gap-4 items-end mb-2">
                          <div>
                            <Label htmlFor={`date-edit-${session.id}`}>Data</Label>
                            <Input
                              id={`date-edit-${session.id}`}
                              type="date"
                              value={session.date}
                              onChange={e => setSurfSessions(surfSessions.map(s => s.id === session.id ? { ...s, date: e.target.value } : s))}
                              className="w-32 cursor-pointer"
                              onClick={(e) => e.currentTarget.showPicker?.()}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`location-edit-${session.id}`}>Local</Label>
                            <Select
                              value={session.location}
                              onValueChange={v => setSurfSessions(surfSessions.map(s => s.id === session.id ? { ...s, location: v } : s))}
                            >
                              <SelectTrigger className="w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Paiva">Praia do Paiva</SelectItem>
                                <SelectItem value="Porto de Galinhas">Porto de Galinhas</SelectItem>
                                <SelectItem value="Cupe">Praia do Cupe</SelectItem>
                                <SelectItem value="Maracaípe">Praia de Maracaípe</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor={`duration-edit-${session.id}`}>Duração</Label>
                            <Select
                              value={session.duration}
                              onValueChange={v => setSurfSessions(surfSessions.map(s => s.id === session.id ? { ...s, duration: v } : s))}
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1h">1h</SelectItem>
                                <SelectItem value="2h">2h</SelectItem>
                                <SelectItem value="3h">3h</SelectItem>
                                <SelectItem value="4h">4h</SelectItem>
                                <SelectItem value="5h">5h</SelectItem>
                                <SelectItem value="6h">6h</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor={`waves-edit-${session.id}`}>Ondas</Label>
                            <Select
                              value={session.waves}
                              onValueChange={v => setSurfSessions(surfSessions.map(s => s.id === session.id ? { ...s, waves: v } : s))}
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0.5m">0.5m</SelectItem>
                                <SelectItem value="1.0m">1.0m</SelectItem>
                                <SelectItem value="1.5m">1.5m</SelectItem>
                                <SelectItem value="2.0m">2.0m</SelectItem>
                                <SelectItem value="2.5m">2.5m</SelectItem>
                                <SelectItem value="3.0m">3.0m</SelectItem>
                                <SelectItem value="3.0m+">3.0m+</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor={`rating-edit-${session.id}`}>Nota</Label>
                            <Select
                              value={String(session.rating)}
                              onValueChange={v => setSurfSessions(surfSessions.map(s => s.id === session.id ? { ...s, rating: Number(v) } : s))}
                            >
                              <SelectTrigger className="w-20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {[1,2,3,4,5].map(n => (
                                  <SelectItem key={n} value={String(n)}>{n}★</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex-1">
                            <Label htmlFor={`notes-edit-${session.id}`}>Notas</Label>
                            <Input
                              id={`notes-edit-${session.id}`}
                              type="text"
                              value={session.notes}
                              onChange={e => setSurfSessions(surfSessions.map(s => s.id === session.id ? { ...s, notes: e.target.value } : s))}
                            />
                          </div>
                          <Button
                            className="bg-ocean-gradient text-white mt-2"
                            onClick={() => handleSaveSession(session.id, session)}
                          >
                            Salvar
                          </Button>
                          <Button
                            variant="outline"
                            className="mt-2"
                            onClick={() => setEditingSessionId(null)}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div key={session.id} className="border border-ocean-600/30 rounded-lg p-4 hover:bg-ocean-700/20 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-ocean-200" />
                            <h4 className="font-medium text-white">{session.location}</h4>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < session.rating ? 'text-yellow-400 fill-current' : 'text-ocean-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <button
                              className="p-1 rounded hover:bg-ocean-700/50 transition-colors"
                              title="Editar"
                              onClick={() => handleEditSession(session.id)}
                            >
                              <Pencil className="h-4 w-4 text-ocean-200" />
                            </button>
                            <button
                              className="p-1 rounded hover:bg-ocean-700/50 transition-colors"
                              title="Excluir"
                              onClick={() => handleDeleteSession(session.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-400" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-ocean-200 mb-2">
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(session.date).toLocaleDateString('pt-BR')}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Waves className="h-3 w-3" />
                            <span>{session.waves}</span>
                          </span>
                          <span>{session.duration}</span>
                        </div>
                        <p className="text-sm text-ocean-100">{session.notes}</p>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>

            {/* AI Recommendations */}
            <Card className="bg-ocean-800/40 backdrop-blur-sm border-ocean-600/30">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Waves className="h-5 w-5 mr-2 text-ocean-200" />
                  Recomendações Personalizadas
                </CardTitle>
                <CardDescription className="text-ocean-100">
                  Baseadas no seu histórico e preferências
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendations.map((rec, index) => (
                    <div key={index} className="border border-ocean-600/30 rounded-lg p-4 hover:bg-ocean-700/20 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-white">{rec.location}</h4>
                        <Badge 
                          variant={rec.confidence === 'Alta' ? 'default' : 'secondary'}
                          className={rec.confidence === 'Alta' ? 'bg-green-600/80 text-green-100' : 'bg-ocean-700/50 text-ocean-100'}
                        >
                          {rec.confidence}
                        </Badge>
                      </div>
                      <p className="text-sm text-ocean-100 mb-2">{rec.reason}</p>
                      <p className="text-sm text-ocean-200 font-medium">{rec.time}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
