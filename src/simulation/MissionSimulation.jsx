import { useEffect, useMemo, useRef, useState } from "react";
import { startSimulation } from "./simulationEngine.js";
import { SIMULATION_STAGES, INITIAL_SIMULATION_STATE } from "./simulationStages.js";
import { applySpaceEvent } from "./SpaceEvents.js";
import { evaluateNileDeltaMission, NILE_DELTA_AREAS } from "./missionObjectives.js";
import WhatIfPanel from "./WhatIfPanel.jsx";
import MissionLog from "./MissionLog.jsx";
import "./simulation.css";
import EarthGlobe from "../components/EarthGlobe";
import NasaImageryPanel from "../components/NasaImageryPanel";
import "./simulation-enhancements.css";

function makeLogEntry(title, message) {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    time: new Date().toLocaleTimeString(),
    title,
    message,
  };
}

function Metric({ label, value, unit = "" }) {
  return (
    <div className="lf-metric">
      <span className="lf-metric-label">{label}</span>
      <strong>{value ?? "—"}{value == null ? "" : unit}</strong>
    </div>
  );
}

/**
 * Member 4 simulation screen.
 * Integration props are optional until Member 2/3 connect their modules:
 * resourceStatus: { powerPercent, storagePercent, communication }
 * missionValid: boolean | undefined
 * missionInputs: values used by Member 3's engineering engine
 * onScenarioCompare: callback for What-If comparison
 * onSimulationComplete: callback receiving final simulation state
 */
