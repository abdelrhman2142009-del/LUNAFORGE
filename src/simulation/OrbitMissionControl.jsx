import { useEffect, useMemo, useState } from "react";
import EarthGlobe from "../components/EarthGlobe";
import {
  calculateOrbitalState,
  getOrbitPeriodSeconds,
  isWithinGroundFootprint,
} from "./orbitMechanics.js";
import "./OrbitMissionControl.css";

const TARGETS = [
  { id: "rosetta", name: "Rosetta coast", latitudeDeg: 31.4, longitudeDeg: 30.4, science: "Coastal observation" },
  { id: "damietta", name: "Damietta coast", latitudeDeg: 31.5, longitudeDeg: 31.8, science: "Coastal observation" },
  { id: "manzala", name: "Lake Manzala", latitudeDeg: 31.3, longitudeDeg: 32.0, science: "Wetland observation" },
  { id: "delta", name: "Delta farmland", latitudeDeg: 30.9, longitudeDeg: 31.1, science: "Agriculture / urban patterns" },
];
const GROUND_STATION = { name: "Cairo ground station", latitudeDeg: 30.0444, longitudeDeg: 31.2357 };
const MISSION_DURATION_SECONDS = 7 * 24 * 60 * 60;
const SPEEDS = [1, 30, 120, 600];

