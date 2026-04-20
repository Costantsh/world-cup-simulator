import { describe, expect, it } from "vitest";
import { simulateKnockoutMatch } from "../knockoutService.js";

describe("knockoutService", () => {
  it("simulateKnockoutMatch always produces a winner", () => {
    const teamA = { token: "A", name: "A" };
    const teamB = { token: "B", name: "B" };

    for (let i = 0; i < 200; i++) {
      const match = simulateKnockoutMatch(teamA, teamB);
      expect(match.winner).toBeTruthy();
      expect([teamA.token, teamB.token]).toContain(match.winner.token);

      const isDraw = match.goalsA === match.goalsB;
      if (isDraw) {
        expect(match.penA).not.toBe(match.penB);
      }
    }
  });
});