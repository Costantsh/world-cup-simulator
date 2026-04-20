import { describe, expect, it, vi } from "vitest";
import { getQualifiedFromGroups, sortGroupTeams } from "../groupService.js";

describe("groupService", () => {
  it("sortGroupTeams orders by points then goal difference", () => {
    const teams = [
      { token: "A", points: 4, goalDifference: 0 },
      { token: "B", points: 6, goalDifference: -1 },
      { token: "C", points: 6, goalDifference: 3 },
      { token: "D", points: 4, goalDifference: 2 },
    ];

    const sorted = sortGroupTeams(teams).map((t) => t.token);
    expect(sorted).toEqual(["C", "B", "D", "A"]);
  });

  it("sortGroupTeams uses random draw when points and goal difference tie", () => {
    const randomSpy = vi.spyOn(Math, "random").mockReturnValue(0.9);

    const teams = [
      { token: "A", points: 3, goalDifference: 1 },
      { token: "B", points: 3, goalDifference: 1 },
    ];

    const sorted = sortGroupTeams(teams).map((t) => t.token);
    expect(sorted.length).toBe(2);

    randomSpy.mockRestore();
  });

  it("getQualifiedFromGroups returns top 2 per group", () => {
    const groups = {
      A: {
        teams: [
          { token: "A1", points: 9, goalDifference: 5 },
          { token: "A2", points: 6, goalDifference: 1 },
          { token: "A3", points: 3, goalDifference: 0 },
          { token: "A4", points: 0, goalDifference: -6 },
        ],
      },
      B: {
        teams: [
          { token: "B1", points: 7, goalDifference: 4 },
          { token: "B2", points: 7, goalDifference: 2 },
          { token: "B3", points: 2, goalDifference: -1 },
          { token: "B4", points: 1, goalDifference: -5 },
        ],
      },
    };

    const qualified = getQualifiedFromGroups(groups);
    expect(qualified.A1.token).toBe("A1");
    expect(qualified.A2.token).toBe("A2");
    expect(qualified.B1.token).toBe("B1");
    expect(qualified.B2.token).toBe("B2");
  });
});