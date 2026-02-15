import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../navigation/MainNavigator';
import { useAuthStore } from '../../store/authStore';
import { useUpdateProfile } from '../../api/hooks/useUser';

type Props = NativeStackScreenProps<ProfileStackParamList, 'EditProfile'>;

const SPORTS = ['BADMINTON', 'TENNIS', 'CRICKET', 'FOOTBALL', 'BASKETBALL', 'TABLE_TENNIS'];
const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata'];

const EditProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuthStore();
  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const [name, setName] = useState(user?.name || '');
  const [city, setCity] = useState(user?.city || '');
  const [preferredSports, setPreferredSports] = useState<string[]>(user?.preferredSports || []);

  const toggleSport = (sport: string) => {
    setPreferredSports((prev) =>
      prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport]
    );
  };

  const handleSave = () => {
    updateProfile(
      { name: name.trim() || undefined, city: city || undefined, preferredSports },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Profile updated successfully', [
            { text: 'OK', onPress: () => navigation.goBack() },
          ]);
        },
        onError: (error) => {
          Alert.alert('Error', error.message || 'Failed to update profile');
        },
      }
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.field}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            maxLength={100}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.readOnlyInput}>
            <Text style={styles.readOnlyText}>{user?.phone}</Text>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>City</Text>
          <View style={styles.optionsWrap}>
            {CITIES.map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.optionButton, city === c && styles.optionButtonActive]}
                onPress={() => setCity(c)}
              >
                <Text style={[styles.optionText, city === c && styles.optionTextActive]}>
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Preferred Sports</Text>
          <View style={styles.optionsWrap}>
            {SPORTS.map((sport) => (
              <TouchableOpacity
                key={sport}
                style={[
                  styles.sportButton,
                  preferredSports.includes(sport) && styles.sportButtonActive,
                ]}
                onPress={() => toggleSport(sport)}
              >
                <Text
                  style={[
                    styles.sportText,
                    preferredSports.includes(sport) && styles.sportTextActive,
                  ]}
                >
                  {sport}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, isPending && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={isPending}
        >
          <Text style={styles.buttonText}>{isPending ? 'Saving...' : 'Save Changes'}</Text>
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
  readOnlyInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  readOnlyText: {
    fontSize: 16,
    color: '#6B7280',
  },
  optionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
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
    color: '#374151',
  },
  optionTextActive: {
    color: '#FFFFFF',
  },
  sportButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  sportButtonActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#6366F1',
  },
  sportText: {
    fontSize: 14,
    color: '#374151',
  },
  sportTextActive: {
    color: '#6366F1',
    fontWeight: '500',
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

export default EditProfileScreen;
