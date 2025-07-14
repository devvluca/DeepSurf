import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { User, Settings, History, TrendingUp, Waves, MapPin, Star, Calendar, Pencil, Trash2, Mail, Weight, Award, Heart, UserCircle, ChevronDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/lib/supabaseClient';

// Função para converter cor hex para filtro CSS
const hexToFilter = (hex: string) => {
  // Remove o # se presente
  hex = hex.replace('#', '');
  
  // Converte para RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Para branco (padrão)
  if (hex === 'ffffff' || hex === 'white') {
    return 'brightness(0) saturate(100%) invert(100%)';
  }
  
  // Para cores específicas, usando filtros CSS
  const colorFilters: { [key: string]: string } = {
    '3b82f6': 'brightness(0) saturate(100%) invert(35%) sepia(91%) saturate(2077%) hue-rotate(216deg) brightness(99%) contrast(94%)', // Azul
    'ef4444': 'brightness(0) saturate(100%) invert(23%) sepia(89%) saturate(4794%) hue-rotate(348deg) brightness(103%) contrast(90%)', // Vermelho
    '10b981': 'brightness(0) saturate(100%) invert(64%) sepia(80%) saturate(5423%) hue-rotate(144deg) brightness(90%) contrast(85%)', // Verde
    'f59e0b': 'brightness(0) saturate(100%) invert(61%) sepia(80%) saturate(4943%) hue-rotate(20deg) brightness(101%) contrast(94%)', // Amarelo
    '8b5cf6': 'brightness(0) saturate(100%) invert(47%) sepia(60%) saturate(3677%) hue-rotate(245deg) brightness(98%) contrast(96%)', // Roxo
    'ec4899': 'brightness(0) saturate(100%) invert(41%) sepia(88%) saturate(1605%) hue-rotate(305deg) brightness(97%) contrast(95%)', // Rosa
    '06b6d4': 'brightness(0) saturate(100%) invert(71%) sepia(77%) saturate(3533%) hue-rotate(168deg) brightness(93%) contrast(89%)', // Ciano
    '84cc16': 'brightness(0) saturate(100%) invert(73%) sepia(40%) saturate(4756%) hue-rotate(67deg) brightness(96%) contrast(87%)', // Lima
    'f97316': 'brightness(0) saturate(100%) invert(54%) sepia(98%) saturate(1659%) hue-rotate(13deg) brightness(105%) contrast(98%)', // Laranja
    '6b7280': 'brightness(0) saturate(100%) invert(46%) sepia(7%) saturate(1090%) hue-rotate(191deg) brightness(95%) contrast(88%)', // Cinza
    '1f2937': 'brightness(0) saturate(100%) invert(15%) sepia(15%) saturate(1134%) hue-rotate(194deg) brightness(96%) contrast(91%)', // Cinza escuro
  };
  
  // Retorna o filtro específico ou tenta uma aproximação
  return colorFilters[hex.toLowerCase()] || `brightness(0) saturate(100%) invert(100%)`;
};

// Componente do ícone da prancha usando PNG
const SurfboardIcon = ({ className = "h-4 w-4", color = "#ffffff" }) => {
  const filter = hexToFilter(color);
  
  return (
    <img 
      src="/img/surfboard-with-line.png" 
      alt="Surfboard"
      className={className}
      style={{ 
        filter: filter,
        transition: 'filter 0.2s ease'
      }}
    />
  );
};

// Função para retornar o ícone correto baseado no tipo da prancha (todos usam o mesmo PNG agora)
const getBoardIcon = (type: string, className?: string, color?: string) => {
  return <SurfboardIcon className={className} color={color} />;
};

const Profile = () => {
  const { user, updateProfile, loading: authLoading } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    weight: user?.weight || 0,
    level: user?.level || '',
    preferences: user?.preferences || ''
  });

  // Múltiplas pranchas
  const [boards, setBoards] = useState<Array<{id: string, name: string, length: string, volume: string, color: string}>>([]);
  const [newBoard, setNewBoard] = useState({ name: '', length: '', volume: '', color: '#3b82f6' });
  const [isAddingBoard, setIsAddingBoard] = useState(false);
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [editingBoard, setEditingBoard] = useState({ name: '', length: '', volume: '', color: '#3b82f6' });

  // Sugestões dinâmicas para preferências
  const [preferenceSuggestions] = useState([
    'Ondas grandes', 'Ondas pequenas', 'Manhã cedo', 'Final de tarde', 
    'Direitas', 'Esquerdas', 'Tubes', 'Surf longboard', 'Água quente',
    'Multidões pequenas', 'Spots remotos', 'Reef breaks', 'Beach breaks',
    'Point breaks', 'Wind swell', 'Ground swell'
  ]);
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
  const [customPreference, setCustomPreference] = useState('');

  // Histórico de mudanças
  const [preferenceHistory, setPreferenceHistory] = useState<Array<{
    date: string;
    type: 'preference' | 'board';
    oldValue: string;
    newValue: string;
  }>>([]);
  const [showHistory, setShowHistory] = useState(false);

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
    notes: '',
    board: '' // Prancha usada na sessão
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
        weight: profileData.weight || 0,
        level: profileData.level || '',
        preferences: profileData.preferences || ''
      });
      
      // Carregar pranchas do banco (JSONB) ou localStorage como fallback
      if (profileData.boards) {
        try {
          // Se boards é uma string JSON, parsear
          const boardsData = typeof profileData.boards === 'string' 
            ? JSON.parse(profileData.boards) 
            : profileData.boards;
          
          const boardsWithColor = Array.isArray(boardsData) 
            ? boardsData.map(board => ({ 
                ...board, 
                color: board.color || '#3b82f6' 
              }))
            : [];
          setBoards(boardsWithColor);
        } catch (error) {
          console.error('Erro ao parsear pranchas do banco:', error);
          // Fallback para localStorage
          const savedBoards = localStorage.getItem(`user_boards_${user?.id}`);
          if (savedBoards) {
            try {
              const boards = JSON.parse(savedBoards);
              const boardsWithColor = Array.isArray(boards) 
                ? boards.map(board => ({ 
                    ...board, 
                    color: board.color || '#3b82f6' 
                  }))
                : [];
              setBoards(boardsWithColor);
            } catch (localError) {
              console.error('Erro ao carregar pranchas do localStorage:', localError);
              setBoards([]);
            }
          }
        }
      } else {
        // Se não há pranchas no banco, tentar localStorage
        const savedBoards = localStorage.getItem(`user_boards_${user?.id}`);
        if (savedBoards) {
          try {
            const boards = JSON.parse(savedBoards);
            const boardsWithColor = Array.isArray(boards) 
              ? boards.map(board => ({ 
                  ...board, 
                  color: board.color || '#3b82f6' 
                }))
              : [];
            setBoards(boardsWithColor);
          } catch (error) {
            console.error('Erro ao carregar pranchas do localStorage:', error);
            setBoards([]);
          }
        }
      }
      
      // Carregar preferências como array
      if (profileData.preferences) {
        const prefs = profileData.preferences.split(',').map(p => p.trim()).filter(p => p);
        setSelectedPreferences(prefs);
      }
      
      // Carregar histórico de mudanças do localStorage (mantém local por enquanto)
      const savedHistory = localStorage.getItem(`user_history_${user?.id}`);
      if (savedHistory) {
        try {
          const history = JSON.parse(savedHistory);
          setPreferenceHistory(Array.isArray(history) ? history : []);
        } catch (error) {
          console.error('Erro ao carregar histórico do localStorage:', error);
          setPreferenceHistory([]);
        }
      }
    }
  }, [profileData, user]);

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
    try {
      // Registrar mudanças no histórico
      const now = new Date().toISOString().split('T')[0];
      const newHistory = [...preferenceHistory];
      
      // Verificar mudança de preferências
      const oldPrefs = (user?.preferences || '').split(',').map(p => p.trim()).filter(p => p);
      const newPrefs = selectedPreferences;
      if (JSON.stringify(oldPrefs.sort()) !== JSON.stringify(newPrefs.sort())) {
        newHistory.unshift({
          date: now,
          type: 'preference',
          oldValue: oldPrefs.join(', ') || 'Nenhuma preferência',
          newValue: newPrefs.join(', ') || 'Nenhuma preferência'
        });
      }
      
      // Verificar mudança de pranchas (comparar com dados do banco)
      const oldBoards = profileData?.boards ? 
        (typeof profileData.boards === 'string' ? JSON.parse(profileData.boards || '[]') : (Array.isArray(profileData.boards) ? profileData.boards : []))
        : [];
      if (JSON.stringify(oldBoards) !== JSON.stringify(boards)) {
        const oldBoardsText = Array.isArray(oldBoards) && oldBoards.length > 0 
          ? oldBoards.map((b: any) => `${b.name} ${b.length} ${b.volume}`).join(', ')
          : 'Nenhuma prancha';
        const newBoardsText = boards.length > 0 
          ? boards.map(b => `${b.name} ${b.length} ${b.volume}`).join(', ')
          : 'Nenhuma prancha';
        
        newHistory.unshift({
          date: now,
          type: 'board',
          oldValue: oldBoardsText,
          newValue: newBoardsText
        });
      }
      
      setPreferenceHistory(newHistory.slice(0, 10)); // Manter apenas últimos 10
      
      // Salvar histórico no localStorage (por enquanto)
      localStorage.setItem(`user_history_${user?.id}`, JSON.stringify(newHistory.slice(0, 10)));
      
      // Atualizar perfil no banco de dados
      const profileUpdate: any = {};
      
      // Nome é sempre incluído se preenchido
      if (formData.name?.trim()) {
        profileUpdate.name = formData.name.trim();
      }
      
      // Peso - incluir se maior que 0
      if (formData.weight && formData.weight > 0) {
        profileUpdate.weight = Number(formData.weight);
      }
      
      // Nível - incluir se preenchido
      if (formData.level?.trim()) {
        profileUpdate.level = formData.level.trim();
      }
      
      // Preferências - incluir se há preferências selecionadas
      if (selectedPreferences.length > 0) {
        profileUpdate.preferences = selectedPreferences.join(', ');
      }
      
      // Pranchas - salvar no banco como JSONB e localStorage como backup
      if (boards.length > 0) {
        profileUpdate.boards = boards; // Enviar como array/objeto diretamente
      }
      localStorage.setItem(`user_boards_${user?.id}`, JSON.stringify(boards));
      
      // Email do usuário atual (para garantir que existe)
      if (user?.email) {
        profileUpdate.email = user.email;
      }
      
      console.log('Dados a serem salvos no Supabase:', profileUpdate);
      console.log('User ID:', user?.id);
      
      await updateProfile(profileUpdate);
      
      // Fechar modo de edição
      setEditMode(false);
      
      // Feedback visual de sucesso
      const successMessage = document.createElement('div');
      successMessage.textContent = '✅ Perfil salvo com sucesso!';
      successMessage.className = 'fixed top-20 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in';
      document.body.appendChild(successMessage);
      setTimeout(() => successMessage.remove(), 3000);
      
      console.log('Perfil salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      
      // Feedback visual de erro
      const errorMessage = document.createElement('div');
      errorMessage.textContent = '❌ Erro ao salvar perfil. Tente novamente.';
      errorMessage.className = 'fixed top-20 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in';
      document.body.appendChild(errorMessage);
      setTimeout(() => errorMessage.remove(), 3000);
    }
  };

  // Adicionar nova sessão
  const handleAddSession = async () => {
    if (!user) return;
    if (!newSession.date || !newSession.location || !newSession.duration || !newSession.waves || !newSession.board) return;
    
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
          notes: '',
          board: ''
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

  // Funções para gerenciar pranchas
  const handleAddBoard = () => {
    if (newBoard.name && newBoard.length && newBoard.volume) {
      const board = {
        id: Date.now().toString(),
        name: newBoard.name,
        length: newBoard.length,
        volume: newBoard.volume,
        color: newBoard.color
      };
      setBoards([...boards, board]);
      setNewBoard({ name: '', length: '', volume: '', color: '#3b82f6' });
      setIsAddingBoard(false);
    }
  };

  const handleRemoveBoard = (id: string) => {
    setBoards(boards.filter(board => board.id !== id));
  };

  const handleEditBoard = (board: any) => {
    setEditingBoardId(board.id);
    setEditingBoard({
      name: board.name,
      length: board.length,
      volume: board.volume,
      color: board.color
    });
  };

  const handleSaveEditBoard = () => {
    if (editingBoard.name && editingBoard.length && editingBoard.volume && editingBoard.color) {
      setBoards(boards.map(board => 
        board.id === editingBoardId 
          ? { ...board, ...editingBoard }
          : board
      ));
      setEditingBoardId(null);
      setEditingBoard({ name: '', length: '', volume: '', color: '#3b82f6' });
    }
  };

  const handleCancelEditBoard = () => {
    setEditingBoardId(null);
    setEditingBoard({ name: '', length: '', volume: '', color: '#3b82f6' });
  };

  // Funções para gerenciar preferências
  const handleTogglePreference = (preference: string) => {
    if (selectedPreferences.includes(preference)) {
      setSelectedPreferences(selectedPreferences.filter(p => p !== preference));
    } else {
      setSelectedPreferences([...selectedPreferences, preference]);
    }
  };

  const handleAddCustomPreference = () => {
    if (customPreference.trim() && !selectedPreferences.includes(customPreference.trim())) {
      setSelectedPreferences([...selectedPreferences, customPreference.trim()]);
      setCustomPreference('');
    }
  };

  const handleRemovePreference = (preference: string) => {
    setSelectedPreferences(selectedPreferences.filter(p => p !== preference));
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
              <CardContent className="space-y-6">
                {editMode ? (
                  <>
                    {/* Nome */}
                    <div>
                      <Label htmlFor="name" className="text-ocean-100">Nome</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="bg-ocean-700/30 border-ocean-600/30 text-white placeholder:text-ocean-200"
                      />
                    </div>

                    {/* Peso */}
                    <div>
                      <Label htmlFor="weight" className="text-ocean-100">Peso (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        value={formData.weight}
                        onChange={(e) => setFormData({...formData, weight: parseInt(e.target.value) || 0})}
                        className="bg-ocean-700/30 border-ocean-600/30 text-white placeholder:text-ocean-200"
                      />
                    </div>

                    {/* Nível */}
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

                    {/* Pranchas */}
                    <div>
                      <Label className="text-ocean-100 flex items-center mb-2">
                        <SurfboardIcon className="h-4 w-4 mr-2" />
                        Minhas Pranchas
                      </Label>
                      <div className="space-y-2 mb-3">
                        {boards.map((board) => (
                          <div key={board.id} className="bg-ocean-700/20 p-3 rounded-lg border border-ocean-600/20">
                            {editingBoardId === board.id ? (
                              // Modo de edição para esta prancha
                              <div className="space-y-3">
                                <div className="flex items-center space-x-3 mb-3">
                                  {getBoardIcon(editingBoard.name, "h-5 w-5 flex-shrink-0", editingBoard.color)}
                                  <span className="text-white text-sm font-medium">Editando prancha</span>
                                </div>
                                
                                {/* Tipo da Prancha */}
                                <div>
                                  <Label className="text-ocean-100 text-xs font-medium">Tipo</Label>
                                  <Select
                                    value={editingBoard.name}
                                    onValueChange={(value) => setEditingBoard({...editingBoard, name: value})}
                                  >
                                    <SelectTrigger className="bg-ocean-700/30 border-ocean-600/30 text-white text-xs">
                                      <SelectValue placeholder="Escolha o tipo..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Shortboard">Shortboard</SelectItem>
                                      <SelectItem value="Longboard">Longboard</SelectItem>
                                      <SelectItem value="Funboard">Funboard</SelectItem>
                                      <SelectItem value="Fish">Fish</SelectItem>
                                      <SelectItem value="Gun">Gun</SelectItem>
                                      <SelectItem value="Mini Mal">Mini Mal</SelectItem>
                                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                                      <SelectItem value="Step Up">Step Up</SelectItem>
                                      <SelectItem value="Mini Simmons">Mini Simmons</SelectItem>
                                      <SelectItem value="Foamboard">Foamboard</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                {/* Tamanho da Prancha */}
                                <div>
                                  <Label className="text-ocean-100 text-xs font-medium">Tamanho</Label>
                                  <Select
                                    value={editingBoard.length}
                                    onValueChange={(value) => setEditingBoard({...editingBoard, length: value})}
                                  >
                                    <SelectTrigger className="bg-ocean-700/30 border-ocean-600/30 text-white text-xs">
                                      <SelectValue placeholder="Escolha o tamanho..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="5'6">5'6" (168cm)</SelectItem>
                                      <SelectItem value="5'8">5'8" (173cm)</SelectItem>
                                      <SelectItem value="5'10">5'10" (178cm)</SelectItem>
                                      <SelectItem value="5'11">5'11" (180cm)</SelectItem>
                                      <SelectItem value="6'0">6'0" (183cm)</SelectItem>
                                      <SelectItem value="6'1">6'1" (185cm)</SelectItem>
                                      <SelectItem value="6'2">6'2" (188cm)</SelectItem>
                                      <SelectItem value="6'3">6'3" (191cm)</SelectItem>
                                      <SelectItem value="6'4">6'4" (193cm)</SelectItem>
                                      <SelectItem value="6'6">6'6" (198cm)</SelectItem>
                                      <SelectItem value="7'0">7'0" (213cm)</SelectItem>
                                      <SelectItem value="7'6">7'6" (229cm)</SelectItem>
                                      <SelectItem value="8'0">8'0" (244cm)</SelectItem>
                                      <SelectItem value="8'6">8'6" (259cm)</SelectItem>
                                      <SelectItem value="9'0">9'0" (274cm)</SelectItem>
                                      <SelectItem value="9'2">9'2" (279cm)</SelectItem>
                                      <SelectItem value="9'6">9'6" (290cm)</SelectItem>
                                      <SelectItem value="10'0">10'0" (305cm)</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                {/* Volume/Litragem */}
                                <div>
                                  <Label className="text-ocean-100 text-xs font-medium">Volume</Label>
                                  <Select
                                    value={editingBoard.volume}
                                    onValueChange={(value) => setEditingBoard({...editingBoard, volume: value})}
                                  >
                                    <SelectTrigger className="bg-ocean-700/30 border-ocean-600/30 text-white text-xs">
                                      <SelectValue placeholder="Escolha o volume..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="18L">18L - Ultra baixo</SelectItem>
                                      <SelectItem value="20L">20L - Muito baixo</SelectItem>
                                      <SelectItem value="22L">22L - Baixo</SelectItem>
                                      <SelectItem value="24L">24L - Baixo médio</SelectItem>
                                      <SelectItem value="26L">26L - Médio baixo</SelectItem>
                                      <SelectItem value="28L">28L - Médio</SelectItem>
                                      <SelectItem value="30L">30L - Médio</SelectItem>
                                      <SelectItem value="32L">32L - Médio alto</SelectItem>
                                      <SelectItem value="34L">34L - Alto</SelectItem>
                                      <SelectItem value="36L">36L - Alto</SelectItem>
                                      <SelectItem value="38L">38L - Muito alto</SelectItem>
                                      <SelectItem value="40L">40L - Muito alto</SelectItem>
                                      <SelectItem value="45L">45L - Funboard</SelectItem>
                                      <SelectItem value="50L">50L - Funboard</SelectItem>
                                      <SelectItem value="55L">55L - Mini mal</SelectItem>
                                      <SelectItem value="60L">60L - Mini mal</SelectItem>
                                      <SelectItem value="65L">65L - Longboard</SelectItem>
                                      <SelectItem value="70L">70L - Longboard</SelectItem>
                                      <SelectItem value="75L">75L - Longboard</SelectItem>
                                      <SelectItem value="80L">80L - Longboard</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                {/* Cor da Prancha */}
                                <div>
                                  <Label className="text-ocean-100 text-xs font-medium">Cor</Label>
                                  <div className="flex items-center space-x-3 mt-2">
                                    {/* Preview do ícone com cor selecionada */}
                                    <div className="flex items-center space-x-2">
                                      {getBoardIcon(editingBoard.name, "h-6 w-6", editingBoard.color)}
                                      <span className="text-ocean-200 text-xs">Preview</span>
                                    </div>
                                    
                                    {/* Cores predefinidas */}
                                    <div className="flex flex-wrap gap-2">
                                      {[
                                        '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899',
                                        '#06b6d4', '#84cc16', '#f97316', '#6b7280', '#1f2937', '#ffffff'
                                      ].map((color) => (
                                        <button
                                          key={color}
                                          type="button"
                                          onClick={() => setEditingBoard({...editingBoard, color})}
                                          className={`w-6 h-6 rounded-full border-2 transition-all ${
                                            editingBoard.color === color 
                                              ? 'border-white scale-110' 
                                              : 'border-ocean-600/50 hover:border-ocean-400/70 hover:scale-105'
                                          }`}
                                          style={{ backgroundColor: color }}
                                        />
                                      ))}
                                    </div>
                                    
                                    {/* Input de cor personalizada */}
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="color"
                                        value={editingBoard.color}
                                        onChange={(e) => setEditingBoard({...editingBoard, color: e.target.value})}
                                        className="w-8 h-8 rounded border border-ocean-600/30 bg-transparent cursor-pointer"
                                      />
                                      <span className="text-ocean-200 text-xs">Custom</span>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Botões de ação */}
                                <div className="flex gap-2 pt-2">
                                  <Button 
                                    onClick={handleSaveEditBoard} 
                                    size="sm" 
                                    className="bg-ocean-600 hover:bg-ocean-500 text-white"
                                    disabled={!editingBoard.name || !editingBoard.length || !editingBoard.volume || !editingBoard.color}
                                  >
                                    Salvar
                                  </Button>
                                  <Button onClick={handleCancelEditBoard} variant="outline" size="sm" className="border-ocean-600/50 text-ocean-100 hover:bg-ocean-700/70 bg-ocean-800/30">
                                    Cancelar
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              // Modo de visualização normal
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  {getBoardIcon(board.name, "h-5 w-5 flex-shrink-0", board.color || '#3b82f6')}
                                  <div className="flex flex-col">
                                    <span className="text-white text-sm font-medium">
                                      {board.length} • {board.volume}
                                    </span>
                                    <span className="text-ocean-200 text-xs">
                                      {board.name}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditBoard(board)}
                                    className="text-ocean-300 hover:text-white hover:bg-ocean-700/50 h-8 w-8 p-0 flex-shrink-0"
                                  >
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveBoard(board.id)}
                                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20 h-8 w-8 p-0 flex-shrink-0"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {isAddingBoard ? (
                        <div className="space-y-3 bg-ocean-700/20 p-4 rounded-lg">
                          <div className="space-y-3">
                            {/* Tipo da Prancha */}
                            <div>
                              <Label className="text-ocean-100 text-xs font-medium">Tipo</Label>
                              <Select
                                value={newBoard.name}
                                onValueChange={(value) => setNewBoard({...newBoard, name: value})}
                              >
                                <SelectTrigger className="bg-ocean-700/30 border-ocean-600/30 text-white text-xs">
                                  <SelectValue placeholder="Escolha o tipo..." />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Shortboard">Shortboard</SelectItem>
                                  <SelectItem value="Longboard">Longboard</SelectItem>
                                  <SelectItem value="Funboard">Funboard</SelectItem>
                                  <SelectItem value="Fish">Fish</SelectItem>
                                  <SelectItem value="Gun">Gun</SelectItem>
                                  <SelectItem value="Mini Mal">Mini Mal</SelectItem>
                                  <SelectItem value="Hybrid">Hybrid</SelectItem>
                                  <SelectItem value="Step Up">Step Up</SelectItem>
                                  <SelectItem value="Mini Simmons">Mini Simmons</SelectItem>
                                  <SelectItem value="Foamboard">Foamboard</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            {/* Tamanho da Prancha */}
                            <div>
                              <Label className="text-ocean-100 text-xs font-medium">Tamanho</Label>
                              <Select
                                value={newBoard.length}
                                onValueChange={(value) => setNewBoard({...newBoard, length: value})}
                              >
                                <SelectTrigger className="bg-ocean-700/30 border-ocean-600/30 text-white text-xs">
                                  <SelectValue placeholder="Escolha o tamanho..." />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="5'6">5'6" (168cm)</SelectItem>
                                  <SelectItem value="5'8">5'8" (173cm)</SelectItem>
                                  <SelectItem value="5'10">5'10" (178cm)</SelectItem>
                                  <SelectItem value="5'11">5'11" (180cm)</SelectItem>
                                  <SelectItem value="6'0">6'0" (183cm)</SelectItem>
                                  <SelectItem value="6'1">6'1" (185cm)</SelectItem>
                                  <SelectItem value="6'2">6'2" (188cm)</SelectItem>
                                  <SelectItem value="6'3">6'3" (191cm)</SelectItem>
                                  <SelectItem value="6'4">6'4" (193cm)</SelectItem>
                                  <SelectItem value="6'6">6'6" (198cm)</SelectItem>
                                  <SelectItem value="7'0">7'0" (213cm)</SelectItem>
                                  <SelectItem value="7'6">7'6" (229cm)</SelectItem>
                                  <SelectItem value="8'0">8'0" (244cm)</SelectItem>
                                  <SelectItem value="8'6">8'6" (259cm)</SelectItem>
                                  <SelectItem value="9'0">9'0" (274cm)</SelectItem>
                                  <SelectItem value="9'2">9'2" (279cm)</SelectItem>
                                  <SelectItem value="9'6">9'6" (290cm)</SelectItem>
                                  <SelectItem value="10'0">10'0" (305cm)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            {/* Volume/Litragem */}
                            <div>
                              <Label className="text-ocean-100 text-xs font-medium">Volume</Label>
                              <Select
                                value={newBoard.volume}
                                onValueChange={(value) => setNewBoard({...newBoard, volume: value})}
                              >
                                <SelectTrigger className="bg-ocean-700/30 border-ocean-600/30 text-white text-xs">
                                  <SelectValue placeholder="Escolha o volume..." />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="18L">18L - Ultra baixo</SelectItem>
                                  <SelectItem value="20L">20L - Muito baixo</SelectItem>
                                  <SelectItem value="22L">22L - Baixo</SelectItem>
                                  <SelectItem value="24L">24L - Baixo médio</SelectItem>
                                  <SelectItem value="26L">26L - Médio baixo</SelectItem>
                                  <SelectItem value="28L">28L - Médio</SelectItem>
                                  <SelectItem value="30L">30L - Médio</SelectItem>
                                  <SelectItem value="32L">32L - Médio alto</SelectItem>
                                  <SelectItem value="34L">34L - Alto</SelectItem>
                                  <SelectItem value="36L">36L - Alto</SelectItem>
                                  <SelectItem value="38L">38L - Muito alto</SelectItem>
                                  <SelectItem value="40L">40L - Muito alto</SelectItem>
                                  <SelectItem value="45L">45L - Funboard</SelectItem>
                                  <SelectItem value="50L">50L - Funboard</SelectItem>
                                  <SelectItem value="55L">55L - Mini mal</SelectItem>
                                  <SelectItem value="60L">60L - Mini mal</SelectItem>
                                  <SelectItem value="65L">65L - Longboard</SelectItem>
                                  <SelectItem value="70L">70L - Longboard</SelectItem>
                                  <SelectItem value="75L">75L - Longboard</SelectItem>
                                  <SelectItem value="80L">80L - Longboard</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            {/* Cor da Prancha */}
                            <div>
                              <Label className="text-ocean-100 text-xs font-medium">Cor</Label>
                              <div className="flex items-center space-x-3 mt-2">
                                {/* Preview do ícone com cor selecionada */}
                                <div className="flex items-center space-x-2">
                                  {getBoardIcon(newBoard.name, "h-6 w-6", newBoard.color)}
                                  <span className="text-ocean-200 text-xs">Preview</span>
                                </div>
                                
                                {/* Cores predefinidas */}
                                <div className="flex flex-wrap gap-2">
                                  {[
                                    '#3b82f6', // Azul
                                    '#ef4444', // Vermelho
                                    '#10b981', // Verde
                                    '#f59e0b', // Amarelo
                                    '#8b5cf6', // Roxo
                                    '#ec4899', // Rosa
                                    '#06b6d4', // Ciano
                                    '#84cc16', // Lima
                                    '#f97316', // Laranja
                                    '#6b7280', // Cinza
                                    '#1f2937', // Cinza escuro
                                    '#ffffff'  // Branco
                                  ].map((color) => (
                                    <button
                                      key={color}
                                      type="button"
                                      onClick={() => setNewBoard({...newBoard, color})}
                                      className={`w-6 h-6 rounded-full border-2 transition-all ${
                                        newBoard.color === color 
                                          ? 'border-white scale-110' 
                                          : 'border-ocean-600/50 hover:border-ocean-400/70 hover:scale-105'
                                      }`}
                                      style={{ backgroundColor: color }}
                                    />
                                  ))}
                                </div>
                                
                                {/* Input de cor personalizada */}
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="color"
                                    value={newBoard.color}
                                    onChange={(e) => setNewBoard({...newBoard, color: e.target.value})}
                                    className="w-8 h-8 rounded border border-ocean-600/30 bg-transparent cursor-pointer"
                                  />
                                  <span className="text-ocean-200 text-xs">Custom</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 pt-2">
                            <Button 
                              onClick={handleAddBoard} 
                              size="sm" 
                              className="bg-ocean-600 hover:bg-ocean-500 text-white"
                              disabled={!newBoard.name || !newBoard.length || !newBoard.volume || !newBoard.color}
                            >
                              Adicionar
                            </Button>
                            <Button onClick={() => setIsAddingBoard(false)} variant="outline" size="sm" className="border-ocean-600/50 text-ocean-100 hover:bg-ocean-700/70 bg-ocean-800/30">
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button 
                          onClick={() => setIsAddingBoard(true)} 
                          variant="outline" 
                          size="sm" 
                          className="w-full border-ocean-600/50 text-ocean-100 hover:bg-ocean-700/70 bg-ocean-800/30"
                        >
                          + Adicionar Prancha
                        </Button>
                      )}
                    </div>

                    {/* Preferências */}
                    <div>
                      <Label className="text-ocean-100 flex items-center mb-2">
                        <Heart className="h-4 w-4 mr-2" />
                        Preferências de Surf
                      </Label>
                      
                      {/* Preferências selecionadas */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {selectedPreferences.map((pref) => (
                          <Badge 
                            key={pref} 
                            variant="secondary" 
                            className="bg-ocean-600/50 text-ocean-100 border-ocean-500/30 cursor-pointer hover:bg-red-600/50"
                            onClick={() => handleRemovePreference(pref)}
                          >
                            {pref} ×
                          </Badge>
                        ))}
                      </div>

                      {/* Sugestões */}
                      <div className="space-y-2">
                        <p className="text-xs text-ocean-200">Sugestões (clique para adicionar):</p>
                        <div className="flex flex-wrap gap-1">
                          {preferenceSuggestions
                            .filter(suggestion => !selectedPreferences.includes(suggestion))
                            .slice(0, 8)
                            .map((suggestion) => (
                              <Badge 
                                key={suggestion}
                                variant="outline" 
                                className="text-xs cursor-pointer border-ocean-600/30 text-ocean-200 hover:bg-ocean-600/30"
                                onClick={() => handleTogglePreference(suggestion)}
                              >
                                + {suggestion}
                              </Badge>
                            ))}
                        </div>
                      </div>

                      {/* Adicionar preferência customizada */}
                      <div className="flex gap-2 mt-3">
                        <Input
                          placeholder="Adicionar preferência personalizada..."
                          value={customPreference}
                          onChange={(e) => setCustomPreference(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleAddCustomPreference()}
                          className="bg-ocean-700/30 border-ocean-600/30 text-white placeholder:text-ocean-200 text-sm"
                        />
                        <Button onClick={handleAddCustomPreference} size="sm" className="bg-ocean-600 hover:bg-ocean-500 text-white">
                          +
                        </Button>
                      </div>
                    </div>

                    {/* Botões de ação */}
                    <div className="flex space-x-2 pt-4">
                      <Button onClick={handleSave} className="bg-ocean-gradient text-white">
                        Salvar
                      </Button>
                      <Button variant="outline" onClick={() => setEditMode(false)} className="border-ocean-600/50 text-ocean-100 hover:bg-ocean-700/70 bg-ocean-800/30">
                        Cancelar
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Visualização - Nome */}
                    <div>
                      <p className="text-sm text-ocean-200 flex items-center">
                        <UserCircle className="h-4 w-4 mr-2 text-ocean-200" />
                        Nome
                      </p>
                      <p className="font-medium ml-6 text-white">{formData.name || 'Não informado'}</p>
                    </div>

                    {/* Visualização - Peso */}
                    <div>
                      <p className="text-sm text-ocean-200 flex items-center">
                        <Weight className="h-4 w-4 mr-2 text-ocean-200" />
                        Peso
                      </p>
                      <p className="font-medium ml-6 text-white">{formData.weight ? `${formData.weight} kg` : 'Não informado'}</p>
                    </div>

                    {/* Visualização - Nível */}
                    <div>
                      <p className="text-sm text-ocean-200 flex items-center">
                        <Award className="h-4 w-4 mr-2 text-ocean-200" />
                        Nível
                      </p>
                      <div className="ml-6">
                        <Badge variant="secondary" className="bg-ocean-700/50 text-ocean-100 border-ocean-600/30">{formData.level || 'Não informado'}</Badge>
                      </div>
                    </div>

                    {/* Visualização - Pranchas */}
                    <div>
                      <p className="text-sm text-ocean-200 flex items-center">
                        <Waves className="h-4 w-4 mr-2 text-ocean-200" />
                        Minhas Pranchas
                      </p>
                      <div className="ml-6 space-y-2 mt-2">
                        {boards.length > 0 ? (
                          boards.map((board) => (
                            <div key={board.id} className="bg-ocean-700/20 p-3 rounded-lg border border-ocean-600/20">
                              {editingBoardId === board.id ? (
                                // Modo de edição para esta prancha
                                <div className="space-y-3">
                                  <div className="flex items-center space-x-3 mb-3">
                                    {getBoardIcon(editingBoard.name, "h-5 w-5 flex-shrink-0", editingBoard.color)}
                                    <span className="text-white text-sm font-medium">Editando prancha</span>
                                  </div>
                                  
                                  {/* Tipo da Prancha */}
                                  <div>
                                    <Label className="text-ocean-100 text-xs font-medium">Tipo</Label>
                                    <Select
                                      value={editingBoard.name}
                                      onValueChange={(value) => setEditingBoard({...editingBoard, name: value})}
                                    >
                                      <SelectTrigger className="bg-ocean-700/30 border-ocean-600/30 text-white text-xs">
                                        <SelectValue placeholder="Escolha o tipo..." />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Shortboard">Shortboard</SelectItem>
                                        <SelectItem value="Longboard">Longboard</SelectItem>
                                        <SelectItem value="Funboard">Funboard</SelectItem>
                                        <SelectItem value="Fish">Fish</SelectItem>
                                        <SelectItem value="Gun">Gun</SelectItem>
                                        <SelectItem value="Mini Mal">Mini Mal</SelectItem>
                                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                                        <SelectItem value="Step Up">Step Up</SelectItem>
                                        <SelectItem value="Mini Simmons">Mini Simmons</SelectItem>
                                        <SelectItem value="Foamboard">Foamboard</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  
                                  {/* Tamanho da Prancha */}
                                  <div>
                                    <Label className="text-ocean-100 text-xs font-medium">Tamanho</Label>
                                    <Select
                                      value={editingBoard.length}
                                      onValueChange={(value) => setEditingBoard({...editingBoard, length: value})}
                                    >
                                      <SelectTrigger className="bg-ocean-700/30 border-ocean-600/30 text-white text-xs">
                                        <SelectValue placeholder="Escolha o tamanho..." />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="5'6">5'6" (168cm)</SelectItem>
                                        <SelectItem value="5'8">5'8" (173cm)</SelectItem>
                                        <SelectItem value="5'10">5'10" (178cm)</SelectItem>
                                        <SelectItem value="5'11">5'11" (180cm)</SelectItem>
                                        <SelectItem value="6'0">6'0" (183cm)</SelectItem>
                                        <SelectItem value="6'1">6'1" (185cm)</SelectItem>
                                        <SelectItem value="6'2">6'2" (188cm)</SelectItem>
                                        <SelectItem value="6'3">6'3" (191cm)</SelectItem>
                                        <SelectItem value="6'4">6'4" (193cm)</SelectItem>
                                        <SelectItem value="6'6">6'6" (198cm)</SelectItem>
                                        <SelectItem value="7'0">7'0" (213cm)</SelectItem>
                                        <SelectItem value="7'6">7'6" (229cm)</SelectItem>
                                        <SelectItem value="8'0">8'0" (244cm)</SelectItem>
                                        <SelectItem value="8'6">8'6" (259cm)</SelectItem>
                                        <SelectItem value="9'0">9'0" (274cm)</SelectItem>
                                        <SelectItem value="9'2">9'2" (279cm)</SelectItem>
                                        <SelectItem value="9'6">9'6" (290cm)</SelectItem>
                                        <SelectItem value="10'0">10'0" (305cm)</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  
                                  {/* Volume/Litragem */}
                                  <div>
                                    <Label className="text-ocean-100 text-xs font-medium">Volume</Label>
                                    <Select
                                      value={editingBoard.volume}
                                      onValueChange={(value) => setEditingBoard({...editingBoard, volume: value})}
                                    >
                                      <SelectTrigger className="bg-ocean-700/30 border-ocean-600/30 text-white text-xs">
                                        <SelectValue placeholder="Escolha o volume..." />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="18L">18L - Ultra baixo</SelectItem>
                                        <SelectItem value="20L">20L - Muito baixo</SelectItem>
                                        <SelectItem value="22L">22L - Baixo</SelectItem>
                                        <SelectItem value="24L">24L - Baixo médio</SelectItem>
                                        <SelectItem value="26L">26L - Médio baixo</SelectItem>
                                        <SelectItem value="28L">28L - Médio</SelectItem>
                                        <SelectItem value="30L">30L - Médio</SelectItem>
                                        <SelectItem value="32L">32L - Médio alto</SelectItem>
                                        <SelectItem value="34L">34L - Alto</SelectItem>
                                        <SelectItem value="36L">36L - Alto</SelectItem>
                                        <SelectItem value="38L">38L - Muito alto</SelectItem>
                                        <SelectItem value="40L">40L - Muito alto</SelectItem>
                                        <SelectItem value="45L">45L - Funboard</SelectItem>
                                        <SelectItem value="50L">50L - Funboard</SelectItem>
                                        <SelectItem value="55L">55L - Mini mal</SelectItem>
                                        <SelectItem value="60L">60L - Mini mal</SelectItem>
                                        <SelectItem value="65L">65L - Longboard</SelectItem>
                                        <SelectItem value="70L">70L - Longboard</SelectItem>
                                        <SelectItem value="75L">75L - Longboard</SelectItem>
                                        <SelectItem value="80L">80L - Longboard</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  
                                  {/* Cor da Prancha */}
                                  <div>
                                    <Label className="text-ocean-100 text-xs font-medium">Cor</Label>
                                    <div className="flex items-center space-x-3 mt-2">
                                      {/* Preview do ícone com cor selecionada */}
                                      <div className="flex items-center space-x-2">
                                        {getBoardIcon(editingBoard.name, "h-6 w-6", editingBoard.color)}
                                        <span className="text-ocean-200 text-xs">Preview</span>
                                      </div>
                                      
                                      {/* Cores predefinidas */}
                                      <div className="flex flex-wrap gap-2">
                                        {[
                                          '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899',
                                          '#06b6d4', '#84cc16', '#f97316', '#6b7280', '#1f2937', '#ffffff'
                                        ].map((color) => (
                                          <button
                                            key={color}
                                            type="button"
                                            onClick={() => setEditingBoard({...editingBoard, color})}
                                            className={`w-6 h-6 rounded-full border-2 transition-all ${
                                              editingBoard.color === color 
                                                ? 'border-white scale-110' 
                                                : 'border-ocean-600/50 hover:border-ocean-400/70 hover:scale-105'
                                            }`}
                                            style={{ backgroundColor: color }}
                                          />
                                        ))}
                                      </div>
                                      
                                      {/* Input de cor personalizada */}
                                      <div className="flex items-center space-x-2">
                                        <input
                                          type="color"
                                          value={editingBoard.color}
                                          onChange={(e) => setEditingBoard({...editingBoard, color: e.target.value})}
                                          className="w-8 h-8 rounded border border-ocean-600/30 bg-transparent cursor-pointer"
                                        />
                                        <span className="text-ocean-200 text-xs">Custom</span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Botões de ação */}
                                  <div className="flex gap-2 pt-2">
                                    <Button 
                                      onClick={handleSaveEditBoard} 
                                      size="sm" 
                                      className="bg-ocean-600 hover:bg-ocean-500 text-white"
                                      disabled={!editingBoard.name || !editingBoard.length || !editingBoard.volume || !editingBoard.color}
                                    >
                                      Salvar
                                    </Button>
                                    <Button onClick={handleCancelEditBoard} variant="outline" size="sm" className="border-ocean-600/50 text-ocean-100 hover:bg-ocean-700/70 bg-ocean-800/30">
                                      Cancelar
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                // Modo de visualização normal
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    {getBoardIcon(board.name, "h-5 w-5 flex-shrink-0", board.color || '#3b82f6')}
                                    <div className="flex flex-col">
                                      <span className="text-white text-sm font-medium">
                                        {board.length} • {board.volume}
                                      </span>
                                      <span className="text-ocean-200 text-xs">
                                        {board.name}
                                      </span>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditBoard(board)}
                                    className="text-ocean-300 hover:text-white hover:bg-ocean-700/50 h-8 w-8 p-0 flex-shrink-0"
                                  >
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-ocean-200">Nenhuma prancha cadastrada</p>
                        )}
                      </div>
                    </div>

                    {/* Visualização - Preferências */}
                    <div>
                      <p className="text-sm text-ocean-200 flex items-center">
                        <Heart className="h-4 w-4 mr-2 text-ocean-200" />
                        Preferências
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1 ml-6">
                        {selectedPreferences.length > 0 ? (
                          selectedPreferences.map((pref, index) => (
                            <Badge key={index} variant="outline" className="text-xs bg-ocean-700/30 text-ocean-100 border-ocean-600/30">
                              {pref}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-ocean-200">Nenhuma preferência definida</p>
                        )}
                      </div>
                    </div>

                    {/* Histórico de mudanças */}
                    {preferenceHistory.length > 0 && (
                      <div>
                        <Button
                          variant="ghost"
                          onClick={() => setShowHistory(!showHistory)}
                          className="p-0 h-auto text-sm text-ocean-200 flex items-center hover:bg-transparent hover:text-ocean-200"
                        >
                          <History className="h-4 w-4 mr-2 text-ocean-200" />
                          Histórico de Mudanças ({preferenceHistory.length})
                          <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showHistory ? 'rotate-180' : ''}`} />
                        </Button>
                        
                        {showHistory && (
                          <div className="ml-6 space-y-2 mt-3 animate-expand-down overflow-hidden">
                            {preferenceHistory.map((change, index) => (
                              <div key={index} className="bg-ocean-700/20 p-3 rounded-lg border border-ocean-600/20">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-ocean-200 text-xs">
                                    {new Date(change.date).toLocaleDateString('pt-BR', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                  <Badge variant="outline" className="text-xs border-ocean-600/30 text-ocean-200 bg-ocean-800/30">
                                    {change.type === 'preference' ? 'Preferências' : 'Pranchas'}
                                  </Badge>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-white text-xs">
                                    <span className="text-red-300 font-medium">Antes:</span> {change.oldValue}
                                  </p>
                                  <p className="text-white text-xs">
                                    <span className="text-green-300 font-medium">Agora:</span> {change.newValue}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
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
                            Tudo
                          </span>
                        </SelectItem>
                        <SelectItem value="year">
                          <span className="flex items-center">
                            Último Ano
                          </span>
                        </SelectItem>
                        <SelectItem value="month">
                          <span className="flex items-center">
                            Último Mês
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
                  
                  {/* Primeira linha: Data, Local, Duração, Prancha */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
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
                    <div>
                      <Label htmlFor="board" className="text-ocean-100 text-sm font-medium">Prancha Usada</Label>
                      <Select
                        value={newSession.board}
                        onValueChange={v => setNewSession({ ...newSession, board: v })}
                      >
                        <SelectTrigger className="mt-1 bg-ocean-700/30 border-ocean-600/30 text-white">
                          <SelectValue placeholder="Escolha a prancha..." />
                        </SelectTrigger>
                        <SelectContent>
                          {boards.length > 0 ? (
                            boards.map((board) => (
                              <SelectItem key={board.id} value={board.id}>
                                <div className="flex items-center space-x-2">
                                  <img 
                                    src="/img/surfboard-with-line.png" 
                                    alt="Surfboard"
                                    className="h-4 w-4"
                                    style={{ 
                                      filter: board.color === '#ffffff' || board.color === 'white' 
                                        ? 'brightness(0) saturate(100%) invert(70%)' // Cinza claro para branco
                                        : hexToFilter(board.color || '#3b82f6'),
                                      transition: 'filter 0.2s ease'
                                    }}
                                  />
                                  <span>{board.length} • {board.volume}</span>
                                </div>
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-boards" disabled>
                              Cadastre uma prancha primeiro
                            </SelectItem>
                          )}
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
                        notes: '',
                        board: ''
                      })}
                    >
                      Limpar Formulário
                    </Button>
                    <Button 
                      className="bg-ocean-gradient text-white hover:opacity-90 px-6 py-2 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed" 
                      onClick={handleAddSession}
                      disabled={!newSession.date || !newSession.location || !newSession.duration || !newSession.waves || !newSession.board}
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
                            <Label htmlFor={`board-edit-${session.id}`}>Prancha</Label>
                            <Select
                              value={session.board || ''}
                              onValueChange={v => setSurfSessions(surfSessions.map(s => s.id === session.id ? { ...s, board: v } : s))}
                            >
                              <SelectTrigger className="w-40">
                                <SelectValue placeholder="Prancha..." />
                              </SelectTrigger>
                              <SelectContent>
                                {boards.length > 0 ? (
                                  boards.map((board) => (
                                    <SelectItem key={board.id} value={board.id}>
                                      <div className="flex items-center space-x-2">
                                        <img 
                                          src="/img/surfboard-with-line.png" 
                                          alt="Surfboard"
                                          className="h-4 w-4"
                                          style={{ 
                                            filter: board.color === '#ffffff' || board.color === 'white' 
                                              ? 'brightness(0) saturate(100%) invert(70%)' // Cinza claro para branco
                                              : hexToFilter(board.color || '#3b82f6'),
                                            transition: 'filter 0.2s ease'
                                          }}
                                        />
                                        <span>{board.length} • {board.volume}</span>
                                      </div>
                                    </SelectItem>
                                  ))
                                ) : (
                                  <SelectItem value="no-boards" disabled>
                                    Cadastre uma prancha primeiro
                                  </SelectItem>
                                )}
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
                          {session.board && boards.find(b => b.id === session.board) && (
                            <span className="flex items-center space-x-1">
                              {getBoardIcon(
                                boards.find(b => b.id === session.board)?.name || 'Shortboard', 
                                "h-3 w-3", 
                                boards.find(b => b.id === session.board)?.color === '#ffffff' || boards.find(b => b.id === session.board)?.color === 'white'
                                  ? '#9ca3af' // Cinza claro para branco
                                  : boards.find(b => b.id === session.board)?.color || '#3b82f6'
                              )}
                              <span>{boards.find(b => b.id === session.board)?.length} • {boards.find(b => b.id === session.board)?.volume}</span>
                            </span>
                          )}
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
