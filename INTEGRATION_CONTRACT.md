# LUNAFORGE — Integration Contract
**Version:** 1.0 (Frozen)
**Owner:** Member 5 (Integration & Testing)

## 1. Units (Non-negotiable)
- Mass: kg
- Power: W
- Battery capacity: Wh
- Cost: USD
- Storage: GB
- Altitude: km

## 2. File Ownership (Nobody edits files they don't own)
| File / Folder | Owner |
|---|---|
| `src/data/*` | Member 1 |
| `src/components/*`, `src/App.jsx` | Member 2 |
| `src/engine/*` | Member 3 |
| `src/simulation/*` | Member 4 |
| `tests/`, `README.md`, contract | Member 5 |

## 3. Function Contracts (Frozen)
- `getMissionData()` → returns mission object (Member 1)
- `getComponents()` → returns component array (Member 1)
- `calculateResources(selectedComponents)` → returns totals (Member 3)
- `validateMission(resourceResult, missionData)` → returns validity (Member 3)
- `startSimulation(...)` → starts simulation (Member 4)
