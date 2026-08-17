import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const role = (req.auth as any)?.userRole;
  const isLoggedIn = !!req.auth;

  // Protect dashboard routes
  if (req.nextUrl.pathname.startsWith("/dashboard")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
    // Temporarily disabled to allow you to log in!
    // if (role !== "admin") {
    //   return NextResponse.redirect(new URL("/access-denied", req.url));
    // }
  }
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
