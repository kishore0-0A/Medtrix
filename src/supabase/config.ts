const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!url) {
  throw new Error('Missing EXPO_PUBLIC_SUPABASE_URL in .env');
}

if (!anonKey) {
  throw new Error('Missing EXPO_PUBLIC_SUPABASE_ANON_KEY in .env');
}

export const supabaseConfig = {
  url,
  anonKey,
};
