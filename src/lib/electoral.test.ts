import { describe, expect, it } from "vitest";
import { PUPILS, POSITIONS, positionsForClass, pupilEmails } from "./electoral";

describe("positions", () => {
  it("only the 5 coordinator posts exist, open to P.5", () => {
    expect(POSITIONS.map((p) => p.label)).toEqual([
      "Mathematics Coordinator", "Science Coordinator", "English Coordinator",
      "Social Studies Coordinator", "Religious Education Coordinator",
    ]);
    expect(positionsForClass("P.5")).toHaveLength(5);
  });
  it("lists 51 pupils", () => expect(PUPILS).toHaveLength(51));
});

describe("pupil emails", () => {
  it("uses first name @kpm.com", () => {
    expect(pupilEmails()[0].email).toBe("wasswa@kpm.com");
  });
  it("numbers repeated first names", () => {
    const e = pupilEmails().map((p) => p.email);
    expect(e).toContain("lukwago@kpm.com");
    expect(e).toContain("lukwago2@kpm.com");
    expect(new Set(e).size).toBe(51);
  });
});
