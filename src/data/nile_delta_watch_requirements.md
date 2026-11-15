# Nile Delta Watch — Mission Requirements

**Mission ID:** `nile_delta_watch`  
**Mission type:** Earth observation  
**Difficulty:** Beginner  
**Spacecraft baseline:** 6U CubeSat  
**Status:** Educational game mission; not a flight-ready design

## 1. Mission purpose

Use simulated Earth-observation scenes to help players explore three environmental themes in Egypt's Nile Delta:

- Coastal change near Rosetta and Damietta.
- Wetlands and open-water patterns around Lake Manzala.
- Agricultural and built-up land patterns in the delta.

The game must clearly distinguish real research used to inspire the scenario from synthetic gameplay data. It must not imply that the fictional LUNAFORGE spacecraft captured actual Landsat or Sentinel imagery.

## 2. Mission profile

| Parameter | Selected value | Classification |
|---|---:|---|
| Spacecraft | 6U CubeSat | Existing project baseline |
| Dimensions | 100 × 226.3 × 366 mm | Published 6U form-factor reference |
| Maximum mass | 12 kg | Existing project baseline / CubeSat standard reference |
| Target wet mass | 8 kg | Game design target |
| Orbit altitude | 500 km LEO | Selected game scenario |
| Scenario duration | 7 mission days | Game design assumption |
| Average generation | 20 W | Game design assumption |
| Average load | 12 W | Game design assumption |
| Peak load | 30 W | Game design assumption |
| Battery energy | 88.8 Wh | Derived reference estimate; nominal pack voltage must be confirmed |
| Onboard storage | 32 GB | Game design assumption |
| Budget | 1,000 credits | Game-only points, not currency |

The 7 mission days describe the fictional mission period. The current application simulation is an accelerated 28-second sequence; these two durations must not be presented as the same clock.

## 3. Mission objectives and acceptance criteria

| ID | Requirement | Acceptance criterion | Current code status |
|---|---|---|---|
| NDW-01 | Select Nile Delta Watch as a mission | Mission selection and briefing show this mission name and its region | Pending UI integration |
| NDW-02 | Use a 6U design baseline | Briefing displays the 6U dimensions and labels 12 kg as the maximum, 8 kg as the game target | Data available; UI review needed |
| NDW-03 | Observe priority areas | Scenario records completed observations for at least 3 priority areas | Proposed gameplay target; not implemented |
| NDW-04 | Cover coastal change | One completed observation relates to Rosetta or Damietta | Mission data defined; simulation logic pending |
| NDW-05 | Cover wetlands | One completed observation relates to Lake Manzala | Mission data defined; simulation logic pending |
| NDW-06 | Cover agriculture / urban patterns | One completed observation relates to an agricultural/urban transition area | Mission data defined; simulation logic pending |
| NDW-07 | Store image data | Generated data is accumulated and checked against selected onboard storage | Existing engine has simplified daily-data estimate; full simulation tracking pending |
| NDW-08 | Downlink collected data | Simulation records generated, queued, and transmitted data | Proposed 80% gameplay target; not implemented |
| NDW-09 | Complete resource checks | Mass, average power, battery energy, storage, and credits are shown with units | Engineering engine exists; solar-power calculation needs review |
| NDW-10 | Show final outcome | Final report lists completed areas, data stored/transmitted, events, score, and failed objectives | Current simulation reports timeline completion only; mission-specific report pending |
| NDW-11 | Preserve scientific accuracy | Every published value, derived estimate, and game assumption is labelled | Research files contain classifications; UI review pending |
| NDW-12 | Keep educational scope clear | UI states that the model is not a flight prediction or certified spacecraft design | Existing simulation disclaimer present; mission briefing should repeat it |

## 4. Proposed gameplay targets

- Observe at least 3 priority areas.
- Transmit at least 80% of generated observation data.
- Complete the mission within the selected 7-day scenario.

These are game-balancing targets, not scientific standards or verified spacecraft performance requirements. They should only be shown as achieved after the simulation calculates them.

## 5. Orbit and imaging limits

- The 500 km altitude is a selected scenario value, not a complete orbit definition.
- Inclination, local solar time, revisit interval, and ground-track geometry have not been specified.
- No camera ground sampling distance (metres per pixel) has been selected.
- The existing camera catalog values describe gameplay data volume and power; they do not establish real image resolution.
- Do not promise a particular revisit time or image resolution until a camera and orbit model are defined.

## 6. Runtime integration requirements

The intended data flow is:

1. Mission selection loads `src/data/nile_delta_watch.json`.
2. Mission briefing displays its region, objectives, and constraints.
3. Builder selection is passed through the existing engineering adapter.
4. Engineering results are shown with the selected mission name and correct units.
5. Simulation receives the selected component configuration and mission objectives.
6. Observation, storage, and downlink progress are tracked.
7. The final report evaluates the mission objectives and resource limits.

The current app still uses the generic Earth-observation briefing and the engineering baseline is named EarthWatch-1. Do not claim Nile Delta Watch is fully playable until the UI, engine metadata, and simulation objectives are connected.

## 7. Source of truth

- Mission-specific profile and research-source metadata: `src/data/nile_delta_watch.json`.
- Mission-specific research explanation: `src/data/nile_delta_watch_research.md`.
- Mission-specific requirements: this file.
- Runtime component definitions: `src/engine/componentsData.js` (Member 3 owns this file).
- Runtime calculations: `src/engine/missionEngine.js` (Member 3 owns this file).
- Runtime simulation: `src/simulation/*` (Member 4 owns these files).

`src/data/mission_data.json` remains the older EarthWatch-1 baseline/reference file. Its component catalog is a research snapshot, not the runtime catalog.

## 8. Research references

- NASA Earth Observatory. (2021, December 15). *The Nile Delta's disappearing farmland*. https://science.nasa.gov/earth/earth-observatory/the-nile-deltas-disappearing-farmland-149183/
- European Union Space Policy. (2025, November 6). *Coastal ecosystems in northern Egypt*. https://eu-space.europa.eu/components/earth-observation-copernicus/image-of-the-day/coastal-ecosystems-northern-egypt
- Abou Samra, R. M., & Ali, R. R. (2021). Applying DSAS tool to detect coastal changes along Nile Delta, Egypt. *The Egyptian Journal of Remote Sensing and Space Science, 24*(3), 463–470. https://doi.org/10.1016/j.ejrs.2020.11.002
- NASA. (2026). *State-of-the-Art of Small Spacecraft Technology*. https://www.nasa.gov/smallsat-institute/sst-soa/
- European Space Agency. (2013, March 8). *Earth from Space: Delta's edge*. https://www.esa.int/Applications/Observing_the_Earth/Earth_from_Space_Delta_s_edge
