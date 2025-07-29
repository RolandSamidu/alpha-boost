import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const OmissionGame = ({ suggestionWords, onGameComplete }) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [gameWords, setGameWords] = useState([]);
  const [missingLetters, setMissingLetters] = useState([]);

  useEffect(() => {
    if (suggestionWords && suggestionWords.length > 0) {
      setGameWords(suggestionWords.slice(0, 5));
    }
  }, [suggestionWords]);

  useEffect(() => {
    if (gameWords[currentWordIndex]) {
      findMissingLetters();
    }
  }, [currentWordIndex, gameWords, findMissingLetters]);

  const findMissingLetters = useCallback(() => {
    const currentWord = gameWords[currentWordIndex];
    if (!currentWord) return;

    const correct = currentWord.correct_word;
    const incorrect = currentWord.incorrect_word;
    const missing = [];

    let correctIndex = 0;
    let incorrectIndex = 0;

    while (correctIndex < correct.length) {
      if (
        incorrectIndex >= incorrect.length ||
        correct[correctIndex] !== incorrect[incorrectIndex]
      ) {
        missing.push({
          letter: correct[correctIndex],
          position: correctIndex,
        });
        correctIndex++;
      } else {
        correctIndex++;
        incorrectIndex++;
      }
    }

    setMissingLetters(missing);
    setUserAnswer("");
  }, [currentWordIndex, gameWords]);

  const getWordWithBlanks = () => {
    const currentWord = gameWords[currentWordIndex];
    if (!currentWord) return "";

    let wordWithBlanks = currentWord.correct_word;
    missingLetters.forEach(({ position }) => {
      wordWithBlanks =
        wordWithBlanks.substring(0, position) +
        "_" +
        wordWithBlanks.substring(position + 1);
    });
    return wordWithBlanks;
  };

  const checkAnswer = () => {
    const currentWord = gameWords[currentWordIndex];
    if (!currentWord) return;

    const userLetters = userAnswer.toLowerCase().split("");
    const correctMissingLetters = missingLetters.map((m) =>
      m.letter.toLowerCase()
    );

    const isCorrect =
      userLetters.length === correctMissingLetters.length &&
      userLetters.every(
        (letter, index) => letter === correctMissingLetters[index]
      );

    if (isCorrect) {
      setScore(score + 10);
      Alert.alert(
        "Great!",
        `Correct! The missing letters were: ${correctMissingLetters.join(", ")}`
      );
    } else {
      Alert.alert(
        "Try Again",
        `The missing letters are: ${correctMissingLetters.join(
          ", "
        )}\nCorrect word: ${currentWord.correct_word}`
      );
    }

    nextWord();
  };

  const nextWord = () => {
    if (currentWordIndex < gameWords.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    } else {
      onGameComplete(
        "Missing Letters Game",
        score + (checkCurrentAnswer() ? 10 : 0)
      );
    }
  };

  const checkCurrentAnswer = () => {
    const currentWord = gameWords[currentWordIndex];
    if (!currentWord) return false;

    const userLetters = userAnswer.toLowerCase().split("");
    const correctMissingLetters = missingLetters.map((m) =>
      m.letter.toLowerCase()
    );

    return (
      userLetters.length === correctMissingLetters.length &&
      userLetters.every(
        (letter, index) => letter === correctMissingLetters[index]
      )
    );
  };

  const addLetter = (letter) => {
    if (userAnswer.length < missingLetters.length) {
      setUserAnswer(userAnswer + letter);
    }
  };

  const removeLetter = () => {
    setUserAnswer(userAnswer.slice(0, -1));
  };

  const currentWord = gameWords[currentWordIndex];

  if (!currentWord) {
    return (
      <View style={styles.container}>
        <Text style={styles.noWordsText}>No omission words available</Text>
      </View>
    );
  }

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Fill the Blanks</Text>
        <Text style={styles.score}>Score: {score}</Text>
      </View>

      <View style={styles.progressContainer}>
        <Text style={styles.progress}>
          Word {currentWordIndex + 1} of {gameWords.length}
        </Text>
      </View>

      <View style={styles.gameArea}>
        <Text style={styles.instruction}>Fill in the missing letters:</Text>

        <Text style={styles.incorrectWord}>
          Common mistake: {currentWord.incorrect_word}
        </Text>

        <View style={styles.wordContainer}>
          <Text style={styles.wordWithBlanks}>{getWordWithBlanks()}</Text>
        </View>

        <View style={styles.answerContainer}>
          <Text style={styles.answerLabel}>Missing letters:</Text>
          <View style={styles.answerDisplay}>
            {userAnswer.split("").map((letter, index) => (
              <View key={index} style={styles.answerLetter}>
                <Text style={styles.answerLetterText}>{letter}</Text>
              </View>
            ))}
            {Array(Math.max(0, missingLetters.length - userAnswer.length))
              .fill(0)
              .map((_, index) => (
                <View key={`empty-${index}`} style={styles.emptySlot}>
                  <Text style={styles.emptySlotText}>?</Text>
                </View>
              ))}
          </View>
        </View>

        <Text style={styles.hint}>
          Need {missingLetters.length} letter(s) | Difficulty:{" "}
          {currentWord.difficulty}/5
        </Text>
      </View>

      <View style={styles.alphabetContainer}>
        <Text style={styles.alphabetLabel}>Tap letters:</Text>
        <View style={styles.alphabetGrid}>
          {alphabet.map((letter) => (
            <TouchableOpacity
              key={letter}
              style={styles.alphabetButton}
              onPress={() => addLetter(letter)}
            >
              <Text style={styles.alphabetButtonText}>{letter}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.removeButton} onPress={removeLetter}>
          <Ionicons name="backspace" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Remove</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.checkButton,
            userAnswer.length !== missingLetters.length &&
              styles.disabledButton,
          ]}
          onPress={checkAnswer}
          disabled={userAnswer.length !== missingLetters.length}
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
  wordContainer: {
    marginBottom: 20,
  },
  wordWithBlanks: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1F2937",
    letterSpacing: 4,
    textAlign: "center",
  },
  answerContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  answerLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#374151",
  },
  answerDisplay: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
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
  emptySlot: {
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    margin: 4,
    minWidth: 40,
    alignItems: "center",
    borderStyle: "dashed",
    borderWidth: 2,
    borderColor: "#9CA3AF",
  },
  emptySlotText: {
    fontSize: 18,
    color: "#9CA3AF",
  },
  hint: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  alphabetContainer: {
    marginBottom: 20,
  },
  alphabetLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#374151",
    textAlign: "center",
  },
  alphabetGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  alphabetButton: {
    backgroundColor: "#E5E7EB",
    borderRadius: 6,
    padding: 8,
    margin: 2,
    minWidth: 32,
    alignItems: "center",
  },
  alphabetButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#374151",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  removeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EF4444",
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

export default OmissionGame;
