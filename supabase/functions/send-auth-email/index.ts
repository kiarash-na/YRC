// Supabase Auth "Send Email" hook → branded React Email via Resend API.
//
// Handles every auth email type (magic link, signup, recovery, email change,
// invite). Requests are verified as Standard Webhooks using the hook secret
// (SEND_EMAIL_HOOK_SECRET, format "v1,whsec_<base64>").
//
// Secrets (supabase secrets set / dashboard → Edge Functions → secrets):
//   SEND_EMAIL_HOOK_SECRET — from Auth → Hooks → Send Email
//   RESEND_API_KEY         — resend.com API key (sending domain verified)
//
// Deno edge runtime — npm: specifiers, no node_modules.

import React from "npm:react@18.3.1";
import { Webhook } from "npm:standardwebhooks@1.0.0";
import { Resend } from "npm:resend@4.0.0";
import { renderAsync } from "npm:@react-email/components@0.0.22";

import { AuthEmail, copyForType, subjectForType } from "./_templates/auth-email.tsx";

interface HookPayload {
  user: { email: string };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: string;
    site_url: string;
    token_hash_new?: string;
  };
}

const resend = new Resend(Deno.env.get("RESEND_API_KEY") ?? "");
const hookSecret = (Deno.env.get("SEND_EMAIL_HOOK_SECRET") ?? "").replace(
  /^v1,whsec_/,
  "",
);

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("method not allowed", { status: 405 });
  }

  const rawBody = await req.text();
  const wh = new Webhook(hookSecret);

  let payload: HookPayload;
  try {
    payload = wh.verify(rawBody, {
      "webhook-id": req.headers.get("webhook-id") ?? "",
      "webhook-timestamp": req.headers.get("webhook-timestamp") ?? "",
      "webhook-signature": req.headers.get("webhook-signature") ?? "",
    }) as HookPayload;
  } catch {
    return new Response("bad signature", { status: 401 });
  }

  const { user, email_data } = payload;
  const type = email_data.email_action_type;

  // /auth/confirm handles token_hash + type for every login path.
  const tokenHash = email_data.token_hash_new ?? email_data.token_hash;
  const actionUrl =
    `${email_data.site_url}/auth/confirm` +
    `?token_hash=${encodeURIComponent(tokenHash)}` +
    `&type=${encodeURIComponent(type)}` +
    `&next=${encodeURIComponent(email_data.redirect_to || "/profile")}`;

  const copy = copyForType(type);
  const html = await renderAsync(
    React.createElement(AuthEmail, { copy, actionUrl }),
  );
  const text = await renderAsync(
    React.createElement(AuthEmail, { copy, actionUrl }),
    { plainText: true },
  );

  const { error } = await resend.emails.send({
    from: "Yas Rise <login@mail.yasrise.run>",
    to: [user.email],
    subject: subjectForType(type),
    html,
    text,
  });

  if (error) {
    console.error("resend failed:", error);
    return new Response(JSON.stringify({ error }), { status: 502 });
  }
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
});
