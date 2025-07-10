import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Profile = {
  id: string;
  name?: string;
  email?: string;
  board_type?: string;
  weight?: number;
  level?: string;
  preferences?: string;
  boards?: string; // JSON string das pranchas
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
    
    // Limpar dados undefined/null/empty para evitar problemas
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => {
        if (value === undefined || value === null) return false;
        if (typeof value === 'string' && value.trim() === '') return false;
        if (typeof value === 'number' && value === 0) return false;
        return true;
      })
    );
    
    console.log('Dados limpos a serem enviados:', cleanData);
    
    try {
      // Tentar fazer update primeiro (mais comum)
      const { data: updateResult, error: updateError } = await supabase
        .from('profiles')
        .update(cleanData)
        .eq('id', user.id)
        .select()
        .single();
      
      if (updateError) {
        console.log('Update falhou, tentando insert:', updateError.message);
        
        // Se update falhar (perfil não existe), fazer insert
        const { data: insertResult, error: insertError } = await supabase
          .from('profiles')
          .insert({ id: user.id, ...cleanData })
          .select()
          .single();
        
        if (insertError) {
          console.error('Insert também falhou:', insertError);
          throw insertError;
        }
        
        console.log('Perfil criado com sucesso:', insertResult);
        setUser({ ...user, ...cleanData });
      } else {
        console.log('Perfil atualizado com sucesso:', updateResult);
        setUser({ ...user, ...cleanData });
      }
      
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
