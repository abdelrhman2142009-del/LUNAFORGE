const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export function buildFlightProfile(report) {
  const selected = report?.selectedComponents || [];
  const totals = report?.totals || {};
  const ids = new Set(selected.map((item) => item.id));
  const batteryWh = Number(totals.batteryCapacityWh || 0);
  const solarOutput = Number(report?.solarPower || 0);
  const massKg = Number(totals.mass || 0);
  const hasAdcs = ids.has("adcs-1") || ids.has("adcs-2");
  const precisionAdcs = ids.has("adcs-2");
  const advancedCamera = ids.has("camera-2");
  const hasComputer = ids.has("computer-1");
  const hasEps = ids.has("eps-1");
  const hasDeployableSolar = ids.has("power-2");
  const agility = clamp(1.18 - massKg * 0.018 + (hasAdcs ? 0.08 : -0.08) + (precisionAdcs ? 0.08 : 0), 0.78, 1.3);
  const boostCapacity = clamp(68 + batteryWh * 0.42, 68, 112);
  const boostRecharge = clamp(8 + solarOutput * 0.22 + (hasDeployableSolar ? 2 : 0), 8, 24);
  const pulseCooldown = clamp(0.3 - (hasComputer ? 0.035 : 0) - (hasEps ? 0.045 : 0), 0.18, 0.3);
  const scanRadius = 25 + (advancedCamera ? 9 : ids.has("camera-1") ? 4 : 0);
  const shieldDuration = clamp(3 + batteryWh * 0.025, 3, 6);
  const scienceMultiplier = advancedCamera ? 1.35 : ids.has("camera-1") ? 1.15 : 1;
  const communicationsBonus = ids.has("communication-2") ? 1.25 : ids.has("communication-1") ? 1.1 : 1;
  let className = "UNCONFIGURED TEST CRAFT";
  if (precisionAdcs && advancedCamera) className = "PRECISION SCIENCE SCOUT";
  else if (batteryWh >= 75) className = "LONG-ENDURANCE EXPLORER";
  else if (hasDeployableSolar) className = "SOLAR-POWERED SURVEYOR";
  else if (hasAdcs && hasComputer) className = "BALANCED ORBITAL SCOUT";
  return { className, massKg, batteryWh, solarOutput, agility, boostCapacity, boostRecharge, pulseCooldown, scanRadius, shieldDuration, scienceMultiplier, communicationsBonus, hasDesign: selected.length > 0, selectedCount: selected.length };
}

export function getDailyChallenge(date = new Date()) {
  const key = [date.getUTCFullYear(), String(date.getUTCMonth() + 1).padStart(2, "0"), String(date.getUTCDate()).padStart(2, "0")].join("-");
  const hash = [...key].reduce((value, char) => ((value * 31) + char.charCodeAt(0)) >>> 0, 7);
  const variants = [
    { title: "SOLAR STORM RUN", briefing: "Solar flares arrive more often. Keep moving and save boost for the warning.", objectiveText: "Survive at least one solar flare without taking a hit.", flareInterval: 14, coreGoal: 8, bonus: 400 },
    { title: "CRYSTAL HARVEST", briefing: "Crystal asteroids are more common. Prioritize precision shots for bonus score.", objectiveText: "Destroy at least three crystal asteroids.", flareInterval: 22, coreGoal: 9, bonus: 500 },
    { title: "DEEP ORBIT RELAY", briefing: "Recover extra science data before reaching the rescue relay.", objectiveText: "Recover ten data cores and restore the relay.", flareInterval: 19, coreGoal: 10, bonus: 650 },
  ];
  return { dateKey: key, ...variants[hash % variants.length] };
}