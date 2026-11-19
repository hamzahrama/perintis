import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const reflectionDate = String(formData.get("reflectionDate") ?? "");
  const wins = String(formData.get("wins") ?? "");
  const blockers = String(formData.get("blockers") ?? "");
  if (!reflectionDate || !/^\d{4}-\d{2}-\d{2}$/.test(reflectionDate)) {
    return NextResponse.json({ error: "Tanggal tidak valid" }, { status: 400 });
  }
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return NextResponse.json({ error: "Sesi tidak valid" }, { status: 401 });
  const { error } = await supabase.from("daily_reflections").upsert({
    user_id: user.id,
    reflection_date: reflectionDate,
    answers: { wins, blockers },
  }, { onConflict: "user_id,reflection_date" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.redirect(new URL("/reflection", request.url));
}