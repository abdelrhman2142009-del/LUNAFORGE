import {
  INITIAL_SIMULATION_STATE,
  SIMULATION_STAGES,
} from "./simulationStages.js";

function copyState(state) {
  return { ...state };
}

/**
 * Starts the LUNAFORGE educational mission sequence.
 *
 * This is a simplified gameplay timeline, not a physical orbit propagator.
 * The caller owns the UI and receives state snapshots through onUpdate.
 *
 * @param {object} options
 * @param {(state: object) => void} options.onUpdate
 * @param {(state: object) => void} [options.onComplete]
 * @param {number} [options.tickMs=100]
 * @returns {{ pause: Function, resume: Function, restart: Function, stop: Function, getState: Function }}
 */
export function startSimulation({
  onUpdate = () => {},
  onComplete = () => {},
  tickMs = 100,
} = {}) {
  let state = copyState(INITIAL_SIMULATION_STATE);
  let timerId = null;
  let lastTick = null;

  const totalDuration = SIMULATION_STAGES.reduce(
    (sum, stage) => sum + stage.durationMs,
    0
  );

  function publish() {
    onUpdate(copyState(state));
  }

  function stopTimer() {
    if (timerId !== null) {
      clearInterval(timerId);
      timerId = null;
    }
    lastTick = null;
  }

  function updateFromElapsed(elapsedMs) {
    let remaining = Math.max(0, elapsedMs);
    let stageIndex = 0;

    while (
      stageIndex < SIMULATION_STAGES.length - 1 &&
      remaining >= SIMULATION_STAGES[stageIndex].durationMs
    ) {
      remaining -= SIMULATION_STAGES[stageIndex].durationMs;
      stageIndex += 1;
    }

    const stage = SIMULATION_STAGES[stageIndex];
    const stageProgress = Math.min(100, (remaining / stage.durationMs) * 100);
    const totalProgress = Math.min(100, (elapsedMs / totalDuration) * 100);

    state = {
      ...state,
      stageIndex,
      stageProgress,
      totalProgress,
      elapsedMs: Math.min(elapsedMs, totalDuration),
    };
  }

  function finish() {
    stopTimer();
    state = {
      ...state,
      status: "completed",
      completed: true,
      totalProgress: 100,
      stageProgress: 100,
      elapsedMs: totalDuration,
    };
    publish();
    onComplete(copyState(state));
  }

  function tick() {
    const now = Date.now();
    if (lastTick === null) lastTick = now;
    const delta = Math.max(0, now - lastTick);
    lastTick = now;

    const nextElapsed = state.elapsedMs + delta;
    if (nextElapsed >= totalDuration) {
      finish();
      return;
    }

    updateFromElapsed(nextElapsed);
    state.status = "running";
    publish();
  }

  function pause() {
    if (state.status !== "running") return;
    stopTimer();
    state.status = "paused";
    publish();
  }

  function resume() {
    if (state.status !== "paused" && state.status !== "idle") return;
    state.status = "running";
    lastTick = Date.now();
    if (timerId === null) timerId = setInterval(tick, tickMs);
    publish();
  }

  function restart() {
    stopTimer();
    state = copyState(INITIAL_SIMULATION_STATE);
    publish();
    resume();
  }

  function stop() {
    stopTimer();
    state = { ...state, status: "idle" };
    publish();
  }

  function getState() {
    return copyState(state);
  }

  publish();

  return { pause, resume, restart, stop, getState };
}
