"use client";

import { useState } from "react";
import { CANONICAL_REVISION_CARDS, RevisionCard, RevisionMode } from "@/lib/revision-engine";
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  Brain,
  Lightbulb,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Award,
  ChevronRight,
} from "lucide-react";
import confetti from "canvas-confetti";

export default function RevisionHubPage() {
  const [activeMode, setActiveMode] = useState<RevisionMode | "ALL">("ALL");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [score, setScore] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 });

  const filteredCards =
    activeMode === "ALL"
      ? CANONICAL_REVISION_CARDS
      : CANONICAL_REVISION_CARDS.filter((c) => c.mode === activeMode);

  const currentCard: RevisionCard = filteredCards[currentIndex % filteredCards.length];

  const handleSelectOption = (optId: string) => {
    if (isAnswerRevealed) return;
    setSelectedOption(optId);
  };

  const handleVerify = () => {
    if (!selectedOption) return;
    setIsAnswerRevealed(true);
    const chosen = currentCard.options.find((o) => o.id === selectedOption);
    if (chosen?.isCorrect) {
      setScore((prev) => ({ correct: prev.correct + 1, total: prev.total + 1 }));
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });
    } else {
      setScore((prev) => ({ correct: prev.correct, total: prev.total + 1 }));
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setIsAnswerRevealed(false);
    setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
  };

  const modesList: { key: RevisionMode | "ALL"; label: string; desc: string }[] = [
    { key: "ALL", label: "All Modes", desc: "Comprehensive mixed deck" },
    { key: "RECOGNITION", label: "1. Pattern Recognition", desc: "Which pattern triggers?" },
    { key: "WHY", label: "2. Why It Works", desc: "Proof / safety invariants" },
    { key: "OBSERVATION", label: "3. Pivotal Observation", desc: "Complexity collapsing clue" },
    { key: "VARIATION", label: "4. Variation Drill", desc: "Identify structural twists" },
    { key: "COMPARISON", label: "5. Problem Comparison", desc: "Contrast similar problems" },
    { key: "UNCOMMON", label: "6. Uncommon Knowledge", desc: "Deep rare concept drill" },
  ];

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
            <Brain className="h-3.5 w-3.5" /> Spaced Repetition & Reflex Training
          </div>
          <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight mt-1">
            6-Mode Interactive Revision Hub
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Active recall tests based entirely on your solved Codeforces problems to build instant future pattern-recognition.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-2 shadow-2xs text-center">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block">Session Score</span>
            <span className="text-sm font-black text-indigo-700">
              {score.correct} / {score.total} ({score.total === 0 ? "100%" : `${Math.round((score.correct / score.total) * 100)}%`})
            </span>
          </div>
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {modesList.map((m) => (
          <button
            key={m.key}
            onClick={() => {
              setActiveMode(m.key);
              setSelectedOption(null);
              setIsAnswerRevealed(false);
              setCurrentIndex(0);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeMode === m.key
                ? "bg-zinc-900 text-white shadow-md"
                : "bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Active Revision Card */}
      {currentCard && (
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-10 shadow-md space-y-8">
          {/* Card Meta & Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-bold text-white uppercase tracking-wider">
                {currentCard.modeTitle}
              </span>
              <span className="rounded-lg bg-zinc-100 px-2.5 py-1 text-xs font-bold text-zinc-700">
                CF {currentCard.problemId}
              </span>
              <span className="text-xs font-medium text-zinc-500">
                Rating: {currentCard.problemRating}
              </span>
            </div>

            <span className="text-xs font-semibold text-zinc-400">
              Card {(currentIndex % filteredCards.length) + 1} of {filteredCards.length}
            </span>
          </div>

          {/* Problem / Context Statement */}
          <div className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 leading-snug">
              {currentCard.promptText}
            </h2>
            <div className="rounded-xl bg-zinc-50 p-4 border border-zinc-100 text-xs font-mono text-zinc-600">
              <strong className="text-zinc-700">Context: </strong> {currentCard.contextSnippet}
            </div>
          </div>

          {/* Options Grid */}
          <div className="space-y-3">
            {currentCard.options.map((opt) => {
              const isSelected = selectedOption === opt.id;
              let borderClass = "border-zinc-200 hover:border-zinc-300 bg-white";

              if (isSelected && !isAnswerRevealed) {
                borderClass = "border-indigo-600 bg-indigo-50/50 text-indigo-950 font-semibold ring-2 ring-indigo-500/20";
              } else if (isAnswerRevealed) {
                if (opt.isCorrect) {
                  borderClass = "border-emerald-500 bg-emerald-50/70 text-emerald-950 font-bold ring-2 ring-emerald-500/20";
                } else if (isSelected && !opt.isCorrect) {
                  borderClass = "border-rose-500 bg-rose-50/70 text-rose-950 font-bold ring-2 ring-rose-500/20";
                }
              }

              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(opt.id)}
                  disabled={isAnswerRevealed}
                  className={`w-full text-left p-4 rounded-2xl border transition-all text-xs sm:text-sm cursor-pointer flex items-center justify-between ${borderClass}`}
                >
                  <span>{opt.text}</span>
                  {isAnswerRevealed && opt.isCorrect && (
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 ml-2" />
                  )}
                  {isAnswerRevealed && isSelected && !opt.isCorrect && (
                    <XCircle className="h-5 w-5 text-rose-600 shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
            {!isAnswerRevealed ? (
              <button
                onClick={handleVerify}
                disabled={!selectedOption}
                className={`rounded-xl px-6 py-3 text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                  selectedOption
                    ? "bg-zinc-900 text-white hover:bg-zinc-800 shadow-md"
                    : "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                }`}
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="rounded-xl bg-indigo-600 px-6 py-3 text-xs sm:text-sm font-bold text-white hover:bg-indigo-500 transition-colors shadow-md flex items-center gap-2 cursor-pointer"
              >
                Next Drill Card <ArrowRight className="h-4 w-4" />
              </button>
            )}

            <button
              onClick={handleNext}
              className="text-xs font-semibold text-zinc-500 hover:text-zinc-800"
            >
              Skip
            </button>
          </div>

          {/* Detailed Explanation & Mental Model Takeaway (Progressive Reveal) */}
          {isAnswerRevealed && (
            <div className="rounded-3xl border border-indigo-200 bg-indigo-50/40 p-6 sm:p-8 space-y-4 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2 text-indigo-900">
                <Brain className="h-5 w-5 text-indigo-600" />
                <h3 className="text-base font-bold">Why This Is The Canonical Answer</h3>
              </div>

              <p className="text-xs sm:text-sm text-zinc-800 leading-relaxed font-normal bg-white p-4 rounded-xl border border-indigo-100">
                {currentCard.explanation}
              </p>

              <div className="rounded-xl bg-white p-4 border border-indigo-100 space-y-1">
                <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1">
                  <Lightbulb className="h-3.5 w-3.5" /> Mental Model Takeaway
                </span>
                <p className="text-xs text-zinc-900 font-semibold italic">
                  &ldquo;{currentCard.mentalModelTakeaway}&rdquo;
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
