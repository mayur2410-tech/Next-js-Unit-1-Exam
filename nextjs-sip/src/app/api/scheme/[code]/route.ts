import { NextResponse } from "next/server";
import { getSchemeDetails } from "@/lib/mfapi";

export const revalidate = 0;

export async function GET(
  _req: Request,
  { params }: { params: { code: string } }
) {
  const code = params.code;
  const result = await getSchemeDetails(code);
  return NextResponse.json(result);
}