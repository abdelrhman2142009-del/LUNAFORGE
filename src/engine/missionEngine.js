import {
  MISSION_BASELINE,
  REQUIRED_CATEGORIES,
  COMPONENTS_BY_ID,
} from "./componentsData.js";

function normalizeSelection(selection) {
  if (!selection) return [];
  if (Array.isArray(selection)) return selection;
  return Object.values(selection).filter(Boolean);
}

function resolveComponents(selection) {
  return normalizeSelection(selection).map((item) => {
    const id = typeof item === "string" ? item : item.id;
    const component = COMPONENTS_BY_ID[id];
    if (!component) throw new Error(`Unknown component: ${id}`);
    return component;
  });
}

function sum(components, key) {
  return components.reduce((total, c) => total + (Number(c[key]) || 0), 0);
}

export function calculateMission(selection, constraints = MISSION_BASELINE) {
  const components = resolveComponents(selection);
  const categories = new Set(components.map((c) => c.category));

  const totalMassKg = sum(components, "massKg");
  const componentCostCredits = sum(components, "costCredits");
  const averageGenerationW = sum(components, "averageGenerationW");
  const peakSolarPowerW = sum(components, "peakPowerW");
  const batteryEnergyWh = sum(components, "energyWh");
  const activePowerW = sum(components, "activePowerW");
  const componentPeakPowerW = sum(components, "peakPowerW");

  // Member 1's simplified baseline uses 20 W average generation and 12 W average load.
  // Component-level values are used for trade-off deltas; the baseline is used when
  // a selected architecture does not provide a direct average-generation field.
  const averageGeneration = averageGenerationW || constraints.averageGenerationW;
  const averageLoadW = constraints.averageLoadW + activePowerW + componentPeakPowerW * 0.15;
  const peakLoadW = Math.max(constraints.peakLoadW, averageLoadW + activePowerW + componentPeakPowerW);

  const powerMarginW = averageGeneration - averageLoadW;
  const peakDeficitW = Math.max(0, peakLoadW - averageGeneration);

  const cameras = components.filter(c => c.category === "payload");
  const imagesPerDay = cameras.length ? 20 : 0;
  const dataPerDayMB = cameras.reduce(
    (total, c) => total + (Number(c.dataPerImageMB) || 0) * imagesPerDay,
    0
  );
  const dataPerDayGB = dataPerDayMB / 1024;
  const storageGb = Math.min(
    constraints.storageGb,
    components.reduce((max, c) => Math.max(max, Number(c.storageGb) || 0), 0) || constraints.storageGb
  );

  const violations = [];
  const warnings = [];

  if (!categories.has("payload")) violations.push("Missing Earth-observation camera payload.");
  for (const category of REQUIRED_CATEGORIES) {
    if (!categories.has(category)) violations.push(`Missing required subsystem: ${category}.`);
  }

  if (totalMassKg > constraints.maxMassKg) {
    violations.push(`Mass limit exceeded: ${totalMassKg.toFixed(2)} kg > ${constraints.maxMassKg.toFixed(2)} kg.`);
  } else if (totalMassKg > constraints.targetMassKg) {
    warnings.push(`Above the 8 kg design target: ${totalMassKg.toFixed(2)} kg.`);
  }

  if (averageLoadW > averageGeneration) {
    violations.push(`Average power deficit: ${averageLoadW.toFixed(2)} W load > ${averageGeneration.toFixed(2)} W generation.`);
  }

  if (batteryEnergyWh < constraints.batteryEnergyWh) {
    warnings.push(`Battery energy below the EarthWatch-1 baseline of ${constraints.batteryEnergyWh} Wh.`);
  }

  if (storageGb < constraints.storageGb) {
    warnings.push(`Onboard storage below the ${constraints.storageGb} GB baseline.`);
  }

  if (dataPerDayGB > storageGb) {
    violations.push(`Daily generated data exceeds available storage: ${dataPerDayGB.toFixed(2)} GB/day > ${storageGb.toFixed(2)} GB.`);
  }

  if (componentCostCredits > constraints.budgetCredits) {
    violations.push(`Budget exceeded: ${componentCostCredits} credits > ${constraints.budgetCredits} credits.`);
  }

  if (peakDeficitW > 0 && batteryEnergyWh <= 0) {
    violations.push("Peak-load support is required, but no battery energy is available.");
  } else if (peakDeficitW > 0) {
    warnings.push(`Peak load exceeds average generation by ${peakDeficitW.toFixed(2)} W; battery/duty cycling is required.`);
  }

  const feasibility = violations.length === 0;
  const status = !feasibility ? "FAIL" : warnings.length ? "PASS_WITH_WARNINGS" : "PASS";

  return {
    mission: constraints.mission,
    spacecraftType: constraints.spacecraftType,
    orbitAltitudeKm: constraints.orbitAltitudeKm,
    selectedComponentIds: components.map(c => c.id),
    metrics: {
      totalMassKg,
      targetMassKg: constraints.targetMassKg,
      massMarginKg: constraints.maxMassKg - totalMassKg,
      targetMassMarginKg: constraints.targetMassKg - totalMassKg,
      averageGenerationW: averageGeneration,
      averageLoadW,
      powerMarginW,
      peakLoadW,
      peakDeficitW,
      batteryEnergyWh,
      dataPerDayMB,
      dataPerDayGB,
      storageGb,
      storageUtilizationPercent: storageGb ? (dataPerDayGB / storageGb) * 100 : 0,
      budgetCredits: componentCostCredits,
      budgetCreditsRemaining: constraints.budgetCredits - componentCostCredits,
      budgetRemainingCredits: constraints.budgetCredits - componentCostCredits,
      scienceScore: cameras.reduce((n, c) => n + (Number(c.scienceScore) || 0), 0),
      imagesPerDay
    },
    constraints: {
      maxMassKg: constraints.maxMassKg,
      targetMassKg: constraints.targetMassKg,
      averageGenerationW: constraints.averageGenerationW,
      averageLoadW: constraints.averageLoadW,
      peakLoadW: constraints.peakLoadW,
      batteryEnergyWh: constraints.batteryEnergyWh,
      storageGb: constraints.storageGb,
      budgetCredits: constraints.budgetCredits
    },
    violations,
    warnings,
    status,
    feasible: feasibility
  };
}

export function getResourceStatus(mission) {
  const m = mission.metrics;
  return {
    mass: m.totalMassKg <= mission.constraints.maxMassKg ? "OK" : "OVER_LIMIT",
    averagePower: m.powerMarginW >= 0 ? "OK" : "DEFICIT",
    battery: m.batteryEnergyWh >= mission.constraints.batteryEnergyWh ? "OK" : "LOW",
    storage: m.storageUtilizationPercent <= 100 ? "OK" : "OVERFLOW",
    budget: m.budgetCredits <= mission.constraints.budgetCredits ? "OK" : "OVER_BUDGET"
  };
}

export function formatMetric(value, unit = "") {
  return `${Number(value).toFixed(2)}${unit ? ` ${unit}` : ""}`;
}
