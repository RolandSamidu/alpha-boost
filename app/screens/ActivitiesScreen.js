import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  Image,
  Button,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Audio } from "expo-av";
import learningData from "../../assets/data/learningData.json";
import { audioMap } from "./audioMap";
import { imageMap } from "./imageMap";

const ActivitiesScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputText, setInputText] = useState("");
  const [sound, setSound] = useState(null);

  const currentItem = learningData[currentIndex];

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const playPronunciation = async () => {
    const { sound } = await Audio.Sound.createAsync(
      audioMap[currentItem.audio]
    );
    setSound(sound);
    await sound.playAsync();
  };

  const goToNext = () => {
    if (currentIndex < learningData.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setInputText("");
    } else {
      alert("Well done! You completed all!");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.wordPrompt}>Type the word:</Text>
      <Image source={imageMap[currentItem.image]} style={styles.image} />
      <TouchableOpacity style={styles.button} onPress={playPronunciation}>
        <Text style={styles.buttonText}>🔊 Pronounce</Text>
      </TouchableOpacity>
      <TextInput
        style={styles.input}
        placeholder="Type here"
        value={inputText}
        onChangeText={setInputText}
      />
      <TouchableOpacity style={styles.buttonSecondary} onPress={goToNext}>
        <Text style={styles.buttonText}>Next ▶</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ActivitiesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EAF4FF",
  },
  wordPrompt: {
    fontSize: 26,
    fontWeight: "700",
    color: "#2C3E50",
    marginBottom: 12,
    textAlign: "center",
  },
  image: {
    width: 250,
    height: 250,
    marginVertical: 20,
    resizeMode: "contain",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#D0D7DE",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#007AFF",
    backgroundColor: "#fff",
    width: "90%",
    padding: 14,
    marginVertical: 16,
    fontSize: 20,
    borderRadius: 12,
    textAlign: "center",
    color: "#333",
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  button: {
    marginVertical: 12,
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    width: "70%",
    alignItems: "center",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonSecondary: {
    marginVertical: 10,
    backgroundColor: "#34C759",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    width: "70%",
    alignItems: "center",
    shadowColor: "#34C759",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: "#CCCCCC",
    shadowColor: "#999",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  successMessage: {
    color: "green",
    fontSize: 16,
    marginTop: 10,
  },
  errorMessage: {
    color: "red",
    fontSize: 16,
    marginTop: 10,
  },
});
