import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nqscestrzthcjuavldys.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xc2Nlc3RyenRoY2p1YXZsZHlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQxMTU3OTAsImV4cCI6MjA0OTY5MTc5MH0.sYJNEKmfMRtQqBNyJTLhGQhwaXWXpOzg4u6lVnGLDng';

// Create Supabase client with type safety
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper function to handle Supabase errors
export function handleSupabaseError(error: any): string {
  if (error?.message) {
    return error.message;
  }
  if (error?.details) {
    return error.details;
  }
  return 'An unexpected error occurred';
}