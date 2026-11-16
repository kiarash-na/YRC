import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { E2E_COOKIE, e2eCookieValid } from "@/lib/e2e";

/** Routes that require a logged-in member. */
const PROTECTED_PREFIXES = ["/admin", "/profile", "/checkin"];

/**
 * Next 16 "proxy" (formerly middleware): refreshes the Supabase session
 * cookie on every request and gates member-only routes.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Before Supabase env vars are configured, let public pages through.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    const path = request.nextUrl.pathname;
    const needsAuth = PROTECTED_PREFIXES.some(
      (prefix) => path === prefix || path.startsWith(`${prefix}/`),
    );
    if (needsAuth) return NextResponse.redirect(new URL("/login", request.url));
    return response;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookieOptions: {
        // HTTPS everywhere — see src/lib/supabase/server.ts.
        secure: true,
      },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getUser() re-validates the token with Supabase and triggers a refresh
  // when needed — do not replace with getSession().
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const needsAuth = PROTECTED_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );

  // Token-free e2e mode (src/lib/e2e.ts): the test admin has no Supabase
  // session; requireAdmin() admits it. Off unless explicitly configured.
  const e2eAdmin = path.startsWith("/admin") && e2eCookieValid(request.cookies.get(E2E_COOKIE)?.value);

  if (needsAuth && !user && !e2eAdmin) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", path + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    // Skip static assets and image optimization; run on everything else.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
