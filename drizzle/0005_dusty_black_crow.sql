CREATE TABLE "rampage_learner_preferences" (
	"user_id" bigint PRIMARY KEY NOT NULL,
	"goal" text DEFAULT 'Build a durable systems practice' NOT NULL,
	"weekly_target_minutes" integer DEFAULT 120 NOT NULL,
	"notifications_enabled" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "rampage_certificates" ADD COLUMN "public_record_id" text;--> statement-breakpoint
UPDATE "rampage_certificates" SET "public_record_id" = 'RMP-' || upper(substr(md5(random()::text || clock_timestamp()::text || id::text), 1, 20)) WHERE "public_record_id" IS NULL;--> statement-breakpoint
ALTER TABLE "rampage_certificates" ALTER COLUMN "public_record_id" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "rampage_certificates_public_record_id_unique" ON "rampage_certificates" USING btree ("public_record_id");