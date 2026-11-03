import { supabase } from './supabase';

export async function ensureAnonymousSession() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    const { error } = await supabase.auth.signInAnonymously();
    if (error) console.error('Error en sesión anónima:', error.message);
  }
}