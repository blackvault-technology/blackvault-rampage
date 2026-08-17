CREATE TABLE "rampage_assessment_attempts" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" bigint NOT NULL,
	"course_id" text NOT NULL,
	"attempt_number" integer NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"passed" integer DEFAULT 0 NOT NULL,
	"answers" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"question_order" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"integrity" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"submitted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "rampage_chapter_completions" (
	"user_id" bigint NOT NULL,
	"course_id" text NOT NULL,
	"chapter_id" text NOT NULL,
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "rampage_chapter_completions_user_id_course_id_chapter_id_pk" PRIMARY KEY("user_id","course_id","chapter_id")
);
--> statement-breakpoint
CREATE TABLE "rampage_lesson_state" (
	"user_id" bigint NOT NULL,
	"course_id" text NOT NULL,
	"lesson_id" text NOT NULL,
	"current_second" integer DEFAULT 0 NOT NULL,
	"duration_second" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "rampage_lesson_state_user_id_course_id_lesson_id_pk" PRIMARY KEY("user_id","course_id","lesson_id")
);
--> statement-breakpoint
CREATE TABLE "rampage_quiz_attempts" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" bigint NOT NULL,
	"course_id" text NOT NULL,
	"chapter_id" text NOT NULL,
	"lesson_id" text NOT NULL,
	"attempt_number" integer NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"passed" integer DEFAULT 0 NOT NULL,
	"answers" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"integrity" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"submitted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE INDEX "rampage_assessment_attempts_user_course_idx" ON "rampage_assessment_attempts" USING btree ("user_id","course_id","started_at");--> statement-breakpoint
CREATE INDEX "rampage_lesson_state_user_idx" ON "rampage_lesson_state" USING btree ("user_id","updated_at");--> statement-breakpoint
CREATE INDEX "rampage_quiz_attempts_user_course_idx" ON "rampage_quiz_attempts" USING btree ("user_id","course_id","chapter_id");