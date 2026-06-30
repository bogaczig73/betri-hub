import { relations, sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * Shared member directory.
 * These people are reused across every app in the hub (lactate testing,
 * swimming sessions, etc.), so the table lives at the top level — not inside
 * any single app's namespace.
 */
export const members = pgTable(
  "members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    // Case-insensitive uniqueness keeps the autocomplete directory clean.
    uniqueIndex("members_name_lower_idx").on(sql`lower(${t.name})`),
  ],
);

/**
 * A lactate testing session. v1 supports running only (tempo = pace m:ss / km),
 * but `sport` is kept so other sports can be added later.
 */
export const lactateTests = pgTable("lactate_tests", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  sport: text("sport").notNull().default("run"),
  testDate: date("test_date").notNull().defaultNow(),
  location: text("location"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

/**
 * A member taking part in a specific test. Each participant has their own
 * series of measurements (their lactate curve).
 */
export const lactateParticipants = pgTable(
  "lactate_participants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    testId: uuid("test_id")
      .notNull()
      .references(() => lactateTests.id, { onDelete: "cascade" }),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "restrict" }),
    position: integer("position").notNull().default(0),
    // Resting/warm-up lactate (mmol/L) and the pace at which it was taken.
    // Used by the analysis engine for Bsln+ and the baseline-included fits.
    baselineLactate: numeric("baseline_lactate", { precision: 5, scale: 2 }),
    baselineTempoSeconds: integer("baseline_tempo_seconds"),
    // Whether to feed the baseline point into Log-log / LTP / LTratio fits.
    includeBaseline: boolean("include_baseline").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("lactate_participants_test_member_idx").on(
      t.testId,
      t.memberId,
    ),
    index("lactate_participants_test_idx").on(t.testId),
  ],
);

/**
 * A single reading for one participant at one stage of the step test.
 * - lactate: mmol/L, two decimals (e.g. 1.24)
 * - tempoSeconds: running pace, seconds per km (e.g. 342 = 5:42 /km)
 * - heartRate: optional bpm
 */
export const lactateMeasurements = pgTable(
  "lactate_measurements",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    participantId: uuid("participant_id")
      .notNull()
      .references(() => lactateParticipants.id, { onDelete: "cascade" }),
    stage: integer("stage").notNull().default(1),
    lactate: numeric("lactate", { precision: 5, scale: 2 }),
    tempoSeconds: integer("tempo_seconds"),
    heartRate: integer("heart_rate"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index("lactate_measurements_participant_idx").on(t.participantId)],
);

export const membersRelations = relations(members, ({ many }) => ({
  participations: many(lactateParticipants),
}));

export const lactateTestsRelations = relations(lactateTests, ({ many }) => ({
  participants: many(lactateParticipants),
}));

export const lactateParticipantsRelations = relations(
  lactateParticipants,
  ({ one, many }) => ({
    test: one(lactateTests, {
      fields: [lactateParticipants.testId],
      references: [lactateTests.id],
    }),
    member: one(members, {
      fields: [lactateParticipants.memberId],
      references: [members.id],
    }),
    measurements: many(lactateMeasurements),
  }),
);

export const lactateMeasurementsRelations = relations(
  lactateMeasurements,
  ({ one }) => ({
    participant: one(lactateParticipants, {
      fields: [lactateMeasurements.participantId],
      references: [lactateParticipants.id],
    }),
  }),
);

export type Member = typeof members.$inferSelect;
export type LactateTest = typeof lactateTests.$inferSelect;
export type LactateParticipant = typeof lactateParticipants.$inferSelect;
export type LactateMeasurement = typeof lactateMeasurements.$inferSelect;
