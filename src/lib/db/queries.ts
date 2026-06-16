import "server-only";

import { and, asc, desc, eq, ilike, notInArray, sql } from "drizzle-orm";

import { db } from "./index";
import { lactateParticipants, lactateTests, members } from "./schema";

export async function countMembers(): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(members);
  return row?.count ?? 0;
}

export async function countTests(): Promise<number> {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(lactateTests);
  return row?.count ?? 0;
}

export async function searchMembers(query: string, excludeIds: string[] = []) {
  const q = query.trim();
  const where = q
    ? and(
        ilike(members.name, `%${q}%`),
        excludeIds.length ? notInArray(members.id, excludeIds) : undefined,
      )
    : excludeIds.length
      ? notInArray(members.id, excludeIds)
      : undefined;

  return db
    .select({ id: members.id, name: members.name })
    .from(members)
    .where(where)
    .orderBy(asc(members.name))
    .limit(50);
}

export async function listMembersWithCounts() {
  return db
    .select({
      id: members.id,
      name: members.name,
      testCount: sql<number>`count(${lactateParticipants.id})::int`,
    })
    .from(members)
    .leftJoin(
      lactateParticipants,
      eq(lactateParticipants.memberId, members.id),
    )
    .groupBy(members.id, members.name)
    .orderBy(asc(members.name));
}

export async function listTests() {
  return db.query.lactateTests.findMany({
    orderBy: [desc(lactateTests.testDate), desc(lactateTests.createdAt)],
    with: {
      participants: {
        orderBy: [asc(lactateParticipants.position)],
        with: { member: true },
      },
    },
  });
}

export async function getTestDetail(testId: string) {
  return db.query.lactateTests.findFirst({
    where: eq(lactateTests.id, testId),
    with: {
      participants: {
        orderBy: [
          asc(lactateParticipants.position),
          asc(lactateParticipants.createdAt),
        ],
        with: {
          member: true,
          measurements: true,
        },
      },
    },
  });
}

export type TestDetail = NonNullable<Awaited<ReturnType<typeof getTestDetail>>>;
export type TestListItem = Awaited<ReturnType<typeof listTests>>[number];
export type MemberSuggestion = Awaited<
  ReturnType<typeof searchMembers>
>[number];
