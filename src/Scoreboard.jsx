import React from 'react';

const Scoreboard = ({ teams, playingTeams, timeLeft, timerActive, setTimerActive, setTimeLeft, config, formatTimeFull, handleStat, finishMatch, t }) => {

    const handleFinishWithConfirm = (winnerIdx) => {
        const t1 = teams[playingTeams[0]];
        const t2 = teams[playingTeams[1]];
        const g1 = t1.players.reduce((s, p) => s + p.goalsMatch, 0);
        const g2 = t2.players.reduce((s, p) => s + p.goalsMatch, 0);

        if (winnerIdx === null) {
            const msg = (g1 !== g2) ? t.confirmDrawWarning : t.confirmDraw;
            if (window.confirm(msg)) finishMatch(null);
        } else {
            const winnerName = teams[winnerIdx].name;
            if (window.confirm(`${t.confirmVictory} ${winnerName}?`)) finishMatch(winnerIdx);
        }
    };

    return (
        <div className="match-engine">
            <div className="stadium-board">
                <div className="scoreboard-lcd">
                    <div className="score-team-box">
                        <span className="team-abbr">{teams[playingTeams[0]]?.name.substring(0, 3)}</span>
                        <span className="score-num">{teams[playingTeams[0]]?.players.reduce((s, p) => s + p.goalsMatch, 0)}</span>
                    </div>
                    <div className="timer-box">
                        <div className="timer-val">{formatTimeFull(timeLeft)}</div>
                        <div className="timer-controls">
                            <button onClick={() => setTimerActive(!timerActive)} className={timerActive ? 'btn-pause' : 'btn-start'}>{timerActive ? "PAUSE" : "START"}</button>
                            <button onClick={() => { setTimerActive(false); setTimeLeft(config.minutes * 60000); }} className="btn-reset">RESET</button>
                        </div>
                    </div>
                    <div className="score-team-box">
                        <span className="team-abbr">{teams[playingTeams[1]]?.name.substring(0, 3)}</span>
                        <span className="score-num">{teams[playingTeams[1]]?.players.reduce((s, p) => s + p.goalsMatch, 0)}</span>
                    </div>
                </div>
            </div>

            <div className={`soccer-field mode-f${config.gameType}`}>
                <div className="field-line center"></div><div className="field-circle"></div>
                <div className="left-side">
                    {teams[playingTeams[0]]?.players.map((p, i) => (
                        <div key={p.id} className={`player-box player-pos-${i + 1}`}>
                            <div className="p-main-btn" onClick={() => handleStat(playingTeams[0], p.id, 'goals', 1)}>
                                <span className="n">{p.name || `P${i + 1}`}</span>
                                <span className="g">⚽ {p.goalsMatch}</span>
                            </div>
                            <div className="p-controls">
                                <button className="btn-min" onClick={(e) => { e.stopPropagation(); handleStat(playingTeams[0], p.id, 'goals', -1) }}>-</button>
                                <button className="btn-k" onClick={(e) => { e.stopPropagation(); handleStat(playingTeams[0], p.id, 'kicks', 1) }}>🦵 {p.kicksMatch}</button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="right-side">
                    {teams[playingTeams[1]]?.players.map((p, i) => (
                        <div key={p.id} className={`player-box player-pos-${i + 1}`}>
                            <div className="p-main-btn" onClick={() => handleStat(playingTeams[1], p.id, 'goals', 1)}>
                                <span className="n">{p.name || `P${i + 1}`}</span>
                                <span className="g">⚽ {p.goalsMatch}</span>
                            </div>
                            <div className="p-controls">
                                <button className="btn-min" onClick={(e) => { e.stopPropagation(); handleStat(playingTeams[1], p.id, 'goals', -1) }}>-</button>
                                <button className="btn-k" onClick={(e) => { e.stopPropagation(); handleStat(playingTeams[1], p.id, 'kicks', 1) }}>🦵 {p.kicksMatch}</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mega-win-row">
                <button className="btn-win-mega t1" onClick={() => handleFinishWithConfirm(playingTeams[0])}>
                    <span className="win-label">{t.won}</span><span className="win-team-name">{teams[playingTeams[0]]?.name}</span>
                </button>
                <button className="btn-draw-mega" onClick={() => handleFinishWithConfirm(null)}>{t.draw}</button>
                <button className="btn-win-mega t2" onClick={() => handleFinishWithConfirm(playingTeams[1])}>
                    <span className="win-label">{t.won}</span><span className="win-team-name">{teams[playingTeams[1]]?.name}</span>
                </button>
            </div>
        </div>
    );
};

export default Scoreboard;