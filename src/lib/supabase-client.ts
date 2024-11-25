import { createClient } from '@supabase/supabase-js';
import { config } from './config'

if (!config.supabase.url) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!config.supabase.anonKey) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(
  config.supabase.url,
  config.supabase.anonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);