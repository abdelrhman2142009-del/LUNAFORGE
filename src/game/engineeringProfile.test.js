import { describe, expect, it } from "vitest";
import { buildFlightProfile, getDailyChallenge } from "./engineeringProfile.js";

describe("engineering-driven flight profile", () => {
  it("rewards a lighter precision spacecraft with better agility", () => {
    const light = buildFlightProfile({ selectedComponents: [{ id: "adcs-2" }], totals: { mass: 2, batteryCapacityWh: 40 }, solarPower: 20 });
    const heavy = buildFlightProfile({ selectedComponents: [{ id: "adcs-1" }], totals: { mass: 8, batteryCapacityWh: 40 }, solarPower: 20 });
    expect(light.agility).toBeGreaterThan(heavy.agility);
  });
  it("gives higher battery capacity a larger boost reserve", () => {
    const small = buildFlightProfile({ selectedComponents: [], totals: { batteryCapacityWh: 20 } });
    const large = buildFlightProfile({ selectedComponents: [], totals: { batteryCapacityWh: 90 } });
    expect(large.boostCapacity).toBeGreaterThan(small.boostCapacity);
    expect(large.shieldDuration).toBeGreaterThan(small.shieldDuration);
  });
  it("creates a stable daily challenge for a given date", () => {
    const date = new Date("2026-11-15T12:00:00Z");
    expect(getDailyChallenge(date)).toEqual(getDailyChallenge(date));
    expect(getDailyChallenge(date).coreGoal).toBeGreaterThanOrEqual(8);
  });
});