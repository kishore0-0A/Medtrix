import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';

import { supabase } from './client';

// MOCK DATA FOR DEVELOPMENT
const mockUser: User = {
  id: '12345-mock-user-id',
  app_metadata: {},
  user_metadata: { full_name: 'Test User' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  email: 'test@example.com',
} as User;

const mockSession: Session = {
  access_token: 'mock-jwt-token',
  refresh_token: 'mock-refresh-token',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: 'bearer',
  user: mockUser,
};

// Simple memory store to simulate auth state
let currentSession: Session | null = null;
let authListener: ((event: AuthChangeEvent, session: Session | null) => void) | null = null;

const notifyListener = (event: AuthChangeEvent, session: Session | null) => {
  if (authListener) {
    authListener(event, session);
  }
};

export const AuthHelpers = {
  async signUp(email: string, password: string, name?: string): Promise<{ data: any, error: Error | null }> {
    if (process.env.EXPO_PUBLIC_SUPABASE_URL !== 'https://your-project-ref.supabase.co') {
      return supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
    }
    currentSession = { ...mockSession, user: { ...mockUser, email, user_metadata: { full_name: name } } };
    notifyListener('SIGNED_IN', currentSession);
    return { data: { user: currentSession.user, session: currentSession }, error: null };
  },

  async signIn(email: string, password: string): Promise<{ data: any, error: Error | null }> {
    if (process.env.EXPO_PUBLIC_SUPABASE_URL !== 'https://your-project-ref.supabase.co') {
      return supabase.auth.signInWithPassword({ email, password });
    }
    currentSession = mockSession;
    notifyListener('SIGNED_IN', currentSession);
    return { data: { user: currentSession.user, session: currentSession }, error: null };
  },

  async signOut(): Promise<{ error: Error | null }> {
    if (process.env.EXPO_PUBLIC_SUPABASE_URL !== 'https://your-project-ref.supabase.co') {
      return supabase.auth.signOut();
    }
    currentSession = null;
    notifyListener('SIGNED_OUT', null);
    return { error: null };
  },

  async getCurrentUser() {
    if (process.env.EXPO_PUBLIC_SUPABASE_URL !== 'https://your-project-ref.supabase.co') {
      const { data } = await supabase.auth.getUser();
      return data.user;
    }
    return currentSession?.user || null;
  },

  async getSession() {
    if (process.env.EXPO_PUBLIC_SUPABASE_URL !== 'https://your-project-ref.supabase.co') {
      const { data } = await supabase.auth.getSession();
      return data.session;
    }
    return currentSession;
  },
  
  async updateUser(attributes: { email?: string; password?: string; data?: any }) {
    if (process.env.EXPO_PUBLIC_SUPABASE_URL !== 'https://your-project-ref.supabase.co') {
      return supabase.auth.updateUser(attributes);
    }
    
    if (currentSession?.user) {
       currentSession.user = {
         ...currentSession.user,
         email: attributes.email || currentSession.user.email,
         user_metadata: { ...currentSession.user.user_metadata, ...(attributes.data || {}) }
       };
       notifyListener('USER_UPDATED', currentSession);
       return { data: { user: currentSession.user }, error: null };
    }
    return { data: null, error: new Error("Not logged in") };
  },

  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    if (process.env.EXPO_PUBLIC_SUPABASE_URL !== 'https://your-project-ref.supabase.co') {
      return supabase.auth.onAuthStateChange(callback).data.subscription;
    }
    authListener = callback;
    callback(currentSession ? 'SIGNED_IN' : 'INITIAL_SESSION', currentSession);
    return { unsubscribe: () => { if (authListener === callback) authListener = null; } };
  },
};
