import { NextResponse } from 'next/server';

const MF_DETAIL_BASE_URL = "https://api.mfapi.in/mf";

/**
 * GET /api/scheme/[code]
 * Returns metadata and full NAV history (date, nav).
 */
export async function GET(request, { params }) {
  const schemeCode = params.code;

  if (!schemeCode) {
    return NextResponse.json({ message: 'Scheme code is required' }, { status: 400 });
  }

  const url = `${MF_DETAIL_BASE_URL}/${schemeCode}`;

  try {
    // Revalidate data more frequently (e.g., every 4 hours/14400 seconds) 
    // to capture new NAVs quicker than the full list.
    const response = await fetch(url, {
      method: 'GET',
      next: {
        revalidate: 14400, 
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { message: `Failed to fetch scheme details for ${schemeCode}`, error: errorText },
        { status: response.status }
      );
    }

    const { meta, data } = await response.json();
    
    // IMPORTANT: Sort the NAV data by date. The API returns it newest first.
    // For calculations (SIP, Returns), we need it oldest first.
    // We will parse the date and NAV values to ensure correct data types.
    const processedData = data
      .map(item => ({
        date: item.date, // Format is "DD-MM-YYYY"
        nav: parseFloat(item.nav), // Convert NAV string to number
      }))
      .filter(item => item.nav > 0) // Filter out invalid/zero NAV entries (Edge Case Handling)
      .sort((a, b) => {
        // Custom sort function to sort dates from oldest to newest (ascending)
        const dateA = new Date(a.date.split('-').reverse().join('-'));
        const dateB = new Date(b.date.split('-').reverse().join('-'));
        return dateA - dateB;
      });

    // Return the cleaned and processed data
    return NextResponse.json({
      meta: meta,
      data: processedData,
    });

  } catch (error) {
    console.error(`Error fetching scheme details for ${schemeCode}:`, error);
    return NextResponse.json(
      { message: `Internal Server Error for scheme ${schemeCode}` }, 
      { status: 500 }
    );
  }
}