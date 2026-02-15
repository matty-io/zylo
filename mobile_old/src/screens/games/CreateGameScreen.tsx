import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BookingsStackParamList } from '../../navigation/MainNavigator';
import { useCreateGame } from '../../api/hooks/useGames';
import { useBookingDetails } from '../../api/hooks/useBookings';

type Props = NativeStackScreenProps<BookingsStackParamList, 'CreateGame'>;

const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];
const PLAYER_COUNTS = [2, 4, 6, 8, 10, 12];

const CreateGameScreen: React.FC<Props> = ({ route, navigation }) => {
  const { bookingId } = route.params;
  const { data: booking } = useBookingDetails(bookingId);
  const { mutate: createGame, isPending } = useCreateGame();

  const [title, setTitle] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [skillLevel, setSkillLevel] = useState('All Levels');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  const handleCreate = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a game title');
      return;
    }

    createGame(
      {
        bookingId,
        title: title.trim(),
        maxPlayers,
        skillLevel,
        description: description.trim() || undefined,
        isPublic,
      },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Game created successfully!', [
            { text: 'OK', onPress: () => navigation.goBack() },
          ]);
        },
        onError: (error) => {
          Alert.alert('Error', error.message || 'Failed to create game');
        },
      }
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {booking && (
          <View style={styles.bookingCard}>
            <Text style={styles.bookingLabel}>Game for</Text>
            <Text style={styles.venueName}>{booking.venueName}</Text>
            <Text style={styles.bookingDetails}>
              {booking.date} • {booking.startTime?.slice(0, 5)} - {booking.endTime?.slice(0, 5)}
            </Text>
          </View>
        )}

        <View style={styles.field}>
          <Text style={styles.label}>Game Title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g., Sunday Badminton Doubles"
            maxLength={100}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Max Players</Text>
          <View style={styles.optionsRow}>
            {PLAYER_COUNTS.map((count) => (
              <TouchableOpacity
                key={count}
                style={[styles.optionButton, maxPlayers === count && styles.optionButtonActive]}
                onPress={() => setMaxPlayers(count)}
              >
                <Text
                  style={[styles.optionText, maxPlayers === count && styles.optionTextActive]}
                >
                  {count}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Skill Level</Text>
          <View style={styles.optionsWrap}>
            {SKILL_LEVELS.map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.skillButton,
                  skillLevel === level && styles.skillButtonActive,
                ]}
                onPress={() => setSkillLevel(level)}
              >
                <Text
                  style={[styles.skillText, skillLevel === level && styles.skillTextActive]}
                >
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Description (Optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Tell others about this game..."
            multiline
            numberOfLines={4}
            maxLength={500}
          />
        </View>

        <View style={styles.field}>
          <TouchableOpacity
            style={styles.toggleRow}
            onPress={() => setIsPublic(!isPublic)}
          >
            <View>
              <Text style={styles.toggleLabel}>Public Game</Text>
              <Text style={styles.toggleDescription}>
                Allow others to discover and join this game
              </Text>
            </View>
            <View style={[styles.toggle, isPublic && styles.toggleActive]}>
              <View style={[styles.toggleKnob, isPublic && styles.toggleKnobActive]} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, isPending && styles.buttonDisabled]}
          onPress={handleCreate}
          disabled={isPending}
        >
          {isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Create Game</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 20,
  },
  bookingCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  bookingLabel: {
    fontSize: 12,
    color: '#6366F1',
    marginBottom: 4,
  },
  venueName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  bookingDetails: {
    fontSize: 14,
    color: '#6B7280',
  },
  field: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  optionButtonActive: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  optionTextActive: {
    color: '#FFFFFF',
  },
  optionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  skillButtonActive: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  skillText: {
    fontSize: 14,
    color: '#374151',
  },
  skillTextActive: {
    color: '#FFFFFF',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
  toggleDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#D1D5DB',
    justifyContent: 'center',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: '#6366F1',
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  toggleKnobActive: {
    alignSelf: 'flex-end',
  },
  footer: {
    padding: 20,
  },
  button: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#A5B4FC',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CreateGameScreen;
