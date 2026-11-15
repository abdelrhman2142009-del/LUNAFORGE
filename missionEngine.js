/**
 * LUNAFORGE - Core mission calculation engine.
 *
 * This module is intentionally UI-agnostic. React components should call
 * these pure functions and render the returned result.
 */

import {
  DEFAULT_MISSION_CONSTRAINTS,
  getComponentById,
} from "./componentsData.js";

const EPSILON = 1e-9;

function round(value, decimals = 2) {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

function assertFiniteNonNegative(value, name) {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${name} must be a finite non-negative number.`);
  }
}

function normalizeSelection(selection) {
  if (!selection || typeof selection !== "object") {
    throw new Error("selection must be an object.");
  }

  const ids = Array.isArray(selection)
    ? selection
    : Object.values(selection).flatMap((value) =>
        Array.isArray(value) ? value : value ? [value] : []
      );

  const uniqueIds = [...new Set(ids)];
  const components = uniqueIds.map((id) => {
    const component = getComponentById(id);
    if (!component) throw new Error(`Unknown component id: ${id}`);
    return component;
  });

  return components;
}

function calculateMass(components) {
  return components.reduce((sum, c) => sum + (c.massKg || 0), 0);
}

function calculatePower(components) {
  const generatedW = components.reduce((sum, c) => sum + (c.powerW || 0), 0);
  const consumedW = components.reduce(
    (sum, c) => sum + (c.powerConsumptionW || 0),
    0
  );

  return {
    generatedW,
    consumedW,
    marginW: generatedW - consumedW,
    generationToConsumptionRatio:
      consumedW > 0 ? generatedW / consumedW : Infinity,
  };
}

function calculateBudget(components) {
  return components.reduce(
    (sum, c) => sum + (c.costCredits || 0),
    0
  );
}

function calculateData(components) {
  const generatedMbPerDay = components.reduce(
    (sum, c) => sum + (c.dataMbPerDay || 0),
    0
  );

  const capacityGb = components.reduce(
    (sum, c) => sum + (c.storageGb || 0),
    0
  );

  const capacityMb = capacityGb * 1024;

  return {
    generatedMbPerDay,
    capacityGb,
    capacityMb,
    daysUntilStorageFull:
      generatedMbPerDay > 0 ? capacityMb / generatedMbPerDay : Infinity,
  };
}

function calculateReliability(components) {
  if (components.length === 0) return 0;

  // Independent simplified gameplay model:
  // system reliability = product of subsystem reliabilities.
  const value = components.reduce(
    (product, c) => product * (c.reliability ?? 1),
    1
  );

  return Math.max(0, Math.min(1, value));
}

function calculateScienceValue(components) {
  return components.reduce((sum, c) => sum + (c.scienceValue || 0), 0);
}

function checkRequiredCategories(components, constraints) {
  const present = new Set(components.map((c) => c.category));
  return constraints.requiredCategories
    .filter((category) => !present.has(category))
    .map((category) => ({
      id: `missing-${category}`,
      severity: "critical",
      category,
      message: `Required subsystem missing: ${category}.`,
    }));
}

function evaluateConstraints(metrics, components, constraints) {
  const violations = [];

  if (metrics.massKg > constraints.maxMassKg + EPSILON) {
    violations.push({
      id: "mass-limit",
      severity: "critical",
      metric: "massKg",
      actual: metrics.massKg,
      limit: constraints.maxMassKg,
      message: `Mass exceeds the ${constraints.maxMassKg} kg limit.`,
    });
  }

  if (
    metrics.power.consumedW > constraints.maxAveragePowerConsumptionW + EPSILON
  ) {
    violations.push({
      id: "power-consumption-limit",
      severity: "critical",
      metric: "consumedW",
      actual: metrics.power.consumedW,
      limit: constraints.maxAveragePowerConsumptionW,
      message: `Average power consumption exceeds the ${constraints.maxAveragePowerConsumptionW} W limit.`,
    });
  }

  if (metrics.power.marginW < constraints.minPowerMarginW - EPSILON) {
    violations.push({
      id: "power-margin",
      severity: "critical",
      metric: "marginW",
      actual: metrics.power.marginW,
      limit: constraints.minPowerMarginW,
      message: `Power margin is below the required ${constraints.minPowerMarginW} W.`,
    });
  }

  if (metrics.budgetCredits > constraints.maxBudgetCredits + EPSILON) {
    violations.push({
      id: "budget-limit",
      severity: "critical",
      metric: "budgetCredits",
      actual: metrics.budgetCredits,
      limit: constraints.maxBudgetCredits,
      message: `Budget exceeds the ${constraints.maxBudgetCredits} credit limit.`,
    });
  }

  if (
    metrics.data.generatedMbPerDay >
    constraints.maxDataGeneratedMbPerDay + EPSILON
  ) {
    violations.push({
      id: "data-generation-limit",
      severity: "warning",
      metric: "generatedMbPerDay",
      actual: metrics.data.generatedMbPerDay,
      limit: constraints.maxDataGeneratedMbPerDay,
      message: `Generated data exceeds the modeled daily processing limit.`,
    });
  }

  if (metrics.data.capacityGb + EPSILON < constraints.minDataCapacityGb) {
    violations.push({
      id: "storage-minimum",
      severity: "critical",
      metric: "capacityGb",
      actual: metrics.data.capacityGb,
      limit: constraints.minDataCapacityGb,
      message: `Data storage is below the required ${constraints.minDataCapacityGb} GB.`,
    });
  }

  if (metrics.scienceValue + EPSILON < constraints.minScienceScore) {
    violations.push({
      id: "science-minimum",
      severity: "critical",
      metric: "scienceValue",
      actual: metrics.scienceValue,
      limit: constraints.minScienceScore,
      message: `Scientific value is below the required mission threshold.`,
    });
  }

  violations.push(...checkRequiredCategories(components, constraints));

  return violations;
}

/**
 * Calculate a complete mission state from a component selection.
 *
 * selection can be:
 *   { structure: "structure-standard", power: "power-basic", ... }
 * or an array of component ids.
 */
export function calculateMission(
  selection,
  constraints = DEFAULT_MISSION_CONSTRAINTS
) {
  const components = normalizeSelection(selection);

  const metrics = {
    massKg: calculateMass(components),
    power: calculatePower(components),
    budgetCredits: calculateBudget(components),
    data: calculateData(components),
    reliability: calculateReliability(components),
    scienceValue: calculateScienceValue(components),
    componentCount: components.length,
  };

  const violations = evaluateConstraints(metrics, components, constraints);

  const criticalCount = violations.filter(
    (v) => v.severity === "critical"
  ).length;

  const warningCount = violations.filter(
    (v) => v.severity === "warning"
  ).length;

  return {
    components: components.map((c) => c.id),
    metrics: {
      massKg: round(metrics.massKg),
      power: {
        generatedW: round(metrics.power.generatedW),
        consumedW: round(metrics.power.consumedW),
        marginW: round(metrics.power.marginW),
        generationToConsumptionRatio:
          metrics.power.generationToConsumptionRatio === Infinity
            ? Infinity
            : round(metrics.power.generationToConsumptionRatio, 3),
      },
      budgetCredits: round(metrics.budgetCredits),
      data: {
        generatedMbPerDay: round(metrics.data.generatedMbPerDay),
        capacityGb: round(metrics.data.capacityGb, 3),
        capacityMb: round(metrics.data.capacityMb),
        daysUntilStorageFull:
          metrics.data.daysUntilStorageFull === Infinity
            ? Infinity
            : round(metrics.data.daysUntilStorageFull, 2),
      },
      reliability: round(metrics.reliability, 4),
      scienceValue: round(metrics.scienceValue),
      componentCount: metrics.componentCount,
    },
    constraints,
    violations,
    status:
      criticalCount > 0
        ? "FAIL"
        : warningCount > 0
          ? "PASS_WITH_WARNINGS"
          : "PASS",
    summary: {
      criticalCount,
      warningCount,
      isFeasible: criticalCount === 0,
    },
  };
}

export function formatMetric(value, unit = "") {
  if (value === Infinity) return "Unlimited";
  return `${value}${unit ? ` ${unit}` : ""}`;
}

export function getResourceStatus(mission) {
  const { metrics, constraints } = mission;

  return {
    mass: {
      value: metrics.massKg,
      limit: constraints.maxMassKg,
      remaining: round(constraints.maxMassKg - metrics.massKg),
      percentage: round(
        (metrics.massKg / constraints.maxMassKg) * 100,
        1
      ),
      status:
        metrics.massKg <= constraints.maxMassKg ? "OK" : "OVER_LIMIT",
    },
    power: {
      value: metrics.power.consumedW,
      limit: constraints.maxAveragePowerConsumptionW,
      margin: metrics.power.marginW,
      status:
        metrics.power.marginW >= constraints.minPowerMarginW
          ? "OK"
          : "LOW_MARGIN",
    },
    budget: {
      value: metrics.budgetCredits,
      limit: constraints.maxBudgetCredits,
      remaining: round(
        constraints.maxBudgetCredits - metrics.budgetCredits
      ),
      percentage: round(
        (metrics.budgetCredits / constraints.maxBudgetCredits) * 100,
        1
      ),
      status:
        metrics.budgetCredits <= constraints.maxBudgetCredits
          ? "OK"
          : "OVER_LIMIT",
    },
    data: {
      generatedMbPerDay: metrics.data.generatedMbPerDay,
      capacityGb: metrics.data.capacityGb,
      daysUntilStorageFull: metrics.data.daysUntilStorageFull,
      status:
        metrics.data.capacityGb >= constraints.minDataCapacityGb
          ? "OK"
          : "INSUFFICIENT_STORAGE",
    },
  };
}
