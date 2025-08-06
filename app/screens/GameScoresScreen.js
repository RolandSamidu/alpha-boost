import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import GameScoreService from "../../services/gameScoreService";
import AppBar from "../components/AppBar";

const GameScoresScreen = () => {
  const { user } = useAuth();
  const [scores, setScores] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadGameScores = useCallback(async () => {
    if (!user || !user.uid) {
      setLoading(false);
      return;
    }

    try {
      const [scoresResult, statsResult] = await Promise.all([
        GameScoreService.getUserGameScores(user.uid, 10),
        GameScoreService.getUserGameStatistics(user.uid),
      ]);

      if (scoresResult.success) {
        setScores(scoresResult.scores);
      }

      if (statsResult.success) {
        setStatistics(statsResult.stats);
      }
    } catch (error) {
      console.error("Error loading game scores:", error);
      Alert.alert("Error", "Failed to load game scores");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadGameScores();
    setRefreshing(false);
  }, [loadGameScores]);

  useEffect(() => {
    loadGameScores();
  }, [loadGameScores]);

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown date";
    const date = new Date(timestamp);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  const renderScoreItem = ({ item }) => {
    return (
      <View style={styles.scoreItem}>
        <View style={styles.scoreHeader}>
          <Text style={styles.gameTitle}>{item.gameTitle}</Text>
          <Text style={styles.scoreDate}>{formatDate(item.timestamp)}</Text>
        </View>

        <View style={styles.scoreContent}>
          <Text style={styles.playerName}>Player: {item.playerName}</Text>
          <Text style={styles.scoreText}>Score: {item.formattedScore}</Text>

          {item.errorTypes && item.errorTypes.length > 0 && (
            <View style={styles.errorTypesContainer}>
              <Text style={styles.errorTypesTitle}>Error Types Practiced:</Text>
              {item.errorTypes.map((errorType, index) => (
                <Text key={index} style={styles.errorType}>
                  • {errorType}
                </Text>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderStatistics = () => {
    if (!statistics) return null;

    return (
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Game Statistics</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{statistics.totalGames}</Text>
            <Text style={styles.statLabel}>Games Played</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{statistics.averageScore}</Text>
            <Text style={styles.statLabel}>Avg Score</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{statistics.bestScore}</Text>
            <Text style={styles.statLabel}>Best Score</Text>
          </View>
        </View>

        {Object.keys(statistics.gameTypeStats).length > 0 && (
          <View style={styles.gameTypesContainer}>
            <Text style={styles.gameTypesTitle}>Games Played:</Text>
            {Object.entries(statistics.gameTypeStats).map(
              ([gameType, count]) => (
                <Text key={gameType} style={styles.gameTypeItem}>
                  • {gameType}: {count} times
                </Text>
              )
            )}
          </View>
        )}
      </View>
    );
  };

  if (!user) {
    return (
      <ScrollView style={styles.container}>
        <AppBar title="Game Scores" showBackButton={true} />
        <View style={styles.notLoggedInContainer}>
          <Text style={styles.notLoggedInTitle}>Please Log In</Text>
          <Text style={styles.notLoggedInText}>
            You need to be logged in to view your game scores.
          </Text>
        </View>
      </ScrollView>
    );
  }

  if (loading) {
    return (
      <ScrollView style={styles.container}>
        <AppBar title="Game Scores" showBackButton={true} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your scores...</Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <AppBar title="Game Scores" showBackButton={true} />

      <View style={styles.content}>
        {renderStatistics()}

        <View style={styles.scoresSection}>
          <Text style={styles.sectionTitle}>Recent Games</Text>

          {scores.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No Scores Yet</Text>
              <Text style={styles.emptyText}>
                Play some games to see your scores here!
              </Text>
            </View>
          ) : (
            <FlatList
              data={scores}
              renderItem={renderScoreItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
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
    borderRadius: 12,
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
    justifyContent: "space-around",
    marginBottom: 16,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3B82F6",
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  gameTypesContainer: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 16,
  },
  gameTypesTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  gameTypeItem: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  scoresSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 16,
  },
  scoreItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingVertical: 16,
  },
  scoreHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  gameTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  scoreDate: {
    fontSize: 12,
    color: "#6B7280",
  },
  scoreContent: {
    gap: 4,
  },
  playerName: {
    fontSize: 14,
    color: "#374151",
  },
  scoreText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#10B981",
  },
  errorTypesContainer: {
    backgroundColor: "#FEF2F2",
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  errorTypesTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#991B1B",
    marginBottom: 4,
  },
  errorType: {
    fontSize: 11,
    color: "#991B1B",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  notLoggedInContainer: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  notLoggedInTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  notLoggedInText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
  },
});

export default GameScoresScreen;
