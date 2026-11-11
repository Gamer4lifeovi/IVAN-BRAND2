import { getSupabaseClient, supabase } from "./client";

/** Browser Supabase client, or null when env vars are missing. */
export function tryDb() {
  return supabase ?? getSupabaseClient();
}
