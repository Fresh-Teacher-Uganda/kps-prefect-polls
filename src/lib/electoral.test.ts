import { describe, expect, it } from "vitest";
import { positionsForClass } from "./electoral";

describe("position eligibility", () => {
  it("only P5 and P6 can run for Head Prefect", () => {
    expect(positionsForClass("P6").some((p) => p.value === "head_prefect")).toBe(true);
    expect(positionsForClass("P4").some((p) => p.value === "head_prefect")).toBe(false);
  });
  it("P7 and P1 have no prefect posts", () => {
    expect(positionsForClass("P7")).toHaveLength(0);
    expect(positionsForClass("P1")).toHaveLength(0);
  });
});
