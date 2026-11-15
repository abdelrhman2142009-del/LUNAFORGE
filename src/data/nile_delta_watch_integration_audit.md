# LUNAFORGE — Nile Delta Watch Integration Audit

**Branch:** `member-1-nile-delta-watch`  
**Audit status:** Implementation updated; GitHub Actions test and production-build checks passed on the feature branch  
**Scope:** Research data, runtime catalog, engineering calculations, Builder adapter, mission selection/briefing, simulation, tests, and documentation.

## Summary

Nile Delta Watch is now connected on this feature branch across mission selection, mission briefing, the engineering baseline, Builder resource checks, the simulation screen, and a mission-specific final evaluator.

The changes do not make LUNAFORGE a flight design tool. All orbit, average-generation conversion, subsystem duty cycle, camera cadence, and ground-contact assumptions remain educational game rules unless explicitly identified as source-backed reference values.

## Corrected engineering issues

### Solar generation and load were mixed

**Files:** `src/engine/componentsData.js`, `src/engine/missionEngine.js`, `src/components/Builder.jsx`

- Solar peak output is now kept separate from average generation.
- The two illustrative panel ratings remain 27.8 W peak and 57.6 W peak.
- The engine applies an explicit 0.72 gameplay factor to estimate average generation: 20.016 W and 41.472 W respectively.
- Selected subsystem active-power ratings are treated as load, with a separate 15% duty-cycle gameplay estimate added to the 12 W baseline average bus load.
- Solar output is excluded from subsystem consumption.
- Builder's live power check now uses the same average-generation and duty-cycle model as the engine.
- The 0.72 conversion and 15% duty-cycle values are assumptions for game balance, not orbital power-system calculations.

### Builder and engine data mapping

**Files:** `src/engine/engineAdapter.js`, `src/engine/componentsData.js`

- Builder component IDs map to the canonical runtime catalog.
- The adapter now returns the canonical selected components and mission metrics.
- Camera cadence is standardized to three synthetic scenes per day.
- Communication rate is represented in Mbps in the engine, with data capacity calculated in MB per assumed contact.
- The UI's displayed average generation/load and power margin now come from engine metrics rather than an independent peak-power comparison.

## Nile Delta Watch features implemented

### Mission profile and briefing

- `src/data/nile_delta_watch.json` is imported by `src/App.jsx`.
- Mission selection and briefing now identify Nile Delta Watch, the Nile Delta region, 500 km scenario altitude, 6U baseline, and seven fictional mission days.
- The briefing lists the three observation themes and the proposed mission targets.
- The seven-day fictional mission is separate from the accelerated 28-second UI timeline.

### Mission simulation and final report

**Files:** `src/simulation/missionObjectives.js`, `src/simulation/MissionSimulation.jsx`

- Observation phase records synthetic scenes for Rosetta/Damietta coast, Lake Manzala wetlands, and agricultural/urban transition, provided a camera and ADCS are selected.
- Mission evaluation totals generated, stored, queued, and transmitted data.
- The evaluator checks three observation areas, storage capacity, 80% downlink, and engineering feasibility.
- The final report lists objective status, data quantities, downlink percentage, and reasons for an incomplete mission.
- Game rule: one 10-minute ground contact per mission day. Capacity is calculated as Mbps × seconds ÷ 8 = decimal MB. No orbital access or radio-link physics are modeled.

## Mission data files

- `src/data/nile_delta_watch.json`: mission profile, component IDs, research-source metadata, simulation assumptions.
- `src/data/nile_delta_watch_research.md`: research basis and scientific limitations.
- `src/data/nile_delta_watch_requirements.md`: mission requirements and implementation status.
- `src/data/nile_delta_watch_glossary.json`: mission terminology.
- `src/data/mission_data.json`: older EarthWatch reference snapshot; not the runtime catalog.
- `src/data/nile_delta_watch_integration_audit.md`: this audit.

## Tests added

`tests/nile-delta-watch.integration.test.js` covers:
- Solar peak output versus estimated average generation.
- Exclusion of solar generation from subsystem load.
- A successful basic-camera mission scenario.
- No observation completion without both camera and ADCS.
- A failed downlink objective when contact capacity is insufficient.
- Mission component IDs resolving against the canonical runtime catalog.

Existing engineering and simulation tests remain in place. GitHub Actions completed successfully: `npm test` and `npm run build` both passed on the pull-request commit. The checks should run again for any subsequent code changes.

## Known limitations / review items

1. The average solar-generation factor (72%) and subsystem duty-cycle factor (15%) are gameplay assumptions and should be reviewed by the engineering owner.
2. The assumed 10-minute daily ground contact is not derived from an orbit/ground-station geometry model.
3. Three scenes per day is a gameplay cadence, not a revisit-time claim.
4. The camera has no verified ground sampling distance; do not display metres per pixel.
5. The simulation uses synthetic objective completion and does not process real Landsat/Sentinel imagery.
6. The old `src/components/MissionSimulation.jsx` remains as a legacy file; remove only after team confirmation.
7. The old EarthWatch catalog in `src/data/mission_data.json` is a reference snapshot. `src/engine/componentsData.js` remains the runtime source of truth.

## Final status

Implementation changes are committed to the feature branch. Do not merge to `main` until GitHub Actions tests/build pass and the team reviews shared-file ownership changes.
