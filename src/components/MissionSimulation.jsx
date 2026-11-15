
import { useState } from "react";
import "./MissionSimulation.css";

const phases = [
  {
    name: "Launch",
    code: "PHASE 01",
    description:
      "The launch vehicle begins the journey toward Low Earth Orbit.",
  },
  {
    name: "Orbit Insertion",
    code: "PHASE 02",
    description:
      "The spacecraft is deployed into its target orbital environment.",
  },
  {
    name: "Systems Check",
    code: "PHASE 03",
    description:
      "The onboard computer checks the spacecraft's essential systems.",
  },
  {
    name: "Earth Observation",
    code: "PHASE 04",
    description:
      "The observation payload collects data and stores it onboard.",
  },
  {
    name: "Data Downlink",
    code: "PHASE 05",
    description:
      "The communication system transmits stored data to a ground station.",
  },
  {
    name: "Mission Complete",
    code: "FINAL REPORT",
    description:
      "The mission sequence has reached its final stage.",
  },
];

function MissionSimulation({ missionReport, onBack }) {
  const [currentPhase, setCurrentPhase] = useState(-1);

  // DATA SYSTEM STATE

  const [storedDataMB, setStoredDataMB] = useState(0);
  const [generatedDataMB, setGeneratedDataMB] = useState(0);
  const [transmittedDataMB, setTransmittedDataMB] = useState(0);
  const [lostDataMB, setLostDataMB] = useState(0);

  const [observationMinutes, setObservationMinutes] = useState(0);
  const [downlinkMinutes, setDownlinkMinutes] = useState(0);

  // SPACECRAFT CONFIGURATION

  const selectedComponents = missionReport.selectedComponents || [];
  const totals = missionReport.totals || {};

  const hasPayload = selectedComponents.some(
    (component) => component.category === "Payload"
  );

  const hasCommunication = selectedComponents.some(
    (component) => component.category === "Communication"
  );

  const hasComputer = selectedComponents.some(
    (component) => component.category === "Computing"
  );

  const powerSufficient = missionReport.powerSufficient;

  // DATA SYSTEM SPECIFICATIONS

  const storageCapacityGB =
    missionReport.storageAvailable ??
    totals.storageCapacityGB ??
    0;

  const storageCapacityMB = storageCapacityGB * 1024;

  const dataGenerationRate =
    missionReport.dataGenerationRate ??
    totals.dataGenerationMBPerMinute ??
    0;

  const downlinkSpeed =
    missionReport.downlinkSpeed ??
    totals.downlinkSpeedMbps ??
    0;

  // Convert Mbps to MB per minute.
  // 1 byte = 8 bits, 1 minute = 60 seconds.

  const downlinkRateMBPerMinute =
    (downlinkSpeed * 60) / 8;

  const remainingStorageMB = Math.max(
    0,
    storageCapacityMB - storedDataMB
  );

  const remainingDataMB = storedDataMB;

  const storagePercentage =
    storageCapacityMB > 0
      ? Math.min(
          (storedDataMB / storageCapacityMB) * 100,
          100
        )
      : 0;

  const storageFull =
    storageCapacityMB > 0 &&
    storedDataMB >= storageCapacityMB;

  const completed = currentPhase === phases.length - 1;

  const progress =
    currentPhase < 0
      ? 0
      : ((currentPhase + 1) / phases.length) * 100;

  const missionSuccessful =
    powerSufficient &&
    hasPayload &&
    hasCommunication &&
    hasComputer &&
    storageCapacityMB > 0 &&
    dataGenerationRate > 0 &&
    downlinkSpeed > 0 &&
    generatedDataMB > 0 &&
    storedDataMB < 0.01 &&
    lostDataMB < 0.01;

  // MISSION ACTIONS

  const startSimulation = () => {
    setCurrentPhase(0);
  };

  const nextPhase = () => {
    setCurrentPhase((current) =>
      Math.min(current + 1, phases.length - 1)
    );
  };

  const collectData = () => {
    if (
      !hasPayload ||
      !hasComputer ||
      dataGenerationRate <= 0 ||
      storageCapacityMB <= 0
    ) {
      return;
    }

    const newData = dataGenerationRate;

    const acceptedData = Math.min(
      newData,
      remainingStorageMB
    );

    const lostData = newData - acceptedData;

    setStoredDataMB((current) => current + acceptedData);

    setGeneratedDataMB((current) => current + newData);

    setLostDataMB((current) => current + lostData);

    setObservationMinutes((current) => current + 1);
  };

  const transmitData = () => {
    if (
      !hasCommunication ||
      downlinkRateMBPerMinute <= 0 ||
      storedDataMB <= 0
    ) {
      return;
    }

    const transmitted = Math.min(
      storedDataMB,
      downlinkRateMBPerMinute
    );

    setStoredDataMB((current) =>
      Math.max(0, current - transmitted)
    );

    setTransmittedDataMB((current) =>
      current + transmitted
    );

    setDownlinkMinutes((current) => current + 1);
  };

  const finishObservation = () => {
    nextPhase();
  };

  const finishMission = () => {
    nextPhase();
  };

  const resetSimulation = () => {
    setCurrentPhase(-1);
    setStoredDataMB(0);
    setGeneratedDataMB(0);
    setTransmittedDataMB(0);
    setLostDataMB(0);
    setObservationMinutes(0);
    setDownlinkMinutes(0);
  };

  // PHASE RESULTS

  const getPhaseResult = (index) => {
    if (index === 2) {
      return powerSufficient
        ? "Power balance passed under the current simplified model."
        : "Power generation is insufficient for the selected systems.";
    }

    if (index === 3) {
      if (!hasPayload) {
        return "No observation payload is installed.";
      }

      if (!hasComputer || storageCapacityMB <= 0) {
        return "Data collection is unavailable because onboard storage is missing.";
      }

      if (observationMinutes === 0) {
        return "Observation system ready. Collect data to begin.";
      }

      return `${generatedDataMB.toFixed(2)} MB generated. ${lostDataMB.toFixed(2)} MB lost because of storage limits.`;
    }

    if (index === 4) {
      if (!hasCommunication) {
        return "No communication system is installed.";
      }

      if (downlinkMinutes === 0) {
        return "Communication system ready. Begin data transmission.";
      }

      return `${transmittedDataMB.toFixed(2)} MB transmitted. ${storedDataMB.toFixed(2)} MB remain onboard.`;
    }

    if (index === 5) {
      return missionSuccessful
        ? "Mission completed. All generated data was transmitted without storage loss."
        : "Mission completed with one or more engineering or data limitations.";
    }

    return phases[index].description;
  };

  return (
    <section className="simulation-page">
      <div className="simulation-header">
        <div>
          <div className="simulation-eyebrow">
            MISSION 001 / FLIGHT OPERATIONS
          </div>

          <h1>
            MISSION <span>SIMULATION.</span>
          </h1>

          <p>
            Follow your spacecraft through its mission sequence
            and observe how your engineering decisions affect the outcome.
          </p>
        </div>

        <div className="simulation-status">
          <span className="simulation-live-dot" />
          {completed ? "MISSION ENDED" : "SIMULATION MODE"}
        </div>
      </div>

      {/* SPACECRAFT OVERVIEW */}

      <div className="simulation-overview">
        <div className="simulation-overview-item">
          <span>SPACECRAFT MASS</span>
          <strong>
            {(totals.mass || 0).toFixed(2)} kg
          </strong>
        </div>

        <div className="simulation-overview-item">
          <span>POWER BALANCE</span>
          <strong>
            {missionReport.powerBalance > 0 ? "+" : ""}
            {(missionReport.powerBalance || 0).toFixed(1)} W
          </strong>
        </div>

        <div className="simulation-overview-item">
          <span>SELECTED SYSTEMS</span>
          <strong>{selectedComponents.length}</strong>
        </div>
      </div>

      {/* DATA SYSTEM DASHBOARD */}

      <div
        style={{
          marginBottom: "22px",
          padding: "23px",
          background: "#0b1b2d",
          border: "1px solid #1c354b",
          borderRadius: "9px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            marginBottom: "20px",
          }}
        >
          <div>
            <span
              style={{
                color: "#63c9f1",
                fontSize: "10px",
                letterSpacing: "1.5px",
              }}
            >
              ONBOARD DATA SYSTEM
            </span>

            <h2 style={{ fontSize: "19px", margin: "8px 0 0" }}>
              Data & Storage Monitoring
            </h2>
          </div>

          <span
            style={{
              color: "#45d6a0",
              fontSize: "10px",
              letterSpacing: "1px",
            }}
          >
            LIVE DATA
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
            gap: "12px",
          }}
        >
          {[
            {
              label: "GENERATED",
              value: generatedDataMB.toFixed(2),
              unit: "MB",
            },
            {
              label: "STORED",
              value: storedDataMB.toFixed(2),
              unit: "MB",
            },
            {
              label: "TRANSMITTED",
              value: transmittedDataMB.toFixed(2),
              unit: "MB",
            },
            {
              label: "DATA LOST",
              value: lostDataMB.toFixed(2),
              unit: "MB",
            },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                padding: "15px",
                background: "#10263b",
                borderRadius: "6px",
              }}
            >
              <span
                style={{
                  display: "block",
                  color: "#829bb1",
                  fontSize: "9px",
                  letterSpacing: "1px",
                  marginBottom: "10px",
                }}
              >
                {item.label}
              </span>

              <strong style={{ fontSize: "20px" }}>
                {item.value}
              </strong>

              <span
                style={{
                  color: "#8ba4ba",
                  fontSize: "10px",
                  marginLeft: "5px",
                }}
              >
                {item.unit}
              </span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "22px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "12px",
              fontSize: "11px",
              color: "#a8bbce",
              marginBottom: "9px",
            }}
          >
            <span>ONBOARD STORAGE</span>
            <strong>
              {storedDataMB.toFixed(2)} / {storageCapacityMB.toFixed(2)} MB
            </strong>
          </div>

          <div
            style={{
              width: "100%",
              height: "9px",
              background: "#26394d",
              borderRadius: "10px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${storagePercentage}%`,
                height: "100%",
                background: storageFull ? "#ff626f" : "#55bde9",
                borderRadius: "10px",
                transition: "width 0.3s ease",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "12px",
              marginTop: "9px",
              color: "#829bb1",
              fontSize: "10px",
            }}
          >
            <span>
              {remainingStorageMB.toFixed(2)} MB available
            </span>

            <span>{storagePercentage.toFixed(1)}% USED</span>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "12px",
            marginTop: "20px",
          }}
        >
          <div>
            <span style={{ color: "#829bb1", fontSize: "10px" }}>
              CAMERA DATA RATE
            </span>
            <strong
              style={{
                display: "block",
                marginTop: "7px",
                fontSize: "16px",
              }}
            >
              {dataGenerationRate} MB/min
            </strong>
          </div>

          <div>
            <span style={{ color: "#829bb1", fontSize: "10px" }}>
              DOWNLINK CAPACITY
            </span>
            <strong
              style={{
                display: "block",
                marginTop: "7px",
                fontSize: "16px",
              }}
            >
              {downlinkRateMBPerMinute.toFixed(2)} MB/min
            </strong>
          </div>

          <div>
            <span style={{ color: "#829bb1", fontSize: "10px" }}>
              STORAGE CAPACITY
            </span>
            <strong
              style={{
                display: "block",
                marginTop: "7px",
                fontSize: "16px",
              }}
            >
              {storageCapacityGB} GB
            </strong>
          </div>
        </div>
      </div>

      {/* SIMULATION VISUAL AND TIMELINE */}

      <div className="simulation-main">
        <div className="simulation-visual">
          <div className="simulation-visual-top">
            <span>FLIGHT OPERATIONS VIEW</span>
            <span>LEO / MISSION 001</span>
          </div>

          <div className="simulation-space">
            <div className="simulation-stars">
              {Array.from({ length: 18 }, (_, index) => (
                <i key={index} />
              ))}
            </div>

            <div className="simulation-orbit" />

            <div className="simulation-earth">
              <div className="simulation-earth-land" />
            </div>

            <div
              className={`simulation-satellite ${
                currentPhase >= 0 ? "satellite-active" : ""
              }`}
            >
              <div className="sim-panel sim-panel-left" />

              <div className="sim-body">
                <span />
              </div>

              <div className="sim-panel sim-panel-right" />
              <div className="sim-antenna" />
            </div>

            <div className="simulation-coordinate">
              <span>MISSION PHASE</span>

              <strong>
                {currentPhase < 0
                  ? "AWAITING LAUNCH"
                  : phases[currentPhase].name.toUpperCase()}
              </strong>
            </div>
          </div>

          <div className="simulation-visual-footer">
            <span>EARTH OBSERVATION CUBESAT</span>
            <span>CONCEPTUAL VISUALIZATION</span>
          </div>
        </div>

        <aside className="simulation-timeline">
          <div className="simulation-section-title">
            <span>MISSION SEQUENCE</span>

            <strong>
              {Math.max(currentPhase + 1, 0)} / {phases.length}
            </strong>
          </div>

          <div className="simulation-progress-track">
            <div style={{ width: `${progress}%` }} />
          </div>

          <div className="simulation-phases">
            {phases.map((phase, index) => {
              const isDone = index < currentPhase;
              const isActive = index === currentPhase;

              return (
                <div
                  className={`simulation-phase ${
                    isDone ? "phase-done" : ""
                  } ${isActive ? "phase-active" : ""}`}
                  key={phase.name}
                >
                  <div className="phase-marker">
                    {isDone
                      ? "✓"
                      : String(index + 1).padStart(2, "0")}
                  </div>

                  <div>
                    <span>{phase.code}</span>
                    <strong>{phase.name}</strong>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>
      </div>

      {/* MISSION EVENT LOG */}

      <div className="simulation-console">
        <div className="console-heading">
          <span>MISSION TELEMETRY / EVENT LOG</span>
          <span>LIVE DISPLAY</span>
        </div>

        {currentPhase < 0 ? (
          <div className="console-message">
            <span className="console-indicator">●</span>

            <div>
              <strong>MISSION READY</strong>
              <p>
                Spacecraft configuration loaded. Awaiting launch command.
              </p>
            </div>
          </div>
        ) : (
          <div className="console-message">
            <span className="console-indicator">●</span>

            <div>
              <strong>
                {phases[currentPhase].name.toUpperCase()}
              </strong>

              <p>{phases[currentPhase].description}</p>
              <p>{getPhaseResult(currentPhase)}</p>
            </div>
          </div>
        )}
      </div>

      {/* FINAL MISSION REPORT */}

      {completed && (
        <div className="simulation-result">
          <span>FINAL MISSION RESULT</span>

          <h2>
            {missionSuccessful
              ? "MISSION SUCCESSFUL"
              : "MISSION COMPLETED WITH LIMITATIONS"}
          </h2>

          <p>
            {missionSuccessful
              ? "All generated data was stored and transmitted successfully under the current simplified gameplay model."
              : "Review the spacecraft configuration and data report to identify mission limitations."}
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
              gap: "15px",
              marginTop: "20px",
            }}
          >
            <div>
              <span style={{ color: "#829bb1", fontSize: "10px" }}>
                OBSERVATION TIME
              </span>
              <strong style={{ display: "block", marginTop: "7px" }}>
                {observationMinutes} min
              </strong>
            </div>

            <div>
              <span style={{ color: "#829bb1", fontSize: "10px" }}>
                DOWNLINK TIME
              </span>
              <strong style={{ display: "block", marginTop: "7px" }}>
                {downlinkMinutes} min
              </strong>
            </div>

            <div>
              <span style={{ color: "#829bb1", fontSize: "10px" }}>
                DATA DELIVERED
              </span>
              <strong style={{ display: "block", marginTop: "7px" }}>
                {transmittedDataMB.toFixed(2)} MB
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* ACTION CONTROLS */}

      <div className="simulation-actions">
        <button className="simulation-back" onClick={onBack}>
          ← BACK TO ANALYSIS
        </button>

        {currentPhase < 0 ? (
          <button
            className="simulation-primary"
            onClick={startSimulation}
          >
            START SIMULATION →
          </button>
        ) : completed ? (
          <button
            className="simulation-primary"
            onClick={resetSimulation}
          >
            RESTART SIMULATION ↻
          </button>
        ) : currentPhase === 3 ? (
          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}
          >
            <button
              className="simulation-primary"
              onClick={collectData}
              disabled={
                !hasPayload ||
                !hasComputer ||
                dataGenerationRate <= 0 ||
                storageCapacityMB <= 0 ||
                storageFull
              }
              style={{
                opacity:
                  !hasPayload ||
                  !hasComputer ||
                  dataGenerationRate <= 0 ||
                  storageCapacityMB <= 0 ||
                  storageFull
                    ? 0.4
                    : 1,
                cursor: storageFull ? "not-allowed" : "pointer",
              }}
            >
              COLLECT DATA (1 MIN) +
            </button>

            <button
              className="simulation-back"
              onClick={finishObservation}
            >
              FINISH OBSERVATION →
            </button>
          </div>
        ) : currentPhase === 4 ? (
          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}
          >
            <button
              className="simulation-primary"
              onClick={transmitData}
              disabled={
                !hasCommunication ||
                downlinkSpeed <= 0 ||
                storedDataMB <= 0
              }
              style={{
                opacity:
                  !hasCommunication ||
                  downlinkSpeed <= 0 ||
                  storedDataMB <= 0
                    ? 0.4
                    : 1,
              }}
            >
              TRANSMIT DATA (1 MIN) ↑
            </button>

            <button
              className="simulation-back"
              onClick={finishMission}
            >
              END MISSION →
            </button>
          </div>
        ) : (
          <button
            className="simulation-primary"
            onClick={nextPhase}
          >
            NEXT MISSION PHASE →
          </button>
        )}
      </div>

      <p className="simulation-disclaimer">
        Educational simulation using illustrative gameplay values.
        Data generation and transmission are simplified calculations.
        This is not a flight-ready spacecraft model.
      </p>
    </section>
  );
}

export default MissionSimulation;
