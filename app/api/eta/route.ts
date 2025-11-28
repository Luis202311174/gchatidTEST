import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { distanceKm, origin, destination } = body;

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY!,
    });

    const prompt = `
      Estimate motorcycle ETA in minutes.
      Distance: ${distanceKm} km
      Origin: ${origin}
      Destination: ${destination}
      Assume Philippine traffic conditions—moderate congestion.
      Return with precise, short, fast, as less words as possible.
      Return also the volume of traffic whether light, moderate, heavy.
    `;

    // Allow overriding model via env; default to Gemini 2.0 Flash (free-tier)
    const model = process.env.GEMINI_MODEL || "gemini-2.0-flash";

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return NextResponse.json({
      eta: response.text,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "AI failed" }, { status: 500 });
  }
}
