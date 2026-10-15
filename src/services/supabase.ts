import { createClient } from '@supabase/supabase-js';

// Environment variables are loaded securely via Vite from .env / .env.local
// Fallbacks ensure immediate live connection on Vercel deployments and preview
const DEFAULT_SUPABASE_URL = 'https://iuhmijwzkxaxhqhgmobk.supabase.co/rest/v1/';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1aG1pand6a3hheGhxaGdtb2JrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwNDQwODUsImV4cCI6MjEwNzYyMDA4NX0.q7XSHzkFWhh3qylG5uf-oc6s0ivam4IdoHTXbH03Lbw';

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('placeholder') &&
  !supabaseUrl.includes('your-project')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
