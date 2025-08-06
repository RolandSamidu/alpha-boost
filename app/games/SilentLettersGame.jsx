import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import TTSHelper from "../utils/ttsHelper";

const SilentLettersGame = ({ suggestionWords, onGameComplete }) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [score, setScore] = useState(0);
  const [gameWords, setGameWords] = useState([]);

  useEffect(() => {
    if (suggestionWords && suggestionWords.length > 0) {
      setGameWords(suggestionWords.slice(0, 5));
    }
  }, [suggestionWords]);

  useEffect(() => {
    // Initialize TTS
    TTSHelper.initialize();
  }, []);

  const speakWord = async () => {
    if (currentWord && currentWord.correct_word) {
      await TTSHelper.speak(currentWord.correct_word);
    }
  };

  const currentWord = gameWords[currentWordIndex];

  const handleLetterPress = (letter, index) => {
    if (selectedLetters.includes(index)) {
      setSelectedLetters(selectedLetters.filter((i) => i !== index));
    } else {
      setSelectedLetters([...selectedLetters, index]);
    }
  };

  const checkAnswer = () => {
    if (!currentWord) return;

    const correctWord = currentWord.correct_word;
    const incorrectWord = currentWord.incorrect_word;
    const silentLetters = [];

    for (let i = 0; i < correctWord.length; i++) {
      if (
        !incorrectWord.includes(correctWord[i]) ||
        correctWord.split(correctWord[i]).length - 1 >
          incorrectWord.split(correctWord[i]).length - 1
      ) {
        silentLetters.push(i);
      }
    }

    const isCorrect =
      silentLetters.every((index) => selectedLetters.includes(index)) &&
      selectedLetters.every((index) => silentLetters.includes(index));

    if (isCorrect) {
      setScore(score + 10);
      Alert.alert(
        "Correct!",
        `Great job! The silent letters were: ${silentLetters
          .map((i) => correctWord[i])
          .join(", ")}`
      );
    } else {
      Alert.alert(
        "Try Again",
        `The silent letters are: ${silentLetters
          .map((i) => correctWord[i])
          .join(", ")}`
      );
    }

    nextWord();
  };

  const nextWord = () => {
    if (currentWordIndex < gameWords.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
      setSelectedLetters([]);
    } else {
      onGameComplete(
        "Silent Letters Game",
        score + (selectedLetters.length > 0 ? 10 : 0),
        gameWords.length
      );
    }
  };

  if (!currentWord) {
    return (
      <View style={styles.container}>
        <Text style={styles.noWordsText}>No silent letter words available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Silent Letters Game</Text>
        <Text style={styles.score}>Score: {score}</Text>
      </View>

      <View style={styles.progressContainer}>
        <Text style={styles.progress}>
          Word {currentWordIndex + 1} of {gameWords.length}
        </Text>
      </View>

      <View style={styles.gameArea}>
        <Text style={styles.instruction}>
          Tap the silent letters in this word:
        </Text>

        <Text style={styles.incorrectWord}>
          Incorrect: &quot;{currentWord.incorrect_word}&quot;
        </Text>

        <TouchableOpacity style={styles.speakButton} onPress={speakWord}>
          <Ionicons name="volume-high" size={20} color="#FFFFFF" />
          <Text style={styles.speakButtonText}>Hear Correct Word</Text>
        </TouchableOpacity>

        <View style={styles.wordContainer}>
          {currentWord.correct_word.split("").map((letter, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.letterButton,
                selectedLetters.includes(index) && styles.selectedLetter,
              ]}
              onPress={() => handleLetterPress(letter, index)}
            >
              <Text
                style={[
                  styles.letterText,
                  selectedLetters.includes(index) && styles.selectedLetterText,
                ]}
              >
                {letter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.hint}>Difficulty: {currentWord.difficulty}/5</Text>
      </View>

      <TouchableOpacity style={styles.checkButton} onPress={checkAnswer}>
        <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
        <Text style={styles.checkButtonText}>Check Answer</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
  },
  score: {
    fontSize: 18,
    fontWeight: "600",
    color: "#059669",
  },
  progressContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  progress: {
    fontSize: 16,
    color: "#6B7280",
  },
  gameArea: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    alignItems: "center",
  },
  instruction: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 16,
    color: "#374151",
  },
  incorrectWord: {
    fontSize: 16,
    color: "#EF4444",
    marginBottom: 8,
    fontStyle: "italic",
  },
  speakButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#8B5CF6",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 6,
  },
  speakButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  correctWordSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 20,
  },
  correctWordLabel: {
    fontSize: 16,
    color: "#059669",
    fontWeight: "500",
  },
  wordContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 20,
  },
  letterButton: {
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    margin: 4,
    minWidth: 40,
    alignItems: "center",
  },
  selectedLetter: {
    backgroundColor: "#3B82F6",
  },
  letterText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#374151",
  },
  selectedLetterText: {
    color: "#FFFFFF",
  },
  hint: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  checkButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#059669",
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  checkButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  noWordsText: {
    fontSize: 16,
    textAlign: "center",
    color: "#6B7280",
    marginTop: 50,
  },
});

export default SilentLettersGame;
