import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ScoreService } from "../../services/scoreService";

const PlayerNameModal = ({
  visible,
  onSave,
  onCancel,
  gameTitle,
  score,
  errorTypes,
}) => {
  const [playerName, setPlayerName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadSavedPlayerName();
    }
  }, [visible]);

  const loadSavedPlayerName = async () => {
    try {
      const savedName = await ScoreService.getPlayerName();
      setPlayerName(savedName);
    } catch (error) {
      console.error("Error loading player name:", error);
    }
  };

  const handleSave = async () => {
    if (!playerName.trim()) {
      Alert.alert(
        "Player Name Required",
        "Please enter your name to save the score."
      );
      return;
    }

    try {
      setIsLoading(true);

      const savedScore = await ScoreService.saveScore(
        playerName.trim(),
        gameTitle,
        score,
        errorTypes
      );

      await ScoreService.savePlayerName(playerName.trim());

      onSave(savedScore);
    } catch (error) {
      Alert.alert("Error", "Failed to save score. Please try again.");
      console.error("Error saving score:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    onCancel();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Ionicons name="trophy" size={32} color="#F59E0B" />
            <Text style={styles.title}>Save Your Score!</Text>
          </View>

          <View style={styles.scoreInfo}>
            <Text style={styles.gameTitle}>{gameTitle}</Text>
            <Text style={styles.scoreText}>Score: {score} points</Text>
            {errorTypes && errorTypes.length > 0 && (
              <View style={styles.errorTypesContainer}>
                <Text style={styles.errorTypesLabel}>Practiced:</Text>
                <Text style={styles.errorTypes}>{errorTypes.join(", ")}</Text>
              </View>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Enter your name:</Text>
            <TextInput
              style={styles.textInput}
              value={playerName}
              onChangeText={setPlayerName}
              placeholder="Your name"
              maxLength={20}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkip}
              disabled={isLoading}
            >
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveButton, isLoading && styles.disabledButton]}
              onPress={handleSave}
              disabled={isLoading || !playerName.trim()}
            >
              {isLoading ? (
                <Text style={styles.saveButtonText}>Saving...</Text>
              ) : (
                <>
                  <Ionicons name="save" size={20} color="#FFFFFF" />
                  <Text style={styles.saveButtonText}>Save Score</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    marginTop: 8,
  },
  scoreInfo: {
    alignItems: "center",
    marginBottom: 24,
    padding: 16,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    width: "100%",
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  scoreText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#059669",
    marginBottom: 8,
  },
  errorTypesContainer: {
    alignItems: "center",
  },
  errorTypesLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  errorTypes: {
    fontSize: 14,
    color: "#3B82F6",
    fontWeight: "500",
    textAlign: "center",
  },
  inputContainer: {
    width: "100%",
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 2,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#1F2937",
    backgroundColor: "#FFFFFF",
  },
  buttonContainer: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
  },
  skipButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#6B7280",
    alignItems: "center",
  },
  skipButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    flex: 2,
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#059669",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    backgroundColor: "#9CA3AF",
    opacity: 0.7,
  },
});

export default PlayerNameModal;
