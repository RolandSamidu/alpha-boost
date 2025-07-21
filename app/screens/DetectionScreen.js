import React, { useRef, useState } from 'react';
import {
  View,
  PanResponder,
  StyleSheet,
  Dimensions,
  Button,
  Text,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { captureRef } from 'react-native-view-shot';
import * as ImageManipulator from 'expo-image-manipulator';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = 300;
const GOOGLE_VISION_API_KEY = '45ba677803b6e1329a630226aa14158bf678db8e';

const DetectionScreen = () => {
  const viewRef = useRef(null);
  const [paths, setPaths] = useState([]);
  const [currentPoints, setCurrentPoints] = useState([]);
  const [text, setText] = useState('');
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
    setText('');
  };

  const recognizeText = async () => {
    try {
      setLoading(true);
      const uri = await captureRef(viewRef, {
        format: 'png',
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
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requests: [
              {
                image: { content: manipulated.base64 },
                features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
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
        Alert.alert('No handwriting detected');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Failed to recognize handwriting');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View ref={viewRef} style={styles.canvas} {...panResponder.panHandlers}>
        <Svg height="100%" width="100%">
          {paths.map((segments, i) => (
            <Path key={i} d={segments.join(' ')} stroke="black" strokeWidth={4} fill="none" />
          ))}
          {currentPoints.length > 0 && (
            <Path d={currentPoints.join(' ')} stroke="gray" strokeWidth={4} fill="none" />
          )}
        </Svg>
      </View>

      <View style={styles.buttons}>
        <Button title="Clear" onPress={clearCanvas} />
        <Button title="Recognize" onPress={recognizeText} />
      </View>

      {loading && <ActivityIndicator size="large" color="blue" />}

      {text !== '' && (
        <View style={styles.output}>
          <Text style={styles.title}>Detected Text:</Text>
          <Text>{text}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#fff' },
  canvas: {
    width: SCREEN_WIDTH - 20,
    height: SCREEN_HEIGHT,
    borderColor: '#999',
    borderWidth: 1,
    marginBottom: 20,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  output: {
    padding: 10,
    backgroundColor: '#eef',
    borderRadius: 8,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
});

export default DetectionScreen;
