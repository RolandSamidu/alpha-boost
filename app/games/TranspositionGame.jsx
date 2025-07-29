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

const TranspositionGame = ({ suggestionWords, onGameComplete }) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [scrambledLetters, setScrambledLetters] = useState([]);
  const [userAnswer, setUserAnswer] = useState([]);
  const [score, setScore] = useState(0);
  const [gameWords, setGameWords] = useState([]);

  useEffect(() => {
    if (suggestionWords && suggestionWords.length > 0) {
      setGameWords(suggestionWords.slice(0, 5));
    }
  }, [suggestionWords]);

  useEffect(() => {
    if (gameWords[currentWordIndex]) {
      scrambleWord();
    }
  }, [currentWordIndex, gameWords]);

  const scrambleWord = () => {
    const word = gameWords[currentWordIndex]?.correct_word;
    if (word) {
      const letters = word.split("").map((letter, index) => ({
        letter,
        originalIndex: index,
        id: Math.random(),
      }));

      // Shuffle the letters
      const shuffled = [...letters].sort(() => Math.random() - 0.5);
      setScrambledLetters(shuffled);
      setUserAnswer([]);
    }
  };

  const handleLetterPress = (letterObj) => {
    setUserAnswer([...userAnswer, letterObj]);
    setScrambledLetters(scrambledLetters.filter((l) => l.id !== letterObj.id));
  };

  const handleAnswerLetterPress = (letterObj) => {
    setScrambledLetters([...scrambledLetters, letterObj]);
    setUserAnswer(userAnswer.filter((l) => l.id !== letterObj.id));
  };

  const checkAnswer = () => {
    const currentWord = gameWords[currentWordIndex];
    if (!currentWord) return;

    const userWord = userAnswer.map((l) => l.letter).join("");
    const correctWord = currentWord.correct_word;

    if (userWord === correctWord) {
      setScore(score + 15);
      Alert.alert("Excellent!", `Correct! The word is ${correctWord}`);
    } else {
      Alert.alert("Try Again", `The correct word is: ${correctWord}`);
    }

    nextWord();
  };

  const resetWord = () => {
    scrambleWord();
  };

  const nextWord = () => {
    if (currentWordIndex < gameWords.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    } else {
      onGameComplete(
        "Transposition Game",
        score +
          (userAnswer.length ===
          gameWords[currentWordIndex]?.correct_word.length
            ? 15
            : 0)
      );
    }
  };

  const currentWord = gameWords[currentWordIndex];

  if (!currentWord) {
    return (
      <View style={styles.container}>
        <Text style={styles.noWordsText}>No transposition words available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Word Unscramble</Text>
        <Text style={styles.score}>Score: {score}</Text>
      </View>

      <View style={styles.progressContainer}>
        <Text style={styles.progress}>
          Word {currentWordIndex + 1} of {gameWords.length}
        </Text>
      </View>

      <View style={styles.gameArea}>
        <Text style={styles.instruction}>
          Unscramble the letters to make the correct word:
        </Text>

        <Text style={styles.incorrectWord}>
          Common mistake: {currentWord.incorrect_word}
        </Text>

        <View style={styles.answerArea}>
          <Text style={styles.answerLabel}>Your Answer:</Text>
          <View style={styles.answerContainer}>
            {userAnswer.map((letterObj) => (
              <TouchableOpacity
                key={letterObj.id}
                style={styles.answerLetter}
                onPress={() => handleAnswerLetterPress(letterObj)}
              >
                <Text style={styles.answerLetterText}>{letterObj.letter}</Text>
              </TouchableOpacity>
            ))}
            {userAnswer.length === 0 && (
              <Text style={styles.placeholder}>Tap letters below</Text>
            )}
          </View>
        </View>

        <View style={styles.lettersArea}>
          <Text style={styles.lettersLabel}>Available Letters:</Text>
          <View style={styles.lettersContainer}>
            {scrambledLetters.map((letterObj) => (
              <TouchableOpacity
                key={letterObj.id}
                style={styles.letterButton}
                onPress={() => handleLetterPress(letterObj)}
              >
                <Text style={styles.letterText}>{letterObj.letter}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Text style={styles.hint}>Difficulty: {currentWord.difficulty}/5</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.resetButton} onPress={resetWord}>
          <Ionicons name="refresh" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.checkButton,
            userAnswer.length !== currentWord.correct_word.length &&
              styles.disabledButton,
          ]}
          onPress={checkAnswer}
          disabled={userAnswer.length !== currentWord.correct_word.length}
        >
          <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Check</Text>
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
    marginBottom: 16,
    color: "#374151",
  },
  incorrectWord: {
    fontSize: 16,
    color: "#EF4444",
    marginBottom: 20,
    fontStyle: "italic",
  },
  answerArea: {
    width: "100%",
    marginBottom: 20,
  },
  answerLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#374151",
  },
  answerContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    minHeight: 60,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 8,
    alignItems: "center",
  },
  answerLetter: {
    backgroundColor: "#3B82F6",
    borderRadius: 8,
    padding: 12,
    margin: 4,
    minWidth: 40,
    alignItems: "center",
  },
  answerLetterText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  placeholder: {
    color: "#9CA3AF",
    fontStyle: "italic",
  },
  lettersArea: {
    width: "100%",
    marginBottom: 20,
  },
  lettersLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#374151",
  },
  lettersContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  letterButton: {
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    margin: 4,
    minWidth: 40,
    alignItems: "center",
  },
  letterText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#374151",
  },
  hint: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
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

export default TranspositionGame;
