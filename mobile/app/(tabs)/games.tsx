import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { usePublicGames } from '../../src/api/hooks/useGames';
import { GameListItem } from '../../src/types';

export default function GamesScreen() {
  const { data, isLoading, refetch, hasNextPage, fetchNextPage, isFetchingNextPage } = usePublicGames();

  const games = data?.pages.flatMap((page) => page.content) ?? [];

  const renderGameCard = ({ item }: { item: GameListItem }) => (
    <TouchableOpacity
      className="bg-white rounded-2xl p-4 mb-3 shadow-sm"
      onPress={() => router.push(`/game/${item.id}`)}
    >
      <Text className="text-base font-semibold text-gray-900 mb-1">{item.title}</Text>
      <Text className="text-sm text-gray-500">{item.sport}</Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-background">
      <TouchableOpacity
        className="bg-primary m-4 p-4 rounded-xl items-center"
        onPress={() => router.push('/game/create')}
      >
        <Text className="text-white text-base font-semibold">+ Create Game</Text>
      </TouchableOpacity>

      <FlatList
        data={games}
        keyExtractor={(item) => item.id}
        renderItem={renderGameCard}
        contentContainerClassName="px-4 pb-4"
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        onEndReached={() => hasNextPage && fetchNextPage()}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? <Text className="text-center p-4 text-gray-500">Loading more...</Text> : null
        }
        ListEmptyComponent={
          !isLoading ? (
            <View className="p-12 items-center">
              <Text className="text-lg font-semibold text-gray-900 mb-2">No games available</Text>
              <Text className="text-sm text-gray-500">Create a game or join one!</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}
