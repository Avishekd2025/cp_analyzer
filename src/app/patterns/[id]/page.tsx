import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/db";
import {
  patterns,
  techniques,
  variations,
  techniqueCombinations,
  representativeProblems,
  problems,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  Brain,
  Lightbulb,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Code2,
  GitBranch,
  Layers,
  ChevronRight,
  Target,
  Workflow,
  Sparkles,
  Award,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface PatternPageProps {
  params: Promise<{ id: string }>;
}

export default async function PatternDetailPage({ params }: PatternPageProps) {
  const { id } = await params;

  const pattern = await db.query.patterns.findFirst({
    where: eq(patterns.id, id),
  });

  if (!pattern) {
    notFound();
  }

  const technique = await db.query.techniques.findFirst({
    where: eq(techniques.id, pattern.techniqueId),
  });

  const patternVariations = await db
    .select()
    .from(variations)
    .where(eq(variations.patternId, pattern.id));

  const combinations = await db
    .select()
    .from(techniqueCombinations)
    .where(eq(techniqueCombinations.techniqueAId, pattern.techniqueId));

  const repProblems = await db
    .select({
      repId: representativeProblems.id,
      progressionTier: representativeProblems.progressionTier,
      progressionLabel: representativeProblems.progressionLabel,
      whyRepresentative: representativeProblems.whyRepresentative,
      problemId: problems.id,
      name: problems.name,
      rating: problems.rating,
      contestId: problems.contestId,
      index: problems.index,
    })
    .from(representativeProblems)
    .innerJoin(problems, eq(representativeProblems.problemId, problems.id))
    .where(eq(representativeProblems.patternId, pattern.id));

  const recognitionSignals = JSON.parse(pattern.recognitionSignals) as string[];
  const commonMistakes = JSON.parse(pattern.commonMistakes) as string[];

  return (
    <div className="space-y-10 pb-16">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
        <Link href="/" className="hover:text-zinc-900">
          Universe
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
        <Link href="/patterns" className="hover:text-zinc-900">
          Patterns
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
        <span className="text-zinc-900">{pattern.name}</span>
      </nav>

      {/* Header Banner */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs font-bold text-indigo-700">
              Technique: {technique?.name || "Algorithmic Family"}
            </span>
            <span
              className={`rounded-lg px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                pattern.rarityTier === "RARE"
                  ? "bg-purple-100 text-purple-800 border border-purple-200"
                  : pattern.rarityTier === "UNCOMMON"
                  ? "bg-amber-100 text-amber-800 border border-amber-200"
                  : "bg-emerald-100 text-emerald-800 border border-emerald-200"
              }`}
            >
              {pattern.rarityTier}
            </span>
          </div>

          <div className="rounded-full bg-zinc-100 px-3.5 py-1 text-xs font-bold text-zinc-700">
            Encountered in <strong className="text-zinc-900">{pattern.usedCount}</strong> of your solved problems
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight">
          {pattern.name}
        </h1>

        <p className="text-base text-zinc-700 leading-relaxed font-normal">
          {pattern.coreIdea}
        </p>
      </div>

      {/* Dual Column: Mental Model & Real-Life Analogy */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 2. Mental Model */}
        <div className="rounded-3xl border border-indigo-200 bg-indigo-50/40 p-7 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-indigo-900">
            <div className="p-2 rounded-xl bg-indigo-600 text-white">
              <Brain className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold">Mental Model (What to Imagine)</h2>
          </div>
          <p className="text-sm text-zinc-800 leading-relaxed font-medium bg-white/80 p-4 rounded-2xl border border-indigo-100">
            &ldquo;{pattern.mentalModel}&rdquo;
          </p>
        </div>

        {/* 3. Real-Life Analogy */}
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/40 p-7 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-emerald-900">
            <div className="p-2 rounded-xl bg-emerald-600 text-white">
              <Lightbulb className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-bold">Real-Life Intuitive Analogy</h2>
          </div>
          <p className="text-sm text-zinc-800 leading-relaxed font-medium bg-white/80 p-4 rounded-2xl border border-emerald-100">
            {pattern.realLifeAnalogy}
          </p>
        </div>
      </div>

      {/* 4. How the Idea Emerges (Discovery Flow) */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-violet-600 text-white">
            <Workflow className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-900">How the Idea Emerges</h2>
            <p className="text-xs text-zinc-500">Step-by-step thinking process from problem statement to natural algorithm</p>
          </div>
        </div>

        <div className="rounded-2xl bg-zinc-900 text-zinc-100 p-6 text-xs sm:text-sm font-mono whitespace-pre-line leading-relaxed shadow-inner">
          {pattern.discoveryFlow}
        </div>
      </div>

      {/* 5. Recognition Signals (Clues & Triggers) */}
      <div className="rounded-3xl border border-amber-200 bg-amber-50/30 p-8 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-600 text-white">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-zinc-900">Pattern Recognition Signals</h2>
            <p className="text-xs text-zinc-600">&ldquo;When I see a new problem, what signals trigger this pattern?&rdquo;</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {recognitionSignals.map((signal, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 rounded-xl bg-white p-4 border border-amber-200 shadow-2xs"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-600 text-xs font-bold text-white">
                {idx + 1}
              </span>
              <span className="text-xs sm:text-sm text-zinc-800 font-medium">{signal}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Standard Approach & 7. Why This Approach */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Code2 className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-zinc-900">Standard Algorithmic Approach</h2>
          </div>
          <div className="rounded-2xl bg-zinc-50 p-5 font-mono text-xs text-zinc-800 whitespace-pre-line leading-relaxed border border-zinc-200">
            {pattern.standardApproach}
          </div>
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-zinc-900">8. Why Does It Work? (Proof / Invariant)</h2>
          </div>
          <div className="rounded-2xl bg-emerald-50/50 p-5 text-xs sm:text-sm text-emerald-950 font-normal leading-relaxed border border-emerald-200">
            {pattern.whyItWorksProof}
          </div>

          <div className="pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-1">
              9. Why Not Other Approaches?
            </span>
            <p className="text-xs text-zinc-700 leading-relaxed bg-zinc-50 p-3.5 rounded-xl border border-zinc-200">
              {pattern.whyNotOthers}
            </p>
          </div>
        </div>
      </div>

      {/* 10. Variations & 11. Combinations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Variations */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-xs space-y-5">
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-purple-600" />
            <div>
              <h2 className="text-lg font-bold text-zinc-900">10. Variations in Your Solved Problems</h2>
              <p className="text-xs text-zinc-500">Meaningful modifications of this pattern</p>
            </div>
          </div>

          <div className="space-y-3">
            {patternVariations.length === 0 ? (
              <p className="text-xs text-zinc-500 italic">No variations recorded yet for this pattern.</p>
            ) : (
              patternVariations.map((v) => (
                <div key={v.id} className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-4 space-y-1">
                  <h3 className="text-xs font-bold text-zinc-900">{v.name}</h3>
                  <p className="text-xs text-zinc-600">{v.description}</p>
                  <span className="inline-block text-[11px] font-semibold text-purple-700 mt-1">
                    Context: {v.constraintContext}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Combinations */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-xs space-y-5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-600" />
            <div>
              <h2 className="text-lg font-bold text-zinc-900">11. Observed Combinations</h2>
              <p className="text-xs text-zinc-500">Only combinations observed in your solved problems</p>
            </div>
          </div>

          <div className="space-y-3">
            {combinations.length === 0 ? (
              <p className="text-xs text-zinc-500 italic">No multi-technique combinations active yet.</p>
            ) : (
              combinations.map((c) => (
                <div key={c.id} className="rounded-2xl border border-indigo-100 bg-indigo-50/30 p-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-indigo-950">{c.name}</h3>
                    <span className="text-[11px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                      Observed in {c.frequency} problems
                    </span>
                  </div>
                  <p className="text-xs text-zinc-600">{c.rationale}</p>
                  <p className="text-[11px] text-zinc-500 italic">Clue: {c.emergenceClue}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 12. Common Mistakes & 13. Implementation Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="rounded-3xl border border-rose-200 bg-rose-50/30 p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-rose-900">
            <AlertTriangle className="h-5 w-5 text-rose-600" />
            <h2 className="text-lg font-bold">12. Common Mistakes & Traps</h2>
          </div>
          <ul className="space-y-2.5">
            {commonMistakes.map((mistake, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-zinc-800">
                <span className="text-rose-500 font-bold">•</span>
                <span>{mistake}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Code2 className="h-5 w-5 text-zinc-700" />
            <h2 className="text-lg font-bold text-zinc-900">13. Implementation Insights</h2>
          </div>
          <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed bg-zinc-50 p-4 rounded-xl border border-zinc-200 font-mono">
            {pattern.implementationInsights}
          </p>
        </div>
      </div>

      {/* 14. Your Solved Problems (Progression 1-8) */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-indigo-600" />
              <h2 className="text-xl font-bold text-zinc-900">
                14. Your Solved Problems (Progression 1-8)
              </h2>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Representative problems selected exclusively from your solved Codeforces history demonstrating structural progression.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {repProblems.length === 0 ? (
            <p className="text-xs text-zinc-500 italic">No representative solved problems recorded for this pattern yet.</p>
          ) : (
            repProblems.map((rp) => (
              <div
                key={rp.repId}
                className="rounded-2xl border border-zinc-200 p-5 hover:border-indigo-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-50/50"
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-zinc-900 px-2.5 py-0.5 text-xs font-bold text-white">
                      Tier {rp.progressionTier}: {rp.progressionLabel}
                    </span>
                    <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-800">
                      {rp.problemId}
                    </span>
                    <span className="text-xs text-zinc-500">Rating: {rp.rating}</span>
                  </div>
                  <h3 className="text-base font-bold text-zinc-900">{rp.name}</h3>
                  <p className="text-xs text-zinc-600">
                    <strong className="text-zinc-800">Why Representative: </strong>
                    {rp.whyRepresentative}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/problems/${rp.problemId}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-zinc-800 transition-colors shadow-xs"
                  >
                    View Problem Atom <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
