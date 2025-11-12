// Supabase project configuration
// Values are loaded from environment variables

export const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID || "duxeeawfyxcciwlyjllk";
export const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1eGVlYXdmeXhjY2l3bHlqbGxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNzcwMDQsImV4cCI6MjA3Nzg1MzAwNH0.1BWI_11MST5ZC19NEx5yZoLJHn3MtOmgfd-Fs8FQhVc";

if (!import.meta.env.VITE_SUPABASE_PROJECT_ID || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn('⚠️ Supabase credentials not found in .env file, using fallback values');
}