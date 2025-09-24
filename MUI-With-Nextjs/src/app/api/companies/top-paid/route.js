// app/api/companies/top-paid/route.js
import clientPromise from '../../../../../lib/mongodb.js';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    let limit = parseInt(url.searchParams.get('limit')) || 5;

    // enforce maximum limit of 50
    if (limit > 50) limit = 50;
    if (limit < 1) limit = 1;

    const client = await clientPromise;
    const db = client.db(); // replace with your DB name
    const companies = db.collection('companies');

    // fetch companies sorted by baseSalary descending
    const topCompanies = await companies
      .find({})
      .sort({ baseSalary: -1 })
      .limit(limit)
      .toArray();

    return new Response(JSON.stringify(topCompanies), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Failed to fetch top-paid companies' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
