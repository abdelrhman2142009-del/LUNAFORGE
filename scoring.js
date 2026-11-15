/**
 * LUNAFORGE - Mission scoring.
 *
 * The score is a GAMEPLAY score, not a real aerospace certification.
 * It rewards feasible designs, science, efficiency, and reliability.
 */

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function round(value, decimals = 1) {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function inverseNormalized(value, limit) {
  if (limit <= 0) return 0;
  return clamp(1 - value / limit, 0, 1);
}

function resourceEfficiency(mission) {
  const { metrics, constraints } = mission;

  const massEfficiency = inverseNormalized(
    metrics.massKg,
    constraints.maxMassKg
  );

  const budgetEfficiency = inverseNormalized(
    metrics.budgetCredits,
    constraints.maxBudgetCredits
  );

  const powerEfficiency =
    metrics.power.generatedW > 0
      ? clamp(
          metrics.power.marginW / metrics.power.generatedW,
          0,
          1
        )
      : 0;

  const storageEfficiency =
    metrics.data.generatedMbPerDay > 0
      ? clamp(
          metrics.data.capacityMb /
            (metrics.data.generatedMbPerDay * 7),
          0,
          1
        )
      : 1;

  return (
    (massEfficiency +
      budgetEfficiency +
      powerEfficiency +
      storageEfficiency) /
    4
  );
}

function scienceScore(mission) {
  const target = mission.constraints.minScienceScore;
  const value = mission.metrics.scienceValue;

  // Cap at 100 for a stable game score.
  return clamp((value / Math.max(target, 1)) * 100, 0, 100);
}

function reliabilityScore(mission) {
  return clamp(mission.metrics.reliability * 100, 0, 100);
}

function feasibilityScore(mission) {
  const critical = mission.summary.criticalCount;
  const warnings = mission.summary.warningCount;

  return clamp(100 - critical * 30 - warnings * 10, 0, 100);
}

export function calculateMissionScore(mission) {
  const components = {
    scientificValue: round(scienceScore(mission)),
    resourceEfficiency: round(resourceEfficiency(mission) * 100),
    technicalFeasibility: round(feasibilityScore(mission)),
    reliability: round(reliabilityScore(mission)),
  };

  const weighted =
    components.scientificValue * 0.30 +
    components.resourceEfficiency * 0.25 +
    components.technicalFeasibility * 0.30 +
    components.reliability * 0.15;

  const total = round(weighted);

  return {
    total,
    grade: getGrade(total),
    components,
    weights: {
      scientificValue: 0.30,
      resourceEfficiency: 0.25,
      technicalFeasibility: 0.30,
      reliability: 0.15,
    },
    interpretation: getScoreInterpretation(total, mission.status),
  };
}

function getGrade(score) {
  if (score >= 90) return "S";
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  if (score >= 50) return "D";
  return "F";
}

function getScoreInterpretation(score, status) {
  if (status === "FAIL") {
    return "The mission is not feasible under the current constraints. Fix the critical violations before optimizing the score.";
  }

  if (score >= 90) {
    return "Excellent balance of scientific value, resources, feasibility, and reliability.";
  }

  if (score >= 80) {
    return "Strong mission design with room for optimization.";
  }

  if (score >= 70) {
    return "Good mission concept, but several trade-offs can still be improved.";
  }

  if (score >= 60) {
    return "The mission is workable, but resource and engineering choices need improvement.";
  }

  return "The design needs significant improvement before it becomes a strong mission.";
}
