import React, { useState, useEffect } from "react";
import { Stack, Redirect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "../src/contexts/AuthContext";
import SplashScreenComponent from "../src/screens/SplashScreen";

function RootLayoutInner() {
  const { user, loading } = useAuth();
  const [animDone, setAnimDone] = useState(false);
  const [ready, setReady] = useState(false);

  // Show splash until BOTH the 2-second animation AND the auth check complete
  useEffect(() => {
    if (animDone && !loading) setReady(true);
  }, [animDone, loading]);

  if (!ready) {
    return <SplashScreenComponent onFinish={() => setAnimDone(true)} />;
  }

  // Route based on JWT state after splash
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="notifications" options={{ presentation: "modal", animation: "slide_from_right" }} />
        <Stack.Screen name="support" options={{ presentation: "modal", animation: "slide_from_right" }} />
        <Stack.Screen name="checkout" options={{ presentation: "modal", animation: "slide_from_bottom" }} />
      </Stack>
      {!user && <Redirect href="/(auth)/login" />}
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" backgroundColor="#000" />
        <RootLayoutInner />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
