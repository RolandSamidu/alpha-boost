import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import AppBar from "../components/AppBar";

export default function ProgressScreen() {
  const progressData = [
    {
      subject: "Handwriting",
      progress: 85,
      color: "#3B82F6",
      total: 120,
      completed: 102,
    },
    {
      subject: "Spelling",
      progress: 72,
      color: "#10B981",
      total: 80,
      completed: 58,
    },
    {
      subject: "Reading",
      progress: 94,
      color: "#8B5CF6",
      total: 60,
      completed: 56,
    },
    {
      subject: "Grammar",
      progress: 68,
      color: "#F59E0B",
      total: 100,
      completed: 68,
    },
  ];

  const achievements = [
    {
      title: "First Steps",
      description: "Complete 5 exercises",
      icon: "walk",
      earned: true,
    },
    {
      title: "Speed Demon",
      description: "Complete 10 exercises in one day",
      icon: "flash",
      earned: true,
    },
    {
      title: "Perfect Score",
      description: "Get 100% on any exercise",
      icon: "trophy",
      earned: false,
    },
    {
      title: "Consistent Learner",
      description: "7-day learning streak",
      icon: "calendar",
      earned: true,
    },
  ];

  const ProgressCard = ({ subject, progress, color, total, completed }) => (
    <View style={styles.progressCard}>
      <View style={styles.progressHeader}>
        <Text style={styles.subjectText}>{subject}</Text>
        <Text style={styles.progressPercentage}>{progress}%</Text>
      </View>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { backgroundColor: color + "20" }]}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress}%`, backgroundColor: color },
            ]}
          />
        </View>
      </View>
      <Text style={styles.progressDetails}>
        {completed} of {total} completed
      </Text>
    </View>
  );

  const AchievementCard = ({ title, description, icon, earned }) => (
    <View style={[styles.achievementCard, { opacity: earned ? 1 : 0.6 }]}>
      <View
        style={[
          styles.achievementIcon,
          { backgroundColor: earned ? "#10B981" : "#9CA3AF" },
        ]}
      >
        <Ionicons name={icon} size={24} color="#FFFFFF" />
      </View>
      <View style={styles.achievementInfo}>
        <Text style={styles.achievementTitle}>{title}</Text>
        <Text style={styles.achievementDescription}>{description}</Text>
      </View>
      {earned && <Ionicons name="checkmark-circle" size={24} color="#10B981" />}
    </View>
  );

  return (
    <View style={styles.container}>
      <AppBar title="Progress Tracker" showBackButton={true} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Overall Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>156</Text>
            <Text style={styles.statLabel}>Exercises</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>89%</Text>
            <Text style={styles.statLabel}>Average</Text>
            <Text style={styles.statLabel}>Score</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Day</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
        </View>

        {/* Subject Progress */}
        <Text style={styles.sectionTitle}>Subject Progress</Text>
        {progressData.map((item, index) => (
          <ProgressCard key={index} {...item} />
        ))}

        {/* Achievements */}
        <Text style={styles.sectionTitle}>Achievements</Text>
        {achievements.map((achievement, index) => (
          <AchievementCard key={index} {...achievement} />
        ))}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#FFFFFF",
    margin: 16,
    padding: 20,
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
  },
  progressCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  subjectText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#3B82F6",
  },
  progressBarContainer: {
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressDetails: {
    fontSize: 12,
    color: "#6B7280",
  },
  achievementCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: "#6B7280",
  },
  bottomSpacing: {
    height: 20,
  },
});
