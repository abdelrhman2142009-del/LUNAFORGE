/**
 * LUNAFORGE - What-If analysis.
 *
 * Compares two mission configurations and reports exactly what changed.
 */

import { calculateMission } from "./missionEngine.js";

function delta(after, before) {
  return Number.isFinite(after) && Number.isFinite(before)
    ? after - before
    : null;
}

function percentChange(after, before) {
  if (!Number.isFinite(after) || !Number.isFinite(before) || before === 0) {
    return null;
  }
  return ((after - before) / Math.abs(before)) * 100;
}

function compareMetric(name, before, after, unit = "") {
  return {
    name,
    before,
    after,
    delta: delta(after, before),
    percentChange: percentChange(after, before),
    unit,
  };
}

export function compareMissions(beforeMission, afterMission) {
  const before = beforeMission.metrics;
  const after = afterMission.metrics;

  const changes = [
    compareMetric("Mass", before.massKg, after.massKg, "kg"),
    compareMetric(
      "Power generation",
      before.power.generatedW,
      after.power.generatedW,
      "W"
    ),
    compareMetric(
      "Power consumption",
      before.power.consumedW,
      after.power.consumedW,
      "W"
    ),
    compareMetric(
      "Power margin",
      before.power.marginW,
      after.power.marginW,
      "W"
    ),
    compareMetric(
      "Budget",
      before.budgetCredits,
      after.budgetCredits,
      "credits"
    ),
    compareMetric(
      "Daily data generation",
      before.data.generatedMbPerDay,
      after.data.generatedMbPerDay,
      "MB/day"
    ),
    compareMetric(
      "Storage",
      before.data.capacityGb,
      after.data.capacityGb,
      "GB"
    ),
    compareMetric(
      "Scientific value",
      before.scienceValue,
      after.scienceValue,
      "points"
    ),
    compareMetric(
      "Reliability",
      before.reliability,
      after.reliability,
      "score"
    ),
  ];

  return {
    before: beforeMission,
    after: afterMission,
    changes,
    statusChanged: beforeMission.status !== afterMission.status,
    status: {
      before: beforeMission.status,
      after: afterMission.status,
    },
  };
}

/**
 * Analyze a "one-change" experiment.
 *
 * Example:
 *   analyzeWhatIf(baseSelection, { payload: "payload-highres-camera" })
 */
export function analyzeWhatIf(
  baseSelection,
  changedSelection,
  constraints
) {
  const beforeMission = calculateMission(baseSelection, constraints);
  const afterMission = calculateMission(changedSelection, constraints);

  const comparison = compareMissions(beforeMission, afterMission);

  return {
    ...comparison,
    changedComponents: {
      before: beforeMission.components,
      after: afterMission.components,
    },
    interpretation: buildInterpretation(comparison),
  };
}

function buildInterpretation(comparison) {
  const findings = [];

  const massChange = comparison.changes.find((c) => c.name === "Mass");
  const powerMargin = comparison.changes.find(
    (c) => c.name === "Power margin"
  );
  const science = comparison.changes.find(
    (c) => c.name === "Scientific value"
  );
  const budget = comparison.changes.find((c) => c.name === "Budget");
  const reliability = comparison.changes.find(
    (c) => c.name === "Reliability"
  );

  if (massChange?.delta > 0) {
    findings.push(`Mass increased by ${massChange.delta} kg.`);
  } else if (massChange?.delta < 0) {
    findings.push(`Mass decreased by ${Math.abs(massChange.delta)} kg.`);
  }

  if (powerMargin?.delta > 0) {
    findings.push(
      `Power margin improved by ${powerMargin.delta} W.`
    );
  } else if (powerMargin?.delta < 0) {
    findings.push(
      `Power margin decreased by ${Math.abs(powerMargin.delta)} W.`
    );
  }

  if (science?.delta > 0) {
    findings.push(
      `Scientific value increased by ${science.delta} points.`
    );
  } else if (science?.delta < 0) {
    findings.push(
      `Scientific value decreased by ${Math.abs(science.delta)} points.`
    );
  }

  if (budget?.delta > 0) {
    findings.push(`Budget use increased by ${budget.delta} credits.`);
  } else if (budget?.delta < 0) {
    findings.push(
      `Budget use decreased by ${Math.abs(budget.delta)} credits.`
    );
  }

  if (reliability?.delta > 0) {
    findings.push(`Estimated reliability improved.`);
  } else if (reliability?.delta < 0) {
    findings.push(`Estimated reliability decreased.`);
  }

  if (comparison.statusChanged) {
    findings.push(
      `Mission status changed from ${comparison.status.before} to ${comparison.status.after}.`
    );
  }

  return findings;
}
