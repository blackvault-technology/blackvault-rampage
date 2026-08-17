CREATE TABLE "local_auth_tokens" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" bigint NOT NULL,
	"token_hash" text NOT NULL,
	"purpose" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"consumed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_verified_at" timestamp with time zone;--> statement-breakpoint
CREATE UNIQUE INDEX "local_auth_tokens_hash_unique" ON "local_auth_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "local_auth_tokens_user_purpose_idx" ON "local_auth_tokens" USING btree ("user_id","purpose");