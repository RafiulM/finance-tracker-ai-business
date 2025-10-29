import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { business } from "@/db/schema/business";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { name, fiscalStartDate, currency } = await request.json();

    if (!name || !fiscalStartDate || !currency) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already has a business
    const existingBusiness = await db
      .select()
      .from(business)
      .where(eq(business.userId, session.user.id))
      .limit(1);

    if (existingBusiness.length > 0) {
      return NextResponse.json(
        { error: "Business already exists for this user" },
        { status: 400 }
      );
    }

    // Create new business
    const newBusiness = await db.insert(business).values({
      userId: session.user.id,
      name,
      fiscalStartDate: new Date(fiscalStartDate),
      currency,
    }).returning();

    return NextResponse.json({
      message: "Business created successfully",
      business: newBusiness[0],
    });
  } catch (error) {
    console.error("Business setup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user's business
    const userBusiness = await db
      .select()
      .from(business)
      .where(eq(business.userId, session.user.id))
      .limit(1);

    if (userBusiness.length === 0) {
      return NextResponse.json({ business: null });
    }

    return NextResponse.json({ business: userBusiness[0] });
  } catch (error) {
    console.error("Get business error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}