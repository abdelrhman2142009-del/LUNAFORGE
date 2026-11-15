# LUNAFORGE — Scientific References and Value Traceability

## NASA technical references

1. National Aeronautics and Space Administration. (2026). *State-of-the-Art of Small Spacecraft Technology*. https://www.nasa.gov/smallsat-institute/sst-soa/

2. National Aeronautics and Space Administration. (2026). *2.0 Complete Spacecraft Platforms*. https://www.nasa.gov/smallsat-institute/sst-soa/platforms/
   - NASA describes 1U–3U platforms as often suitable for low-power payloads and relaxed pointing/data demands, while 6U platforms provide more power and volume for more capable ADCS and communications.

3. National Aeronautics and Space Administration. (2026). *3.0 Power*. https://www.nasa.gov/smallsat-institute/sst-soa/power-subsystems/
   - Solar array table lists NPC Spacemind SP6X Deployable: 74 W/kg specific power and 57.6 W peak power.
   - Battery table lists GomSpace NanoPower BPX 3000mA (example 4S-2P): 6.0 Ah and 172 Wh/kg.
   - NASA notes small spacecraft commonly use solar arrays and rechargeable batteries.

4. National Aeronautics and Space Administration. (2026). *6.0 Structures, Materials, and Mechanisms*. https://www.nasa.gov/smallsat-institute/sst-soa/structures-materials-and-mechanisms/
   - Table 6-1 lists 6U dimensions as 100 × 226.3 × 366 mm and average structure mass as 0.916–1.94 kg.

5. CubeSat Design Specification. (2024). *Revision 14.1*. https://www.cubesource.space/_files/ugd/b4da61_b098788d649a48c7ae7c23c0bf35925f.pdf
   - The 6U configuration is listed with a typical maximum mass of 12 kg. Launch-provider/deployer requirements must still be checked for a real mission.

## Traceability: values used in the game

| Value | Number | Classification / source |
|---|---:|---|
| 6U dimensions | 100 × 226.3 × 366 mm | NASA 2026 structures table |
| 6U structure mass range | 0.916–1.94 kg | NASA 2026 structures table |
| 6U maximum mass | 12 kg | CubeSat Design Specification Rev. 14.1 |
| Target wet mass | 8.0 kg | LUNAFORGE design target |
| Orbit altitude | 500 km | LUNAFORGE scenario selection; not a universal orbit |
| SP6X peak solar power | 57.6 W | NASA 2026 power table |
| SP6X specific power | 74 W/kg | NASA 2026 power table |
| SP6X estimated mass | 0.78 kg | Calculated: 57.6 ÷ 74 |
| GomSpace battery capacity | 6.0 Ah | NASA 2026 power table |
| GomSpace battery specific energy | 172 Wh/kg | NASA 2026 power table |
| Battery energy ~88.8 Wh | Derived estimate | 14.8 V nominal × 6.0 Ah; verify exact pack datasheet |
| Average generation 20 W | Game assumption | Simplified orbit-average model |
| Average load 12 W | Game assumption | Simplified power budget |
| Peak load 30 W | Game assumption | Simplified duty-cycled peak |
| Storage 32 GB | Game assumption | Gameplay balance |
| Budget 1,000 credits | Game assumption | Gameplay balance |

## Important source-use rules

- Do not present the 500 km orbit as a standard requirement for every CubeSat.
- Do not present a NASA-listed product's value as a specification for every product in that subsystem.
- The battery's 88.8 Wh figure is a derived nominal estimate; confirm the exact pack voltage and datasheet before using it as a procurement specification.
- The game mass allocations and component-catalog values are not all manufacturer specifications. They are preliminary design/game estimates.
- NASA survey data are a technology survey and may include manufacturer-provided performance. Check vendor datasheets for final engineering decisions.
