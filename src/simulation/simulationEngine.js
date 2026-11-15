import { INITIAL_SIMULATION_STATE, SIMULATION_STAGES } from "./simulationStages.js";
import { pickRandomSpaceEvent } from "./SpaceEvents.js";

function clone(value) {
  return { ...value };
}

/**
 * Runs a simplified educational mission timeline.
 * This is not a physical orbit propagator.
 */
export function startSimulation({
  onUpdate = () => {},
  onComplete = () => {},
  onStageChange = () => {},
  onEvent = () => {},
  tickMs = 100,
  eventProbability = 0.12,
  random = Math.random,
} = {}) {
  let state = clone(INITIAL_SIMULATION_STATE);
  let timerId = null;
  let lastTick = null;
  let lastStageIndex = -1;
  let stopped = false;

  const totalDuration = SIMULATION_STAGES.reduce((sum, stage) => sum + stage.durationMs, 0);

  function publish() {
    onUpdate(clone(state));
  }

  function stopTimer() {
    if (timerId !== null) clearInterval(timerId);
    timerId = null;
    lastTick = null;
  }

  function calculateProgress(elapsedMs) {
    let remaining = elapsedMs;
    let stageIndex = 0;

    while (stageIndex < SIMULATION_STAGES.length - 1 &&
      remaining >= SIMULATION_STAGES[stageIndex].durationMs) {
      remaining -= SIMULATION_STAGES[stageIndex].durationMs;
      stageIndex += 1;
    }

    const stage = SIMULATION_STAGES[stageIndex];
    return {
      stageIndex,
      stageProgress: Math.min(100, (remaining / stage.durationMs) * 100),
      totalProgress: Math.min(100, (elapsedMs / totalDuration) * 100),
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
    onComplete(clone(state));
  }

  function tick() {
    if (stopped || state.status !== "running") return;
    const now = Date.now();
    if (lastTick === null) lastTick = now;
    const delta = Math.max(0, now - lastTick);
    lastTick = now;

    const elapsedMs = state.elapsedMs + delta;
    if (elapsedMs >= totalDuration) {
      finish();
      return;
    }

    const progress = calculateProgress(elapsedMs);
    state = { ...state, ...progress, elapsedMs, status: "running" };

    if (progress.stageIndex !== lastStageIndex) {
      lastStageIndex = progress.stageIndex;
      onStageChange(SIMULATION_STAGES[lastStageIndex]);
      if (lastStageIndex > 0 && random() < eventProbability) {
        onEvent(pickRandomSpaceEvent(random));
      }
    }

    publish();
  }

  function pause() {
    if (state.status !== "running") return;
    stopTimer();
    state.status = "paused";
    publish();
  }

  function resume() {
    if (stopped || (state.status !== "paused" && state.status !== "idle")) return;
    state.status = "running";
    lastTick = Date.now();
    if (timerId === null) timerId = setInterval(tick, tickMs);
    publish();
  }

  function restart() {
    stopTimer();
    stopped = false;
    lastStageIndex = -1;
    state = clone(INITIAL_SIMULATION_STATE);
    publish();
    resume();
  }

  function stop() {
    stopTimer();
    stopped = true;
    state = { ...state, status: "idle" };
    publish();
  }

  function getState() {
    return clone(state);
  }

  publish();
  return { pause, resume, restart, stop, getState };
}
