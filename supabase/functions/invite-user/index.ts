// BCB Grounds · invite-user
// A Super Admin invites a person: the invite email goes out (they choose their own password),
// and their name, phone, designation, photo, role and venues are saved before they first sign in.
import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const reply = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
const ROLES = ["visitor", "admin", "venue_viewer", "super_admin"];
const SITE = "https://bcbgrounds.com/";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return reply({ error: "Use POST." }, 405);
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Who is asking? Must be an active Super Admin.
  const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  const { data: who } = await admin.auth.getUser(token);
  if (!who?.user) return reply({ error: "Please sign in again." }, 401);
  const { data: me } = await admin.from("profiles").select("role,is_active").eq("id", who.user.id).maybeSingle();
  if (!me || !me.is_active || me.role !== "super_admin") return reply({ error: "Only a Super Admin can invite people." }, 403);

  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return reply({ error: "Invalid request." }, 400); }
  const s = (v: unknown, max: number) => (typeof v === "string" ? v.trim().replace(/\s+/g, " ").slice(0, max) : "");
  const email = s(b.email, 254).toLowerCase();
  const fullName = s(b.full_name, 80), phone = s(b.phone, 30), designation = s(b.designation, 80);
  const role = s(b.role, 20) || "visitor";
  const venues = Array.isArray(b.venues) ? b.venues.map(Number).filter((n) => Number.isInteger(n) && n > 0) : [];
  const photo = typeof b.photo === "string" ? b.photo : "";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return reply({ error: "Enter a valid email address." }, 400);
  if (fullName.length < 2) return reply({ error: "Enter the person's full name." }, 400);
  if (!ROLES.includes(role)) return reply({ error: "Choose a role." }, 400);
  if (["admin", "venue_viewer"].includes(role) && !venues.length) return reply({ error: "Choose at least one venue." }, 400);
  if (photo && (photo.length > 400000 || !/^data:image\/(jpeg|png|webp);base64,/.test(photo)))
    return reply({ error: "That photo is too large. Try another." }, 400);

  const { data: inv, error: invErr } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name: fullName }, redirectTo: SITE,
  });
  if (invErr || !inv?.user) {
    const msg = /already been registered|already exists/i.test(invErr?.message || "")
      ? "This email already has an account. Open them in the list below instead."
      : invErr?.message || "The invite could not be sent.";
    return reply({ error: msg }, 400);
  }
  const id = inv.user.id;
  const { error: pErr } = await admin.from("profiles").update({
    full_name: fullName, phone: phone || null, designation: designation || null, photo: photo || null,
    role, is_active: true, updated_at: new Date().toISOString(),
  }).eq("id", id);
  if (pErr) return reply({ error: "Invite sent, but details were not saved: " + pErr.message }, 500);
  if (["admin", "venue_viewer"].includes(role)) {
    await admin.from("admin_venues").delete().eq("user_id", id);
    const { error: vErr } = await admin.from("admin_venues").insert(venues.map((v) => ({ user_id: id, venue_id: v })));
    if (vErr) return reply({ error: "Invite sent, but venues were not saved: " + vErr.message }, 500);
  }
  await admin.from("activity_log").insert({
    actor_id: who.user.id, action: "User invited", detail: { user: id, email, role, venues },
  });
  return reply({ ok: true, id });
});
