import clientPromise from '../../../../../../lib/mongodb.js';
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const client = await clientPromise;
    const db = client.db('test'); // <-- replace with your DB name
    const { benefit } = params ;

    if (!benefit) {
      return NextResponse.json({ error: "Benefit parameter is required" }, { status: 400 });
    }

    // Case-insensitive substring match in benefits array
    const companies = await db
      .collection("companies") // <-- replace with your collection name
      .find({
        benefits: { $regex: benefit, $options: "i" },
      })
      .toArray();

    return NextResponse.json(companies);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
