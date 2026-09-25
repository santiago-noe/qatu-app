import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api";

export async function GET() {
  try {
    const res = await backendFetch("/health");
    return NextResponse.json(await res.json(), { status: res.status });
  } catch {
    return NextResponse.json({ status: "backend_unreachable" }, { status: 502 });
  }
}
