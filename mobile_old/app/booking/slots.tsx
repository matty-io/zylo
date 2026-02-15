import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function SlotSelectionScreen() {
  const { venueId } = useLocalSearchParams<{ venueId: string }>();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a Slot</Text>
      <Text style={styles.subtitle}>Venue ID: {venueId}</Text>
      {/* TODO: Implement slot selection */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
});
