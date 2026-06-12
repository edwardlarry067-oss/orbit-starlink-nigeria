import React from "react";
import { View, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { useAuth } from "../contexts/AuthContext";
import { Colors } from "../theme";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";

import HomeScreen from "../screens/HomeScreen";
import PlansScreen from "../screens/PlansScreen";
import DashboardScreen from "../screens/DashboardScreen";
import WalletScreen from "../screens/WalletScreen";
import ProfileScreen from "../screens/ProfileScreen";
import SupportScreen from "../screens/SupportScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import LoginScreen from "../screens/LoginScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HEADER_OPTS = {
  headerStyle: { backgroundColor: "#000", borderBottomWidth: 1, borderBottomColor: "#1a1a2e" },
  headerTitleStyle: { color: "#fff", fontWeight: "900" as const, fontSize: 13, letterSpacing: 2 },
  headerTintColor: Colors.primary,
};

const TAB_ICON_MAP: Record<string, string> = {
  Home: "🏠",
  Plans: "📡",
  Wallet: "🪙",
  Dashboard: "📊",
  Profile: "👤",
};

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.45 }}>
      {TAB_ICON_MAP[name] ?? "●"}
    </Text>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...HEADER_OPTS,
        tabBarStyle: {
          backgroundColor: "#000",
          borderTopWidth: 1,
          borderTopColor: "#1a1a2e",
          height: 72,
          paddingBottom: 12,
          paddingTop: 4,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: "#4b5563",
        tabBarLabelStyle: { fontSize: 9, fontWeight: "700", letterSpacing: 0.8, textTransform: "uppercase" },
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: "ORBITFUTURE" }} />
      <Tab.Screen name="Plans" component={PlansScreen} options={{ title: "SERVICE PLANS" }} />
      <Tab.Screen name="Wallet" component={WalletScreen} options={{ title: "ORBIT WALLET" }} />
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: "DASHBOARD" }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: "PROFILE" }} />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ ...HEADER_OPTS, headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}

function RootStack() {
  return (
    <Stack.Navigator screenOptions={{ ...HEADER_OPTS, presentation: "card" }}>
      <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: "NOTIFICATIONS" }} />
      <Stack.Screen name="Support" component={SupportScreen} options={{ title: "SUPPORT" }} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.bg }}>
        <LoadingSpinner message="Loading…" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootStack />
    </NavigationContainer>
  );
}
