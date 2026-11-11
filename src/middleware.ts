import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Server-side gate for /admin/*: only users listed in public.staff get in. */
export async function middleware(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    if (req.nextUrl.pathname === "/admin/login") {
      return NextResponse.next({ request: req });
    }
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  let res = NextResponse.next({ request: req });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: list => {
        list.forEach(({ name, value }) => req.cookies.set(name, value));
        res = NextResponse.next({ request: req });
        list.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  let isStaff = false;
  if (user) {
    const { data } = await supabase.from("staff").select("user_id").eq("user_id", user.id).maybeSingle();
    isStaff = !!data;
  }

  const onLogin = req.nextUrl.pathname === "/admin/login";
  if (!isStaff && !onLogin) return NextResponse.redirect(new URL("/admin/login", req.url));
  if (isStaff && onLogin) return NextResponse.redirect(new URL("/admin", req.url));
  return res;
}

export const config = { matcher: ["/admin/:path*"] };
