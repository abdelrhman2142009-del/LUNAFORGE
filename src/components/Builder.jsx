
import { useMemo, useState } from "react";
import "./Builder.css";
import EngineeringAdvisor from "./EngineeringAdvisor";
import { runEngineeringAnalysis } from "../engine/engineAdapter";
// TEMPORARY GAMEPLAY DATA
// These values are illustrative gameplay assumptions,
// not verified flight hardware specifications.

const components = [
  {
    id: "structure-1",
    slot: "structure",
    name: "Standard CubeSat Structure",
    category: "Structure",
    description: "A basic structure that holds and protects the satellite systems.",
    mass: 1.4,
    power: 0,
    cost: 120,
  },
  {
    id: "power-1",
    slot: "solar",
    name: "Basic Solar Panels",
    category: "Power",
    description: "Solar panels that provide electrical power during sunlight.",
    mass: 0.45,
    power: 0,
    solarPowerOutput: 27.8,
    cost: 140,
  },
  {
    id: "battery-1",
    slot: "battery",
    name: "Standard Battery",
    category: "Power",
    description: "Stores electrical energy for periods without sunlight.",
    mass: 0.35,
    power: 0,
    batteryCapacityWh: 44,
    cost: 100,
  },
  {
    id: "camera-1",
    slot: "payload",
    name: "Basic Earth Camera",
    category: "Payload",
    description: "A basic optical camera for Earth observation.",
    mass: 0.5,
    power: 3,
    dataGenerationMBPerMinute: 8,
    cost: 120,
  },
  {
    id: "camera-2",
    slot: "payload",
    name: "Advanced Earth Camera",
    category: "Payload",
    description: "A higher-performance camera with increased resource demands.",
    mass: 0.8,
    power: 5,
    dataGenerationMBPerMinute: 20,
    cost: 220,
  },
  {
    id: "computer-1",
    slot: "computer",
    name: "Onboard Computer",
    category: "Computing",
    description: "Processes commands and manages spacecraft operations.",
    mass: 0.4,
    power: 2,
    storageCapacityGB: 32,
    cost: 100,
  },
  {
    id: "communication-1",
    slot: "communication",
    name: "Basic Communication System",
    category: "Communication",
    description: "Enables the satellite to communicate with a ground station.",
    mass: 0.35,
    power: 5,
    downlinkSpeedMbps: 1,
    cost: 100,
  },
  {
    id: "communication-2",
    slot: "communication",
    name: "Advanced Communication System",
    category: "Communication",
    description: "A higher-performance system for transmitting mission data.",
    mass: 0.6,
    power: 10,
    downlinkSpeedMbps: 2,
    cost: 220,
  },
  { id: "power-2", slot: "solar", name: "6U Deployable Solar Array", category: "Power", description: "Deployable array with a higher peak-power rating; game values are simplified.", mass: 0.78, power: 0, solarPowerOutput: 57.6, cost: 230 },
  { id: "battery-2", slot: "battery", name: "High-capacity Battery Pack", category: "Power", description: "Higher energy storage for eclipse and peak-load support.", mass: 0.52, power: 0, batteryCapacityWh: 88.8, cost: 180 },
  { id: "adcs-1", slot: "adcs", name: "Basic Attitude Control (ADCS)", category: "Attitude Control", description: "Determines and controls spacecraft orientation for Earth observation.", mass: 0.6, power: 2, cost: 100 },
  { id: "adcs-2", slot: "adcs", name: "Precision Attitude Control (ADCS)", category: "Attitude Control", description: "Higher precision pointing with increased resource demand.", mass: 1.0, power: 5, cost: 200 },
  { id: "eps-1", slot: "eps", name: "Electrical Power Management (EPS)", category: "Electrical Power", description: "Regulates and distributes electrical power across spacecraft systems.", mass: 0.4, power: 1, cost: 80 },
];

const categories = [
  "All Systems",
  "Structure",
  "Power",
  "Payload",
  "Computing",
  "Communication",
  "Attitude Control",
  "Electrical Power",
];

const MAX_MASS = 12;
const MAX_BUDGET = 1000;

