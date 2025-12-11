import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Check if variables are set and not just the placeholders
const isConfigured = supabaseUrl && 
                     supabaseAnonKey && 
                     !supabaseUrl.includes('__VITE') && 
                     !supabaseAnonKey.includes('__VITE');

export const supabase = isConfigured 
    ? createClient(supabaseUrl, supabaseAnonKey) 
    : null;