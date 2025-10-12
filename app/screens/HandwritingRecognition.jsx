import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
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
import Svg, { Path } from "react-native-svg";
import { captureRef } from "react-native-view-shot";
import {
  extractTextFromImage,
  handleExtractTextError,
} from "../../services/apiService";

const { width: screenWidth } = Dimensions.get("window");
const CANVAS_WIDTH = screenWidth - 40;
const CANVAS_HEIGHT = 600;

const HandwritingRecognition = () => {
  const [paths, setPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);
  const [recognizedText, setRecognizedText] = useState("");
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef(null);

  const captureCanvas = async () => {
    try {
      console.log("Capturing canvas...");

      // Request media library permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Media library permission not granted");
      }

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

      // Save to DCIM folder using MediaLibrary
      const timestamp = new Date().getTime();
      const filename = `canvas_${timestamp}.png`;

      // Create asset from the captured image
      const asset = await MediaLibrary.createAssetAsync(uri);
      console.log("Image saved to DCIM/media library:", asset.uri);

      // Also save a copy to app's captured folder for internal use
      const capturedDir = `${FileSystem.documentDirectory}captured/`;
      await FileSystem.makeDirectoryAsync(capturedDir, { intermediates: true });

      const capturedImagePath = `${capturedDir}${filename}`;
      await FileSystem.copyAsync({
        from: uri,
        to: capturedImagePath,
      });

      console.log(
        "Image also saved to app captured folder:",
        capturedImagePath
      );

      // Clean up temp file
      await FileSystem.deleteAsync(uri, { idempotent: true });

      return { base64, imagePath: capturedImagePath, mediaUri: asset.uri };
    } catch (error) {
      console.error("Error capturing canvas:", error);
      throw error;
    }
  };

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
      const {
        base64: base64Image,
        imagePath,
        mediaUri,
      } = await captureCanvas();

      console.log("Captured image saved at:", imagePath);
      console.log("Image also saved to DCIM/media library:", mediaUri);

      const result = await extractTextFromImage(base64Image);
      // {extractTextFromImage
      //   "extracted_text": "JSuru",
      //   "success": true,
      //   "timestamp": "2025-10-12T13:45:29.148078"
      // }
      console.log(result, "result");
      if (result.fullText && result.fullText.trim()) {
        setRecognizedText(result.fullText.trim());
        setWords(result.words);

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
      const { title, message } = handleExtractTextError(error);
      Alert.alert(title, message, [{ text: "OK" }]);
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
      <Text style={styles.title}>Draw letters or words below</Text>

      <View style={styles.canvasContainer}>
        <View
          style={styles.canvas}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          ref={canvasRef}
        >
          <Svg
            style={styles.svgCanvas}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
          >
            {paths
              .filter((path) => Array.isArray(path) && path.length > 0)
              .map((path, pathIndex) => {
                if (path.length < 2) return null;
                const pathData = path.reduce((acc, point, index) => {
                  if (index === 0) {
                    return `M ${point.x} ${point.y}`;
                  }
                  return `${acc} L ${point.x} ${point.y}`;
                }, "");
                return (
                  <Path
                    key={`path-${pathIndex}`}
                    d={pathData}
                    stroke="#1F2937"
                    strokeWidth={4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                );
              })}

            {Array.isArray(currentPath) && currentPath.length > 1 && (
              <Path
                d={currentPath.reduce((acc, point, index) => {
                  if (index === 0) {
                    return `M ${point.x} ${point.y}`;
                  }
                  return `${acc} L ${point.x} ${point.y}`;
                }, "")}
                stroke="#10B981"
                strokeWidth={4}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            )}
          </Svg>

          {paths.length === 0 && currentPath.length === 0 && (
            <Text style={styles.canvasPlaceholder}>
              Touch and drag to write...
            </Text>
          )}
        </View>
      </View>

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

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Analyzing with AI...</Text>
        </View>
      )}

      {words.length > 0 && !loading && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Recognized Text:</Text>

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
  svgCanvas: {
    position: "absolute",
    top: 0,
    left: 0,
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
