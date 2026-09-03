import { NextResponse } from "next/server";
import postgres from "postgres";

export const dynamic = "force-dynamic";

export async function GET() {
  const connectionString =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.STORAGE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL_NON_POOLING;

  if (!connectionString) {
    return NextResponse.json(
      {
        success: false,
        error: "No database connection string found (DATABASE_URL, POSTGRES_URL, or STORAGE_URL)",
      },
      { status: 500 }
    );
  }

  const sql = postgres(connectionString, { max: 1, prepare: false });

  try {
    // 1. Create tables
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS users (
        id text PRIMARY KEY NOT NULL,
        email text,
        name text NOT NULL,
        avatar_url text,
        codeforces_handle text NOT NULL UNIQUE,
        rating integer DEFAULT 0,
        max_rating integer DEFAULT 0,
        rank text DEFAULT 'unrated',
        total_solved integer DEFAULT 0,
        total_analyzed integer DEFAULT 0,
        last_synced_at text,
        created_at text DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS problems (
        id text PRIMARY KEY NOT NULL,
        contest_id integer NOT NULL,
        index text NOT NULL,
        name text NOT NULL,
        rating integer,
        tags text NOT NULL,
        problem_url text NOT NULL,
        solved_at integer NOT NULL,
        created_at text DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_solved_problems (
        id text PRIMARY KEY NOT NULL,
        user_handle text NOT NULL,
        contest_id integer NOT NULL,
        index text NOT NULL,
        problem_id text NOT NULL,
        name text NOT NULL,
        rating integer,
        tags text NOT NULL,
        problem_url text NOT NULL,
        solved_at integer NOT NULL,
        submission_id integer,
        language text,
        is_analyzed integer DEFAULT 0,
        primary_pattern_id text,
        created_at text DEFAULT CURRENT_TIMESTAMP
      );

      CREATE UNIQUE INDEX IF NOT EXISTS user_problem_unique_idx ON user_solved_problems (user_handle, contest_id, index);
      CREATE INDEX IF NOT EXISTS user_handle_idx ON user_solved_problems (user_handle);
      CREATE INDEX IF NOT EXISTS is_analyzed_idx ON user_solved_problems (is_analyzed);

      CREATE TABLE IF NOT EXISTS techniques (
        id text PRIMARY KEY NOT NULL,
        name text NOT NULL,
        slug text NOT NULL UNIQUE,
        description text NOT NULL,
        color text NOT NULL,
        icon text NOT NULL,
        commonality text DEFAULT 'COMMON' NOT NULL
      );

      CREATE TABLE IF NOT EXISTS patterns (
        id text PRIMARY KEY NOT NULL,
        technique_id text NOT NULL,
        name text NOT NULL,
        slug text NOT NULL UNIQUE,
        core_idea text NOT NULL,
        mental_model text NOT NULL,
        real_life_analogy text NOT NULL,
        discovery_flow text NOT NULL,
        recognition_signals text NOT NULL,
        standard_approach text NOT NULL,
        why_it_works_proof text NOT NULL,
        why_not_others text NOT NULL,
        common_mistakes text NOT NULL,
        implementation_insights text NOT NULL,
        rarity_tier text DEFAULT 'COMMON' NOT NULL,
        used_count integer DEFAULT 0,
        created_at text DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS variations (
        id text PRIMARY KEY NOT NULL,
        pattern_id text NOT NULL,
        name text NOT NULL,
        slug text NOT NULL,
        description text NOT NULL,
        constraint_context text NOT NULL,
        representative_problem_id text
      );

      CREATE TABLE IF NOT EXISTS technique_combinations (
        id text PRIMARY KEY NOT NULL,
        name text NOT NULL,
        technique_a_id text NOT NULL,
        technique_b_id text NOT NULL,
        rationale text NOT NULL,
        role_a text NOT NULL,
        role_b text NOT NULL,
        emergence_clue text NOT NULL,
        representative_problem_id text,
        frequency integer DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS problem_knowledge (
        id text PRIMARY KEY NOT NULL,
        problem_id text NOT NULL,
        primary_pattern_id text NOT NULL,
        secondary_technique_ids text NOT NULL,
        key_observation text NOT NULL,
        why_this_approach text NOT NULL,
        safe_decision_proof text NOT NULL,
        variation_id text,
        implementation_techniques text NOT NULL,
        common_traps text NOT NULL
      );

      CREATE TABLE IF NOT EXISTS representative_problems (
        id text PRIMARY KEY NOT NULL,
        pattern_id text NOT NULL,
        problem_id text NOT NULL,
        progression_tier integer NOT NULL,
        progression_label text NOT NULL,
        why_representative text NOT NULL
      );

      CREATE TABLE IF NOT EXISTS submissions (
        id integer PRIMARY KEY NOT NULL,
        problem_id text NOT NULL,
        verdict text NOT NULL,
        language text NOT NULL,
        passed_test_count integer DEFAULT 0,
        time_consumed_millis integer DEFAULT 0,
        memory_consumed_bytes integer DEFAULT 0,
        submission_time integer NOT NULL,
        code_snippet text
      );

      CREATE TABLE IF NOT EXISTS segments (
        id text PRIMARY KEY NOT NULL,
        segment_number integer NOT NULL,
        start_problem_idx integer NOT NULL,
        end_problem_idx integer NOT NULL,
        total_problems integer DEFAULT 200 NOT NULL,
        new_concepts_count integer DEFAULT 0,
        repeated_concepts_count integer DEFAULT 0,
        new_variations_count integer DEFAULT 0,
        uncommon_ideas_count integer DEFAULT 0,
        new_combinations_count integer DEFAULT 0,
        summary_notes text,
        created_at text DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS segment_problems (
        id text PRIMARY KEY NOT NULL,
        segment_id text NOT NULL,
        problem_id text NOT NULL,
        solved_at integer NOT NULL,
        order_in_segment integer NOT NULL
      );

      CREATE TABLE IF NOT EXISTS solution_evidence (
        id text PRIMARY KEY NOT NULL,
        problem_id text NOT NULL,
        source_type text NOT NULL,
        editorial_url text,
        editorial_snippet text,
        author text,
        raw_reference text,
        created_at text DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS verification_records (
        id text PRIMARY KEY NOT NULL,
        problem_id text NOT NULL,
        status text NOT NULL,
        confidence_score integer DEFAULT 100 NOT NULL,
        algorithm_crosscheck text,
        complexity_verified text,
        correctness_reasoning text,
        verified_at text DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS pattern_aliases (
        id text PRIMARY KEY NOT NULL,
        pattern_id text NOT NULL,
        alias text NOT NULL UNIQUE
      );

      CREATE TABLE IF NOT EXISTS mastery_records (
        id text PRIMARY KEY NOT NULL,
        pattern_id text NOT NULL,
        exposure_count integer DEFAULT 0,
        variation_coverage integer DEFAULT 0,
        combination_coverage integer DEFAULT 0,
        revision_score integer DEFAULT 0,
        last_revised_at text
      );

      CREATE TABLE IF NOT EXISTS revision_logs (
        id text PRIMARY KEY NOT NULL,
        problem_id text NOT NULL,
        pattern_id text NOT NULL,
        mode text NOT NULL,
        question_prompt text NOT NULL,
        user_response text,
        is_correct integer DEFAULT 1,
        feedback text NOT NULL,
        timestamp text DEFAULT CURRENT_TIMESTAMP
      );
    `);

    return NextResponse.json({
      success: true,
      message: "PostgreSQL tables initialized successfully!",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Initialization failed" },
      { status: 500 }
    );
  } finally {
    await sql.end();
  }
}
