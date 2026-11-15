import { describe, expect, it } from "vitest";
import { calculateMission } from "../src/engine/missionEngine.js";
import { COMPONENTS_BY_ID } from "../src/engine/componentsData.js";
import missionProfile from "../src/data/nile_delta_watch.json";
import { evaluateNileDeltaMission } from "../src/simulation/missionObjectives.js";

const validSelection = [
  "structure_6u", "camera_basic", "solar_body_6u", "battery_high_capacity",
  "comms_basic", "adcs_basic", "computer_standard", "eps_standard",
];

describe("Nile Delta Watch mission objectives", () => {
  it("references only component IDs that exist in the canonical runtime catalog", () => {
    const referencedIds = Object.values(missionProfile.compatibleComponentIds).flat();
    expect(referencedIds.length).toBeGreaterThan(0);
    for (const id of referencedIds) expect(COMPONENTS_BY_ID[id]).toBeDefined();
    expect(missionProfile.mission.id).toBe("nile_delta_watch");
  });
  it("uses the selected solar panel's average output, not its peak rating as average generation", () => {
    const body = calculateMission(validSelection);
    const deployable = calculateMission(validSelection.map((id) => id === "solar_body_6u" ? "solar_deployable_6u" : id));
    expect(body.metrics.peakSolarPowerW).toBe(27.8);
    expect(body.metrics.averageGenerationW).toBeCloseTo(20.016);
    expect(deployable.metrics.peakSolarPowerW).toBe(57.6);
    expect(deployable.metrics.averageGenerationW).toBeCloseTo(41.472);
    expect(deployable.metrics.averageLoadW).toBe(body.metrics.averageLoadW);
  });

  it("does not count solar generation as a subsystem load", () => {
    const mission = calculateMission(validSelection);
    expect(mission.metrics.averageLoadW).toBeCloseTo(13.95);
    expect(mission.metrics.powerMarginW).toBeCloseTo(6.066);
  });

  it("calculates a successful basic-camera mission with adequate storage and downlink", () => {
    const engineeringMission = calculateMission(validSelection);
    const outcome = evaluateNileDeltaMission({ engineeringMission });
    expect(outcome.areasObserved).toBe(3);
    expect(outcome.generatedDataMB).toBe(525);
    expect(outcome.transmittedDataMB).toBe(525);
    expect(outcome.dataDownlinkedPercent).toBe(100);
    expect(outcome.missionSuccess).toBe(true);
    expect(outcome.objectives.every((objective) => objective.completed)).toBe(true);
  });

  it("does not mark areas observed without a camera and attitude control", () => {
    const engineeringMission = calculateMission(validSelection);
    const outcome = evaluateNileDeltaMission({
      engineeringMission: { ...engineeringMission, selectedComponentIds: ["camera_basic"] },
    });
    expect(outcome.areasObserved).toBe(0);
    expect(outcome.missionSuccess).toBe(false);
  });

  it("reduces transmitted data when a ground-station contact is missed", () => {
    const engineeringMission = calculateMission(validSelection);
    const outcome = evaluateNileDeltaMission({
      engineeringMission,
      durationDays: 7,
      missedContacts: 2,
    });
    expect(outcome.availableContacts).toBe(5);
    expect(outcome.transmittedDataMB).toBe(375);
    expect(outcome.dataDownlinkedPercent).toBeCloseTo(71.4286, 3);
    expect(outcome.missionSuccess).toBe(false);
  });

  it("fails the data-delivery objective when downlink capacity is insufficient", () => {
    const engineeringMission = calculateMission(validSelection);
    const limitedDownlink = {
      ...engineeringMission,
      metrics: { ...engineeringMission.metrics, downlinkCapacityMBPerContact: 10 },
    };
    const outcome = evaluateNileDeltaMission({ engineeringMission: limitedDownlink, durationDays: 7 });
    expect(outcome.dataDownlinkedPercent).toBeLessThan(80);
    expect(outcome.missionSuccess).toBe(false);
    expect(outcome.reasons.some((reason) => reason.includes("transmitted"))).toBe(true);
  });
});
