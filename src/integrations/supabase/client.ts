
import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = "https://zycfmehporlshbcpruvr.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp5Y2ZtZWhwb3Jsc2hiY3BydXZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3NjcyNTQsImV4cCI6MjA1NjM0MzI1NH0.W2pB_8MJ8mHCXXFLZ5avaZrS20d2JbXbH3tr57j6wus";

// Create a single supabase client instance for the entire app
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'wealth-finance-auth-storage',
    debug: true, // Add debug for development
  },
  global: {
    headers: {
      'x-client-info': 'wealth-finance-app' // Add custom header for debugging
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

console.log("Supabase client initialized with URL:", SUPABASE_URL);
