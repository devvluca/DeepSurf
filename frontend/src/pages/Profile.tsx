import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { User, Settings, History, TrendingUp, Waves, MapPin, Star, Calendar, Pencil, Trash2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/lib/supabaseClient';

const Profile = () => {
  const { user, updateProfile, loading: authLoading } = useAuth();
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
    date: '',
    location: '',
    duration: '',
    waves: '',
    rating: 3,
    notes: ''
  });

  // Atualiza formData quando user mudar
  useEffect(() => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      boardType: user?.board_type || '',
      weight: user?.weight || 0,
      level: user?.level || '',
      preferences: user?.preferences || ''
    });
  }, [user]);

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
        date: '',
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

  // Placeholder recommendations - replace with your own logic or API call
  const recommendations = [
    {
      location: 'Praia do Futuro',
      confidence: 'Alta',
      reason: 'Baseado nas suas últimas sessões e preferência por ondas grandes.',
      time: 'Melhor horário: 6h - 9h',
    },
    {
      location: 'Ipanema',
      confidence: 'Média',
      reason: 'Você surfou aqui recentemente e teve boa avaliação.',
      time: 'Melhor horário: 7h - 10h',
    },
  ];

  if (authLoading || sessionsLoading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (!user) {
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
            <Button className="bg-ocean-gradient text-white">
              Fazer Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
                      <p className="text-sm text-gray-500">Nome</p>
                      <p className="font-medium">{formData.name || 'Não informado'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{formData.email || 'Não informado'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Tipo de Prancha</p>
                      <p className="font-medium">{formData.boardType || 'Não informado'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Peso</p>
                      <p className="font-medium">{formData.weight ? `${formData.weight} kg` : 'Não informado'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Nível</p>
                      <Badge variant="secondary">{formData.level || 'Não informado'}</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Preferências</p>
                      <div className="flex flex-wrap gap-1 mt-1">
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
                        className="w-32"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Local</Label>
                      <Input
                        id="location"
                        type="text"
                        value={newSession.location}
                        onChange={e => setNewSession({ ...newSession, location: e.target.value })}
                        className="w-40"
                      />
                    </div>
                    <div>
                      <Label htmlFor="duration">Duração</Label>
                      <Input
                        id="duration"
                        type="text"
                        placeholder="Ex: 2h 30min"
                        value={newSession.duration}
                        onChange={e => setNewSession({ ...newSession, duration: e.target.value })}
                        className="w-24"
                      />
                    </div>
                    <div>
                      <Label htmlFor="waves">Ondas</Label>
                      <Input
                        id="waves"
                        type="text"
                        placeholder="Ex: 2.1m"
                        value={newSession.waves}
                        onChange={e => setNewSession({ ...newSession, waves: e.target.value })}
                        className="w-20"
                      />
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
                            <SelectItem key={n} value={String(n)}>{n}</SelectItem>
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
                              className="w-32"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`location-edit-${session.id}`}>Local</Label>
                            <Input
                              id={`location-edit-${session.id}`}
                              type="text"
                              value={session.location}
                              onChange={e => setSurfSessions(surfSessions.map(s => s.id === session.id ? { ...s, location: e.target.value } : s))}
                              className="w-40"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`duration-edit-${session.id}`}>Duração</Label>
                            <Input
                              id={`duration-edit-${session.id}`}
                              type="text"
                              value={session.duration}
                              onChange={e => setSurfSessions(surfSessions.map(s => s.id === session.id ? { ...s, duration: e.target.value } : s))}
                              className="w-24"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`waves-edit-${session.id}`}>Ondas</Label>
                            <Input
                              id={`waves-edit-${session.id}`}
                              type="text"
                              value={session.waves}
                              onChange={e => setSurfSessions(surfSessions.map(s => s.id === session.id ? { ...s, waves: e.target.value } : s))}
                              className="w-20"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`rating-edit-${session.id}`}>Nota</Label>
                            <Select
                              value={String(session.rating)}
                              onValueChange={v => setSurfSessions(surfSessions.map(s => s.id === session.id ? { ...s, rating: Number(v) } : s))}
                            >
                              <SelectTrigger className="w-20">
                                <SelectValue placeholder="Nota" />
                              </SelectTrigger>
                              <SelectContent>
                                {[1,2,3,4,5].map(n => (
                                  <SelectItem key={n} value={String(n)}>{n}</SelectItem>
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
