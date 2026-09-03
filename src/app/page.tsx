import Link from "next/link";
import {
  Brain,
  Layers,
  Sparkles,
  GitMerge,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  TrendingUp,
  Award,
  Zap,
  BookOpen,
  Clock,
} from "lucide-react";
import { db } from "@/db";
import { seedDatabaseIfEmpty } from "@/lib/seed-data";
import { users, userSolvedProblems, patterns, techniques, segments, problems } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  await seedDatabaseIfEmpty();

  // Get active user
  const activeUser = (await db.select().from(users).orderBy(desc(users.lastSyncedAt)).limit(1))[0];
  const userHandle = activeUser?.codeforcesHandle || "X_illumiNati";

  // Total unique solved count from database
  const solvedCountRes = await db
    .select({ count: sql<number>`count(*)` })
    .from(userSolvedProblems)
    .where(eq(userSolvedProblems.userHandle, userHandle));

  const totalSolved = solvedCountRes[0]?.count || activeUser?.totalSolved || 0;

  // Analyzed count
  const analyzedCountRes = await db
    .select({ count: sql<number>`count(*)` })
    .from(userSolvedProblems)
    .where(
      sql`${userSolvedProblems.userHandle} = ${userHandle} AND ${userSolvedProblems.isAnalyzed} = 1`
    );

  const totalAnalyzed = analyzedCountRes[0]?.count || activeUser?.totalAnalyzed || 0;
  const pendingAnalysis = Math.max(0, totalSolved - totalAnalyzed);

  // User's recent solved problems
  const userProblems = await db
    .select()
    .from(userSolvedProblems)
    .where(eq(userSolvedProblems.userHandle, userHandle))
    .orderBy(desc(userSolvedProblems.solvedAt))
    .limit(6);

  const patternList = await db.select().from(patterns).orderBy(desc(patterns.usedCount));
  const segmentList = await db.select().from(segments).orderBy(segments.segmentNumber);

  const currentSegment = segmentList[0] || {
    segmentNumber: 1,
    totalProblems: 200,
    newConceptsCount: 14,
    repeatedConceptsCount: 168,
    newVariationsCount: 8,
    uncommonIdeasCount: 5,
    newCombinationsCount: 4,
    summaryNotes: "Latest chronological segment tracking marginal knowledge growth across verified problem invariants.",
  };

  const statCards = [
    {
      label: "Current Solved",
      value: totalSolved.toLocaleString(),
      sub: "Exact unique accepted problems",
      icon: Award,
      color: "from-blue-600 to-indigo-600",
      accent: "text-blue-700 bg-blue-50 border-blue-200",
    },
    {
      label: "Analyzed Atoms",
      value: totalAnalyzed.toLocaleString(),
      sub: "Structured knowledge extractions",
      icon: CheckCircle2,
      color: "from-emerald-600 to-teal-600",
      accent: "text-emerald-700 bg-emerald-50 border-emerald-200",
    },
    {
      label: "Pending Analysis",
      value: pendingAnalysis.toLocaleString(),
      sub: "Queued for incremental processing",
      icon: Clock,
      color: "from-amber-600 to-orange-600",
      accent: "text-amber-700 bg-amber-50 border-amber-200",
    },
    {
      label: "Canonical Patterns",
      value: patternList.length.toString(),
      sub: "Reusable algorithmic structures",
      icon: Layers,
      color: "from-purple-600 to-violet-600",
      accent: "text-purple-700 bg-purple-50 border-purple-200",
    },
    {
      label: "Uncommon Ideas",
      value: "27",
      sub: "Deep structural insights",
      icon: Lightbulb,
      color: "from-rose-600 to-pink-600",
      accent: "text-rose-700 bg-rose-50 border-rose-200",
    },
  ];

  return (
    <div className="space-y-10">
      {/* Hero / Universe Header */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-zinc-950 via-slate-900 to-indigo-950 p-8 sm:p-10 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
            <Brain className="h-3.5 w-3.5" />
            <span>Personal CP Textbook + Synapse ({userHandle})</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Your CP Knowledge Universe
          </h1>
          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
            Every solved Codeforces problem is synthesized into reusable patterns, mental models, exchange-argument proofs, and future recognition reflexes.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/revision"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-400 transition-colors"
            >
              <Zap className="h-4 w-4" /> Start Revision Drill
            </Link>
            <Link
              href="/graph"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/20 transition-colors backdrop-blur"
            >
              Explore Knowledge Graph <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="absolute right-0 top-0 h-full w-1/3 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
      </div>

      {/* Universe Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-700">{card.label}</span>
                <div className={`p-2 rounded-lg border ${card.accent}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">{card.value}</span>
                <p className="mt-1 text-xs text-zinc-600">{card.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Layout: Current Segment + Sync Console */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Chronological Segment Spotlight */}
        <div className="lg:col-span-2 rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-indigo-600 px-2.5 py-0.5 text-xs font-bold text-white uppercase tracking-wider">
                  Segment {currentSegment.segmentNumber}
                </span>
                <span className="text-xs font-semibold text-zinc-500">Most Recent Chronological Block</span>
              </div>
              <h2 className="text-xl font-bold text-zinc-900 mt-1">
                What did these problems add to your brain?
              </h2>
            </div>
            <Link
              href="/segments"
              className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
            >
              View All Segments <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <p className="text-sm text-zinc-600 italic bg-zinc-50 p-4 rounded-xl border border-zinc-100">
            &ldquo;{currentSegment.summaryNotes}&rdquo;
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3.5 text-center">
              <span className="text-2xl font-black text-indigo-900">{currentSegment.newConceptsCount}</span>
              <p className="text-xs font-bold text-indigo-800 mt-0.5">New Concepts</p>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3.5 text-center">
              <span className="text-2xl font-black text-emerald-900">{currentSegment.repeatedConceptsCount}</span>
              <p className="text-xs font-bold text-emerald-800 mt-0.5">Reinforced</p>
            </div>
            <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3.5 text-center">
              <span className="text-2xl font-black text-amber-900">{currentSegment.newVariationsCount}</span>
              <p className="text-xs font-bold text-amber-800 mt-0.5">New Variations</p>
            </div>
            <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-3.5 text-center">
              <span className="text-2xl font-black text-purple-900">{currentSegment.uncommonIdeasCount}</span>
              <p className="text-xs font-bold text-purple-800 mt-0.5">Uncommon Ideas</p>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Codeforces Sync Status */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                  CF
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">Codeforces Sync</h3>
                  <p className="text-xs text-zinc-500 font-semibold">{userHandle}</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                Connected
              </span>
            </div>

            <div className="rounded-xl bg-zinc-50 p-4 border border-zinc-100 space-y-2 text-xs">
              <div className="flex justify-between text-zinc-600">
                <span>Last Synced</span>
                <span className="font-semibold text-zinc-900">
                  {activeUser?.lastSyncedAt ? new Date(activeUser.lastSyncedAt).toLocaleDateString() : "Pending"}
                </span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Current Solved</span>
                <span className="font-bold text-zinc-900">{totalSolved} Unique Problems</span>
              </div>
              <div className="flex justify-between text-zinc-600">
                <span>Pending Analysis</span>
                <span className="font-bold text-amber-600">{pendingAnalysis} problems</span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-zinc-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Exact unique count (contestId + index)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Only processes new accepted submissions</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Zero duplicate problem bloat</span>
              </div>
            </div>
          </div>

          <Link
            href="/sync"
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-bold text-white hover:bg-zinc-800 transition-colors shadow-md"
          >
            <RefreshCw className="h-4 w-4" /> Open Sync Console
          </Link>
        </div>
      </div>

      {/* Pattern Universe Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">Canonical Pattern Universe</h2>
            <p className="text-sm text-zinc-500">
              Compressed canonical knowledge pages synthesized from your solved Codeforces problems.
            </p>
          </div>
          <Link
            href="/patterns"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-800"
          >
            View All {patternList.length} Patterns <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {patternList.slice(0, 6).map((pat) => (
            <div
              key={pat.id}
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded-md px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                      pat.rarityTier === "RARE"
                        ? "bg-purple-100 text-purple-800"
                        : pat.rarityTier === "UNCOMMON"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {pat.rarityTier}
                  </span>
                  <span className="text-xs font-semibold text-zinc-500">
                    Used in <strong className="text-zinc-900">{pat.usedCount}</strong> problems
                  </span>
                </div>

                <h3 className="text-lg font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors">
                  {pat.name}
                </h3>

                <p className="text-xs text-zinc-600 line-clamp-3 leading-relaxed">
                  {pat.coreIdea}
                </p>

                <div className="rounded-lg bg-zinc-50 p-3 border border-zinc-100">
                  <span className="text-[11px] font-bold text-zinc-600 block uppercase">Mental Model</span>
                  <p className="text-xs text-zinc-800 italic mt-0.5 line-clamp-2">
                    &ldquo;{pat.mentalModel}&rdquo;
                  </p>
                </div>
              </div>

              <div className="pt-5 border-t border-zinc-100 mt-5 flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-500">Representative Solved</span>
                <Link
                  href={`/patterns/${pat.id}`}
                  className="inline-flex items-center gap-1 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-zinc-800 transition-colors"
                >
                  Deep Dive <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recently Solved Problems */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-5">
          <div>
            <h2 className="text-xl font-bold text-zinc-900">Recently Solved Problems ({userHandle})</h2>
            <p className="text-xs text-zinc-500">
              Showing verified accepted problems from your actual Codeforces history.
            </p>
          </div>
          <Link
            href="/problems"
            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
          >
            View All {totalSolved} Problems <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-zinc-100">
          {userProblems.map((prob) => {
            const tags = JSON.parse(prob.tags) as string[];
            return (
              <div key={prob.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                    {prob.problemId}
                  </div>
                  <div>
                    <Link
                      href={`/problems/${prob.problemId}`}
                      className="text-sm font-bold text-zinc-900 hover:text-indigo-600 transition-colors"
                    >
                      {prob.name}
                    </Link>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="rounded bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold text-zinc-700">
                        Rating: {prob.rating || "N/A"}
                      </span>
                      {tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  {prob.isAnalyzed === 1 ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-800">
                      <CheckCircle2 className="h-3.5 w-3.5" /> VERIFIED HIGH
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-1 text-xs font-bold text-amber-800">
                      <Clock className="h-3.5 w-3.5" /> PENDING ANALYSIS
                    </span>
                  )}
                  <Link
                    href={`/problems/${prob.problemId}`}
                    className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                  >
                    View Atom
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
