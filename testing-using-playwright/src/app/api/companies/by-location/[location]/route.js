
import clientPromise from '../../../../../../lib/mongodb.js';


export async function GET(request, { params }) {
  try {
    const locationParam = params.location; // dynamic route parameter

    const client = await clientPromise;
    const db = client.db(); // replace with your DB name
    const companies = db.collection('companies');

    // case-insensitive match for location
    const matchedCompanies = await companies
      .find({ location: { $regex: `^${locationParam}$`, $options: 'i' } })
      .toArray();

    return new Response(JSON.stringify(matchedCompanies), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Failed to fetch companies by location' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}