import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ScoreService } from "../../services/scoreService";
import AppBar from "../components/AppBar";

const ProgressScreen = () => {
  const [scores, setScores] = useState([]);
  const [playerStats, setPlayerStats] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState("recent"); // 'recent', 'leaderboard', 'stats'

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const loadData = useCallback(async () => {
    try {
      const playerName = await ScoreService.getPlayerName();
      setCurrentPlayer(playerName);

      if (viewMode === "recent") {
        const allScores = await ScoreService.getAllScores();
        setScores(allScores.slice(0, 20));
      } else if (viewMode === "leaderboard") {
        const topScores = await ScoreService.getTopScores(20);
        setScores(topScores);
      }

      if (playerName) {
        const stats = await ScoreService.getPlayerStats(playerName);
        setPlayerStats(stats);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      Alert.alert("Error", "Failed to load progress data");
    }
  }, [viewMode]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const changeViewMode = (mode) => {
    setViewMode(mode);
    loadData();
  };

  const clearAllData = () => {
    Alert.alert(
      "Clear All Data",
      "Are you sure you want to delete all saved scores? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: async () => {
            try {
              await ScoreService.clearAllScores();
              setScores([]);
              setPlayerStats(null);
              Alert.alert("Success", "All scores have been cleared");
            } catch (_error) {
              Alert.alert("Error", "Failed to clear scores");
            }
          },
        },
      ]
    );
  };

  const renderScoreItem = (score, index) => (
    <View key={score.id} style={styles.scoreItem}>
      <View style={styles.scoreHeader}>
        <View style={styles.playerInfo}>
          <Ionicons name="person" size={16} color="#3B82F6" />
          <Text style={styles.playerName}>{score.playerName}</Text>
        </View>
        <Text style={styles.scoreValue}>{score.score} pts</Text>
      </View>

      <Text style={styles.gameTitle}>{score.gameTitle}</Text>

      {score.errorTypes && score.errorTypes.length > 0 && (
        <View style={styles.errorTypesContainer}>
          {score.errorTypes.map((errorType, idx) => (
            <View key={idx} style={styles.errorTypeBadge}>
              <Text style={styles.errorTypeText}>{errorType}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.scoreFooter}>
        <Text style={styles.scoreDate}>{score.date}</Text>
        <Text style={styles.scoreTime}>{score.time}</Text>
      </View>
    </View>
  );

  const renderPlayerStats = () => {
    if (!playerStats || !currentPlayer) return null;

    return (
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Your Progress - {currentPlayer}</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Ionicons name="trophy" size={24} color="#F59E0B" />
            <Text style={styles.statValue}>{playerStats.bestScore}</Text>
            <Text style={styles.statLabel}>Best Score</Text>
          </View>

          <View style={styles.statItem}>
            <Ionicons name="calculator" size={24} color="#3B82F6" />
            <Text style={styles.statValue}>{playerStats.averageScore}</Text>
            <Text style={styles.statLabel}>Average</Text>
          </View>

          <View style={styles.statItem}>
            <Ionicons name="game-controller" size={24} color="#059669" />
            <Text style={styles.statValue}>{playerStats.totalGames}</Text>
            <Text style={styles.statLabel}>Games Played</Text>
          </View>

          <View style={styles.statItem}>
            <Ionicons name="star" size={24} color="#8B5CF6" />
            <Text style={styles.statValue}>{playerStats.totalScore}</Text>
            <Text style={styles.statLabel}>Total Score</Text>
          </View>
        </View>

        {Object.keys(playerStats.errorTypeStats).length > 0 && (
          <View style={styles.errorStatsContainer}>
            <Text style={styles.errorStatsTitle}>
              Most Practiced Error Types:
            </Text>
            <View style={styles.errorStatsList}>
              {Object.entries(playerStats.errorTypeStats)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 3)
                .map(([errorType, count]) => (
                  <View key={errorType} style={styles.errorStatItem}>
                    <Text style={styles.errorStatType}>{errorType}</Text>
                    <Text style={styles.errorStatCount}>{count} times</Text>
                  </View>
                ))}
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <AppBar title="Progress Tracker" showBackButton={true} />

      <View style={styles.content}>
        {renderPlayerStats()}

        <View style={styles.viewModeContainer}>
          <TouchableOpacity
            style={[
              styles.viewModeButton,
              viewMode === "recent" && styles.activeViewMode,
            ]}
            onPress={() => changeViewMode("recent")}
          >
            <Ionicons
              name="time"
              size={16}
              color={viewMode === "recent" ? "#FFFFFF" : "#6B7280"}
            />
            <Text
              style={[
                styles.viewModeText,
                viewMode === "recent" && styles.activeViewModeText,
              ]}
            >
              Recent
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.viewModeButton,
              viewMode === "leaderboard" && styles.activeViewMode,
            ]}
            onPress={() => changeViewMode("leaderboard")}
          >
            <Ionicons
              name="podium"
              size={16}
              color={viewMode === "leaderboard" ? "#FFFFFF" : "#6B7280"}
            />
            <Text
              style={[
                styles.viewModeText,
                viewMode === "leaderboard" && styles.activeViewModeText,
              ]}
            >
              Top Scores
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.scoresContainer}>
          <View style={styles.scoresHeader}>
            <Text style={styles.scoresTitle}>
              {viewMode === "recent" ? "Recent Games" : "Leaderboard"}
            </Text>
            <TouchableOpacity onPress={clearAllData} style={styles.clearButton}>
              <Ionicons name="trash" size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>

          {scores.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="analytics" size={48} color="#D1D5DB" />
              <Text style={styles.emptyStateText}>No scores yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Play some games to start tracking your progress!
              </Text>
            </View>
          ) : (
            scores.map(renderScoreItem)
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    padding: 16,
  },
  statsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 16,
    textAlign: "center",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statItem: {
    width: "48%",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  errorStatsContainer: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 16,
  },
  errorStatsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  errorStatsList: {
    gap: 8,
  },
  errorStatItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 8,
  },
  errorStatType: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
  },
  errorStatCount: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "600",
  },
  viewModeContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  viewModeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  activeViewMode: {
    backgroundColor: "#3B82F6",
  },
  viewModeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  activeViewModeText: {
    color: "#FFFFFF",
  },
  scoresContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  scoresHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  scoresTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
  },
  clearButton: {
    padding: 8,
  },
  scoreItem: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#3B82F6",
  },
  scoreHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  playerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  playerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#059669",
  },
  gameTitle: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 8,
  },
  errorTypesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 8,
  },
  errorTypeBadge: {
    backgroundColor: "#EEF2FF",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  errorTypeText: {
    fontSize: 12,
    color: "#3730A3",
    fontWeight: "500",
  },
  scoreFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scoreDate: {
    fontSize: 12,
    color: "#6B7280",
  },
  scoreTime: {
    fontSize: 12,
    color: "#6B7280",
  },
  emptyState: {
    alignItems: "center",
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#6B7280",
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 8,
  },
});

export default ProgressScreen;
