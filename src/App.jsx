import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const App = () => {
  const [step, setStep] = useState(1);
  const [timeLeft, setTimeLeft] = useState(480000); // 8 min en milisegundos
  const [timerActive, setTimerActive] = useState(false);
  const [playingTeams, setPlayingTeams] = useState([0, 1]);
  const [lastWinner, setLastWinner] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const timerRef = useRef(null);

  // Inicialización de 3 equipos con 5 jugadores vacíos cada uno
  const [teams, setTeams] = useState(
    [1, 2, 3].map(id => ({
      id,
      name: '',
      players: Array.from({ length: 5 }, (_, i) => ({ id: i, name: '', goals: 0, kicks: 0 })),
      points: 0,
      color: id === 1 ? '#adff2f' : id === 2 ? '#a855f7' : '#f97316'
    }))
  );

  // Lógica del Cronómetro (cada 10ms para milisegundos)
  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => Math.max(0, prev - 10));
      }, 10);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerActive, timeLeft]);

  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(centiseconds).padStart(2, '0')}`;
  };

  const getCurrentGoals = (tIdx) => {
    return teams[tIdx].players.reduce((sum, p) => sum + p.goals, 0);
  };

  const handleTeamChange = (index, value) => {
    const newIdx = parseInt(value);
    const otherIdx = index === 0 ? playingTeams[1] : playingTeams[0];

    if (newIdx === otherIdx) {
      alert("¡Un equipo no puede jugar contra sí mismo!");
      return;
    }

    setIsRefreshing(true);
    const newPlaying = [...playingTeams];
    newPlaying[index] = newIdx;
    setPlayingTeams(newPlaying);
    setTimeout(() => setIsRefreshing(false), 400);
  };

  const addStat = (tIdx, pIdx, type) => {
    const newTeams = [...teams];
    newTeams[tIdx].players[pIdx][type] += 1;
    setTeams(newTeams);
  };

  const finishMatch = (winnerIdx) => {
    if (window.confirm(`¿Confirmar victoria de ${teams[winnerIdx].name || 'Equipo ' + (winnerIdx + 1)}?`)) {
      const newTeams = [...teams];
      newTeams[winnerIdx].points += 3;
      completeMatch(newTeams, winnerIdx);
    }
  };

  const finishDraw = () => {
    if (window.confirm("¿Confirmar empate? (1 punto para cada equipo)")) {
      const newTeams = [...teams];
      newTeams[playingTeams[0]].points += 1;
      newTeams[playingTeams[1]].points += 1;
      completeMatch(newTeams, 'draw');
    }
  };

  const completeMatch = (updatedTeams, winnerType) => {
    setTeams(updatedTeams);
    setLastWinner(winnerType);
    setTimerActive(false);
    setTimeLeft(480000);
    setTimeout(() => {
      setLastWinner(null);
      alert("Resultado guardado. ¡Siguiente partido!");
    }, 1000);
  };

  // Cálculos de tablas
  const sortedTeams = [...teams].sort((a, b) => b.points - a.points);
  const allPlayers = teams.flatMap(t => t.players.filter(p => p.name).map(p => ({ ...p, teamName: t.name || `E${t.id}` })));
  const topScorers = [...allPlayers].filter(p => p.goals > 0).sort((a, b) => b.goals - a.goals).slice(0, 5);
  const topKickers = [...allPlayers].filter(p => p.kicks > 0).sort((a, b) => b.kicks - a.kicks).slice(0, 5);

  if (step === 1) {
    return (
      <div className="app-container">
        <h1 className="title-main">REGISTRO DE EQUIPOS</h1>
        {teams.map((team, tIdx) => (
          <div key={team.id} className="card-setup">
            <h2 className="section-label" style={{ color: team.color }}>EQUIPO {team.id}</h2>
            <input
              className="input-field equipo-name"
              placeholder="Nombre del Equipo"
              value={team.name}
              onChange={(e) => {
                const nt = [...teams]; nt[tIdx].name = e.target.value; setTeams(nt);
              }}
            />
            <div className="jugadores-grid">
              {team.players.map((p, pIdx) => (
                <div key={pIdx} className="input-group-jugador">
                  <span className="nro-jugador">{pIdx + 1}</span>
                  <input
                    className="input-field-small"
                    placeholder="Nombre Jugador"
                    value={p.name}
                    onChange={(e) => {
                      const nt = [...teams]; nt[tIdx].players[pIdx].name = e.target.value; setTeams(nt);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
        <button className="btn-action-start" onClick={() => setStep(2)}>INICIAR TORNEO</button>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* CRONÓMETRO */}
      <div className={`timer-box ${timerActive ? 'timer-running' : ''}`}>
        <div className="timer-digits">{formatTime(timeLeft)}</div>
        <div className="timer-controls">
          <button onClick={() => setTimerActive(!timerActive)} className="btn-timer-control">
            {timerActive ? 'PAUSAR' : 'INICIAR'}
          </button>
          <button onClick={finishDraw} className="btn-draw">EMPATE</button>
        </div>
      </div>

      {/* MARCADOR EN VIVO */}
      <div className="live-scoreboard">
        <div className="score-team">
          <span className="score-val">{getCurrentGoals(playingTeams[0])}</span>
          <small>{teams[playingTeams[0]].name || 'E1'}</small>
        </div>
        <div className="score-separator">-</div>
        <div className="score-team">
          <span className="score-val">{getCurrentGoals(playingTeams[1])}</span>
          <small>{teams[playingTeams[1]].name || 'E2'}</small>
        </div>
      </div>

      {/* SECCIÓN EQUIPOS EN JUEGO */}
      <div className="match-selection-area">
        <h3 className="section-label">EQUIPOS EN JUEGO:</h3>
        <div className={`selector-container ${timerActive ? 'locked' : ''}`}>
          {timerActive && <div className="lock-overlay">⚠️ PAUSA EL RELOJ</div>}
          <select disabled={timerActive} value={playingTeams[0]} onChange={e => handleTeamChange(0, e.target.value)}>
            {teams.map((t, i) => <option key={i} value={i}>{t.name || `Equipo ${i + 1}`}</option>)}
          </select>
          <span className="vs-badge">VS</span>
          <select disabled={timerActive} value={playingTeams[1]} onChange={e => handleTeamChange(1, e.target.value)}>
            {teams.map((t, i) => <option key={i} value={i}>{t.name || `Equipo ${i + 1}`}</option>)}
          </select>
        </div>
      </div>

      {/* INTERFAZ DE JUEGO */}
      <div className={`match-grid ${isRefreshing ? 'refreshing' : ''}`}>
        {playingTeams.map(tIdx => (
          <div key={tIdx} className="team-column">
            <button className="btn-win" onClick={() => finishMatch(tIdx)}>GANÓ {teams[tIdx].name || 'E' + (tIdx + 1)}</button>
            {teams[tIdx].players.filter(p => p.name).map((p) => (
              <div key={p.id} className="player-card-live">
                <span className="player-name-live">{p.name}</span>
                <div className="btn-stats-group">
                  <button onClick={() => addStat(tIdx, p.id, 'goals')} className="btn-stat goal">⚽ {p.goals}</button>
                  <button onClick={() => addStat(tIdx, p.id, 'kicks')} className="btn-stat kick">🦴 {p.kicks}</button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* ESTADÍSTICAS */}
      <div className="tables-section">
        <div className="table-wrapper full-width">
          <h3>📊 POSICIONES</h3>
          <table className="custom-table">
            <thead><tr><th>Equipo</th><th>Pts</th></tr></thead>
            <tbody>
              {sortedTeams.map(t => (
                <tr key={t.id} className={lastWinner === t.id || (lastWinner === 'draw' && (t.id === teams[playingTeams[0]].id || t.id === teams[playingTeams[1]].id)) ? 'points-pop' : ''}>
                  <td>{t.name || 'E' + t.id}</td>
                  <td>{t.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-wrapper">
          <h3 style={{ color: '#db2777' }}>⚽ TOP GOLES</h3>
          <table className="custom-table">
            <tbody>
              {topScorers.map((p, i) => (
                <tr key={i}><td>{p.name} <br /><small>{p.teamName}</small></td><td>{p.goals}</td></tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-wrapper">
          <h3 style={{ color: '#ea580c' }}>🦴 RÚSTICOS</h3>
          <table className="custom-table">
            <tbody>
              {topKickers.map((p, i) => (
                <tr key={i}><td>{p.name} <br /><small>{p.teamName}</small></td><td>{p.kicks}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <button onClick={() => { if (confirm("¿Reiniciar?")) window.location.reload() }} className="btn-reset-all">REINICIAR TORNEO</button>
    </div>
  );
};

export default App;