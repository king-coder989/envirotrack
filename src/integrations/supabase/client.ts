// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://jqmmpqxzajvvqrwvwece.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxbW1wcXh6YWp2dnFyd3Z3ZWNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1NzU2MjcsImV4cCI6MjA2MDE1MTYyN30.-xk7NXTQL90uIVUbmcrsnXk2BnwrOkey_bRKl53o1MQ";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);