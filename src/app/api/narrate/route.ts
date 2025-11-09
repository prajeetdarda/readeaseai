export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";

export async function POST(req: NextRequest) {
  try {
    const { pdfBase64 } = await req.json();

    if (!pdfBase64) {
      return NextResponse.json({ error: "No PDF provided" }, { status: 400 });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "document",
                source: {
                  type: "base64",
                  media_type: "application/pdf",
                  data: pdfBase64,
                },
              },
              {
                type: "text",
                text: "Extract all text from this PDF and convert it into a conversational narration suitable for audio reading. Describe any images you see. Make it engaging and easy to follow.",
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Claude API Error Status:", response.status);
      console.error("Claude API Error Details:", errorData);
      return NextResponse.json(
        { success: false, error: `Claude API Error (${response.status}): ${errorData}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content = data.content[0].text;

    return NextResponse.json({
      success: true,
      narration: content
    });
  } catch (error: any) {
    console.error("Narration Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
