import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "./src/contexts/AuthContext";
import AppNavigator from "./src/navigation/AppNavigator";
import SplashScreenComponent from "./src/screens/SplashScreen";

export default function App() {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <AuthProvider>
      <StatusBar style="light" backgroundColor="#000" />
      {splashDone
        ? <AppNavigator />
        : <SplashScreenComponent onFinish={() => setSplashDone(true)} />
      }
    </AuthProvider>
  );
}
