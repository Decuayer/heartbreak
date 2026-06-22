import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Routes that are always public — no auth needed
const ALWAYS_PUBLIC = ["/quiz", "/admin/login"];

// Routes that require the quiz session (authenticated visitor)
const PROTECTED_VISITOR_PATHS = ["/timeline", "/coupons", "/letter", "/counter", "/faq"];
const HOME_PATH = "/";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Always public — pass through immediately ─────────────────────
  if (ALWAYS_PUBLIC.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return NextResponse.next();
  }

  // ── Admin routes ──────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Guard: if env vars aren't configured, show the login page
    if (!supabaseUrl || !supabaseKey || !supabaseUrl.startsWith("http")) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    try {
      const response = NextResponse.next();
      const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      });

      const {
        data: { user },
      } = await supabase.auth.getUser();
      const adminEmail = process.env.ADMIN_EMAIL;

      if (!user || user.email !== adminEmail) {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }

      return response;
    } catch {
      // On any Supabase error, redirect to login
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  // ── Visitor protected routes ──────────────────────────────────────
  const isProtectedVisitor =
    pathname === HOME_PATH ||
    PROTECTED_VISITOR_PATHS.some(
      (p) => pathname === p || pathname.startsWith(p + "/")
    );

  if (isProtectedVisitor) {
    const sessionCookie = request.cookies.get("heartbeat-session");
    console.log("Middleware checking visitor routes.");
    console.log("All cookies:", request.cookies.getAll());
    console.log("Session cookie found:", !!sessionCookie?.value);
    
    if (!sessionCookie?.value) {
      return NextResponse.redirect(new URL("/quiz", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
