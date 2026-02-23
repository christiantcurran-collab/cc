import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await getSupabase()
    .from("community_questions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  try {
    const { text, author } = (await req.json()) as { text: string; author?: string };

    if (!text?.trim()) {
      return NextResponse.json({ error: "Question text is required" }, { status: 400 });
    }

    const { data, error } = await getSupabase()
      .from("community_questions")
      .insert({ text: text.trim(), author: author || "Contributor" })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
