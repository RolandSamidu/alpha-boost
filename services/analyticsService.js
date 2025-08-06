import {
  collection,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";
import app from "../config/firebaseConfig";

const db = getFirestore(app);

const AnalyticsService = {
  async getDailyProgress(userId, days = 5) {
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const gameScoresQuery = query(
        collection(db, "gameScores"),
        where("userId", "==", userId)
      );

      const historyQuery = query(
        collection(db, "spellingHistory"),
        where("userId", "==", userId)
      );

      const [gameScoresSnapshot, historySnapshot] = await Promise.all([
        getDocs(gameScoresQuery),
        getDocs(historyQuery),
      ]);

      const gameScores = [];
      const spellingHistory = [];

      gameScoresSnapshot.forEach((doc) => {
        const data = doc.data();
        const docDate = data.createdAt?.toDate() || new Date(data.timestamp);
        if (docDate >= startDate && docDate <= endDate) {
          gameScores.push({
            id: doc.id,
            ...data,
            date: docDate,
          });
        }
      });

      historySnapshot.forEach((doc) => {
        const data = doc.data();
        const docDate = data.createdAt?.toDate() || new Date(data.timestamp);
        if (docDate >= startDate && docDate <= endDate) {
          spellingHistory.push({
            id: doc.id,
            ...data,
            date: docDate,
          });
        }
      });

      const dailyData = {};

      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split("T")[0];

        dailyData[dateKey] = {
          date: dateKey,
          gamesPlayed: 0,
          totalScore: 0,
          averageScore: 0,
          spellingChecks: 0,
          gameTypes: {},
          errorTypes: {},
        };
      }

      gameScores.forEach((game) => {
        const dateKey = game.date.toISOString().split("T")[0];
        if (dailyData[dateKey]) {
          dailyData[dateKey].gamesPlayed++;
          dailyData[dateKey].totalScore += game.score || 0;

          const gameType = game.gameTitle || "Unknown";
          dailyData[dateKey].gameTypes[gameType] =
            (dailyData[dateKey].gameTypes[gameType] || 0) + 1;

          if (game.errorTypes && Array.isArray(game.errorTypes)) {
            game.errorTypes.forEach((errorType) => {
              dailyData[dateKey].errorTypes[errorType] =
                (dailyData[dateKey].errorTypes[errorType] || 0) + 1;
            });
          }
        }
      });

      spellingHistory.forEach((session) => {
        const dateKey = session.date.toISOString().split("T")[0];
        if (dailyData[dateKey]) {
          dailyData[dateKey].spellingChecks++;
        }
      });

      Object.keys(dailyData).forEach((dateKey) => {
        const day = dailyData[dateKey];
        day.averageScore =
          day.gamesPlayed > 0
            ? Math.round(day.totalScore / day.gamesPlayed)
            : 0;
      });

      return {
        success: true,
        dailyData: Object.values(dailyData).sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        ),
      };
    } catch (error) {
      console.error("Error getting daily progress:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  async getWeeklyProgress(userId, weeks = 4) {
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - weeks * 7);

      const gameScoresQuery = query(
        collection(db, "gameScores"),
        where("userId", "==", userId)
      );

      const historyQuery = query(
        collection(db, "spellingHistory"),
        where("userId", "==", userId)
      );

      const [gameScoresSnapshot, historySnapshot] = await Promise.all([
        getDocs(gameScoresQuery),
        getDocs(historyQuery),
      ]);

      const gameScores = [];
      const spellingHistory = [];

      gameScoresSnapshot.forEach((doc) => {
        const data = doc.data();
        const docDate = data.createdAt?.toDate() || new Date(data.timestamp);
        if (docDate >= startDate && docDate <= endDate) {
          gameScores.push({
            id: doc.id,
            ...data,
            date: docDate,
          });
        }
      });

      historySnapshot.forEach((doc) => {
        const data = doc.data();
        const docDate = data.createdAt?.toDate() || new Date(data.timestamp);
        if (docDate >= startDate && docDate <= endDate) {
          spellingHistory.push({
            id: doc.id,
            ...data,
            date: docDate,
          });
        }
      });

      const weeklyData = {};

      for (let i = 0; i < weeks; i++) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - i * 7 - 6);
        const weekEnd = new Date();
        weekEnd.setDate(weekEnd.getDate() - i * 7);

        const weekKey = `${weekStart.toISOString().split("T")[0]}_${
          weekEnd.toISOString().split("T")[0]
        }`;

        weeklyData[weekKey] = {
          weekStart: weekStart.toISOString().split("T")[0],
          weekEnd: weekEnd.toISOString().split("T")[0],
          gamesPlayed: 0,
          totalScore: 0,
          averageScore: 0,
          spellingChecks: 0,
          gameTypes: {},
          errorTypes: {},
          bestDay: null,
          mostActiveDay: null,
        };
      }

      const dailyStats = {};

      gameScores.forEach((game) => {
        const gameDate = game.date;
        const dayKey = gameDate.toISOString().split("T")[0];

        Object.keys(weeklyData).forEach((weekKey) => {
          const week = weeklyData[weekKey];
          const weekStartDate = new Date(week.weekStart);
          const weekEndDate = new Date(week.weekEnd);

          if (gameDate >= weekStartDate && gameDate <= weekEndDate) {
            week.gamesPlayed++;
            week.totalScore += game.score || 0;

            const gameType = game.gameTitle || "Unknown";
            week.gameTypes[gameType] = (week.gameTypes[gameType] || 0) + 1;

            if (game.errorTypes && Array.isArray(game.errorTypes)) {
              game.errorTypes.forEach((errorType) => {
                week.errorTypes[errorType] =
                  (week.errorTypes[errorType] || 0) + 1;
              });
            }

            if (!dailyStats[dayKey]) {
              dailyStats[dayKey] = { games: 0, score: 0 };
            }
            dailyStats[dayKey].games++;
            dailyStats[dayKey].score += game.score || 0;
          }
        });
      });

      spellingHistory.forEach((session) => {
        const sessionDate = session.date;

        Object.keys(weeklyData).forEach((weekKey) => {
          const week = weeklyData[weekKey];
          const weekStartDate = new Date(week.weekStart);
          const weekEndDate = new Date(week.weekEnd);

          if (sessionDate >= weekStartDate && sessionDate <= weekEndDate) {
            week.spellingChecks++;
          }
        });
      });

      Object.keys(weeklyData).forEach((weekKey) => {
        const week = weeklyData[weekKey];
        week.averageScore =
          week.gamesPlayed > 0
            ? Math.round(week.totalScore / week.gamesPlayed)
            : 0;

        const weekDays = Object.keys(dailyStats).filter((dayKey) => {
          const dayDate = new Date(dayKey);
          const weekStartDate = new Date(week.weekStart);
          const weekEndDate = new Date(week.weekEnd);
          return dayDate >= weekStartDate && dayDate <= weekEndDate;
        });

        let bestDay = null;
        let mostActiveDay = null;
        let bestScore = 0;
        let mostGames = 0;

        weekDays.forEach((dayKey) => {
          const dayStats = dailyStats[dayKey];
          const avgScore =
            dayStats.games > 0 ? dayStats.score / dayStats.games : 0;

          if (avgScore > bestScore) {
            bestScore = avgScore;
            bestDay = dayKey;
          }

          if (dayStats.games > mostGames) {
            mostGames = dayStats.games;
            mostActiveDay = dayKey;
          }
        });

        week.bestDay = bestDay;
        week.mostActiveDay = mostActiveDay;
      });

      return {
        success: true,
        weeklyData: Object.values(weeklyData).sort(
          (a, b) => new Date(a.weekStart) - new Date(b.weekStart)
        ),
      };
    } catch (error) {
      console.error("Error getting weekly progress:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  async getUserOverallStats(userId) {
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }

      const [gameScoresResult, historyResult] = await Promise.all([
        this.getUserAllGameScores(userId),
        this.getUserAllHistory(userId),
      ]);

      if (!gameScoresResult.success || !historyResult.success) {
        throw new Error("Failed to fetch user data");
      }

      const gameScores = gameScoresResult.scores || [];
      const spellingHistory = historyResult.history || [];

      const streak = this.calculateCurrentStreak(
        userId,
        gameScores,
        spellingHistory
      );

      return {
        success: true,
        stats: {
          totalGames: gameScores.length,
          totalSpellingChecks: spellingHistory.length,
          currentStreak: streak.current,
          longestStreak: streak.longest,
          totalScore: gameScores.reduce(
            (sum, game) => sum + (game.score || 0),
            0
          ),
          averageGameScore:
            gameScores.length > 0
              ? Math.round(
                  gameScores.reduce((sum, game) => sum + (game.score || 0), 0) /
                    gameScores.length
                )
              : 0,
          totalWordsChecked: spellingHistory.reduce(
            (sum, session) => sum + (session.result?.summary?.total_words || 0),
            0
          ),
          mostCommonError: this.getMostCommonError(gameScores, spellingHistory),
        },
      };
    } catch (error) {
      console.error("Error getting overall stats:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  async getUserAllGameScores(userId) {
    const q = query(
      collection(db, "gameScores"),
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(q);
    const scores = [];
    snapshot.forEach((doc) => {
      scores.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, scores };
  },

  async getUserAllHistory(userId) {
    const q = query(
      collection(db, "spellingHistory"),
      where("userId", "==", userId)
    );
    const snapshot = await getDocs(q);
    const history = [];
    snapshot.forEach((doc) => {
      history.push({ id: doc.id, ...doc.data() });
    });
    return { success: true, history };
  },

  calculateCurrentStreak(userId, gameScores, spellingHistory) {
    const allActivities = [
      ...gameScores.map((g) => ({
        date: g.createdAt?.toDate() || new Date(g.timestamp),
        type: "game",
      })),
      ...spellingHistory.map((h) => ({
        date: h.createdAt?.toDate() || new Date(h.timestamp),
        type: "spelling",
      })),
    ].sort((a, b) => b.date - a.date);

    if (allActivities.length === 0) return { current: 0, longest: 0 };

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const latestActivity = allActivities[0].date;
    const daysDiff = Math.floor(
      (today - latestActivity) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff <= 1) {
      const activeDays = new Set();
      allActivities.forEach((activity) => {
        const activityDay = new Date(activity.date);
        activityDay.setHours(0, 0, 0, 0);
        activeDays.add(activityDay.toDateString());
      });

      const sortedDays = Array.from(activeDays).sort(
        (a, b) => new Date(b) - new Date(a)
      );

      for (let i = 0; i < sortedDays.length; i++) {
        const expectedDate = new Date(today);
        expectedDate.setDate(expectedDate.getDate() - i);

        if (sortedDays.includes(expectedDate.toDateString())) {
          currentStreak++;
        } else {
          break;
        }
      }

      tempStreak = 1;
      for (let i = 1; i < sortedDays.length; i++) {
        const prevDay = new Date(sortedDays[i - 1]);
        const currDay = new Date(sortedDays[i]);
        const diff = Math.floor((prevDay - currDay) / (1000 * 60 * 60 * 24));

        if (diff === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak);
    }

    return {
      current: currentStreak,
      longest: Math.max(longestStreak, currentStreak),
    };
  },

  getMostCommonError(gameScores, spellingHistory) {
    const errorTypes = {};

    gameScores.forEach((game) => {
      if (game.errorTypes && Array.isArray(game.errorTypes)) {
        game.errorTypes.forEach((errorType) => {
          errorTypes[errorType] = (errorTypes[errorType] || 0) + 1;
        });
      }
    });

    spellingHistory.forEach((session) => {
      if (session.result?.grouped_analysis) {
        Object.keys(session.result.grouped_analysis).forEach((errorType) => {
          const count = session.result.grouped_analysis[errorType].count || 0;
          errorTypes[errorType] = (errorTypes[errorType] || 0) + count;
        });
      }
    });

    if (Object.keys(errorTypes).length === 0) return "None";

    return (
      Object.entries(errorTypes).sort(([, a], [, b]) => b - a)[0]?.[0] || "None"
    );
  },
};

export default AnalyticsService;
