import { NextRequest, NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai";
import { getSupabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { id, text } = (await req.json()) as { id: string; text: string };

    if (!id || !text) {
      return NextResponse.json({ error: "Missing id or text" }, { status: 400 });
    }

    const client = getOpenAIClient();
    if (!client) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 503 });
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 1000,
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content:
            "You are an expert on OpenAI's products and the role of an AI Solutions Engineer. Provide detailed, structured answers to interview practice questions. Include: (1) why an interviewer asks this, (2) a strong model answer, (3) one key tip. Keep it concise but thorough. Use plain text, no markdown.",
        },
        {
          role: "user",
          content: text,
        },
      ],
    });

    const answer = completion.choices[0]?.message?.content || "Unable to generate answer.";

    // Save the AI answer to Supabase
    await getSupabase()
      .from("community_questions")
      .update({ ai_answer: answer })
      .eq("id", id);

    return NextResponse.json({ answer });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
