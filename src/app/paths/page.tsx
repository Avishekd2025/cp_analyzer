import Link from "next/link";
import { db } from "@/db";
import { users, userSolvedProblems, techniques, patterns } from "@/db/schema";
import { GitFork, ArrowRight, Award, AlertCircle, Layers, CheckCircle2, Clock } from "lucide-react";
import { eq, and, desc } from "drizzle-orm";

import { getActiveHandle } from "@/lib/user-session";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Learning Paths — CP Brain",
  description: "Curated progression levels built directly from your solved Codeforces problems.",
};

interface PathsPageProps {
  searchParams?: Promise<{ handle?: string }>;
}

export default async function PathsPage({ searchParams }: PathsPageProps) {
  const params = await searchParams;
  // 1. Get active user from session
  const userHandle = await getActiveHandle(params?.handle);

  // 2. Query user's solved problems
  const userProblems = await db
    .select()
    .from(userSolvedProblems)
    .where(eq(userSolvedProblems.userHandle, userHandle));

  const totalSolved = userProblems.length;
  const analyzedProblems = userProblems.filter((p) => p.isAnalyzed === 1);
  const totalAnalyzed = analyzedProblems.length;

  // STATE B: If complete problem data is not ready, show explicit message
  if (totalSolved === 0 || totalAnalyzed < 4) {
    return (
      <div className="space-y-8 max-w-4xl mx-auto py-10">
        <div className="border-b border-zinc-200 pb-6">
          <div className="inline-flex items-center gap-1.5 rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
            <GitFork className="h-3.5 w-3.5" /> Structured Mastery
          </div>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight mt-1">
            Curated Learning Paths
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Personalized learning paths generated from your complete Codeforces solved dataset.
          </p>
        </div>

        <div className="rounded-3xl border border-amber-200 bg-amber-50/50 p-8 text-center space-y-4 shadow-xs">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
            <Clock className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-amber-950">
            Learning Paths Will Appear After Complete Problem Analysis Is Ready
          </h2>
          <p className="text-sm text-amber-900 max-w-md mx-auto leading-relaxed">
            We do not show partial or fabricated learning paths. Once synchronization and analysis of your solved problems ({totalSolved} found, {totalAnalyzed} analyzed) is complete, all relevant learning paths backed by your actual data will be generated.
          </p>
          <div className="pt-2">
            <Link
              href="/sync"
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-zinc-800 transition-colors shadow-md"
            >
              Open Sync Console <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // STATE A: Generate the COMPLETE set of learning paths supported by the user's data
  // Group problems by technique/family
  const techCategories = [
    {
      id: "greedy",
      name: "Greedy Algorithms & Invariants",
      tagMatch: ["greedy", "sortings"],
      description: "From local convergence rates to exchange-argument proofs, priority queues, and sorting rearrangements.",
      color: "emerald",
    },
    {
      id: "binary-search",
      name: "Binary Search on Monotonicity",
      tagMatch: ["binary search"],
      description: "Inverting complex optimization targets into easily testable feasibility predicates check(mid).",
      color: "amber",
    },
    {
      id: "dp",
      name: "Dynamic Programming Architecture",
      tagMatch: ["dp"],
      description: "From 1D recurrence to knapsack, bitmasks, tree DP, and prefix memoization.",
      color: "indigo",
    },
    {
      id: "math",
      name: "Number Theory, Math & Combinatorics",
      tagMatch: ["math", "number theory", "combinatorics"],
      description: "Prime factorization, GCD Euclid invariants, modular inverses, and pigeonhole counting.",
      color: "purple",
    },
    {
      id: "graph",
      name: "Graph Theory & Connectivity",
      tagMatch: ["graphs", "dfs and similar", "shortest paths"],
      description: "Breadth-first search, component decomposition, cycle detection, and topological sorting.",
      color: "sky",
    },
    {
      id: "data-structures",
      name: "Data Structures & DSU",
      tagMatch: ["data structures", "dsu"],
      description: "Disjoint Set Union, Segment Trees, Fenwick Trees, and monotonic queues.",
      color: "rose",
    },
    {
      id: "constructive",
      name: "Constructive Algorithms",
      tagMatch: ["constructive algorithms"],
      description: "Deducing parity invariants, balance mechanisms, and inductive building steps.",
      color: "orange",
    },
    {
      id: "two-pointers",
      name: "Two Pointers & Sliding Window",
      tagMatch: ["two pointers"],
      description: "Amortized linear scans maintaining contiguous subarray invariants.",
      color: "cyan",
    },
  ];

  // For each category, find user's solved problems matching tags, sorted by rating
  const generatedPaths = techCategories
    .map((cat) => {
      const matching = userProblems
        .filter((p) => {
          const tags = JSON.parse(p.tags) as string[];
          return tags.some((t) => cat.tagMatch.includes(t.toLowerCase()));
        })
        .sort((a, b) => (a.rating || 0) - (b.rating || 0));

      if (matching.length === 0) return null;

      // Select up to 6 progression levels from the user's real solved problems
      const step = Math.max(1, Math.floor(matching.length / 6));
      const levels = [];
      for (let i = 0; i < matching.length && levels.length < 6; i += step) {
        const prob = matching[i];
        levels.push({
          level: levels.length + 1,
          problemId: prob.problemId,
          problemName: prob.name,
          rating: prob.rating || "Unrated",
          tags: JSON.parse(prob.tags) as string[],
        });
      }

      return {
        ...cat,
        solvedCount: matching.length,
        levels,
      };
    })
    .filter(Boolean);

  return (
    <div className="space-y-10 pb-16 max-w-6xl mx-auto">
      {/* Header */}
      <div className="border-b border-zinc-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
            <GitFork className="h-3.5 w-3.5" /> Complete Personalized Mastery
          </div>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight mt-1">
            Curated Learning Paths ({generatedPaths.length} Topics Supported)
          </h1>
          <p className="text-sm text-zinc-500 mt-1 max-w-3xl">
            Derived entirely from your {totalSolved} solved Codeforces problems. Each topic orders your actual accepted problems into progression tiers from basic applications to advanced contest constraints.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-2 text-xs font-bold text-zinc-800 shadow-2xs self-start sm:self-auto">
          {totalSolved} Solved Problems Analyzed
        </div>
      </div>

      {/* Dynamic Paths List */}
      <div className="space-y-10">
        {generatedPaths.map((path) => path && (
          <div
            key={path.id}
            className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-xs space-y-6 hover:border-indigo-200 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-zinc-900 px-2.5 py-0.5 text-xs font-bold text-white uppercase tracking-wider">
                    {path.name}
                  </span>
                  <span className="rounded bg-indigo-50 px-2 py-0.5 text-xs font-bold text-indigo-700">
                    {path.solvedCount} Solved Problems Backing
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-1.5">{path.description}</p>
              </div>
            </div>

            <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-zinc-200">
              {path.levels.map((lvl) => (
                <div key={lvl.level} className="relative flex items-start gap-4">
                  <div className="absolute -left-6 mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 text-[11px] font-bold text-white shadow-xs">
                    {lvl.level}
                  </div>

                  <div className="flex-1 rounded-2xl border border-zinc-200 bg-zinc-50/60 p-4 hover:border-indigo-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1 max-w-2xl">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs text-zinc-900">Level {lvl.level}: {lvl.problemName}</span>
                        <span className="rounded bg-indigo-100 px-2 py-0.5 text-[11px] font-bold text-indigo-800">
                          CF {lvl.problemId}
                        </span>
                        <span className="text-[11px] text-zinc-500 font-semibold">Rating: {lvl.rating}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 pt-0.5">
                        {lvl.tags.slice(0, 3).map((t) => (
                          <span key={t} className="rounded bg-zinc-100 px-1.5 py-0.2 text-[10px] text-zinc-600">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <Link
                      href={`/problems/${lvl.problemId}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-zinc-800 transition-colors shadow-xs shrink-0 self-start sm:self-auto"
                    >
                      Inspect Atom <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
