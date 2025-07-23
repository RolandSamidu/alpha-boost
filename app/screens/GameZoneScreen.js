import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  Button,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import learningData from '../../assets/data/learningData.json';
import { audioMap } from './audioMap';
import { imageMap } from './imageMap';

const GOOGLE_VISION_API_KEY = '45ba677803b6e1329a630226aa14158bf678db8e';

const LearningScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [detectedWord, setDetectedWord] = useState('');
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
    const { sound } = await Audio.Sound.createAsync(audioMap[currentItem.audio]);
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
    setDetectedWord('');

    try {
      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requests: [
              {
                image: { content: base64 },
                features: [{ type: 'TEXT_DETECTION' }],
              },
            ],
          }),
        }
      );

      const data = await response.json();
      const text = data.responses[0]?.fullTextAnnotation?.text || '';
      const firstWord = text.split(/\s+/)[0]; // Get only the first word
      setDetectedWord(firstWord);
    } catch (error) {
      console.error(error);
      alert('Text recognition failed.');
    }

    setLoading(false);
  };

  const goToNext = () => {
    if (currentIndex < learningData.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setTypedText('');
      setDetectedWord('');
      setImageURI(null);
    } else {
      alert('You completed all words!');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Word: {currentItem.word}</Text>
      <Image source={imageMap[currentItem.image]} style={styles.image} />
      <Button title="🔊 Play Pronunciation" onPress={playAudio} />

      <TextInput
        style={styles.input}
        placeholder="Type the word"
        value={typedText}
        onChangeText={setTypedText}
      />

      <Button title="📷 Upload Handwriting Image" onPress={pickImage} />

      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      {imageURI && (
        <>
          <Image source={{ uri: imageURI }} style={styles.previewImage} />
          <Text style={styles.resultText}>🖋️ Detected Word: {detectedWord}</Text>
        </>
      )}

      <Button title="➡️ Next Word" onPress={goToNext} />
    </ScrollView>
  );
};

export default LearningScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  image: {
    width: 220,
    height: 220,
    marginVertical: 15,
    resizeMode: 'contain',
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    padding: 12,
    borderRadius: 8,
    width: '80%',
    marginVertical: 10,
    fontSize: 18,
  },
  previewImage: {
    width: 250,
    height: 250,
    marginTop: 10,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  resultText: {
    marginTop: 10,
    fontSize: 18,
    color: 'green',
    fontWeight: '600',
  },
});
