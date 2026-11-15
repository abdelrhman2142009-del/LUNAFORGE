# LUNAFORGE — Nile Delta Watch Repository Audit

**Audited branch:** `member-1-nile-delta-watch`  
**Audit scope:** Existing mission research/data, component catalog, Builder adapter, engineering calculations, simulation, and integration tests.  
**Purpose:** Record confirmed mismatches before the mission is presented as fully integrated.

## Executive result

The research baseline is mostly consistent and the new Nile Delta Watch mission data is valid JSON. However, the repository is **not yet a fully integrated Nile Delta Watch game**. The current UI and engineering engine still use the older generic EarthWatch-1 baseline, and several resource calculations do not correctly use the selected Builder component values.

## Confirmed data checks

| Check | Result | Notes |
|---|---|---|
| 6U dimensions | Pass | NASA 2026 structures chapter lists 100 × 226.3 × 366 mm. |
| 6U structure mass range | Pass | NASA lists 0.916–1.94 kg; the 1.4 kg project allocation is inside this range. |
| 12 kg maximum | Pass with context | The project uses the CubeSat Design Specification Rev. 14.1 value; launch-provider requirements still need separate review for a real mission. |
| 8 kg target mass | Pass as assumption | Project target, not a measured spacecraft mass. |
| Deployable solar example | Pass | NASA 2026 lists NPC Spacemind SP6X Deployable at 57.6 W and 74 W/kg. 57.6 / 74 = 0.778 kg, rounded to 0.78 kg. |
| Body-mounted solar example | Attribution corrected | NASA 2026 lists Exobotics XO-PANEL 6U at 27.8 W and 62 W/kg. 27.8 / 62 = 0.448 kg, rounded to 0.45 kg. |
| Battery reference | Pass with caveat | NASA 2026 lists GomSpace NanoPower BPX 3000mA, example 4S-2P, 6.0 Ah and 172 Wh/kg. 88.8 Wh assumes 14.8 V nominal; confirm the exact pack datasheet before treating it as a product specification. |
| 8 kg mass allocation | Pass | The ten subsystem allocations sum to 8.00 kg. |
| Nile Delta coastal research | Pass | The 2021 DSAS study reports erosion, accretion, and stable segments; do not describe the whole delta as uniformly eroding. |
| Agriculture / urban change | Pass | NASA Earth Observatory documents Landsat-based farmland conversion and urban expansion near Alexandria and elsewhere in the delta. |
| Lake Manzala / Damietta | Pass | Copernicus Sentinel-2 image description identifies Lake Manzala, the Damietta branch, agricultural land, aquaculture, and coastal ecosystems. |

## Issues found in existing files

### Critical — engineering power calculation

**Files:** `src/engine/componentsData.js`, `src/engine/missionEngine.js`

- The component catalog gives solar arrays a `peakPowerW` value, but no `averageGenerationW` value.
- `calculateMission()` therefore falls back to the same baseline 20 W average generation regardless of which solar array the player selects.
- The engine also sums every component's `peakPowerW` into `componentPeakPowerW`. That includes the solar array's generation rating, which is then added to the load estimate as though it were a power-consuming subsystem.
- Result: changing from the 27.8 W body-mounted panel to the 57.6 W deployable panel does not correctly change average generation, and the solar panel may incorrectly increase calculated load.

**Required owner action:** Member 3 should separate solar generation from subsystem consumption and define a documented gameplay conversion from panel peak output to orbit-average generation. Do not assume peak output equals average output.

### Critical — Builder and engine use different resource models

**Files:** `src/components/Builder.jsx`, `src/engine/engineAdapter.js`, `src/engine/componentsData.js`

- Builder displays camera data rates in MB/minute; the engine estimates data as a fixed number of images per day multiplied by MB/image.
- Builder displays communication speeds in Mbps; the engine catalog stores data rates in kbps.
- The adapter maps Builder IDs to canonical IDs but discards the Builder component object's numerical values.
- Builder's power check subtracts component power consumption from solar-panel peak output. This compares peak generation with a load total and is not an orbit-average power balance.

**Required owner action:** Members 2 and 3 should agree on one canonical unit/model for camera data generation, communication rate, active/peak load, and average solar generation. The adapter should either map all values consistently or Builder should display the engine's returned calculations.

### Critical — mission is not yet connected to the application

