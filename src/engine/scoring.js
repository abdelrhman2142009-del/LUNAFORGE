export const SCORE_WEIGHTS = {
  scientificValue: 0.30,
  resourceEfficiency: 0.25,
  technicalFeasibility: 0.30,
  reliability: 0.15
};

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function massEfficiency(m) {
  if (m.totalMassKg <= 0) return 0;
  return clamp((m.targetMassKg / m.totalMassKg) * 100);
}

function powerEfficiency(m) {
  if (m.averageGenerationW <= 0) return 0;
  return clamp((m.powerMarginW / m.averageGenerationW) * 100 + 50);
}

function budgetEfficiency(m, constraints) {
  if (!constraints.budgetCredits) return 0;
  return clamp((m.budgetCreditsRemaining / constraints.budgetCredits) * 100);
}

function storageEfficiency(m) {
  return clamp(100 - m.storageUtilizationPercent);
}

function scienceScore(m) {
  return clamp(m.scienceScore);
}

function technicalScore(mission) {
  const required = mission.constraints;
  let score = 100;
  if (mission.violations.length) score -= 45;
  if (mission.warnings.length) score -= Math.min(25, mission.warnings.length * 8);

  const m = mission.metrics;
  if (m.totalMassKg > required.maxMassKg) score -= 30;
  if (m.powerMarginW < 0) score -= 30;
  if (m.batteryEnergyWh < required.batteryEnergyWh) score -= 10;
  if (m.storageGb < required.storageGb) score -= 10;
  if (m.budgetCredits > required.budgetCredits) score -= 20;

  return clamp(score);
}

function grade(total) {
  if (total >= 90) return "S";
  if (total >= 80) return "A";
  if (total >= 70) return "B";
  if (total >= 60) return "C";
  if (total >= 50) return "D";
  return "F";
}

export function calculateMissionScore(mission) {
  const m = mission.metrics;
  const scientificValue = scienceScore(m);
  const resourceEfficiency = (
    massEfficiency(m) * 0.35 +
    powerEfficiency(m) * 0.35 +
    budgetEfficiency(m, mission.constraints) * 0.20 +
    storageEfficiency(m) * 0.10
  );
  const technicalFeasibility = technicalScore(mission);
  const reliability = mission.violations.length === 0 ? 100 : Math.max(0, 100 - mission.violations.length * 25);

  const total =
    scientificValue * SCORE_WEIGHTS.scientificValue +
    resourceEfficiency * SCORE_WEIGHTS.resourceEfficiency +
    technicalFeasibility * SCORE_WEIGHTS.technicalFeasibility +
    reliability * SCORE_WEIGHTS.reliability;

  return {
    total: Number(total.toFixed(2)),
    grade: grade(total),
    components: {
      scientificValue: Number(scientificValue.toFixed(2)),
      resourceEfficiency: Number(resourceEfficiency.toFixed(2)),
      technicalFeasibility: Number(technicalFeasibility.toFixed(2)),
      reliability: Number(reliability.toFixed(2))
    },
    weights: SCORE_WEIGHTS,
    note: "Gameplay score for LUNAFORGE; not an aerospace certification or flight-readiness assessment."
  };
}
