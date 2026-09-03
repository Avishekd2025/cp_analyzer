CREATE TABLE "mastery_records" (
	"id" text PRIMARY KEY NOT NULL,
	"pattern_id" text NOT NULL,
	"exposure_count" integer DEFAULT 0,
	"variation_coverage" integer DEFAULT 0,
	"combination_coverage" integer DEFAULT 0,
	"revision_score" integer DEFAULT 0,
	"last_revised_at" text
);
--> statement-breakpoint
CREATE TABLE "pattern_aliases" (
	"id" text PRIMARY KEY NOT NULL,
	"pattern_id" text NOT NULL,
	"alias" text NOT NULL,
	CONSTRAINT "pattern_aliases_alias_unique" UNIQUE("alias")
);
--> statement-breakpoint
CREATE TABLE "patterns" (
	"id" text PRIMARY KEY NOT NULL,
	"technique_id" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"core_idea" text NOT NULL,
	"mental_model" text NOT NULL,
	"real_life_analogy" text NOT NULL,
	"discovery_flow" text NOT NULL,
	"recognition_signals" text NOT NULL,
	"standard_approach" text NOT NULL,
	"why_it_works_proof" text NOT NULL,
	"why_not_others" text NOT NULL,
	"common_mistakes" text NOT NULL,
	"implementation_insights" text NOT NULL,
	"rarity_tier" text DEFAULT 'COMMON' NOT NULL,
	"used_count" integer DEFAULT 0,
	"created_at" text DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "patterns_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "problem_knowledge" (
	"id" text PRIMARY KEY NOT NULL,
	"problem_id" text NOT NULL,
	"primary_pattern_id" text NOT NULL,
	"secondary_technique_ids" text NOT NULL,
	"key_observation" text NOT NULL,
	"why_this_approach" text NOT NULL,
	"safe_decision_proof" text NOT NULL,
	"variation_id" text,
	"implementation_techniques" text NOT NULL,
	"common_traps" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "problems" (
	"id" text PRIMARY KEY NOT NULL,
	"contest_id" integer NOT NULL,
	"index" text NOT NULL,
	"name" text NOT NULL,
	"rating" integer,
	"tags" text NOT NULL,
	"problem_url" text NOT NULL,
	"solved_at" integer NOT NULL,
	"created_at" text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "representative_problems" (
	"id" text PRIMARY KEY NOT NULL,
	"pattern_id" text NOT NULL,
	"problem_id" text NOT NULL,
	"progression_tier" integer NOT NULL,
	"progression_label" text NOT NULL,
	"why_representative" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "revision_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"problem_id" text NOT NULL,
	"pattern_id" text NOT NULL,
	"mode" text NOT NULL,
	"question_prompt" text NOT NULL,
	"user_response" text,
	"is_correct" integer DEFAULT 1,
	"feedback" text NOT NULL,
	"timestamp" text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "segment_problems" (
	"id" text PRIMARY KEY NOT NULL,
	"segment_id" text NOT NULL,
	"problem_id" text NOT NULL,
	"solved_at" integer NOT NULL,
	"order_in_segment" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "segments" (
	"id" text PRIMARY KEY NOT NULL,
	"segment_number" integer NOT NULL,
	"start_problem_idx" integer NOT NULL,
	"end_problem_idx" integer NOT NULL,
	"total_problems" integer DEFAULT 200 NOT NULL,
	"new_concepts_count" integer DEFAULT 0,
	"repeated_concepts_count" integer DEFAULT 0,
	"new_variations_count" integer DEFAULT 0,
	"uncommon_ideas_count" integer DEFAULT 0,
	"new_combinations_count" integer DEFAULT 0,
	"summary_notes" text,
	"created_at" text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "solution_evidence" (
	"id" text PRIMARY KEY NOT NULL,
	"problem_id" text NOT NULL,
	"source_type" text NOT NULL,
	"editorial_url" text,
	"editorial_snippet" text,
	"author" text,
	"raw_reference" text,
	"created_at" text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "submissions" (
	"id" integer PRIMARY KEY NOT NULL,
	"problem_id" text NOT NULL,
	"verdict" text NOT NULL,
	"language" text NOT NULL,
	"passed_test_count" integer DEFAULT 0,
	"time_consumed_millis" integer DEFAULT 0,
	"memory_consumed_bytes" integer DEFAULT 0,
	"submission_time" integer NOT NULL,
	"code_snippet" text
);
--> statement-breakpoint
CREATE TABLE "technique_combinations" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"technique_a_id" text NOT NULL,
	"technique_b_id" text NOT NULL,
	"rationale" text NOT NULL,
	"role_a" text NOT NULL,
	"role_b" text NOT NULL,
	"emergence_clue" text NOT NULL,
	"representative_problem_id" text,
	"frequency" integer DEFAULT 1
);
--> statement-breakpoint
CREATE TABLE "techniques" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	"color" text NOT NULL,
	"icon" text NOT NULL,
	"commonality" text DEFAULT 'COMMON' NOT NULL,
	CONSTRAINT "techniques_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "user_solved_problems" (
	"id" text PRIMARY KEY NOT NULL,
	"user_handle" text NOT NULL,
	"contest_id" integer NOT NULL,
	"index" text NOT NULL,
	"problem_id" text NOT NULL,
	"name" text NOT NULL,
	"rating" integer,
	"tags" text NOT NULL,
	"problem_url" text NOT NULL,
	"solved_at" integer NOT NULL,
	"submission_id" integer,
	"language" text,
	"is_analyzed" integer DEFAULT 0,
	"primary_pattern_id" text,
	"created_at" text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text,
	"name" text NOT NULL,
	"avatar_url" text,
	"codeforces_handle" text NOT NULL,
	"rating" integer DEFAULT 0,
	"max_rating" integer DEFAULT 0,
	"rank" text DEFAULT 'unrated',
	"total_solved" integer DEFAULT 0,
	"total_analyzed" integer DEFAULT 0,
	"last_synced_at" text,
	"created_at" text DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "users_codeforces_handle_unique" UNIQUE("codeforces_handle")
);
--> statement-breakpoint
CREATE TABLE "variations" (
	"id" text PRIMARY KEY NOT NULL,
	"pattern_id" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text NOT NULL,
	"constraint_context" text NOT NULL,
	"representative_problem_id" text
);
--> statement-breakpoint
CREATE TABLE "verification_records" (
	"id" text PRIMARY KEY NOT NULL,
	"problem_id" text NOT NULL,
	"status" text NOT NULL,
	"confidence_score" integer DEFAULT 100 NOT NULL,
	"algorithm_crosscheck" text,
	"complexity_verified" text,
	"correctness_reasoning" text,
	"verified_at" text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
ALTER TABLE "mastery_records" ADD CONSTRAINT "mastery_records_pattern_id_patterns_id_fk" FOREIGN KEY ("pattern_id") REFERENCES "public"."patterns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pattern_aliases" ADD CONSTRAINT "pattern_aliases_pattern_id_patterns_id_fk" FOREIGN KEY ("pattern_id") REFERENCES "public"."patterns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patterns" ADD CONSTRAINT "patterns_technique_id_techniques_id_fk" FOREIGN KEY ("technique_id") REFERENCES "public"."techniques"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "problem_knowledge" ADD CONSTRAINT "problem_knowledge_problem_id_problems_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problems"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "problem_knowledge" ADD CONSTRAINT "problem_knowledge_primary_pattern_id_patterns_id_fk" FOREIGN KEY ("primary_pattern_id") REFERENCES "public"."patterns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "representative_problems" ADD CONSTRAINT "representative_problems_pattern_id_patterns_id_fk" FOREIGN KEY ("pattern_id") REFERENCES "public"."patterns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "representative_problems" ADD CONSTRAINT "representative_problems_problem_id_problems_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problems"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revision_logs" ADD CONSTRAINT "revision_logs_problem_id_problems_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problems"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "revision_logs" ADD CONSTRAINT "revision_logs_pattern_id_patterns_id_fk" FOREIGN KEY ("pattern_id") REFERENCES "public"."patterns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "segment_problems" ADD CONSTRAINT "segment_problems_segment_id_segments_id_fk" FOREIGN KEY ("segment_id") REFERENCES "public"."segments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "segment_problems" ADD CONSTRAINT "segment_problems_problem_id_problems_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problems"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solution_evidence" ADD CONSTRAINT "solution_evidence_problem_id_problems_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problems"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_problem_id_problems_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problems"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "technique_combinations" ADD CONSTRAINT "technique_combinations_technique_a_id_techniques_id_fk" FOREIGN KEY ("technique_a_id") REFERENCES "public"."techniques"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "technique_combinations" ADD CONSTRAINT "technique_combinations_technique_b_id_techniques_id_fk" FOREIGN KEY ("technique_b_id") REFERENCES "public"."techniques"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variations" ADD CONSTRAINT "variations_pattern_id_patterns_id_fk" FOREIGN KEY ("pattern_id") REFERENCES "public"."patterns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_records" ADD CONSTRAINT "verification_records_problem_id_problems_id_fk" FOREIGN KEY ("problem_id") REFERENCES "public"."problems"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "user_problem_unique_idx" ON "user_solved_problems" USING btree ("user_handle","contest_id","index");--> statement-breakpoint
CREATE INDEX "user_handle_idx" ON "user_solved_problems" USING btree ("user_handle");--> statement-breakpoint
CREATE INDEX "is_analyzed_idx" ON "user_solved_problems" USING btree ("is_analyzed");