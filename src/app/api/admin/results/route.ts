/**
 * GET  /api/admin/results        — list all results
 * DELETE /api/admin/results?id=… — delete one result
 * Both require the X-Admin-Password header.
 */
import { NextRequest, NextResponse } from "next/server";
import { getAllResults, deleteResult } from "@/lib/resultStore.server";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin1234";

export async function GET(req: NextRequest) {
  const pw = req.headers.get("x-admin-password");
  if (pw !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = await getAllResults();
  return NextResponse.json({ results });
}

export async function DELETE(req: NextRequest) {
  const pw = req.headers.get("x-admin-password");
  if (pw !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  await deleteResult(id);
  return NextResponse.json({ ok: true });
}
