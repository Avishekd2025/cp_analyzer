import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { DEFAULT_HANDLE } from "@/lib/user-session";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const queryHandle = req.nextUrl.searchParams.get("handle")?.trim();
    const cookieHandle = req.cookies.get("cf_handle")?.value?.trim();
    const targetHandle = queryHandle || cookieHandle || DEFAULT_HANDLE;

    // Fetch active user profile
    const user = await db.query.users.findFirst({
      where: eq(users.codeforcesHandle, targetHandle),
    });

    // Fetch all available accounts in DB
    const allUsers = await db
      .select({
        handle: users.codeforcesHandle,
        name: users.name,
        rating: users.rating,
        rank: users.rank,
        totalSolved: users.totalSolved,
      })
      .from(users)
      .orderBy(desc(users.totalSolved));

    if (!user) {
      return NextResponse.json({
        handle: targetHandle,
        name: targetHandle,
        rating: 0,
        rank: "unrated",
        totalSolved: 0,
        totalAnalyzed: 0,
        availableUsers: allUsers,
      });
    }

    return NextResponse.json({
      handle: user.codeforcesHandle,
      name: user.name,
      rating: user.rating || 0,
      rank: user.rank || "unrated",
      totalSolved: user.totalSolved || 0,
      totalAnalyzed: user.totalAnalyzed || 0,
      lastSyncedAt: user.lastSyncedAt,
      availableUsers: allUsers,
    });
  } catch (err) {
    return NextResponse.json(
      { handle: DEFAULT_HANDLE, rating: 0, rank: "unrated", availableUsers: [] },
      { status: 200 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const handle = (body.handle || "").trim();

    if (!handle) {
      return NextResponse.json({ success: false, error: "Handle is required" }, { status: 400 });
    }

    const response = NextResponse.json({ success: true, handle });
    response.cookies.set("cf_handle", handle, {
      path: "/",
      httpOnly: false, // Accessible to client-side JS for quick UI state
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to switch user" },
      { status: 500 }
    );
  }
}
