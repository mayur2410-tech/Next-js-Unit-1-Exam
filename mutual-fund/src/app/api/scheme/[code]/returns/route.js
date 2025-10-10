import { NextResponse } from 'next/server';
import { parseDate, findNearestEarlierNav, calculateDateDifferenceInYears, calculateReturns } from '../../../../../../lib/financial-utils.js';

// Helper function to dynamically calculate the start date for standard periods
const getStandardStartDate = (endDate, period) => {
  const date = new Date(endDate);
  
  switch (period) {
    case '1m':
      date.setMonth(date.getMonth() - 1);
      break;
    case '3m':
      date.setMonth(date.getMonth() - 3);
      break;
    case '6m':
      date.setMonth(date.getMonth() - 6);
      break;
    case '1y':
      date.setFullYear(date.getFullYear() - 1);
      break;
    default:
      return null;
  }
  return date;
};

/**
 * GET /api/scheme/:code/returns
 * Query params: period=1m|3m|6m|1y OR from=YYYY-MM-DD&to=YYYY-MM-DD
 */
// ... (imports at the top remain the same)

export async function GET(request, { params }) {
  const schemeCode = params.code;
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period');
  let fromDate = searchParams.get('from');
  let toDate = searchParams.get('to');

  // 1. Fetch NAV Data from our internal API (which handles caching)
  const navResponse = await fetch(`http://localhost:3000/api/scheme/${schemeCode}`); 

  if (!navResponse.ok) {
    return NextResponse.json(
      { message: `Failed to fetch base NAV data for returns calculation` },
      { status: navResponse.status }
    );
  }
  const { data: navHistory } = await navResponse.json();

  if (!navHistory || navHistory.length < 2) {
    return NextResponse.json({ message: 'Insufficient historical NAV data available.' }, { status: 404 });
  }

  // Define End Date (latest available NAV)
  const endNavEntry = navHistory[navHistory.length - 1];
  let endDate = parseDate(endNavEntry.date);
  const endNav = endNavEntry.nav;

  // 2. Determine Start Date based on query parameters OR a default
  let startDate = null;
  let durationLabel = '';

  if (fromDate && toDate) {
    startDate = new Date(fromDate);
    endDate = new Date(toDate);
    durationLabel = `${fromDate} to ${toDate}`;
  } else {
    // Default to a 1-year return if no specific period is provided
    const defaultPeriod = period || '1y'; 
    startDate = getStandardStartDate(endDate, defaultPeriod);
    durationLabel = defaultPeriod;
  }
  
  // Find the Start NAV (nearest earlier NAV)
  const startNavEntry = findNearestEarlierNav(startDate, navHistory);

  if (!startNavEntry || startNavEntry.date === endNavEntry.date) {
    return NextResponse.json({ 
      message: 'Insufficient data for the requested period.',
      needs_review: true,
    }, { status: 404 });
  }

  const startNav = startNavEntry.nav;
  const startNavDate = parseDate(startNavEntry.date);
  
  // 3. Perform Calculation
  const years = calculateDateDifferenceInYears(startNavDate, endDate);
  const results = calculateReturns(startNav, endNav, years);

  // 4. Return Final Response
  return NextResponse.json({
    duration: durationLabel,
    startDate: startNavEntry.date,
    endDate: endNavEntry.date,
    startNAV: startNav,
    endNAV: endNav,
    simpleReturn: results.simpleReturn,
    annualizedReturn: results.annualizedReturn,
  });
}