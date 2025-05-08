import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ooycnvrxpjgollndnjot.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ...'; // truncated for safety

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
