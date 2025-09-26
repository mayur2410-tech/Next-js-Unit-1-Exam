import { NextResponse } from "next/server";
import { getFundGroups } from "@/lib/mfapi";

export const revalidate = 0;

export async function GET() {
  const groups = await getFundGroups();
  return NextResponse.json(groups);
}