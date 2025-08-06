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

const HistoryService = {
  async saveResult(userId, result, inputWords) {
    try {
      if (!userId) {
        throw new Error("User ID is required to save history");
      }

      const historyData = {
        userId,
        inputWords,
        result: {
          success: result.success,
          summary: result.summary,
          individual_results: result.individual_results,
          grouped_analysis: result.grouped_analysis,
        },
        createdAt: serverTimestamp(),
        timestamp: new Date().toISOString(),
      };

      const docRef = await addDoc(
        collection(db, "spellingHistory"),
        historyData
      );
      console.log("History saved with ID: ", docRef.id);

      return {
        success: true,
        id: docRef.id,
      };
    } catch (error) {
      console.error("Error saving history:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  async getUserHistory(userId, limitCount = 20) {
    try {
      if (!userId) {
        throw new Error("User ID is required to fetch history");
      }

      let q = query(
        collection(db, "spellingHistory"),
        where("userId", "==", userId)
      );

      const querySnapshot = await getDocs(q);
      const history = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        history.push({
          id: doc.id,
          ...data,
        });
      });

      history.sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return bTime - aTime;
      });

      const limitedHistory = limitCount
        ? history.slice(0, limitCount)
        : history;

      return {
        success: true,
        history: limitedHistory,
      };
    } catch (error) {
      console.error("Error fetching history:", error);
      return {
        success: false,
        error: error.message,
        history: [],
      };
    }
  },

  async getUserStatistics(userId) {
    try {
      if (!userId) {
        throw new Error("User ID is required to fetch statistics");
      }

      const historyResult = await this.getUserHistory(userId);

      if (!historyResult.success || historyResult.history.length === 0) {
        return {
          success: true,
          stats: {
            totalSessions: 0,
            totalWords: 0,
            correctWords: 0,
            incorrectWords: 0,
            averageAccuracy: 0,
            commonErrors: {},
            recentActivity: [],
          },
        };
      }

      const history = historyResult.history;
      let totalWords = 0;
      let correctWords = 0;
      let incorrectWords = 0;
      const errorTypes = {};

      history.forEach((session) => {
        if (session.result && session.result.summary) {
          totalWords += session.result.summary.total_words || 0;
          correctWords += session.result.summary.correct_words || 0;
          incorrectWords += session.result.summary.incorrect_words || 0;

          if (session.result.grouped_analysis) {
            Object.keys(session.result.grouped_analysis).forEach(
              (errorType) => {
                const count =
                  session.result.grouped_analysis[errorType].count || 0;
                errorTypes[errorType] = (errorTypes[errorType] || 0) + count;
              }
            );
          }
        }
      });

      const averageAccuracy =
        totalWords > 0 ? (correctWords / totalWords) * 100 : 0;

      return {
        success: true,
        stats: {
          totalSessions: history.length,
          totalWords,
          correctWords,
          incorrectWords,
          averageAccuracy: Math.round(averageAccuracy * 100) / 100,
          commonErrors: errorTypes,
          recentActivity: history.slice(0, 5).map((session) => ({
            date: session.timestamp,
            wordsChecked: session.inputWords?.length || 0,
            accuracy: session.result?.summary
              ? (session.result.summary.correct_words /
                  session.result.summary.total_words) *
                100
              : 0,
          })),
        },
      };
    } catch (error) {
      console.error("Error calculating statistics:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

export default HistoryService;
