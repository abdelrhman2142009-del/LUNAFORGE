export const SPACE_EVENTS = [
  {
    id: "solar_activity",
    title: "Elevated solar activity",
    category: "Power",
    severity: "warning",
    description:
      "The scenario reports elevated solar activity. For this game round, the available power margin is reduced.",
    effect: { powerDelta: -12, storageDelta: 0, communication: null },
    recommendation:
      "Review power-consuming activities and prioritize essential spacecraft operations.",
  },
  {
    id: "temporary_comms_gap",
    title: "Temporary communication gap",
    category: "Communications",
    severity: "warning",
    description:
      "The ground station is temporarily unavailable in this scenario. New data must wait before transmission.",
    effect: { powerDelta: 0, storageDelta: 8, communication: "Temporarily unavailable" },
    recommendation:
      "Keep the collected data queued and retry communication when the ground station becomes available.",
  },
  {
    id: "data_backlog",
    title: "Observation data backlog",
    category: "Data",
    severity: "info",
    description:
      "The payload has generated more data than expected in this gameplay scenario.",
    effect: { powerDelta: -3, storageDelta: 15, communication: null },
    recommendation:
      "Review the observation plan and available storage before collecting more data.",
  },
  {
    id: "debris_alert",
    title: "Space-debris safety alert",
    category: "Safety",
    severity: "warning",
    description:
      "A debris alert has been added to the scenario. This is a simplified educational event, not a real conjunction warning.",
    effect: { powerDelta: -2, storageDelta: 0, communication: null },
    recommendation:
      "Pause non-essential activities and review the mission safety status. The game does not calculate avoidance maneuvers.",
  },
];

export function pickRandomSpaceEvent(random = Math.random) {
  const index = Math.floor(random() * SPACE_EVENTS.length);
  return SPACE_EVENTS[Math.max(0, Math.min(index, SPACE_EVENTS.length - 1))];
}

export function applySpaceEvent(resources = {}, event) {
  if (!event) return { ...resources };
  const power = Number(resources.powerPercent ?? 100);
  const storage = Number(resources.storagePercent ?? 0);
  return {
    ...resources,
    powerPercent: Math.max(0, Math.min(100, power + event.effect.powerDelta)),
    storagePercent: Math.max(0, Math.min(100, storage + event.effect.storageDelta)),
    communication: event.effect.communication ?? resources.communication ?? "Available",
  };
}
