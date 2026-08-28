import { createClient, type User as SupabaseUser } from "@supabase/supabase-js";
import { ENV } from "./env";

const configured = Boolean(ENV.supabaseUrl && ENV.supabasePublishableKey);
const supabase = configured
  ? createClient(ENV.supabaseUrl, ENV.supabasePublishableKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;

export function isSupabaseServerConfigured() {
  return Boolean(supabase);
}

export async function getSupabaseUser(accessToken: string): Promise<SupabaseUser | null> {
  if (!supabase || !accessToken) return null;
  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data.user) return null;
  return data.user;
}
