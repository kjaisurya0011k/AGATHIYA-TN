import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ydpkejzxzluzauyvkeob.supabase.co';
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

if (!supabasePublishableKey) {
  console.warn(
    '[EEE-TN] Supabase Publishable Key is missing. Please set VITE_SUPABASE_PUBLISHABLE_KEY in .env.local'
  );
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey || 'placeholder-key', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage
  }
});
