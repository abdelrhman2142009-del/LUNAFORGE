// Canonical runtime component catalog for LUNAFORGE.
// Hardware examples are distinguished from game-balancing assumptions.
// Solar average-generation factors and all credits are explicitly gameplay assumptions.

export const MISSION_BASELINE = {
  maxMassKg: 12,
  targetMassKg: 8,
  averageGenerationW: 20,
  averageLoadW: 12,
  peakLoadW: 30,
  batteryEnergyWh: 88.8,
  storageGb: 32,
  budgetCredits: 1000,
  mission: "Nile Delta Watch",
  spacecraftType: "6U CubeSat",
  orbitAltitudeKm: 500,
  scenarioDurationDays: 7,
  minimumAreasObserved: 3,
  minimumDownlinkedPercent: 80,
  groundContactMinutes: 10,
};

export const REQUIRED_CATEGORIES = [
  "structure", "payload", "solar", "battery",
  "communications", "adcs", "computer", "eps",
];

export const COMPONENT_CATALOG = [
  { id: "camera_basic", category: "payload", name: "Basic Earth-observation camera", massKg: 0.5, activePowerW: 3, peakPowerW: 3, dataPerImageMB: 25, imagesPerDay: 3, costCredits: 120, scienceScore: 55, status: "game_design_assumption" },
  { id: "camera_advanced", category: "payload", name: "Advanced Earth-observation camera", massKg: 0.8, activePowerW: 5, peakPowerW: 5, dataPerImageMB: 60, imagesPerDay: 3, costCredits: 220, scienceScore: 85, status: "game_design_assumption" },

  // Peak panel ratings are reference values. Average generation uses a
  // transparent 0.72 gameplay factor to represent illumination, eclipse,
  // orientation and conversion losses in this simplified game model.
  { id: "solar_body_6u", category: "solar", name: "6U body-mounted solar panels", massKg: 0.45, peakPowerW: 27.8, averageGenerationW: 20.016, averageGenerationFactor: 0.72, costCredits: 140, status: "NASA-listed 27.8 W peak product example; average generation and credits are gameplay estimates" },
  { id: "solar_deployable_6u", category: "solar", name: "6U deployable solar array", massKg: 0.78, peakPowerW: 57.6, averageGenerationW: 41.472, averageGenerationFactor: 0.72, costCredits: 230, status: "NASA-listed 57.6 W peak product example; average generation and credits are gameplay estimates" },

  { id: "battery_standard", category: "battery", name: "Standard Li-ion battery pack", massKg: 0.35, energyWh: 44, costCredits: 100, status: "game_design_assumption" },
  { id: "battery_high_capacity", category: "battery", name: "High-capacity Li-ion battery pack", massKg: 0.52, energyWh: 88.8, costCredits: 180, status: "reference estimate; verify exact pack configuration before treating as hardware specification" },

  { id: "comms_basic", category: "communications", name: "Basic communication system", massKg: 0.35, peakPowerW: 5, activePowerW: 5, dataRateMbps: 1, costCredits: 100, status: "game_design_assumption" },
  { id: "comms_high_rate", category: "communications", name: "Higher-rate communication system", massKg: 0.6, peakPowerW: 10, activePowerW: 10, dataRateMbps: 2, costCredits: 220, status: "game_design_assumption" },

  { id: "adcs_basic", category: "adcs", name: "Basic attitude control", massKg: 0.6, peakPowerW: 2, activePowerW: 2, costCredits: 100, scienceScore: 0, status: "game_design_assumption" },
  { id: "adcs_precise", category: "adcs", name: "Precision attitude control", massKg: 1, peakPowerW: 5, activePowerW: 5, costCredits: 200, scienceScore: 8, status: "game_design_assumption" },

  { id: "computer_standard", category: "computer", name: "Onboard computer and data handling", massKg: 0.4, peakPowerW: 2, activePowerW: 2, costCredits: 100, storageGb: 32, status: "game_design_assumption" },
  { id: "eps_standard", category: "eps", name: "Electrical power management", massKg: 0.4, peakPowerW: 1, activePowerW: 1, costCredits: 80, status: "game_design_assumption" },

  { id: "structure_6u", category: "structure", name: "6U structure and rails", massKg: 1.4, costCredits: 120, status: "game_design_assumption; mass allocation lies within cited 6U structure range" },
  { id: "thermal_harness", category: "support", name: "Thermal control, harness and deployment hardware", massKg: 0.8, costCredits: 80, status: "game_design_assumption" },
];

export const COMPONENTS_BY_ID = Object.fromEntries(
  COMPONENT_CATALOG.map((component) => [component.id, component])
);

export function getComponent(id) {
  return COMPONENTS_BY_ID[id];
}
