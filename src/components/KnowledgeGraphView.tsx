"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ZoomIn, ZoomOut, RotateCcw, Sparkles } from "lucide-react";

export interface GraphNode {
  id: string;
  name: string;
  type: "technique" | "pattern" | "combination";
  techniqueId?: string;
  rarity?: "COMMON" | "UNCOMMON" | "RARE";
  x: number;
  y: number;
  color: string;
  usedCount?: number;
  description: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  label?: string;
}

const NODES: GraphNode[] = [
  // Central Techniques
  { id: "tech-greedy", name: "Greedy", type: "technique", x: 260, y: 160, color: "#10b981", description: "Locally optimal choices with exchange-argument proofs." },
  { id: "tech-bs", name: "Binary Search", type: "technique", x: 160, y: 340, color: "#f59e0b", description: "Logarithmic domain reduction over monotonic spaces." },
  { id: "tech-dp", name: "Dynamic Programming", type: "technique", x: 440, y: 200, color: "#6366f1", description: "Subproblem memoization and state transitions." },
  { id: "tech-graph", name: "Graph Theory", type: "technique", x: 620, y: 320, color: "#0ea5e9", description: "Reachability, components, cycles, and trees." },
  { id: "tech-ds", name: "Data Structures", type: "technique", x: 400, y: 460, color: "#f43f5e", description: "Segment trees, Fenwick, and priority queues." },
  { id: "tech-rare", name: "Rare Structural", type: "technique", x: 680, y: 160, color: "#8b5cf6", description: "2-SAT, Meet-in-the-Middle, and Min-Cut." },

  // Patterns
  { id: "bs-on-answer", name: "BS on Answer", type: "pattern", rarity: "COMMON", x: 80, y: 220, color: "#f59e0b", usedCount: 42, description: "Monotonic check(mid) predicate over answer range." },
  { id: "interval-greedy", name: "Interval Greedy", type: "pattern", rarity: "COMMON", x: 180, y: 70, color: "#10b981", usedCount: 38, description: "Earliest finishing time preserves future flexibility." },
  { id: "tree-dp-rerooting", name: "Tree DP Rerooting", type: "pattern", rarity: "UNCOMMON", x: 540, y: 80, color: "#6366f1", usedCount: 16, description: "In-out tree decomposition in O(N) total." },
  { id: "monotonic-queue-dp", name: "Monotonic Queue DP", type: "pattern", rarity: "UNCOMMON", x: 340, y: 80, color: "#6366f1", usedCount: 14, description: "Sliding window optimization from O(NK) to O(N)." },
  { id: "segment-tree-lazy", name: "Segment Tree Lazy", type: "pattern", rarity: "UNCOMMON", x: 260, y: 490, color: "#f43f5e", usedCount: 22, description: "Deferred propagation for range updates + queries." },
  { id: "two-sat", name: "2-SAT Implication", type: "pattern", rarity: "RARE", x: 740, y: 270, color: "#8b5cf6", usedCount: 7, description: "SCC on directed implication domino chains." },

  // Observed Combinations
  { id: "comb-bs-greedy", name: "BS + Greedy", type: "combination", x: 180, y: 250, color: "#d97706", description: "Binary search threshold with linear greedy check." },
  { id: "comb-greedy-pq", name: "Greedy + PQ", type: "combination", x: 320, y: 320, color: "#059669", description: "Greedy scheduling with priority queue room allocation." },
  { id: "comb-dp-graph", name: "DP + Graph", type: "combination", x: 530, y: 280, color: "#4f46e5", description: "DAG topological DP transitions and tree invariants." },
];

const EDGES: GraphEdge[] = [
  { source: "tech-greedy", target: "interval-greedy" },
  { source: "tech-bs", target: "bs-on-answer" },
  { source: "tech-dp", target: "tree-dp-rerooting" },
  { source: "tech-dp", target: "monotonic-queue-dp" },
  { source: "tech-ds", target: "segment-tree-lazy" },
  { source: "tech-rare", target: "two-sat" },
  // Combinations
  { source: "tech-bs", target: "comb-bs-greedy" },
  { source: "tech-greedy", target: "comb-bs-greedy" },
  { source: "tech-greedy", target: "comb-greedy-pq" },
  { source: "tech-ds", target: "comb-greedy-pq" },
  { source: "tech-dp", target: "comb-dp-graph" },
  { source: "tech-graph", target: "comb-dp-graph" },
  { source: "tech-graph", target: "two-sat" },
];

interface KnowledgeGraphViewProps {
  patternCounts?: Record<string, number>;
}

