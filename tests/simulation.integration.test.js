import { describe, expect, it } from "vitest";

import { startSimulation } from "../src/simulation/simulationEngine.js";
import {
  INITIAL_SIMULATION_STATE,
  SIMULATION_STAGES,
} from "../src/simulation/simulationStages.js";
import {
  SPACE_EVENTS,
  applySpaceEvent,
  pickRandomSpaceEvent,
} from "../src/simulation/SpaceEvents.js";

describe("LUNAFORGE simulation integration", () => {
  it("defines the five phases of the educational mission", () => {
    expect(SIMULATION_STAGES.map((stage) => stage.id)).toEqual([
      "launch",
      "orbit",
      "deployment",
      "observation",
      "communication",
    ]);
    expect(SIMULATION_STAGES.reduce((sum, stage) => sum + stage.durationMs, 0))
      .toBe(28000);
  });

  it("starts, pauses, resumes, and stops the simulation controller", () => {
    const controller = startSimulation({ tickMs: 1000 });

    expect(controller.getState()).toMatchObject(INITIAL_SIMULATION_STATE);

    controller.resume();
    expect(controller.getState().status).toBe("running");

    controller.pause();
    expect(controller.getState().status).toBe("paused");

    controller.resume();
    expect(controller.getState().status).toBe("running");

    controller.stop();
    expect(controller.getState().status).toBe("idle");
  });

  it("selects a deterministic scenario event when a random source is supplied", () => {
    expect(pickRandomSpaceEvent(() => 0).id).toBe(SPACE_EVENTS[0].id);
    expect(pickRandomSpaceEvent(() => 0.999999).id).toBe(SPACE_EVENTS.at(-1).id);
  });

  it("applies a solar-activity event while keeping resource values in range", () => {
    const next = applySpaceEvent(
      { powerPercent: 50, storagePercent: 10, communication: "Available" },
      SPACE_EVENTS.find((event) => event.id === "solar_activity"),
    );

    expect(next).toMatchObject({
      powerPercent: 38,
      storagePercent: 10,
      communication: "Available",
    });
  });

  it("records a communication gap and clamps storage at 100 percent", () => {
    const next = applySpaceEvent(
      { powerPercent: 20, storagePercent: 95, communication: "Available" },
      SPACE_EVENTS.find((event) => event.id === "temporary_comms_gap"),
    );

    expect(next).toMatchObject({
      powerPercent: 20,
      storagePercent: 100,
      communication: "Temporarily unavailable",
    });
  });
});
