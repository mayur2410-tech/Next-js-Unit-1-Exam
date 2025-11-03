import { NextResponse } from 'next/server';
import axios from 'axios';
import dbConnect from '../../../../lib/mongodb'
import Fund from '../../../../models/Fund';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();

    // Fetch funds from external API using axios
    const { data: allFunds } = await axios.get('https://api.mfapi.in/mf');

    if (!Array.isArray(allFunds)) {
      throw new Error('Invalid response from MF API');
    }

    // Filter active funds
    const activeFunds = allFunds.filter(
      fund => fund.isinGrowth !== null || fund.isinDivReinvestment !== null
    );

    // Update database
    await Fund.deleteMany({});
    const updatedFunds = await Fund.insertMany(
      activeFunds.map(fund => ({
        ...fund,
        updatedAt: new Date(),
      }))
    );

    return NextResponse.json({
      status: 'success',
      count: updatedFunds.length,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating funds:', error);
    return NextResponse.json(
      { status: 'error', message: error.message },
      { status: 500 }
    );
  }
}