function formatMissionTime(seconds) {
  const day = Math.floor(seconds / 86400) + 1;
  const withinDay = seconds % 86400;
  const hours = Math.floor(withinDay / 3600);
  const minutes = Math.floor((withinDay % 3600) / 60);
  return `DAY ${day} · ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")} UTC`;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export default function OrbitMissionControl({ engineeringMission, onTargetsCaptured = () => {} }) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(120);
  const [selectedTarget, setSelectedTarget] = useState(TARGETS[0].id);
  const [captured, setCaptured] = useState([]);
  const [storedDataMb, setStoredDataMb] = useState(0);
  const [downlinkedDataMb, setDownlinkedDataMb] = useState(0);
  const [batteryPercent, setBatteryPercent] = useState(100);
  const [activity, setActivity] = useState(["Mission control initialized. Awaiting orbit operations."]);

  const orbit = useMemo(() => calculateOrbitalState(elapsedSeconds), [elapsedSeconds]);
  const periodMinutes = getOrbitPeriodSeconds() / 60;
  const target = TARGETS.find((item) => item.id === selectedTarget) || TARGETS[0];
  const targetInView = isWithinGroundFootprint(orbit, target, 7);
  const stationInView = isWithinGroundFootprint(orbit, GROUND_STATION, 12);
  const cameraSelected = engineeringMission?.selectedComponentIds?.some((id) => id === "camera_basic" || id === "camera_advanced");
  const downlinkMbps = Number(engineeringMission?.metrics?.downlinkRateMbps) || 1;
  const missionComplete = elapsedSeconds >= MISSION_DURATION_SECONDS;

  useEffect(() => {
    if (!running || missionComplete) return undefined;
    const timer = window.setInterval(() => {
      setElapsedSeconds((current) => Math.min(MISSION_DURATION_SECONDS, current + (0.25 * speed)));
      const simulatedMinutes = (0.25 * speed) / 60;
      setBatteryPercent((current) => clamp(current + simulatedMinutes * (stationInView ? -0.0005 : -0.0015), 0, 100));
      if (stationInView && storedDataMb > downlinkedDataMb) {
        const transfer = (downlinkMbps / 8) * (0.25 * speed);
        setDownlinkedDataMb((current) => Math.min(storedDataMb, current + transfer));
      }
    }, 250);
    return () => window.clearInterval(timer);
  }, [running, speed, missionComplete, stationInView, storedDataMb, downlinkedDataMb, downlinkMbps]);

  useEffect(() => {
    if (missionComplete) setRunning(false);
  }, [missionComplete]);

  function log(message) {
    setActivity((items) => [message, ...items].slice(0, 5));
  }

  function captureTarget() {
    if (!cameraSelected) {
      log("Capture blocked: install a camera in the spacecraft builder first.");
      return;
    }
    if (!targetInView) {
      log(`${target.name} is outside the camera footprint. Wait for the next pass.`);
      return;
    }
    if (captured.includes(target.id)) {
      log(`${target.name} has already been captured for this mission.`);
      return;
    }
    if (batteryPercent < 5) {
      log("Capture blocked: battery reserve is too low.");
      return;
    }
    const nextCaptured = [...captured, target.id];
    setCaptured(nextCaptured);
    onTargetsCaptured(nextCaptured);
    setStoredDataMb((value) => value + 120);
    setBatteryPercent((value) => clamp(value - 4, 0, 100));
    log(`Image captured: ${target.name} · 120 MB added to onboard storage.`);
  }

  function resetMission() {
    setElapsedSeconds(0);
    setRunning(false);
    setCaptured([]);
    onTargetsCaptured([]);
    setStoredDataMb(0);
    setDownlinkedDataMb(0);
    setBatteryPercent(100);
    setActivity(["Mission reset. Satellite returned to its initial orbital state."]);
  }

  const orbitProgress = (orbit.phaseDeg / 360) * 100;
  const downlinkPercent = storedDataMb > 0 ? (downlinkedDataMb / storedDataMb) * 100 : 0;

  return (
    <section className="lf-orbit-game">
      <div className="lf-orbit-game-heading">
        <div>
          <p className="lf-eyebrow">LIVE FLIGHT OPERATIONS</p>
          <h2>Orbit the Earth. Operate your satellite.</h2>
          <p className="lf-muted">The spacecraft moves continuously through a calculated low-Earth orbit. Choose when to collect and transmit data.</p>
        </div>
        <span className={running ? "lf-orbit-live" : "lf-orbit-paused"}>{missionComplete ? "MISSION ENDED" : running ? "ORBIT RUNNING" : "PAUSED"}</span>
      </div>

      <div className="lf-orbit-layout">
        <div className="lf-orbit-visual">
          <div className="lf-orbit-visual-top"><span>EARTH / ORBITAL TRACK</span><span>ALTITUDE {orbit.altitudeKm} KM</span></div>
          <div className="lf-orbit-scene">
            <div className="lf-orbit-path" />
            <EarthGlobe />
            <div className="lf-orbiting-satellite" style={{ transform: `translate(-50%, -50%) rotate(${orbit.phaseDeg}deg) translateY(-175px)` }}>
              <span className="lf-orbiting-satellite-core" />
              <span className="lf-orbiting-satellite-wing" />
            </div>
            <span className="lf-orbit-target-label">NILE DELTA · EGYPT</span>
          </div>
          <div className="lf-orbit-progress"><span style={{ width: `${orbitProgress}%` }} /></div>
          <div className="lf-orbit-telemetry">
            <div><small>GROUND TRACK</small><strong>{orbit.latitudeDeg.toFixed(1)}°, {orbit.longitudeDeg.toFixed(1)}°</strong></div>
            <div><small>ORBIT PERIOD</small><strong>{periodMinutes.toFixed(1)} min</strong></div>
            <div><small>MISSION CLOCK</small><strong>{formatMissionTime(elapsedSeconds)}</strong></div>
          </div>
        </div>

        <div className="lf-orbit-ops">
          <div className="lf-orbit-resource-grid">
            <div><small>BATTERY</small><strong>{batteryPercent.toFixed(1)}%</strong><div className="lf-orbit-meter"><span style={{ width: `${batteryPercent}%` }} /></div></div>
            <div><small>ONBOARD STORAGE</small><strong>{storedDataMb.toFixed(0)} MB</strong><div className="lf-orbit-meter"><span style={{ width: `${Math.min(100, storedDataMb / 12.8)}%` }} /></div></div>
            <div><small>DOWNLINKED</small><strong>{downlinkedDataMb.toFixed(1)} MB</strong><div className="lf-orbit-meter"><span style={{ width: `${downlinkPercent}%` }} /></div></div>
          </div>

          <div className="lf-orbit-contact">
            <span className={stationInView ? "lf-contact-active" : ""}>{stationInView ? "GROUND STATION IN VIEW" : "NO GROUND CONTACT"}</span>
            <p>{stationInView ? "Cairo can receive data now. Stored data is transmitting automatically." : "Transmission is unavailable until the satellite passes within range of Cairo."}</p>
          </div>

          <label className="lf-orbit-target-select">Observation target
            <select value={selectedTarget} onChange={(event) => setSelectedTarget(event.target.value)}>
              {TARGETS.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
          <div className="lf-orbit-target-status">
            <span>{targetInView ? "TARGET IN CAMERA FOOTPRINT" : "TARGET NOT CURRENTLY VISIBLE"}</span>
            <small>{target.science} · {target.latitudeDeg.toFixed(1)}°N, {target.longitudeDeg.toFixed(1)}°E</small>
          </div>
          <button type="button" className="lf-orbit-capture" onClick={captureTarget} disabled={captured.includes(target.id) || missionComplete}>
            {captured.includes(target.id) ? "TARGET ALREADY CAPTURED" : "CAPTURE IMAGE · 120 MB"}
          </button>
          <div className="lf-orbit-controls">
            <button type="button" onClick={() => setRunning((value) => !value)} disabled={missionComplete}>{running ? "PAUSE ORBIT" : "START / RESUME ORBIT"}</button>
            <button type="button" onClick={resetMission}>RESET</button>
          </div>
          <label className="lf-orbit-speed">Time acceleration
            <select value={speed} onChange={(event) => setSpeed(Number(event.target.value))}>
              {SPEEDS.map((value) => <option key={value} value={value}>{value}×</option>)}
            </select>
          </label>
          <div className="lf-orbit-objectives">
            <strong>MISSION OBJECTIVES</strong>
            {TARGETS.map((item) => <span key={item.id} className={captured.includes(item.id) ? "is-captured" : ""}>{captured.includes(item.id) ? "✓" : "○"} {item.name}</span>)}
            <span>{downlinkPercent >= 80 ? "✓" : "○"} Downlink 80% of collected data ({downlinkPercent.toFixed(0)}%)</span>
          </div>
          <div className="lf-orbit-activity" aria-live="polite">
            <strong>FLIGHT LOG</strong>
            {activity.map((item, index) => <p key={`${index}-${item}`}>{item}</p>)}
          </div>
        </div>
      </div>
      <p className="lf-orbit-disclaimer">Educational approximation: circular two-body orbit, fixed 51.6° inclination, simplified Earth rotation and angular visibility footprints. No J2 perturbations, atmospheric drag, terrain masking, real antenna link budget, or precise pass prediction. Power and data rates are gameplay models.</p>
    </section>
  );
}
