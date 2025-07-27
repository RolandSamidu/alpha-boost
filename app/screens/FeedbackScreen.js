import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import AppBar from "../components/AppBar";

export default function FeedbackScreen() {
  return (
    <View style={styles.container}>
      <AppBar title="Real-time Feedback" showBackButton={true} />

      <ScrollView style={styles.content}>
        <View style={styles.feedbackCard}>
          <View style={styles.headerSection}>
            <Ionicons name="chatbubble-ellipses" size={32} color="#10B981" />
            <Text style={styles.title}>Writing Feedback</Text>
          </View>

          <Text style={styles.description}>
            Get instant feedback on your handwriting and typing to improve your
            skills.
          </Text>

          <View style={styles.comingSoonCard}>
            <Ionicons name="construct" size={48} color="#F59E0B" />
            <Text style={styles.comingSoonTitle}>Coming Soon!</Text>
            <Text style={styles.comingSoonText}>
              We&apos;re working hard to bring you real-time feedback features
              including:
            </Text>

            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.featureText}>
                  Live handwriting analysis
                </Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.featureText}>Posture detection</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.featureText}>Speed optimization</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.featureText}>Accuracy improvements</Text>
              </View>
            </View>
          </View>
        </View>
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
    padding: 16,
  },
  feedbackCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
  },
  description: {
    fontSize: 16,
    color: "#6B7280",
    lineHeight: 24,
    marginBottom: 24,
  },
  comingSoonCard: {
    backgroundColor: "#FFFBEB",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#92400E",
    marginTop: 12,
    marginBottom: 8,
  },
  comingSoonText: {
    fontSize: 14,
    color: "#78350F",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  featuresList: {
    width: "100%",
    gap: 12,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureText: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "500",
  },
});