function Builder({ onProceed }) {
  const [selectedComponents, setSelectedComponents] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All Systems");

  const filteredComponents = useMemo(() => {
    if (activeCategory === "All Systems") {
      return components;
    }

    return components.filter(
      (component) => component.category === activeCategory
    );
  }, [activeCategory]);

  // TOTAL SPACECRAFT RESOURCES

  const totals = useMemo(() => {
    return selectedComponents.reduce(
      (result, component) => ({
        mass: result.mass + component.mass,
        power: result.power + component.power,
        cost: result.cost + component.cost,
        batteryCapacityWh:
          result.batteryCapacityWh +
          (component.batteryCapacityWh || 0),
        storageCapacityGB:
          result.storageCapacityGB +
          (component.storageCapacityGB || 0),
        dataGenerationMBPerMinute:
          result.dataGenerationMBPerMinute +
          (component.dataGenerationMBPerMinute || 0),
        downlinkSpeedMbps:
          result.downlinkSpeedMbps +
          (component.downlinkSpeedMbps || 0),
      }),
      {
        mass: 0,
        power: 0,
        cost: 0,
        batteryCapacityWh: 0,
        storageCapacityGB: 0,
        dataGenerationMBPerMinute: 0,
        downlinkSpeedMbps: 0,
      }
    );
  }, [selectedComponents]);

  // ADD OR REPLACE COMPONENT

  const addComponent = (component) => {
    setSelectedComponents((current) => {
      const alreadyAdded = current.some(
        (item) => item.id === component.id
      );

      if (alreadyAdded) return current;

      // Keep only one component in each slot.
      // Solar panels and batteries have separate slots.
      const updatedComponents = current.filter(
        (item) => item.slot !== component.slot
      );

      return [...updatedComponents, component];
    });
  };

  const removeComponent = (componentId) => {
    setSelectedComponents((current) =>
      current.filter((item) => item.id !== componentId)
    );
  };

  const resetBuilder = () => {
    setSelectedComponents([]);
  };

  // RESOURCE LIMITS

  const massExceeded = totals.mass > MAX_MASS;
  const budgetExceeded = totals.cost > MAX_BUDGET;

  const massPercentage = Math.min(
    (totals.mass / MAX_MASS) * 100,
    100
  );

  const budgetPercentage = Math.min(
    (totals.cost / MAX_BUDGET) * 100,
    100
  );

  // SYSTEM AVAILABILITY

  const hasPayload = selectedComponents.some(
    (component) => component.category === "Payload"
  );

  const hasStructure = selectedComponents.some(
    (component) => component.category === "Structure"
  );

  const hasSolarPanels = selectedComponents.some(
    (component) => component.slot === "solar"
  );

  const hasBattery = selectedComponents.some(
    (component) => component.slot === "battery"
  );

  const hasComputer = selectedComponents.some(
    (component) => component.category === "Computing"
  );

  const hasAdcs = selectedComponents.some((component) => component.slot === "adcs");

  const hasEps = selectedComponents.some((component) => component.slot === "eps");

  const hasCommunication = selectedComponents.some(
    (component) => component.category === "Communication"
  );

  // POWER ANALYSIS

  const solarPower = selectedComponents.reduce(
    (total, component) =>
      total + (component.solarPowerOutput || 0),
    0
  );

  const powerBalance = solarPower - totals.power;

  const powerSufficient =
    hasSolarPanels && powerBalance >= 0;

  // DATA SYSTEM ANALYSIS

  const storageAvailable = totals.storageCapacityGB;
  const dataGenerationRate = totals.dataGenerationMBPerMinute;
  const downlinkSpeed = totals.downlinkSpeedMbps;

  const hasStorage = storageAvailable > 0;
  const hasDataGeneration = dataGenerationRate > 0;
  const hasDownlink = downlinkSpeed > 0;

  // MISSION REQUIREMENTS

  const requirements = [
    { label: "Spacecraft structure", complete: hasStructure },
    { label: "Solar power generation", complete: hasSolarPanels },
    { label: "Power balance", complete: powerSufficient },
    { label: "Energy storage battery", complete: hasBattery },
    { label: "Observation payload", complete: hasPayload },
    { label: "Onboard computer", complete: hasComputer },
    { label: "Attitude control (ADCS)", complete: selectedComponents.some((c) => c.slot === "adcs") },
    { label: "Electrical power management (EPS)", complete: selectedComponents.some((c) => c.slot === "eps") },
    { label: "Attitude determination and control (ADCS)", complete: selectedComponents.some((component) => component.slot === "adcs") },
    { label: "Electrical power management (EPS)", complete: selectedComponents.some((component) => component.slot === "eps") },
    { label: "Communication system", complete: hasCommunication },
    { label: "Data storage", complete: hasStorage },
    { label: "Data generation", complete: hasDataGeneration },
    { label: "Data transmission", complete: hasDownlink },
    { label: "Mass limit", complete: !massExceeded },
    { label: "Budget limit", complete: !budgetExceeded },
  ];

  const completedRequirements = requirements.filter(
    (item) => item.complete
  ).length;

  const completionPercentage = Math.round(
    (completedRequirements / requirements.length) * 100
  );

  const missingRequirements = requirements.filter(
    (item) => !item.complete
  );

  // MISSION STATUS

  const isInvalid =
    massExceeded ||
    budgetExceeded ||
    (hasSolarPanels && !powerSufficient);

  const isValid =
    !isInvalid && hasAdcs && hasEps &&
    completedRequirements === requirements.length;

  const missionStatus = isInvalid
    ? "INVALID"
    : isValid
      ? "VALID"
      : "WARNING";

  const statusColor = isInvalid
    ? "#ff626f"
    : isValid
      ? "#45d6a0"
      : "#f3bd55";

  const statusMessage = isInvalid
    ? "Your spacecraft exceeds one or more engineering limits."
    : isValid
      ? "All current mission requirements have been satisfied."
      : "Your spacecraft still needs some essential systems.";

  return (
    <section className="builder-page">
      <div className="builder-heading">
        <div>
          <div className="eyebrow">
            MISSION 001 / ENGINEERING WORKSPACE
          </div>

          <h1 className="builder-title">
            SPACECRAFT <span>BUILDER.</span>
          </h1>

          <p className="builder-description">
            Configure your CubeSat by selecting its engineering
            components. Every decision affects your mission resources.
          </p>
        </div>

        <div className="builder-mission-label">
          <span className="builder-live-dot" />
          EARTH OBSERVATION / LEO
        </div>
      </div>

      <div className="builder-layout">
        <EngineeringAdvisor
  selectedComponents={selectedComponents}
  totals={totals}
  solarPower={solarPower}
  powerBalance={powerBalance}
  powerSufficient={powerSufficient}
  storageAvailable={storageAvailable}
  dataGenerationRate={dataGenerationRate}
  downlinkSpeed={downlinkSpeed}
  maxMass={MAX_MASS}
  maxBudget={MAX_BUDGET}
/>
        <div className="builder-main">
          <div className="builder-section-heading">
            <div>
              <span className="builder-overline">COMPONENT LIBRARY</span>
              <h2>Select Your Systems</h2>
            </div>

            <span className="builder-count">
              {selectedComponents.length} SELECTED
            </span>
          </div>

          <div className="builder-categories">
            {categories.map((category) => (
              <button
                key={category}
                className={
                  activeCategory === category ? "category-active" : ""
                }
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="component-grid">
            {filteredComponents.map((component) => {
              const isSelected = selectedComponents.some(
                (item) => item.id === component.id
              );

              const hasAlternativeSelected = selectedComponents.some(
                (item) =>
                  item.slot === component.slot &&
                  item.id !== component.id
              );

              return (
                <article
                  className={`component-card ${
                    isSelected ? "component-selected" : ""
                  }`}
                  key={component.id}
                >
                  <div className="component-card-top">
                    <span className="component-category">
                      {component.category}
                    </span>

                    <span className="component-indicator">
                      {isSelected
                        ? "ADDED"
                        : hasAlternativeSelected
                          ? "ALTERNATIVE"
                          : "AVAILABLE"}
                    </span>
                  </div>

                  <div className="component-icon">
                    {component.category === "Structure" && "▦"}
                    {component.category === "Power" && "ϟ"}
                    {component.category === "Payload" && "◎"}
                    {component.category === "Computing" && "⌘"}
                    {component.category === "Communication" && "⌁"}
                    {component.category === "Attitude Control" && "◎"}
                    {component.category === "Electrical Power" && "ϟ"}
                    {component.category === "Attitude Control" && "◎"}
                    {component.category === "Electrical Power" && "ϟ"}
                  </div>

                  <h3>{component.name}</h3>

                  <p>{component.description}</p>

                  <div className="component-specs">
                    <div>
                      <span>MASS</span>
                      <strong>{component.mass.toFixed(1)} kg</strong>
                    </div>

                    <div>
                      <span>POWER</span>
                      <strong>{component.power} W</strong>
                    </div>

                    <div>
                      <span>COST</span>
                      <strong>{component.cost.toLocaleString()} CR</strong>
                    </div>
                  </div>

                  {(component.dataGenerationMBPerMinute ||
                    component.storageCapacityGB ||
                    component.downlinkSpeedMbps ||
                    component.batteryCapacityWh) && (
                    <div
                      style={{
                        marginTop: "13px",
                        padding: "11px",
                        borderRadius: "6px",
                        background: "#10263b",
                        color: "#a9c1d5",
                        fontSize: "11px",
                        lineHeight: 1.8,
                      }}
                    >
                      {component.dataGenerationMBPerMinute && (
                        <div>
                          DATA GENERATION:{" "}
                          <strong style={{ color: "#65c9f1" }}>
                            {component.dataGenerationMBPerMinute} MB/min
                          </strong>
                        </div>
                      )}

                      {component.storageCapacityGB && (
                        <div>
                          STORAGE:{" "}
                          <strong style={{ color: "#65c9f1" }}>
                            {component.storageCapacityGB} GB
                          </strong>
                        </div>
                      )}

                      {component.downlinkSpeedMbps && (
                        <div>
                          DOWNLINK:{" "}
                          <strong style={{ color: "#65c9f1" }}>
                            {component.downlinkSpeedMbps} Mbps
                          </strong>
                        </div>
                      )}

                      {component.batteryCapacityWh && (
                        <div>
                          BATTERY:{" "}
                          <strong style={{ color: "#65c9f1" }}>
                            {component.batteryCapacityWh} Wh
                          </strong>
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    className={`component-action ${
                      isSelected ? "component-added" : ""
                    }`}
                    onClick={() =>
                      isSelected
                        ? removeComponent(component.id)
                        : addComponent(component)
                    }
                  >
                    {isSelected
                      ? "REMOVE COMPONENT −"
                      : hasAlternativeSelected
                        ? "REPLACE SELECTED SYSTEM ↻"
                        : "ADD COMPONENT +"}
                  </button>
                </article>
              );
            })}
          </div>
        </div>

        <aside className="builder-sidebar">
          <div className="sidebar-heading">
            <div>
              <span className="builder-overline">LIVE OVERVIEW</span>
              <h2>Mission Resources</h2>
            </div>

            <span className="live-label">LIVE</span>
          </div>

          {/* MISSION STATUS PANEL */}

          <div
            style={{
              padding: "20px",
              marginBottom: "20px",
              borderRadius: "12px",
              border: `1px solid ${statusColor}55`,
              background: `${statusColor}0d`,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  letterSpacing: "1.5px",
                  color: "#a8bbce",
                }}
              >
                MISSION STATUS
              </span>

              <strong
                style={{
                  color: statusColor,
                  fontSize: "13px",
                  letterSpacing: "1px",
                }}
              >
                {missionStatus}
              </strong>
            </div>

            <p
              style={{
                color: "#e5edf6",
                fontSize: "13px",
                lineHeight: 1.6,
                margin: "0 0 16px",
              }}
            >
              {statusMessage}
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "12px",
                color: "#a8bbce",
                marginBottom: "8px",
              }}
            >
              <span>Requirements completed</span>
              <strong style={{ color: "#ffffff" }}>
                {completionPercentage}%
              </strong>
            </div>

            <div
              style={{
                height: "6px",
                borderRadius: "10px",
                background: "#26394d",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${completionPercentage}%`,
                  height: "100%",
                  borderRadius: "10px",
                  background: statusColor,
                  transition: "width 0.3s ease",
                }}
              />
            </div>

            {missingRequirements.length > 0 && (
              <div style={{ marginTop: "16px" }}>
                <span
                  style={{
                    color: "#a8bbce",
                    fontSize: "11px",
                    letterSpacing: "1px",
                  }}
                >
                  ITEMS NEEDING ATTENTION
                </span>

                {missingRequirements.map((item) => (
                  <div
                    key={item.label}
                    style={{
                      display: "flex",
                      gap: "9px",
                      alignItems: "center",
                      marginTop: "9px",
                      color:
                        isInvalid &&
                        (item.label === "Mass limit" ||
                          item.label === "Budget limit")
                          ? "#ff626f"
                          : "#d3deea",
                      fontSize: "12px",
                    }}
                  >
                    <span>○</span>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="resource-card">
            <div className="resource-top">
              <span>Total Mass</span>
              <strong className={massExceeded ? "resource-danger" : ""}>
                {totals.mass.toFixed(2)}
                <small> / {MAX_MASS.toFixed(1)} kg</small>
              </strong>
            </div>

            <div className="resource-track">
              <div
                className={`resource-fill ${
                  massExceeded ? "fill-danger" : ""
                }`}
                style={{ width: `${massPercentage}%` }}
              />
            </div>

            <span className="resource-hint">
              {massExceeded
                ? "Mass limit exceeded"
                : "Within spacecraft mass limit"}
            </span>
          </div>

          <div className="resource-card">
            <div className="resource-top">
              <span>Total Cost</span>
              <strong className={budgetExceeded ? "resource-danger" : ""}>
                {totals.cost.toLocaleString()}
                <small> / {MAX_BUDGET.toLocaleString()} CR</small>
              </strong>
            </div>

            <div className="resource-track">
              <div
                className={`resource-fill ${
                  budgetExceeded ? "fill-danger" : ""
                }`}
                style={{ width: `${budgetPercentage}%` }}
              />
            </div>

            <span className="resource-hint">
              {budgetExceeded
                ? "Budget exceeded"
                : "Within mission budget"}
            </span>
          </div>

          <div className="resource-card power-resource">
            <div className="resource-top">
              <span>Power Consumption</span>
              <strong>
                {totals.power.toFixed(1)}
                <small> W</small>
              </strong>
            </div>

            <span className="resource-hint">
              Total listed component power demand
            </span>
          </div>

          <div className="resource-card">
            <div className="resource-top">
              <span>Battery Capacity</span>
              <strong>
                {totals.batteryCapacityWh.toFixed(1)}
                <small> Wh</small>
              </strong>
            </div>

            <span className="resource-hint">
              Available stored electrical energy
            </span>
          </div>

          <div className="resource-card">
            <div className="resource-top">
              <span>Data Storage</span>
              <strong>
                {totals.storageCapacityGB.toFixed(1)}
                <small> GB</small>
              </strong>
            </div>

            <span className="resource-hint">
              Onboard storage capacity
            </span>
          </div>

          <div className="resource-card">
            <div className="resource-top">
              <span>Data Generation</span>
              <strong>
                {totals.dataGenerationMBPerMinute.toFixed(1)}
                <small> MB/min</small>
              </strong>
            </div>

            <span className="resource-hint">
              Observation data generation rate
            </span>
          </div>

          <div className="resource-card">
            <div className="resource-top">
              <span>Downlink Speed</span>
              <strong>
                {totals.downlinkSpeedMbps.toFixed(1)}
                <small> Mbps</small>
              </strong>
            </div>

            <span className="resource-hint">
              Communication data rate
            </span>
          </div>

          <div className="selected-section">
            <div className="selected-heading">
              <h3>Selected Components</h3>
              <span>{selectedComponents.length}</span>
            </div>

            {selectedComponents.length === 0 ? (
              <div className="empty-selection">
                <span>＋</span>
                <p>No components selected yet.</p>
                <small>Choose systems from the component library.</small>
              </div>
            ) : (
              <div className="selected-list">
                {selectedComponents.map((component) => (
                  <div className="selected-item" key={component.id}>
                    <div>
                      <strong>{component.name}</strong>
                      <span>
                        {component.mass.toFixed(1)} kg ·{" "}
                        {component.cost.toLocaleString()} CR
                      </span>
                    </div>

                    <button
                      aria-label={`Remove ${component.name}`}
                      onClick={() => removeComponent(component.id)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="requirements-section">
            <div className="selected-heading">
              <h3>Mission Requirements</h3>
              <span>
                {completedRequirements}/{requirements.length}
              </span>
            </div>

            <div className="requirements-progress">
              <div
                style={{
                  width: `${completionPercentage}%`,
                }}
              />
            </div>

            {requirements.map((requirement) => (
              <div className="builder-requirement" key={requirement.label}>
                <span
                  className={
                    requirement.complete
                      ? "requirement-check"
                      : "requirement-pending"
                  }
                >
                  {requirement.complete ? "✓" : "○"}
                </span>

                <span>{requirement.label}</span>
              </div>
            ))}
          </div>

          <button
            className="reset-builder"
            onClick={resetBuilder}
            disabled={selectedComponents.length === 0}
          >
            RESET SPACECRAFT
          </button>

          <button
            className="component-action"
            disabled={!isValid}
           onClick={() => {
  try {
    const engineAnalysis = runEngineeringAnalysis(selectedComponents);

    onProceed({
      selectedComponents,
      totals,
      requirements,
      completionPercentage,
      solarPower,
      powerBalance,
      powerSufficient,
      storageAvailable,
      dataGenerationRate,
      downlinkSpeed,
      engineAnalysis,
    });
  } catch (error) {
    console.error("Engineering Engine Error:", error);
    alert(`Engineering analysis failed: ${error.message}`);
  }
}}
            style={{
              width: "100%",
              marginTop: "12px",
              opacity: isValid ? 1 : 0.4,
              cursor: isValid ? "pointer" : "not-allowed",
            }}
          >
            PROCEED TO MISSION ANALYSIS →
          </button>

          <div className="builder-disclaimer">
            <strong>PROTOTYPE DATA</strong>
            <p>
              Component specifications are temporary gameplay
              assumptions. They are not verified flight hardware specifications.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default Builder;
