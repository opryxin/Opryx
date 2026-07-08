import { createClient } from "@supabase/supabase-js";

let supabaseClient: any = null;

export function getSupabase() {
  if (!supabaseClient) {
    try {
      const SUPABASE_URL = "https://idcbtynjxtpxoxqzvpkm.supabase.co";
      const SUPABASE_KEY = "sb_publishable_JamdHyQqcM23s56VzhemXw_dNtVhLSY";
      if (SUPABASE_URL && SUPABASE_KEY) {
        supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);
      }
    } catch (err) {
      console.error("Supabase failed to initialize:", err);
    }
  }
  return supabaseClient;
}
