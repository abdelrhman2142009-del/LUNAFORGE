# LUNAFORGE — Integration and Release Checklist

Use this checklist during the final team integration. Mark an item complete only after performing the check and recording the result.

## Repository and collaboration
- [ ] Each member has a named responsibility and agreed file ownership.
- [x] Each member works on a feature branch.
- [x] Member 5 integration work is submitted as Pull Request #2.
- [ ] A second member reviews each PR. Member 2 review is requested and pending.
- [x] No unresolved merge conflicts are reported for PR #2 (GitHub reports it mergeable).
- [x] Member 4's complete simulation package has been received and compared with the integrated files.

## Data and interfaces
- [ ] Every component has a unique canonical ID.
- [x] Builder IDs map to valid engine IDs in the adapter.
- [ ] Mass uses kg.
- [ ] Power values use W, with peak and average power clearly distinguished.
- [ ] Battery energy uses Wh.
- [ ] Storage uses GB.
- [ ] In-game cost is consistently labelled as credits.
- [ ] Research-backed values have traceable sources.
- [x] Gameplay assumptions are visibly labelled as assumptions.

## Engineering and simulation
- [x] Builder selections reach the engineering adapter.
- [x] Mission calculations return metrics, warnings, violations, and status.
- [x] The UI displays engine results through the integration adapter.
- [x] What-If comparisons show component and metric changes in automated tests.
- [ ] Simulation receives every intended spacecraft configuration input.
- [ ] Data collection respects storage limits in the full UI workflow.
- [ ] Data downlink respects the configured transmission rate in the full UI workflow.
- [ ] The final simulation report matches the recorded simulation state.

## Automated checks
- [x] Dependency installation completes successfully.
- [x] `package-lock.json` is committed for reproducible installs.
- [x] `npm test` passes in GitHub Actions.
- [x] `npm run build` passes in GitHub Actions.
- [x] CI is green on the latest PR commit (run #50).
- [x] Dependency audit reports zero vulnerabilities in the latest artifact.

Latest CI run: https://github.com/abdelrhman2142009-del/LUNAFORGE/actions/runs/43741165578

## Manual browser demo — still pending
- [ ] Start the app using `npm run dev`.
- [ ] Home screen loads without a browser-console error.
- [ ] Mission selection and briefing work.
- [ ] Builder opens and component selection works.
- [ ] Analysis displays the selected components and engineering results.
- [ ] Simulation starts and phases advance.
- [ ] Pause, resume, and restart work.
- [ ] Scenario events update the simulation display.
- [ ] Back navigation returns from Simulation to Analysis.
- [ ] The app layout is usable at the presentation screen size.

## Final submission
- [x] README explains installation and usage.
- [x] Integration contract documents the interface.
- [ ] Scientific references are included and checked.
- [ ] Presentation is proofread and matches the working app.
- [ ] Demo is rehearsed on the presentation laptop.
- [ ] A backup screen recording or screenshots are ready.
