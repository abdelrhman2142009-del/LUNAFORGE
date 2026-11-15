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
  return components.reduce((total, component) => total + (Number(component[key]) || 0), 0);
}

export function calculateMission(selection, constraints = MISSION_BASELINE) {
  const components = resolveComponents(selection);
  const categories = new Set(components.map((component) => component.category));
  const totalMassKg = sum(components, "massKg");
  const componentCostCredits = sum(components, "costCredits");

  const solarComponents = components.filter((component) => component.category === "solar");
  const averageGenerationW = sum(solarComponents, "averageGenerationW");
  const peakSolarPowerW = sum(solarComponents, "peakPowerW");

  const batteryEnergyWh = sum(components, "energyWh");
  const activePowerW = sum(components, "activePowerW");
  const nonSolarPeakPowerW = components
    .filter((component) => component.category !== "solar")
    .reduce((total, component) => total + (Number(component.peakPowerW) || 0), 0);

  // Baseline average load represents bus/housekeeping demand. Selected active
  // subsystem loads add a 15% duty-cycle gameplay estimate. Solar generation
  // is never counted as a load.
  const averageLoadW = constraints.averageLoadW + activePowerW * 0.15;
  const peakLoadW = Math.max(
    constraints.peakLoadW,
    constraints.averageLoadW + nonSolarPeakPowerW
  );
  const powerMarginW = averageGenerationW - averageLoadW;
  const peakDeficitW = Math.max(0, peakLoadW - averageGenerationW);

  const cameras = components.filter((component) => component.category === "payload");
  const imagesPerDay = cameras.reduce((total, camera) => total + (Number(camera.imagesPerDay) || 0), 0);
  const dataPerDayMB = cameras.reduce(
    (total, camera) => total + (Number(camera.dataPerImageMB) || 0) * (Number(camera.imagesPerDay) || 0),
    0
  );
  const dataPerDayGB = dataPerDayMB / 1024;
  const selectedStorageGb = components
    .filter((component) => component.category === "computer")
    .reduce((max, component) => Math.max(max, Number(component.storageGb) || 0), 0);
  const storageGb = Math.min(constraints.storageGb, selectedStorageGb);

  const communication = components.find((component) => component.category === "communications");
  const downlinkRateMbps = Number(communication?.dataRateMbps) || 0;
  const downlinkCapacityMBPerContact =
    downlinkRateMbps * (constraints.groundContactMinutes || 10) * 60 / 8;

  const violations = [];
  const warnings = [];

  for (const category of REQUIRED_CATEGORIES) {
    if (!categories.has(category)) violations.push(`Missing required subsystem: ${category}.`);
  }
  if (totalMassKg > constraints.maxMassKg) {
    violations.push(`Mass limit exceeded: ${totalMassKg.toFixed(2)} kg > ${constraints.maxMassKg.toFixed(2)} kg.`);
  } else if (totalMassKg > constraints.targetMassKg) {
    warnings.push(`Above the ${constraints.targetMassKg.toFixed(2)} kg design target: ${totalMassKg.toFixed(2)} kg.`);
  }
  if (averageGenerationW <= 0) {
    violations.push("No selected solar array provides average power generation.");
  } else if (averageLoadW > averageGenerationW) {
    violations.push(`Average power deficit: ${averageLoadW.toFixed(2)} W load > ${averageGenerationW.toFixed(2)} W generation.`);
  }
  if (batteryEnergyWh < constraints.batteryEnergyWh) {
    warnings.push(`Battery energy below the ${constraints.batteryEnergyWh} Wh mission reference target.`);
  }
  if (storageGb <= 0) {
    violations.push("No onboard data storage is selected.");
  }
  if (dataPerDayGB > storageGb) {
    violations.push(`Daily generated data exceeds available storage: ${dataPerDayGB.toFixed(2)} GB/day > ${storageGb.toFixed(2)} GB.`);
  }
  if (downlinkRateMbps <= 0) {
    violations.push("No communication downlink rate is configured.");
  }
  if (componentCostCredits > constraints.budgetCredits) {
    violations.push(`Budget exceeded: ${componentCostCredits} credits > ${constraints.budgetCredits} credits.`);
  }
  if (peakDeficitW > 0 && batteryEnergyWh <= 0) {
    violations.push("Peak-load support is required, but no battery energy is available.");
  } else if (peakDeficitW > 0) {
    warnings.push(`Peak load exceeds average generation by ${peakDeficitW.toFixed(2)} W; battery support and duty cycling are simplified assumptions.`);
  }

  const feasible = violations.length === 0;
  const status = !feasible ? "FAIL" : warnings.length ? "PASS_WITH_WARNINGS" : "PASS";

  return {
    mission: constraints.mission,
    spacecraftType: constraints.spacecraftType,
    orbitAltitudeKm: constraints.orbitAltitudeKm,
    selectedComponentIds: components.map((component) => component.id),
    metrics: {
      totalMassKg,
      targetMassKg: constraints.targetMassKg,
      massMarginKg: constraints.maxMassKg - totalMassKg,
      targetMassMarginKg: constraints.targetMassKg - totalMassKg,
      averageGenerationW,
      peakSolarPowerW,
      averageLoadW,
      activePowerW,
      powerMarginW,
      peakLoadW,
      peakDeficitW,
      batteryEnergyWh,
      dataPerDayMB,
      dataPerDayGB,
      imagesPerDay,
      storageGb,
      storageUtilizationPercent: storageGb ? (dataPerDayGB / storageGb) * 100 : 0,
      downlinkRateMbps,
      downlinkCapacityMBPerContact,
      budgetCredits: componentCostCredits,
      budgetCreditsRemaining: constraints.budgetCredits - componentCostCredits,
      budgetRemainingCredits: constraints.budgetCredits - componentCostCredits,
      scienceScore: cameras.reduce((total, camera) => total + (Number(camera.scienceScore) || 0), 0),
    },
    constraints: { ...constraints },
    violations,
    warnings,
    status,
    feasible,
  };
}

