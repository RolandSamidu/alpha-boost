import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import {
  Alert,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BarChart, LineChart } from "react-native-chart-kit";
import { useAuth } from "../../contexts/AuthContext";
import AnalyticsService from "../../services/analyticsService";
import AppBar from "../components/AppBar";

const { width: screenWidth } = Dimensions.get("window");
const chartWidth = screenWidth - 32;

const ProgressScreen = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState("daily");
  const [dailyData, setDailyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [overallStats, setOverallStats] = useState(null);

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);

      const [dailyResult, weeklyResult, overallResult] = await Promise.all([
        AnalyticsService.getDailyProgress(user.uid, 5),
        AnalyticsService.getWeeklyProgress(user.uid, 4),
        AnalyticsService.getUserOverallStats(user.uid),
      ]);

      if (dailyResult.success) {
        setDailyData(dailyResult.dailyData);
      }

      if (weeklyResult.success) {
        setWeeklyData(weeklyResult.weeklyData);
      }

      if (overallResult.success) {
        setOverallStats(overallResult.stats);
      }
    } catch (error) {
      console.error("Error loading analytics:", error);
      Alert.alert("Error", "Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      if (user) {
        loadAnalytics();
      }
    }, [user, loadAnalytics])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  const chartConfig = {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: "#3B82F6",
    },
  };

  const renderDailyView = () => {
    if (!dailyData || dailyData.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
          <Text style={styles.emptyStateText}>No daily data yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Start playing games to see your daily progress!
          </Text>
        </View>
      );
    }

    const labels = dailyData.map((day) =>
      new Date(day.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    );

    const gameData = dailyData.map((day) => day.gamesPlayed);
    const scoreData = dailyData.map((day) => day.totalScore);

    return (
      <View style={styles.analyticsContainer}>
        <Text style={styles.sectionTitle}>Daily Progress (Last 5 Days)</Text>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Games Played Daily</Text>
          <LineChart
            data={{
              labels,
              datasets: [{ data: gameData.length > 0 ? gameData : [0] }],
            }}
            width={chartWidth}
            height={200}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Daily Score Totals</Text>
          <BarChart
            data={{
              labels,
              datasets: [{ data: scoreData.length > 0 ? scoreData : [0] }],
            }}
            width={chartWidth}
            height={200}
            chartConfig={chartConfig}
            style={styles.chart}
          />
        </View>

        <View style={styles.statsGrid}>
          {dailyData
            .slice(-3)
            .reverse()
            .map((day, index) => (
              <View key={day.date} style={styles.dayStatCard}>
                <Text style={styles.dayStatDate}>
                  {new Date(day.date).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
                <View style={styles.dayStatRow}>
                  <Ionicons name="game-controller" size={16} color="#3B82F6" />
                  <Text style={styles.dayStatText}>
                    {day.gamesPlayed} games
                  </Text>
                </View>
                <View style={styles.dayStatRow}>
                  <Ionicons name="trophy" size={16} color="#F59E0B" />
                  <Text style={styles.dayStatText}>{day.totalScore} pts</Text>
                </View>
              </View>
            ))}
        </View>
      </View>
    );
  };

  const renderWeeklyView = () => {
    if (!weeklyData || weeklyData.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="calendar" size={48} color="#D1D5DB" />
          <Text style={styles.emptyStateText}>No weekly data yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Keep playing to see weekly trends!
          </Text>
        </View>
      );
    }

    const labels = weeklyData.map(
      (week, index) => `Week ${weeklyData.length - index}`
    );
    const weeklyGames = weeklyData.map((week) => week.gamesPlayed);
    const weeklyScores = weeklyData.map((week) => week.totalScore);

    return (
      <View style={styles.analyticsContainer}>
        <Text style={styles.sectionTitle}>Weekly Progress (Last 4 Weeks)</Text>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Games Per Week</Text>
          <BarChart
            data={{
              labels,
              datasets: [{ data: weeklyGames.length > 0 ? weeklyGames : [0] }],
            }}
            width={chartWidth}
            height={200}
            chartConfig={chartConfig}
            style={styles.chart}
          />
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Weekly Score Totals</Text>
          <LineChart
            data={{
              labels,
              datasets: [
                { data: weeklyScores.length > 0 ? weeklyScores : [0] },
              ],
            }}
            width={chartWidth}
            height={200}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>

        <View style={styles.weeklyCardsContainer}>
          {weeklyData.map((week, index) => (
            <View key={week.weekStart} style={styles.weekCard}>
              <Text style={styles.weekTitle}>
                Week {weeklyData.length - index}
              </Text>
              <Text style={styles.weekDates}>
                {new Date(week.weekStart).toLocaleDateString()} -{" "}
                {new Date(week.weekEnd).toLocaleDateString()}
              </Text>

              <View style={styles.weekStats}>
                <View style={styles.weekStatItem}>
                  <Ionicons name="game-controller" size={18} color="#3B82F6" />
                  <Text style={styles.weekStatValue}>{week.gamesPlayed}</Text>
                  <Text style={styles.weekStatLabel}>Games</Text>
                </View>

                <View style={styles.weekStatItem}>
                  <Ionicons name="trophy" size={18} color="#F59E0B" />
                  <Text style={styles.weekStatValue}>{week.totalScore}</Text>
                  <Text style={styles.weekStatLabel}>Total Score</Text>
                </View>

                <View style={styles.weekStatItem}>
                  <Ionicons name="trending-up" size={18} color="#10B981" />
                  <Text style={styles.weekStatValue}>{week.averageScore}</Text>
                  <Text style={styles.weekStatLabel}>Avg Score</Text>
                </View>
              </View>

              {week.bestDay && (
                <View style={styles.weekHighlight}>
                  <Ionicons name="star" size={14} color="#8B5CF6" />
                  <Text style={styles.weekHighlightText}>
                    Best day:{" "}
                    {new Date(week.bestDay).toLocaleDateString("en-US", {
                      weekday: "short",
                    })}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderOverviewView = () => {
    if (!overallStats) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="analytics" size={48} color="#D1D5DB" />
          <Text style={styles.emptyStateText}>No data available</Text>
          <Text style={styles.emptyStateSubtext}>
            Start your learning journey!
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.analyticsContainer}>
        <Text style={styles.sectionTitle}>Overall Statistics</Text>

        <View style={styles.overviewGrid}>
          <View style={styles.overviewCard}>
            <Ionicons name="flame" size={32} color="#EF4444" />
            <Text style={styles.overviewValue}>
              {overallStats.currentStreak}
            </Text>
            <Text style={styles.overviewLabel}>Day Streak</Text>
          </View>

          <View style={styles.overviewCard}>
            <Ionicons name="trophy" size={32} color="#F59E0B" />
            <Text style={styles.overviewValue}>
              {overallStats.longestStreak}
            </Text>
            <Text style={styles.overviewLabel}>Best Streak</Text>
          </View>

          <View style={styles.overviewCard}>
            <Ionicons name="game-controller" size={32} color="#3B82F6" />
            <Text style={styles.overviewValue}>{overallStats.totalGames}</Text>
            <Text style={styles.overviewLabel}>Games Played</Text>
          </View>

          <View style={styles.overviewCard}>
            <Ionicons name="document-text" size={32} color="#8B5CF6" />
            <Text style={styles.overviewValue}>
              {overallStats.totalSpellingChecks}
            </Text>
            <Text style={styles.overviewLabel}>Spelling Checks</Text>
          </View>
        </View>

        <View style={styles.performanceContainer}>
          <Text style={styles.performanceTitle}>Performance Metrics</Text>

          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Average Game Score</Text>
            <Text style={styles.metricValue}>
              {overallStats.averageGameScore} pts
            </Text>
          </View>

          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Total Score Earned</Text>
            <Text style={styles.metricValue}>
              {overallStats.totalScore.toLocaleString()} pts
            </Text>
          </View>

          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Words Checked</Text>
            <Text style={styles.metricValue}>
              {overallStats.totalWordsChecked.toLocaleString()}
            </Text>
          </View>
        </View>

        <View style={styles.preferencesContainer}>
          <Text style={styles.preferencesTitle}>Error Analysis</Text>

          <View style={styles.preferenceItem}>
            <Ionicons name="warning" size={20} color="#F59E0B" />
            <View style={styles.preferenceText}>
              <Text style={styles.preferenceLabel}>Most Common Error</Text>
              <Text style={styles.preferenceValue}>
                {overallStats.mostCommonError}
              </Text>
            </View>
          </View>
        </View>
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
      <AppBar title="Analytics Dashboard" showBackButton={true} />

      <View style={styles.content}>
        <View style={styles.viewModeContainer}>
          <TouchableOpacity
            style={[
              styles.viewModeButton,
              viewMode === "daily" && styles.activeViewMode,
            ]}
            onPress={() => setViewMode("daily")}
          >
            <Ionicons
              name="calendar-outline"
              size={16}
              color={viewMode === "daily" ? "#FFFFFF" : "#6B7280"}
            />
            <Text
              style={[
                styles.viewModeText,
                viewMode === "daily" && styles.activeViewModeText,
              ]}
            >
              Daily
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.viewModeButton,
              viewMode === "weekly" && styles.activeViewMode,
            ]}
            onPress={() => setViewMode("weekly")}
          >
            <Ionicons
              name="calendar"
              size={16}
              color={viewMode === "weekly" ? "#FFFFFF" : "#6B7280"}
            />
            <Text
              style={[
                styles.viewModeText,
                viewMode === "weekly" && styles.activeViewModeText,
              ]}
            >
              Weekly
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.viewModeButton,
              viewMode === "overview" && styles.activeViewMode,
            ]}
            onPress={() => setViewMode("overview")}
          >
            <Ionicons
              name="analytics"
              size={16}
              color={viewMode === "overview" ? "#FFFFFF" : "#6B7280"}
            />
            <Text
              style={[
                styles.viewModeText,
                viewMode === "overview" && styles.activeViewModeText,
              ]}
            >
              Overview
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading analytics...</Text>
          </View>
        ) : (
          <>
            {viewMode === "daily" && renderDailyView()}
            {viewMode === "weekly" && renderWeeklyView()}
            {viewMode === "overview" && renderOverviewView()}
          </>
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: "#6B7280",
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
  analyticsContainer: {
    gap: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 10,
  },
  chartContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 12,
    textAlign: "center",
  },
  chart: {
    borderRadius: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  dayStatCard: {
    flex: 1,
    minWidth: "30%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
  },
  dayStatDate: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 8,
    textAlign: "center",
  },
  dayStatRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  dayStatText: {
    fontSize: 12,
    color: "#374151",
  },
  weeklyCardsContainer: {
    gap: 16,
  },
  weekCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  weekTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    textAlign: "center",
  },
  weekDates: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 16,
  },
  weekStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
  },
  weekStatItem: {
    alignItems: "center",
    gap: 4,
  },
  weekStatValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
  },
  weekStatLabel: {
    fontSize: 10,
    color: "#6B7280",
  },
  weekHighlight: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  weekHighlightText: {
    fontSize: 12,
    color: "#8B5CF6",
    fontWeight: "500",
  },
  overviewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  overviewCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  overviewValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1F2937",
    marginTop: 8,
  },
  overviewLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
    textAlign: "center",
  },
  performanceContainer: {
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
  performanceTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 16,
    textAlign: "center",
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  metricLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  metricValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  preferencesContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  preferencesTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 16,
    textAlign: "center",
  },
  preferenceItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  preferenceText: {
    flex: 1,
  },
  preferenceLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  preferenceValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginTop: 2,
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
