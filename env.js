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
  VITE_GEMINI_MODEL: '__VITE_GEMINI_MODEL__',

  // --- OpenAI ---
  VITE_OPENAI_API_KEY: '__VITE_OPENAI_API_KEY__',
  VITE_OPENAI_MODEL: '__VITE_OPENAI_MODEL__',

  // --- OpenRouter ---
  VITE_OPENROUTER_API_KEY: '__VITE_OPENROUTER_API_KEY__',
  VITE_OPENROUTER_MODEL: '__VITE_OPENROUTER_MODEL__',

  // --- Perplexity ---
  VITE_PERPLEXITY_API_KEY: '__VITE_PERPLEXITY_API_KEY__',
  VITE_PERPLEXITY_MODEL: '__VITE_PERPLEXITY_MODEL__',

  // --- Groq ---
  VITE_GROQ_API_KEY: '__VITE_GROQ_API_KEY__',
  VITE_GROQ_MODEL: '__VITE_GROQ_MODEL__',

  // --- Supabase ---
  // Required for Authentication & Database
  SUPABASE_URL: '__VITE_SUPABASE_URL__',
  SUPABASE_ANON_KEY: '__VITE_SUPABASE_ANON_KEY__',
};