export function getResourceStatus(mission) {
  const metrics = mission.metrics;
  return {
    mass: metrics.totalMassKg <= mission.constraints.maxMassKg ? "OK" : "OVER_LIMIT",
    averagePower: metrics.powerMarginW >= 0 ? "OK" : "DEFICIT",
    battery: metrics.batteryEnergyWh >= mission.constraints.batteryEnergyWh ? "OK" : "LOW",
    storage: metrics.storageUtilizationPercent <= 100 ? "OK" : "OVERFLOW",
    budget: metrics.budgetCredits <= mission.constraints.budgetCredits ? "OK" : "OVER_BUDGET",
  };
}

export function formatMetric(value, unit = "") {
  return `${Number(value).toFixed(2)}${unit ? ` ${unit}` : ""}`;
}

export function calculateResources(selectedComponents = []) {
  const components = Array.isArray(selectedComponents) ? selectedComponents : [];
  const totalMass = components.reduce((total, component) => total + (Number(component.mass ?? component.massKg) || 0), 0);
  const totalPower = components.reduce((total, component) => total + (Number(component.power ?? component.powerW ?? component.powerConsumptionW ?? component.activePowerW) || 0), 0);
  const totalCost = components.reduce((total, component) => total + (Number(component.cost ?? component.costCredits) || 0), 0);
  const storageUsed = components.reduce((total, component) => total + (Number(component.storageUsed ?? component.storageGb) || 0), 0);
  return { totalMass, totalPower, totalCost, storageUsed, isValid: true, warnings: [] };
}

export function validateMission(resources, mission = {}) {
  const constraints = mission.constraints || {};
  const maxMass = Number(constraints.maxMass ?? constraints.maxMassKg ?? Infinity);
  const maxBudget = Number(constraints.maxBudget ?? constraints.maxBudgetCredits ?? Infinity);
  const massValid = resources.totalMass <= maxMass;
  const budgetValid = resources.totalCost <= maxBudget;
  const powerValid = resources.totalPower <= Number(constraints.maxPower ?? constraints.maxAveragePowerConsumptionW ?? Infinity);
  const storageValid = resources.storageUsed >= Number(constraints.minStorage ?? 0);
  const warnings = [];
  if (!massValid) warnings.push("Mass limit exceeded.");
  if (!budgetValid) warnings.push("Budget limit exceeded.");
  if (!powerValid) warnings.push("Power limit exceeded.");
  if (!storageValid) warnings.push("Storage requirement not met.");
  return { massValid, budgetValid, powerValid, storageValid, isValid: massValid && budgetValid && powerValid && storageValid, warnings };
}
