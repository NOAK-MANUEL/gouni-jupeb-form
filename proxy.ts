import { NextRequest, NextResponse } from "next/server";

export async function proxy(req: NextRequest) {
  const url = req.nextUrl;
  const { pathname } = url;

  const token = req.cookies.get("_a")?.value;
  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/admin-login", req.url));
    }

    const { password, username, email, date } = JSON.parse(token);
    if (!password || !username || !email || !date) {
      return NextResponse.redirect(new URL("/auth/admin-login", req.url));
    }
    const currentDate = new Date(date).getTime();

    if (!currentDate) {
      return NextResponse.redirect(new URL("/auth/admin-login", req.url));
    }

    if (Date.now() > currentDate) {
      return NextResponse.redirect(new URL("/auth/admin-login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin"],
};
