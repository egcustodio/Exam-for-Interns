/**
 * POST /api/unblock
 * Validates that the token in the unblock URL was issued by the admin.
 * Token = btoa(ADMIN_PASSWORD) — simple, no DB needed.
 */
import { NextRequest, NextResponse } from "next/server";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (!token || typeof token !== "string") {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    // Token is btoa(ADMIN_PASSWORD)
    const expected = Buffer.from(ADMIN_PASSWORD).toString("base64");
    if (token !== expected) {
      return NextResponse.json({ ok: false }, { status: 403 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
