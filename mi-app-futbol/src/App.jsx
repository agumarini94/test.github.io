import React, { useState, useEffect, useRef } from 'react';
import Scoreboard from './Scoreboard';
import { getSaved } from './helpers';
import { useLanguage } from './useLanguage';
import './App.css';

const App = () => {
  const { t, lang, changeLanguage } = useLanguage();

  const [step, setStep] = useState(() => getSaved('step', 0));
  const [teams, setTeams] = useState(() => getSaved('teams', []));
  const [history, setHistory] = useState(() => getSaved('history', []));
  const [config, setConfig] = useState(() => getSaved('config', { minutes: 8, teamCount: 3, gameType: 5 }));
  const [jugadoresManual, setJugadoresManual] = useState(() => getSaved('jugadores', []));
  const [timeLeft, setTimeLeft] = useState(() => getSaved('timeLeft', 8 * 60000));
  const [timerActive, setTimerActive] = useState(false);
  const [playingTeams, setPlayingTeams] = useState([0, 1]);
  const [victoryEffect, setVictoryEffect] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const data = { step, teams, history, jugadores: jugadoresManual, config, timeLeft };
    Object.entries(data).forEach(([k, v]) => localStorage.setItem(k, JSON.stringify(v)));
  }, [step, teams, history, jugadoresManual, config, timeLeft]);

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 10) {
            clearInterval(timerRef.current);
            setTimerActive(false);
            autoFinish();
            return 0;
          }
          return prev - 10;
        });
      }, 10);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerActive]);

  const handleStat = (tIdx, pId, type, amount) => {
    if (timeLeft === config.minutes * 60000) return;
    setTeams(prev => {
      const nt = JSON.parse(JSON.stringify(prev));
      const player = nt[tIdx].players.find(p => p.id === pId);
      if (player && player[type + 'Match'] + amount >= 0) player[type + 'Match'] += amount;
      return nt;
    });
  };

  const finishMatch = (winnerIdx) => {
    const [idx1, idx2] = playingTeams;
    const g1 = teams[idx1].players.reduce((s, p) => s + p.goalsMatch, 0);
    const g2 = teams[idx2].players.reduce((s, p) => s + p.goalsMatch, 0);
    const matchWinner = winnerIdx === null ? 'draw' : teams[winnerIdx].name;

    setHistory([{ id: Date.now(), team1: teams[idx1].name, team2: teams[idx2].name, score1: g1, score2: g2, winner: matchWinner }, ...history]);
    setTeams(prev => prev.map(team => ({
      ...team,
      players: team.players.map(p => ({ ...p, goals: p.goals + p.goalsMatch, kicks: p.kicks + p.kicksMatch, goalsMatch: 0, kicksMatch: 0 }))
    })));
    setTimerActive(false);
    setTimeLeft(config.minutes * 60000);
    setVictoryEffect(true);
    setTimeout(() => setVictoryEffect(false), 600);
  };

  const autoFinish = () => {
    const g1 = teams[playingTeams[0]].players.reduce((s, p) => s + p.goalsMatch, 0);
    const g2 = teams[playingTeams[1]].players.reduce((s, p) => s + p.goalsMatch, 0);
    finishMatch(g1 > g2 ? playingTeams[0] : (g2 > g1 ? playingTeams[1] : null));
  };

  const resetAllStats = () => {
    if (window.confirm(t.resetTable)) {
      setHistory([]);
      setTeams(prev => prev.map(team => ({
        ...team,
        players: team.players.map(p => ({ ...p, goals: 0, kicks: 0, goalsMatch: 0, kicksMatch: 0 }))
      })));
    }
  };

  const getTableData = () => {
    return teams.map(team => {
      let stats = { pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, pts: 0 };
      history.forEach(m => {
        if (m.team1 === team.name || m.team2 === team.name) {
          stats.pj++;
          const isT1 = m.team1 === team.name;
          const [myG, opG] = isT1 ? [m.score1, m.score2] : [m.score2, m.score1];
          stats.gf += myG; stats.gc += opG;
          if (m.winner === 'draw') { stats.pe++; stats.pts += 1; }
          else if (m.winner === team.name) { stats.pg++; stats.pts += 3; }
          else stats.pp++;
        }
      });
      return { name: team.name, ...stats, dg: stats.gf - stats.gc };
    }).sort((a, b) => b.pts - a.pts || b.dg - a.dg);
  };

  const formatTimeFull = (ms) => {
    const m = Math.floor(ms / 60000), s = Math.floor((ms % 60000) / 1000), c = Math.floor((ms % 1000) / 10);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}:${String(c).padStart(2, '0')}`;
  };

  const allPlayers = teams.flatMap(t => t.players.map(p => ({ ...p, teamName: t.name })));
  const getTop = (attr) => [...allPlayers].sort((a, b) => b[attr] - a[attr]).slice(0, 5);

  if (step === 0) return (
    <div className="app-container">
      <div className="lang-selector-top">
        <button className={lang === 'es' ? 'active' : ''} onClick={() => changeLanguage('es')}>ESPAÑOL</button>
        <button className={lang === 'en' ? 'active' : ''} onClick={() => changeLanguage('en')}>ENGLISH</button>
      </div>
      <h1 className="title-main">{t.titleConfig}</h1>
      <div className="card-glass">
        <label>{t.matchTime}</label>
        <input type="number" className="input-modern" value={config.minutes} onChange={e => setConfig({ ...config, minutes: parseInt(e.target.value) || 1 })} />
        <label>{t.howManyTeams}</label>
        <input type="number" className="input-modern" value={config.teamCount} onChange={e => setConfig({ ...config, teamCount: Math.min(20, Math.max(2, parseInt(e.target.value) || 2)) })} />
        <div className="game-type-selector">
          {[5, 7, 11].map(num => (
            <button key={num} className={config.gameType === num ? 'active' : ''} onClick={() => setConfig({ ...config, gameType: num })}>F{num}</button>
          ))}
        </div>
        <button className="btn-primary" onClick={() => {
          setJugadoresManual(Array.from({ length: config.teamCount * config.gameType }, (_, i) => ({
            id: i, name: '', teamName: `EQUIPO ${Math.floor(i / config.gameType) + 1}`
          })));
          setStep(1);
        }}>{t.start}</button>
      </div>
    </div>
  );

  if (step === 1) return (
    <div className="app-container">
      <h1 className="title-main">{t.regTitle}</h1>
      <div className="registration-grid">
        {Array.from({ length: config.teamCount }).map((_, gIdx) => (
          <div key={gIdx} className="card-team-reg">
            <input className="team-title-input" maxLength={10} value={jugadoresManual[gIdx * config.gameType]?.teamName} onChange={e => {
              const n = [...jugadoresManual];
              for (let i = 0; i < config.gameType; i++) n[(gIdx * config.gameType) + i].teamName = e.target.value;
              setJugadoresManual(n);
            }} />
            <div className="players-input-list">
              {jugadoresManual.slice(gIdx * config.gameType, (gIdx * config.gameType) + config.gameType).map((j) => (
                <input key={j.id} className="input-player-name" placeholder="Nombre" value={j.name} onChange={e => {
                  const n = [...jugadoresManual]; n[j.id].name = e.target.value; setJugadoresManual(n);
                }} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <button className="btn-primary" style={{ marginTop: '20px' }} onClick={() => {
        const organized = Array.from({ length: config.teamCount }, (_, i) => ({
          id: i + 1,
          name: (jugadoresManual[i * config.gameType]?.teamName || `E${i + 1}`).toUpperCase(),
          players: jugadoresManual.slice(i * config.gameType, (i * config.gameType) + config.gameType).map(p => ({ ...p, goals: 0, goalsMatch: 0, kicks: 0, kicksMatch: 0 }))
        }));
        setTeams(organized); setStep(3); setTimeLeft(config.minutes * 60000);
      }}>{t.initTorneo}</button>
    </div>
  );

  return (
    <div className={`app-container ${victoryEffect ? 'flash-update' : ''}`}>
      <div className="lang-selector-top" style={{ marginBottom: '10px' }}>
        <button className={lang === 'es' ? 'active' : ''} onClick={() => changeLanguage('es')}>ESPAÑOL</button>
        <button className={lang === 'en' ? 'active' : ''} onClick={() => changeLanguage('en')}>ENGLISH</button>
      </div>

      <Scoreboard
        teams={teams} playingTeams={playingTeams} setPlayingTeams={setPlayingTeams} timeLeft={timeLeft}
        timerActive={timerActive} setTimerActive={setTimerActive}
        setTimeLeft={setTimeLeft} config={config} formatTimeFull={formatTimeFull}
        handleStat={handleStat} finishMatch={finishMatch} t={t}
      />

      <div className="game-footer">
        <div className="stat-card overflow-x">
          <h4>{t.statsPos}</h4>
          <table className="pro-table">
            <thead><tr>{(t.tableCols || []).map((c, idx) => <th key={idx}>{c}</th>)}</tr></thead>
            <tbody>
              {getTableData().map((row, i) => (
                <tr key={i}>
                  <td className="txt-left"><b>{row.name}</b></td>
                  <td>{row.pj}</td><td>{row.pg}</td><td>{row.pe}</td><td>{row.pp}</td><td>{row.gf}</td><td>{row.gc}</td><td>{row.dg}</td><td className="txt-gold">{row.pts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="stats-container-grid">
          <div className="stat-card">
            <h4>{t.statsGoals}</h4>
            <div className="stat-list">
              {getTop('goals').map((p, i) => <p key={i}><span>{p.name} ({p.teamName})</span> <b>{p.goals}</b></p>)}
            </div>
          </div>
          <div className="stat-card">
            <h4>{t.statsKicks}</h4>
            <div className="stat-list">
              {getTop('kicks').map((p, i) => <p key={i}><span>{p.name} ({p.teamName})</span> <b>{p.kicks}</b></p>)}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <h4>{t.history}</h4>
          <div className="history-list">
            {history.map(m => (
              <div key={m.id} className="history-item">
                <span className="h-team">{m.team1}</span>
                <span className="h-score">{m.score1} - {m.score2}</span>
                <span className="h-team">{m.team2}</span>
              </div>
            ))}
          </div>
        </div>

        <button className="btn-warning" style={{ margin: '10px 0' }} onClick={resetAllStats}>{t.resetTable}</button>
        <button className="btn-danger-text" onClick={() => confirm(t.resetAll) && (localStorage.clear() || window.location.reload())}>{t.resetAll}</button>
      </div>
    </div>
  );
};

export default App;