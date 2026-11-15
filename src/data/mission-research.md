# LUNAFORGE — EarthWatch-1 Mission Research & Baseline Values

**Owner:** Member 1 — Space Research & NASA Data  
**Mission type:** Earth observation  
**Spacecraft:** 6U CubeSat  
**Orbit scenario:** 500 km Low Earth Orbit (LEO)  
**Status:** Educational baseline for the game; not a flight-ready spacecraft design.

## 1. Why choose a 6U CubeSat?

EarthWatch-1 needs an imaging payload, power generation and storage, onboard data handling, communication, and attitude control. NASA's 2026 Small Spacecraft Technology report explains that 1U–3U spacecraft are often suited to low-power payloads and relaxed pointing/data demands, while 6U platforms provide more power and volume for more capable ADCS, communications, and propulsion. A 6U platform is therefore a reasonable educational baseline for this Earth-observation scenario.

NASA lists standard 6U dimensions as **100 × 226.3 × 366 mm** and an average 6U structure mass range of **0.916–1.94 kg**. The CubeSat Design Specification gives a typical maximum mass of **12 kg for 6U**. EarthWatch-1 uses an **8.0 kg target wet mass** to leave margin below that limit.

## 2. Mission overview

EarthWatch-1 observes selected areas of Earth and collects images that help users understand environmental changes. The 500 km altitude is a selected scenario value for the game. It is not a universal altitude for CubeSats or all Earth-observation missions.

This is an educational simulation. It does not certify a real spacecraft design or account for every launch, thermal, radiation, licensing, communications, and safety requirement.

## 3. Baseline mission values

| Parameter | Baseline value | Evidence / status |
|---|---:|---|
| Spacecraft form | 6U CubeSat | Selected design architecture |
| External dimensions | 100 × 226.3 × 366 mm | NASA 2026 structures chapter |
| Maximum 6U mass | 12 kg | CubeSat Design Specification Rev. 14.1 |
| Target spacecraft mass | 8.0 kg | Project design target, not measured hardware |
| Orbit altitude | 500 km | Chosen game scenario |
| Solar array peak power | 57.6 W | NASA 2026 survey lists NPC Spacemind SP6X Deployable at 57.6 W |
| Solar array specific power | 74 W/kg | Same NASA-listed product |
| Estimated solar-array mass | 0.78 kg | Calculated: 57.6 W ÷ 74 W/kg |
| Battery example capacity | 6.0 Ah | NASA 2026 survey lists GomSpace NanoPower BPX 3000mA, 4S-2P, 6.0 Ah |
| Battery specific energy | 172 Wh/kg | Same NASA-listed battery product |
| Battery nominal energy | about 88.8 Wh | Derived estimate using 14.8 V nominal for a 4S Li-ion pack × 6.0 Ah; confirm against vendor datasheet before treating as procurement specification |
| Average power generation | 20 W | Simplified game assumption; not the array peak rating |
| Average spacecraft load | 12 W | Game assumption |
| Peak spacecraft load | 30 W | Game assumption; high-power operations must be duty-cycled |
| Onboard storage | 32 GB | Game assumption |
| Game budget | 1,000 credits | Game-only points, not real money |

**Important distinction:** the solar-array and battery reference data are drawn from NASA's 2026 technology survey. The 20 W average generation, 12 W average load, 30 W peak load, 32 GB storage, and 1,000 credits are game-design assumptions. They are sensible fixed starting values for gameplay, but must not be described as verified performance of a specific complete satellite.

## 4. Mass allocation for the game

The following allocation totals **8.0 kg**. Only the solar-array and battery estimates are directly calculated from NASA-listed example products; the remaining subsystem allocations are preliminary game estimates and should be reviewed by Member 3.