**Files:** `src/data/nile_delta_watch.json`, `src/App.jsx`, `src/engine/componentsData.js`

- The new Nile Delta Watch JSON is present but no runtime import/reference to it was found in the inspected app flow.
- The mission-selection and briefing UI still describes a generic Earth-observation CubeSat.
- The engineering baseline still returns the mission name EarthWatch-1.

**Required owner action:** Member 2 should add the mission to selection/briefing and load its data. Member 3 should agree how mission metadata/constraints are passed into the engine instead of hardcoding EarthWatch-1 in the baseline.

### High — mission objectives are not evaluated by the simulation

**Files:** `src/simulation/simulationStages.js`, `src/simulation/simulationEngine.js`, `src/simulation/MissionSimulation.jsx`

- The current simulation has five phases and a total duration of 28 seconds.
- It does not record which Nile Delta areas were observed.
- It does not track total image data generated, queued, or transmitted.
- The proposed minimum of three priority areas and 80% data downlink are not evaluated.
- The final callback currently receives the timeline state, not a mission-specific objective report.

**Required owner action:** Member 4 should add mission objective state and calculate observations/data delivery. The seven-day scenario duration should be described as fictional mission time, distinct from the 28-second accelerated game timeline.

### High — duplicated component catalog can drift

**Files:** `src/data/mission_data.json`, `src/engine/componentsData.js`

- The old EarthWatch-1 JSON had only ten component entries while the runtime catalog has fourteen.
- The reference snapshot has now been completed to fourteen IDs and labelled as non-runtime reference data.
- The runtime source of truth remains `src/engine/componentsData.js`; future catalog changes should be reviewed against the reference snapshot.

### Medium — tests do not cover mission-data integration

**Files:** `tests/engineering.integration.test.js`, `tests/simulation.integration.test.js`

- Existing tests cover core engine calculations and the five-phase simulation.
- No test currently checks that Nile Delta Watch JSON loads, its component IDs exist in the runtime catalog, or its objective IDs are represented in the simulation.
- A test should be added by Member 5 after the mission integration interfaces are agreed.

### Legacy / duplicate files

- `src/components/MissionSimulation.jsx` is retained as a legacy/alternate screen; the current App imports `src/simulation/MissionSimulation.jsx`.
- Root `componentsData.js` and `src/data/componentsData.js.txt` are legacy/reference copies; the integration contract identifies `src/engine/componentsData.js` as the runtime catalog.
- Do not delete these legacy files until the team confirms no remaining imports or external dependencies.

## Files added or corrected on this branch

- `src/data/nile_delta_watch.json` — mission profile, objectives, assumptions, and source metadata.
- `src/data/nile_delta_watch_research.md` — research basis and caveats.
- `src/data/nile_delta_watch_requirements.md` — requirements and acceptance criteria.
- `src/data/nile_delta_watch_glossary.json` — mission-specific terminology.
- `src/data/mission_data.json` — clarified the 27.8 W body-mounted panel's NASA product attribution and completed the reference catalog to match the fourteen runtime component IDs.
- This audit file.

## Source verification used for this audit

- NASA. (2026). *State-of-the-Art of Small Spacecraft Technology — 3.0 Power*. https://www.nasa.gov/smallsat-institute/sst-soa/power-subsystems/
- NASA. (2026). *6.0 Structures, Materials, and Mechanisms*. https://www.nasa.gov/smallsat-institute/sst-soa/structures-materials-and-mechanisms/
- NASA Earth Observatory. (2021, December 15). *The Nile Delta's disappearing farmland*. https://science.nasa.gov/earth/earth-observatory/the-nile-deltas-disappearing-farmland-149183/
- European Union Space Policy. (2025, November 6). *Coastal ecosystems in northern Egypt*. https://eu-space.europa.eu/components/earth-observation-copernicus/image-of-the-day/coastal-ecosystems-northern-egypt
- Abou Samra, R. M., & Ali, R. R. (2021). Applying DSAS tool to detect coastal changes along Nile Delta, Egypt. *The Egyptian Journal of Remote Sensing and Space Science, 24*(3), 463–470. https://doi.org/10.1016/j.ejrs.2020.11.002

## Scope note

This audit is based on repository source inspection and published reference pages. It is not a flight-readiness review. Engineering, UI, simulation, and test fixes listed above belong to their current owners and should be completed through coordinated pull requests.
