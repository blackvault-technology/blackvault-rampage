CREATE TABLE "rampage_xp_ledger" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" bigint NOT NULL,
	"event_key" text NOT NULL,
	"amount" integer NOT NULL,
	"source_type" text NOT NULL,
	"source_id" text NOT NULL,
	"course_id" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "rampage_xp_event_unique" ON "rampage_xp_ledger" USING btree ("user_id","event_key");--> statement-breakpoint
CREATE INDEX "rampage_xp_user_created_idx" ON "rampage_xp_ledger" USING btree ("user_id","created_at");