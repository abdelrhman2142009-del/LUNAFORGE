import { calculateMission } from "./missionEngine.js";

function delta(after, before) {
  const absolute = after - before;
  const percent = before === 0 ? null : (absolute / Math.abs(before)) * 100;
  return { absolute, percent };
}

export function compareMissions(beforeMission, afterMission) {
  const keys = [
    "totalMassKg",
    "averageGenerationW",
    "averageLoadW",
    "powerMarginW",
    "peakDeficitW",
    "batteryEnergyWh",
    "dataPerDayGB",
    "storageGb",
    "budgetCredits",
    "scienceScore"
  ];

  return Object.fromEntries(
    keys.map(key => [
      key,
      delta(afterMission.metrics[key], beforeMission.metrics[key])
    ])
  );
}

export function analyzeWhatIf(baseSelection, changedSelection, constraints) {
  const before = calculateMission(baseSelection, constraints);
  const after = calculateMission(changedSelection, constraints);

  const beforeIds = new Set(before.selectedComponentIds);
  const afterIds = new Set(after.selectedComponentIds);

  return {
    before,
    after,
    comparison: compareMissions(before, after),
    changedComponents: {
      added: [...afterIds].filter(id => !beforeIds.has(id)),
      removed: [...beforeIds].filter(id => !afterIds.has(id))
    },
    interpretation: buildInterpretation(before, after)
  };
}

function buildInterpretation(before, after) {
  const c = compareMissions(before, after);
  const parts = [];

  if (c.totalMassKg.absolute !== 0)
    parts.push(`Mass ${c.totalMassKg.absolute > 0 ? "increased" : "decreased"} by ${Math.abs(c.totalMassKg.absolute).toFixed(2)} kg.`);
  if (c.powerMarginW.absolute !== 0)
    parts.push(`Average power margin ${c.powerMarginW.absolute > 0 ? "improved" : "decreased"} by ${Math.abs(c.powerMarginW.absolute).toFixed(2)} W.`);
  if (c.budgetCredits.absolute !== 0)
    parts.push(`Budget changed by ${c.budgetCredits.absolute > 0 ? "+" : ""}${c.budgetCredits.absolute.toFixed(0)} credits.`);
  if (c.scienceScore.absolute !== 0)
    parts.push(`Science score changed by ${c.scienceScore.absolute > 0 ? "+" : ""}${c.scienceScore.absolute.toFixed(0)}.`);

  parts.push(`Result changed from ${before.status} to ${after.status}.`);
  return parts.join(" ");
}
