import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://vrstutpoctffnqltlbym.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyc3R1dHBvY3RmZm5xbHRsYnltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NjM1OTYsImV4cCI6MjA2OTIzOTU5Nn0.zqED032IqAIrv61lR2ftYAkY5_jeBfk59af4q-PROrs";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
