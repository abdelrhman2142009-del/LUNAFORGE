# LUNAFORGE

LUNAFORGE is an educational space-engineering platform built with React and Vite. Players design a CubeSat for Nile Delta Watch, review simplified engineering trade-offs, and simulate observations of the Nile Delta coast, wetlands, and agricultural / urban patterns.

> **Educational-use notice:** LUNAFORGE uses simplified models and illustrative gameplay values. It is not a spacecraft design tool, flight dynamics simulator, safety assessment, or flight-readiness certification. Catalog values should only be described as real hardware specifications when their source and assumptions are documented.

## Project features

- Nile Delta Watch mission briefing, objectives, and research-backed regional context.
- Spacecraft builder for selecting subsystem components.
- Engineering analysis for mass, power, battery energy, data, storage, and game-budget checks.
- Mission scoring and What-If design comparisons.
- Seven-day fictional mission model with three observation areas, onboard storage, downlink tracking, and an objective-based final report (shown through an accelerated 28-second timeline).
- Space-engineering glossary.

## NASA Earth imagery

The home screen and mission-control view include a NASA GIBS imagery explorer. It requests dated Terra MODIS, Aqua MODIS, and Suomi NPP VIIRS true-colour browse imagery for the Nile Delta, and uses NASA's Blue Marble global image as the Earth globe texture. The globe is a shaded, rotating textured sphere; the regional images are real NASA browse visualizations loaded from the NASA service.

**Important:** the game still simulates spacecraft observations, mission events, engineering outcomes, and downlink quantities. The NASA images are not claimed to have been captured by the fictional LUNAFORGE satellite, and browse imagery should not be treated as calibrated scientific analysis data. See [NASA_DATA_SOURCES.md](./NASA_DATA_SOURCES.md) for source links, implementation details, and limitations.

## Technology

- React 19
- Vite
- JavaScript ES modules
- Vitest for automated tests

## Requirements

- Node.js 22 (recommended)
- npm

## Install and run

Clone the repository, then run:

```bash
npm install
npm run dev
```

Vite prints a local development URL in the terminal. Open that URL in your browser.

## Quality checks

Run these commands before submitting a change:

```bash
npm test
npm run build
```

Optional:

```bash
npm run test:watch
npm run test:coverage
```

The repository currently defines an ESLint script, but an ESLint configuration file was not present in the reviewed main-branch tree. Do not treat `npm run lint` as a verified check until the team adds and validates that configuration.

## Main project structure

```text
LUNAFORGE/
├── src/
│   ├── components/       # React Builder and supporting interface components
│   ├── data/             # Research and glossary data
│   ├── engine/           # Component catalog, calculations, scoring, What-If, UI adapter
│   ├── simulation/       # Mission timeline, scenario events, simulation UI
│   ├── App.jsx           # Main application navigation and screen routing
│   └── main.jsx          # React entry point
├── tests/                # Vitest engineering, simulation, and Nile Delta mission tests
├── integration.test.js   # Existing compatibility tests
├── INTEGRATION_CONTRACT.md
├── package.json
└── vite.config.js
```

The Member 5 integration branch brings the simulation module into `src/simulation/` and routes the app to that module. The earlier `src/components/MissionSimulation.jsx` remains in the repository as a legacy/alternate screen and should be reviewed before deletion. The component catalog used by the calculation engine lives at `src/engine/componentsData.js`.

## Nile Delta Watch mission

The mission profile and source metadata are in `src/data/nile_delta_watch.json`; research notes, requirements, and glossary are stored alongside it in `src/data/`. The runtime evaluator is `src/simulation/missionObjectives.js`. It records three synthetic observation areas and evaluates stored data and the 80% downlink target using a gameplay assumption of one 10-minute ground contact per scenario day. The simulation is educational only and does not model actual orbit access, satellite imagery, or radio-link performance.

## Engineering engine API

The React interface should call the adapter instead of duplicating engineering calculations:

```js
import {
  runEngineeringAnalysis,
  runEngineeringWhatIf,
} from "./src/engine/engineAdapter.js";

const report = runEngineeringAnalysis(builderSelection);
const comparison = runEngineeringWhatIf(beforeSelection, afterSelection);
```

The lower-level engine exports are documented in [INTEGRATION_CONTRACT.md](./INTEGRATION_CONTRACT.md).

## Data units and assumptions

The current engine uses:
- Mass: kg
- Power: W
- Battery energy: Wh
- Storage: GB
- Data generated: MB and GB
- Orbit altitude: km
- In-game component cost: **credits**, not USD

Do not mix peak power with average power, or battery energy (Wh) with battery capacity (Ah). If a value is an assumption for gameplay, label it as such. Keep a source reference alongside any value presented as research-backed.

## Team responsibilities

| Member | Responsibility |
|---|---|
| 1 | Scientific research and mission/glossary data |
| 2 | React interface, Builder, and app navigation |
| 3 | Component catalog, engineering calculations, scoring, and What-If analysis |
| 4 | Simulation/gameplay behavior, coordinated with the current simulation UI owner |
| 5 | Integration coordination, tests, repository documentation, and final demo |

## Contribution workflow

1. Create a feature branch from `main`.
2. Work only in the files assigned to your role.
3. Run `npm test` and `npm run build`.
4. Open a Pull Request with a clear summary and test results.
5. Request review from another team member.
6. Merge only after review and passing CI checks.

Do not commit directly to `main` for normal feature work. Avoid having multiple members edit the same file simultaneously.

## Known integration decisions to resolve

See [INTEGRATION_CONTRACT.md](./INTEGRATION_CONTRACT.md) for the current interfaces and the remaining ownership decisions, especially:
- review whether the legacy `src/components/MissionSimulation.jsx` can be removed after the new `src/simulation/MissionSimulation.jsx` is accepted;
- decide whether mission data should be introduced as a dedicated `src/data/missionData.js` module;
- keep game credits distinct from USD;
- keep `src/engine/componentsData.js` as the single source of truth for the calculation engine catalog.

## Security and authentication

The reviewed application is a frontend educational app. No user login, credential storage, access-token flow, refresh-token flow, or authentication middleware was identified in the reviewed source files. Do not add secrets or API keys to frontend source code.
