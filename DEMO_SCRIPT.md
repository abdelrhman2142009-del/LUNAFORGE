# LUNAFORGE — Final Demo Script

**Target length:** 4–6 minutes  
**Presenter:** Team representative  
**Purpose:** Demonstrate the educational workflow, not claim real spacecraft flight readiness.

## Before presenting
1. Install dependencies with `npm install`.
2. Run `npm test` and `npm run build`; confirm both pass.
3. Start the app with `npm run dev`.
4. Open the local Vite URL and close unrelated tabs.
5. Keep a backup recording or screenshots available in case the presentation network/device fails.

## Live walkthrough

### 1. Introduce the platform (30–45 seconds)
“LUNAFORGE is an educational space-engineering platform. It lets a player make spacecraft subsystem choices, explore simplified engineering trade-offs, and follow a conceptual Earth-observation mission.”

### 2. Select the mission (30–45 seconds)
- Open mission selection.
- Choose the Earth-observation CubeSat mission.
- Explain the mission objective and the scenario constraints.
- Point out that the displayed limits are educational/gameplay assumptions where labelled.

### 3. Build the spacecraft (60–90 seconds)
- Open the Builder.
- Select the required spacecraft subsystems.
- Explain that each component has a canonical ID and engineering properties.
- Avoid presenting game credits as USD or illustrative values as verified flight hardware data.

### 4. Review engineering analysis (60–90 seconds)
- Open the analysis screen.
- Show mass, power balance, battery energy, data/storage, budget, warnings, and mission status.
- Explain that the UI receives the calculation results from the engineering engine through the adapter.

### 5. Demonstrate a What-If comparison (30–45 seconds)
- Compare the basic camera selection with the advanced camera.
- Show how the mass, data generation, cost, and science score change.
- Explain that the same calculation engine evaluates both configurations.

### 6. Run the mission simulation (60–90 seconds)
- Start the simulation.
- Advance through the mission phases.
- At the observation phase, collect data.
- At the downlink phase, transmit data.
- Show the final report and explain any limitations shown.

### 7. Close (20–30 seconds)
“LUNAFORGE connects component selection, simplified engineering calculations, and an interactive mission sequence. Its purpose is to help learners understand subsystem trade-offs. It is an educational model, not a flight-qualified spacecraft simulator.”

## Questions the team should be ready to answer
- Where do the component values come from?
- Which values are scientific references and which are gameplay assumptions?
- How does the Builder communicate with the calculation engine?
- How are power generation and power consumption distinguished?
- What happens if the spacecraft exceeds a constraint?
- What are the limitations of the current simulation?
