import { NextResponse } from 'next/server';
import { estimateCagr, calculateRequiredSipForGoal } from '../../../../../../lib/financial-utils.js';

/**
 * GET /api/scheme/:code/goal
 * Query params: goal=AMOUNT&years=DURATION
 */
export async function GET(request, { params }) {
  const schemeCode = params.code;
  const { searchParams } = new URL(request.url);
  const goalAmount = parseFloat(searchParams.get('goal'));
  const years = parseFloat(searchParams.get('years'));

  if (isNaN(goalAmount) || isNaN(years) || goalAmount <= 0 || years <= 0) {
    return NextResponse.json({ message: 'Invalid or missing goalAmount or years parameters.' }, { status: 400 });
  }

  try {
    // 1. Fetch NAV Data (CAGR needs history)
    const navResponse = await fetch(`http://localhost:3000/api/scheme/${schemeCode}`);

    if (!navResponse.ok) {
        return NextResponse.json(
            { message: `Failed to fetch base NAV data for Goal Planner` },
            { status: navResponse.status }
        );
    }
    const { data: navHistory } = await navResponse.json();

    // 2. Estimate CAGR (The prerequisite for the Goal Planner)
    const cagr = estimateCagr(navHistory);
    
    if (cagr === null || cagr <= 0) {
        return NextResponse.json({ 
            message: 'Historical performance is insufficient or negative to project goal.', 
            needs_review: true 
        }, { status: 404 });
    }

    // 3. Calculate Required SIP
    const results = calculateRequiredSipForGoal(goalAmount, years, cagr);
    
    if (results.requiredSip === null) {
        return NextResponse.json({ message: results.message, needs_review: true }, { status: 404 });
    }

    // 4. Return Final Response
    return NextResponse.json({
        goalAmount,
        years,
        estimatedAnnualReturn: parseFloat((cagr * 100).toFixed(2)),
        requiredMonthlySIP: results.requiredSip,
        note: results.message,
    });

  } catch (error) {
    console.error(`Error in Goal Planner for scheme ${schemeCode}:`, error);
    return NextResponse.json(
      { message: `Internal Server Error during Goal Planner calculation` },
      { status: 500 }
    );
  }
}