ALTER TABLE "lactate_participants" ADD COLUMN "baseline_lactate" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "lactate_participants" ADD COLUMN "baseline_tempo_seconds" integer;--> statement-breakpoint
ALTER TABLE "lactate_participants" ADD COLUMN "include_baseline" boolean DEFAULT false NOT NULL;