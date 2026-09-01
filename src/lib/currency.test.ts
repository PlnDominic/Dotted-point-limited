import { describe, expect, it } from "vitest";
import { formatGHS } from "./currency";

describe("formatGHS", () => {
  it("formats a whole number with two decimal places and the Cedi sign", () => {
    expect(formatGHS(145)).toBe("GH₵145.00");
  });

  it("keeps existing decimals to two places", () => {
    expect(formatGHS(9.5)).toBe("GH₵9.50");
  });

  it("adds thousands separators", () => {
    expect(formatGHS(12345.6)).toBe("GH₵12,345.60");
  });

  it("treats 0 and falsy input as zero, never NaN", () => {
    expect(formatGHS(0)).toBe("GH₵0.00");
    // @ts-expect-error - guarding the runtime fallback for bad input
    expect(formatGHS(undefined)).toBe("GH₵0.00");
  });
});
