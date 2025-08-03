import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Alert, StyleSheet, TouchableOpacity } from "react-native";
import { useAuth } from "../../contexts/AuthContext";

const LogoutButton = ({ style }) => {
  const { logout, user } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      "Sign Out",
      `Are you sure you want to sign out, ${user?.displayName || "User"}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            const result = await logout();
            if (!result.success) {
              Alert.alert("Error", "Failed to sign out. Please try again.");
            }
          },
        },
      ]
    );
  };

  return (
    <TouchableOpacity
      style={[styles.logoutButton, style]}
      onPress={handleLogout}
    >
      <Ionicons name="log-out-outline" size={24} color="#EF4444" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default LogoutButton;
