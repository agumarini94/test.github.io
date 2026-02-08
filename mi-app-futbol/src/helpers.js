export const texts = {
    es: {
        titleConfig: "CONFIGURACIÓN",
        matchTime: "Minutos:",
        howManyTeams: "Equipos (Máx 20):",
        gameMode: "Modo de Juego:",
        start: "CONTINUAR",
        regTitle: "REGISTRO",
        initTorneo: "INICIAR TORNEO",
        draw: "EMPATE",
        won: "GANÓ",
        history: "📜 HISTORIAL",
        statsPos: "📊 POSICIONES",
        statsGoals: "⚽ GOLEADORES",
        statsKicks: "🦵 PATADAS",
        resetAll: "BORRAR TODO",
        resetTable: "LIMPIAR TABLA",
        confirmVictory: "¿Confirmar victoria de",
        confirmDraw: "¿Estás seguro de declarar EMPATE?",
        errorTie: "Error: No se puede declarar un ganador si el resultado está empatado.",
        errorNotTie: "Error: No se puede declarar empate si hay un equipo con más goles.",
        errorWinner: "Error: El equipo seleccionado no es el ganador actual.",
        teamsInGame: "EQUIPOS EN JUEGO:",
        btnEndManual: "FINALIZAR",
        tableCols: ["EQ", "PJ", "G", "E", "P", "GF", "GC", "DG", "PTS"]
    },
    en: {
        titleConfig: "SETTINGS",
        matchTime: "Minutes:",
        howManyTeams: "Teams (Max 20):",
        gameMode: "Game Mode:",
        start: "CONTINUE",
        regTitle: "REGISTRATION",
        initTorneo: "START TOURNAMENT",
        draw: "DRAW",
        won: "WON",
        history: "📜 HISTORY",
        statsPos: "📊 STANDINGS",
        statsGoals: "⚽ TOP SCORERS",
        statsKicks: "🦵 KICKS",
        resetAll: "RESET ALL",
        resetTable: "CLEAR TABLE",
        confirmVictory: "Confirm victory for",
        confirmDraw: "Are you sure you want to declare a DRAW?",
        errorTie: "Error: Cannot declare a winner if the score is tied.",
        errorNotTie: "Error: Cannot declare a draw if one team has more goals.",
        errorWinner: "Error: The selected team is not the current winner.",
        teamsInGame: "TEAMS IN GAME:",
        btnEndManual: "FINISH",
        tableCols: ["TM", "GP", "W", "D", "L", "GS", "GA", "GD", "PTS"]
    }
};

export const getSaved = (key, def) => {
    try {
        const s = localStorage.getItem(key);
        return s ? JSON.parse(s) : def;
    } catch { return def; }
};