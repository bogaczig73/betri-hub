"use server";

import { sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db, members } from "@/lib/db";

const nameSchema = z.string().trim().min(1).max(80);

/** Find a member by case-insensitive name, creating one if needed. */
export async function findOrCreateMember(name: string) {
  const clean = nameSchema.parse(name);

  const existing = await db
    .select()
    .from(members)
    .where(sql`lower(${members.name}) = lower(${clean})`)
    .limit(1);
  if (existing[0]) return existing[0];

  const [created] = await db
    .insert(members)
    .values({ name: clean })
    .onConflictDoNothing()
    .returning();
  if (created) return created;

  // Lost a race — re-read the row the other writer created.
  const [again] = await db
    .select()
    .from(members)
    .where(sql`lower(${members.name}) = lower(${clean})`)
    .limit(1);
  return again;
}

export async function createMember(name: string) {
  const member = await findOrCreateMember(name);
  revalidatePath("/members");
  revalidatePath("/");
  return member;
}
