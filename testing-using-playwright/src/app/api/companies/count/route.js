//api/companies/count.js
import clientPromise from '../../../../../lib/mongodb.js';


export async function GET(request) {
  try {
    const url = new URL(request.url);
    const name = url.searchParams.get('name');
    const location = url.searchParams.get('location');
    const skill = url.searchParams.get('skill');

    const client = await clientPromise;
    const db = client.db(); // replace with your DB name
    const companies = db.collection('companies');

    const filter = {};
    if (name) filter.name = { $regex: name, $options: 'i' };
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (skill) filter.skills = { $in: [skill] };

    const total = await companies.countDocuments(filter);

    return new Response(JSON.stringify({ total }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Failed to fetch company count' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
