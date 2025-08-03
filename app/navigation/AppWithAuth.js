import { NavigationContainer } from "@react-navigation/native";
import { StyleSheet, Text, View } from "react-native";
import { AuthProvider, useAuth } from "../../contexts/AuthContext";
import AuthNavigator from "./AuthNavigator";
// Import your existing main navigation here
// import MainNavigator from './MainNavigator';

const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <Text style={styles.loadingText}>Loading...</Text>
  </View>
);

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  // If user is authenticated, show main app
  // If not authenticated, show auth screens
  return user ? (
    // Replace this with your existing main navigation
    <View style={styles.mainContainer}>
      <Text style={styles.welcomeText}>
        Welcome, {user.displayName || user.email}!
      </Text>
      <Text style={styles.infoText}>Your main app navigation will go here</Text>
    </View>
  ) : (
    <AuthNavigator />
  );
};

const AppWithAuth = () => {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppContent />
      </NavigationContainer>
    </AuthProvider>
  );
};

const styles = StyleSheet.create({
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
  mainContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 24,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 16,
    textAlign: "center",
  },
  infoText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
});

export default AppWithAuth;
