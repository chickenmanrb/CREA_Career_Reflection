export const DEFAULT_SOFT_WARNING_MS = 4.5 * 60 * 1000; // 4 minutes 30 seconds
export const DEFAULT_HARD_STOP_MS = 5 * 60 * 1000; // 5 minutes
export const DEFAULT_WRAP_LINE =
  "Sorry we're out of time for this question, go ahead and click to score & advance.";

export type TimeboxConfig = {
  softWarningMs?: number;
  hardStopMs?: number;
  wrapUpLine?: string;
};

export function deriveTimeboxConfig(config?: TimeboxConfig) {
  return {
    softWarningMs: config?.softWarningMs ?? DEFAULT_SOFT_WARNING_MS,
    hardStopMs: config?.hardStopMs ?? DEFAULT_HARD_STOP_MS,
    wrapUpLine: config?.wrapUpLine ?? DEFAULT_WRAP_LINE,
  };
}

export function formatMsAsClock(ms: number) {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
