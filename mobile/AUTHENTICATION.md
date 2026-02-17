⏺ Authentication Flow - Step by Step

Step 1: App Launches

app/\_layout.tsx (Root Layout)

// Line 7: Keep splash screen visible  
 SplashScreen.preventAutoHideAsync();

// Line 22-37: Root component  
 export default function RootLayout() {  
 const [isReady, setIsReady] = useState(false);

    useEffect(() => {
      // Line 27-29: Wait 100ms for store to initialize, then hide splash
      const timer = setTimeout(() => {
        setIsReady(true);
        SplashScreen.hideAsync();
      }, 100);
      return () => clearTimeout(timer);
    }, []);

    // Line 35-37: Show nothing while initializing
    if (!isReady) {
      return null;  // Splash screen still visible
    }

    // Line 39-52: Render app with providers
    return (
      <QueryClientProvider client={queryClient}>
        <Stack>
          <Stack.Screen name="(tabs)" />  {/* ← Default route */}
          <Stack.Screen name="auth" />
          ...
        </Stack>
      </QueryClientProvider>
    );

}

What happens:

1. Splash screen stays visible
2. Wait 100ms for Zustand store to initialize
3. Hide splash, render <Stack> navigator
4. Expo Router automatically navigates to (tabs) (first screen defined)  


---

Step 2: Tabs Layout - Auth Guard

app/(tabs)/\_layout.tsx

export default function TabsLayout() {  
 // Line 5-6: Read auth state from Zustand store  
 const isAuthenticated = useAuthStore((state) => state.isAuthenticated);  
 const isLoading = useAuthStore((state) => state.isLoading);

    // Line 8-10: Still loading? Show nothing
    if (isLoading) {
      return null;
    }

    // Line 12-14: NOT authenticated? Redirect to login
    if (!isAuthenticated) {
      return <Redirect href="/auth/phone" />;  // ← KEY LINE
    }

    // Line 16-56: Authenticated? Show tab navigator
    return (
      <Tabs>
        <Tabs.Screen name="index" />      {/* Home */}
        <Tabs.Screen name="bookings" />   {/* My Bookings */}
        <Tabs.Screen name="games" />      {/* Games */}
        <Tabs.Screen name="profile" />    {/* Profile */}
      </Tabs>
    );

}

What happens:

1. Read isAuthenticated from Zustand (initially false)
2. Since isAuthenticated = false, return <Redirect href="/auth/phone" />
3. User sees Phone Input screen  


---

Step 3: Auth Store - Initial State

src/store/authStore.ts

export const useAuthStore = create<AuthState>()((set) => ({  
 // Line 20-24: Initial state (user not logged in)  
 accessToken: null,  
 refreshToken: null,  
 user: null,  
 isAuthenticated: false, // ← Starts as false  
 isLoading: false,

    // Line 26-34: Called after successful OTP verification
    login: (tokens, user) => {
      set({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user,
        isAuthenticated: true,  // ← Changes to true
        isLoading: false,
      });
    },

    // Line 36-44: Called on logout
    logout: () => {
      set({
        accessToken: null,
        refreshToken: null,
        user: null,
        isAuthenticated: false,  // ← Back to false
        isLoading: false,
      });
    },
    ...

}));

---

Step 4: Login Flow

app/auth/phone.tsx → app/auth/otp.tsx

Phone Screen:  
 // User enters phone, clicks Continue  
 requestOtp(phone, {  
 onSuccess: () => {  
 // Navigate to OTP screen with phone param  
 router.push({ pathname: '/auth/otp', params: { phone } });  
 },  
 });

OTP Screen:  
 // User enters 6-digit OTP  
 verifyOtp(  
 { phone, otp: code },  
 {  
 onSuccess: () => {  
 // Navigate to main app (replaces auth stack)  
 router.replace('/(tabs)');  
 },  
 }  
 );

But wait! How does isAuthenticated become true?

---

Step 5: useVerifyOtp Hook

src/api/hooks/useAuth.ts

export function useVerifyOtp() {  
 const { login } = useAuthStore(); // ← Get login function from store

    return useMutation({
      mutationFn: async ({ phone, otp }) => {
        // Call API
        const response = await apiClient.post<ApiResponse<AuthResponse>>(
          '/auth/otp/verify',
          { phone, otp }
        );
        return extractData(response);
      },

      // Line 26-35: Called automatically when API succeeds
      onSuccess: (data) => {
        // ← THIS updates the store!
        login(
          {
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            expiresIn: data.expiresIn,
          },
          data.user
        );
      },
    });

}

What happens:

1. API returns { accessToken, refreshToken, user }
2. onSuccess calls login() from Zustand store
3. Store updates: isAuthenticated = true
4. Components re-render automatically (Zustand reactivity)  


---

Complete Flow Diagram

