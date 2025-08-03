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

const AdditionGame = ({ suggestionWords, onGameComplete }) => {
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
    const currentWord = gameWords[currentWordIndex];
    if (currentWord && currentWord.correct_word) {
      await TTSHelper.speak(currentWord.correct_word);
    }
  };

  const findExtraLetters = (incorrect, correct) => {
    const extraLetters = [];
    let correctIndex = 0;

    for (let i = 0; i < incorrect.length; i++) {
      if (
        correctIndex < correct.length &&
        incorrect[i] === correct[correctIndex]
      ) {
        correctIndex++;
      } else {
        extraLetters.push(i);
      }
    }

    return extraLetters;
  };

  const checkAnswer = () => {
    const currentWord = gameWords[currentWordIndex];
    if (!currentWord) return;

    const extraLetterPositions = findExtraLetters(
      currentWord.incorrect_word,
      currentWord.correct_word
    );

    const isCorrect =
      selectedLetters.length === extraLetterPositions.length &&
      selectedLetters.every((pos) => extraLetterPositions.includes(pos));

    if (isCorrect) {
      setScore(score + 10);
      Alert.alert(
        "Excellent!",
        `Correct! You found all the extra letters.\nThe correct word is: "${currentWord.correct_word}"`
      );
    } else {
      const extraLetters = extraLetterPositions.map(
        (pos) => currentWord.incorrect_word[pos]
      );
      Alert.alert(
        "Try Again",
        `The extra letters are: ${extraLetters.join(", ")}\nCorrect word: "${
          currentWord.correct_word
        }"`
      );
    }

    nextWord();
  };

  const nextWord = () => {
    if (currentWordIndex < gameWords.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
      setSelectedLetters([]);
    } else {
      const finalScore = score + (checkCurrentAnswer() ? 10 : 0);
      onGameComplete("Extra Letters Game", finalScore);
    }
  };

  const checkCurrentAnswer = () => {
    const currentWord = gameWords[currentWordIndex];
    if (!currentWord) return false;

    const extraLetterPositions = findExtraLetters(
      currentWord.incorrect_word,
      currentWord.correct_word
    );

    return (
      selectedLetters.length === extraLetterPositions.length &&
      selectedLetters.every((pos) => extraLetterPositions.includes(pos))
    );
  };

  const toggleLetter = (index) => {
    setSelectedLetters((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  const resetSelections = () => {
    setSelectedLetters([]);
  };

  const currentWord = gameWords[currentWordIndex];

  if (!currentWord) {
    return (
      <View style={styles.container}>
        <Text style={styles.noWordsText}>No addition words available</Text>
      </View>
    );
  }

  const extraLetterPositions = findExtraLetters(
    currentWord.incorrect_word,
    currentWord.correct_word
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Remove Extra Letters</Text>
        <Text style={styles.score}>Score: {score}</Text>
      </View>

      <View style={styles.progressContainer}>
        <Text style={styles.progress}>
          Word {currentWordIndex + 1} of {gameWords.length}
        </Text>
      </View>

      <View style={styles.gameArea}>
        <Text style={styles.instruction}>
          Find and select the extra letters that shouldn&apos;t be in this word:
        </Text>

        <TouchableOpacity style={styles.speakButton} onPress={speakWord}>
          <Ionicons name="volume-high" size={20} color="#FFFFFF" />
          <Text style={styles.speakButtonText}>Hear Correct Word</Text>
        </TouchableOpacity>

        <View style={styles.wordContainer}>
          <Text style={styles.wordLabel}>Incorrect word:</Text>
          <View style={styles.letterContainer}>
            {currentWord.incorrect_word.split("").map((letter, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.letterButton,
                  selectedLetters.includes(index) && styles.selectedLetter,
                ]}
                onPress={() => toggleLetter(index)}
              >
                <Text
                  style={[
                    styles.letterText,
                    selectedLetters.includes(index) &&
                      styles.selectedLetterText,
                  ]}
                >
                  {letter}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.hintContainer}>
          <Text style={styles.hintLabel}>Correct word should be:</Text>
          <Text style={styles.correctWordHint}>
            {currentWord.correct_word.length} letters long
          </Text>
          <Text style={styles.difficultyText}>
            Difficulty: {currentWord.difficulty}/5
          </Text>
        </View>

        <View style={styles.selectionInfo}>
          <Text style={styles.selectionText}>
            Selected {selectedLetters.length} letter(s) to remove
          </Text>
          <Text style={styles.needToRemove}>
            Need to remove {extraLetterPositions.length} letter(s)
          </Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.resetButton} onPress={resetSelections}>
          <Ionicons name="refresh" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.checkButton,
            selectedLetters.length === 0 && styles.disabledButton,
          ]}
          onPress={checkAnswer}
          disabled={selectedLetters.length === 0}
        >
          <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Check Answer</Text>
        </TouchableOpacity>
      </View>
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
    marginBottom: 24,
    color: "#374151",
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
  wordContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 24,
  },
  wordLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#374151",
  },
  letterContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  letterButton: {
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    minWidth: 40,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedLetter: {
    backgroundColor: "#EF4444",
    borderColor: "#DC2626",
  },
  letterText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#374151",
  },
  selectedLetterText: {
    color: "#FFFFFF",
  },
  hintContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
    padding: 16,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
  },
  hintLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 4,
  },
  correctWordHint: {
    fontSize: 16,
    color: "#059669",
    fontWeight: "600",
    marginBottom: 8,
  },
  difficultyText: {
    fontSize: 14,
    color: "#6B7280",
  },
  selectionInfo: {
    alignItems: "center",
  },
  selectionText: {
    fontSize: 16,
    color: "#3B82F6",
    fontWeight: "600",
    marginBottom: 4,
  },
  needToRemove: {
    fontSize: 14,
    color: "#EF4444",
    fontStyle: "italic",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  resetButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6B7280",
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  checkButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#059669",
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  disabledButton: {
    backgroundColor: "#9CA3AF",
    opacity: 0.6,
  },
  buttonText: {
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

export default AdditionGame;
