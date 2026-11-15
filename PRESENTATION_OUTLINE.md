# LUNAFORGE — Presentation Outline

Use this as the content source for the final slide deck. Replace team-member placeholders with confirmed names and use screenshots from the actual running app.

## Slide 1 — Title
**LUNAFORGE**  
An Educational Space-Engineering Platform  
Team: [Add team members]  
School / program: [Add details]

## Slide 2 — The Idea
- A learning platform built around designing an Earth-observation CubeSat.
- Combines component selection, engineering trade-offs, and a conceptual mission sequence.
- Turns abstract spacecraft subsystems into an interactive learning experience.

## Slide 3 — The Learning Problem
- Spacecraft design involves interconnected subsystems.
- A change in one component can affect mass, power, storage, cost, and mission performance.
- Learners need a way to explore these relationships safely and interactively.

## Slide 4 — Our Mission Scenario
- Educational Earth-observation CubeSat scenario.
- Low Earth Orbit (LEO) concept.
- The player selects subsystems to collect, store, and transmit observation data.
- Clearly label scenario parameters as assumptions unless independently sourced.

## Slide 5 — Platform Workflow
1. Select a mission.
2. Review the mission briefing.
3. Build a spacecraft.
4. Run engineering analysis.
5. Compare design alternatives.
6. Simulate mission phases.
7. Review the final mission report.

## Slide 6 — Spacecraft Builder
- Select structure, payload, solar power, battery, communications, attitude control, onboard computer, and electrical power management.
- Each component has a canonical identifier.
- Component choices are passed to the engineering adapter.

**Visual:** Insert a screenshot of the actual Builder.

## Slide 7 — Engineering Engine
- Calculates total mass and resource metrics.
- Checks mission constraints.
- Reports warnings and violations.
- Produces a gameplay score.
- Keeps calculation logic separate from the React interface.

**Visual:** Insert a screenshot of the actual Analysis screen.

## Slide 8 — What-If Design Study
- Compare a baseline configuration with a changed configuration.
- Identify added and removed components.
- Show metric differences such as mass, power margin, budget credits, and science score.
- Example demo: basic camera versus advanced camera.

## Slide 9 — Mission Simulation
- Launch.
- Orbit insertion.
- Systems check.
- Earth observation.
- Data downlink.
- Mission report.

**Visual:** Insert a screenshot of the actual Simulation screen.

## Slide 10 — Data Collection and Communication
- Generated data is stored onboard.
- Storage limits constrain accepted data.
- Downlink speed determines the simplified data transmission rate.
- The final report summarizes generated, stored, transmitted, and lost data.

## Slide 11 — Software Architecture
- React + Vite frontend.
- Engineering engine and component catalog.
- Adapter connecting Builder selections to canonical engine IDs.
- Vitest automated tests.
- GitHub Actions CI for tests and production build.

**Visual:** Add a simple architecture diagram: Builder → Engine Adapter → Engineering Engine → Analysis / What-If → Simulation UI.

## Slide 12 — Testing and Quality Assurance
- Automated tests for resource totals, validation, mission calculations, scoring, What-If, and Builder mapping.
- CI runs tests and production build on pull requests.
- Manual browser demo checks the complete player journey.
- Only report checks as passed after the latest CI run is green.

## Slide 13 — Limitations and Responsible Use
- Simplified educational calculations.
- Illustrative gameplay parameters are not certified hardware specifications.
- Not a professional orbital mechanics or flight-readiness tool.
- Future work: improve traceability, refine simulation, and expand mission scenarios.

## Slide 14 — Conclusion
- LUNAFORGE links spacecraft component choices to understandable engineering trade-offs.
- It gives learners an interactive way to explore a conceptual space mission.
- Thank you — Questions?

## Final slide-deck checklist
- [ ] Add team member names and roles.
- [ ] Insert screenshots from the current working application.
- [ ] Verify every metric shown in slides against the current build.
- [ ] Include source citations for research-backed values.
- [ ] Do not claim test/build success until CI confirms it.
- [ ] Rehearse the live demo and prepare a backup recording.
