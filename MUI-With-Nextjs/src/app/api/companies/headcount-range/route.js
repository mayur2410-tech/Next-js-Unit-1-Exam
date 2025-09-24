// app/api/companies/headcount-range/route.ts
import { NextResponse } from "next/server";
import clientPromise from "../../../../../lib/mongodb.js";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Default values
    const min = parseInt(searchParams.get("min") || "0", 10);
    const max = searchParams.get("max")
      ? parseInt(searchParams.get("max"), 10)
      : Number.MAX_SAFE_INTEGER;

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db(); // uses the default DB from your MONGODB_URL
    const companiesCollection = db.collection("companies");

    // Query MongoDB for companies within headcount range
    const companies = await companiesCollection
      .find({
        headcount: { $gte: min, $lte: max },
      })
      .toArray();

    return NextResponse.json(companies);
  } catch (error) {
    console.error("Error fetching companies:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
