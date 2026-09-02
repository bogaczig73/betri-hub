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
      it. All three merges on 2026-09-02 went through on the build alone.
      Smallest honest fix is a stdlib `node --test` over the pure lactate math
      in `src/lib/lactate/` — no framework, no dependency.
- [ ] Decide LactateChart's x-axis (S, product decision) — it plots stage *index*
      while the other two charts plot intensity, so its curve is subtly
      distorted relative to them. Deliberately left alone on 2026-09-02 because
      changing it alters the meaning of the chart on the busiest screen. Either
      switch it to intensity or write down why stages are right for a data-entry
      preview.
- [ ] LactateChart label/gridline collision (S, cosmetic, known trait) — a
      reading between roughly 49% and 56% of the test's peak lands where the
      middle gridline crosses its own value label. Only affects LactateChart,
      the one chart that prints a value above each point. Headroom cannot fix it
      (points and gridlines scale together); the real fix is per-label collision
      avoidance, judged not worth writing for a 320x180 preview. Revisit only if
      a coach actually reports it.
