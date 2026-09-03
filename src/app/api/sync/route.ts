import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, userSolvedProblems, problems, submissions, patterns, problemKnowledge } from "@/db/schema";
import {
  fetchCFUserInfo,
  fetchAllCFUserSubmissions,
  extractUniqueSolvedProblems,
} from "@/lib/codeforces";
import { getSupplementarySolvedProblems } from "@/lib/supplementary-problems";
import { verifyProblemSolution } from "@/lib/verification";
import {
  ensureCanonicalPatternsExist,
  extractKnowledgeForProblem,
  linkProblemToCanonicalKnowledge,
  resolvePatternForProblem,
} from "@/lib/knowledge-engine";
import { eq, and, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawHandle = (body.handle || "X_illumiNati").trim();

    if (!rawHandle) {
      return NextResponse.json({ success: false, error: "Codeforces handle is required" }, { status: 400 });
    }

    // 1. Fetch CF User info
    const userInfo = await fetchCFUserInfo(rawHandle);
    const normalizedHandle = userInfo?.handle || rawHandle;

    // 2. Fetch COMPLETE unpaginated/chunked submissions history from Codeforces
    const rawSubmissions = await fetchAllCFUserSubmissions(normalizedHandle);

    // 3. Extract EXACT unique accepted problems (verdict === "OK", contestId + index)
    // plus any supplementary unindexed group/gym accepted problems
    const publicSolvedProblems = extractUniqueSolvedProblems(rawSubmissions);
    const publicKeysSet = new Set(publicSolvedProblems.map((p) => `${p.contestId}${p.index}`));
    const supplementary = getSupplementarySolvedProblems(normalizedHandle, publicKeysSet);

    const solvedMap = new Map<string, (typeof publicSolvedProblems)[0]>();
    for (const p of publicSolvedProblems) {
      solvedMap.set(`${p.contestId}${p.index}`, p);
    }
    for (const p of supplementary) {
      if (!solvedMap.has(`${p.contestId}${p.index}`)) {
        solvedMap.set(`${p.contestId}${p.index}`, p);
      }
    }
    const allSolvedProblems = Array.from(solvedMap.values()).sort((a, b) => a.solvedAt - b.solvedAt);
    const currentSolvedCount = allSolvedProblems.length;

    // 4. Query already known solved problems in database scoped to this userHandle
    const existingStored = await db
      .select({
        contestId: userSolvedProblems.contestId,
        index: userSolvedProblems.index,
        problemId: userSolvedProblems.problemId,
        isAnalyzed: userSolvedProblems.isAnalyzed,
      })
      .from(userSolvedProblems)
      .where(eq(userSolvedProblems.userHandle, normalizedHandle));

    const existingKeySet = new Set(existingStored.map((p) => `${p.contestId}${p.index}`));
    const existingAnalyzedSet = new Set(
      existingStored.filter((p) => p.isAnalyzed === 1).map((p) => `${p.contestId}${p.index}`)
    );

    // 5. Differential Identification: Newly Discovered
    const newlyDiscovered = allSolvedProblems.filter(
      (s) => !existingKeySet.has(`${s.contestId}${s.index}`)
    );

    // 6. Ensure canonical patterns dictionary is initialized
    await ensureCanonicalPatternsExist();

    // 7. Store newly discovered solved problems into user_solved_problems (database-level unique protection)
    for (const p of newlyDiscovered) {
      const recordId = `${normalizedHandle}_${p.contestId}_${p.index}`;
      const { patternId } = resolvePatternForProblem(p.tags);

      // Insert into user_solved_problems
      await db
        .insert(userSolvedProblems)
        .values({
          id: recordId,
          userHandle: normalizedHandle,
          contestId: p.contestId,
          index: p.index,
          problemId: p.problemId,
          name: p.name,
          rating: p.rating,
          tags: JSON.stringify(p.tags),
          problemUrl: p.problemUrl,
          solvedAt: p.solvedAt,
          submissionId: p.submissionId,
          language: p.language,
          isAnalyzed: 0, // Pending analysis
          primaryPatternId: patternId,
        })
        .onConflictDoNothing();

      // Ensure global canonical problem metadata exists
      await db
        .insert(problems)
        .values({
          id: p.problemId,
          contestId: p.contestId,
          index: p.index,
          name: p.name,
          rating: p.rating,
          tags: JSON.stringify(p.tags),
          problemUrl: p.problemUrl,
          solvedAt: p.solvedAt,
        })
        .onConflictDoNothing();
    }

    // 8. Analyze pending problems (Incremental Analysis)
    // Query problems for this user that are pending analysis (isAnalyzed == 0)
    const pendingToAnalyze = await db
      .select()
      .from(userSolvedProblems)
      .where(
        and(
          eq(userSolvedProblems.userHandle, normalizedHandle),
          eq(userSolvedProblems.isAnalyzed, 0)
        )
      )
      .limit(120); // Analyze an expanded batch per sync

    let newlyAnalyzedCount = 0;
    const patternsUpdatedSet = new Set<string>();

    for (const prob of pendingToAnalyze) {
      const tags = JSON.parse(prob.tags) as string[];

      // 8a. Verify solution complexity
      const verification = await verifyProblemSolution({
        problemId: prob.problemId,
        contestId: prob.contestId,
        index: prob.index,
        name: prob.name,
        rating: prob.rating || 0,
        tags,
        timeConsumedMillis: 45,
        memoryConsumedBytes: 1024 * 1024,
      });

      // 8b. Extract knowledge atom
      const knowledge = await extractKnowledgeForProblem({
        problemId: prob.problemId,
        name: prob.name,
        rating: prob.rating || 0,
        tags,
        editorialSnippet: verification.editorialSnippet,
      });

      // 8c. Link to canonical knowledge base
      await linkProblemToCanonicalKnowledge(prob.problemId, knowledge);
      patternsUpdatedSet.add(knowledge.primaryPatternId);

      // 8d. Mark as analyzed in user_solved_problems
      await db
        .update(userSolvedProblems)
        .set({
          isAnalyzed: 1,
          primaryPatternId: knowledge.primaryPatternId,
        })
        .where(eq(userSolvedProblems.id, prob.id));

      newlyAnalyzedCount++;
    }

    // 9. Recompute total analyzed count for this user
    const totalAnalyzedRes = await db
      .select({ count: sql<number>`count(*)` })
      .from(userSolvedProblems)
      .where(
        and(
          eq(userSolvedProblems.userHandle, normalizedHandle),
          eq(userSolvedProblems.isAnalyzed, 1)
        )
      );

    const totalAnalyzedCount = totalAnalyzedRes[0]?.count || 0;
    const pendingAnalysisCount = Math.max(0, currentSolvedCount - totalAnalyzedCount);

    // 10. Update or create user record atomically with PostgreSQL upsert
    const nowIso = new Date().toISOString();
    const displayName = userInfo
      ? `${userInfo.firstName || ""} ${userInfo.lastName || ""}`.trim() || normalizedHandle
      : normalizedHandle;

    await db
      .insert(users)
      .values({
        id: `user_${normalizedHandle.toLowerCase()}`,
        name: displayName,
        codeforcesHandle: normalizedHandle,
        rating: userInfo?.rating || 0,
        maxRating: userInfo?.maxRating || 0,
        rank: userInfo?.rank || "unrated",
        totalSolved: currentSolvedCount,
        totalAnalyzed: totalAnalyzedCount,
        lastSyncedAt: nowIso,
      })
      .onConflictDoUpdate({
        target: users.codeforcesHandle,
        set: {
          name: displayName,
          rating: userInfo?.rating || 0,
          maxRating: userInfo?.maxRating || 0,
          rank: userInfo?.rank || "unrated",
          totalSolved: currentSolvedCount,
          totalAnalyzed: totalAnalyzedCount,
          lastSyncedAt: nowIso,
        },
      });

    const response = NextResponse.json({
      success: true,
      handle: normalizedHandle,
      userInfo: userInfo || { handle: normalizedHandle, rating: 0, rank: "unrated" },
      currentSolved: currentSolvedCount,
      newlyDiscovered: newlyDiscovered.length,
      newlyAnalyzed: newlyAnalyzedCount,
      pendingAnalysis: pendingAnalysisCount,
      totalAnalyzed: totalAnalyzedCount,
      patternsUpdated: patternsUpdatedSet.size,
      syncedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });

    // Set cookie so current browser session binds to the synced handle
    response.cookies.set("cf_handle", normalizedHandle, {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });

    return response;
  } catch (error) {
    console.error("Sync API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Sync failed",
      },
      { status: 500 }
    );
  }
}