export default function KnowledgeGraphView({ patternCounts }: KnowledgeGraphViewProps) {
  const nodes = NODES.map((node) => {
    if (node.type === "pattern" && patternCounts && patternCounts[node.id] !== undefined) {
      return { ...node, usedCount: patternCounts[node.id] };
    }
    return node;
  });

  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(nodes[6]); // Default BS on Answer
  const [zoom, setZoom] = useState<number>(1);
  const [filterType, setFilterType] = useState<string>("ALL");

  const filteredNodes =
    filterType === "ALL" ? nodes : nodes.filter((n) => n.type === filterType);

  return (
    <div className="space-y-6">
      {/* Controls & Filter Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          {["ALL", "pattern", "combination", "technique"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors cursor-pointer ${
                filterType === type
                  ? "bg-zinc-900 text-white shadow-xs"
                  : "bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100"
              }`}
            >
              {type === "ALL" ? "All Elements" : `${type}s`}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 bg-white border border-zinc-200 rounded-xl p-1 shadow-2xs">
          <button
            onClick={() => setZoom((z) => Math.min(z + 0.15, 1.6))}
            className="p-1.5 rounded-lg text-zinc-600 hover:bg-zinc-100 cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(z - 0.15, 0.6))}
            className="p-1.5 rounded-lg text-zinc-600 hover:bg-zinc-100 cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-1.5 rounded-lg text-zinc-600 hover:bg-zinc-100 cursor-pointer"
            title="Reset View"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Canvas & Details Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* SVG Canvas Area */}
        <div className="lg:col-span-3 rounded-3xl border border-zinc-200 bg-white p-4 shadow-xs overflow-hidden relative min-h-[560px] flex items-center justify-center">
          <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg border border-zinc-200 text-[11px] font-semibold text-zinc-600 shadow-2xs">
            Click any node to inspect knowledge linkage
          </div>

          <svg
            className="w-full h-[540px] transition-transform duration-200 ease-out"
            viewBox="0 0 840 560"
            style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}
          >
            {/* Edges */}
            {EDGES.map((e, idx) => {
              const srcNode = NODES.find((n) => n.id === e.source);
              const tgtNode = NODES.find((n) => n.id === e.target);
              if (!srcNode || !tgtNode) return null;

              const isHighlighted =
                selectedNode && (selectedNode.id === srcNode.id || selectedNode.id === tgtNode.id);

              return (
                <line
                  key={idx}
                  x1={srcNode.x}
                  y1={srcNode.y}
                  x2={tgtNode.x}
                  y2={tgtNode.y}
                  stroke={isHighlighted ? "#6366f1" : "#e4e4e7"}
                  strokeWidth={isHighlighted ? 3 : 1.5}
                  strokeDasharray={srcNode.type === "combination" || tgtNode.type === "combination" ? "4 4" : undefined}
                />
              );
            })}

            {/* Nodes */}
            {filteredNodes.map((n) => {
              const isSelected = selectedNode?.id === n.id;
              const radius = n.type === "technique" ? 28 : n.type === "combination" ? 22 : 24;

              return (
                <g
                  key={n.id}
                  onClick={() => setSelectedNode(n)}
                  className="cursor-pointer transition-transform hover:scale-110"
                  transform={`translate(${n.x}, ${n.y})`}
                >
                  {/* Outer glow if selected */}
                  {isSelected && (
                    <circle r={radius + 7} fill="none" stroke={n.color} strokeWidth={3} opacity={0.4} />
                  )}

                  <circle
                    r={radius}
                    fill={n.color}
                    stroke="#ffffff"
                    strokeWidth={2.5}
                    className="shadow-md"
                  />

                  {/* Node label */}
                  <text
                    textAnchor="middle"
                    y={radius + 16}
                    fill="#18181b"
                    fontSize={11}
                    fontWeight="700"
                    className="select-none pointer-events-none"
                  >
                    {n.name}
                  </text>

                  {/* Icon badge or abbreviation */}
                  <text
                    textAnchor="middle"
                    dy=".3em"
                    fill="#ffffff"
                    fontSize={10}
                    fontWeight="800"
                    className="select-none pointer-events-none"
                  >
                    {n.type === "technique" ? "TECH" : n.type === "combination" ? "+" : "PAT"}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected Node Details Drawer */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-xs flex flex-col justify-between space-y-6">
          {selectedNode ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span
                  className="rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white"
                  style={{ backgroundColor: selectedNode.color }}
                >
                  {selectedNode.type}
                </span>
                {selectedNode.rarity && (
                  <span className="text-[11px] font-bold text-zinc-500 uppercase">
                    {selectedNode.rarity}
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-xl font-bold text-zinc-900">{selectedNode.name}</h3>
                <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
                  {selectedNode.description}
                </p>
              </div>

              {selectedNode.usedCount !== undefined && (
                <div className="rounded-xl bg-zinc-50 p-3.5 border border-zinc-100 text-xs">
                  <span className="text-zinc-500 block">Personal Solved Usage</span>
                  <strong className="text-zinc-900 text-base">{selectedNode.usedCount} Problems</strong>
                </div>
              )}

              <div className="rounded-xl bg-indigo-50/60 p-3.5 border border-indigo-100 space-y-1">
                <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Graph Relationship
                </span>
                <p className="text-xs text-indigo-950 font-medium">
                  Connected directly to canonical techniques and observed combinations from your solved history.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-zinc-500 italic">Select any node on the graph to inspect.</p>
          )}

          {selectedNode?.type === "pattern" && (
            <Link
              href={`/patterns/${selectedNode.id}`}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-4 py-3 text-xs font-bold text-white hover:bg-zinc-800 transition-colors shadow-md"
            >
              Open 14-Point Pattern Page <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
