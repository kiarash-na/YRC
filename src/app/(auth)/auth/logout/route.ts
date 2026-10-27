import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

/** GET /auth/logout — signs the member out and returns to the website. */
export async function GET() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
