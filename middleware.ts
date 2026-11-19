import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Protect private app routes
  const protectedRoutes = [
    "/home",
    "/diary",
    "/vision-boards",
    "/dreams",
    "/it-came-true",
    "/affirmations",
    "/settings",
  ];

  const isProtectedRoute = protectedRoutes.some(
    (route) =>
      pathname === route || pathname.startsWith(`${route}/`)
  );

  // If not logged in, redirect to login
  if (isProtectedRoute && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirectTo", pathname);

    return NextResponse.redirect(redirectUrl);
  }

  // If already logged in, don't show login page
  if (pathname === "/login" && user) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/home/:path*",
    "/diary/:path*",
    "/vision-boards/:path*",
    "/dreams/:path*",
    "/it-came-true/:path*",
    "/affirmations/:path*",
    "/settings/:path*",
    "/login",
  ],
};