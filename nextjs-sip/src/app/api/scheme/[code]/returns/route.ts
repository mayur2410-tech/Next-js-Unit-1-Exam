import { NextResponse } from "next/server";
import { calcReturns, getSchemeDetails } from "@/lib/mfapi";

export const revalidate = 0;

export async function GET(
  req: Request,
  { params }: { params: { code: string } }
) {
  const url = new URL(req.url);
  const period = url.searchParams.get("period") as "1m" | "3m" | "6m" | "1y" | null;
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  const details = await getSchemeDetails(params.code);
  const result = calcReturns(details.navHistory, { period, from, to });
  return NextResponse.json(result);
}