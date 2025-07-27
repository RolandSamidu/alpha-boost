import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import learningData from "../../assets/data/learningData.json";
import AppBar from "../components/AppBar";
import { audioMap } from "./audioMap";
import { imageMap } from "./imageMap";

const GOOGLE_VISION_API_KEY = "45ba677803b6e1329a630226aa14158bf678db8e";

const LearningScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [detectedWord, setDetectedWord] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageURI, setImageURI] = useState(null);
  const [sound, setSound] = useState(null);

  const currentItem = learningData[currentIndex];

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const playAudio = async () => {
    const { sound } = await Audio.Sound.createAsync(
      audioMap[currentItem.audio]
    );
    setSound(sound);
    await sound.playAsync();
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImageURI(result.assets[0].uri);
      recognizeHandwrittenWord(result.assets[0].base64);
    }
  };

  const recognizeHandwrittenWord = async (base64) => {
    setLoading(true);
    setDetectedWord("");

    try {
      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requests: [
              {
                image: { content: base64 },
                features: [{ type: "TEXT_DETECTION" }],
              },
            ],
          }),
        }
      );

      const data = await response.json();
      const text = data.responses[0]?.fullTextAnnotation?.text || "";
      const firstWord = text.split(/\s+/)[0]; // Get only the first word
      setDetectedWord(firstWord);
    } catch (error) {
      console.error(error);
      alert("Text recognition failed.");
    }

    setLoading(false);
  };

  const goToNext = () => {
    if (currentIndex < learningData.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setTypedText("");
      setDetectedWord("");
      setImageURI(null);
    } else {
      alert("You completed all words!");
    }
  };

  return (
    <View style={styles.container}>
      <AppBar title="Game Zone" showBackButton={true} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.gameCard}>
          <View style={styles.wordSection}>
            <Text style={styles.sectionTitle}>Current Word</Text>
            <Text style={styles.wordText}>{currentItem.word}</Text>
          </View>

          <View style={styles.imageSection}>
            <Image source={imageMap[currentItem.image]} style={styles.image} />
          </View>

          <TouchableOpacity style={styles.audioButton} onPress={playAudio}>
            <Ionicons name="volume-high" size={20} color="#FFFFFF" />
            <Text style={styles.audioButtonText}>Play Pronunciation</Text>
          </TouchableOpacity>

          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Type the word:</Text>
            <TextInput
              style={styles.input}
              placeholder="Type the word here..."
              value={typedText}
              onChangeText={setTypedText}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <TouchableOpacity
            style={styles.imagePickerButton}
            onPress={pickImage}
          >
            <Ionicons name="camera" size={20} color="#FFFFFF" />
            <Text style={styles.imagePickerButtonText}>
              Upload Handwriting Image
            </Text>
          </TouchableOpacity>

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={styles.loadingText}>Processing image...</Text>
            </View>
          )}

          {imageURI && (
            <View style={styles.resultSection}>
              <Image source={{ uri: imageURI }} style={styles.previewImage} />
              <View style={styles.detectedWordContainer}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                <Text style={styles.resultText}>Detected: {detectedWord}</Text>
              </View>
            </View>
          )}

          <TouchableOpacity style={styles.nextButton} onPress={goToNext}>
            <Text style={styles.nextButtonText}>Next Word</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default LearningScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  gameCard: {
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
  wordSection: {
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 8,
  },
  wordText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1F2937",
  },
  imageSection: {
    marginBottom: 20,
  },
  image: {
    width: 180,
    height: 180,
    resizeMode: "contain",
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
  },
  audioButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#8B5CF6",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 24,
    gap: 8,
  },
  audioButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  inputSection: {
    width: "100%",
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: "#374151",
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    borderWidth: 2,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    width: "100%",
    padding: 16,
    fontSize: 16,
    borderRadius: 8,
    color: "#1F2937",
  },
  imagePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3B82F6",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  imagePickerButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 8,
    color: "#6B7280",
    fontSize: 14,
  },
  resultSection: {
    alignItems: "center",
    marginVertical: 20,
    width: "100%",
  },
  previewImage: {
    width: 150,
    height: 150,
    borderRadius: 8,
    marginBottom: 12,
  },
  detectedWordContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  resultText: {
    fontSize: 16,
    color: "#1F2937",
    fontWeight: "600",
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
  nextButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
