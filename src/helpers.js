export const texts = {
    es: {
        titleConfig: "CONFIGURACIÓN", matchTime: "Minutos:", howManyTeams: "Equipos (Máx 20):",
        gameMode: "Modo de Juego:", start: "CONTINUAR", regTitle: "REGISTRO", initTorneo: "INICIAR TORNEO",
        draw: "EMPATE", won: "GANÓ", history: "📜 HISTORIAL", statsPos: "📊 POSICIONES",
        statsGoals: "⚽ GOLEADORES", statsKicks: "🦵 PATADAS", resetAll: "BORRAR TODO",
        resetTable: "LIMPIAR TABLA",
        confirmVictory: "¿Confirmar victoria de",
        confirmDraw: "¿Estás seguro de declarar EMPATE?",
        confirmDrawWarning: "¡CUIDADO! El marcador no está igualado. ¿Declarar EMPATE igual?",
        tableCols: ["EQ", "PJ", "G", "E", "P", "GF", "GC", "DG", "PTS"]
    },
    en: {
        titleConfig: "SETUP", matchTime: "Minutes:", howManyTeams: "Teams (Max 20):",
        gameMode: "Game Mode:", start: "CONTINUE", regTitle: "REGISTRATION", initTorneo: "START TOURNAMENT",
        draw: "DRAW", won: "WON", history: "📜 HISTORY", statsPos: "📊 STANDINGS",
        statsGoals: "⚽ SCORERS", statsKicks: "🦵 KICKS", resetAll: "RESET ALL",
        resetTable: "RESET TABLE",
        confirmVictory: "Confirm victory for",
        confirmDraw: "Are you sure about the DRAW?",
        confirmDrawWarning: "WARNING: Scores are not equal. Declare DRAW anyway?",
        tableCols: ["TM", "GP", "W", "D", "L", "GS", "GA", "GD", "PTS"]
    },
    he: {
        titleConfig: "הגדרות", matchTime: "דקות:", howManyTeams: "קבוצות:",
        gameMode: "סוג משחק:", start: "המשך", regTitle: "הרשמה", initTorneo: "התחל טורניר",
        draw: "תיקו", won: "ניצחון", history: "📜 היסטוריה", statsPos: "📊 טבלה",
        statsGoals: "⚽ מלך השערים", statsKicks: "🦵 בעיטות", resetAll: "אפס הכל",
        resetTable: "נקה טבלה",
        confirmVictory: "אשר ניצחון ל",
        confirmDraw: "האם אתה בטוח בתיקו?",
        confirmDrawWarning: "אזהרה: התוצאה לא שווה. להכריז תיקו?",
        tableCols: ["קבוצה", "מש", "נצ", "תי", "הפ", "זכות", "חובה", "הפרש", "נק"]
    }
};

export const getSaved = (key, def) => {
    const s = localStorage.getItem(key);
    try { return s ? JSON.parse(s) : def; } catch { return def; }
};