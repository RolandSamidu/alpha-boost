import {
  addDoc,
  collection,
  getDocs,
  getFirestore,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import app from "../config/firebaseConfig";

const db = getFirestore(app);

const GameScoreService = {
  async saveGameScore(userId, gameData) {
    try {
      if (!userId) {
        throw new Error("User ID is required to save game score");
      }

      const scoreData = {
        userId,
        playerName: gameData.playerName || "Player",
        gameTitle: gameData.gameTitle,
        score: gameData.score,
        totalQuestions: gameData.totalQuestions || null,
        correctAnswers: gameData.totalQuestions
          ? Math.min(Math.floor(gameData.score / 10), gameData.totalQuestions)
          : null,
        formattedScore: gameData.totalQuestions
          ? `${Math.min(
              Math.floor(gameData.score / 10),
              gameData.totalQuestions
            )}/${gameData.totalQuestions}`
          : `${gameData.score} points`,
        errorTypes: gameData.errorTypes || [],
        gameType: gameData.gameType || "spelling",
        difficulty: gameData.difficulty || "normal",
        duration: gameData.duration || null, // in seconds
        createdAt: serverTimestamp(),
        timestamp: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, "gameScores"), scoreData);
      console.log("Game score saved with ID: ", docRef.id);

      return {
        success: true,
        id: docRef.id,
      };
    } catch (error) {
      console.error("Error saving game score:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  async getUserGameScores(userId, limitCount = 20) {
    try {
      if (!userId) {
        throw new Error("User ID is required to fetch game scores");
      }

      let q = query(
        collection(db, "gameScores"),
        where("userId", "==", userId)
      );

      const querySnapshot = await getDocs(q);
      const scores = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        scores.push({
          id: doc.id,
          ...data,
        });
      });

      scores.sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return bTime - aTime;
      });

      const limitedScores = limitCount ? scores.slice(0, limitCount) : scores;

      return {
        success: true,
        scores: limitedScores,
      };
    } catch (error) {
      console.error("Error fetching game scores:", error);
      return {
        success: false,
        error: error.message,
        scores: [],
      };
    }
  },

  async getUserGameStatistics(userId) {
    try {
      if (!userId) {
        throw new Error("User ID is required to fetch game statistics");
      }

      const scoresResult = await this.getUserGameScores(userId);

      if (!scoresResult.success || scoresResult.scores.length === 0) {
        return {
          success: true,
          stats: {
            totalGames: 0,
            totalScore: 0,
            averageScore: 0,
            bestScore: 0,
            gameTypeStats: {},
            errorTypeStats: {},
            recentGames: [],
          },
        };
      }

      const scores = scoresResult.scores;
      let totalScore = 0;
      let bestScore = 0;
      const gameTypeStats = {};
      const errorTypeStats = {};

      scores.forEach((game) => {
        totalScore += game.score || 0;
        if (game.score > bestScore) {
          bestScore = game.score;
        }

        const gameType = game.gameTitle || "Unknown";
        gameTypeStats[gameType] = (gameTypeStats[gameType] || 0) + 1;

        if (game.errorTypes && Array.isArray(game.errorTypes)) {
          game.errorTypes.forEach((errorType) => {
            errorTypeStats[errorType] = (errorTypeStats[errorType] || 0) + 1;
          });
        }
      });

      const averageScore = scores.length > 0 ? totalScore / scores.length : 0;

      return {
        success: true,
        stats: {
          totalGames: scores.length,
          totalScore,
          averageScore: Math.round(averageScore * 100) / 100,
          bestScore,
          gameTypeStats,
          errorTypeStats,
          recentGames: scores.slice(0, 5).map((game) => ({
            gameTitle: game.gameTitle,
            score: game.formattedScore,
            date: game.timestamp,
            errorTypes: game.errorTypes,
          })),
        },
      };
    } catch (error) {
      console.error("Error calculating game statistics:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  async getLeaderboard(gameTitle = null, limitCount = 10) {
    try {
      let q;

      if (gameTitle) {
        q = query(
          collection(db, "gameScores"),
          where("gameTitle", "==", gameTitle)
        );
      } else {
        q = query(collection(db, "gameScores"));
      }

      const querySnapshot = await getDocs(q);
      const scores = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        scores.push({
          id: doc.id,
          ...data,
        });
      });

      scores.sort((a, b) => (b.score || 0) - (a.score || 0));

      const topScores = limitCount ? scores.slice(0, limitCount) : scores;

      return {
        success: true,
        leaderboard: topScores.map((score) => ({
          playerName: score.playerName,
          score: score.formattedScore,
          gameTitle: score.gameTitle,
          date: score.timestamp,
          rawScore: score.score,
        })),
      };
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      return {
        success: false,
        error: error.message,
        leaderboard: [],
      };
    }
  },
};

export default GameScoreService;
