const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomGoals = () => getRandomInt(0, 4);

export function simulateKnockoutMatch(teamA, teamB) {
  const goalsA = getRandomGoals();
  const goalsB = getRandomGoals();

  let penA = 0;
  let penB = 0;

  if (goalsA === goalsB) {
    while (penA === penB) {
      penA = getRandomInt(1, 5);
      penB = getRandomInt(1, 5);
    }
  }

  const winner = goalsA > goalsB || penA > penB ? teamA : teamB;

  return { teamA, teamB, goalsA, goalsB, penA, penB, winner };
}

/**
 * Round of 16 bracket:
 * 1A×2B, 1C×2D, 1E×2F, 1G×2H, 1B×2A, 1D×2C, 1F×2E, 1H×2G
 */
export function createRoundOf16(qualified) {
  return [
    simulateKnockoutMatch(qualified.A1, qualified.B2),
    simulateKnockoutMatch(qualified.C1, qualified.D2),
    simulateKnockoutMatch(qualified.E1, qualified.F2),
    simulateKnockoutMatch(qualified.G1, qualified.H2),
    simulateKnockoutMatch(qualified.B1, qualified.A2),
    simulateKnockoutMatch(qualified.D1, qualified.C2),
    simulateKnockoutMatch(qualified.F1, qualified.E2),
    simulateKnockoutMatch(qualified.H1, qualified.G2),
  ];
}

export function simulateNextPhase(matches) {
  const next = [];
  for (let i = 0; i < matches.length; i += 2) {
    next.push(simulateKnockoutMatch(matches[i].winner, matches[i + 1].winner));
  }
  return next;
}