import { describe, expect, it } from "vitest";

import {
  calculateMission,
  calculateResources,
  getResourceStatus,
  validateMission,
} from "../src/engine/missionEngine.js";
import { calculateMissionScore } from "../src/engine/scoring.js";
import { analyzeWhatIf } from "../src/engine/whatIf.js";
import {
  runEngineeringAnalysis,
  runEngineeringWhatIf,
} from "../src/engine/engineAdapter.js";
import { MISSION_BASELINE } from "../src/engine/componentsData.js";

const completeSelection = {
  structure: "structure_6u",
  payload: "camera_basic",
  solar: "solar_body_6u",
  battery: "battery_high_capacity",
  communications: "comms_basic",
  adcs: "adcs_basic",
  computer: "computer_standard",
  eps: "eps_standard",
};

const comfortableConstraints = {
  ...MISSION_BASELINE,
  maxMassKg: 100,
  targetMassKg: 100,
  averageGenerationW: 100,
  averageLoadW: 5,
  peakLoadW: 10,
  batteryEnergyWh: 44,
  storageGb: 32,
  budgetCredits: 2000,
};

describe("LUNAFORGE integration contract", () => {
  it("calculates simple resource totals for the compatibility API", () => {
    const totals = calculateResources([
      { mass: 1.5, power: 2, cost: 100, storageUsed: 4 },
      { mass: 2, power: 5, cost: 200, storageUsed: 6 },
    ]);

    expect(totals).toMatchObject({
      totalMass: 3.5,
      totalPower: 7,
      totalCost: 300,
      storageUsed: 10,
      isValid: true,
    });
  });

  it("validates mass, budget, power, and storage constraints", () => {
    const result = validateMission(
      { totalMass: 6, totalCost: 800, totalPower: 12, storageUsed: 8 },
      { constraints: { maxMass: 5, maxBudget: 1000, maxPower: 15, minStorage: 4 } },
    );

    expect(result).toMatchObject({
      massValid: false,
      budgetValid: true,
      powerValid: true,
      storageValid: true,
      isValid: false,
    });
    expect(result.warnings).toContain("Mass limit exceeded.");
  });

  it("calculates a complete mission from canonical component IDs", () => {
    const mission = calculateMission(completeSelection, comfortableConstraints);

    expect(mission.selectedComponentIds).toHaveLength(8);
    expect(mission.metrics.totalMassKg).toBeGreaterThan(0);
    expect(mission.metrics.budgetCredits).toBe(940);
    expect(mission.metrics.batteryEnergyWh).toBe(88.8);
    expect(mission.feasible).toBe(true);
    expect(mission.status).toBe("PASS");
    expect(mission.violations).toEqual([]);
  });

  it("rejects unknown component IDs instead of silently ignoring them", () => {
    expect(() => calculateMission({ payload: "not-a-real-component" }))
      .toThrow("Unknown component: not-a-real-component");
  });

  it("returns resource status labels for a calculated mission", () => {
    const mission = calculateMission(completeSelection, comfortableConstraints);
    const status = getResourceStatus(mission);

    expect(status).toEqual({
      mass: "OK",
      averagePower: "OK",
      battery: "OK",
      storage: "OK",
      budget: "OK",
    });
  });

  it("produces a bounded mission score and a grade", () => {
    const mission = calculateMission(completeSelection, comfortableConstraints);
    const score = calculateMissionScore(mission);

    expect(score.total).toBeGreaterThanOrEqual(0);
    expect(score.total).toBeLessThanOrEqual(100);
    expect(["S", "A", "B", "C", "D", "F"]).toContain(score.grade);
    expect(score.note).toMatch(/not an aerospace certification/i);
  });

  it("reports What-If component and metric changes", () => {
    const upgradedSelection = {
      ...completeSelection,
      payload: "camera_advanced",
    };
    const result = analyzeWhatIf(
      completeSelection,
      upgradedSelection,
      comfortableConstraints,
    );

    expect(result.changedComponents.added).toContain("camera_advanced");
    expect(result.changedComponents.removed).toContain("camera_basic");
    expect(result.comparison.scienceScore.absolute).toBe(30);
    expect(result.comparison.totalMassKg.absolute).toBeCloseTo(0.3);
  });

  it("adapts Builder component IDs to the engineering engine", () => {
    const builderSelection = [
      { id: "structure-1" },
      { id: "power-1" },
      { id: "battery-2" },
      { id: "camera-1" },
      { id: "communication-1" },
      { id: "computer-1" },
      { id: "adcs-1" },
      { id: "eps-1" },
    ];

    const report = runEngineeringAnalysis(builderSelection);

    expect(report.mission.selectedComponentIds).toContain("camera_basic");
    expect(report.mission.selectedComponentIds).toContain("structure_6u");
    expect(report.score.total).toBeGreaterThanOrEqual(0);
    expect(report.resourceStatus).toHaveProperty("averagePower");
  });

  it("supports What-If analysis through the Builder adapter", () => {
    const before = [{ id: "camera-1" }];
    const after = [{ id: "camera-2" }];
    const result = runEngineeringWhatIf(before, after);

    expect(result.changedComponents.added).toContain("camera_advanced");
    expect(result.changedComponents.removed).toContain("camera_basic");
  });
});
