import { NextResponse } from "next/server";
import { cacheTTL, getAllSchemes } from "@/lib/mfapi";

export const revalidate = 0; // runtime route

export async function GET() {
  const data = await getAllSchemes();
  return NextResponse.json(data, {
    headers: {
      "Cache-Control": `s-maxage=${cacheTTL.mfList}, stale-while-revalidate=${cacheTTL.mfList}`
    }
  });
}