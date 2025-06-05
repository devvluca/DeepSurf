import { supabase } from './supabaseClient';

export async function addSurfSession(session: {
  date: string;
  location: string;
  duration: string;
  waves: string;
  rating: number;
  notes: string;
}, userId: string) {
  const { error } = await supabase.from('surf_sessions').insert([
    { ...session, user_id: userId }
  ]);
  if (error) throw error;
}

export async function getSurfSessions(userId: string) {
  const { data, error } = await supabase
    .from('surf_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });
  if (error) throw error;
  return data;
}
