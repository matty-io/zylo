import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';

const MENU_ITEMS = [
  'Edit Profile',
  'My Bookings',
  'Notifications',
  'Help & Support',
  'Privacy Policy',
];

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    await logout();
    router.replace('/auth/phone');
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="items-center p-8 bg-white">
        <View className="w-20 h-20 rounded-full bg-primary justify-center items-center mb-4">
          <Text className="text-3xl font-semibold text-white">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </Text>
        </View>
        <Text className="text-xl font-semibold text-gray-900 mb-1">{user?.name || 'User'}</Text>
        <Text className="text-sm text-gray-500">{user?.phone}</Text>
      </View>

      <View className="bg-white mt-4">
        {MENU_ITEMS.map((item) => (
          <TouchableOpacity key={item} className="p-4 border-b border-gray-100">
            <Text className="text-base text-gray-900">{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        className="m-4 p-4 bg-red-50 rounded-xl items-center"
        onPress={handleLogout}
      >
        <Text className="text-base font-semibold text-error">Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
