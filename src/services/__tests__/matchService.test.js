import { describe, expect, it } from "vitest";
import { generateMatchesForGroup } from "../matchService.js";

describe("matchService", () => {
  it("generateMatchesForGroup generates 6 matches and updates stats", () => {
    const teams = [
      { token: "T1", name: "T1", points: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0 },
      { token: "T2", name: "T2", points: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0 },
      { token: "T3", name: "T3", points: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0 },
      { token: "T4", name: "T4", points: 0, goalsFor: 0, goalsAgainst: 0, goalDifference: 0 },
    ];

    const matches = generateMatchesForGroup(teams);

    expect(matches).toHaveLength(6);
    expect(matches.map((m) => m.round)).toEqual([1, 1, 2, 2, 3, 3]);

    teams.forEach((t) => {
      expect(t.goalsFor).toBeGreaterThanOrEqual(0);
      expect(t.goalsAgainst).toBeGreaterThanOrEqual(0);
      expect(t.goalDifference).toBe(t.goalsFor - t.goalsAgainst);
    });
  });
});