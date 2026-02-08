import React from 'react';

const Scoreboard = ({ teams, playingTeams, setPlayingTeams, timeLeft, timerActive, setTimerActive, setTimeLeft, config, formatTimeFull, handleStat, finishMatch, t }) => {

    const hasStartedOnce = timeLeft < (config.minutes * 60000);

    const g1 = teams[playingTeams[0]]?.players.reduce((s, p) => s + p.goalsMatch, 0) || 0;
    const g2 = teams[playingTeams[1]]?.players.reduce((s, p) => s + p.goalsMatch, 0) || 0;

    const handleResetTimer = () => {
        if (window.confirm(t.resetTimerConfirm || "¿Reiniciar?")) {
            setTimerActive(false);
            setTimeLeft(config.minutes * 60000);
        }
    };

    const handleManualEnd = () => {
        if (!hasStartedOnce) return;
        if (window.confirm(t.confirmManualEnd || "¿Finalizar ahora?")) {
            let winner = g1 > g2 ? playingTeams[0] : (g2 > g1 ? playingTeams[1] : null);
            finishMatch(winner);
        }
    };

    const handleFinishWithConfirm = (winnerIdx) => {
        if (!hasStartedOnce) return;

        if (winnerIdx !== null) {
            if (g1 === g2) {
                alert(t.errorTie);
                return;
            }
            const isT1Winner = winnerIdx === playingTeams[0];
            if ((isT1Winner && g1 < g2) || (!isT1Winner && g2 < g1)) {
                alert(t.errorWinner);
                return;
            }
            if (window.confirm(`${t.confirmVictory} ${teams[winnerIdx].name}?`)) {
                finishMatch(winnerIdx);
            }
        }
        else {
            if (g1 !== g2) {
                alert(t.errorNotTie);
                return;
            }
            if (window.confirm(t.confirmDraw)) finishMatch(null);
        }
    };

    return (
        <div className="match-engine">
            <div className="stadium-board">
                <div className="scoreboard-lcd">
                    {[0, 1].map(i => (
                        <React.Fragment key={i}>
                            <div className="score-team-box">
                                <span className="team-abbr">{teams[playingTeams[i]]?.name.substring(0, 3)}</span>
                                <span className="score-num">{i === 0 ? g1 : g2}</span>
                            </div>
                            {i === 0 && (
                                <div className="timer-box" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div className="timer-val" style={{ marginBottom: '10px', width: '100%', textAlign: 'center' }}>
                                        {formatTimeFull(timeLeft)}
                                    </div>
                                    <div className="timer-controls" style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                                        <button onClick={() => setTimerActive(!timerActive)} className={timerActive ? 'btn-pause' : 'btn-start'}>
                                            {timerActive ? "PAUSE" : "START"}
                                        </button>
                                        <button onClick={handleResetTimer} className="btn-reset">RESET</button>
                                        <button
                                            onClick={handleManualEnd}
                                            className="btn-reset"
                                            style={{
                                                opacity: !hasStartedOnce ? 0.3 : 1,
                                                cursor: !hasStartedOnce ? 'not-allowed' : 'pointer',
                                                background: '#e67e22',
                                                fontSize: '0.65rem'
                                            }}
                                        >
                                            {t.btnEndManual}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                <div style={{ textAlign: 'center', marginTop: '15px' }}>
                    <div style={{
                        color: 'rgba(255,255,255,0.8)',
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                        display: 'inline-block',
                        paddingBottom: '2px',
                        borderBottom: timerActive ? '2px solid #3498db' : '2px solid transparent',
                        transition: 'all 0.3s ease',
                        textTransform: 'uppercase'
                    }}>
                        {t.teamsInGame}
                    </div>
                    <div className="selectors-row" style={{ marginTop: '8px', opacity: hasStartedOnce ? 0.5 : 1, pointerEvents: hasStartedOnce ? 'none' : 'auto' }}>
                        {[0, 1].map(i => (
                            <select key={i} value={playingTeams[i]} onChange={e => {
                                const newPT = [...playingTeams];
                                newPT[i] = parseInt(e.target.value);
                                setPlayingTeams(newPT);
                            }}>
                                {teams.map((team, idx) => <option key={idx} value={idx} disabled={idx === playingTeams[i === 0 ? 1 : 0]}>{team.name}</option>)}
                            </select>
                        ))}
                    </div>
                </div>
            </div>

            <div className={`soccer-field mode-f${config.gameType}`} style={{ opacity: !hasStartedOnce ? 0.6 : 1 }}>
                <div className="field-line center"></div>
                <div className="field-circle"></div>
                {['left-side', 'right-side'].map((side, sIdx) => (
                    <div key={side} className={side}>
                        {teams[playingTeams[sIdx]]?.players.map((p, i) => (
                            <div key={p.id} className={`player-box player-pos-${i + 1}`}>
                                <div className="p-main-btn" onClick={() => handleStat(playingTeams[sIdx], p.id, 'goals', 1)}>
                                    <span className="n">{p.name || `P${i + 1}`}</span>
                                    <span className="g">⚽ {p.goalsMatch}</span>
                                </div>
                                <div className="p-controls">
                                    <button className="btn-min" onClick={(e) => { e.stopPropagation(); handleStat(playingTeams[sIdx], p.id, 'goals', -1) }}>-</button>
                                    <button className="btn-k" onClick={(e) => { e.stopPropagation(); handleStat(playingTeams[sIdx], p.id, 'kicks', 1) }}>🦵 {p.kicksMatch}</button>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            <div className="mega-win-row" style={{ opacity: !hasStartedOnce ? 0.3 : 1, pointerEvents: !hasStartedOnce ? 'none' : 'auto' }}>
                <button className="btn-win-mega t1" onClick={() => handleFinishWithConfirm(playingTeams[0])}>
                    <span>{t.won}</span> <b>{teams[playingTeams[0]]?.name}</b>
                </button>
                <button className="btn-draw-mega" onClick={() => handleFinishWithConfirm(null)}>{t.draw}</button>
                <button className="btn-win-mega t2" onClick={() => handleFinishWithConfirm(playingTeams[1])}>
                    <span>{t.won}</span> <b>{teams[playingTeams[1]]?.name}</b>
                </button>
            </div>
        </div>
    );
};

export default Scoreboard;