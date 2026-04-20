export function shuffleArray(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function createGroups(teams) {
  const shuffledTeams = shuffleArray(teams);
  const groupNames = ["A", "B", "C", "D", "E", "F", "G", "H"];

  const groups = {};
  groupNames.forEach((groupName, groupIndex) => {
    const groupTeams = shuffledTeams.slice(groupIndex * 4, groupIndex * 4 + 4).map((team) => ({
      ...team,
      group: groupName,
      points: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
    }));

    groups[groupName] = { name: groupName, teams: groupTeams, matches: [] };
  });

  return groups;
}

/**
 * Tie-break order:
 * 1) points, 2) goal difference, 3) random draw
 */
export function sortGroupTeams(teams) {
  return [...teams].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    return Math.random() - 0.5;
  });
}

export function getQualifiedFromGroups(groups) {
  const qualified = {};

  Object.keys(groups).forEach((groupName) => {
    const ordered = sortGroupTeams(groups[groupName].teams);
    qualified[`${groupName}1`] = ordered[0];
    qualified[`${groupName}2`] = ordered[1];
  });

  return qualified;
}