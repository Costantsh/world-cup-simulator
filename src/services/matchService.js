const getRandomGoals = () => Math.floor(Math.random() * 5);

function applyMatchStats(teamA, teamB, goalsA, goalsB) {
  teamA.goalsFor += goalsA;
  teamA.goalsAgainst += goalsB;
  teamA.goalDifference = teamA.goalsFor - teamA.goalsAgainst;

  teamB.goalsFor += goalsB;
  teamB.goalsAgainst += goalsA;
  teamB.goalDifference = teamB.goalsFor - teamB.goalsAgainst;

  if (goalsA > goalsB) teamA.points += 3;
  else if (goalsB > goalsA) teamB.points += 3;
  else {
    teamA.points += 1;
    teamB.points += 1;
  }
}

export function generateMatchesForGroup(teams) {
  const schedule = [
    [0, 1, 1],
    [2, 3, 1],
    [0, 2, 2],
    [1, 3, 2],
    [0, 3, 3],
    [1, 2, 3],
  ];

  const matches = [];

  schedule.forEach(([teamAIndex, teamBIndex, round]) => {
    const teamA = teams[teamAIndex];
    const teamB = teams[teamBIndex];

    const goalsA = getRandomGoals();
    const goalsB = getRandomGoals();

    applyMatchStats(teamA, teamB, goalsA, goalsB);

    matches.push({
      round,
      teamA: { token: teamA.token, name: teamA.name },
      teamB: { token: teamB.token, name: teamB.name },
      goalsA,
      goalsB,
    });
  });

  return matches;
}

export function simulateGroupStage(groups) {
  const next = JSON.parse(JSON.stringify(groups));

  Object.keys(next).forEach((groupName) => {
    next[groupName].matches = generateMatchesForGroup(next[groupName].teams);
  });

  return next;
}