// LUNAFORGE — Member 3 Engineering Data
// Aligned with Member 1's EarthWatch-1 baseline.
// Source-backed values and gameplay assumptions are intentionally kept distinct.

export const MISSION_BASELINE = {
  "maxMassKg": 12.0,
  "targetMassKg": 8.0,
  "averageGenerationW": 20.0,
  "averageLoadW": 12.0,
  "peakLoadW": 30.0,
  "batteryEnergyWh": 88.8,
  "storageGb": 32.0,
  "budgetCredits": 1000,
  "mission": "EarthWatch-1",
  "spacecraftType": "6U CubeSat",
  "orbitAltitudeKm": 500
};

export const REQUIRED_CATEGORIES = [
  "structure",
  "payload",
  "solar",
  "battery",
  "communications",
  "adcs",
  "computer",
  "eps"
];

export const COMPONENT_CATALOG = [
  {
    "id": "camera_basic",
    "category": "payload",
    "name": "Basic Earth-observation camera",
    "massKg": 0.5,
    "activePowerW": 3,
    "dataPerImageMB": 25,
    "costCredits": 120,
    "scienceScore": 55
  },
  {
    "id": "camera_advanced",
    "category": "payload",
    "name": "Advanced Earth-observation camera",
    "massKg": 0.8,
    "activePowerW": 5,
    "dataPerImageMB": 60,
    "costCredits": 220,
    "scienceScore": 85
  },
  {
    "id": "solar_body_6u",
    "category": "solar",
    "name": "6U body-mounted solar panels",
    "massKg": 0.45,
    "peakPowerW": 27.8,
    "costCredits": 140,
    "sourceStatus": "game_design_assumption; peak power is a NASA-listed product example"
  },
  {
    "id": "solar_deployable_6u",
    "category": "solar",
    "name": "6U deployable solar array",
    "massKg": 0.78,
    "peakPowerW": 57.6,
    "costCredits": 230,
    "sourceStatus": "peak power and calculated mass based on NASA-listed SP6X data; credits are game assumptions"
  },
  {
    "id": "battery_standard",
    "category": "battery",
    "name": "Standard Li-ion battery pack",
    "massKg": 0.35,
    "energyWh": 44.0,
    "costCredits": 100
  },
  {
    "id": "battery_high_capacity",
    "category": "battery",
    "name": "High-capacity Li-ion battery pack",
    "massKg": 0.52,
    "energyWh": 88.8,
    "costCredits": 180,
    "sourceStatus": "energy and estimated mass based on NASA-listed GomSpace pack data"
  },
  {
    "id": "comms_basic",
    "category": "communications",
    "name": "Basic communication system",
    "massKg": 0.35,
    "peakPowerW": 5,
    "dataRateKbps": 9.6,
    "costCredits": 100
  },
  {
    "id": "comms_high_rate",
    "category": "communications",
    "name": "Higher-rate communication system",
    "massKg": 0.6,
    "peakPowerW": 10,
    "dataRateKbps": 128,
    "costCredits": 220
  },
  {
    "id": "adcs_basic",
    "category": "adcs",
    "name": "Basic attitude control",
    "massKg": 0.6,
    "peakPowerW": 2,
    "costCredits": 100,
    "scienceScore": 0
  },
  {
    "id": "adcs_precise",
    "category": "adcs",
    "name": "Precision attitude control",
    "massKg": 1.0,
    "peakPowerW": 5,
    "costCredits": 200,
    "scienceScore": 8
  },
  {
    "id": "computer_standard",
    "category": "computer",
    "name": "Onboard computer and data handling",
    "massKg": 0.4,
    "peakPowerW": 2,
    "costCredits": 100,
    "storageGb": 32
  },
  {
    "id": "eps_standard",
    "category": "eps",
    "name": "Electrical power management",
    "massKg": 0.4,
    "peakPowerW": 1,
    "costCredits": 80
  },
  {
    "id": "structure_6u",
    "category": "structure",
    "name": "6U structure and rails",
    "massKg": 1.4,
    "costCredits": 120
  },
  {
    "id": "thermal_harness",
    "category": "support",
    "name": "Thermal control, harness and deployment hardware",
    "massKg": 0.8,
    "costCredits": 80
  }
];

export const COMPONENTS_BY_ID = Object.fromEntries(
  COMPONENT_CATALOG.map((component) => [component.id, component])
);

export function getComponent(id) {
  return COMPONENTS_BY_ID[id];
}
