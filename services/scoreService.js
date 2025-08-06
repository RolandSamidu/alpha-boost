class SimpleStorage {
  constructor() {
    this.storage = new Map();
    this.isWeb = typeof window !== "undefined";
  }

  async setItem(key, value) {
    try {
      if (this.isWeb && window.localStorage) {
        window.localStorage.setItem(key, value);
      } else {
        this.storage.set(key, value);
      }
    } catch (error) {
      console.warn("Storage setItem failed, using memory:", error);
      this.storage.set(key, value);
    }
  }

  async getItem(key) {
    try {
      if (this.isWeb && window.localStorage) {
        return window.localStorage.getItem(key);
      } else {
        return this.storage.get(key) || null;
      }
    } catch (error) {
      console.warn("Storage getItem failed, using memory:", error);
      return this.storage.get(key) || null;
    }
  }

  async removeItem(key) {
    try {
      if (this.isWeb && window.localStorage) {
        window.localStorage.removeItem(key);
      } else {
        this.storage.delete(key);
      }
    } catch (error) {
      console.warn("Storage removeItem failed, using memory:", error);
      this.storage.delete(key);
    }
  }
}

const storage = new SimpleStorage();
const STORAGE_KEY = "@alpha_boost_scores";

const ScoreService = {
  async saveScore(playerName, gameTitle, score, errorTypes = []) {
    try {
      const timestamp = new Date().toISOString();
      const newScore = {
        id: Date.now().toString(),
        playerName,
        gameTitle,
        score,
        errorTypes,
        timestamp,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
      };

      const existingScores = await this.getAllScores();
      const updatedScores = [newScore, ...existingScores];

      await storage.setItem(STORAGE_KEY, JSON.stringify(updatedScores));
      return newScore;
    } catch (error) {
      console.error("Error saving score:", error);
      throw error;
    }
  },

  async getAllScores() {
    try {
      const scoresJson = await storage.getItem(STORAGE_KEY);
      return scoresJson ? JSON.parse(scoresJson) : [];
    } catch (error) {
      console.error("Error getting scores:", error);
      return [];
    }
  },

  async getPlayerScores(playerName) {
    try {
      const allScores = await this.getAllScores();
      return allScores.filter(
        (score) => score.playerName.toLowerCase() === playerName.toLowerCase()
      );
    } catch (error) {
      console.error("Error getting player scores:", error);
      return [];
    }
  },

  async getTopScores(limit = 10) {
    try {
      const allScores = await this.getAllScores();
      return allScores.sort((a, b) => b.score - a.score).slice(0, limit);
    } catch (error) {
      console.error("Error getting top scores:", error);
      return [];
    }
  },

  async getPlayerStats(playerName) {
    try {
      const playerScores = await this.getPlayerScores(playerName);

      if (playerScores.length === 0) {
        return {
          totalGames: 0,
          totalScore: 0,
          averageScore: 0,
          bestScore: 0,
          errorTypeStats: {},
          gameStats: {},
        };
      }

      const totalScore = playerScores.reduce(
        (sum, score) => sum + score.score,
        0
      );
      const averageScore = Math.round(totalScore / playerScores.length);
      const bestScore = Math.max(...playerScores.map((s) => s.score));

      const errorTypeStats = {};
      playerScores.forEach((score) => {
        score.errorTypes.forEach((errorType) => {
          errorTypeStats[errorType] = (errorTypeStats[errorType] || 0) + 1;
        });
      });

      const gameStats = {};
      playerScores.forEach((score) => {
        gameStats[score.gameTitle] = (gameStats[score.gameTitle] || 0) + 1;
      });

      return {
        totalGames: playerScores.length,
        totalScore,
        averageScore,
        bestScore,
        errorTypeStats,
        gameStats,
        recentScores: playerScores.slice(0, 5),
      };
    } catch (error) {
      console.error("Error getting player stats:", error);
      return null;
    }
  },

  async clearAllScores() {
    try {
      await storage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing scores:", error);
      throw error;
    }
  },

  async savePlayerName(playerName) {
    try {
      await storage.setItem("@alpha_boost_player_name", playerName);
    } catch (error) {
      console.error("Error saving player name:", error);
      throw error;
    }
  },

  async getPlayerName() {
    try {
      const playerName = await storage.getItem("@alpha_boost_player_name");
      return playerName || "";
    } catch (error) {
      console.error("Error getting player name:", error);
      return "";
    }
  },
};

export { ScoreService };
export default ScoreService;
