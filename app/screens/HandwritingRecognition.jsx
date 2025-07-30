import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { captureRef } from "react-native-view-shot";

const { width: screenWidth } = Dimensions.get("window");
const CANVAS_WIDTH = screenWidth - 40;
const CANVAS_HEIGHT = 300;

// Google Vision API Configuration
const GOOGLE_VISION_API_KEY = "YOUR_API_KEY_HERE"; // Replace with your API key
const GOOGLE_VISION_API_URL = `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`;

const HandwritingRecognition = () => {
  const [paths, setPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const [recognizedText, setRecognizedText] = useState("");
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef(null);

  // Convert canvas to base64 image
  const captureCanvas = async () => {
    try {
      console.log("Capturing canvas...");
      const uri = await captureRef(canvasRef, {
        format: "png",
        quality: 0.8,
        result: "tmpfile",
      });

      console.log("Canvas captured to:", uri);

      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log("Base64 length:", base64.length);

      // Clean up temp file
      await FileSystem.deleteAsync(uri, { idempotent: true });

      return base64;
    } catch (error) {
      console.error("Error capturing canvas:", error);
      throw error;
    }
  };

  // Call Google Vision API for text detection
  const callGoogleVisionAPI = async (base64Image) => {
    // Validate API key
    if (
      !GOOGLE_VISION_API_KEY ||
      GOOGLE_VISION_API_KEY === "YOUR_API_KEY_HERE"
    ) {
      throw new Error("Please set a valid Google Vision API key");
    }

    const requestBody = {
      requests: [
        {
          image: {
            content: base64Image,
          },
          features: [
            {
              type: "TEXT_DETECTION",
              maxResults: 10,
            },
          ],
        },
      ],
    };

    console.log("Sending request to Google Vision API...");

    try {
      const response = await fetch(GOOGLE_VISION_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("Response status:", response.status);

      const responseText = await response.text();
      console.log("Raw response:", responseText);

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = JSON.parse(responseText);
          if (errorData.error) {
            errorMessage += ` - ${errorData.error.message}`;
            if (errorData.error.details) {
              errorMessage += ` Details: ${JSON.stringify(
                errorData.error.details
              )}`;
            }
          }
        } catch (_parseError) {
          errorMessage += ` - Raw response: ${responseText}`;
        }
        throw new Error(errorMessage);
      }

      const data = JSON.parse(responseText);
      console.log("Parsed response:", data);

      if (data.responses && data.responses[0]) {
        const result = data.responses[0];

        if (result.error) {
          throw new Error(`API Error: ${result.error.message}`);
        }

        // Extract text from the response
        if (result.textAnnotations && result.textAnnotations.length > 0) {
          const fullText = result.textAnnotations[0].description;
          const words = result.textAnnotations
            .slice(1)
            .map((annotation) => annotation.description);

          console.log("Extracted text:", fullText);
          console.log("Extracted words:", words);

          return {
            fullText: fullText || "",
            words: words || [],
          };
        } else {
          console.log("No text annotations found");
          return {
            fullText: "",
            words: [],
          };
        }
      }

      return { fullText: "", words: [] };
    } catch (error) {
      console.error("Google Vision API error:", error);
      throw error;
    }
  };

  // Google Vision API handwriting recognition
  const recognizeHandwriting = async () => {
    const validPaths = paths.filter(
      (path) => Array.isArray(path) && path.length > 0
    );

    if (validPaths.length === 0) {
      Alert.alert("No Drawing", "Please draw some text first!");
      return;
    }

    setLoading(true);

    try {
      // Capture the canvas as base64 image
      const base64Image = await captureCanvas();

      // Call Google Vision API
      const result = await callGoogleVisionAPI(base64Image);

      if (result.fullText && result.fullText.trim()) {
        setRecognizedText(result.fullText.trim());
        setWords(
          result.words.length > 0
            ? result.words
            : result.fullText.trim().split(" ")
        );

        Alert.alert(
          "Recognition Complete!",
          `Detected text: "${result.fullText.trim()}"`,
          [{ text: "OK" }]
        );
      } else {
        setRecognizedText("");
        setWords([]);
        Alert.alert(
          "No Text Found",
          "Could not detect any text in your drawing. Try writing more clearly with darker strokes.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error("Recognition error:", error);
      Alert.alert(
        "Recognition Error",
        `Failed to recognize text: ${error.message}. Please check your internet connection and API key.`,
        [{ text: "OK" }]
      );
    } finally {
      setLoading(false);
    }
  };

  const clearCanvas = () => {
    setPaths([]);
    setCurrentPath([]);
    setRecognizedText("");
    setWords([]);
  };

  const handleTouchStart = (event) => {
    const { locationX, locationY } = event.nativeEvent;
    if (
      locationX != null &&
      locationY != null &&
      locationX >= 0 &&
      locationY >= 0
    ) {
      const newPoint = { x: locationX, y: locationY };
      setCurrentPath([newPoint]);
      setIsDrawing(true);
    }
  };

  const handleTouchMove = (event) => {
    if (!isDrawing) return;

    const { locationX, locationY } = event.nativeEvent;
    if (
      locationX != null &&
      locationY != null &&
      locationX >= 0 &&
      locationY >= 0
    ) {
      const newPoint = { x: locationX, y: locationY };
      setCurrentPath((prev) => {
        if (Array.isArray(prev)) {
          return [...prev, newPoint];
        }
        return [newPoint];
      });
    }
  };

  const handleTouchEnd = () => {
    if (Array.isArray(currentPath) && currentPath.length > 0 && isDrawing) {
      setPaths((prev) => {
        const validPaths = prev.filter(
          (path) => Array.isArray(path) && path.length > 0
        );
        return [...validPaths, currentPath];
      });
      setCurrentPath([]);
    }
    setIsDrawing(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>✍️ AI Handwriting Recognition</Text>
      <Text style={styles.subtitle}>Draw letters or words below:</Text>

      {/* Drawing Canvas */}
      <View style={styles.canvasContainer}>
        <View
          style={styles.canvas}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          ref={canvasRef}
        >
          {/* Render completed paths as dots */}
          {paths
            .filter((path) => Array.isArray(path) && path.length > 0)
            .map((path, pathIndex) =>
              path.map((point, pointIndex) => (
                <View
                  key={`${pathIndex}-${pointIndex}`}
                  style={[
                    styles.drawingDot,
                    {
                      left: point.x - 2,
                      top: point.y - 2,
                    },
                  ]}
                />
              ))
            )}

          {/* Render current path being drawn */}
          {Array.isArray(currentPath) &&
            currentPath.map((point, index) => (
              <View
                key={`current-${index}`}
                style={[
                  styles.drawingDot,
                  styles.currentDot,
                  {
                    left: point.x - 2,
                    top: point.y - 2,
                  },
                ]}
              />
            ))}

          {paths.length === 0 && currentPath.length === 0 && (
            <Text style={styles.canvasPlaceholder}>
              Touch and drag to write...
            </Text>
          )}
        </View>
      </View>

      {/* Control Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.clearButton]}
          onPress={clearCanvas}
        >
          <Ionicons name="refresh" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Clear</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.recognizeButton]}
          onPress={recognizeHandwriting}
          disabled={loading || paths.length === 0}
        >
          <Ionicons name="cloud" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>AI Recognize</Text>
        </TouchableOpacity>
      </View>

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>
            Analyzing with Google Vision AI...
          </Text>
        </View>
      )}

      {/* Recognition Results */}
      {words.length > 0 && !loading && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>🎯 AI Recognized Text:</Text>

          <View style={styles.fullTextContainer}>
            <Text style={styles.fullTextLabel}>Detected Text:</Text>
            <Text style={styles.fullText}>{recognizedText}</Text>
          </View>

          {words.length > 1 && (
            <View style={styles.wordsSection}>
              <Text style={styles.wordsTitle}>Individual Words:</Text>
              {words.map((word, index) => (
                <View key={index} style={styles.wordContainer}>
                  <Text style={styles.wordNumber}>{index + 1}.</Text>
                  <Text style={styles.word}>{word}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>📝 How to use:</Text>
        <Text style={styles.instruction}>
          1. Draw letters or words clearly in the canvas above
        </Text>
        <Text style={styles.instruction}>
          2. Tap &quot;AI Recognize&quot; to analyze with Google Vision AI
        </Text>
        <Text style={styles.instruction}>
          3. Use &quot;Clear&quot; to start over
        </Text>
        <Text style={styles.note}>
          Note: Requires internet connection and valid Google Vision API key
        </Text>
      </View>
    </ScrollView>
  );
};

export default HandwritingRecognition;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#F8FAFC",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 20,
  },
  canvasContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  canvas: {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    overflow: "hidden",
  },
  drawingDot: {
    position: "absolute",
    width: 4,
    height: 4,
    backgroundColor: "#1F2937",
    borderRadius: 2,
  },
  currentDot: {
    backgroundColor: "#10B981",
  },
  canvasPlaceholder: {
    fontSize: 16,
    color: "#9CA3AF",
    fontStyle: "italic",
    position: "absolute",
    zIndex: -1,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  clearButton: {
    backgroundColor: "#EF4444",
  },
  recognizeButton: {
    backgroundColor: "#8B5CF6",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#6B7280",
  },
  resultsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 12,
  },
  fullTextContainer: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  fullTextLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 4,
  },
  fullText: {
    fontSize: 18,
    color: "#1F2937",
    fontWeight: "500",
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 8,
  },
  wordsSection: {
    marginTop: 8,
  },
  wordsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 8,
  },
  wordContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  wordNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8B5CF6",
    width: 25,
  },
  word: {
    fontSize: 16,
    color: "#374151",
    flex: 1,
  },
  instructionsContainer: {
    backgroundColor: "#FEF3C7",
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#92400E",
    marginBottom: 8,
  },
  instruction: {
    fontSize: 14,
    color: "#92400E",
    marginBottom: 4,
  },
  note: {
    fontSize: 12,
    color: "#92400E",
    fontStyle: "italic",
    marginTop: 8,
  },
});
