ALTER TABLE "rampage_lesson_state" ADD COLUMN "source_complete" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "rampage_lesson_state" ADD COLUMN "lab_complete" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "rampage_lesson_state" ADD COLUMN "evidence_complete" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "rampage_lesson_state" ADD COLUMN "evidence_note" text;