import { createClient } from '@supabase/supabase-js';

// يجب استبدال هذه القيم بقيم حقيقية من لوحة تحكم Supabase
const supabaseUrl = 'https://wpssgeusonvzlbleuctt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indwc3NnZXVzb252emxibGV1Y3R0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE4Mzc4NDMsImV4cCI6MjA1NzQxMzg0M30.flhnEX125d2bKHZk5deKzAPPCfWK4TpCGxmJEErSQfc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
