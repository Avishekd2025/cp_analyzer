import { db } from "@/db";
import { patterns } from "@/db/schema";
import KnowledgeGraphView from "@/components/KnowledgeGraphView";
import { Share2, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Knowledge Graph — CP Brain",
  description: "Visual relationship map of algorithmic techniques, canonical patterns, and observed combinations.",
};

export default async function GraphPage() {
  const patternList = await db.select({ id: patterns.id, usedCount: patterns.usedCount }).from(patterns);
  const patternCounts: Record<string, number> = {};
  for (const p of patternList) {
    patternCounts[p.id] = p.usedCount || 0;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-zinc-200 pb-6">
        <div className="inline-flex items-center gap-1.5 rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
          <Share2 className="h-3.5 w-3.5" /> Synaptic Knowledge Topology
        </div>
        <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight mt-1">
          Interactive Knowledge Graph
        </h1>
        <p className="text-sm text-zinc-500 mt-1 max-w-3xl">
          A visual representation of how your solved problems connect techniques to patterns and multi-algorithmic combinations.
        </p>
      </div>

      <KnowledgeGraphView patternCounts={patternCounts} />
    </div>
  );
}
