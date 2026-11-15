# EarthWatch-1 — Mission Requirements and Fixed Game Baseline

## Mission architecture

- Spacecraft: 6U CubeSat
- Dimensions: 100 × 226.3 × 366 mm
- Standard maximum mass: 12 kg
- Game target mass: 8.0 kg
- Scenario orbit: 500 km LEO
- Mission: Earth observation

## Fixed game baseline

| Parameter | Value | Classification |
|---|---:|---|
| Maximum spacecraft mass | 12 kg | 6U standard limit |
| Target spacecraft mass | 8.0 kg | Project target |
| Solar array peak power | 57.6 W | NASA-listed SP6X example |
| Average solar generation | 20 W | Game assumption |
| Average load | 12 W | Game assumption |
| Peak load | 30 W | Game assumption |
| Battery energy | 88.8 Wh approx. | Derived from NASA-listed battery capacity and nominal 4S voltage |
| Data storage | 32 GB | Game assumption |
| Game budget | 1,000 credits | Game assumption |

## Functional requirements

| ID | Requirement |
|---|---|
| FR-01 | The satellite must include an Earth-observation camera payload. |
| FR-02 | The satellite must include a solar power system and battery. |
| FR-03 | The satellite must include onboard data storage. |
| FR-04 | The satellite must include a communication system. |
| FR-05 | The satellite must communicate with a simulated ground station. |
| FR-06 | The player must be able to select and replace components. |
| FR-07 | The game must check the 12 kg mass limit and 8 kg target. |
| FR-08 | The game must check power, battery energy, storage, and game budget. |
| FR-09 | The game must show mission progress and final results. |
| FR-10 | The game must distinguish standard/reference values from gameplay assumptions. |

## Validation rules

- Total mass must not exceed 12 kg.
- The 8 kg target should be used as the recommended design target, not the formal 6U maximum.
- Average load should be compared with the simplified average generation.
- Peak load may exceed average generation, but must be supported by the battery and appropriate duty cycling.
- Stored image data must not exceed 32 GB.
- Component credits must not exceed 1,000.
- The game must allow partial success and explain which requirement was missed.

## Data integrity

NASA product examples are not universal CubeSat specifications. Any value explicitly marked as a game assumption must remain labeled as such in the UI, documentation, and final presentation.
