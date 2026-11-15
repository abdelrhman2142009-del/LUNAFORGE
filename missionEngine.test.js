import { describe, expect, it } from "vitest";
import {
  calculateMission,
  getResourceStatus,
} from "../src/engine/missionEngine.js";
import { DEFAULT_MISSION_CONSTRAINTS } from "../src/engine/componentsData.js";
import { analyzeWhatIf } from "../src/engine/whatIf.js";
import { calculateMissionScore } from "../src/engine/scoring.js";

const validSelection = {
  structure: "structure-standard",
  power: "power-basic",
  battery: "battery-basic",
  payload: "payload-lowres-camera",
  communications: "comms-basic",
  computer: "computer-standard",
  attitude: "attitude-basic",
};

describe("LUNAFORGE mission engine", () => {
  it("calculates total mass correctly", () => {
    const mission = calculateMission(validSelection);

    // 4 + 2 + 1.5 + 1.5 + 1 + 1 + 1.5 = 12.5 kg
    expect(mission.metrics.massKg).toBe(12.5);
  });

  it("calculates power generation, consumption and margin", () => {
    const mission = calculateMission(validSelection);

    expect(mission.metrics.power.generatedW).toBe(18);
    expect(mission.metrics.power.consumedW).toBe(9);
    expect(mission.metrics.power.marginW).toBe(9);
  });

  it("calculates budget", () => {
    const mission = calculateMission(validSelection);

    expect(mission.metrics.budgetCredits).toBe(73000);
  });

  it("calculates daily data and storage", () => {
    const mission = calculateMission(validSelection);

    expect(mission.metrics.data.generatedMbPerDay).toBe(270);
    expect(mission.metrics.data.capacityGb).toBe(10);
    expect(mission.metrics.data.daysUntilStorageFull).toBeCloseTo(
      37.93,
      2
    );
  });

  it("detects a mass violation", () => {
    const mission = calculateMission({
      structure: "structure-reinforced",
      power: "power-high",
      battery: "battery-large",
      payload: "payload-highres-camera",
      communications: "comms-highrate",
      computer: "computer-standard",
      attitude: "attitude-precision",
    });

    expect(mission.status).toBe("FAIL");
    expect(
      mission.violations.some((v) => v.id === "mass-limit")
    ).toBe(true);
  });

  it("detects missing required subsystems", () => {
    const mission = calculateMission({
      structure: "structure-standard",
      power: "power-basic",
    });

    expect(mission.status).toBe("FAIL");
    expect(
      mission.violations.some(
        (v) => v.id === "missing-payload"
      )
    ).toBe(true);
  });

  it("returns resource status for the UI", () => {
    const mission = calculateMission(validSelection);
    const status = getResourceStatus(mission);

    expect(status.mass.status).toBe("OVER_LIMIT");
    expect(status.power.status).toBe("OK");
    expect(status.budget.status).toBe("OK");
  });

  it("compares a What-If configuration", () => {
    const result = analyzeWhatIf(
      validSelection,
      {
        ...validSelection,
        payload: "payload-highres-camera",
      }
    );

    const scienceChange = result.changes.find(
      (c) => c.name === "Scientific value"
    );

    expect(scienceChange.delta).toBe(30);
    expect(result.status.after).toBe("FAIL");
    expect(result.interpretation.length).toBeGreaterThan(0);
  });

  it("produces a bounded mission score", () => {
    const mission = calculateMission(validSelection);
    const score = calculateMissionScore(mission);

    expect(score.total).toBeGreaterThanOrEqual(0);
    expect(score.total).toBeLessThanOrEqual(100);
    expect(["S", "A", "B", "C", "D", "F"]).toContain(score.grade);
  });

  it("rejects unknown components", () => {
    expect(() =>
      calculateMission({
        ...validSelection,
        payload: "does-not-exist",
      })
    ).toThrow(/Unknown component id/);
  });

  it("uses the documented default constraints", () => {
    expect(DEFAULT_MISSION_CONSTRAINTS.maxMassKg).toBe(12);
    expect(DEFAULT_MISSION_CONSTRAINTS.maxBudgetCredits).toBe(120000);
  });
});
