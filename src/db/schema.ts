import { sqliteTable, text, integer, uniqueIndex, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// 1. Raw Data Layer: Users
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email"),
  name: text("name").notNull(),
  avatarUrl: text("avatar_url"),
  codeforcesHandle: text("codeforces_handle").notNull().unique(),
  rating: integer("rating").default(0),
  maxRating: integer("max_rating").default(0),
  rank: text("rank").default("unrated"),
  totalSolved: integer("total_solved").default(0),
  totalAnalyzed: integer("total_analyzed").default(0),
  lastSyncedAt: text("last_synced_at"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// 1b. User-Scoped Solved Problems with Database Uniqueness Constraint
export const userSolvedProblems = sqliteTable(
  "user_solved_problems",
  {
    id: text("id").primaryKey(), // `${userHandle}_${contestId}_${index}`
    userHandle: text("user_handle").notNull(),
    contestId: integer("contest_id").notNull(),
    index: text("index").notNull(),
    problemId: text("problem_id").notNull(), // `${contestId}${index}`
    name: text("name").notNull(),
    rating: integer("rating"),
    tags: text("tags").notNull(), // JSON array
    problemUrl: text("problem_url").notNull(),
    solvedAt: integer("solved_at").notNull(),
    submissionId: integer("submission_id"),
    language: text("language"),
    isAnalyzed: integer("is_analyzed").default(0), // 0 = pending, 1 = analyzed
    primaryPatternId: text("primary_pattern_id"),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("user_problem_unique_idx").on(table.userHandle, table.contestId, table.index),
    index("user_handle_idx").on(table.userHandle),
    index("is_analyzed_idx").on(table.isAnalyzed),
  ]
);

// 1. Raw Data Layer: Solved Problems (Canonical Problem Metadata)
export const problems = sqliteTable("problems", {
  id: text("id").primaryKey(), // e.g. "1872A" (contestId + index)
  contestId: integer("contest_id").notNull(),
  index: text("index").notNull(),
  name: text("name").notNull(),
  rating: integer("rating"),
  tags: text("tags").notNull(), // JSON array of strings
  problemUrl: text("problem_url").notNull(),
  solvedAt: integer("solved_at").notNull(), // Epoch seconds of accepted submission
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// 1. Raw Data Layer: Submissions
export const submissions = sqliteTable("submissions", {
  id: integer("id").primaryKey(),
  problemId: text("problem_id").notNull().references(() => problems.id),
  verdict: text("verdict").notNull(),
  language: text("language").notNull(),
  passedTestCount: integer("passed_test_count").default(0),
  timeConsumedMillis: integer("time_consumed_millis").default(0),
  memoryConsumedBytes: integer("memory_consumed_bytes").default(0),
  submissionTime: integer("submission_time").notNull(),
  codeSnippet: text("code_snippet"),
});

// 2. Chronological 200-Problem Segmentation Layer
export const segments = sqliteTable("segments", {
  id: text("id").primaryKey(), // e.g. "segment-1" (newest 200), "segment-2", etc.
  segmentNumber: integer("segment_number").notNull(), // 1 = newest 200
  startProblemIdx: integer("start_problem_idx").notNull(),
  endProblemIdx: integer("end_problem_idx").notNull(),
  totalProblems: integer("total_problems").notNull().default(200),
  newConceptsCount: integer("new_concepts_count").default(0),
  repeatedConceptsCount: integer("repeated_concepts_count").default(0),
  newVariationsCount: integer("new_variations_count").default(0),
  uncommonIdeasCount: integer("uncommon_ideas_count").default(0),
  newCombinationsCount: integer("new_combinations_count").default(0),
  summaryNotes: text("summary_notes"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const segmentProblems = sqliteTable("segment_problems", {
  id: text("id").primaryKey(),
  segmentId: text("segment_id").notNull().references(() => segments.id),
  problemId: text("problem_id").notNull().references(() => problems.id),
  solvedAt: integer("solved_at").notNull(),
  orderInSegment: integer("order_in_segment").notNull(),
});

// 3. Solution Evidence & Verification Layer
export const solutionEvidence = sqliteTable("solution_evidence", {
  id: text("id").primaryKey(),
  problemId: text("problem_id").notNull().references(() => problems.id),
  sourceType: text("source_type").notNull(), // 'OFFICIAL_EDITORIAL' | 'ACCEPTED_CODE' | 'COMMUNITY_BLOG'
  editorialUrl: text("editorial_url"),
  editorialSnippet: text("editorial_snippet"),
  author: text("author"),
  rawReference: text("raw_reference"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const verificationRecords = sqliteTable("verification_records", {
  id: text("id").primaryKey(),
  problemId: text("problem_id").notNull().references(() => problems.id),
  status: text("status").notNull(), // 'VERIFIED_HIGH_CONFIDENCE' | 'VERIFIED_MEDIUM_CONFIDENCE' | 'ALTERNATIVE_SOURCE' | 'PENDING_REVIEW' | 'NOT_VERIFIED'
  confidenceScore: integer("confidence_score").notNull().default(100), // 0 - 100
  algorithmCrosscheck: text("algorithm_crosscheck"),
  complexityVerified: text("complexity_verified"), // e.g. "O(N log N) within 2.0s limit"
  correctnessReasoning: text("correctness_reasoning"),
  verifiedAt: text("verified_at").default(sql`CURRENT_TIMESTAMP`),
});

// 4. Canonical Knowledge Base: Techniques (Broad algorithmic family)
export const techniques = sqliteTable("techniques", {
  id: text("id").primaryKey(), // e.g. "greedy", "dp", "binary-search", "graph"
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  color: text("color").notNull(), // Tailwind hex / class
  icon: text("icon").notNull(),
  commonality: text("commonality").notNull().default("COMMON"), // 'COMMON' | 'UNCOMMON' | 'RARE'
});

// 4. Canonical Knowledge Base: Patterns (Reusable structure inside technique)
export const patterns = sqliteTable("patterns", {
  id: text("id").primaryKey(), // e.g. "interval-scheduling-greedy", "binary-search-on-answer"
  techniqueId: text("technique_id").notNull().references(() => techniques.id),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  coreIdea: text("core_idea").notNull(),
  mentalModel: text("mental_model").notNull(),
  realLifeAnalogy: text("real_life_analogy").notNull(),
  discoveryFlow: text("discovery_flow").notNull(), // Step-by-step thinking process
  recognitionSignals: text("recognition_signals").notNull(), // JSON list of clues
  standardApproach: text("standard_approach").notNull(),
  whyItWorksProof: text("why_it_works_proof").notNull(), // Exchange argument / Invariant / Induction
  whyNotOthers: text("why_not_others").notNull(), // Contrast with DP / Brute Force / etc.
  commonMistakes: text("common_mistakes").notNull(), // JSON list of traps
  implementationInsights: text("implementation_insights").notNull(),
  rarityTier: text("rarity_tier").notNull().default("COMMON"), // 'COMMON' | 'UNCOMMON' | 'RARE'
  usedCount: integer("used_count").default(0),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// 4. Canonical Knowledge Base: Variations
export const variations = sqliteTable("variations", {
  id: text("id").primaryKey(),
  patternId: text("pattern_id").notNull().references(() => patterns.id),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description").notNull(),
  constraintContext: text("constraint_context").notNull(),
  representativeProblemId: text("representative_problem_id"),
});

// 4. Canonical Knowledge Base: Technique Combinations
export const techniqueCombinations = sqliteTable("technique_combinations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(), // e.g. "Greedy + Priority Queue", "DP + Graph"
  techniqueAId: text("technique_a_id").notNull().references(() => techniques.id),
  techniqueBId: text("technique_b_id").notNull().references(() => techniques.id),
  rationale: text("rationale").notNull(),
  roleA: text("role_a").notNull(),
  roleB: text("role_b").notNull(),
  emergenceClue: text("emergence_clue").notNull(),
  representativeProblemId: text("representative_problem_id"),
  frequency: integer("frequency").default(1),
});

// 4. Canonical Knowledge Base: Problem-Level Knowledge Atoms
export const problemKnowledge = sqliteTable("problem_knowledge", {
  id: text("id").primaryKey(),
  problemId: text("problem_id").notNull().references(() => problems.id),
  primaryPatternId: text("primary_pattern_id").notNull().references(() => patterns.id),
  secondaryTechniqueIds: text("secondary_technique_ids").notNull(), // JSON string array
  keyObservation: text("key_observation").notNull(),
  whyThisApproach: text("why_this_approach").notNull(),
  safeDecisionProof: text("safe_decision_proof").notNull(),
  variationId: text("variation_id"),
  implementationTechniques: text("implementation_techniques").notNull(), // JSON array
  commonTraps: text("common_traps").notNull(), // JSON array
});

// 4. Canonical Knowledge Base: Representative Solved Problems (Progression 1-8)
export const representativeProblems = sqliteTable("representative_problems", {
  id: text("id").primaryKey(),
  patternId: text("pattern_id").notNull().references(() => patterns.id),
  problemId: text("problem_id").notNull().references(() => problems.id),
  progressionTier: integer("progression_tier").notNull(), // 1: Basic, 2: Typical, 3: Variation, 4: Constraint twist, 5: Combination, 6: Observation, 7: Advanced, 8: Rare
  progressionLabel: text("progression_label").notNull(),
  whyRepresentative: text("why_representative").notNull(),
});

// 4. Canonical Knowledge Base: Pattern Aliases / Normalization
export const patternAliases = sqliteTable("pattern_aliases", {
  id: text("id").primaryKey(),
  patternId: text("pattern_id").notNull().references(() => patterns.id),
  alias: text("alias").notNull().unique(),
});

// 5. Revision & Mastery Layer
export const masteryRecords = sqliteTable("mastery_records", {
  id: text("id").primaryKey(),
  patternId: text("pattern_id").notNull().references(() => patterns.id),
  exposureCount: integer("exposure_count").default(0),
  variationCoverage: integer("variation_coverage").default(0),
  combinationCoverage: integer("combination_coverage").default(0),
  revisionScore: integer("revision_score").default(0), // 0 - 100
  lastRevisedAt: text("last_revised_at"),
});

export const revisionLogs = sqliteTable("revision_logs", {
  id: text("id").primaryKey(),
  problemId: text("problem_id").notNull().references(() => problems.id),
  patternId: text("pattern_id").notNull().references(() => patterns.id),
  mode: text("mode").notNull(), // 'RECOGNITION' | 'WHY' | 'OBSERVATION' | 'VARIATION' | 'COMPARISON' | 'UNCOMMON'
  questionPrompt: text("question_prompt").notNull(),
  userResponse: text("user_response"),
  isCorrect: integer("is_correct").default(1), // 1 = true, 0 = false
  feedback: text("feedback").notNull(),
  timestamp: text("timestamp").default(sql`CURRENT_TIMESTAMP`),
});
