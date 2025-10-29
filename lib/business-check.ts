import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "./auth";
import { db } from "@/db";
import { business } from "@/db/schema/business";
import { eq } from "drizzle-orm";

export async function businessCheckMiddleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  // If not authenticated, continue to normal auth flow
  if (!session?.user?.id) {
    return NextResponse.next();
  }

  // Check if user has a business
  const userBusiness = await db
    .select()
    .from(business)
    .where(eq(business.userId, session.user.id))
    .limit(1);

  // If no business exists and trying to access dashboard, redirect to business setup
  if (
    userBusiness.length === 0 &&
    request.nextUrl.pathname.startsWith("/dashboard") &&
    !request.nextUrl.pathname.includes("/business-setup")
  ) {
    return NextResponse.redirect(new URL("/business-setup", request.url));
  }

  // If business exists and trying to access business setup, redirect to dashboard
  if (
    userBusiness.length > 0 &&
    request.nextUrl.pathname === "/business-setup"
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}