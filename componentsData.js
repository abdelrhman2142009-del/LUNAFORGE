/**
 * LUNAFORGE - Spacecraft component catalog
 *
 * IMPORTANT:
 * Values in this file are GAMEPLAY PARAMETERS unless a source is explicitly
 * attached. They are intentionally conservative, editable defaults for the
 * educational simulation and must not be presented as flight-qualified specs.
 *
 * Units:
 * massKg          -> kg
 * powerW          -> W
 * costCredits     -> fictional game credits
 * dataMbPerDay    -> MB/day
 * storageGb       -> GB
 */
export const COMPONENT_CATALOG = {
  structure: [
    {
      id: "structure-standard",
      category: "structure",
      name: "Standard CubeSat Structure",
      description: "Lightweight structural frame for the spacecraft.",
      massKg: 4.0,
      powerW: 0,
      costCredits: 8000,
      dataMbPerDay: 0,
      storageGb: 0,
      reliability: 0.98,
      scienceValue: 0,
    },
    {
      id: "structure-reinforced",
      category: "structure",
      name: "Reinforced Structure",
      description: "Heavier structure with improved resilience.",
      massKg: 6.0,
      powerW: 0,
      costCredits: 12000,
      dataMbPerDay: 0,
      storageGb: 0,
      reliability: 0.995,
      scienceValue: 0,
    },
  ],

  power: [
    {
      id: "power-basic",
      category: "power",
      name: "Basic Solar Array",
      description: "Entry-level solar generation system.",
      massKg: 2.0,
      powerW: 18,
      powerConsumptionW: 0,
      costCredits: 10000,
      dataMbPerDay: 0,
      storageGb: 0,
      reliability: 0.97,
      scienceValue: 0,
    },
    {
      id: "power-high",
      category: "power",
      name: "High-Output Solar Array",
      description: "Higher generation at increased mass and cost.",
      massKg: 3.5,
      powerW: 30,
      powerConsumptionW: 0,
      costCredits: 18000,
      dataMbPerDay: 0,
      storageGb: 0,
      reliability: 0.965,
      scienceValue: 0,
    },
  ],

  battery: [
    {
      id: "battery-basic",
      category: "battery",
      name: "Basic Battery",
      description: "Basic energy storage for eclipse periods.",
      massKg: 1.5,
      batteryWh: 30,
      powerW: 0,
      costCredits: 7000,
      dataMbPerDay: 0,
      storageGb: 0,
      reliability: 0.97,
      scienceValue: 0,
    },
    {
      id: "battery-large",
      category: "battery",
      name: "Large Battery",
      description: "More stored energy with additional mass.",
      massKg: 2.5,
      batteryWh: 60,
      powerW: 0,
      costCredits: 12000,
      dataMbPerDay: 0,
      storageGb: 0,
      reliability: 0.965,
      scienceValue: 0,
    },
  ],

  payload: [
    {
      id: "payload-lowres-camera",
      category: "payload",
      name: "Low-Resolution Earth Camera",
      description: "Small imaging payload for basic Earth observation.",
      massKg: 1.5,
      powerConsumptionW: 3,
      costCredits: 15000,
      dataMbPerDay: 120,
      storageGb: 2,
      reliability: 0.96,
      scienceValue: 55,
    },
    {
      id: "payload-highres-camera",
      category: "payload",
      name: "High-Resolution Earth Camera",
      description: "Higher-value imaging payload with greater resource demand.",
      massKg: 3.0,
      powerConsumptionW: 7,
      costCredits: 30000,
      dataMbPerDay: 350,
      storageGb: 4,
      reliability: 0.94,
      scienceValue: 85,
    },
  ],

  communications: [
    {
      id: "comms-basic",
      category: "communications",
      name: "Basic UHF Communications",
      description: "Low-complexity communications subsystem.",
      massKg: 1.0,
      powerConsumptionW: 2,
      costCredits: 9000,
      dataRateMbps: 0.2,
      dataMbPerDay: 150,
      storageGb: 0,
      reliability: 0.97,
      scienceValue: 0,
    },
    {
      id: "comms-highrate",
      category: "communications",
      name: "High-Rate Communications",
      description: "Higher data throughput at increased resource cost.",
      massKg: 1.8,
      powerConsumptionW: 4,
      costCredits: 18000,
      dataRateMbps: 1.0,
      dataMbPerDay: 600,
      storageGb: 0,
      reliability: 0.95,
      scienceValue: 0,
    },
  ],

  computer: [
    {
      id: "computer-standard",
      category: "computer",
      name: "Standard Flight Computer",
      description: "Onboard command and data handling computer.",
      massKg: 1.0,
      powerConsumptionW: 2,
      costCredits: 11000,
      dataMbPerDay: 0,
      storageGb: 8,
      reliability: 0.985,
      scienceValue: 0,
    },
  ],

  attitude: [
    {
      id: "attitude-basic",
      category: "attitude",
      name: "Basic Attitude Control",
      description: "Simplified attitude control subsystem.",
      massKg: 1.5,
      powerConsumptionW: 2,
      costCredits: 13000,
      dataMbPerDay: 0,
      storageGb: 0,
      reliability: 0.96,
      scienceValue: 0,
    },
    {
      id: "attitude-precision",
      category: "attitude",
      name: "Precision Attitude Control",
      description: "Improved pointing capability for imaging.",
      massKg: 2.2,
      powerConsumptionW: 3,
      costCredits: 22000,
      dataMbPerDay: 0,
      storageGb: 0,
      reliability: 0.95,
      scienceValue: 8,
    },
  ],
};

export const DEFAULT_MISSION_CONSTRAINTS = Object.freeze({
  maxMassKg: 12,
  maxAveragePowerConsumptionW: 18,
  minPowerMarginW: 2,
  maxBudgetCredits: 120000,
  maxDataGeneratedMbPerDay: 500,
  minDataCapacityGb: 2,
  minScienceScore: 50,
  requiredCategories: [
    "structure",
    "power",
    "battery",
    "payload",
    "communications",
    "computer",
    "attitude",
  ],
});

/**
 * Flatten the catalog for convenient lookup.
 */
export function getAllComponents() {
  return Object.values(COMPONENT_CATALOG).flat();
}

export function getComponentById(id) {
  return getAllComponents().find((component) => component.id === id);
}
