import Link from "next/link";
import { db } from "@/db";
import { users, userSolvedProblems, patterns } from "@/db/schema";
import { eq, desc, sql, and, like } from "drizzle-orm";
import { Award, CheckCircle2, ArrowRight, ExternalLink, Clock, ChevronLeft, ChevronRight, Search } from "lucide-react";

export const dynamic = "force-dynamic";

interface ProblemsPageProps {
  searchParams: Promise<{ page?: string; q?: string }>;
}

export default async function ProblemsPage({ searchParams }: ProblemsPageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const query = (params.q || "").trim();
  const pageSize = 40;
  const offset = (page - 1) * pageSize;

  // Active user
  const activeUser = (await db.select().from(users).orderBy(desc(users.lastSyncedAt)).limit(1))[0];
  const userHandle = activeUser?.codeforcesHandle || "X_illumiNati";

  // Total count for active user
  const countRes = await db
    .select({ count: sql<number>`count(*)` })
    .from(userSolvedProblems)
    .where(eq(userSolvedProblems.userHandle, userHandle));
  const totalCount = countRes[0]?.count || 0;

  // Query paginated problems
  let whereClause = eq(userSolvedProblems.userHandle, userHandle);

  const problemList = await db
    .select({
      id: userSolvedProblems.id,
      problemId: userSolvedProblems.problemId,
      name: userSolvedProblems.name,
      rating: userSolvedProblems.rating,
      tags: userSolvedProblems.tags,
      problemUrl: userSolvedProblems.problemUrl,
      solvedAt: userSolvedProblems.solvedAt,
      isAnalyzed: userSolvedProblems.isAnalyzed,
      patternId: userSolvedProblems.primaryPatternId,
    })
    .from(userSolvedProblems)
    .where(whereClause)
    .orderBy(desc(userSolvedProblems.solvedAt))
    .limit(pageSize)
    .offset(offset);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startIdx = totalCount === 0 ? 0 : offset + 1;
  const endIdx = Math.min(offset + pageSize, totalCount);

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
            <Award className="h-3.5 w-3.5" /> Personal Solved Archive
          </div>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight mt-1">
            Solved Problems Archive ({userHandle})
          </h1>
          <p className="text-sm text-zinc-500 mt-1 max-w-2xl">
            Complete archive of your {totalCount} unique accepted Codeforces problems. Each problem is uniquely deduplicated by contestId + index and mapped into your knowledge base.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-xs font-bold text-zinc-800 shadow-2xs">
            {totalCount} Total Solved
          </span>
        </div>
      </div>

      {/* Pagination Bar & Range Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs">
        <span className="text-xs font-semibold text-zinc-600">
          Showing <strong className="text-zinc-900">{startIdx} – {endIdx}</strong> of{" "}
          <strong className="text-zinc-900">{totalCount}</strong> unique solved problems
        </span>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-zinc-500 font-medium mr-2">
            Page {page} of {totalPages}
          </span>
          {page > 1 ? (
            <Link
              href={`/problems?page=${page - 1}`}
              className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50 shadow-2xs"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Previous
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-1.5 text-xs font-bold text-zinc-300 cursor-not-allowed">
              <ChevronLeft className="h-3.5 w-3.5" /> Previous
            </span>
          )}

          {page < totalPages ? (
            <Link
              href={`/problems?page=${page + 1}`}
              className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50 shadow-2xs"
            >
              Next <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-1.5 text-xs font-bold text-zinc-300 cursor-not-allowed">
              Next <ChevronRight className="h-3.5 w-3.5" />
            </span>
          )}
        </div>
      </div>

      {/* Problems Table */}
      <div className="rounded-3xl border border-zinc-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-600">
            <thead className="bg-zinc-50 text-xs font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-200">
              <tr>
                <th className="px-6 py-4">Problem</th>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4">Canonical Pattern</th>
                <th className="px-6 py-4">Verification State</th>
                <th className="px-6 py-4 text-right">Knowledge Atom</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {problemList.map((prob) => {
                const tags = JSON.parse(prob.tags) as string[];
                return (
                  <tr key={prob.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 font-mono">
                          {prob.problemId}
                        </span>
                        <div>
                          <Link
                            href={`/problems/${prob.problemId}`}
                            className="font-bold text-zinc-900 hover:text-indigo-600 transition-colors"
                          >
                            {prob.name}
                          </Link>
                          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                            {tags.slice(0, 3).map((t) => (
                              <span key={t} className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] text-zinc-600">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-md bg-zinc-100 px-2.5 py-1 text-xs font-bold text-zinc-800">
                        {prob.rating || "N/A"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      {prob.patternId ? (
                        <Link
                          href={`/patterns/${prob.patternId}`}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
                        >
                          {prob.patternId.replace(/-/g, " ").toUpperCase()}
                        </Link>
                      ) : (
                        <span className="text-xs text-zinc-400">Classifying...</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {prob.isAnalyzed === 1 ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
                          <CheckCircle2 className="h-3.5 w-3.5" /> VERIFIED HIGH
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">
                          <Clock className="h-3.5 w-3.5" /> PENDING ANALYSIS
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/problems/${prob.problemId}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-zinc-800 transition-colors shadow-xs"
                      >
                        Atom <ArrowRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Pagination */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-xs text-zinc-500">
          Showing page {page} of {totalPages} ({totalCount} total solved problems)
        </span>
        <div className="flex items-center gap-2">
          {page > 1 && (
            <Link
              href={`/problems?page=${page - 1}`}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50"
            >
              Previous
            </Link>
          )}
          {page < totalPages && (
            <Link
              href={`/problems?page=${page + 1}`}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-bold text-zinc-700 hover:bg-zinc-50"
            >
              Next Page
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
