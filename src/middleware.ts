import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const role = req.nextauth.token?.role;

    // 管理员路由：仅 SUPER_ADMIN
    if (pathname.startsWith("/admin") && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // 代理路由：仅 COUNTY_AGENT 或 SUPER_ADMIN
    if (pathname.startsWith("/agent") && role !== "COUNTY_AGENT" && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // 站长路由：仅 STATION_MASTER 或 SUPER_ADMIN
    if (pathname.startsWith("/station") && role !== "STATION_MASTER" && role !== "SUPER_ADMIN") {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/agent/:path*", "/station/:path*"],
};
