// 1. Open your Supabase Dashboard: Settings > API
// 2. Copy the "Project URL" and "anon / public" key
const SUPABASE_URL = 'https://vzkskbhzziurukhkcyrg.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6a3NrYmh6eml1cnVraGtjeXJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0NDcxOTQsImV4cCI6MjA4NDAyMzE5NH0.r3P6K9DjHpXWD92i2rmMcUWXV3piaQ842bU7N9LZILs';

// This creates the connection to your database
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log("Supabase initialized:", !!supabaseClient);
