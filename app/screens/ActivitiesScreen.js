import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import learningData from "../../assets/data/learningData.json";
import {
  checkWordsWithAPI as apiCheckWords,
  findWorkingAPI,
  handleApiError,
} from "../../services/apiService";
import AppBar from "../components/AppBar";
import LogoutButton from "../components/LogoutButton";
import PlayerNameModal from "../components/PlayerNameModal";
import AdditionGame from "../games/AdditionGame";
import LetterPhonemeGame from "../games/LetterPhonemeGame";
import OmissionGame from "../games/OmissionGame";
import SilentLettersGame from "../games/SilentLettersGame";
import TranspositionGame from "../games/TranspositionGame";
import { audioMap } from "./audioMap";
import { imageMap } from "./imageMap";

const getRandomItems = (array, count) => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const ActivitiesScreen = () => {
  const [selectedData, setSelectedData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputText, setInputText] = useState("");
  const [sound, setSound] = useState(null);
  const [inputWords, setInputWords] = useState([]);
  const [isCheckingWords, setIsCheckingWords] = useState(false);
  const [apiConnectionStatus, setApiConnectionStatus] = useState("unknown");

  const [showGameModal, setShowGameModal] = useState(false);
  const [currentGame, setCurrentGame] = useState(null);
  const [gameData, setGameData] = useState(null);
  const [apiResult, setApiResult] = useState(null);

  const [showPlayerNameModal, setShowPlayerNameModal] = useState(false);
  const [gameScoreData, setGameScoreData] = useState(null);

  useEffect(() => {
    const randomItems = getRandomItems(learningData, 3);
    setSelectedData(randomItems);
  }, []);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const playPronunciation = async () => {
    const currentItem = selectedData[currentIndex];
    if (currentItem && audioMap[currentItem.audio]) {
      const { sound } = await Audio.Sound.createAsync(
        audioMap[currentItem.audio]
      );
      setSound(sound);
      await sound.playAsync();
    }
  };

  const startGame = (gameType, suggestions) => {
    setCurrentGame(gameType);
    setGameData(suggestions);
    setShowGameModal(true);
  };

  const onGameComplete = (gameTitle, finalScore) => {
    setShowGameModal(false);
    setCurrentGame(null);
    setGameData(null);

    const errorTypes = [];
    if (apiResult && apiResult.grouped_analysis) {
      Object.keys(apiResult.grouped_analysis).forEach((errorType) => {
        if (apiResult.grouped_analysis[errorType].suggested_words?.length > 0) {
          errorTypes.push(errorType);
        }
      });
    }

    setGameScoreData({
      gameTitle,
      score: finalScore,
      errorTypes,
    });

    setShowPlayerNameModal(true);
  };

  const onScoreSaved = (savedScore) => {
    setShowPlayerNameModal(false);
    setGameScoreData(null);

    Alert.alert(
      "Score Saved!",
      `Great job, ${savedScore.playerName}!\n\nYour score of ${savedScore.score} points has been saved.\n\nCheck your progress in the Progress Tracker!`,
      [
        {
          text: "Play Another Game",
          onPress: () => showGameSelection(),
        },
        {
          text: "Done",
          style: "cancel",
        },
      ]
    );
  };

  const onScoreSaveSkipped = () => {
    setShowPlayerNameModal(false);
    setGameScoreData(null);

    Alert.alert(
      "Game Complete!",
      `Final Score: ${
        gameScoreData?.score || 0
      } points\n\nGreat job practicing your spelling!`,
      [
        {
          text: "Play Another Game",
          onPress: () => showGameSelection(),
        },
        {
          text: "Done",
          style: "cancel",
        },
      ]
    );
  };

  const showGameSelection = (result = null) => {
    const analysisResult = result || apiResult;

    if (!analysisResult || !analysisResult.grouped_analysis) {
      Alert.alert(
        "No Games Available",
        "No spelling errors found to practice with!"
      );
      return;
    }

    const { grouped_analysis } = analysisResult;
    const availableGames = [];

    if (
      grouped_analysis["Silent Letters"] &&
      grouped_analysis["Silent Letters"].suggested_words?.length > 0
    ) {
      availableGames.push({
        title: "Silent Letters Game",
        type: "silent",
        description: "Find the silent letters in words",
        suggestions: grouped_analysis["Silent Letters"].suggested_words,
      });
    }

    if (
      grouped_analysis["Transpositions"] &&
      grouped_analysis["Transpositions"].suggested_words?.length > 0
    ) {
      availableGames.push({
        title: "Word Scramble Game",
        type: "transposition",
        description: "Unscramble the letters to make words",
        suggestions: grouped_analysis["Transpositions"].suggested_words,
      });
    }

    if (
      grouped_analysis["Letter-Phoneme Correspondence"] &&
      grouped_analysis["Letter-Phoneme Correspondence"].suggested_words
        ?.length > 0
    ) {
      availableGames.push({
        title: "Phoneme Spelling Game",
        type: "phoneme",
        description: "Practice spelling with sound patterns",
        suggestions:
          grouped_analysis["Letter-Phoneme Correspondence"].suggested_words,
      });
    }

    if (
      grouped_analysis["Omission of Letters"] &&
      grouped_analysis["Omission of Letters"].suggested_words?.length > 0
    ) {
      availableGames.push({
        title: "Fill the Blanks",
        type: "omission",
        description: "Add the missing letters",
        suggestions: grouped_analysis["Omission of Letters"].suggested_words,
      });
    }

    if (
      grouped_analysis["Addition of Letters"] &&
      grouped_analysis["Addition of Letters"].suggested_words?.length > 0
    ) {
      availableGames.push({
        title: "Remove Extra Letters",
        type: "addition",
        description: "Find and remove the extra letters",
        suggestions: grouped_analysis["Addition of Letters"].suggested_words,
      });
    }

    if (availableGames.length === 0) {
      Alert.alert(
        "No Games Available",
        "Perfect spelling! No practice games needed."
      );
      return;
    }

    const gameButtons = availableGames.map((game) => ({
      text: game.title,
      onPress: () => startGame(game.type, game.suggestions),
    }));

    gameButtons.push({
      text: "Cancel",
      style: "cancel",
    });

    Alert.alert(
      "Choose a Spelling Game",
      "Select a game to practice your spelling skills:",
      gameButtons
    );
  };

  const renderCurrentGame = () => {
    if (!currentGame || !gameData) return null;
    console.log(currentGame, gameData);
    switch (currentGame) {
      case "silent":
        return (
          <SilentLettersGame
            suggestionWords={gameData}
            onGameComplete={onGameComplete}
          />
        );
      case "transposition":
        return (
          <TranspositionGame
            suggestionWords={gameData}
            onGameComplete={onGameComplete}
          />
        );
      case "phoneme":
        return (
          <LetterPhonemeGame
            suggestionWords={gameData}
            onGameComplete={onGameComplete}
          />
        );
      case "omission":
        return (
          <OmissionGame
            suggestionWords={gameData}
            onGameComplete={onGameComplete}
          />
        );
      case "addition":
        return (
          <AdditionGame
            suggestionWords={gameData}
            onGameComplete={onGameComplete}
          />
        );
      default:
        return null;
    }
  };

  const displayResults = (result, apiUrl) => {
    if (!result.success) {
      Alert.alert("Error", "Invalid API response");
      return;
    }
    console.log("Spelling Check Results:", result);
    const { summary, individual_results, grouped_analysis } = result;

    setApiResult(result);

    let message = `Spelling Check Results\n\n`;
    message += `Correct: ${summary.correct_words}/${summary.total_words} words\n`;
    message += `Accuracy: ${(summary.accuracy * 100).toFixed(1)}%\n\n`;

    if (summary.incorrect_words > 0) {
      message += `Words to improve:\n`;

      const incorrectWords = individual_results.filter((r) => !r.correct);
      incorrectWords.forEach((item) => {
        const confidence = (item.confidence * 100).toFixed(1);
        message += `"${item.word}" - ${item.max_confidence_type} (${confidence}%)\n`;
      });

      message += `\nError Analysis:\n`;
      Object.entries(grouped_analysis).forEach(([errorType, data]) => {
        message += `${errorType}: ${data.count} words (avg confidence: ${(
          data.avg_confidence * 100
        ).toFixed(1)}%)\n`;
      });

      Alert.alert("Spelling Results", message, [
        {
          text: "Play Games",
          onPress: () => showGameSelection(result),
        },
        {
          text: "OK",
          style: "cancel",
        },
      ]);
    } else {
      message += `Perfect spelling! All words are correct!\n`;
      message += `You're amazing!\n\n`;
      message += `Final Score: ${summary.final_score}\n`;

      Alert.alert("Spelling Results", message);
    }
  };

  const checkWordsWithAPI = async (words) => {
    if (!words || words.length === 0) {
      Alert.alert("No Words", "No words to check!");
      return;
    }

    try {
      setIsCheckingWords(true);

      const result = await apiCheckWords(words);
      displayResults(result.data, result.apiUrl);
    } catch (error) {
      const errorInfo = handleApiError(error);
      Alert.alert(errorInfo.title, errorInfo.message);
    } finally {
      setIsCheckingWords(false);
    }
  };

  const quickHealthCheck = async () => {
    try {
      setIsCheckingWords(true);

      const apiUrl = await findWorkingAPI();

      if (apiUrl) {
        Alert.alert(
          "API Working!",
          `Connection successful!\n\nEndpoint: ${apiUrl}\n\nYou can now check your spelling!`
        );
        setApiConnectionStatus("connected");
      } else {
        Alert.alert(
          "API Not Found",
          `Cannot connect to API server\n\nPlease:\n1. Start the API server\n2. Check network connection\n3. Update IP address in app`
        );
        setApiConnectionStatus("failed");
      }
    } catch (error) {
      Alert.alert("Health Check Failed", `Error: ${error.message}`);
    } finally {
      setIsCheckingWords(false);
    }
  };

  const goToNext = () => {
    const trimmedInput = inputText.trim();
    const newInputWords =
      trimmedInput && !inputWords.includes(trimmedInput)
        ? [...inputWords, trimmedInput]
        : inputWords;
    setInputWords(newInputWords);

    if (currentIndex < selectedData.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setInputText("");
    } else {
      if (newInputWords.length > 0) {
        Alert.alert(
          "Quiz Complete!",
          `You've completed all ${selectedData.length} questions!\n\nReady to check your spelling?`,
          [
            {
              text: "Check Now",
              onPress: () => checkWordsWithAPI(newInputWords),
            },
            {
              text: "Skip Check",
              style: "cancel",
            },
          ]
        );
      } else {
        Alert.alert("Complete!", "Well done! You completed all questions!");
      }
    }
  };

  if (selectedData.length === 0) return <Text>Loading...</Text>;

  const currentItem = selectedData[currentIndex];

  return (
    <ScrollView style={styles.container}>
      <AppBar
        title="Learning Activities"
        showBackButton={true}
        rightAction={<LogoutButton />}
      />

      <View style={styles.content}>
        <View
          style={[
            styles.statusContainer,
            apiConnectionStatus === "connected"
              ? styles.statusConnected
              : apiConnectionStatus === "failed"
              ? styles.statusFailed
              : styles.statusUnknown,
          ]}
        >
          <Ionicons
            name={
              apiConnectionStatus === "connected"
                ? "wifi"
                : apiConnectionStatus === "failed"
                ? "wifi-off"
                : "help-circle"
            }
            size={16}
            color="#FFFFFF"
          />
          <Text style={styles.statusText}>
            {apiConnectionStatus === "connected"
              ? "API Connected"
              : apiConnectionStatus === "failed"
              ? "API Offline"
              : "API Status Unknown"}
          </Text>
          <TouchableOpacity
            onPress={quickHealthCheck}
            style={styles.testButton}
          >
            <Text style={styles.testButtonText}>Test</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.progressIndicator}>
          <Text style={styles.progressText}>
            Question {currentIndex + 1} of {selectedData.length}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${((currentIndex + 1) / selectedData.length) * 100}%`,
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.activityCard}>
          <Text style={styles.wordPrompt}>Type the word for this image:</Text>

          <View style={styles.imageContainer}>
            <Image source={imageMap[currentItem.image]} style={styles.image} />
          </View>

          <TouchableOpacity
            style={styles.pronounceButton}
            onPress={playPronunciation}
          >
            <Ionicons name="volume-high" size={20} color="#FFFFFF" />
            <Text style={styles.pronounceButtonText}>
              Listen to Pronunciation
            </Text>
          </TouchableOpacity>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type the word here..."
              value={inputText}
              onChangeText={setInputText}
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.nextButton,
              isCheckingWords && styles.disabledButton,
            ]}
            onPress={goToNext}
            disabled={isCheckingWords}
          >
            {isCheckingWords ? (
              <>
                <Text style={styles.nextButtonText}>Processing...</Text>
                <Ionicons name="hourglass" size={20} color="#FFFFFF" />
              </>
            ) : (
              <>
                <Text style={styles.nextButtonText}>
                  {currentIndex < selectedData.length - 1
                    ? "Next"
                    : "Finish & Check"}
                </Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={false}
        visible={showGameModal}
        onRequestClose={() => setShowGameModal(false)}
      >
        <View style={styles.gameModalContainer}>
          <View style={styles.gameHeader}>
            <TouchableOpacity
              style={styles.closeGameButton}
              onPress={() => setShowGameModal(false)}
            >
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          {renderCurrentGame()}
        </View>
      </Modal>

      {gameScoreData && (
        <PlayerNameModal
          visible={showPlayerNameModal}
          gameTitle={gameScoreData.gameTitle}
          score={gameScoreData.score}
          errorTypes={gameScoreData.errorTypes}
          onSave={onScoreSaved}
          onCancel={onScoreSaveSkipped}
        />
      )}
    </ScrollView>
  );
};

export default ActivitiesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  statusConnected: {
    backgroundColor: "#10B981",
  },
  statusFailed: {
    backgroundColor: "#EF4444",
  },
  statusUnknown: {
    backgroundColor: "#6B7280",
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
    marginLeft: 8,
  },
  testButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  testButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  progressIndicator: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#3B82F6",
    borderRadius: 3,
  },
  activityCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  wordPrompt: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 20,
    textAlign: "center",
  },
  imageContainer: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: "contain",
    backgroundColor: "#F9FAFB",
  },
  pronounceButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#8B5CF6",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 24,
    gap: 8,
  },
  pronounceButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  inputContainer: {
    width: "100%",
    marginBottom: 24,
  },
  input: {
    borderWidth: 2,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    width: "100%",
    padding: 16,
    fontSize: 18,
    borderRadius: 12,
    textAlign: "center",
    color: "#1F2937",
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10B981",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    gap: 8,
  },
  disabledButton: {
    backgroundColor: "#9CA3AF",
    opacity: 0.7,
  },
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  gameModalContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  gameHeader: {
    backgroundColor: "#1F2937",
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    alignItems: "flex-end",
  },
  closeGameButton: {
    backgroundColor: "#EF4444",
    borderRadius: 20,
    padding: 8,
  },
});
