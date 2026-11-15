# LUNAFORGE — Integration Contract

**Version:** 1.1  
**Maintainer:** Member 5 — Integration & Testing  
**Status:** Current-main-branch contract with open team decisions

This document records the interfaces visible in the current repository. If the team changes a path, unit, or function signature, update this contract in the same Pull Request.

## 1. Current repository ownership

| Area | Current path | Primary owner |
|---|---|---|
| React app and navigation | `src/App.jsx`, `src/main.jsx` | Member 2 |
| React screens and UI | `src/components/*` | Member 2; simulation ownership must be agreed with Member 4 |
| Research and glossary data | `src/data/*` | Member 1 |
| Component catalog and calculations | `src/engine/*` | Member 3 |
| Automated tests and integration docs | `tests/*`, `README.md`, this file | Member 5 |
| Simulation behavior | Currently embedded in `src/components/MissionSimulation.jsx` | Member 4 / Member 2 shared boundary — confirm with team |

### Observed structure differences

The original planning document proposed `src/simulation/*`, `src/data/missionData.js`, and `tests/*`. In the reviewed main branch:
- `MissionSimulation.jsx` is currently in `src/components/`, not `src/simulation/`.
- No `src/data/missionData.js` was found.
- The component catalog is currently `src/engine/componentsData.js`.
- An older compatibility test exists at the repository root as `integration.test.js`.

These are observations, not automatic instructions to move files. Agree on ownership and perform any refactor in a dedicated PR.

## 2. Units and naming

| Quantity | Current engine field / unit |
|---|---|
| Mass | `massKg` / kg |
| Peak or active power | `peakPowerW`, `activePowerW` / W |
| Average power generation | `averageGenerationW` / W |
| Average power load | `averageLoadW` / W |
| Battery energy | `energyWh`, `batteryEnergyWh` / Wh |
| Storage | `storageGb` / GB |
| Generated data | `dataPerDayMB`, `dataPerDayGB` |
| Orbit altitude | `orbitAltitudeKm` / km |
| In-game cost | `costCredits`, `budgetCredits` / credits |

**Important:** the current code uses game credits, not USD. The older contract's USD label is not consistent with the implementation. Do not convert or relabel credits as USD without a team-approved change.

Peak power and average power are different quantities. Battery energy in Wh is not the same quantity as battery capacity in Ah.

## 3. Data ownership and source of truth

- Member 1 owns scientific research and research/glossary content in `src/data/*`.
- Member 3 owns the engineering component catalog and calculation rules in `src/engine/*`.
- Member 2 owns the app shell and React presentation.
- Member 4 owns mission gameplay/simulation behavior, with the current component boundary agreed with Member 2.
- Member 5 maintains integration tests, project instructions, and this contract.

A value must be marked as a gameplay assumption unless a traceable source supports it. Never present an illustrative game parameter as a verified NASA or manufacturer specification.

## 4. Current engineering API

### Component catalog

File: `src/engine/componentsData.js`

Exports:
- `MISSION_BASELINE`
- `REQUIRED_CATEGORIES`
- `COMPONENT_CATALOG`
- `COMPONENTS_BY_ID`
- `getComponent(id)`

The engine's canonical component identifiers include values such as `camera_basic`, `solar_body_6u`, `battery_standard`, and `structure_6u`.

### Mission calculations

File: `src/engine/missionEngine.js`

- `calculateMission(selection, constraints?)` accepts component IDs or a selection object/array and returns mission metadata, metrics, constraints, violations, warnings, status, and feasibility.
- `getResourceStatus(mission)` converts mission metrics into resource status labels.
- `formatMetric(value, unit?)` formats a numeric value.
- `calculateResources(selectedComponents)` is a backward-compatible helper for simple totals.
- `validateMission(resources, mission?)` is a backward-compatible validator.

### Scoring

File: `src/engine/scoring.js`

- `calculateMissionScore(mission)` returns a weighted gameplay score, grade, component scores, weights, and a non-certification note.
- `calculateScore(validation)` is retained for compatibility with the original simple validation contract.

### What-If analysis

File: `src/engine/whatIf.js`

- `analyzeWhatIf(baseSelection, changedSelection, constraints?)` returns before/after mission results, metric deltas, changed component IDs, and an interpretation.
- `compareMissions(beforeMission, afterMission)` compares supported mission metrics.
- `runWhatIf(baseComponents, changedComponents)` is retained as a compatibility helper.

### React adapter

File: `src/engine/engineAdapter.js`

- `convertBuilderSelection(items)` maps Builder IDs to canonical engine IDs.
- `runEngineeringAnalysis(items)` returns mission, score, resource status, feasibility, violations, and warnings.
- `runEngineeringWhatIf(beforeItems, afterItems)` adapts Builder selections and runs What-If analysis.

**Rule:** React components should display engine results rather than reimplementing the same calculations.

## 5. Required integration behavior

The team should verify this flow end to end:

1. Builder presents selectable components.
2. Builder selection is passed to `runEngineeringAnalysis`.
3. The adapter maps Builder IDs to engine IDs.
4. The engine calculates resources and checks constraints.
5. The UI displays the returned metrics, status, warnings, and score.
6. What-If comparison uses the same engine and reports deltas.
7. The simulation receives the selected configuration and its required derived values.
8. The final mission report reflects the simulation outcome.

## 6. Test and build commands

```bash
npm install
npm test
npm run build
```

Vitest tests belong under `tests/` or use the supported Vitest test filename pattern. A passing unit test suite does not by itself prove that the complete browser workflow works; the team must also run the manual demo checklist.

## 7. Pull Request rules

- Each member works on a feature branch.
- PRs describe purpose, changed files, and checks run.
- A second team member reviews the PR.
- Do not merge with unresolved conflicts or failing required checks.
- Do not merge a PR merely because GitHub reports it is mergeable; run tests and build.
- Avoid parallel edits to `src/App.jsx`, `package.json`, or shared engine interfaces.

## 8. Open decisions before final submission

- Confirm Member 2 / Member 4 ownership of `MissionSimulation.jsx`.
- Decide whether to introduce a separate `src/simulation/` module.
- Decide whether mission briefing data should move into a dedicated data module.
- Confirm that the game economy intentionally uses credits rather than USD.
- Ensure each research-backed catalog value has a source and each simplified value is labeled as an assumption.
- Confirm whether the `simulation` branch contains work that should be submitted through a PR.

## 9. Scope and limitations

LUNAFORGE is an educational game using simplified assumptions. Its calculations and simulation are not suitable for building, operating, or certifying real spacecraft.
