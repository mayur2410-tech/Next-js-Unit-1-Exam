// app/api/companies/by-skill/[skill]/route.js
import clientPromise from '../../../../../../lib/mongodb.js';

export async function GET(request, { params }) {
  try {
    const skillParam = params.skill; // dynamic route parameter

    const client = await clientPromise;
    const db = client.db(); // replace with your DB name
    const companies = db.collection('companies');

    // search inside hiringCriteria.skills array (case-insensitive)
    const matchedCompanies = await companies
      .find({ "hiringCriteria.skills": { $regex: `^${skillParam}$`, $options: 'i' } })
      .toArray();

    return new Response(JSON.stringify(matchedCompanies), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Failed to fetch companies by skill' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
