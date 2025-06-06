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
  const [newSession, setNewSession] = useState({
    date: new Date().toISOString().split('T')[0], // Data de hoje como padrão
    location: '',
    duration: '',
    waves: '',
    rating: 3,
    notes: ''
  });

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
    const { data, error } = await supabase.from('surf_sessions').insert([
      { ...newSession, user_id: user.id }
    ]).select();
    if (!error && data) {
      setSurfSessions([data[0], ...surfSessions]);
      setNewSession({
        date: new Date().toISOString().split('T')[0], // Resetar para hoje novamente
        location: '',
        duration: '',
        waves: '',
        rating: 3,
        notes: ''
      });
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

  // Estatísticas reais
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

  // Progresso dos últimos meses para o gráfico
  const progressData = React.useMemo(() => {
    // Agrupa sessões por mês (YYYY-MM)
    const monthsMap: { [key: string]: { sessions: number; totalRating: number } } = {};
    surfSessions.forEach((s) => {
      const date = new Date(s.date);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthsMap[month]) {
        monthsMap[month] = { sessions: 0, totalRating: 0 };
      }
      monthsMap[month].sessions += 1;
      monthsMap[month].totalRating += s.rating || 0;
    });
    // Ordena meses e prepara dados
    const months = Object.keys(monthsMap).sort();
    return months.map((month) => ({
      month,
      sessions: monthsMap[month].sessions,
      avgRating: monthsMap[month].sessions
        ? Number((monthsMap[month].totalRating / monthsMap[month].sessions).toFixed(2))
        : 0,
    }));
  }, [surfSessions]);

  // Recomendações baseadas no histórico real
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

  // MUDAR ESTA CONDIÇÃO - só esperar o auth, não as sessões
  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (!user) {
    const [isLoginOpen, setIsLoginOpen] = useState(false);

    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Acesso Negado
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Você precisa estar logado para acessar seu perfil.
            </p>
            <Button className="bg-ocean-gradient text-white" onClick={() => setIsLoginOpen(true)}>
              Fazer Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar profile normalmente, mesmo se sessões estão carregando
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Meu Perfil
          </h1>
          <p className="text-lg text-gray-600">
            Gerencie suas informações e acompanhe seu progresso no surf
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <User className="h-5 w-5 mr-2 text-ocean-600" />
                    Informações Pessoais
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditMode(!editMode)}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {editMode ? (
                  <>
                    <div>
                      <Label htmlFor="name">Nome</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="boardType">Tipo de Prancha</Label>
                      <Select value={formData.boardType} onValueChange={(value) => setFormData({...formData, boardType: value})}>
                        <SelectTrigger>
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
                      <Label htmlFor="weight">Peso (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        value={formData.weight}
                        onChange={(e) => setFormData({...formData, weight: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="level">Nível</Label>
                      <Select value={formData.level} onValueChange={(value) => setFormData({...formData, level: value})}>
                        <SelectTrigger>
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
                      <Label htmlFor="preferences">Preferências</Label>
                      <Textarea
                        id="preferences"
                        placeholder="Ex: Ondas grandes, Manhã cedo, Direitas"
                        value={formData.preferences}
                        onChange={(e) => setFormData({...formData, preferences: e.target.value})}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={handleSave} className="bg-ocean-gradient text-white">
                        Salvar
                      </Button>
                      <Button variant="outline" onClick={() => setEditMode(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-sm text-gray-500 flex items-center">
                        <UserCircle className="h-4 w-4 mr-2 text-ocean-600" />
                        Nome
                      </p>
                      <p className="font-medium ml-6">{formData.name || 'Não informado'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-ocean-600" />
                        Email
                      </p>
                      <p className="font-medium ml-6">{formData.email || 'Não informado'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 flex items-center">
                        <Waves className="h-4 w-4 mr-2 text-ocean-600" />
                        Tipo de Prancha
                      </p>
                      <p className="font-medium ml-6">{formData.boardType || 'Não informado'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 flex items-center">
                        <Weight className="h-4 w-4 mr-2 text-ocean-600" />
                        Peso
                      </p>
                      <p className="font-medium ml-6">{formData.weight ? `${formData.weight} kg` : 'Não informado'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 flex items-center">
                        <Award className="h-4 w-4 mr-2 text-ocean-600" />
                        Nível
                      </p>
                      <div className="ml-6">
                        <Badge variant="secondary">{formData.level || 'Não informado'}</Badge>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 flex items-center">
                        <Heart className="h-4 w-4 mr-2 text-ocean-600" />
                        Preferências
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1 ml-6">
                        {formData.preferences
                          ? formData.preferences.split(',').map((pref, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {pref.trim()}
                              </Badge>
                            ))
                          : <p className="text-gray-400">Nenhuma preferência definida</p>}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-ocean-600" />
                  Estatísticas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-ocean-600">{stats.total}</p>
                    <p className="text-sm text-gray-600">Sessões</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-ocean-600">{stats.avgRating}</p>
                    <p className="text-sm text-gray-600">Média ★</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-ocean-600">{stats.totalHours}h</p>
                    <p className="text-sm text-gray-600">Total</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-ocean-600">{stats.beaches}</p>
                    <p className="text-sm text-gray-600">Praias</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-ocean-600" />
                  Progresso nos Últimos Meses
                </CardTitle>
                <CardDescription>
                  Número de sessões e avaliação média
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="sessions" 
                      stroke="#0284c7" 
                      strokeWidth={2}
                      name="Sessões"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="avgRating" 
                      stroke="#eab308" 
                      strokeWidth={2}
                      name="Avaliação Média"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recent Sessions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <History className="h-5 w-5 mr-2 text-ocean-600" />
                  Últimas Sessões
                </CardTitle>
                <CardDescription>
                  Suas sessões de surf mais recentes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Formulário para adicionar nova sessão */}
                <div className="mb-6 border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex flex-wrap gap-4 items-end">
                    <div>
                      <Label htmlFor="date">Data</Label>
                      <Input
                        id="date"
                        type="date"
                        value={newSession.date}
                        onChange={e => setNewSession({ ...newSession, date: e.target.value })}
                        className="w-32 cursor-pointer"
                        onClick={(e) => e.currentTarget.showPicker?.()}
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Local</Label>
                      <Select
                        value={newSession.location}
                        onValueChange={v => setNewSession({ ...newSession, location: v })}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Escolha..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Paiva">Praia do Paiva</SelectItem>
                          <SelectItem value="Porto de Galinhas">Porto de Galinhas</SelectItem>
                          <SelectItem value="Cupe">Praia do Cupe</SelectItem>
                          <SelectItem value="Maracaípe">Praia de Maracaípe</SelectItem>
                          <SelectItem value="Outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="duration">Duração</Label>
                      <Select
                        value={newSession.duration}
                        onValueChange={v => setNewSession({ ...newSession, duration: v })}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue placeholder="Tempo" />
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
                      <Label htmlFor="waves">Ondas</Label>
                      <Select
                        value={newSession.waves}
                        onValueChange={v => setNewSession({ ...newSession, waves: v })}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue placeholder="Altura" />
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
                      <Label htmlFor="rating">Nota</Label>
                      <Select
                        value={String(newSession.rating)}
                        onValueChange={v => setNewSession({ ...newSession, rating: Number(v) })}
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue placeholder="Nota" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1,2,3,4,5].map(n => (
                            <SelectItem key={n} value={String(n)}>{n}★</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="notes">Notas</Label>
                      <Input
                        id="notes"
                        type="text"
                        placeholder="Notas rápidas"
                        value={newSession.notes}
                        onChange={e => setNewSession({ ...newSession, notes: e.target.value })}
                      />
                    </div>
                    <Button className="bg-ocean-gradient text-white mt-2" onClick={handleAddSession}>
                      Adicionar
                    </Button>
                  </div>
                </div>
                {/* Lista de sessões */}
                <div className="space-y-4">
                  {surfSessions.map((session) =>
                    editingSessionId === session.id ? (
                      <div key={session.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
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
                      <div key={session.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-ocean-600" />
                            <h4 className="font-medium">{session.location}</h4>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < session.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <button
                              className="p-1 rounded hover:bg-gray-100 transition-colors"
                              title="Editar"
                              onClick={() => handleEditSession(session.id)}
                            >
                              <Pencil className="h-4 w-4 text-ocean-600" />
                            </button>
                            <button
                              className="p-1 rounded hover:bg-gray-100 transition-colors"
                              title="Excluir"
                              onClick={() => handleDeleteSession(session.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
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
                        <p className="text-sm text-gray-700">{session.notes}</p>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>

            {/* AI Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Waves className="h-5 w-5 mr-2 text-ocean-600" />
                  Recomendações Personalizadas
                </CardTitle>
                <CardDescription>
                  Baseadas no seu histórico e preferências
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendations.map((rec, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{rec.location}</h4>
                        <Badge 
                          variant={rec.confidence === 'Alta' ? 'default' : 'secondary'}
                          className={rec.confidence === 'Alta' ? 'bg-green-100 text-green-800' : ''}
                        >
                          {rec.confidence}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{rec.reason}</p>
                      <p className="text-sm text-ocean-600 font-medium">{rec.time}</p>
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
