import { NextResponse } from "next/server";
import { calcSIP, getSchemeDetails } from "@/lib/mfapi";

export const revalidate = 0;

export async function POST(
  req: Request,
  { params }: { params: { code: string } }
) {
  const body = await req.json();
  const { amount, frequency, from, to } = body as {
    amount: number;
    frequency: "monthly";
    from: string;
    to?: string;
  };

  const details = await getSchemeDetails(params.code);
  const result = calcSIP(details.navHistory, { amount, frequency, from, to });
  return NextResponse.json(result);
}