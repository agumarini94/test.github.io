import React, { useState, useEffect, useRef } from 'react';
import Scoreboard from './Scoreboard';
import { texts, getSaved } from './helpers';
import './App.css';

const App = () => {
  const [lang, setLang] = useState(() => getSaved('lang', 'es'));
  const [step, setStep] = useState(() => getSaved('step', 0));
  const [teams, setTeams] = useState(() => getSaved('teams', []));
  const [history, setHistory] = useState(() => getSaved('history', []));
  const [config, setConfig] = useState(() => getSaved('config', { minutes: 8, teamCount: 3, gameType: 5 }));
  const [jugadoresManual, setJugadoresManual] = useState(() => getSaved('jugadores', []));
  const [timeLeft, setTimeLeft] = useState(config.minutes * 60000);
  const [timerActive, setTimerActive] = useState(false);
  const [playingTeams, setPlayingTeams] = useState([0, 1]);
  const [victoryEffect, setVictoryEffect] = useState(false);
  const timerRef = useRef(null);

  const t = texts[lang] || texts['es'];

  useEffect(() => {
    localStorage.setItem('lang', JSON.stringify(lang));
    localStorage.setItem('step', JSON.stringify(step));
    localStorage.setItem('teams', JSON.stringify(teams));
    localStorage.setItem('history', JSON.stringify(history));
    localStorage.setItem('jugadores', JSON.stringify(jugadoresManual));
    localStorage.setItem('config', JSON.stringify(config));
  }, [lang, step, teams, history, jugadoresManual, config]);

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => setTimeLeft(prev => Math.max(0, prev - 10)), 10);
    } else { clearInterval(timerRef.current); }
    return () => clearInterval(timerRef.current);
  }, [timerActive, timeLeft]);

  const formatTimeFull = (ms) => {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    const c = Math.floor((ms % 1000) / 10);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}:${String(c).padStart(2, '0')}`;
  };

  const handleStat = (tIdx, pId, type, amount) => {
    const nt = [...teams];
    const pIdx = nt[tIdx].players.findIndex(p => p.id === pId);
    const newVal = nt[tIdx].players[pIdx][type + 'Match'] + amount;
    if (newVal < 0) return;
    nt[tIdx].players[pIdx][type + 'Match'] = newVal;
    setTeams(nt);
  };

  const finishMatch = (winnerIdx) => {
    const t1 = teams[playingTeams[0]];
    const t2 = teams[playingTeams[1]];
    const g1 = t1.players.reduce((s, p) => s + p.goalsMatch, 0);
    const g2 = t2.players.reduce((s, p) => s + p.goalsMatch, 0);
    const match = { id: Date.now(), team1: t1.name, team2: t2.name, score1: g1, score2: g2, winner: winnerIdx === null ? 'draw' : teams[winnerIdx].name };
    setHistory([match, ...history]);
    const nt = [...teams];
    nt.forEach(team => team.players.forEach(p => {
      p.goals += p.goalsMatch; p.kicks += p.kicksMatch;
      p.goalsMatch = 0; p.kicksMatch = 0;
    }));
    setTeams(nt);
    setTimerActive(false);
    setTimeLeft(config.minutes * 60000);
    setVictoryEffect(true);
    setTimeout(() => setVictoryEffect(false), 600);
  };

  const resetMatchOnly = () => {
    const nt = [...teams];
    nt.forEach(team => team.players.forEach(p => {
      p.goalsMatch = 0; p.kicksMatch = 0;
    }));
    setTeams(nt);
  };

  const getTableData = () => {
    return teams.map(team => {
      let pj = 0, pg = 0, pe = 0, pp = 0, gf = 0, gc = 0, pts = 0;
      history.forEach(m => {
        if (m.team1 === team.name || m.team2 === team.name) {
          pj++;
          const isT1 = m.team1 === team.name;
          const myG = isT1 ? m.score1 : m.score2;
          const opG = isT1 ? m.score2 : m.score1;
          gf += myG; gc += opG;
          if (m.winner === 'draw') { pe++; pts += 1; }
          else if (m.winner === team.name) { pg++; pts += 3; }
          else { pp++; }
        }
      });
      return { name: team.name, pj, pg, pe, pp, gf, gc, dg: gf - gc, pts };
    }).sort((a, b) => b.pts - a.pts || b.dg - a.dg);
  };

  const allPlayers = teams.flatMap(t => t.players.map(p => ({ ...p, teamName: t.name })));
  const topScorers = [...allPlayers].sort((a, b) => b.goals - a.goals).slice(0, 5);
  const topKickers = [...allPlayers].sort((a, b) => b.kicks - a.kicks).slice(0, 5);

  if (step === 0) return (
    <div className="app-container">
      <div className="lang-selector-top">
        {['es', 'en', 'he'].map(l => (
          <button key={l} className={lang === l ? 'active' : ''} onClick={() => setLang(l)}>{l.toUpperCase()}</button>
        ))}
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
            <input className="team-title-input" value={jugadoresManual[gIdx * config.gameType]?.teamName} onChange={e => {
              const n = [...jugadoresManual];
              for (let i = 0; i < config.gameType; i++) n[(gIdx * config.gameType) + i].teamName = e.target.value;
              setJugadoresManual(n);
            }} />
            <div className="players-input-list">
              {jugadoresManual.slice(gIdx * config.gameType, (gIdx * config.gameType) + config.gameType).map((j, i) => (
                <input key={j.id} className="input-player-name" placeholder={`P${i + 1}`} value={j.name} onChange={e => { const n = [...jugadoresManual]; n[j.id].name = e.target.value; setJugadoresManual(n); }} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <button className="btn-primary" style={{ marginTop: '20px' }} onClick={() => {
        const organized = [];
        for (let i = 0; i < config.teamCount; i++) {
          const group = jugadoresManual.slice(i * config.gameType, (i * config.gameType) + config.gameType).map(p => ({ ...p, goals: 0, goalsMatch: 0, kicks: 0, kicksMatch: 0 }));
          organized.push({ id: i + 1, name: (jugadoresManual[i * config.gameType]?.teamName || "T").toUpperCase(), players: group });
        }
        setTeams(organized); setStep(3);
      }}>{t.initTorneo}</button>
    </div>
  );

  return (
    <div className={`app-container ${lang === 'he' ? 'rtl' : ''} ${victoryEffect ? 'flash-update' : ''}`}>
      <Scoreboard
        teams={teams} playingTeams={playingTeams} timeLeft={timeLeft}
        timerActive={timerActive} setTimerActive={setTimerActive}
        setTimeLeft={setTimeLeft} config={config} formatTimeFull={formatTimeFull}
        handleStat={handleStat} finishMatch={finishMatch} t={t}
      />

      <div className="game-footer">
        <div className="selectors-label">Equipos en juego:</div>
        <div className="selectors-row">
          <select value={playingTeams[0]} onChange={e => setPlayingTeams([parseInt(e.target.value), playingTeams[1]])}>
            {teams.map((t, i) => <option key={i} value={i} disabled={i === playingTeams[1]}>{t.name}</option>)}
          </select>
          <div className="vs-label">VS</div>
          <select value={playingTeams[1]} onChange={e => setPlayingTeams([playingTeams[0], parseInt(e.target.value)])}>
            {teams.map((t, i) => <option key={i} value={i} disabled={i === playingTeams[0]}>{t.name}</option>)}
          </select>
        </div>

        <div className="stat-card overflow-x">
          <h4>{t.statsPos}</h4>
          <table className="pro-table">
            <thead><tr>{t.tableCols.map(c => <th key={c}>{c}</th>)}</tr></thead>
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
            <div className="stat-list">{topScorers.map((p, i) => <p key={i}><span>{p.name}</span> <b>{p.goals}</b></p>)}</div>
          </div>
          <div className="stat-card">
            <h4>{t.statsKicks}</h4>
            <div className="stat-list">{topKickers.map((p, i) => <p key={i}><span>{p.name}</span> <b>{p.kicks}</b></p>)}</div>
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

        <button className="btn-warning" onClick={() => { if (confirm(t.resetTable)) { setHistory([]); resetMatchOnly(); } }}>{t.resetTable}</button>
        <button className="btn-danger-text" onClick={() => { if (confirm(t.resetAll)) { localStorage.clear(); window.location.reload(); } }}>{t.resetAll}</button>
      </div>
    </div>
  );
};

export default App;