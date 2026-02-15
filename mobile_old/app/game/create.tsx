import { View, Text, StyleSheet } from 'react-native';

export default function CreateGameScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Game</Text>
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
  },
});
