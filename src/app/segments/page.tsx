import { getSegmentAnalytics } from "@/lib/segmentation";
import { getActiveHandle } from "@/lib/user-session";
import { BookOpen, Sparkles, TrendingUp, CheckCircle2, ArrowRight, Layers, Lightbulb } from "lucide-react";

export const dynamic = "force-dynamic";

interface SegmentsPageProps {
  searchParams?: Promise<{ handle?: string }>;
}

export default async function SegmentsPage({ searchParams }: SegmentsPageProps) {
  const params = await searchParams;
  const userHandle = await getActiveHandle(params?.handle);
  const segments = await getSegmentAnalytics(userHandle);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="border-b border-zinc-200 pb-6">
        <div className="inline-flex items-center gap-1.5 rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
          <BookOpen className="h-3.5 w-3.5" /> Chronological Growth Tracking
        </div>
        <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight mt-1">
          200-Problem Chronological Segments
        </h1>
        <p className="text-sm text-zinc-500 mt-1 max-w-3xl">
          Your competitive programming journey partitioned into non-overlapping 200-problem milestones. Each segment evaluates the marginal knowledge gained: new concepts discovered, variations mastered, and existing patterns reinforced.
        </p>
      </div>

      {/* Segments Stack */}
      <div className="space-y-8">
        {segments.map((seg) => (
          <div
            key={seg.id}
            className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-xs space-y-6 hover:border-indigo-200 transition-colors"
          >
            {/* Segment Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-zinc-900 px-3 py-1 text-xs font-black text-white uppercase tracking-wider">
                    Segment {seg.segmentNumber}
                  </span>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                    {seg.segmentNumber === 1 ? "Newest 200 Problems" : `Historical Block ${seg.segmentNumber}`}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-zinc-900 pt-1">
                  What did these {seg.totalProblems} problems add to your brain?
                </h2>
              </div>

              <div className="rounded-2xl bg-zinc-50 px-4 py-2 border border-zinc-100 text-xs font-semibold text-zinc-600">
                Total Problems: <strong className="text-zinc-900">{seg.totalProblems}</strong>
              </div>
            </div>

            {/* Segment Summary Quote */}
            <div className="rounded-2xl bg-zinc-50 p-5 border border-zinc-100 text-sm italic text-zinc-700">
              &ldquo;{seg.summaryNotes}&rdquo;
            </div>

            {/* Marginal Knowledge Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 text-center">
                <span className="text-2xl sm:text-3xl font-black text-indigo-950">{seg.newConceptsCount}</span>
                <p className="text-xs font-bold text-indigo-800 mt-1">New Concepts</p>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 text-center">
                <span className="text-2xl sm:text-3xl font-black text-emerald-950">{seg.repeatedConceptsCount}</span>
                <p className="text-xs font-bold text-emerald-800 mt-1">Repeated Concepts</p>
              </div>

              <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-4 text-center">
                <span className="text-2xl sm:text-3xl font-black text-amber-950">{seg.newVariationsCount}</span>
                <p className="text-xs font-bold text-amber-800 mt-1">New Variations</p>
              </div>

              <div className="rounded-2xl border border-purple-100 bg-purple-50/40 p-4 text-center">
                <span className="text-2xl sm:text-3xl font-black text-purple-950">{seg.uncommonIdeasCount}</span>
                <p className="text-xs font-bold text-purple-800 mt-1">Uncommon Ideas</p>
              </div>

              <div className="rounded-2xl border border-rose-100 bg-rose-50/40 p-4 text-center col-span-2 sm:col-span-1">
                <span className="text-2xl sm:text-3xl font-black text-rose-950">{seg.newCombinationsCount}</span>
                <p className="text-xs font-bold text-rose-800 mt-1">New Combinations</p>
              </div>
            </div>

            {/* Differential Growth Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              {/* Reinforced Patterns */}
              <div className="rounded-2xl border border-zinc-200 p-5 space-y-3 bg-white">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-emerald-600" /> Reinforced Patterns
                </h3>
                <div className="space-y-2">
                  {seg.reinforcedPatterns.map((rp, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-zinc-100 last:border-0">
                      <span className="font-semibold text-zinc-800">{rp.name}</span>
                      <span className="rounded bg-zinc-100 px-2 py-0.5 font-bold text-zinc-700">
                        {rp.count} solved
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* New Patterns Discovered */}
              <div className="rounded-2xl border border-zinc-200 p-5 space-y-3 bg-white">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-indigo-600" /> New Patterns Appeared
                </h3>
                <div className="space-y-2">
                  {seg.newPatternsList.map((np, idx) => (
                    <div key={idx} className="rounded-lg bg-indigo-50/60 px-3 py-2 text-xs font-semibold text-indigo-900 border border-indigo-100">
                      {np}
                    </div>
                  ))}
                </div>
              </div>

              {/* Uncommon Ideas Discovered */}
              <div className="rounded-2xl border border-zinc-200 p-5 space-y-3 bg-white">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-600 flex items-center gap-1.5">
                  <Lightbulb className="h-4 w-4 text-purple-600" /> Uncommon Ideas Learned
                </h3>
                <div className="space-y-2">
                  {seg.uncommonIdeasList.map((ui, idx) => (
                    <div key={idx} className="rounded-lg bg-purple-50/60 px-3 py-2 text-xs font-semibold text-purple-900 border border-purple-100">
                      {ui}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