┌─────────────────────────────────────────────────────────────────┐  
 │ APP LAUNCH │  
 └─────────────────────────────────────────────────────────────────┘  
 │  
 ▼  
 ┌─────────────────────────────────────────────────────────────────┐  
 │ app/\_layout.tsx │  
 │ • Show splash screen │  
 │ • Wait 100ms for store init │  
 │ • Render <Stack> with (tabs) as default │  
 └─────────────────────────────────────────────────────────────────┘  
 │  
 ▼  
 ┌─────────────────────────────────────────────────────────────────┐  
 │ app/(tabs)/\_layout.tsx │  
 │ │  
 │ const isAuthenticated = useAuthStore(state => state.isAuth...) │  
 │ │  
 │ if (!isAuthenticated) { │  
 │ return <Redirect href="/auth/phone" /> ──────────┐ │  
 │ } │ │  
 │ │ │  
 │ return <Tabs>...</Tabs> ◄───────────────────────────┼──────┐ │  
 └───────────────────────────────────────────────────────┼──────┼──┘  
 │ │  
 ┌──────────────────────────┘ │  
 ▼ │  
 ┌─────────────────────────────────────────────────────────────────┐  
 │ app/auth/phone.tsx │  
 │ │  
 │ Enter phone → requestOtp() → Navigate to /auth/otp │  
 └─────────────────────────────────────────────────────────────────┘  
 │  
 ▼  
 ┌─────────────────────────────────────────────────────────────────┐  
 │ app/auth/otp.tsx │  
 │ │  
 │ Enter OTP → verifyOtp() │  
 │ │ │  
 │ ▼ │  
 │ ┌─────────────────────────────────────────────────────────┐ │  
 │ │ useVerifyOtp (src/api/hooks/useAuth.ts) │ │  
 │ │ │ │  
 │ │ onSuccess: (data) => { │ │  
 │ │ login(tokens, user); ← Updates Zustand store │ │  
 │ │ } │ │  
 │ └─────────────────────────────────────────────────────────┘ │  
 │ │ │  
 │ ▼ │  
 │ router.replace('/(tabs)') │  
 └─────────────────────────────────────────────────────────────────┘  
 │  
 ▼  
 ┌─────────────────────────────────────────────────────────────────┐  
 │ Zustand Store (src/store/authStore.ts) │  
 │ │  
 │ Before login(): After login(): │  
 │ { { │  
 │ isAuthenticated: false → isAuthenticated: true │  
 │ accessToken: null → accessToken: "eyJ..." │  
 │ user: null → user: { id, name, phone } │  
 │ } } │  
 └─────────────────────────────────────────────────────────────────┘  
 │  
 │ Zustand triggers re-render  
 ▼  
 ┌─────────────────────────────────────────────────────────────────┐  
 │ app/(tabs)/\_layout.tsx (RE-RENDERS) │  
 │ │  
 │ isAuthenticated = true ← Now true! │  
 │ │  
 │ // Skip redirect, show tabs │  
 │ return <Tabs> │  
 │ <Tabs.Screen name="index" /> ← Home │  
 │ <Tabs.Screen name="bookings" /> ← My Bookings │  
 │ <Tabs.Screen name="games" /> ← Games │  
 │ <Tabs.Screen name="profile" /> ← Profile │  
 │ </Tabs> │  
 └──────────────────────────────────────────────────────────────────┘

---

Logout Flow

// app/(tabs)/profile.tsx  
 const logout = useAuthStore((state) => state.logout);

const handleLogout = async () => {  
 await logout(); // ← Sets isAuthenticated = false  
 router.replace('/auth/phone'); // ← Navigate to login  
 };

When logout() is called:

1. Store resets: isAuthenticated = false
2. router.replace('/auth/phone') navigates to login
3. If user tries to access /(tabs), the auth guard redirects them again  


---

Key Concepts  
 ┌───────────────┬─────────────────────────────────────────────────────────────────────┐  
 │ Concept │ How it works │  
 ├───────────────┼─────────────────────────────────────────────────────────────────────┤  
 │ Auth Guard │ (tabs)/\_layout.tsx checks isAuthenticated before rendering tabs │  
 ├───────────────┼─────────────────────────────────────────────────────────────────────┤  
 │ Redirect │ <Redirect href="..." /> from expo-router navigates programmatically │  
 ├───────────────┼─────────────────────────────────────────────────────────────────────┤  
 │ State Updates │ Zustand store updates trigger React re-renders │  
 ├───────────────┼─────────────────────────────────────────────────────────────────────┤  
 │ Reactivity │ useAuthStore(state => state.isAuthenticated) subscribes to changes │  
 ├───────────────┼─────────────────────────────────────────────────────────────────────┤  
 │ Token Storage │ Currently in-memory only (tokens lost on app restart) │  
 └───────────────┴─────────────────────────────────────────────────────────────────────┘

---

Current Limitation

Tokens are not persisted! When app restarts, isAuthenticated resets to false.

To fix, you'd add persistence:  
 import AsyncStorage from '@react-native-async-storage/async-storage';  
 import { persist } from 'zustand/middleware';

export const useAuthStore = create(  
 persist(  
 (set) => ({ ... }),  
 { name: 'auth-storage', storage: AsyncStorage }  
 )  
 );
