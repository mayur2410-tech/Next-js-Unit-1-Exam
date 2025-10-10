import { NextResponse } from 'next/server';
import { calculateSip } from '../../../../../../lib/financial-utils.js';

/**
 * POST /api/scheme/:code/sip
 * Request body: { "amount": 5000, "frequency": "monthly", "from": "2020-01-01", "to": "2023-12-31" }
 */


/**
 * POST /api/scheme/:code/sip
 * Request body: { "amount": 5000, "frequency": "monthly", "from": "2020-01-01", "to": "2023-12-31" }
 */


/**
 * POST /api/scheme/:code/sip
 * Request body: { "amount": 5000, "frequency": "monthly", "from": "2020-01-01", "to": "2023-12-31" }
 */
export async function POST(request, { params }) {
  const schemeCode = params.code;

  try {
    const { amount, from: fromDate, to: toDate, frequency } = await request.json();

    if (!amount || !fromDate || !toDate || frequency !== 'monthly') {
      return NextResponse.json({ message: 'Invalid or missing parameters in request body. Only monthly frequency is supported.' }, { status: 400 });
    }
    
    // 1. Fetch NAV Data from our internal API (CORRECTED to use a relative path)
    const navResponse = await fetch(`/api/scheme/${schemeCode}`);

    if (!navResponse.ok) {
        return NextResponse.json(
            { message: `Failed to fetch base NAV data for SIP calculation` },
            { status: navResponse.status }
        );
    }
    const { data: navHistory } = await navResponse.json();

    // 2. Perform SIP Calculation
    const results = calculateSip(amount, fromDate, toDate, navHistory);

    // 3. Check for calculation issues (handled in financial-utils)
    if (results.status === 'needs_review') {
        return NextResponse.json(results, { status: 404 });
    }

    // 4. Return Final Response
    return NextResponse.json(results);

  } catch (error) {
    console.error(`Error calculating SIP for scheme ${schemeCode}:`, error);
    return NextResponse.json(
      { message: `Internal Server Error during SIP calculation` },
      { status: 500 }
    );
  }
}