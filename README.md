# Betri Hub

A phone-first web app for the **Betri triathlon group** — a hub that collects
small, focused apps for the team. Members are shared across every app, so the
people you add in one tool show up in the next.

The first app is **Lactate Testing**: create a testing session, add athletes,
and record their lactate / pace / heart-rate curves.

## Stack

- **Next.js 16** (App Router, React 19) + **TypeScript**
- **Tailwind CSS v4** — mobile-first design system (orange / green athletic theme)
- **Drizzle ORM** on **Neon** Postgres (`@neondatabase/serverless` HTTP driver)
- **Vercel** hosting (public — no login)

## Features

- **Hub home** — launcher for the apps, with live counts.
- **Lactate Testing**
  - Create tests (name, date, location, notes).
  - Add athletes with **type-ahead** over the shared member directory, or create
    a new athlete inline.
  - Record measurements with two input styles:
    - **Keypad** with auto-format — type `124` → `1.24` mmol/L, type `542` → `5:42` /km.
    - **Circular dial** (iPhone-style) for quick approximate values.
  - Per-athlete **lactate curve** chart.
- **Members** — shared directory used by every app.

## Local development

```bash
pnpm install
cp .env.example .env.local   # then fill in the values
pnpm db:push                 # create tables in your Neon database
pnpm dev                     # http://localhost:3000
```

### Environment variables

| Variable       | Description                        |
| -------------- | --------------------------------- |
| `DATABASE_URL` | Neon **pooled** connection string.|

## Database

The schema lives in [`src/lib/db/schema.ts`](src/lib/db/schema.ts):

- `members` — shared people directory (case-insensitive unique name).
- `lactate_tests` → `lactate_participants` → `lactate_measurements`.

Workflow:

```bash
pnpm db:generate   # generate a SQL migration from schema changes
pnpm db:push       # push the schema straight to the database
pnpm db:studio     # browse data in Drizzle Studio
```

## Deployment (Vercel)

Set `DATABASE_URL` as an environment variable in the Vercel project, then
deploy. The build command is the default `next build`. The site is public
(no login).

## Adding another app

1. Add a route under `src/app/<app-name>/`.
2. Reuse the shared `members` table and the `searchMembersAction` type-ahead.
3. Add a card to the `apps` list in [`src/app/page.tsx`](src/app/page.tsx).
