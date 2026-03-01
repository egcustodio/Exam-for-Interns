/**
 * SERVER-ONLY Supabase client using the service-role key.
 * Has full read/write access — never import this in client components.
 */
import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!url || !key) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env variables."
  );
}

export const supabaseAdmin = createClient<Database>(url, key, {
  auth: { persistSession: false },
});
