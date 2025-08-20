#
## Battery Health Dashboard

Simple Vue 3 + TypeScript app that analyzes one week of tablet battery readings to help field teams decide which schools to visit first.

### What It Does
- Loads local `battery.json` through a small service abstraction.
- Calculates a duration‑weighted average daily drain for every device.
- Ignores charging / increasing intervals entirely.
- Marks devices draining > 30% per day as Unhealthy (Unknown when not enough data).
- Groups and ranks schools by count of unhealthy devices.
- Lets you expand/collapse each school or toggle Expand All / Collapse All.
- Provides a Critical‑only filter (>= 30% drain) to focus on worst devices.
- Shows stat cards (unhealthy, healthy, schools to visit, overall label).
- Device tooltip with tier classification (Healthy <20, Warning <30, Critical ≥30, Unknown).
- Accessible aria-expanded buttons & keyboard‑friendly tables.
- Test suite covers core calc, aggregation edge, composable, service, components, snapshot + basic a11y.

### Core Algorithm (Quick View)
For each device: sort readings -> walk adjacent pairs -> keep only discharge intervals -> compute drain/day for each interval -> duration‑weight them. No valid interval = Unknown. Unhealthy if > 30.

### Key Files
```
src/utils/batteryCalc.ts      # calculateDeviceStat + aggregateBySchool
src/composables/useBatteryAnalysis.ts
src/components/SchoolList.vue # expandable schools + expand/collapse all
src/components/DeviceTable.vue# per‑device table + tooltip classification
src/tests/                    # vitest specs (logic, service, composables, components, a11y)
```

### Testing (Vitest + jsdom)
Included specs:
- batteryCalc: single reading, drain, charging ignored, empty aggregate edge.
- Service: returns array shape.
- Composable: success + error path (mocked service).
- Components: DeviceTable tiers + snapshot + axe (no violations), SchoolList expand/collapse interactions.

Run:
```bash
npm run test       # all tests
npm run test:ui    # interactive mode
```

### Run / Dev
```bash
npm install
npm run dev
```
Other scripts: `npm run build`, `npm run preview`, `npm run lint`, `npm run type-check`.

### Environment
`.env` -> `VITE_APP_BASE_PATH=/` (must be prefixed with `VITE_` for Vite exposure).

### Design Choices (Short List)
- Duration weighting avoids bias from dense sampling bursts.
- Charging intervals skipped for clarity (no partial adjustment).
- Null (Unknown) instead of 0 to distinguish “insufficient data”.
- Pure utility module enables isolated unit tests.
- Service layer allows later swap to real API.
- Simple Tailwind utility classes for speed.

### Current UX Features
- Ranked school table with percentage badges.
- Expand All / Collapse All toggle.
- Critical-only device filter.
- Sticky header, zebra striping, status badges.
- Tooltips with plain descriptive text (no charts—kept lean).

### Known Gaps / Future Ideas
- Charts for per‑device drain trends.
- Confidence score based on interval spread.
- Outlier / anomaly pruning.
- Larger dataset optimization (single global sort or worker).
- Export (CSV) and search/filter by academy.

### Quick Verification Checklist
- Tests green: `npm run test`.
- Opening app shows ranked schools and stat cards.
- Expand All expands; toggling again collapses.
- Critical filter narrows list to high-drain devices.
- Tooltips show tier + % when hovering a device.

### License
MIT (see `LICENSE`).

---
Focused on correctness, clarity, and easy extension; intentionally left advanced visuals and persistence for future iterations.
Lint & format:

```bash

