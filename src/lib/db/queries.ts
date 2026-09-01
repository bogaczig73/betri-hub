import "server-only";

import { asc, desc, eq, sql } from "drizzle-orm";

import { db } from "./index";
import {
  lactateMeasurements,
  lactateParticipants,
  lactateTests,
  members,
} from "./schema";

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

/** Lightweight id+name directory — small enough to filter on the client. */
export async function listMembers() {
  return db
    .select({ id: members.id, name: members.name })
    .from(members)
    .orderBy(asc(members.name));
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

/**
 * One athlete's whole lactate history: every test they took part in, newest
 * first, each with its own measurement series. Drives the history chart, where
 * one test = one line.
 */
export async function getMemberHistory(memberId: string) {
  // memberId comes straight off the URL; a non-uuid makes Postgres raise
  // 22P02, and there is no error boundary, so it would 500 instead of 404.
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      memberId,
    )
  ) {
    return null;
  }

  const member = await db.query.members.findFirst({
    where: eq(members.id, memberId),
  });
  if (!member) return null;

  const participations = await db.query.lactateParticipants.findMany({
    where: eq(lactateParticipants.memberId, memberId),
    with: {
      test: true,
      measurements: { orderBy: [asc(lactateMeasurements.stage)] },
    },
  });

  // Newest test first — sorting here rather than in SQL keeps the nested
  // `with` query in one round trip.
  participations.sort(
    (a, b) =>
      b.test.testDate.localeCompare(a.test.testDate) ||
      b.test.createdAt.getTime() - a.test.createdAt.getTime(),
  );

  return { member, participations };
}

export type MemberHistory = NonNullable<
  Awaited<ReturnType<typeof getMemberHistory>>
>;

export type TestDetail = NonNullable<Awaited<ReturnType<typeof getTestDetail>>>;
export type TestListItem = Awaited<ReturnType<typeof listTests>>[number];
export type MemberSuggestion = Awaited<
  ReturnType<typeof listMembers>
>[number];
