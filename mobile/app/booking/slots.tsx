import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function SlotSelectionScreen() {
  const { venueId } = useLocalSearchParams<{ venueId: string }>();

  return (
    <View className="flex-1 bg-background p-4">
      <Text className="text-2xl font-bold text-gray-900 mb-2">Select a Slot</Text>
      <Text className="text-sm text-gray-500">Venue ID: {venueId}</Text>
    </View>
  );
}
