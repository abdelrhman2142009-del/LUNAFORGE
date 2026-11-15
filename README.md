# LUNAFORGE Engineering & Calculation Engine

This package contains the calculation layer for the LUNAFORGE educational space-mission game.

## Included

- `src/engine/componentsData.js`
  - Gameplay component catalog
  - Default mission constraints
- `src/engine/missionEngine.js`
  - Mass, power, budget, data, reliability and constraint calculations
- `src/engine/whatIf.js`
  - Before/after mission comparison
  - What-If interpretation
- `src/engine/scoring.js`
  - Mission score and grade
- `tests/missionEngine.test.js`
  - Automated tests

## Important scientific note

The numbers in `componentsData.js` are explicitly modeled as gameplay parameters, not flight-qualified spacecraft specifications. The game should label them accordingly unless the team replaces them with a verified source and documents that source.

## Install and test

```bash
npm install
npm test
```

## Example

```js
import { calculateMission } from "./src/engine/missionEngine.js";
import { calculateMissionScore } from "./src/engine/scoring.js";

const selection = {
  structure: "structure-standard",
  power: "power-basic",
  battery: "battery-basic",
  payload: "payload-lowres-camera",
  communications: "comms-basic",
  computer: "computer-standard",
  attitude: "attitude-basic",
};

const mission = calculateMission(selection);
const score = calculateMissionScore(mission);

console.log(mission.status);
console.log(mission.metrics);
console.log(score);
```

## Integration contract for React

The UI should not calculate mission values itself.

Use:

1. `calculateMission(selection)`
2. `getResourceStatus(mission)`
3. `calculateMissionScore(mission)`
4. `analyzeWhatIf(beforeSelection, afterSelection)`

Then render the returned objects in React.
