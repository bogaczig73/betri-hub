"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { findOrCreateMember } from "@/app/members/actions";
import {
  db,
  lactateMeasurements,
  lactateParticipants,
  lactateTests,
} from "@/lib/db";
import { formatDate } from "@/lib/format";

// ---------- Tests ----------

const createTestSchema = z.object({
  // Name is optional — defaults to the test date so "New test → Create" works
  // with zero typing.
  title: z.string().trim().max(120).optional(),
  testDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  location: z.string().trim().max(120).optional(),
  notes: z.string().trim().max(500).optional(),
});

export type CreateTestState = { error?: string };

export async function createTest(
  _prev: CreateTestState,
  formData: FormData,
): Promise<CreateTestState> {
  const parsed = createTestSchema.safeParse({
    title: formData.get("title") || undefined,
    testDate: formData.get("testDate") || undefined,
    location: formData.get("location") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check the form." };
  }
  const data = parsed.data;

  const testDate = data.testDate ?? new Date().toISOString().slice(0, 10);
  const title = data.title?.trim() || formatDate(testDate) || "New test";

  const [test] = await db
    .insert(lactateTests)
    .values({
      title,
      testDate,
      location: data.location || null,
      notes: data.notes || null,
    })
    .returning({ id: lactateTests.id });

  revalidatePath("/lactate");
  redirect(`/lactate/${test.id}`);
}

export async function deleteTest(testId: string) {
  await db.delete(lactateTests).where(eq(lactateTests.id, testId));
  revalidatePath("/lactate");
  redirect("/lactate");
}

// ---------- Participants ----------

export async function addParticipantByName(testId: string, name: string) {
  const member = await findOrCreateMember(name);
  if (!member) throw new Error("Could not create member");
  return addParticipant(testId, member.id);
}

export async function addParticipant(testId: string, memberId: string) {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(lactateParticipants)
    .where(eq(lactateParticipants.testId, testId));

  await db
    .insert(lactateParticipants)
    .values({ testId, memberId, position: count })
    .onConflictDoNothing();

  revalidatePath(`/lactate/${testId}`);
}

export async function removeParticipant(participantId: string, testId: string) {
  await db
    .delete(lactateParticipants)
    .where(eq(lactateParticipants.id, participantId));
  revalidatePath(`/lactate/${testId}`);
}

const baselineSchema = z.object({
  baselineLactate: z.number().min(0).max(40).nullable(),
  baselineTempoSeconds: z.number().int().min(0).max(36000).nullable(),
  includeBaseline: z.boolean(),
});

export async function setParticipantBaseline(
  participantId: string,
  testId: string,
  input: z.input<typeof baselineSchema>,
) {
  const data = baselineSchema.parse(input);
  await db
    .update(lactateParticipants)
    .set({
      baselineLactate:
        data.baselineLactate != null ? data.baselineLactate.toFixed(2) : null,
      baselineTempoSeconds: data.baselineTempoSeconds,
      includeBaseline: data.includeBaseline,
    })
    .where(eq(lactateParticipants.id, participantId));
  revalidatePath(`/lactate/${testId}`);
}

// ---------- Measurements ----------

const measurementSchema = z.object({
  lactate: z.number().min(0).max(40).nullable().optional(),
  tempoSeconds: z.number().int().min(0).max(36000).nullable().optional(),
  heartRate: z.number().int().min(20).max(260).nullable().optional(),
});

export async function addMeasurement(
  participantId: string,
  testId: string,
  input: z.input<typeof measurementSchema>,
) {
  const data = measurementSchema.parse(input);

  const [{ maxStage }] = await db
    .select({ maxStage: sql<number>`coalesce(max(${lactateMeasurements.stage}), 0)::int` })
    .from(lactateMeasurements)
    .where(eq(lactateMeasurements.participantId, participantId));

  await db.insert(lactateMeasurements).values({
    participantId,
    stage: maxStage + 1,
    lactate: data.lactate != null ? data.lactate.toFixed(2) : null,
    tempoSeconds: data.tempoSeconds ?? null,
    heartRate: data.heartRate ?? null,
  });

  revalidatePath(`/lactate/${testId}`);
}

export async function updateMeasurement(
  measurementId: string,
  testId: string,
  input: z.input<typeof measurementSchema>,
) {
  const data = measurementSchema.parse(input);
  await db
    .update(lactateMeasurements)
    .set({
      lactate: data.lactate != null ? data.lactate.toFixed(2) : null,
      tempoSeconds: data.tempoSeconds ?? null,
      heartRate: data.heartRate ?? null,
    })
    .where(eq(lactateMeasurements.id, measurementId));
  revalidatePath(`/lactate/${testId}`);
}

export async function deleteMeasurement(measurementId: string, testId: string) {
  await db
    .delete(lactateMeasurements)
    .where(eq(lactateMeasurements.id, measurementId));
  revalidatePath(`/lactate/${testId}`);
}
