export const SIMULATION_STAGES = [
  { id: "launch", title: "Launch", subtitle: "Launch sequence started.", description: "The launch vehicle begins carrying the CubeSat toward its target orbit.", durationMs: 5000 },
  { id: "orbit", title: "Orbit insertion", subtitle: "Approaching the planned orbit.", description: "The scenario places the CubeSat into a simplified low Earth orbit.", durationMs: 5000 },
  { id: "deployment", title: "System deployment", subtitle: "Onboard systems are checked.", description: "The satellite begins its operations sequence and checks its onboard systems.", durationMs: 5000 },
  { id: "observation", title: "Earth observation", subtitle: "Payload is collecting data.", description: "The CubeSat points its instrument toward Earth and collects simulated observation data.", durationMs: 7000 },
  { id: "communication", title: "Communication", subtitle: "Attempting data transmission.", description: "The satellite attempts to send its collected data to a ground station.", durationMs: 6000 },
];

export const INITIAL_SIMULATION_STATE = {
  status: "idle",
  stageIndex: 0,
  stageProgress: 0,
  totalProgress: 0,
  elapsedMs: 0,
  completed: false,
};
