import { describe, expect, it } from "vitest";

import {
  DEFAULT_HARD_STOP_MS,
  DEFAULT_SOFT_WARNING_MS,
  DEFAULT_WRAP_LINE,
  deriveTimeboxConfig,
  formatMsAsClock,
} from "./time-limit";

describe("time-limit helpers", () => {
  it("falls back to defaults when no overrides are provided", () => {
    const config = deriveTimeboxConfig();
    expect(config.softWarningMs).toBe(DEFAULT_SOFT_WARNING_MS);
    expect(config.hardStopMs).toBe(DEFAULT_HARD_STOP_MS);
    expect(config.wrapUpLine).toBe(DEFAULT_WRAP_LINE);
  });

  it("applies custom overrides", () => {
    const config = deriveTimeboxConfig({
      softWarningMs: 1000,
      hardStopMs: 2000,
      wrapUpLine: "Custom wrap-up",
    });

    expect(config.softWarningMs).toBe(1000);
    expect(config.hardStopMs).toBe(2000);
    expect(config.wrapUpLine).toBe("Custom wrap-up");
  });

  it("formats milliseconds as mm:ss", () => {
    expect(formatMsAsClock(300000)).toBe("5:00");
    expect(formatMsAsClock(273000)).toBe("4:33");
    expect(formatMsAsClock(0)).toBe("0:00");
  });
});
