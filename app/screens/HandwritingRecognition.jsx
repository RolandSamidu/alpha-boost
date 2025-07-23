import React, { useState } from 'react';
import {
  View,
  Button,
  Image,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

const GOOGLE_VISION_API_KEY = '45ba677803b6e1329a630226aa14158bf678db8e';

const HandwritingRecognition = () => {
  const [image, setImage] = useState(null);
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      recognizeText(result.assets[0].base64);
    }
  };

  const recognizeText = async (base64) => {
    setLoading(true);
    setWords([]);

    try {
      const body = {
        requests: [
          {
            image: {
              content: base64,
            },
            features: [{ type: 'TEXT_DETECTION' }],
          },
        ],
      };

      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }
      );

      const result = await response.json();
      const text = result.responses[0]?.fullTextAnnotation?.text || '';
      const extractedWords = text.split(/\s+/).slice(0, 10);
      setWords(extractedWords);
    } catch (error) {
      console.error('OCR Error:', error);
      alert('Failed to detect text. Check your API key or image.');
    }

    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Button title="📷 Upload Handwriting Image" onPress={pickImage} />
      {image && <Image source={{ uri: image }} style={styles.image} />}
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          <Text style={styles.title}>Top 10 Identified Words:</Text>
          {words.map((word, index) => (
            <Text key={index} style={styles.word}>
              {index + 1}. {word}
            </Text>
          ))}
        </>
      )}
    </ScrollView>
  );
};

export default HandwritingRecognition;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  image: {
    width: 280,
    height: 280,
    marginVertical: 20,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  word: {
    fontSize: 18,
    marginVertical: 2,
  },
});
