import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { GamesStackParamList } from '../../navigation/MainNavigator';
import { useGameDetails, useJoinGame, useLeaveGame } from '../../api/hooks/useGames';
import { useAuthStore } from '../../store/authStore';

type Props = NativeStackScreenProps<GamesStackParamList, 'GameDetail'>;

const GameDetailScreen: React.FC<Props> = ({ route }) => {
  const { gameId } = route.params;
  const { user } = useAuthStore();
  const { data: game, isLoading } = useGameDetails(gameId);
  const { mutate: joinGame, isPending: isJoining } = useJoinGame();
  const { mutate: leaveGame, isPending: isLeaving } = useLeaveGame();

  if (isLoading || !game) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  const isCreator = game.creatorId === user?.id;
  const isParticipant = game.participants?.some((p) => p.userId === user?.id);
  const isFull = game.currentPlayers >= game.maxPlayers;

  const handleJoin = () => {
    joinGame(gameId, {
      onSuccess: () => {
        Alert.alert('Joined!', 'You have joined the game');
      },
      onError: (error) => {
        Alert.alert('Error', error.message || 'Failed to join game');
      },
    });
  };

  const handleLeave = () => {
    Alert.alert('Leave Game', 'Are you sure you want to leave this game?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Leave',
        style: 'destructive',
        onPress: () => {
          leaveGame(gameId, {
            onSuccess: () => {
              Alert.alert('Left', 'You have left the game');
            },
            onError: (error) => {
              Alert.alert('Error', error.message || 'Failed to leave game');
            },
          });
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.sportBadge}>
            <Text style={styles.sportText}>{game.sport}</Text>
          </View>
          <Text style={styles.players}>
            {game.currentPlayers}/{game.maxPlayers} players
          </Text>
        </View>

        <Text style={styles.title}>{game.title}</Text>

        <View style={styles.venueCard}>
          <Text style={styles.venueName}>{game.venueName}</Text>
          <Text style={styles.venueAddress}>{game.venueAddress}</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date</Text>
            <Text style={styles.infoValue}>{game.date}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Time</Text>
            <Text style={styles.infoValue}>
              {game.startTime?.slice(0, 5)} - {game.endTime?.slice(0, 5)}
            </Text>
          </View>
          {game.skillLevel && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Skill Level</Text>
              <Text style={styles.infoValue}>{game.skillLevel}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Created by</Text>
            <Text style={styles.infoValue}>{game.creatorName || 'Unknown'}</Text>
          </View>
        </View>

        {game.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.description}>{game.description}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Players ({game.currentPlayers})</Text>
          {game.participants?.map((participant) => (
            <View key={participant.userId} style={styles.participantRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(participant.name || 'U')[0].toUpperCase()}
                </Text>
              </View>
              <Text style={styles.participantName}>
                {participant.name || 'Player'}
                {participant.userId === game.creatorId && ' (Host)'}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        {!isParticipant && !isFull && (
          <TouchableOpacity
            style={[styles.joinButton, isJoining && styles.buttonDisabled]}
            onPress={handleJoin}
            disabled={isJoining}
          >
            <Text style={styles.joinButtonText}>{isJoining ? 'Joining...' : 'Join Game'}</Text>
          </TouchableOpacity>
        )}

        {isParticipant && !isCreator && (
          <TouchableOpacity
            style={[styles.leaveButton, isLeaving && styles.buttonDisabled]}
            onPress={handleLeave}
            disabled={isLeaving}
          >
            <Text style={styles.leaveButtonText}>{isLeaving ? 'Leaving...' : 'Leave Game'}</Text>
          </TouchableOpacity>
        )}

        {isFull && !isParticipant && (
          <View style={styles.fullBadge}>
            <Text style={styles.fullText}>This game is full</Text>
          </View>
        )}

        {isCreator && (
          <View style={styles.hostBadge}>
            <Text style={styles.hostText}>You are hosting this game</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sportBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  sportText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
  },
  players: {
    fontSize: 14,
    fontWeight: '500',
    color: '#059669',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  venueCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  venueName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  venueAddress: {
    fontSize: 14,
    color: '#6B7280',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  participantName: {
    fontSize: 15,
    color: '#111827',
  },
  footer: {
    padding: 20,
    paddingBottom: 40,
  },
  joinButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  leaveButton: {
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  leaveButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  fullBadge: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  fullText: {
    color: '#991B1B',
    fontSize: 16,
    fontWeight: '500',
  },
  hostBadge: {
    backgroundColor: '#D1FAE5',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  hostText: {
    color: '#065F46',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default GameDetailScreen;
