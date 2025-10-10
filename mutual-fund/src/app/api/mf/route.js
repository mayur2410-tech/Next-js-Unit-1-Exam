import { NextResponse } from 'next/server';

const MF_API_URL = "https://api.mfapi.in/mf";

/**
 * GET /api/mf
 * Fetches and caches the full list of schemes.
 */
export async function GET() {
  try {
    // Implement robust caching using Next.js's fetch options (App Router).
    // The list is large but changes only daily. 
    // We set a revalidation time of 86400 seconds (24 hours).
    const response = await fetch(MF_API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: {
        // Revalidate the cache entry after 24 hours (86400 seconds)
        revalidate: 86400, 
      },
    });

    if (!response.ok) {
      // Throw an error if the external API call failed
      const errorText = await response.text();
      console.error(`External API error: ${response.status} - ${errorText}`);
      return NextResponse.json(
        { message: 'Failed to fetch scheme list from external API', error: errorText }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // The external API returns an array directly, which is what we need.
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching mutual fund list:', error);
    // Use a standard HTTP 500 status code for internal server errors
    return NextResponse.json(
      { message: 'Internal Server Error while processing request' }, 
      { status: 500 }
    );
  }
}