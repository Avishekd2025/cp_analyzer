import Link from "next/link";
import { db } from "@/db";
import { patterns, techniques } from "@/db/schema";
import { Layers, Search, ArrowRight, GitMerge, ShieldCheck, Sparkles } from "lucide-react";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function PatternsPage() {
  const patternList = await db.select().from(patterns).orderBy(desc(patterns.usedCount));
  const techList = await db.select().from(techniques);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
            <Layers className="h-3.5 w-3.5" /> Canonical Knowledge Library
          </div>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight mt-1">
            Algorithmic Patterns
          </h1>
          <p className="text-sm text-zinc-500 mt-1 max-w-2xl">
            Patterns represent reusable algorithmic structures inside technique families. If 40 of your solved problems use Binary Search on Answer, they all reference this single canonical knowledge core.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-xl border border-zinc-200 bg-white px-3.5 py-2 text-xs font-bold text-zinc-800 shadow-2xs">
            {patternList.length} Canonical Patterns
          </span>
        </div>
      </div>

      {/* Techniques Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider shrink-0 mr-2">
          Families:
        </span>
        {techList.map((t) => (
          <span
            key={t.id}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:border-indigo-300 transition-colors shrink-0 shadow-2xs"
          >
            {t.name}
          </span>
        ))}
      </div>

      {/* Pattern Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {patternList.map((pat) => (
          <div
            key={pat.id}
            className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span
                  className={`rounded-md px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                    pat.rarityTier === "RARE"
                      ? "bg-purple-100 text-purple-800 border border-purple-200"
                      : pat.rarityTier === "UNCOMMON"
                      ? "bg-amber-100 text-amber-800 border border-amber-200"
                      : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                  }`}
                >
                  {pat.rarityTier}
                </span>
                <span className="text-xs font-semibold text-zinc-500">
                  Used in <strong className="text-zinc-900">{pat.usedCount}</strong> solved problems
                </span>
              </div>

              <div>
                <Link
                  href={`/patterns/${pat.id}`}
                  className="text-lg font-bold text-zinc-900 hover:text-indigo-600 transition-colors"
                >
                  {pat.name}
                </Link>
                <p className="text-xs text-zinc-600 mt-2 line-clamp-3 leading-relaxed">
                  {pat.coreIdea}
                </p>
              </div>

              <div className="rounded-xl bg-zinc-50 p-3.5 border border-zinc-100 space-y-1">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                  Mental Model
                </span>
                <p className="text-xs text-zinc-800 italic line-clamp-2">
                  &ldquo;{pat.mentalModel}&rdquo;
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                  Real-Life Analogy
                </span>
                <p className="text-xs text-zinc-600 line-clamp-2">
                  {pat.realLifeAnalogy}
                </p>
              </div>
            </div>

            <div className="pt-5 border-t border-zinc-100 mt-6 flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500 flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-indigo-500" /> Progression 1-8
              </span>
              <Link
                href={`/patterns/${pat.id}`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-zinc-800 transition-colors shadow-xs"
              >
                14-Point Deep Dive <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
