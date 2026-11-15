import { MISSION_BASELINE } from "../engine/componentsData.js";

export const NILE_DELTA_AREAS = [
  { id: "coastline", name: "Rosetta and Damietta coast", objectiveId: "coastline" },
  { id: "wetlands", name: "Lake Manzala wetlands", objectiveId: "wetlands" },
  { id: "agriculture", name: "Agricultural / urban transition", objectiveId: "agriculture" },
];

export function evaluateNileDeltaMission({
  engineeringMission,
  observedAreas = NILE_DELTA_AREAS.map((area) => area.id),
  durationDays = MISSION_BASELINE.scenarioDurationDays,
} = {}) {
  const metrics = engineeringMission?.metrics || {};
  const selectedIds = engineeringMission?.selectedComponentIds || [];
  const hasCamera = selectedIds.some((id) => id === "camera_basic" || id === "camera_advanced");
  const hasAdcs = selectedIds.some((id) => id === "adcs_basic" || id === "adcs_precise");
  const validObservationSystem = hasCamera && hasAdcs;

  const completedAreaIds = validObservationSystem
    ? [...new Set(observedAreas)].filter((id) => NILE_DELTA_AREAS.some((area) => area.id === id))
    : [];
  const generatedDataMB = Number(metrics.dataPerDayMB || 0) * durationDays;
  const storageCapacityMB = Number(metrics.storageGb || 0) * 1024;
  const storedDataMB = Math.min(generatedDataMB, storageCapacityMB);
  const contactCapacityMB = Number(metrics.downlinkCapacityMBPerContact || 0) * durationDays;
  const transmittedDataMB = Math.min(storedDataMB, contactCapacityMB);
  const dataDownlinkedPercent = storedDataMB > 0
    ? (transmittedDataMB / storedDataMB) * 100
    : 0;
  const areasTarget = MISSION_BASELINE.minimumAreasObserved;
  const downlinkTarget = MISSION_BASELINE.minimumDownlinkedPercent;
  const storagePass = generatedDataMB <= storageCapacityMB;
  const areasPass = completedAreaIds.length >= areasTarget;
  const downlinkPass = dataDownlinkedPercent >= downlinkTarget;
  const engineeringPass = Boolean(engineeringMission?.feasible);

  const objectives = [
    { id: "coastline", title: "Observe coastal change", completed: completedAreaIds.includes("coastline"), detail: "Rosetta and Damietta coastal scene" },
    { id: "wetlands", title: "Observe Lake Manzala wetlands", completed: completedAreaIds.includes("wetlands"), detail: "Northern lake and wetland scene" },
    { id: "agriculture", title: "Observe agricultural / urban patterns", completed: completedAreaIds.includes("agriculture"), detail: "Agricultural and built-up land scene" },
    { id: "storage", title: "Store collected image data", completed: storagePass, detail: `${storedDataMB.toFixed(1)} MB stored of ${generatedDataMB.toFixed(1)} MB generated` },
    { id: "downlink", title: `Downlink at least ${downlinkTarget}% of stored data`, completed: downlinkPass, detail: `${transmittedDataMB.toFixed(1)} MB transmitted · ${dataDownlinkedPercent.toFixed(1)}%` },
  ];

  const completedObjectives = objectives.filter((objective) => objective.completed).length;
  const missionSuccess = engineeringPass && areasPass && storagePass && downlinkPass;

  return {
    missionId: "nile_delta_watch",
    missionName: "Nile Delta Watch",
    durationDays,
    completedAreaIds,
    areasObserved: completedAreaIds.length,
    areasTarget,
    generatedDataMB,
    storedDataMB,
    storageCapacityMB,
    transmittedDataMB,
    queuedDataMB: Math.max(0, storedDataMB - transmittedDataMB),
    dataDownlinkedPercent,
    downlinkTargetPercent: downlinkTarget,
    objectives,
    completedObjectives,
    totalObjectives: objectives.length,
    engineeringPass,
    missionSuccess,
    status: missionSuccess ? "SUCCESS" : "INCOMPLETE",
    reasons: [
      ...(!engineeringPass ? ["The spacecraft design did not pass engineering validation."] : []),
      ...(!areasPass ? [`Only ${completedAreaIds.length} of ${areasTarget} required areas were observed.`] : []),
      ...(!storagePass ? ["The mission generated more data than the selected storage can hold."] : []),
      ...(!downlinkPass ? [`Only ${dataDownlinkedPercent.toFixed(1)}% of stored data was transmitted; ${downlinkTarget}% is required.`] : []),
    ],
    educationalDisclaimer: "Synthetic gameplay result; not a real satellite observation, orbit prediction, or flight-readiness assessment.",
  };
}
