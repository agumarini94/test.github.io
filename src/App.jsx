import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const App = () => {
  // CARGA DE LOCALSTORAGE
  const getSaved = (key, def) => {
    const s = localStorage.getItem(key);
    return s ? JSON.parse(s) : def;
  };

  const [step, setStep] = useState(() => getSaved('step', 1));
  const [teams, setTeams] = useState(() => getSaved('teams', []));
  const [history, setHistory] = useState(() => getSaved('history', []));
  const [jugadoresManual, setJugadoresManual] = useState(() =>
    getSaved('jugadores', Array.from({ length: 15 }, (_, i) => ({ id: i, name: '', nivel: 5 })))
  );

  const [timeLeft, setTimeLeft] = useState(480000);
  const [timerActive, setTimerActive] = useState(false);
  const [playingTeams, setPlayingTeams] = useState([0, 1]);
  const [animateScore, setAnimateScore] = useState(null);
  const [activeKick, setActiveKick] = useState(null);
  const timerRef = useRef(null);

  // PERSISTENCIA AUTOMÁTICA
  useEffect(() => {
    localStorage.setItem('step', JSON.stringify(step));
    localStorage.setItem('teams', JSON.stringify(teams));
    localStorage.setItem('history', JSON.stringify(history));
    localStorage.setItem('jugadores', JSON.stringify(jugadoresManual));
  }, [step, teams, history, jugadoresManual]);

  // CRONOMETRO
  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => setTimeLeft(prev => Math.max(0, prev - 10)), 10);
    } else { clearInterval(timerRef.current); }
    return () => clearInterval(timerRef.current);
  }, [timerActive, timeLeft]);

  const formatTime = (ms) => {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const configurarEquipos = (t1, t2, t3) => {
    setTeams([
      { id: 1, name: 'EQUIPO 1', players: t1, points: 0 },
      { id: 2, name: 'EQUIPO 2', players: t2, points: 0 },
      { id: 3, name: 'EQUIPO 3', players: t3, points: 0 }
    ]);
    setStep(3);
  };

  const iniciarManual = () => {
    const validos = jugadoresManual.filter(j => j.name.trim());
    if (validos.length < 6) return alert("Mínimo 6 jugadores");
    const m = (arr) => arr.filter(j => j.name).map(j => ({ ...j, goals: 0, goalsMatch: 0, kicks: 0, kicksMatch: 0 }));
    configurarEquipos(m(jugadoresManual.slice(0, 5)), m(jugadoresManual.slice(5, 10)), m(jugadoresManual.slice(10, 15)));
  };

  const generarEquilibrado = () => {
    const validos = jugadoresManual.filter(j => j.name.trim());
    const ordenados = [...validos].sort((a, b) => b.nivel - a.nivel);
    const t = [[], [], []];
    ordenados.forEach((j, i) => t[i % 3].push({ ...j, goals: 0, goalsMatch: 0, kicks: 0, kicksMatch: 0 }));
    configurarEquipos(t[0], t[1], t[2]);
  };

  const handleStat = (tIdx, pId, type) => {
    const nt = [...teams];
    const pIdx = nt[tIdx].players.findIndex(p => p.id === pId);
    nt[tIdx].players[pIdx][type + 'Match'] += 1;
    if (type === 'goals') { setAnimateScore(tIdx); setTimeout(() => setAnimateScore(null), 500); }
    else { setActiveKick(pId); setTimeout(() => setActiveKick(null), 400); }
    setTeams(nt);
  };

  const finishMatch = (winnerIdx) => {
    if (!window.confirm("¿Finalizar partido?")) return;
    const g1 = teams[playingTeams[0]].players.reduce((s, p) => s + p.goalsMatch, 0);
    const g2 = teams[playingTeams[1]].players.reduce((s, p) => s + p.goalsMatch, 0);

    setHistory([{ t1: teams[playingTeams[0]].name, t2: teams[playingTeams[1]].name, score: `${g1}-${g2}`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }, ...history]);

    const nt = [...teams];
    if (winnerIdx !== null) nt[winnerIdx].points += 3;
    else { nt[playingTeams[0]].points += 1; nt[playingTeams[1]].points += 1; }

    nt.forEach(t => t.players.forEach(p => {
      p.goals += p.goalsMatch; p.kicks += p.kicksMatch;
      p.goalsMatch = 0; p.kicksMatch = 0;
    }));
    setTeams(nt);
    setTimerActive(false);
    setTimeLeft(480000);
  };

  // VISTA 1: NOMBRES
  if (step === 1) return (
    <div className="app-container">
      <h1 className="title-main">REGISTRO DE JUGADORES</h1>
      {[0, 5, 10].map((start, gIdx) => (
        <div key={gIdx} className="card-setup" style={{ borderLeft: `4px solid ${['#adff2f', '#a855f7', '#f97316'][gIdx]}` }}>
          <h3 style={{ color: ['#adff2f', '#a855f7', '#f97316'][gIdx] }}>EQUIPO {gIdx + 1}</h3>
          {jugadoresManual.slice(start, start + 5).map((j, i) => (
            <div key={j.id} className="input-group-jugador">
              <span className="nro-jugador">{start + i + 1}</span>
              <input className="input-field-small" placeholder="Nombre..." value={j.name}
                onChange={e => { const n = [...jugadoresManual]; n[j.id].name = e.target.value; setJugadoresManual(n); }} />
            </div>
          ))}
        </div>
      ))}
      <button className="btn-action-start" onClick={iniciarManual}>INICIAR TORNEO</button>
      <button className="btn-draw" style={{ width: '100%', marginTop: '10px' }} onClick={() => setStep(2)}>GENERAR POR NIVELES →</button>
    </div>
  );

  // VISTA 2: NIVELES
  if (step === 2) return (
    <div className="app-container">
      <h1 className="title-main">NIVELES (1-10)</h1>
      <div className="card-setup">
        {jugadoresManual.filter(j => j.name).map(j => (
          <div key={j.id} className="input-group-jugador" style={{ justifyContent: 'space-between', paddingRight: '15px' }}>
            <span style={{ color: 'white' }}>{j.name}</span>
            <input type="number" className="nivel-input-simple" value={j.nivel}
              onChange={e => { const n = [...jugadoresManual]; n[j.id].nivel = parseInt(e.target.value); setJugadoresManual(n); }} />
          </div>
        ))}
        <button className="btn-action-start" style={{ marginTop: '20px' }} onClick={generarEquilibrado}>GENERAR E INICIAR</button>
        <button className="btn-draw" style={{ width: '100%', marginTop: '10px' }} onClick={() => setStep(1)}>VOLVER</button>
      </div>
    </div>
  );

  // VISTA 3: JUEGO
  const allP = teams.flatMap(t => t.players.filter(p => p.name).map(p => ({ ...p, teamName: t.name })));
  const scorers = [...allP].filter(p => p.goals > 0).sort((a, b) => b.goals - a.goals).slice(0, 5);
  const kickers = [...allP].filter(p => p.kicks > 0).sort((a, b) => b.kicks - a.kicks).slice(0, 5);

  return (
    <div className="app-container">
      <div className="timer-box">
        <div className="timer-digits">{formatTime(timeLeft)}</div>
        <button className="btn-timer-control" onClick={() => setTimerActive(!timerActive)}>{timerActive ? 'PAUSA' : 'INICIAR'}</button>
      </div>

      <div className="live-scoreboard">
        <div className="score-team">
          <span className={`score-val ${animateScore === playingTeams[0] ? 'score-pop' : ''}`}>
            {teams[playingTeams[0]].players.reduce((s, p) => s + p.goalsMatch, 0)}
          </span>
          <small>{teams[playingTeams[0]].name}</small>
        </div>
        <div className="score-separator">-</div>
        <div className="score-team">
          <span className={`score-val ${animateScore === playingTeams[1] ? 'score-pop' : ''}`}>
            {teams[playingTeams[1]].players.reduce((s, p) => s + p.goalsMatch, 0)}
          </span>
          <small>{teams[playingTeams[1]].name}</small>
        </div>
      </div>

      <div className="selector-container">
        <select value={playingTeams[0]} onChange={e => setPlayingTeams([parseInt(e.target.value), playingTeams[1]])}>
          {teams.map((t, i) => <option key={i} value={i}>{t.name}</option>)}
        </select>
        <span className="vs-badge">VS</span>
        <select value={playingTeams[1]} onChange={e => setPlayingTeams([playingTeams[0], parseInt(e.target.value)])}>
          {teams.map((t, i) => <option key={i} value={i}>{t.name}</option>)}
        </select>
      </div>

      <div className="match-grid">
        {playingTeams.map(tIdx => (
          <div key={tIdx}>
            <button className={`btn-win btn-win-${teams[tIdx]?.id}`} onClick={() => finishMatch(tIdx)}>🏆 GANÓ {teams[tIdx]?.name}</button>
            {teams[tIdx].players.map(p => (
              <div key={p.id} className={`player-card-live ${activeKick === p.id ? 'kick-shake' : ''}`}>
                <span style={{ color: 'white', fontWeight: '800' }}>{p.name}</span>
                <div style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
                  <button className="btn-stat goal" onClick={() => handleStat(tIdx, p.id, 'goals')}>⚽ {p.goalsMatch}</button>
                  <button className="btn-stat kick" onClick={() => handleStat(tIdx, p.id, 'kicks')}>🦴 {p.kicksMatch}</button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="history-section">
        <h3>📜 HISTORIAL</h3>
        {history.map((h, i) => (
          <div key={i} className="history-item"><span>{h.t1}</span> {h.score} <span>{h.t2}</span> <small>{h.time}</small></div>
        ))}
      </div>

      <div className="tables-section">
        <div className="full-width">
          <h3>📊 POSICIONES</h3>
          <table className="custom-table">
            <thead><tr><th>Equipo</th><th>Pts</th></tr></thead>
            <tbody>{teams.sort((a, b) => b.points - a.points).map(t => (<tr key={t.id}><td>{t.name}</td><td>{t.points}</td></tr>))}</tbody>
          </table>
        </div>
        <div>
          <h3 style={{ color: '#db2777' }}>⚽ GOLEADORES</h3>
          <table className="custom-table">
            <tbody>{scorers.map((p, i) => (<tr key={i}><td>{p.name}</td><td>{p.goals}</td></tr>))}</tbody>
          </table>
        </div>
        <div>
          <h3 style={{ color: '#ea580c' }}>🦴 RÚSTICOS</h3>
          <table className="custom-table">
            <tbody>{kickers.map((p, i) => (<tr key={i}><td>{p.name}</td><td>{p.kicks}</td></tr>))}</tbody>
          </table>
        </div>
      </div>
      <button className="btn-reset-all" onClick={() => { if (confirm("¿Borrar todo?")) { localStorage.clear(); window.location.reload(); } }}>REINICIAR TODO</button>
    </div>
  );
};

export default App;