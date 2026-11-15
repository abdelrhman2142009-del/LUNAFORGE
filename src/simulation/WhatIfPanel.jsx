import { useMemo, useState } from "react";

/**
 * A transparent gameplay-only comparison.
 * The coefficients below are illustrative balancing values, not spacecraft physics.
 */
export default function WhatIfPanel({ baseline = {}, onApplyScenario = () => {} }) {
  const [capacityIncrease, setCapacityIncrease] = useState(10);

  const comparison = useMemo(() => {
    const basePower = Number(baseline.powerMarginPercent ?? 60);
    const baseMass = Number(baseline.massBudgetPercent ?? 70);

    // Illustrative game rules: more battery capacity improves power margin,
    // but consumes some of the available mass budget.
    const scenarioPower = Math.min(100, basePower + capacityIncrease * 0.8);
    const scenarioMass = Math.max(0, baseMass - capacityIncrease * 0.5);

    return {
      basePower,
      baseMass,
      scenarioPower,
      scenarioMass,
      powerChange: scenarioPower - basePower,
      massChange: scenarioMass - baseMass,
    };
  }, [baseline, capacityIncrease]);

  return (
    <section className="lfx-card" aria-labelledby="lfx-whatif-title">
      <div className="lfx-section-kicker">DECISION LAB</div>
      <h2 id="lfx-whatif-title">What if?</h2>
      <p className="lfx-muted">
        Change one design choice and compare the estimated gameplay impact.
      </p>

      <label className="lfx-range-label" htmlFor="lfx-battery-change">
        Battery capacity change: <strong>+{capacityIncrease}%</strong>
      </label>
      <input
        id="lfx-battery-change"
        type="range"
        min="0"
        max="30"
        step="5"
        value={capacityIncrease}
        onChange={(event) => setCapacityIncrease(Number(event.target.value))}
      />

      <div className="lfx-compare-grid">
        <div>
          <span>Power margin</span>
          <strong>{comparison.basePower.toFixed(0)}% → {comparison.scenarioPower.toFixed(0)}%</strong>
        </div>
        <div>
          <span>Mass budget remaining</span>
          <strong>{comparison.baseMass.toFixed(0)}% → {comparison.scenarioMass.toFixed(0)}%</strong>
        </div>
      </div>

      <p className="lfx-tradeoff">
        Trade-off: power margin changes by +{comparison.powerChange.toFixed(0)} points;
        remaining mass budget changes by {comparison.massChange.toFixed(0)} points.
      </p>
      <button
        type="button"
        className="lfx-action"
        onClick={() =>
          onApplyScenario({
            variable: "batteryCapacityIncreasePercent",
            value: capacityIncrease,
            estimatedPowerMarginPercent: comparison.scenarioPower,
            estimatedMassBudgetPercent: comparison.scenarioMass,
            model: "illustrative-gameplay-rule",
          })
        }
      >
        Use this scenario for comparison
      </button>
      <p className="lfx-disclaimer">
        These coefficients are temporary gameplay assumptions, not validated engineering
        equations. Replace them with Member 3 engine outputs when integration is available.
      </p>
    </section>
  );
}
