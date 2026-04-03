import type { PipelineRun, PipelineEvent } from "./types";

// In-memory store for pipeline runs
const runs = new Map<string, PipelineRun>();

// SSE listeners per run
const listeners = new Map<string, Set<(event: PipelineEvent) => void>>();

export function createRun(id: string, arxivUrl: string): PipelineRun {
  const run: PipelineRun = {
    id,
    status: "running",
    arxivUrl,
    stage: "fetching",
    events: [],
    createdAt: new Date(),
  };
  runs.set(id, run);

  // Clean up after 1 hour
  setTimeout(() => {
    runs.delete(id);
    listeners.delete(id);
  }, 60 * 60 * 1000);

  return run;
}

export function getRun(id: string): PipelineRun | undefined {
  return runs.get(id);
}

export function updateRun(
  id: string,
  updates: Partial<PipelineRun>
): PipelineRun | undefined {
  const run = runs.get(id);
  if (!run) return undefined;
  Object.assign(run, updates);
  return run;
}

export function emitEvent(runId: string, event: PipelineEvent) {
  const run = runs.get(runId);
  if (run) {
    run.events.push(event);
    run.stage = event.stage;
  }
  const runListeners = listeners.get(runId);
  if (runListeners) {
    for (const listener of runListeners) {
      listener(event);
    }
  }
}

export function addListener(
  runId: string,
  listener: (event: PipelineEvent) => void
) {
  if (!listeners.has(runId)) {
    listeners.set(runId, new Set());
  }
  listeners.get(runId)!.add(listener);
}

export function removeListener(
  runId: string,
  listener: (event: PipelineEvent) => void
) {
  listeners.get(runId)?.delete(listener);
}
