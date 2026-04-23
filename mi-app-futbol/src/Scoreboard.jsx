import React from 'react';

const Scoreboard = ({ teams, playingTeams, setPlayingTeams, waitingTeamIdx, timeLeft, timerActive, setTimerActive, setTimeLeft, config, formatTimeFull, handleStat, finishMatch, t, showConfirm }) => {

    const hasStartedOnce = timeLeft < (config.minutes * 60000);

    const g1 = teams[playingTeams[0]]?.players.reduce((s, p) => s + p.goalsMatch, 0) || 0;
    const g2 = teams[playingTeams[1]]?.players.reduce((s, p) => s + p.goalsMatch, 0) || 0;

    const handleResetTimer = () => {
        showConfirm(t.resetTimerConfirm, () => {
            setTimerActive(false);
            setTimeLeft(config.minutes * 60000);
        });
    };

    const handleManualEnd = () => {
        if (!hasStartedOnce) return;
        showConfirm(t.confirmManualEnd, () => {
            let winner = g1 > g2 ? playingTeams[0] : (g2 > g1 ? playingTeams[1] : null);
            finishMatch(winner);
        });
    };

    const handleFinishWithConfirm = (winnerIdx) => {
        if (!hasStartedOnce) return;

        if (winnerIdx !== null) {
            if (g1 === g2) {
                showConfirm(t.errorTie);
                return;
            }
            const isT1Winner = winnerIdx === playingTeams[0];
            if ((isT1Winner && g1 < g2) || (!isT1Winner && g2 < g1)) {
                showConfirm(t.errorWinner);
                return;
            }
            showConfirm(`${t.confirmVictory} ${teams[winnerIdx].name}?`, () => finishMatch(winnerIdx));
        } else {
            if (g1 !== g2) {
                showConfirm(t.errorNotTie);
                return;
            }
            showConfirm(t.confirmDraw, () => finishMatch(null));
        }
    };

    const goalsToWin = config.goalsToWin ?? 0;

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
                                <div className="timer-box">
                                    <div className="timer-val">{formatTimeFull(timeLeft)}</div>
                                    {goalsToWin > 0 && (
                                        <div className="goal-limit-chip">⚽ × {goalsToWin}</div>
                                    )}
                                    <div className="timer-controls">
                                        <button onClick={() => setTimerActive(!timerActive)} className={timerActive ? 'btn-pause' : 'btn-start'}>
                                            {timerActive ? '⏸' : '▶'}
                                        </button>
                                        <button onClick={handleResetTimer} className="btn-reset">↺</button>
                                        <button
                                            onClick={handleManualEnd}
                                            className="btn-reset btn-end-manual"
                                            style={{ opacity: !hasStartedOnce ? 0.3 : 1, cursor: !hasStartedOnce ? 'not-allowed' : 'pointer' }}
                                        >
                                            {t.btnEndManual}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                <div className="teams-in-game-area">
                    <div className="teams-label">{t.teamsInGame}</div>
                    <div className="selectors-row" style={{ opacity: hasStartedOnce ? 0.5 : 1, pointerEvents: hasStartedOnce ? 'none' : 'auto' }}>
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
                    {waitingTeamIdx !== null && teams[waitingTeamIdx] && (
                        <div className="waiting-badge">⏳ {t.resting}: {teams[waitingTeamIdx].name}</div>
                    )}
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
                                    <button className="btn-min" onClick={(e) => { e.stopPropagation(); handleStat(playingTeams[sIdx], p.id, 'goals', -1); }}>−</button>
                                    <button className="btn-k" onClick={(e) => { e.stopPropagation(); handleStat(playingTeams[sIdx], p.id, 'kicks', 1); }}>🦵 {p.kicksMatch}</button>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            <div className="mega-win-row" style={{ opacity: !hasStartedOnce ? 0.3 : 1, pointerEvents: !hasStartedOnce ? 'none' : 'auto' }}>
                <button className="btn-win-mega t1" onClick={() => handleFinishWithConfirm(playingTeams[0])}>
                    <span>{t.won}</span>
                    <b>{teams[playingTeams[0]]?.name}</b>
                </button>
                <button className="btn-draw-mega" onClick={() => handleFinishWithConfirm(null)}>{t.draw}</button>
                <button className="btn-win-mega t2" onClick={() => handleFinishWithConfirm(playingTeams[1])}>
                    <span>{t.won}</span>
                    <b>{teams[playingTeams[1]]?.name}</b>
                </button>
            </div>
        </div>
    );
};

export default Scoreboard;
