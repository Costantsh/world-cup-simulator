import { useMemo, useState } from "react";
import "./App.css";

import { fetchTeams, postFinalResult } from "./api/api.js";
import { createGroups, getQualifiedFromGroups, sortGroupTeams } from "./services/groupService.js";
import { simulateGroupStage } from "./services/matchService.js";
import { createRoundOf16, simulateNextPhase } from "./services/knockoutService.js";

const PHASES = ["GROUPS", "ROUND16", "QUARTERS", "SEMIS", "FINAL"];
const KNOCKOUT_PHASES = ["ROUND16", "QUARTERS", "SEMIS", "FINAL"];

function getPhaseLabel(phase) {
  switch (phase) {
    case "GROUPS":
      return "Fase de Grupos";
    case "ROUND16":
      return "Oitavas de Final";
    case "QUARTERS":
      return "Quartas de Final";
    case "SEMIS":
      return "Semifinais";
    case "FINAL":
      return "Final";
    default:
      return phase;
  }
}

function getKnockoutCrumbs(activePhase) {
  const labels = {
    ROUND16: "Oitavas",
    QUARTERS: "Quartas",
    SEMIS: "Semis",
    FINAL: "Final",
  };

  const activeIndex = KNOCKOUT_PHASES.indexOf(activePhase);

  return KNOCKOUT_PHASES.map((key, index) => ({
    key,
    label: labels[key],
    state: index < activeIndex ? "done" : index === activeIndex ? "active" : "upcoming",
  }));
}

