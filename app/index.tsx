import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Alpha Boost</Text>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/screens/DetectionScreen')}>
        <Text style={styles.buttonText}>Handwriting & Typing Detection</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/screens/FeedbackScreen')}>
        <Text style={styles.buttonText}>Real-time Feedback</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/screens/ActivitiesScreen')}>
        <Text style={styles.buttonText}>Learning Activities</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/screens/GameZoneScreen')}>
        <Text style={styles.buttonText}>Game Zone</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/screens/ProgressScreen')}>
        <Text style={styles.buttonText}>Progress Tracker</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6FA',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#333',
  },
  button: {
    backgroundColor: '#4F8EF7',
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});
