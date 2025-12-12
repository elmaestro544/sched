// This file is for environment variable configuration.
// It serves as a runtime fallback if the build tool (Vite/Coolify) hasn't injected variables.

window.process = window.process || {};
window.process.env = {
  ...window.process.env,

  // --- INSTRUCTIONS ---
  // If you are running this locally by just opening index.html, you MUST replace the 
  // placeholder strings (e.g., '__VITE_API_KEY__') with your actual API keys below.
  
  // --- Google Gemini ---
  // Primary API Key for Chat, Research, Analysis
  VITE_API_KEY: '__VITE_API_KEY__',

  // --- OpenAI ---
  VITE_OPENAI_API_KEY: '__VITE_OPENAI_API_KEY__',

  // --- OpenRouter ---
  VITE_OPENROUTER_API_KEY: '__VITE_OPENROUTER_API_KEY__',

  // --- Perplexity ---
  VITE_PERPLEXITY_API_KEY: '__VITE_PERPLEXITY_API_KEY__',

  // --- Supabase ---
  // Required for Authentication & Database
  SUPABASE_URL: '__VITE_SUPABASE_URL__',
  SUPABASE_ANON_KEY: '__VITE_SUPABASE_ANON_KEY__',
};