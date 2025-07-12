import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Profile = {
  id: string;
  name?: string;
  email?: string;
  board_type?: string; // Campo legado mantido para compatibilidade
  weight?: number;
  level?: string;
  preferences?: string;
  boards?: any; // JSONB - pode ser string ou objeto
  created_at?: string;
  updated_at?: string;
};

type AuthContextType = {
  user: Profile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  signup: async () => {},
  loginWithGoogle: async () => {},
  logout: async () => {},
  updateProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Buscar usuário inicial
    const getInitialUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        // Usar dados básicos do auth sem buscar perfil
        setUser({
          id: authUser.id,
          name: authUser.user_metadata?.name || authUser.user_metadata?.full_name || '',
          email: authUser.email || ''
        });
      }
      setLoading(false);
    };
    getInitialUser();

    // Listener para mudanças de auth
    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || '',
          email: session.user.email || ''
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription?.subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signup = async (name: string, email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) throw error;
  };

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const updateProfile = async (data: Partial<Profile>) => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }
    
    console.log('Atualizando perfil para usuário:', user.id);
    console.log('Dados recebidos:', data);
    
    // Preparar dados para o Supabase
    const supabaseData: any = {};
    
    // Campos simples
    if (data.name !== undefined && data.name.trim()) {
      supabaseData.name = data.name.trim();
    }
    if (data.email !== undefined && data.email.trim()) {
      supabaseData.email = data.email.trim();
    }
    if (data.weight !== undefined && data.weight > 0) {
      supabaseData.weight = Number(data.weight);
    }
    if (data.level !== undefined && data.level.trim()) {
      supabaseData.level = data.level.trim();
    }
    if (data.preferences !== undefined) {
      supabaseData.preferences = data.preferences;
    }
    
    // Campo boards - converter string JSON para objeto se necessário
    if (data.boards !== undefined) {
      try {
        // Se boards é uma string JSON, parsear para objeto
        if (typeof data.boards === 'string') {
          supabaseData.boards = JSON.parse(data.boards);
        } else {
          // Se já é um objeto/array, usar diretamente
          supabaseData.boards = data.boards;
        }
      } catch (error) {
        console.error('Erro ao processar boards:', error);
        supabaseData.boards = [];
      }
    }
    
    console.log('Dados preparados para Supabase:', supabaseData);
    
    try {
      // Tentar fazer upsert (update ou insert)
      const { data: result, error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, ...supabaseData })
        .select()
        .single();
      
      if (error) {
        console.error('Erro no upsert:', error);
        throw error;
      }
      
      console.log('Perfil salvo com sucesso:', result);
      
      // Atualizar estado local
      setUser({ ...user, ...data });
      
    } catch (error) {
      console.error('Erro na função updateProfile:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, loginWithGoogle, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
