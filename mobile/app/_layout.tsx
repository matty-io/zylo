import "../global.css";
import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Give time for store rehydration
    const timer = setTimeout(() => {
      setIsReady(true);
      SplashScreen.hideAsync();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth" />
        <Stack.Screen
          name="venue/[id]"
          options={{ headerShown: true, title: "Venue" }}
        />
        <Stack.Screen
          name="booking/slots"
          options={{ headerShown: true, title: "Select Slot" }}
        />
        <Stack.Screen
          name="booking/confirm"
          options={{ headerShown: true, title: "Confirm Booking" }}
        />
        <Stack.Screen
          name="booking/success"
          options={{ headerShown: true, title: "Booking Confirmed" }}
        />
        <Stack.Screen
          name="game/[id]"
          options={{ headerShown: true, title: "Game Details" }}
        />
        <Stack.Screen
          name="game/create"
          options={{ headerShown: true, title: "Create Game" }}
        />
      </Stack>
    </QueryClientProvider>
  );
}
