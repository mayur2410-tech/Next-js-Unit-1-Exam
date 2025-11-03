import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb'
import Fund from '../../../../models/Fund'

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('q') || '';

    const query = search
      ? {
          $or: [
            { schemeName: { $regex: search, $options: 'i' } },
            { schemeCode: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const funds = await Fund.find(query).sort({ schemeName: 1 });
    
    return NextResponse.json(funds);
  } catch (error) {
    console.error('Error fetching funds:', error);
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }
}