import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GamesStackParamList } from '../../navigation/MainNavigator';
import { usePublicGames, useMyGames } from '../../api/hooks/useGames';
import { GameListItem } from '../../types';

type Props = NativeStackScreenProps<GamesStackParamList, 'GamesList'>;

const GamesListScreen: React.FC<Props> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<'discover' | 'my'>('discover');

  const publicGamesQuery = usePublicGames();
  const myGamesQuery = useMyGames();

  const query = activeTab === 'discover' ? publicGamesQuery : myGamesQuery;
  const games = query.data?.pages.flatMap((page) => page.content) ?? [];

  const renderGameCard = ({ item }: { item: GameListItem }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('GameDetail', { gameId: item.id })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.sportBadge}>
          <Text style={styles.sportText}>{item.sport}</Text>
        </View>
        <Text style={styles.players}>
          {item.currentPlayers}/{item.maxPlayers} players
        </Text>
      </View>

      <Text style={styles.title}>{item.title}</Text>

      <View style={styles.details}>
        <Text style={styles.venue}>{item.venueName}</Text>
        <Text style={styles.dot}>•</Text>
        <Text style={styles.city}>{item.venueCity}</Text>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.date}>{item.date}</Text>
        <Text style={styles.time}>
          {item.startTime?.slice(0, 5)} - {item.endTime?.slice(0, 5)}
        </Text>
      </View>

      {item.skillLevel && (
        <View style={styles.skillBadge}>
          <Text style={styles.skillText}>{item.skillLevel}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'discover' && styles.tabActive]}
          onPress={() => setActiveTab('discover')}
        >
          <Text style={[styles.tabText, activeTab === 'discover' && styles.tabTextActive]}>
            Discover
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'my' && styles.tabActive]}
          onPress={() => setActiveTab('my')}
        >
          <Text style={[styles.tabText, activeTab === 'my' && styles.tabTextActive]}>
            My Games
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={games}
        keyExtractor={(item) => item.id}
        renderItem={renderGameCard}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={query.isLoading} onRefresh={query.refetch} />
        }
        onEndReached={() => query.hasNextPage && query.fetchNextPage()}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          query.isFetchingNextPage ? (
            <Text style={styles.loadingMore}>Loading more...</Text>
          ) : null
        }
        ListEmptyComponent={
          !query.isLoading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>
                {activeTab === 'discover' ? 'No games found' : 'No games yet'}
              </Text>
              <Text style={styles.emptyText}>
                {activeTab === 'discover'
                  ? 'Be the first to create a game!'
                  : 'Join or create a game from your bookings'}
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: '#EEF2FF',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#6366F1',
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sportBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sportText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366F1',
  },
  players: {
    fontSize: 13,
    color: '#059669',
    fontWeight: '500',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  venue: {
    fontSize: 14,
    color: '#6B7280',
  },
  dot: {
    marginHorizontal: 6,
    color: '#D1D5DB',
  },
  city: {
    fontSize: 14,
    color: '#6B7280',
  },
  cardFooter: {
    flexDirection: 'row',
    gap: 16,
  },
  date: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  time: {
    fontSize: 14,
    color: '#6B7280',
  },
  skillBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  skillText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#92400E',
  },
  loadingMore: {
    textAlign: 'center',
    padding: 16,
    color: '#6B7280',
  },
  emptyState: {
    padding: 48,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default GamesListScreen;
