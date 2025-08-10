import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import dotenv from 'dotenv';
console.log(import.meta.env.VITE_SUPABASE_URL);
console.log(import.meta.env.VITE_SUPABASE_PUBLIC_ANON_KEY);


const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLIC_ANON_KEY;
// const SUPABASE_URL = process.env.NEXT_SUPABASE_URL;
// const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_SUPABASE_PUBLIC_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
