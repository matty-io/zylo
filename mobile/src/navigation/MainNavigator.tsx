import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, StyleSheet } from 'react-native';

// Screens
import HomeScreen from '../screens/home/HomeScreen';
import VenueDetailScreen from '../screens/venue/VenueDetailScreen';
import SlotSelectionScreen from '../screens/booking/SlotSelectionScreen';
import BookingConfirmScreen from '../screens/booking/BookingConfirmScreen';
import BookingSuccessScreen from '../screens/booking/BookingSuccessScreen';
import MyBookingsScreen from '../screens/bookings/MyBookingsScreen';
import BookingDetailScreen from '../screens/bookings/BookingDetailScreen';
import GamesListScreen from '../screens/games/GamesListScreen';
import GameDetailScreen from '../screens/games/GameDetailScreen';
import CreateGameScreen from '../screens/games/CreateGameScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';

// Types
export type HomeStackParamList = {
  HomeMain: undefined;
  VenueDetail: { venueId: string };
  SlotSelection: { venueId: string };
  BookingConfirm: { slotId: string };
  BookingSuccess: { bookingId: string };
};

export type BookingsStackParamList = {
  MyBookings: undefined;
  BookingDetail: { bookingId: string };
  CreateGame: { bookingId: string };
};

export type GamesStackParamList = {
  GamesList: undefined;
  GameDetail: { gameId: string };
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Bookings: undefined;
  Games: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const BookingsStack = createNativeStackNavigator<BookingsStackParamList>();
const GamesStack = createNativeStackNavigator<GamesStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

const HomeNavigator: React.FC = () => (
  <HomeStack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: '#FFFFFF' },
      headerTitleStyle: { fontWeight: '600' },
    }}
  >
    <HomeStack.Screen name="HomeMain" component={HomeScreen} options={{ title: 'Explore' }} />
    <HomeStack.Screen name="VenueDetail" component={VenueDetailScreen} options={{ title: 'Venue' }} />
    <HomeStack.Screen name="SlotSelection" component={SlotSelectionScreen} options={{ title: 'Select Slot' }} />
    <HomeStack.Screen name="BookingConfirm" component={BookingConfirmScreen} options={{ title: 'Confirm Booking' }} />
    <HomeStack.Screen name="BookingSuccess" component={BookingSuccessScreen} options={{ headerShown: false }} />
  </HomeStack.Navigator>
);

const BookingsNavigator: React.FC = () => (
  <BookingsStack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: '#FFFFFF' },
      headerTitleStyle: { fontWeight: '600' },
    }}
  >
    <BookingsStack.Screen name="MyBookings" component={MyBookingsScreen} options={{ title: 'My Bookings' }} />
    <BookingsStack.Screen name="BookingDetail" component={BookingDetailScreen} options={{ title: 'Booking Details' }} />
    <BookingsStack.Screen name="CreateGame" component={CreateGameScreen} options={{ title: 'Create Game' }} />
  </BookingsStack.Navigator>
);

const GamesNavigator: React.FC = () => (
  <GamesStack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: '#FFFFFF' },
      headerTitleStyle: { fontWeight: '600' },
    }}
  >
    <GamesStack.Screen name="GamesList" component={GamesListScreen} options={{ title: 'Games' }} />
    <GamesStack.Screen name="GameDetail" component={GameDetailScreen} options={{ title: 'Game Details' }} />
  </GamesStack.Navigator>
);

const ProfileNavigator: React.FC = () => (
  <ProfileStack.Navigator
    screenOptions={{
      headerStyle: { backgroundColor: '#FFFFFF' },
      headerTitleStyle: { fontWeight: '600' },
    }}
  >
    <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} options={{ title: 'Profile' }} />
    <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
  </ProfileStack.Navigator>
);

const TabIcon: React.FC<{ name: string; focused: boolean }> = ({ name, focused }) => (
  <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>{name}</Text>
);

const MainNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#6366F1',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: { paddingTop: 8, paddingBottom: 8, height: 60 },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '500' },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeNavigator}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="🏠" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingsNavigator}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="📅" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Games"
        component={GamesNavigator}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="🎮" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileNavigator}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="👤" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabIcon: {
    fontSize: 20,
  },
  tabIconFocused: {
    transform: [{ scale: 1.1 }],
  },
});

export default MainNavigator;
