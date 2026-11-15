import { describe, expect, it } from "vitest";
import {
  buildNileDeltaImageryUrl,
  getNasaObservationDate,
  NASA_EARTH_TEXTURE_URL,
  NASA_IMAGERY_LAYERS,
} from "../src/data/nasaEarthData.js";

describe("NASA Earth imagery configuration", () => {
  it("uses NASA GIBS for the realistic Earth texture", () => {
    expect(NASA_EARTH_TEXTURE_URL).toContain("gibs.earthdata.nasa.gov");
    expect(NASA_EARTH_TEXTURE_URL).toContain("BlueMarble_NextGeneration");
  });

  it("builds a Nile Delta image request with the selected NASA layer and date", () => {
    const url = new URL(buildNileDeltaImageryUrl({
      layer: NASA_IMAGERY_LAYERS[1].id,
      date: "2026-11-12",
    }));
    expect(url.hostname).toBe("gibs.earthdata.nasa.gov");
    expect(url.searchParams.get("LAYERS")).toBe(NASA_IMAGERY_LAYERS[1].id);
    expect(url.searchParams.get("TIME")).toBe("2026-11-12");
    expect(url.searchParams.get("BBOX")).toBe("29,30,33,33");
  });

  it("calculates observation dates deterministically in UTC", () => {
    expect(getNasaObservationDate(2, new Date("2026-11-15T12:00:00Z"))).toBe("2026-11-13");
  });
});