| Subsystem | Allocated mass |
|---|---:|
| 6U structure and rails | 1.40 kg |
| Earth-observation camera payload | 0.80 kg |
| Solar array | 0.78 kg |
| Battery pack | 0.52 kg |
| ADCS | 1.00 kg |
| Communication system | 0.60 kg |
| Onboard computer and data handling | 0.40 kg |
| Electrical power management | 0.40 kg |
| Thermal control, harness, deployment hardware | 0.80 kg |
| System margin and integration allowance | 1.30 kg |
| **Total target mass** | **8.00 kg** |

The 1.40 kg structure allocation falls within NASA's published 6U structure mass range. Do not interpret the subsystem allocations as manufacturer-certified component masses.

## 5. Power system and energy logic

NASA explains that small spacecraft commonly use solar cells/panels for generation and rechargeable batteries for energy storage. The 2026 NASA report lists the SP6X deployable 6U solar-array example with a 57.6 W peak beginning-of-life rating and 74 W/kg specific power. It also lists a GomSpace NanoPower BPX 3000mA battery configuration with 6.0 Ah capacity and 172 Wh/kg specific energy.

For the game:
- Solar array peak rating: 57.6 W.
- Simplified orbit-average generation: 20 W.
- Average load: 12 W.
- Peak load: 30 W.
- Battery energy reference: approximately 88.8 Wh.

The average power generation is lower than the peak array rating because orientation, eclipse periods, operating conditions, and conversion losses affect usable energy. The game should model camera imaging and high-rate transmission as activities that happen for limited periods, not continuously at peak power.

## 6. Component choices and trade-offs

- **Camera:** a higher-capability camera can produce more useful images, but it may add mass, data volume, and power demand.
- **Solar array:** a deployable array can provide more peak power than a small body-mounted array, but it adds deployment complexity and mass.
- **Battery:** a higher-capacity battery supports operations during eclipse and peak loads, but adds mass.
- **Communication:** higher data rate can transmit images faster, but may require more power and more capable equipment.
- **ADCS:** better pointing helps the camera aim at a target, but usually requires more capable hardware and resources.
- **Storage:** more onboard storage allows more images to be retained before downlink.

These trade-offs are useful game mechanics. Exact component performance depends on the selected product and mission.

## 7. Mission workflow

1. Design — player selects spacecraft components.
2. Validation — game checks mass, power, storage, and budget.
3. Launch — simulated mission begins.
4. Orbit — satellite enters the selected 500 km LEO scenario.
5. Observation — camera collects simulated Earth images.
6. Data storage — onboard computer stores collected data.
7. Communication — satellite sends data to the simulated ground station.
8. Evaluation — game calculates mission success and score.

## 8. NASA data and imagery

Use NASA Earthdata and NASA Worldview to find genuine Earth-observation imagery. Credit the actual dataset/layer and date. Never describe an external NASA image as if it were captured by the fictional EarthWatch-1 satellite.

## 9. Handoff to other members

- **Member 2:** use the mission summary, subsystem names, and component choices in the interface.
- **Member 3:** implement mass, power, energy, storage, and budget calculations. Review the preliminary allocations and keep source-backed values distinct from game assumptions.
- **Member 4:** use the eight mission stages to build the simulation.
- **Member 5:** check that the final integrated game labels the educational assumptions clearly.

## 10. Main sources

- NASA, *State-of-the-Art of Small Spacecraft Technology (2026)*: https://www.nasa.gov/smallsat-institute/sst-soa/
- NASA, *2.0 Complete Spacecraft Platforms*: https://www.nasa.gov/smallsat-institute/sst-soa/platforms/
- NASA, *3.0 Power*: https://www.nasa.gov/smallsat-institute/sst-soa/power-subsystems/
- NASA, *6.0 Structures, Materials, and Mechanisms*: https://www.nasa.gov/smallsat-institute/sst-soa/structures-materials-and-mechanisms/
- CubeSat Design Specification Rev. 14.1: https://www.cubesource.space/_files/ugd/b4da61_b098788d649a48c7ae7c23c0bf35925f.pdf