export default function MissionSimulation({
  resourceStatus: initialResourceStatus = {},
  missionValid,
  missionInputs = {},
  engineeringMission,
  missionConfig,
  onScenarioCompare = () => {},
  onSimulationComplete = () => {},
  onBack = () => {},
}) {
  const [simulation, setSimulation] = useState(INITIAL_SIMULATION_STATE);
  const [resources, setResources] = useState(initialResourceStatus);
  const [events, setEvents] = useState([]);
  const [missionOutcome, setMissionOutcome] = useState(null);
  const [observedAreas, setObservedAreas] = useState([]);
  const observedAreasRef = useRef([]);
  const [missedContacts, setMissedContacts] = useState(0);
  const [difficulty, setDifficulty] = useState("standard");
  const missedContactsRef = useRef(0);
  const [logEntries, setLogEntries] = useState([
    makeLogEntry("Mission control ready", "The educational CubeSat scenario is ready to start."),
  ]);
  const controllerRef = useRef(null);
  const resourcesRef = useRef(resources);

  useEffect(() => {
    resourcesRef.current = resources;
  }, [resources]);

  useEffect(() => {
    return () => controllerRef.current?.stop();
  }, []);

  useEffect(() => {
    setResources(initialResourceStatus);
  }, [initialResourceStatus]);

  const currentStage = SIMULATION_STAGES[simulation.stageIndex] ?? SIMULATION_STAGES[0];
  const isRunning = simulation.status === "running";
  const isPaused = simulation.status === "paused";
  const isCompleted = simulation.status === "completed";

  const whatIfBaseline = useMemo(() => ({
    powerMarginPercent: missionInputs.powerMarginPercent ?? resources.powerPercent ?? 60,
    massBudgetPercent: missionInputs.massBudgetPercent ?? 70,
  }), [missionInputs, resources]);

  function addLog(title, message) {
    setLogEntries((previous) => [makeLogEntry(title, message), ...previous].slice(0, 30));
  }

  function handleEvent(event) {
    setEvents((previous) => [event, ...previous].slice(0, 5));
    if (event.id === "temporary_comms_gap") {
      missedContactsRef.current += 1;
      setMissedContacts(missedContactsRef.current);
      addLog("Ground-station contact missed", "One assumed daily contact was lost in this scenario.");
    }
    const nextResources = applySpaceEvent(resourcesRef.current, event);
    resourcesRef.current = nextResources;
    setResources(nextResources);
    addLog(event.title, event.description);
  }

  function handleStart() {
    if (controllerRef.current) {
      controllerRef.current.resume();
      return;
    }

    controllerRef.current = startSimulation({
      onUpdate: setSimulation,
      onStageChange: (stage) => {
        addLog(`Phase: ${stage.title}`, stage.description);
        if (stage.id === "observation") {
          const ids = engineeringMission?.selectedComponentIds || [];
          const hasCamera = ids.some((id) => id === "camera_basic" || id === "camera_advanced");
          const hasAdcs = ids.some((id) => id === "adcs_basic" || id === "adcs_precise");
          const captured = hasCamera && hasAdcs ? NILE_DELTA_AREAS.map((area) => area.id) : [];
          observedAreasRef.current = captured;
          setObservedAreas(captured);
          addLog(
            "Nile Delta observation pass",
            captured.length
              ? "Three synthetic observation areas were recorded: the coast, Lake Manzala wetlands, and agricultural / urban transition."
              : "No observation scenes were recorded because a camera and ADCS are both required."
          );
        }
      },
      eventProbability: difficulty === "training" ? 0.03 : difficulty === "expert" ? 0.28 : 0.12,
      onEvent: handleEvent,
      onComplete: (finalState) => {
        const outcome = evaluateNileDeltaMission({
          engineeringMission,
          observedAreas: observedAreasRef.current,
          durationDays: missionConfig?.scenario?.durationDays ?? 7,
          missedContacts: missedContactsRef.current,
        });
        setSimulation(finalState);
        setMissionOutcome(outcome);
        addLog(
          "Mission evaluation completed",
          `${outcome.status}: ${outcome.completedObjectives}/${outcome.totalObjectives} objectives completed; ${outcome.dataDownlinkedPercent.toFixed(1)}% of stored data downlinked.`
        );
        onSimulationComplete({ ...finalState, missionOutcome: outcome });
      },
    });
    addLog("Simulation started", "The mission timeline has begun.");
    controllerRef.current.resume();
  }

  function handlePause() {
    controllerRef.current?.pause();
    addLog("Simulation paused", "Mission timeline paused by the user.");
  }

  function handleResume() {
    controllerRef.current?.resume();
    addLog("Simulation resumed", "Mission timeline resumed.");
  }

  function handleRestart() {
    controllerRef.current?.stop();
    controllerRef.current = null;
    setSimulation(INITIAL_SIMULATION_STATE);
    setEvents([]);
    setMissionOutcome(null);
    setObservedAreas([]);
    observedAreasRef.current = [];
    setMissedContacts(0);
    missedContactsRef.current = 0;
    setResources(initialResourceStatus);
    resourcesRef.current = initialResourceStatus;
    addLog("Simulation restarted", "The scenario was reset to its initial state.");
    handleStart();
  }

  function handleWhatIf(scenario) {
    addLog("What-if comparison", `Battery capacity scenario changed by +${scenario.value}%.`);
    onScenarioCompare(scenario);
  }

  return (
    <main className="lf-sim">
      <header className="lf-sim-header">
        <div>
          <p className="lf-eyebrow">LUNAFORGE / MISSION CONTROL</p>
          <h1>{missionConfig?.mission?.name ?? "Nile Delta Watch"}</h1>
          <p className="lf-muted">Nile Delta, Egypt · 500 km LEO · 7 scenario days (accelerated game timeline)</p>
        </div>
        <div className="lf-sim-header-actions">
          <button type="button" className="lf-button lf-button-secondary" onClick={onBack}>Back to analysis</button>
          <span className={`lf-status lf-status-${simulation.status}`}>{simulation.status.toUpperCase()}</span>
        </div>
      </header>

      <section className="lf-sim-grid">
        <div className="lf-scene-card">
          <div className="lf-scene-topline">
            <span>ORBIT VIEW</span><span>NASA BLUE MARBLE · TEXTURED 3D GLOBE</span>
          </div>
          <div className={`lf-space-scene ${isRunning ? "is-running" : ""} ${isPaused ? "is-paused" : ""}`}>
            <span className="lf-star lf-star-one" /><span className="lf-star lf-star-two" />
            <span className="lf-star lf-star-three" /><span className="lf-star lf-star-four" />
            <div className="lf-orbit-ring" />
            <EarthGlobe />
            <div className="lf-satellite-orbit">
              <div className="lf-satellite">
                <span className="lf-sat-panel lf-sat-panel-left" /><span className="lf-sat-body" />
                <span className="lf-sat-panel lf-sat-panel-right" /><span className="lf-sat-antenna" />
              </div>
            </div>
            <div className="lf-scene-label lf-earth-label">EARTH</div>
            <div className="lf-scene-label lf-satellite-label">CUBESAT</div>
          </div>
          <div className="lf-progress-row">
            <div><span className="lf-muted">MISSION PROGRESS</span><strong>{Math.round(simulation.totalProgress)}%</strong></div>
            <div className="lf-progress-track"><span style={{ width: `${simulation.totalProgress}%` }} /></div>
          </div>
        </div>

        <aside className="lf-side-panel">
          <div className="lf-panel-card">
            <p className="lf-eyebrow">CURRENT PHASE</p>
            <h2>{currentStage.title}</h2>
            <p className="lf-muted">{currentStage.description}</p>
            <div className="lf-stage-progress"><span style={{ width: `${simulation.stageProgress}%` }} /></div>
            <p className="lf-small">{currentStage.subtitle}</p>
          </div>

          <div className="lf-panel-card">
            <p className="lf-eyebrow">OBSERVATION TARGETS</p>
            <div className="lf-metrics">
              {NILE_DELTA_AREAS.map((area) => (
                <Metric
                  key={area.id}
                  label={area.name}
                  value={observedAreas.includes(area.id) ? "Recorded" : "Pending"}
                />
              ))}
            </div>
          </div>

          <div className="lf-panel-card">
            <p className="lf-eyebrow">TELEMETRY</p>
            <div className="lf-metrics">
              <Metric label="Power" value={resources.powerPercent} unit="%" />
              <Metric label="Storage used" value={resources.storagePercent} unit="%" />
              <Metric label="Communication" value={resources.communication} />
            </div>
            <p className="lf-footnote">Telemetry is a simplified gameplay model, not live spacecraft data.</p>
          </div>

          <div className="lf-controls">
            <label className="lf-difficulty-control">
              Scenario intensity
              <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)} disabled={isRunning || isPaused}>
                <option value="training">Training · fewer random events</option>
                <option value="standard">Standard · balanced</option>
                <option value="expert">Expert · more random events</option>
              </select>
            </label>
            {!isRunning && !isPaused && !isCompleted && <button className="lf-button lf-button-primary" onClick={handleStart}>Start simulation</button>}
            {isRunning && <button className="lf-button lf-button-primary" onClick={handlePause}>Pause</button>}
            {isPaused && <button className="lf-button lf-button-primary" onClick={handleResume}>Resume</button>}
            {isCompleted && (
              <div className="lf-complete-note">
                <strong>Scenario complete</strong>
                <span>{missionValid === true ? "Mission validation passed." : missionValid === false ? "Mission validation did not pass." : "Timeline finished; mission validation was not supplied."}</span>
              </div>
            )}
            <button className="lf-button lf-button-secondary" onClick={handleRestart}>Restart</button>
          </div>
        </aside>
      </section>

      <NasaImageryPanel />

      <section className="lf-timeline-card">
        <div className="lf-timeline-heading">
          <div><p className="lf-eyebrow">MISSION SEQUENCE</p><h2>Flight timeline</h2></div>
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

      {missionOutcome && (
        <section className="lf-timeline-card" aria-live="polite">
          <div className="lf-timeline-heading">
            <div>
              <p className="lf-eyebrow">NILE DELTA WATCH / FINAL REPORT</p>
              <h2>{missionOutcome.status}</h2>
            </div>
            <strong>{missionOutcome.completedObjectives}/{missionOutcome.totalObjectives} objectives</strong>
          </div>
          <div className="lf-metrics">
            <Metric label="Areas observed" value={missionOutcome.areasObserved} unit={` / ${missionOutcome.areasTarget}`} />
            <Metric label="Data generated" value={missionOutcome.generatedDataMB.toFixed(1)} unit=" MB" />
            <Metric label="Data stored" value={missionOutcome.storedDataMB.toFixed(1)} unit=" MB" />
            <Metric label="Data transmitted" value={missionOutcome.transmittedDataMB.toFixed(1)} unit=" MB" />
            <Metric label="Downlinked" value={missionOutcome.dataDownlinkedPercent.toFixed(1)} unit="%" />
            <Metric label="Missed contacts" value={missionOutcome.missedContacts} />
          </div>
          <ul className="lfx-event-list">
            {missionOutcome.objectives.map((objective) => (
              <li key={objective.id}>
                <strong>{objective.completed ? "✓" : "○"} {objective.title}</strong>
                <p>{objective.detail}</p>
              </li>
            ))}
          </ul>
          {missionOutcome.reasons.map((reason) => <p className="lfx-muted" key={reason}>{reason}</p>)}
          <p className="lfx-disclaimer">{missionOutcome.educationalDisclaimer}</p>
        </section>
      )}

      <section className="lfx-feature-grid">
        <div className="lfx-card">
          <div className="lfx-section-kicker">UNEXPECTED CONDITIONS</div>
          <h2>Space events</h2>
          <p className="lfx-muted">Scenario events can temporarily affect simulated resources.</p>
          {events.length === 0 ? <p className="lfx-empty">No scenario events yet. Events may appear during the mission.</p> : (
            <ul className="lfx-event-list">
              {events.map((event) => (
                <li key={event.id + event.title}>
                  <span className={`lfx-severity lfx-${event.severity}`}>{event.severity}</span>
                  <strong>{event.title}</strong>
                  <p>{event.description}</p>
                  <small>{event.recommendation}</small>
                </li>
              ))}
            </ul>
          )}
        </div>
        <WhatIfPanel baseline={whatIfBaseline} onApplyScenario={handleWhatIf} />
        <MissionLog entries={logEntries} />
      </section>

      <div className="lfx-footer-note">
        Educational game simulation only. Mission durations, random events, resource changes, and
        What-If coefficients are simplified gameplay assumptions, not flight predictions or
        validated spacecraft engineering calculations. Debris alerts do not calculate maneuvers.
      </div>
    </main>
  );
}
