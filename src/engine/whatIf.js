import { calculateResources } from './missionEngine.js';

export function runWhatIf(base, modified) {
  const baseRes = calculateResources(base);
  const modRes = calculateResources(modified);
  
  return {
    massDifference: modRes.totalMass - baseRes.totalMass,
    costDifference: modRes.totalCost - baseRes.totalCost,
    powerDifference: modRes.totalPower - baseRes.totalPower
  };
}
