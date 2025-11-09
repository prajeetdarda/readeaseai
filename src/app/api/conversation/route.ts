export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || "";

export async function POST(req: NextRequest) {
  try {
    const { question, context, conversationHistory } = await req.json();

    if (!question) {
      return NextResponse.json({ error: "No question provided" }, { status: 400 });
    }

    // Build conversation messages
    const messages = [
      {
        role: "user" as const,
        content: `You are a helpful AI assistant for visually impaired users. You have access to the following document content:\n\n${context}\n\nPlease answer questions about this document in a clear, conversational way suitable for audio playback. Keep responses concise and easy to understand when spoken aloud.`,
      },
    ];

    // Add conversation history if exists
    if (conversationHistory && conversationHistory.length > 0) {
      conversationHistory.forEach((msg: { role: string; content: string }) => {
        messages.push({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        });
      });
    }

    // Add current question
    messages.push({
      role: "user" as const,
      content: question,
    });

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: messages,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Claude API Error:", errorData);
      return NextResponse.json(
        { success: false, error: "Failed to get response from Claude" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const answer = data.content[0].text;

    return NextResponse.json({
      success: true,
      answer: answer,
    });
  } catch (error: any) {
    console.error("Conversation Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
