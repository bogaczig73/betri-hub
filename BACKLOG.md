# BACKLOG — betri-hub

Radim owns the order. Unchecked `- [ ]` items feed `/plan-session`.

## Unranked — parked, pull up when you want them

- [ ] Authentication (L) — the app is currently wide open: every test, participant
      and measurement is readable by anyone with the URL. Deliberate, see
      `~/_hq/DECISIONS.md` D-002 (2026-09-02): not needed now, kept as a future
      feature. Whoever picks this up should treat `/members/[memberId]` and
      `/lactate/[testId]` as the two pages that most want gating.
- [ ] Fill in `test_cmd` (S) — `project.yaml` has none, so the HQ merge gate's
      "tests exit 0" leg cannot be satisfied and `pnpm build` is standing in for
      it. Smallest honest fix is a stdlib `node --test` over the pure lactate
      math in `src/lib/lactate/`.
