import { Ionicons } from "@expo/vector-icons";
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
import HistoryService from "../../services/historyService";
import AppBar from "../components/AppBar";

const HistoryScreen = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadHistory = useCallback(async () => {
    if (!user || !user.uid) {
      setLoading(false);
      return;
    }

    try {
      const [historyResult, statsResult] = await Promise.all([
        HistoryService.getUserHistory(user.uid, 10),
        HistoryService.getUserStatistics(user.uid),
      ]);

      if (historyResult.success) {
        setHistory(historyResult.history);
      }

      if (statsResult.success) {
        setStatistics(statsResult.stats);
      }
    } catch (error) {
      console.error("Error loading history:", error);
      Alert.alert("Error", "Failed to load history");
    } finally {
      setLoading(false);
    }
  }, [user]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  }, [loadHistory]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

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

  const renderHistoryItem = ({ item }) => {
    const summary = item.result?.summary;
    const accuracy = summary
      ? (summary.correct_words / summary.total_words) * 100
      : 0;

    return (
      <View style={styles.historyItem}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyDate}>{formatDate(item.timestamp)}</Text>
          <View
            style={[
              styles.accuracyBadge,
              accuracy >= 80
                ? styles.excellentBadge
                : accuracy >= 60
                ? styles.goodBadge
                : styles.needsWorkBadge,
            ]}
          >
            <Text style={styles.accuracyText}>{accuracy.toFixed(0)}%</Text>
          </View>
        </View>

        <View style={styles.historyContent}>
          <Text style={styles.wordsChecked}>
            Words checked: {item.inputWords?.join(", ") || "N/A"}
          </Text>

          {summary && (
            <View style={styles.resultsContainer}>
              <Text style={styles.resultsText}>
                ✅ Correct: {summary.correct_words} | ❌ Incorrect:{" "}
                {summary.incorrect_words}
              </Text>
            </View>
          )}

          {item.result?.grouped_analysis && (
            <View style={styles.errorsContainer}>
              <Text style={styles.errorsTitle}>Error Types:</Text>
              {Object.entries(item.result.grouped_analysis).map(
                ([errorType, data]) =>
                  data.count > 0 && (
                    <Text key={errorType} style={styles.errorItem}>
                      • {errorType}: {data.count} words
                    </Text>
                  )
              )}
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
        <Text style={styles.statsTitle}>Your Statistics</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{statistics.totalSessions}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{statistics.totalWords}</Text>
            <Text style={styles.statLabel}>Words Checked</Text>
          </View>

          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {statistics.averageAccuracy.toFixed(1)}%
            </Text>
            <Text style={styles.statLabel}>Avg Accuracy</Text>
          </View>
        </View>

        {Object.keys(statistics.commonErrors).length > 0 && (
          <View style={styles.commonErrorsContainer}>
            <Text style={styles.commonErrorsTitle}>Most Common Errors:</Text>
            {Object.entries(statistics.commonErrors)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 3)
              .map(([errorType, count]) => (
                <Text key={errorType} style={styles.commonErrorItem}>
                  • {errorType}: {count} times
                </Text>
              ))}
          </View>
        )}
      </View>
    );
  };

  if (!user) {
    return (
      <ScrollView style={styles.container}>
        <AppBar title="Spelling History" showBackButton={true} />
        <View style={styles.notLoggedInContainer}>
          <Ionicons name="person-outline" size={64} color="#9CA3AF" />
          <Text style={styles.notLoggedInTitle}>Please Log In</Text>
          <Text style={styles.notLoggedInText}>
            You need to be logged in to view your spelling history.
          </Text>
        </View>
      </ScrollView>
    );
  }

  if (loading) {
    return (
      <ScrollView style={styles.container}>
        <AppBar title="Spelling History" showBackButton={true} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your history...</Text>
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
      <AppBar title="Spelling History" showBackButton={true} />

      <View style={styles.content}>
        {renderStatistics()}

        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>

          {history.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="document-text-outline"
                size={64}
                color="#9CA3AF"
              />
              <Text style={styles.emptyTitle}>No History Yet</Text>
              <Text style={styles.emptyText}>
                Start checking your spelling to see your progress here!
              </Text>
            </View>
          ) : (
            <FlatList
              data={history}
              renderItem={renderHistoryItem}
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
  commonErrorsContainer: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 16,
  },
  commonErrorsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  commonErrorItem: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  historySection: {
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
  historyItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingVertical: 16,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  historyDate: {
    fontSize: 12,
    color: "#6B7280",
  },
  accuracyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  excellentBadge: {
    backgroundColor: "#10B981",
  },
  goodBadge: {
    backgroundColor: "#F59E0B",
  },
  needsWorkBadge: {
    backgroundColor: "#EF4444",
  },
  accuracyText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  historyContent: {
    gap: 8,
  },
  wordsChecked: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "500",
  },
  resultsContainer: {
    backgroundColor: "#F3F4F6",
    padding: 8,
    borderRadius: 6,
  },
  resultsText: {
    fontSize: 12,
    color: "#374151",
  },
  errorsContainer: {
    backgroundColor: "#FEF2F2",
    padding: 8,
    borderRadius: 6,
  },
  errorsTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#991B1B",
    marginBottom: 4,
  },
  errorItem: {
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
    marginTop: 16,
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
    marginTop: 16,
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

export default HistoryScreen;
