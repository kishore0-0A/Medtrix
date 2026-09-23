import { supabase } from './client';

export async function testSupabaseConnection() {
  try {
    const {
      data,
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error('SUPABASE CONNECTION ERROR:', error);
      return false;
    }

    console.log('SUPABASE CONNECTION SUCCESS');
    console.log('CURRENT SESSION:', data.session);

    return true;
  } catch (error) {
    console.error('SUPABASE CONNECTION FAILED:', error);
    return false;
  }
}