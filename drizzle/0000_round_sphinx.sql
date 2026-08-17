CREATE TABLE "rampage_audit_events" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" bigint,
	"event_type" text NOT NULL,
	"entity_type" text,
	"entity_id" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rampage_certificates" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"certificate_id" text NOT NULL,
	"user_id" bigint NOT NULL,
	"course_id" text NOT NULL,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completion_hash" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rampage_progress" (
	"user_id" bigint NOT NULL,
	"course_id" text NOT NULL,
	"lesson_id" text NOT NULL,
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "rampage_progress_user_id_course_id_lesson_id_pk" PRIMARY KEY("user_id","course_id","lesson_id")
);
--> statement-breakpoint
CREATE TABLE "rampage_reader_bookmarks" (
	"user_id" bigint NOT NULL,
	"resource_id" text NOT NULL,
	"page" integer NOT NULL,
	"label" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "rampage_reader_bookmarks_user_id_resource_id_page_pk" PRIMARY KEY("user_id","resource_id","page")
);
--> statement-breakpoint
CREATE TABLE "rampage_reader_highlights" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" bigint NOT NULL,
	"resource_id" text NOT NULL,
	"page" integer NOT NULL,
	"quote" text NOT NULL,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rampage_reader_state" (
	"user_id" bigint NOT NULL,
	"resource_id" text NOT NULL,
	"current_page" integer DEFAULT 1 NOT NULL,
	"progress_percent" numeric(5, 2) DEFAULT '0' NOT NULL,
	"note" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "rampage_reader_state_user_id_resource_id_pk" PRIMARY KEY("user_id","resource_id")
);
--> statement-breakpoint
CREATE TABLE "rampage_users" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"auth_open_id" text NOT NULL,
	"email" text,
	"name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"open_id" text NOT NULL,
	"name" text,
	"email" varchar(320),
	"login_method" varchar(64),
	"role" text DEFAULT 'user' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_signed_in" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "rampage_audit_user_created_idx" ON "rampage_audit_events" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "rampage_certificates_certificate_id_unique" ON "rampage_certificates" USING btree ("certificate_id");--> statement-breakpoint
CREATE UNIQUE INDEX "rampage_certificates_user_course_unique" ON "rampage_certificates" USING btree ("user_id","course_id");--> statement-breakpoint
CREATE INDEX "rampage_progress_user_idx" ON "rampage_progress" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "rampage_reader_highlights_user_resource_idx" ON "rampage_reader_highlights" USING btree ("user_id","resource_id");--> statement-breakpoint
CREATE UNIQUE INDEX "rampage_users_auth_open_id_unique" ON "rampage_users" USING btree ("auth_open_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_open_id_unique" ON "users" USING btree ("open_id");