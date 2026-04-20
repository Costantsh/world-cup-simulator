const API_BASE_URL = "https://development-internship-api.geopostenergy.com/WorldCup";
const GIT_USER = "Costantsh";

function normalizeTeam(rawTeam) {
  const token = rawTeam.token ?? rawTeam.id ?? rawTeam._id ?? null;
  const name =
    rawTeam.name ??
    rawTeam.teamName ??
    rawTeam.team ??
    rawTeam.country ??
    rawTeam.selection ??
    rawTeam.nome ??
    "Unknown Team";

  return {
    token,
    name,
    points: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
  };
}

export async function fetchTeams() {
  try {
    const response = await fetch(`${API_BASE_URL}/GetAllTeams`, {
      method: "GET",
      headers: {
        "git-user": GIT_USER,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`GET /GetAllTeams failed: ${response.status} ${text}`);
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error("Unexpected API format: expected array.");
    }

    return data.map(normalizeTeam);
  } catch {
    return [];
  }
}

export async function postFinalResult(payload) {
  const response = await fetch(`${API_BASE_URL}/FinalResult`, {
    method: "POST",
    headers: {
      "git-user": GIT_USER,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`POST /FinalResult failed: ${response.status} ${text}`);
  }

  const contentType = response.headers.get("content-type") || "";
  return contentType.includes("application/json") ? response.json() : response.text();
}