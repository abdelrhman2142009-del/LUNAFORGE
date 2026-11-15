# LUNAFORGE — Integration and Release Checklist

Use this checklist during the final team integration. Mark an item complete only after performing the check and recording the result.

## Repository and collaboration
- [ ] Each member has a named responsibility and agreed file ownership.
- [ ] Each member works on a feature branch.
- [ ] Each completed task is submitted as a Pull Request.
- [ ] A second member reviews each PR.
- [ ] No unresolved merge conflicts remain.
- [ ] The team has agreed on the current file structure and simulation ownership.

## Data and interfaces
- [ ] Every component has a unique canonical ID.
- [ ] Builder IDs map to valid engine IDs.
- [ ] Mass uses kg.
- [ ] Power values use W, with peak and average power clearly distinguished.
- [ ] Battery energy uses Wh.
- [ ] Storage uses GB.
- [ ] In-game cost is consistently labelled as credits.
- [ ] Research-backed values have traceable sources.
- [ ] Gameplay assumptions are visibly labelled as assumptions.

## Engineering and simulation
- [ ] Builder selections reach the engineering adapter.
- [ ] Mission calculations return metrics, warnings, violations, and status.
- [ ] The UI displays engine results without duplicating calculation logic.
- [ ] What-If comparisons show the expected component and metric changes.
- [ ] Simulation receives the intended spacecraft configuration.
- [ ] Data collection respects storage limits.
- [ ] Data downlink respects the configured transmission rate.
- [ ] The final simulation report matches the recorded simulation state.

## Automated checks
- [ ] `npm install` completes successfully.
- [ ] `npm test` passes.
- [ ] `npm run build` passes.
- [ ] CI is green on the final PR.
- [ ] Any failing or skipped test is documented and assigned.

## Manual browser demo
- [ ] Start the app using `npm run dev`.
- [ ] Home screen loads without a browser-console error.
- [ ] Mission selection and briefing work.
- [ ] Builder opens and component selection works.
- [ ] Analysis displays the selected components and engineering results.
- [ ] Simulation starts and phases advance.
- [ ] Data collection and transmission controls work.
- [ ] Final report appears and reset works.
- [ ] The app layout is usable at the presentation screen size.

## Final submission
- [ ] README explains installation and usage.
- [ ] Integration contract matches the actual code.
- [ ] Scientific references are included.
- [ ] Presentation is proofread and matches the working app.
- [ ] Demo is rehearsed on the presentation laptop.
- [ ] A backup screen recording or screenshots are ready.
