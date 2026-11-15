export const SIMULATION_STAGES = [
  {
    id: "launch",
    title: "Launch",
    subtitle: "The launch sequence has started.",
    description: "The launch vehicle begins carrying the CubeSat toward its target orbit.",
    durationMs: 5000,
  },
  {
    id: "orbit",
    title: "Orbit insertion",
    subtitle: "The spacecraft is approaching its planned orbit.",
    description: "The mission scenario places the CubeSat into a low Earth orbit.",
    durationMs: 5000,
  },
  {
    id: "deployment",
    title: "System deployment",
    subtitle: "The spacecraft systems are being checked.",
    description: "The satellite begins its operations sequence and checks its onboard systems.",
    durationMs: 5000,
  },
  {
    id: "observation",
    title: "Earth observation",
    subtitle: "The payload is collecting observation data.",
    description: "The CubeSat points its instrument toward Earth and collects simulated observation data.",
    durationMs: 7000,
  },
  {
    id: "communication",
    title: "Communication",
    subtitle: "The spacecraft is attempting to transmit its data.",
    description: "The satellite attempts to send its collected data to a ground station.",
    durationMs: 6000,
  },
];

export const INITIAL_SIMULATION_STATE = {
  status: "idle",
  stageIndex: 0,
  stageProgress: 0,
  totalProgress: 0,
  elapsedMs: 0,
  completed: false,
};

export function getStageProgress(state) {
  return Math.max(0, Math.min(100, state.stageProgress));
}
