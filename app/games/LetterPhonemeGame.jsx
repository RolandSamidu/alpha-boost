import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const LetterPhonemeGame = ({ suggestionWords, onGameComplete }) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [gameWords, setGameWords] = useState([]);
  const [showHint, setShowHint] = useState(false);

  const speakWord = async () => {
    if (currentWord) {
      try {
        // Try Web Speech API for web browsers and some mobile browsers
        if (typeof window !== "undefined" && window.speechSynthesis) {
          // Stop any currently speaking utterance
          window.speechSynthesis.cancel();

          const utterance = new SpeechSynthesisUtterance(
            currentWord.correct_word
          );
          utterance.rate = 0.7;
          utterance.pitch = 1.0;
          utterance.volume = 1.0;
          utterance.lang = "en-US";

          utterance.onstart = () => console.log("Speech started");
          utterance.onend = () => console.log("Speech completed");
          utterance.onerror = (event) => {
            console.log("Speech error:", event.error);
            showPhoneticGuide();
          };

          window.speechSynthesis.speak(utterance);
          return;
        }

        // For mobile devices without Web Speech API, show phonetic guide with audio hint
        console.log("Web Speech API not available, showing phonetic guide");
        showPhoneticGuide();
      } catch (error) {
        console.log("Speech not available:", error);
        showPhoneticGuide();
      }
    }
  };

  const showPhoneticGuide = () => {
    const phoneticGuide = getPhoneticSpelling(currentWord.correct_word);
    Alert.alert(
      "🔊 Word Pronunciation",
      `Word: "${
        currentWord.correct_word
      }"\n\nPronounce it as: ${phoneticGuide}\n\n${getPhonemeHint(
        currentWord.correct_word
      )}\n\nSay the word out loud to practice!`,
      [
        {
          text: "Practice Speaking",
          style: "default",
          onPress: () => {
            // On mobile, provide additional guidance
            Alert.alert(
              "🗣️ Practice Tip",
              `Break it down:\n"${phoneticGuide}"\n\nSay each part slowly, then speed up!`,
              [{ text: "Got it!", style: "cancel" }]
            );
          },
        },
        {
          text: "Ready!",
          style: "cancel",
        },
      ]
    );
  };

  useEffect(() => {
    if (suggestionWords && suggestionWords.length > 0) {
      setGameWords(suggestionWords.slice(0, 5));
    }
  }, [suggestionWords]);

  const currentWord = gameWords[currentWordIndex];

  const checkAnswer = () => {
    if (!currentWord) return;

    const correctWord = currentWord.correct_word.toLowerCase();
    const userWord = userAnswer.toLowerCase().trim();

    if (userWord === correctWord) {
      setScore(score + 12);
      Alert.alert(
        "Perfect!",
        `Correct! The word is ${currentWord.correct_word}`
      );
    } else {
      Alert.alert(
        "Try Again",
        `The correct spelling is: ${currentWord.correct_word}`
      );
    }

    nextWord();
  };

  const nextWord = () => {
    if (currentWordIndex < gameWords.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
      setUserAnswer("");
      setShowHint(false);
    } else {
      onGameComplete(
        "Letter-Phoneme Game",
        score +
          (userAnswer.toLowerCase() === currentWord?.correct_word.toLowerCase()
            ? 12
            : 0)
      );
    }
  };

  const toggleHint = () => {
    setShowHint(!showHint);
  };

  const getPhonemeHint = (word) => {
    const phonemeHints = {
      ph: 'sounds like "f"',
      gh: 'can be silent or sound like "f"',
      ch: 'sounds like "k" or "ch"',
      th: "sounds like voiced or unvoiced th",
      tion: 'sounds like "shun"',
      sion: 'sounds like "zhun" or "shun"',
      ough: 'can sound like "uff", "oh", "ow", or "oo"',
    };

    for (const [pattern, hint] of Object.entries(phonemeHints)) {
      if (word.includes(pattern)) {
        return `Hint: "${pattern}" ${hint}`;
      }
    }
    return "Listen carefully to the sounds";
  };

  const getPhoneticSpelling = (word) => {
    const phoneticMap = {
      // Common words with phonetic spellings
      nation: "NAY-shun",
      grocery: "GROH-sur-ee",
      player: "PLAY-er",
      bright: "BRYTE",
      cipher: "SY-fur",
      condemn: "kuhn-DEM",
      wrinkle: "RING-kul",
      align: "uh-LYNE",
      wrought: "RAWT",
      wreath: "REETH",
      important: "im-POR-tunt",
      education: "ed-yoo-KAY-shun",
      chocolate: "CHAWK-lit",
      dinosaur: "DY-nuh-sawr",
      hospital: "HOS-pi-tul",
      vegetable: "VEJ-tuh-bul",
      sandwich: "SAND-wich",
      neighbor: "NAY-bur",
      different: "DIF-ur-unt",
      umbrella: "uhm-BREL-uh",
      question: "KWES-chun",
      furniture: "FUR-ni-chur",
      exercise: "EK-sur-syze",
      monkey: "MUNG-kee",
      captain: "KAP-tin",
      yellow: "YEL-oh",
      weather: "WETH-ur",
      window: "WIN-doh",
    };

    // Return phonetic spelling if available, otherwise create a simple one
    if (phoneticMap[word.toLowerCase()]) {
      return phoneticMap[word.toLowerCase()];
    }

    // Create a basic phonetic guide by breaking into syllables
    const syllables = word
      .toLowerCase()
      .match(/[aeiou]+[^aeiou]*|[^aeiou]+/g) || [word];
    return syllables.join("-").toUpperCase();
  };

  if (!currentWord) {
    return (
      <View style={styles.container}>
        <Text style={styles.noWordsText}>
          No letter-phoneme words available
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Sound It Out</Text>
        <Text style={styles.score}>Score: {score}</Text>
      </View>

      <View style={styles.progressContainer}>
        <Text style={styles.progress}>
          Word {currentWordIndex + 1} of {gameWords.length}
        </Text>
      </View>

      <View style={styles.gameArea}>
        <Text style={styles.instruction}>
          Listen to the pronunciation and spell the correct word:
        </Text>

        <View style={styles.soundContainer}>
          <Text style={styles.incorrectWord}>
            Common misspelling: {currentWord.incorrect_word}
          </Text>

          <TouchableOpacity
            style={styles.pronunciationButton}
            onPress={speakWord}
          >
            <Ionicons name="volume-high" size={24} color="#FFFFFF" />
            <Text style={styles.pronunciationText}>🔊 Hear pronunciation</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Your spelling:</Text>
          <TextInput
            style={styles.textInput}
            value={userAnswer}
            onChangeText={setUserAnswer}
            placeholder="Type the correct spelling..."
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {showHint && (
          <View style={styles.hintContainer}>
            <Text style={styles.hintText}>
              {getPhonemeHint(currentWord.correct_word)}
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.hintButton} onPress={toggleHint}>
          <Ionicons name="help-circle" size={20} color="#FFFFFF" />
          <Text style={styles.hintButtonText}>
            {showHint ? "Hide Hint" : "Show Hint"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.difficultyText}>
          Difficulty: {currentWord.difficulty}/5
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.checkButton,
          !userAnswer.trim() && styles.disabledButton,
        ]}
        onPress={checkAnswer}
        disabled={!userAnswer.trim()}
      >
        <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
        <Text style={styles.checkButtonText}>Check Spelling</Text>
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
    marginBottom: 20,
    color: "#374151",
  },
  soundContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  incorrectWord: {
    fontSize: 16,
    color: "#EF4444",
    marginBottom: 16,
    fontStyle: "italic",
  },
  pronunciationButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#8B5CF6",
    borderRadius: 12,
    padding: 16,
    gap: 8,
    elevation: 3,
    shadowColor: "#8B5CF6",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  pronunciationText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  inputContainer: {
    width: "100%",
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#374151",
  },
  textInput: {
    borderWidth: 2,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    backgroundColor: "#FFFFFF",
    textAlign: "center",
  },
  hintContainer: {
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    width: "100%",
  },
  hintText: {
    fontSize: 14,
    color: "#92400E",
    textAlign: "center",
    fontStyle: "italic",
  },
  hintButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F59E0B",
    borderRadius: 8,
    padding: 12,
    gap: 6,
    marginBottom: 16,
  },
  hintButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  difficultyText: {
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
  disabledButton: {
    backgroundColor: "#9CA3AF",
    opacity: 0.6,
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

export default LetterPhonemeGame;
