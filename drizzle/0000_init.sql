CREATE TABLE "lactate_measurements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"participant_id" uuid NOT NULL,
	"stage" integer DEFAULT 1 NOT NULL,
	"lactate" numeric(5, 2),
	"tempo_seconds" integer,
	"heart_rate" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lactate_participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"test_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lactate_tests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"sport" text DEFAULT 'run' NOT NULL,
	"test_date" date DEFAULT now() NOT NULL,
	"location" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "lactate_measurements" ADD CONSTRAINT "lactate_measurements_participant_id_lactate_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."lactate_participants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lactate_participants" ADD CONSTRAINT "lactate_participants_test_id_lactate_tests_id_fk" FOREIGN KEY ("test_id") REFERENCES "public"."lactate_tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lactate_participants" ADD CONSTRAINT "lactate_participants_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "lactate_measurements_participant_idx" ON "lactate_measurements" USING btree ("participant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "lactate_participants_test_member_idx" ON "lactate_participants" USING btree ("test_id","member_id");--> statement-breakpoint
CREATE INDEX "lactate_participants_test_idx" ON "lactate_participants" USING btree ("test_id");--> statement-breakpoint
CREATE UNIQUE INDEX "members_name_lower_idx" ON "members" USING btree (lower("name"));