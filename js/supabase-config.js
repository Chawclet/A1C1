// This file initializes the Supabase connection using the CDN-provided global object
const supabaseClient = window.supabase.createClient(
  "https://vzkskbhzziurukhkcyrg.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6a3NrYmh6eml1cnVraGtjeXJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0NDcxOTQsImV4cCI6MjA4NDAyMzE5NH0.r3P6K9DjHpXWD92i2rmMcUWXV3piaQ842bU7N9LZILs"
);

console.log("Supabase initialized successfully.");
