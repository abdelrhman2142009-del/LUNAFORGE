import { describe, expect, it } from "vitest";
import {
  calculateOrbitalState,
  getOrbitPeriodSeconds,
  angularDistanceDegrees,
  isWithinGroundFootprint,
} from "../src/simulation/orbitMechanics.js";

describe("simplified orbital mechanics", () => {
  it("calculates a low Earth orbit period near 95 minutes at 500 km", () => {
    const periodMinutes = getOrbitPeriodSeconds(500) / 60;
    expect(periodMinutes).toBeGreaterThan(90);
    expect(periodMinutes).toBeLessThan(100);
  });

  it("moves the satellite as mission time advances", () => {
    const first = calculateOrbitalState(0);
    const later = calculateOrbitalState(1200);
    expect(later.phaseDeg).not.toBe(first.phaseDeg);
    expect(later.longitudeDeg).not.toBe(first.longitudeDeg);
  });

  it("keeps latitude and longitude in valid ranges", () => {
    const state = calculateOrbitalState(123456);
    expect(state.latitudeDeg).toBeGreaterThanOrEqual(-90);
    expect(state.latitudeDeg).toBeLessThanOrEqual(90);
    expect(state.longitudeDeg).toBeGreaterThanOrEqual(-180);
    expect(state.longitudeDeg).toBeLessThanOrEqual(180);
  });

  it("handles longitude wrap-around when measuring target distance", () => {
    expect(angularDistanceDegrees(
      { latitudeDeg: 0, longitudeDeg: 179 },
      { latitudeDeg: 0, longitudeDeg: -179 },
    )).toBeCloseTo(2, 1);
  });

  it("checks whether a target is inside the simplified footprint", () => {
    expect(isWithinGroundFootprint(
      { latitudeDeg: 30, longitudeDeg: 31 },
      { latitudeDeg: 31, longitudeDeg: 32 },
      3,
    )).toBe(true);
  });
});
