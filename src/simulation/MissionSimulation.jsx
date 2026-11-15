import { useEffect, useRef, useState } from "react";
import { startSimulation } from "./simulationEngine.js";
import { SIMULATION_STAGES, INITIAL_SIMULATION_STATE } from "./simulationStages.js";
import "./simulation.css";

function Metric({ label, value, unit = "" }) {
  return (
    <div className="lf-metric">
      <span className="lf-metric-label">{label}</span>
      <strong>{value ?? "—"}{unit}</strong>
    </div>
  );
}

/**
 * Member 4 simulation screen.
 *
 * Props:
 * - resourceStatus: optional normalized values from Member 3, e.g.
 *   { powerPercent: 82, storagePercent: 35, communication: "Available" }
 * - missionValid: optional boolean from validateMission(...)
 * - onSimulationComplete: optional callback receiving final simulation state
 */
export default function MissionSimulation({
  resourceStatus = {},
  missionValid,
  onSimulationComplete = () => {},
}) {
  const [simulation, setSimulation] = useState(INITIAL_SIMULATION_STATE);
  const controllerRef = useRef(null);

  useEffect(() => {
    return () => controllerRef.current?.stop();
  }, []);

  const currentStage = SIMULATION_STAGES[simulation.stageIndex] ?? SIMULATION_STAGES[0];
  const isRunning = simulation.status === "running";
  const isPaused = simulation.status === "paused";
  const isCompleted = simulation.status === "completed";

  function handleStart() {
    if (controllerRef.current) {
      controllerRef.current.resume();
      return;
    }

    controllerRef.current = startSimulation({
      onUpdate: setSimulation,
      onComplete: (finalState) => {
        setSimulation(finalState);
        onSimulationComplete(finalState);
      },
    });
    controllerRef.current.resume();
  }

  function handlePause() {
    controllerRef.current?.pause();
  }

  function handleResume() {
    controllerRef.current?.resume();
  }

  function handleRestart() {
    if (!controllerRef.current) {
      handleStart();
      return;
    }
    controllerRef.current.restart();
  }

  return (
    <main className="lf-sim">
      <header className="lf-sim-header">
        <div>
          <p className="lf-eyebrow">LUNAFORGE / MISSION CONTROL</p>
          <h1>Earth Observation CubeSat</h1>
          <p className="lf-muted">Low Earth Orbit · Educational mission simulation</p>
        </div>
        <span className={`lf-status lf-status-${simulation.status}`}>
          {simulation.status.toUpperCase()}
        </span>
      </header>

      <section className="lf-sim-grid">
        <div className="lf-scene-card">
          <div className="lf-scene-topline">
            <span>ORBIT VIEW</span>
            <span>2D SCHEMATIC · NOT TO SCALE</span>
          </div>

          <div className={`lf-space-scene ${isRunning ? "is-running" : ""} ${isPaused ? "is-paused" : ""}`}>
            <span className="lf-star lf-star-one" />
            <span className="lf-star lf-star-two" />
            <span className="lf-star lf-star-three" />
            <span className="lf-star lf-star-four" />
            <div className="lf-orbit-ring" />
            <div className="lf-earth">
              <span className="lf-earth-land lf-land-one" />
              <span className="lf-earth-land lf-land-two" />
              <span className="lf-earth-glow" />
            </div>
            <div className="lf-satellite-orbit">
              <div className="lf-satellite">
                <span className="lf-sat-panel lf-sat-panel-left" />
                <span className="lf-sat-body" />
                <span className="lf-sat-panel lf-sat-panel-right" />
                <span className="lf-sat-antenna" />
              </div>
            </div>
            <div className="lf-scene-label lf-earth-label">EARTH</div>
            <div className="lf-scene-label lf-satellite-label">CUBESAT</div>
          </div>

          <div className="lf-progress-row">
            <div>
              <span className="lf-muted">MISSION PROGRESS</span>
              <strong>{Math.round(simulation.totalProgress)}%</strong>
            </div>
            <div className="lf-progress-track">
              <span style={{ width: `${simulation.totalProgress}%` }} />
            </div>
          </div>
        </div>

        <aside className="lf-side-panel">
          <div className="lf-panel-card">
            <p className="lf-eyebrow">CURRENT PHASE</p>
            <h2>{currentStage.title}</h2>
            <p className="lf-muted">{currentStage.description}</p>
            <div className="lf-stage-progress">
              <span style={{ width: `${simulation.stageProgress}%` }} />
            </div>
            <p className="lf-small">{currentStage.subtitle}</p>
          </div>

          <div className="lf-panel-card">
            <p className="lf-eyebrow">TELEMETRY</p>
            <div className="lf-metrics">
              <Metric label="Power" value={resourceStatus.powerPercent} unit={resourceStatus.powerPercent == null ? "" : "%"} />
              <Metric label="Storage used" value={resourceStatus.storagePercent} unit={resourceStatus.storagePercent == null ? "" : "%"} />
              <Metric label="Communication" value={resourceStatus.communication ?? "Not connected"} />
            </div>
            <p className="lf-footnote">Values appear when connected to the engineering engine.</p>
          </div>

          <div className="lf-controls">
            {!isRunning && !isPaused && !isCompleted && (
              <button className="lf-button lf-button-primary" onClick={handleStart}>Start simulation</button>
            )}
            {isRunning && (
              <button className="lf-button lf-button-primary" onClick={handlePause}>Pause</button>
            )}
            {isPaused && (
              <button className="lf-button lf-button-primary" onClick={handleResume}>Resume</button>
            )}
            {isCompleted && (
              <div className="lf-complete-note">
                <strong>Scenario complete</strong>
                <span>
                  {missionValid === true
                    ? "The supplied mission validation passed."
                    : missionValid === false
                      ? "The supplied mission validation did not pass."
                      : "Simulation sequence finished. Mission validity was not supplied."}
                </span>
              </div>
            )}
            <button className="lf-button lf-button-secondary" onClick={handleRestart}>Restart</button>
          </div>
        </aside>
      </section>

      <section className="lf-timeline-card">
        <div className="lf-timeline-heading">
          <div>
            <p className="lf-eyebrow">MISSION SEQUENCE</p>
            <h2>Flight timeline</h2>
          </div>
          <span className="lf-muted">5 phases</span>
        </div>
        <div className="lf-timeline">
          {SIMULATION_STAGES.map((stage, index) => {
            const complete = isCompleted || index < simulation.stageIndex;
            const active = !isCompleted && index === simulation.stageIndex;
            return (
              <div className={`lf-timeline-item ${complete ? "is-complete" : ""} ${active ? "is-active" : ""}`} key={stage.id}>
                <span className="lf-timeline-dot">{complete ? "✓" : index + 1}</span>
                <span className="lf-timeline-title">{stage.title}</span>
              </div>
            );
          })}
        </div>
      </section>

      <p className="lf-disclaimer">
        Educational visualization only. The orbit path and phase durations are simplified gameplay assumptions,
        not a validated spacecraft trajectory or flight-dynamics model.
      </p>
    </main>
  );
}
