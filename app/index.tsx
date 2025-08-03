import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import AppBar from "./components/AppBar";
import DashboardCard from "./components/DashboardCard";
import LogoutButton from "./components/LogoutButton";

export default function HomeScreen() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      // Redirect to login if not authenticated
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  // Show loading or redirect while checking auth
  if (loading || !user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const rightAction = (
    <View style={styles.rightActions}>
      <TouchableOpacity style={styles.profileButton}>
        <Ionicons name="person-circle" size={32} color="#FFFFFF" />
      </TouchableOpacity>
      <LogoutButton style={styles.logoutButton} />
    </View>
  );

  return (
    <View style={styles.container}>
      <AppBar title="Alpha Boost" rightAction={rightAction} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome back!</Text>
        </View>

        <Text style={styles.sectionTitle}>Learning Modules</Text>

        <DashboardCard
          title="Handwriting Detection"
          description="Practice your handwriting with AI feedback"
          icon="create"
          color="#3B82F6"
          onPress={() => router.push("/screens/HandwritingRecognition")}
        />

        <DashboardCard
          title="Real-time Feedback"
          description="Get instant feedback on your writing"
          icon="chatbubble-ellipses"
          color="#10B981"
          onPress={() => router.push("/screens/FeedbackScreen")}
        />

        <DashboardCard
          title="Learning Activities"
          description="Interactive exercises and challenges"
          icon="library"
          color="#8B5CF6"
          onPress={() => router.push("/screens/ActivitiesScreen")}
        />

        <DashboardCard
          title="Game Zone"
          description="Fun spelling games to improve your skills"
          icon="game-controller"
          color="#F59E0B"
          onPress={() => router.push("/screens/GameZoneScreen")}
        />

        <DashboardCard
          title="Progress Tracker"
          description="Monitor your learning journey"
          icon="analytics"
          color="#EF4444"
          onPress={() => router.push("/screens/ProgressScreen")}
        />

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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  loadingText: {
    fontSize: 18,
    color: "#6B7280",
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  profileButton: {
    padding: 4,
  },
  logoutButton: {
    marginLeft: 8,
  },
  welcomeSection: {
    padding: 20,
    paddingBottom: 10,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: "#6B7280",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  bottomSpacing: {
    height: 20,
  },
});
