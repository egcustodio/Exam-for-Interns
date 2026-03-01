/**
 * GET /api/debug
 * Returns a health-check of environment variables and Supabase connectivity.
 * REMOVE THIS FILE before going to final production.
 */
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase.server";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const envCheck = {
    NEXT_PUBLIC_SUPABASE_URL: url ? `✅ set (${url})` : "❌ missing",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: anonKey
      ? `✅ set (length: ${anonKey.length})`
      : "❌ missing",
    SUPABASE_SERVICE_ROLE_KEY: serviceKey
      ? `✅ set (length: ${serviceKey.length})`
      : "❌ missing",
  };

  // Try a lightweight query against the table
  let dbCheck: string;
  try {
    const { error } = await supabaseAdmin
      .from("exam_results")
      .select("id")
      .limit(1);
    dbCheck = error ? `❌ query error: ${error.message}` : "✅ connected";
  } catch (e: unknown) {
    dbCheck = `❌ exception: ${e instanceof Error ? e.message : String(e)}`;
  }

  return NextResponse.json({ env: envCheck, db: dbCheck });
}
