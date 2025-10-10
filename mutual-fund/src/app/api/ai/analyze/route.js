import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const { prompt, contextData, initialInvestment = 10000 } = await request.json();

    // Validate required fields
    if (!prompt || !contextData) {
      return NextResponse.json(
        { message: "Missing required prompt or contextData in body." },
        { status: 400 }
      );
    }

    // Construct AI prompt with dynamic initialInvestment
    const fullPrompt = `You are a financial analyst AI. 
Use ONLY the provided context to calculate investment projections.

DATA CONTEXT:
- Fund House: ${contextData.fundHouse}
- Category: ${contextData.category}
- 5-Year CAGR (Historical Return): ${contextData.cagr5y}

TASK:
1. Give a "verdict" (STRONG BUY / BUY / REVIEW).
2. Provide a two-sentence "justification".
3. Always include "This AI opinion is not financial advice." as "disclaimer".
4. Assume an initial investment of ${initialInvestment}. Using CAGR, project returns for 1, 3, 5, 10 years.
5. Respond ONLY in valid JSON, no markdown or extra text.

Example response:
{
  "verdict": "BUY",
  "justification": "text",
  "disclaimer": "text",
  "projection": [
    { "year": 1, "value": 11000 },
    { "year": 3, "value": 13300 },
    { "year": 5, "value": 17000 },
    { "year": 10, "value": 30000 }
  ]
}`;

    // Get Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    // Generate content
    const result = await model.generateContent(fullPrompt);
    const responseText = await result.response.text();

    // Remove any markdown/code fences
    const cleanText = responseText.replace(/```json|```/g, "").trim();

    // Parse JSON safely
    let parsed;
    try {
      parsed = JSON.parse(cleanText);
    } catch (err) {
      console.error("JSON parse error:", err, cleanText);
      parsed = { raw: cleanText };
    }

    return NextResponse.json(parsed);

  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: "AI analysis failed. Please ensure GEMINI_API_KEY is set and valid." },
      { status: 500 }
    );
  }
}
