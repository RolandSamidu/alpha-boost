import { Ionicons } from "@expo/vector-icons";
import * as ImageManipulator from "expo-image-manipulator";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { captureRef } from "react-native-view-shot";
import AppBar from "../components/AppBar";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = 300;
const GOOGLE_VISION_API_KEY = "45ba677803b6e1329a630226aa14158bf678db8e";

const DetectionScreen = () => {
  const viewRef = useRef(null);
  const [paths, setPaths] = useState([]);
  const [currentPoints, setCurrentPoints] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        setCurrentPoints([`M${locationX},${locationY}`]);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        setCurrentPoints((prev) => [...prev, `L${locationX},${locationY}`]);
      },
      onPanResponderRelease: () => {
        setPaths((prevPaths) => [...prevPaths, currentPoints]);
        setCurrentPoints([]);
      },
    })
  ).current;

  const clearCanvas = () => {
    setPaths([]);
    setCurrentPoints([]);
    setText("");
  };

  const recognizeText = async () => {
    try {
      setLoading(true);
      const uri = await captureRef(viewRef, {
        format: "png",
        quality: 1,
      });

      const manipulated = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 800 } }],
        { base64: true }
      );

      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requests: [
              {
                image: { content: manipulated.base64 },
                features: [{ type: "DOCUMENT_TEXT_DETECTION" }],
              },
            ],
          }),
        }
      );

      const result = await response.json();
      const detected = result?.responses?.[0]?.fullTextAnnotation?.text;

      if (detected) {
        setText(detected);
      } else {
        Alert.alert("No handwriting detected");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Failed to recognize handwriting");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <AppBar title="Handwriting Detection" showBackButton={true} />

      <View style={styles.content}>
        <Text style={styles.instructionText}>
          Draw or write on the canvas below:
        </Text>

        <View style={styles.canvasContainer}>
          <View
            ref={viewRef}
            style={styles.canvas}
            {...panResponder.panHandlers}
          >
            <Svg height="100%" width="100%">
              {paths.map((segments, i) => (
                <Path
                  key={i}
                  d={segments.join(" ")}
                  stroke="#2563EB"
                  strokeWidth={3}
                  fill="none"
                />
              ))}
              {currentPoints.length > 0 && (
                <Path
                  d={currentPoints.join(" ")}
                  stroke="#94A3B8"
                  strokeWidth={3}
                  fill="none"
                />
              )}
            </Svg>
          </View>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity style={styles.clearButton} onPress={clearCanvas}>
            <Ionicons name="refresh" size={20} color="#EF4444" />
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.recognizeButton, loading && styles.disabledButton]}
            onPress={recognizeText}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="search" size={20} color="#FFFFFF" />
            )}
            <Text style={styles.recognizeButtonText}>
              {loading ? "Processing..." : "Recognize"}
            </Text>
          </TouchableOpacity>
        </View>

        {text !== "" && (
          <View style={styles.output}>
            <View style={styles.outputHeader}>
              <Ionicons name="document-text" size={20} color="#10B981" />
              <Text style={styles.outputTitle}>Detected Text:</Text>
            </View>
            <View style={styles.textResult}>
              <Text style={styles.detectedText}>{text}</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  instructionText: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 16,
  },
  canvasContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 8,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  canvas: {
    width: SCREEN_WIDTH - 48,
    height: SCREEN_HEIGHT,
    borderColor: "#E5E7EB",
    borderWidth: 2,
    borderRadius: 8,
    borderStyle: "dashed",
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 12,
  },
  clearButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FECACA",
    gap: 8,
  },
  clearButtonText: {
    color: "#EF4444",
    fontWeight: "600",
    fontSize: 16,
  },
  recognizeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  disabledButton: {
    backgroundColor: "#94A3B8",
  },
  recognizeButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  output: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  outputHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  outputTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#1F2937",
  },
  textResult: {
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 8,
    minHeight: 60,
  },
  detectedText: {
    fontSize: 16,
    color: "#1F2937",
    lineHeight: 24,
  },
});

export default DetectionScreen;
