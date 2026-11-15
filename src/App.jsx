
import { useState } from "react";
import "./App.css";
import Builder from "./components/Builder";
import MissionSimulation from "./components/MissionSimulation";
import { runEngineeringWhatIf } from "./engine/engineAdapter";
const features = [
  {
    number: "01",
    title: "Mission Design",
    description: "Design spacecraft for real-world inspired space missions.",
  },
  {
    number: "02",
    title: "Engineering Systems",
    description: "Balance mass, power, storage and mission resources.",
  },
  {
    number: "03",
    title: "Mission Simulation",
    description: "Test your spacecraft through different mission phases.",
  },
  {
    number: "04",
    title: "Scientific Exploration",
    description: "Explore aerospace concepts and scientific data.",
  },
];

function App() {
  const [screen, setScreen] = useState("home");
  const [missionReport, setMissionReport] = useState(null);

  const openAnalysis = (report) => {
    setMissionReport(report);
    setScreen("analysis");
  };

  const solarPower = missionReport?.solarPower ?? 0;
  const powerBalance = missionReport?.powerBalance ?? 0;
  const powerSufficient = missionReport?.powerSufficient ?? false;
  const engineAnalysis = missionReport?.engineAnalysis;
  const cameraUpgrade = missionReport?.selectedComponents?.some((item) => item.id === "camera-1")
    ? missionReport.selectedComponents.map((item) => item.id === "camera-1"
        ? { ...item, id: "camera-2", name: "Advanced Earth Camera", mass: 0.8, cost: 220, power: 5, dataGenerationMBPerMinute: 20 }
        : item)
    : null;
  const whatIfResult = cameraUpgrade && engineAnalysis
    ? runEngineeringWhatIf(missionReport.selectedComponents, cameraUpgrade)
    : null;

  return (
    <main className="app">
      <header className="navbar">
        <a
          className="logo"
          href="#"
          onClick={() => setScreen("home")}
        >
          <span className="logo-symbol">L.</span>
          <span>
            <strong>LUNAFORGE</strong>
            <small>SPACE ENGINEERING PLATFORM</small>
          </span>
        </a>

        <nav>
          <a
            href="#"
            className={screen === "home" ? "active" : ""}
            onClick={() => setScreen("home")}
          >
            Overview
          </a>

          <a
            href="#features"
            onClick={() => setScreen("home")}
          >
            Capabilities
          </a>

          <a
            href="#"
            className={
["missions", "briefing", "builder", "analysis", "simulation"].includes(screen)                ? "active"
                : ""
            }
            onClick={() => setScreen("missions")}
          >
            Missions
          </a>
        </nav>

        <div className="system-status">
          <span className="status-dot" />
          SYSTEM ONLINE
        </div>
      </header>

      {/* HOME */}

      {screen === "home" && (
        <>
          <section className="hero">
            <div className="hero-content">
              <div className="eyebrow">
                <span className="status-dot" />
                NEXT GENERATION SPACE ENGINEERING
              </div>

              <h1>
                ENGINEER
                <br />
                THE <span>UNKNOWN.</span>
              </h1>

              <p className="subtitle">
                Your mission. Your spacecraft. Your decisions.
              </p>

              <p className="description">
                Enter the world of aerospace engineering. Design
                spacecraft, manage critical resources, analyze
                engineering trade-offs, and simulate your own
                space mission.
              </p>

              <div className="hero-actions">
                <button
                  className="primary-button"
                  onClick={() => setScreen("missions")}
                >
                  START YOUR MISSION <span>→</span>
                </button>

                <a href="#features" className="secondary-link">
                  EXPLORE PLATFORM ↓
                </a>
              </div>

              <div className="hero-meta">
                <div><strong>01</strong><span>DESIGN</span></div>
                <div><strong>02</strong><span>OPTIMIZE</span></div>
                <div><strong>03</strong><span>SIMULATE</span></div>
              </div>
            </div>

            <div className="visual-panel">
              <div className="visual-top">
                <span>MISSION VISUALIZATION</span>
                <span>FIG. 001 / LEO</span>
              </div>

              <div className="space-scene">
                <div className="star star-one" />
                <div className="star star-two" />
                <div className="star star-three" />
                <div className="star star-four" />
                <div className="orbit orbit-one" />
                <div className="orbit orbit-two" />

                <div className="earth">
                  <div className="earth-glow" />
                </div>

                <div className="satellite">
                  <div className="solar-panel left-panel" />
                  <div className="satellite-body">
                    <div className="satellite-detail" />
                  </div>
                  <div className="solar-panel right-panel" />
                  <div className="antenna" />
                </div>

                <div className="visual-coordinate coordinate-one">
                  ALTITUDE <strong>500 KM</strong>
                </div>

                <div className="visual-coordinate coordinate-two">
                  ORBIT <strong>LOW EARTH ORBIT</strong>
                </div>
              </div>

              <div className="visual-bottom">
                <span>EARTH OBSERVATION CUBESAT</span>
                <span>MISSION CONCEPT / 001</span>
              </div>
            </div>
          </section>

          <section className="features-section" id="features">
            <div className="section-heading">
              <div>
                <span className="eyebrow">PLATFORM CAPABILITIES</span>
                <h2>BEYOND THE DESIGN.</h2>
              </div>
              <span className="section-index">01 — 04</span>
            </div>

            <div className="features-grid">
              {features.map((feature) => (
                <article className="feature-card" key={feature.number}>
                  <span className="feature-number">{feature.number}</span>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                  <span className="feature-arrow">↗</span>
                </article>
              ))}
            </div>
          </section>
        </>
      )}

      {/* MISSION SELECTION */}

      {screen === "missions" && (
        <section className="page-section">
          <div className="eyebrow">MISSION SELECTION / 001</div>

          <h1 className="page-title">
            SELECT YOUR <span>MISSION.</span>
          </h1>

          <p className="page-intro">
            Every successful mission starts with a clear objective.
            Choose your first engineering challenge.
          </p>

          <article className="mission-card">
            <div className="mission-card-top">
              <span className="mission-tag">AVAILABLE MISSION</span>
              <span className="mission-number">MISSION 001</span>
            </div>

            <div className="mission-card-content">
              <span className="mission-symbol">EO / 01</span>
              <h2>EARTH OBSERVATION CUBESAT</h2>

              <p>
                Design a small satellite in Low Earth Orbit
                capable of collecting Earth observation data.
                Balance engineering constraints and complete
                your mission objectives.
              </p>

              <div className="mission-specs">
                <div><span>ORBIT TYPE</span><strong>LEO</strong></div>
                <div><span>DIFFICULTY</span><strong>BEGINNER</strong></div>
                <div>
                  <span>MISSION TYPE</span>
                  <strong>EARTH OBSERVATION</strong>
                </div>
              </div>
            </div>

            <button
              className="primary-button"
              onClick={() => setScreen("briefing")}
            >
              VIEW MISSION BRIEFING <span>→</span>
            </button>
          </article>
        </section>
      )}

      {/* MISSION BRIEFING */}

      {screen === "briefing" && (
        <section className="page-section briefing-page">
          <button
            className="back-link"
            onClick={() => setScreen("missions")}
          >
            ← BACK TO MISSIONS
          </button>

          <div className="eyebrow">MISSION 001 / MISSION BRIEFING</div>

          <h1 className="page-title">
            EARTH <span>OBSERVER.</span>
          </h1>

          <p className="page-intro">
            Your objective is to design and operate a CubeSat
            that collects useful observations of Earth from
            Low Earth Orbit.
          </p>

          <div className="briefing-grid">
            <article className="briefing-card objective-card">
              <span className="card-index">01 / OBJECTIVE</span>
              <h2>THE MISSION</h2>

              <p>
                Design a small satellite equipped with an
                observation payload. Your spacecraft must
                collect image data, store it onboard, and
                transmit it to a ground station.
              </p>

              <div className="objective-highlight">
                <span>PRIMARY GOAL</span>
                <strong>
                  Collect and transmit Earth observation data.
                </strong>
              </div>
            </article>

            <article className="briefing-card">
              <span className="card-index">02 / ORBITAL PARAMETERS</span>
              <h2>MISSION PROFILE</h2>

              <div className="parameter-list">
                <div><span>Orbit</span><strong>Low Earth Orbit (LEO)</strong></div>
                <div><span>Target altitude</span><strong>500 km</strong></div>
                <div><span>Mission duration</span><strong>90 days</strong></div>
                <div><span>Spacecraft type</span><strong>CubeSat</strong></div>
              </div>
            </article>

            <article className="briefing-card">
              <span className="card-index">03 / ENGINEERING LIMITS</span>
              <h2>MISSION CONSTRAINTS</h2>

              <div className="parameter-list">
                <div><span>Maximum mass</span><strong>12.0 kg</strong></div>
                <div><span>Available budget</span><strong>1,000 credits</strong></div>
                <div><span>Power system</span><strong>Must support operations</strong></div>
                <div><span>Data storage</span><strong>Must fit collected data</strong></div>
              </div>

              <p className="assumption-note">
                These are illustrative gameplay limits, not
                official spacecraft specifications.
              </p>
            </article>

            <article className="briefing-card requirements-card">
              <span className="card-index">04 / SUCCESS CRITERIA</span>
              <h2>WHAT YOU MUST ACHIEVE</h2>

              <ul className="requirements-list">
                <li>Stay within the spacecraft mass limit.</li>
                <li>Stay within the mission budget.</li>
                <li>Provide enough power for your components.</li>
                <li>Include a payload for Earth observation.</li>
                <li>Store and transmit the collected data.</li>
              </ul>
            </article>
            {engineAnalysis && (
              <>
                <article className="briefing-card">
                  <span className="card-index">06 / ENGINEERING ENGINE</span>
                  <h2>{engineAnalysis.mission.mission} — {engineAnalysis.status}</h2>
                  <div className="objective-highlight">
                    <span>MISSION DESIGN SCORE</span>
                    <strong>{engineAnalysis.score.total.toFixed(1)} / 100 · GRADE {engineAnalysis.score.grade}</strong>
                  </div>
                  <div className="parameter-list">
                    <div><span>Calculated mass</span><strong>{engineAnalysis.mission.metrics.totalMassKg.toFixed(2)} kg</strong></div>
                    <div><span>Average power margin</span><strong>{engineAnalysis.mission.metrics.powerMarginW.toFixed(2)} W</strong></div>
                    <div><span>Battery energy</span><strong>{engineAnalysis.mission.metrics.batteryEnergyWh.toFixed(1)} Wh</strong></div>
                    <div><span>Daily data volume</span><strong>{engineAnalysis.mission.metrics.dataPerDayGB.toFixed(2)} GB</strong></div>
                    <div><span>Game budget remaining</span><strong>{engineAnalysis.mission.metrics.budgetCreditsRemaining.toFixed(0)} CR</strong></div>
                  </div>
                  {engineAnalysis.violations.map((item) => <p className="assumption-note" key={item}>⚠ {item}</p>)}
                  {engineAnalysis.warnings.map((item) => <p className="assumption-note" key={item}>ⓘ {item}</p>)}
                </article>
                {whatIfResult && (
                  <article className="briefing-card">
                    <span className="card-index">07 / WHAT-IF TRADE STUDY</span>
                    <h2>UPGRADE TO ADVANCED CAMERA</h2>
                    <p>Compare the current design with an advanced camera while keeping every other selected subsystem unchanged.</p>
                    <div className="parameter-list">
                      <div><span>Mass change</span><strong>{whatIfResult.comparison.totalMassKg.absolute > 0 ? "+" : ""}{whatIfResult.comparison.totalMassKg.absolute.toFixed(2)} kg</strong></div>
                      <div><span>Science score change</span><strong>+{whatIfResult.comparison.scienceScore.absolute.toFixed(0)}</strong></div>
                      <div><span>Budget change</span><strong>+{whatIfResult.comparison.budgetCredits.absolute.toFixed(0)} CR</strong></div>
                      <div><span>New mission status</span><strong>{whatIfResult.after.status}</strong></div>
                    </div>
                    <p className="assumption-note">{whatIfResult.interpretation}</p>
                  </article>
                )}
              </>
            )}
          </div>

          <div className="briefing-footer">
            <div>
              <span className="card-index">MISSION STATUS</span>
              <strong>AWAITING SPACECRAFT DESIGN</strong>
            </div>

            <button
              className="primary-button"
              onClick={() => setScreen("builder")}
            >
              BEGIN SPACECRAFT DESIGN <span>→</span>
            </button>
          </div>
        </section>
      )}

      {/* SPACECRAFT BUILDER */}

      {screen === "builder" && (
        <Builder onProceed={openAnalysis} />
      )}

      {/* MISSION ANALYSIS */}

      {screen === "analysis" && missionReport && (
        <section className="page-section">
          <button
            className="back-link"
            onClick={() => setScreen("builder")}
          >
            ← BACK TO SPACECRAFT BUILDER
          </button>

          <div className="eyebrow">
            MISSION 001 / ENGINEERING ANALYSIS
          </div>

          <h1 className="page-title">
            MISSION <span>ANALYSIS.</span>
          </h1>

          <p className="page-intro">
            Review your spacecraft configuration and resource
            balance before proceeding to mission simulation.
          </p>

          <div className="briefing-grid">
            {/* VALIDATION */}

            <article className="briefing-card">
              <span className="card-index">01 / MISSION STATUS</span>
              <h2>DESIGN VALIDATION</h2>

              <p>
                {powerSufficient
                  ? "Your current spacecraft configuration meets the prototype power balance check."
                  : "Your spacecraft power balance has not passed the current prototype check."}
              </p>

              <div className="objective-highlight">
                <span>VALIDATION RESULT</span>
                <strong>
                  {powerSufficient
                    ? "POWER BALANCE PASSED"
                    : "POWER BALANCE NOT VERIFIED"}
                </strong>
              </div>
            </article>

            {/* RESOURCE SUMMARY */}

            <article className="briefing-card">
              <span className="card-index">02 / RESOURCE SUMMARY</span>
              <h2>SPACECRAFT RESOURCES</h2>

              <div className="parameter-list">
                <div>
                  <span>Total mass</span>
                  <strong>{missionReport.totals.mass.toFixed(2)} kg</strong>
                </div>

                <div>
                  <span>Total cost</span>
                  <strong>{missionReport.totals.cost.toLocaleString()} CR</strong>
                </div>

                <div>
                  <span>Power consumption</span>
                  <strong>{missionReport.totals.power.toFixed(1)} W</strong>
                </div>

                <div>
                  <span>Selected components</span>
                  <strong>{missionReport.selectedComponents.length}</strong>
                </div>
              </div>
            </article>

            {/* POWER ANALYSIS */}

            <article className="briefing-card">
              <span className="card-index">03 / POWER ANALYSIS</span>
              <h2>ENERGY BALANCE</h2>

              <div className="parameter-list">
                <div>
                  <span>Solar power generation</span>
                  <strong>{solarPower.toFixed(1)} W</strong>
                </div>

                <div>
                  <span>Power consumption</span>
                  <strong>{missionReport.totals.power.toFixed(1)} W</strong>
                </div>

                <div>
                  <span>Power balance</span>
                  <strong>
                    {powerBalance > 0 ? "+" : ""}
                    {powerBalance.toFixed(1)} W
                  </strong>
                </div>

                <div>
                  <span>Power status</span>
                  <strong>
                    {powerSufficient ? "SUFFICIENT" : "INSUFFICIENT"}
                  </strong>
                </div>
              </div>

              <p className="assumption-note">
                Solar output is a temporary gameplay assumption.
                Actual generation depends on panel design, orientation,
                illumination, and operating conditions.
              </p>
            </article>

            {/* SELECTED SYSTEMS */}

            <article className="briefing-card">
              <span className="card-index">04 / SELECTED SYSTEMS</span>
              <h2>SPACECRAFT CONFIGURATION</h2>

              <div className="parameter-list">
                {missionReport.selectedComponents.map((component) => (
                  <div key={component.id}>
                    <span>{component.category}</span>
                    <strong>{component.name}</strong>
                  </div>
                ))}
              </div>
            </article>

            {/* REQUIREMENTS */}

            <article className="briefing-card">
              <span className="card-index">05 / REQUIREMENTS</span>
              <h2>VALIDATION CHECKLIST</h2>

              <div className="parameter-list">
                {missionReport.requirements.map((item) => (
                  <div key={item.label}>
                    <span>{item.label}</span>
                    <strong>{item.complete ? "PASSED" : "PENDING"}</strong>
                  </div>
                ))}
              </div>
            </article>
          </div>

          <div className="briefing-footer">
            <div>
              <span className="card-index">NEXT PHASE</span>
              <strong>MISSION SIMULATION</strong>
            </div>

            <button
  className="primary-button"
  onClick={() => setScreen("simulation")}
>
  START MISSION SIMULATION <span>→</span>
</button>
          </div>

          <p className="assumption-note">
            This analysis uses temporary prototype data and
            simplified validation rules. It is not a real
            spacecraft flight-readiness assessment.
          </p>
        </section>
      )}
{/* MISSION SIMULATION */}

{screen === "simulation" && missionReport && (
  <MissionSimulation
    missionReport={missionReport}
    onBack={() => setScreen("analysis")}
  />
)}
      <footer className="footer">
        <span>© 2026 LUNAFORGE / SPACE ENGINEERING PLATFORM</span>
        <span><span className="status-dot" /> ALL SYSTEMS OPERATIONAL</span>
      </footer>
    </main>
  );
}

export default App;
