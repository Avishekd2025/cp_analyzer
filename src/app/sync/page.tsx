"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ArrowRight,
  Clock,
  Sparkles,
} from "lucide-react";

interface SyncStatusData {
  lastSynced: string;
  currentSolved: number;
  newlyDiscovered: number;
  newlyAnalyzed: number;
  pendingAnalysis: number;
  totalAnalyzed: number;
  patternsUpdated: number;
}

function SyncPageContent() {
  const searchParams = useSearchParams();
  const queryHandle = searchParams.get("handle");
  const autoSync = searchParams.get("auto") === "1";

  const [handle, setHandle] = useState<string>(queryHandle || "X_illUmiNatI");
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncResult, setSyncResult] = useState<SyncStatusData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSync = useCallback(async (targetHandle?: string) => {
    const handleToSync = (targetHandle || handle).trim();
    if (!handleToSync) return;

    setIsSyncing(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handle: handleToSync }),
      });
      const data = await res.json();
      if (data.success) {
        setSyncResult({
          lastSynced: `Today, ${data.syncedAt}`,
          currentSolved: data.currentSolved,
          newlyDiscovered: data.newlyDiscovered,
          newlyAnalyzed: data.newlyAnalyzed,
          pendingAnalysis: data.pendingAnalysis,
          totalAnalyzed: data.totalAnalyzed,
          patternsUpdated: data.patternsUpdated,
        });
      } else {
        setErrorMsg(data.error || "Sync encountered an error.");
      }
    } catch {
      setErrorMsg("Failed to connect to sync pipeline.");
    } finally {
      setIsSyncing(false);
    }
  }, [handle]);

  useEffect(() => {
    if (queryHandle) {
      setHandle(queryHandle);
      if (autoSync) {
        handleSync(queryHandle);
      }
    } else {
      fetch("/api/user")
        .then((res) => res.json())
        .then((data) => {
          if (data && data.handle && data.handle !== "Not Connected") {
            setHandle(data.handle);
          }
        })
        .catch(() => {});
    }
  }, [queryHandle, autoSync, handleSync]);

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="border-b border-zinc-200 pb-6">
        <div className="inline-flex items-center gap-1.5 rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
          <RefreshCw className="h-3.5 w-3.5" /> Incremental Knowledge Pipeline
        </div>
        <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight mt-1">
          Codeforces Continuous Synchronizer
        </h1>
        <p className="text-sm text-zinc-500 mt-1 max-w-3xl">
          Permanently connects to any Codeforces handle. During synchronization, the engine retrieves all accepted submissions, extracts exact unique problems (contestId + index), and analyzes newly discovered problems without redundant reprocessing.
        </p>
      </div>

      {/* Connection & Handle Input Card */}
      <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
          <div>
            <h2 className="text-xl font-bold text-zinc-900">Codeforces Account Connection</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Enter any valid Codeforces handle below to calculate exact unique solved problems.
            </p>
          </div>
          {handle && (
            <a
              href={`https://codeforces.com/profile/${handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800"
            >
              Codeforces Profile <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
          <div className="sm:col-span-2">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-1.5">
              Codeforces Handle
            </label>
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSync();
              }}
              placeholder="e.g. tourist, Benq, Toufik, X_illUmiNatI"
              className="w-full rounded-xl border border-zinc-300 px-4 py-3 text-sm font-semibold text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="pt-5 sm:pt-6">
            <button
              onClick={() => handleSync()}
              disabled={isSyncing}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-6 py-3.5 text-sm font-bold text-white hover:bg-zinc-800 transition-colors shadow-md disabled:bg-zinc-300 cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
              {isSyncing ? "Analyzing Submissions..." : "Sync Now"}
            </button>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Sync Status Live Panel with 4 Truth-In-Data Metrics */}
      {syncResult && (
        <div className="rounded-3xl border border-indigo-100 bg-linear-to-br from-white to-indigo-50/30 p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-5">
            <div>
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider block">
                Truth-in-Data Sync Report ({handle})
              </span>
              <h3 className="text-xl font-bold text-zinc-900 mt-1">Incremental Pipeline Status</h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="h-4 w-4" /> Synchronized
              </span>
              <Link
                href={`/?handle=${encodeURIComponent(handle)}`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 transition-colors shadow-sm"
              >
                <Sparkles className="h-3.5 w-3.5" /> View Dashboard <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* 4 Crucial Separated Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* 1. Current Solved */}
            <div className="rounded-2xl bg-white p-5 border border-zinc-200 shadow-2xs">
              <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider block">
                1. Current Solved
              </span>
              <strong className="text-2xl font-black text-zinc-900 mt-1 block">
                {syncResult.currentSolved}
              </strong>
              <p className="text-[11px] text-zinc-500 mt-1">
                Total unique accepted problems
              </p>
            </div>

            {/* 2. Newly Discovered */}
            <div className="rounded-2xl bg-white p-5 border border-zinc-200 shadow-2xs">
              <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider block">
                2. Newly Discovered
              </span>
              <strong className="text-2xl font-black text-indigo-600 mt-1 block">
                +{syncResult.newlyDiscovered}
              </strong>
              <p className="text-[11px] text-zinc-500 mt-1">
                New AC problems this run
              </p>
            </div>

            {/* 3. Newly Analyzed */}
            <div className="rounded-2xl bg-white p-5 border border-zinc-200 shadow-2xs">
              <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider block">
                3. Newly Analyzed
              </span>
              <strong className="text-2xl font-black text-purple-600 mt-1 block">
                +{syncResult.newlyAnalyzed}
              </strong>
              <p className="text-[11px] text-zinc-500 mt-1">
                Structured knowledge atoms created
              </p>
            </div>

            {/* 4. Pending Analysis */}
            <div className="rounded-2xl bg-white p-5 border border-zinc-200 shadow-2xs">
              <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider block">
                4. Pending Analysis
              </span>
              <strong className="text-2xl font-black text-amber-600 mt-1 block">
                {syncResult.pendingAnalysis}
              </strong>
              <p className="text-[11px] text-zinc-500 mt-1">
                Remaining solved problems to analyze
              </p>
            </div>
          </div>

          {/* Additional details */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-3 shadow-2xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-600">
              Audit & Data Invariants
            </h4>
            <div className="space-y-2 text-xs font-medium text-zinc-800">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Unique Definition:</strong> Problem is strictly defined by <code>contestId + index</code>. Duplicate attempts are counted as exactly 1 solved problem.
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Total Analyzed to Date:</strong> {syncResult.totalAnalyzed} problems have structured knowledge atoms and pattern classifications.
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Pattern Invariants:</strong> {syncResult.patternsUpdated} canonical patterns reinforced with user submission evidence.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SyncPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-zinc-500">Loading sync pipeline...</div>}>
      <SyncPageContent />
    </Suspense>
  );
}
