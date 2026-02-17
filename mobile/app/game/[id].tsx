import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function GameDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View className="flex-1 bg-background p-4">
      <Text className="text-2xl font-bold text-gray-900 mb-2">Game Details</Text>
      <Text className="text-sm text-gray-500">Game ID: {id}</Text>
    </View>
  );
}
