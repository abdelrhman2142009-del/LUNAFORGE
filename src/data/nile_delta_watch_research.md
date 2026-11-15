# Nile Delta Watch — Research Notes

## Mission concept

Nile Delta Watch is a proposed educational Earth-observation scenario for LUNAFORGE. Players use a simulated 6U CubeSat mission to investigate coastal change, northern wetlands, and the relationship between agricultural and built-up land in the Nile Delta.

The mission is inspired by real Earth-observation work. It does **not** claim that LUNAFORGE operates a real satellite, receives live Landsat or Sentinel data, or measures current environmental conditions.

## Why this region?

The Nile Delta provides several connected Earth-observation themes:

1. **Coastal change:** research has used multi-date Landsat images to study shoreline movement along the Nile Delta. A 2021 study applied the Digital Shoreline Analysis System (DSAS) to Landsat scenes from 1984–2018 and reported both erosion and accretion across different parts of the coast. This means the mission should not portray the entire coastline as uniformly retreating.
2. **Wetlands and coastal ecosystems:** a 2025 Copernicus Sentinel-2 image description highlights the Damietta branch, Lake Manzala, agricultural land, urban centres, and aquaculture infrastructure. These are suitable themes for a player to identify in observation scenes.
3. **Agriculture and urban growth:** NASA Earth Observatory has described farmland conversion and urban expansion in parts of the Nile Delta using Landsat imagery.
4. **Seasonal vegetation patterns:** ESA's Landsat example from the eastern Nile Delta shows that vegetation appearance changes between harvest seasons. A player should therefore compare images with care rather than assume every colour difference is permanent land-cover change.

## Proposed player objectives

- Observe at least three priority areas in the scenario: a coastal area, a northern lake/wetland area, and an agricultural/urban transition area.
- Collect and store simulated image data.
- Transmit the collected data during simulated communication opportunities.
- Interpret the images as a simplified land-observation exercise.

The three-area target and any data-transmission percentage are **proposed gameplay targets**, not scientific performance requirements from the cited sources.

## Existing project values reused

The mission data reuses the current LUNAFORGE baseline rather than introducing a new spacecraft specification:

| Parameter | Value | Classification |
|---|---:|---|
| Spacecraft | 6U CubeSat | Existing project baseline |
| Maximum mass | 12 kg | Existing baseline / CubeSat design limit reference |
| Target wet mass | 8 kg | Gameplay design target |
| Orbit altitude | 500 km | Selected gameplay assumption |
| Average generation | 20 W | Gameplay assumption |
| Average load | 12 W | Gameplay assumption |
| Peak load | 30 W | Gameplay assumption |
| Battery energy | 88.8 Wh | Existing project reference estimate; see caveat in mission_data.json |
| Storage | 32 GB | Gameplay assumption |
| Budget | 1000 credits | Gameplay assumption, not money |

The source of truth for the new mission profile is src/data/nile_delta_watch.json. The existing component catalog remains owned by Member 3 and should not be edited as part of this research-data change.

## Important technical limits in the current game

- The component catalog defines image data volume, but it does not define a verified ground sampling distance or camera resolution.
- The current mission engine uses a simplified fixed image-generation model. It does not yet validate how many geographic areas were observed.
- The current simulation is a timed educational sequence with random scenario events. It does not process real orbital geometry, real satellite images, or real ground-station contact windows.
- The proposed 80% downlink target is not yet calculated by the current simulation.
- A 500 km altitude alone does not define the orbit. Inclination and local-time requirements have deliberately been left unspecified.

These gaps should be addressed by the relevant engineering and simulation owners before the new mission is wired into the user interface.

## References

- European Space Agency School Atlas. (n.d.). *Alexandria: Dynamic coastline at the Nile Delta*. https://esa-schoolatlas.eu/esa-schoolatlas/hydrosphere/alexandria/
- European Space Agency. (2013, March 8). *Earth from Space: Delta's edge*. https://www.esa.int/Applications/Observing_the_Earth/Earth_from_Space_Delta_s_edge
- European Union Space Policy. (2025, November 6). *Coastal ecosystems in northern Egypt*. https://eu-space.europa.eu/components/earth-observation-copernicus/image-of-the-day/coastal-ecosystems-northern-egypt
- NASA Earth Observatory. (2021, December 15). *The Nile Delta's disappearing farmland*. https://science.nasa.gov/earth/earth-observatory/the-nile-deltas-disappearing-farmland-149183/
- Abou Samra, R. M., & Ali, R. R. (2021). Applying DSAS tool to detect coastal changes along Nile Delta, Egypt. *The Egyptian Journal of Remote Sensing and Space Science, 24*(3), 463–470. https://doi.org/10.1016/j.ejrs.2020.11.002


## Implemented educational gameplay model

The feature branch now uses a simple, transparent simulation model:

- Three synthetic observation areas: Rosetta/Damietta coast, Lake Manzala wetlands, and agricultural/urban transition.
- The camera catalog creates three synthetic scenes per mission day. This is a game cadence, not a real revisit rate.
- The scenario lasts seven mission days while the accelerated UI timeline lasts 28 seconds.
- The model assumes one 10-minute ground-station contact per scenario day.
- Data capacity per contact is estimated as Mbps × contact seconds ÷ 8, yielding decimal MB.
- Mission success requires all three areas, storage of generated data, at least 80% downlink, and an engineering-feasible configuration.

These values are explicit gameplay assumptions. They do not model orbital access, radio protocol overhead, link margin, antenna pointing, or actual ground-station scheduling.
