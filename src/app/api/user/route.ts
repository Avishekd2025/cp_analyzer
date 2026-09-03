import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = (await db.select().from(users).orderBy(desc(users.lastSyncedAt)).limit(1))[0];
    if (!user) {
      return NextResponse.json({
        handle: "Not Connected",
        rating: 0,
        rank: "unrated",
        totalSolved: 0,
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
    });
  } catch (err) {
    return NextResponse.json({ handle: "Not Connected", rating: 0, rank: "unrated" });
  }
}
