import { NextResponse } from "next/server";

export const revalidate = 0;

// Minimal handler to satisfy typed route generation. The actual implementation
// is in the dynamic route `[code]/route.ts` which returns scheme details.
export async function GET() {
  return NextResponse.json({ error: "Missing scheme code" }, { status: 400 });
}
