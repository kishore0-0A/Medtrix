import { supabase } from './client';

export const AuthHelpers = {
  async signUp(email: string, password: string, name?: string) {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });
  },

  async signIn(email: string, password: string) {
    return await supabase.auth.signInWithPassword({ email, password });
  },

  async signOut() {
    return await supabase.auth.signOut();
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    const { data } = supabase.auth.onAuthStateChange(callback);
    return data.subscription;
  },
};