function KnockoutBreadcrumb({ activePhase }) {
  const crumbs = getKnockoutCrumbs(activePhase);

  return (
    <nav className="crumbs" aria-label="Fases do mata-mata">
      {crumbs.map((crumb, index) => (
        <span className={`crumb ${crumb.state}`} key={crumb.key}>
          <span className="crumbDot" aria-hidden="true" />
          <span className="crumbLabel">{crumb.label}</span>
          {index < crumbs.length - 1 && (
            <span className="crumbSep" aria-hidden="true">
              &gt;
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [phase, setPhase] = useState("GROUPS");
  const [isSummaryVisible, setIsSummaryVisible] = useState(false);
  const [tournament, setTournament] = useState(null);

  const groupStats = useMemo(() => {
    if (!tournament?.groups) return null;

    const teamsCount = Object.values(tournament.groups).reduce(
      (acc, group) => acc + group.teams.length,
      0
    );

    const matchesCount = Object.values(tournament.groups).reduce(
      (acc, group) => acc + group.matches.length,
      0
    );

    return { teamsCount, matchesCount };
  }, [tournament]);

  const phaseSubtitle = useMemo(() => {
    if (!tournament) return "Nenhuma simulação gerada";
    if (tournament?.error) return "Erro na simulação";

    if (phase === "GROUPS") return "Grupos e resultados gerados";
    if (phase === "ROUND16") return "Oitavas definidas";
    if (phase === "QUARTERS") return "Quartas definidas";
    if (phase === "SEMIS") return "Semifinais definidas";
    if (phase === "FINAL") return `Campeão: ${tournament.champion?.name ?? "-"}`;

    return "Simulação pronta";
  }, [tournament, phase]);

  const canGoNext = useMemo(() => {
    const index = PHASES.indexOf(phase);
    return Boolean(tournament) && index >= 0 && index < PHASES.length - 1;
  }, [phase, tournament]);

  const goToNextPhase = () => {
    const index = PHASES.indexOf(phase);
    if (index < 0 || index >= PHASES.length - 1) return;
    setPhase(PHASES[index + 1]);
  };

  const goToPreviousPhase = () => {
    const index = PHASES.indexOf(phase);
    if (index <= 0) return;
    setPhase(PHASES[index - 1]);
  };

  const reset = () => {
    setTournament(null);
    setPhase("GROUPS");
    setIsSummaryVisible(false);
  };

  const simulateTournament = async () => {
    setIsLoading(true);
    setIsSummaryVisible(false);
    setPhase("GROUPS");

    try {
      setTournament(null);

      const teams = await fetchTeams();
      if (!teams || teams.length !== 32) {
        throw new Error(`Esperado 32 seleções, recebi ${teams?.length ?? 0}.`);
      }

      const groups = createGroups(teams);
      const simulatedGroups = simulateGroupStage(groups);

      const sortedGroups = { ...simulatedGroups };
      Object.keys(sortedGroups).forEach((groupKey) => {
        sortedGroups[groupKey] = {
          ...sortedGroups[groupKey],
          teams: sortGroupTeams(sortedGroups[groupKey].teams),
        };
      });

      const qualifiedTeams = getQualifiedFromGroups(sortedGroups);
      const round16 = createRoundOf16(qualifiedTeams);
      const quarters = simulateNextPhase(round16);
      const semis = simulateNextPhase(quarters);
      const finalMatch = simulateNextPhase(semis)[0];

      const finalPayload = {
        equipeA: finalMatch.teamA.token,
        equipeB: finalMatch.teamB.token,
        golsEquipeA: finalMatch.goalsA,
        golsEquipeB: finalMatch.goalsB,
        golsPenaltyTimeA: finalMatch.penA,
        golsPenaltyTimeB: finalMatch.penB,
      };

      const apiResponse = await postFinalResult(finalPayload);

      setTournament({
        groups: sortedGroups,
        round16,
        quarters,
        semis,
        final: finalMatch,
        champion: finalMatch.winner,
        payload: finalPayload,
        apiResponse,
      });
    } catch (error) {
      setTournament({ error: error?.message || "Erro inesperado" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="shell">
        <div className="topbar">
          <div className="brand">
            <h1 className="h1">Simulador da Copa</h1>
            <p className="sub">Usuário git-user: Costantsh</p>
          </div>
        </div>

        <div className="panel">
          <div className="toolbar">
            <div className="toolbarLeft">
              <div className="badgePhase">
                <div className="phaseDot" />
                <div className="phaseText">
                  <strong>{getPhaseLabel(phase)}</strong>
                  <span>{phaseSubtitle}</span>
                </div>
              </div>
            </div>

            <div className="toolbarRight">
              <button className="btn btnGhost" onClick={reset} disabled={isLoading}>
                Início
              </button>

              <button className="btn btnPrimary" onClick={simulateTournament} disabled={isLoading}>
                {isLoading ? "Simulando..." : tournament ? "Refazer simulação" : "Simular Copa Inteira"}
              </button>

              <button
                className="btn btnGhost"
                onClick={goToPreviousPhase}
                disabled={!tournament || phase === "GROUPS" || isLoading}
              >
                Fase anterior
              </button>

              <button className="btn btnNext" onClick={goToNextPhase} disabled={!canGoNext || isLoading}>
                Próxima fase
              </button>

              <button
                className="btn btnGhost"
                onClick={() => setIsSummaryVisible((value) => !value)}
                disabled={!tournament?.groups || isLoading}
              >
                {isSummaryVisible ? "Ocultar resumo" : "Ver resumo"}
              </button>
            </div>
          </div>

          <div className="content">
            {tournament?.error && <div className="error">❌ {tournament.error}</div>}

            {!tournament && (
              <div className="notice">
                Clique em <strong>Simular Copa Inteira</strong> para gerar uma simulação e navegar pelas fases.
              </div>
            )}

            {tournament?.groups && groupStats && (
              <div className="sectionTitle">
                <h2>Visão da fase atual</h2>
                <span className="pill">
                  {groupStats.teamsCount} times • {groupStats.matchesCount} jogos na fase de grupos
                </span>
              </div>
            )}

            {tournament?.groups && phase === "GROUPS" && <GroupsView groups={tournament.groups} />}

            {tournament?.round16 && KNOCKOUT_PHASES.includes(phase) && (
              <>
                <div className="sectionTitle">
                  <div className="sectionTitleBlock">
                    <h2>Mata-mata (Bracket)</h2>
                    <KnockoutBreadcrumb activePhase={phase} />
                  </div>
                  <span className="pill">{getPhaseLabel(phase)}</span>
                </div>

                <BracketView
                  round16={tournament.round16}
                  quarters={tournament.quarters}
                  semis={tournament.semis}
                  final={tournament.final}
                  activePhase={phase}
                  visiblePhase={phase}
                />

                {phase === "FINAL" && (
                  <FinalView champion={tournament.champion} finalMatch={tournament.final} apiResponse={tournament.apiResponse} />
                )}
              </>
            )}

            {tournament?.groups && isSummaryVisible && (
              <div className="summary">
                <div className="summaryToggle" onClick={() => setIsSummaryVisible(false)}>
                  <div>
                    <strong>Resumo completo</strong>
                    <div>
                      <span>Grupos, partidas e mata-mata em uma única visão.</span>
                    </div>
                  </div>
                  <span>▲</span>
                </div>

                <div className="hrSoft" />

                <h2 style={{ margin: "0 0 10px" }}>Fase de Grupos</h2>
                <GroupsView groups={tournament.groups} />

                <div className="hrSoft" />

                <h2 style={{ margin: "0 0 10px" }}>Mata-mata (Bracket)</h2>
                <BracketView
                  round16={tournament.round16}
                  quarters={tournament.quarters}
                  semis={tournament.semis}
                  final={tournament.final}
                  activePhase="FINAL"
                  visiblePhase="ALL"
                />

                <div className="hrSoft" />

                <h2 style={{ margin: "0 0 10px" }}>Payload enviado (Final)</h2>
                <pre className="pre">{JSON.stringify(tournament.payload, null, 2)}</pre>

                <h2 style={{ margin: "12px 0 10px" }}>Resposta da API</h2>
                <pre className="pre">
                  {typeof tournament.apiResponse === "string"
                    ? tournament.apiResponse
                    : JSON.stringify(tournament.apiResponse, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function GroupsView({ groups }) {
  return (
    <div className="gridGroups">
      {Object.keys(groups).map((groupKey) => (
        <div className="card" key={groupKey}>
          <div className="cardHead">
            <div className="gName">GRUPO {groupKey}</div>
            <div className="gHint">4 seleções • 6 jogos</div>
          </div>

          <ul className="list">
            {groups[groupKey].teams.map((team, index) => {
              const isQualified = index <= 1;
              const isLast = index === groups[groupKey].teams.length - 1;

              const rowClass = [
                "teamRow",
                isQualified ? "teamRow--qualified" : "",
                isLast ? "teamRow--last" : "",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <li className={rowClass} key={team.token}>
                  <div className="teamMain">
                    <div className="name">{team.name}</div>
                    <div className="meta">
                      Pts <strong>{team.points}</strong> • SG <strong>{team.goalDifference}</strong> • GF {team.goalsFor} • GA{" "}
                      {team.goalsAgainst}
                    </div>
                  </div>
                  <div className="rank">{index + 1}º</div>
                </li>
              );
            })}
          </ul>

          <div className="matches">
            <p className="matchesTitle">Partidas</p>
            {groups[groupKey].matches.map((match, index) => {
              const teamAClass =
                match.goalsA > match.goalsB ? "win" : match.goalsA < match.goalsB ? "lose" : "";

              const teamBClass =
                match.goalsB > match.goalsA ? "win" : match.goalsB < match.goalsA ? "lose" : "";

              return (
                <div className="matchRow" key={index}>
                  <div className="left">
                    <div className="r">R{match.round}</div>
                    <div className="teams">
                      <span className={teamAClass}>{match.teamA.name}</span> vs{" "}
                      <span className={teamBClass}>{match.teamB.name}</span>
                    </div>
                  </div>
                  <div className="score">
                    {match.goalsA} : {match.goalsB}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function BracketView({ round16, quarters, semis, final, activePhase, visiblePhase }) {
  const columns = [
    { key: "r16", phaseKey: "ROUND16", title: "Oitavas", matches: round16 },
    { key: "qf", phaseKey: "QUARTERS", title: "Quartas", matches: quarters },
    { key: "sf", phaseKey: "SEMIS", title: "Semis", matches: semis },
    { key: "fi", phaseKey: "FINAL", title: "Final", matches: [final] },
  ];

  const filteredColumns =
    visiblePhase === "ALL" ? columns : columns.filter((col) => col.phaseKey === visiblePhase);

  const bracketClassName = `bracket ${filteredColumns.length === 1 ? "bracket--single" : ""}`;

  return (
    <div className="bracketWrap">
      <div className={bracketClassName}>
        {filteredColumns.map((column) => {
          const isActive = activePhase === column.phaseKey;
          const columnClass = `bracketCol ${isActive ? "isActive" : "isInactive"}`;

          return (
            <div className={columnClass} key={column.key}>
              <div className="bracketColHeader">
                <strong>{column.title}</strong>
                <span>{column.matches.length} jogo(s)</span>
              </div>

              {column.matches.map((match, index) => {
                const wentToPenalties = match.goalsA === match.goalsB;
                const isTeamAWinner = match.winner?.token === match.teamA?.token;
                const isTeamBWinner = match.winner?.token === match.teamB?.token;

                return (
                  <div className="bracketMatch" key={index}>
                    <div className="bracketTeams">
                      <div className={`teamLine ${isTeamAWinner ? "isWinner" : ""}`}>
                        <div className="tName">{match.teamA.name}</div>
                        <div className="tScore">{match.goalsA}</div>
                      </div>

                      <div className={`teamLine ${isTeamBWinner ? "isWinner" : ""}`}>
                        <div className="tName">{match.teamB.name}</div>
                        <div className="tScore">{match.goalsB}</div>
                      </div>
                    </div>

                    <div className="matchMeta">
                      <span>
                        Vencedor: <strong>{match.winner.name}</strong>
                      </span>
                      {wentToPenalties && <span className="penTag">Pênaltis {match.penA}:{match.penB}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FinalView({ champion, finalMatch, apiResponse }) {
  const wentToPenalties = finalMatch.goalsA === finalMatch.goalsB;

  return (
    <div className="finalHero">
      <h2>Grande Final</h2>

      <div className="finalChampion">
        <span className="label">Campeão</span>
        <span className="name">{champion.name}</span>
      </div>

      <div className="notice" style={{ marginTop: 12 }}>
        Resultado:{" "}
        <strong>
          {finalMatch.teamA.name} {finalMatch.goalsA} x {finalMatch.goalsB} {finalMatch.teamB.name}
          {wentToPenalties ? ` (Pênaltis ${finalMatch.penA} x ${finalMatch.penB})` : ""}
        </strong>
      </div>

      <div className="notice">
        Status API (Final):{" "}
        <strong>
          {typeof apiResponse === "string" ? apiResponse : "Resposta recebida (ver resumo para detalhes)"}
        </strong>
      </div>
    </div>
  );
}
