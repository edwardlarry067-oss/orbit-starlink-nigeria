import { useRouter } from "expo-router";
import HomeScreen from "../../src/screens/HomeScreen";

export default function HomeRoute() {
  const router = useRouter();
  const navigation = {
    navigate: (name: string) => {
      const map: Record<string, string> = {
        Plans: "/(tabs)/plans",
        Wallet: "/(tabs)/wallet",
        Dashboard: "/(tabs)/dashboard",
        Profile: "/(tabs)/profile",
        Notifications: "/notifications",
        Support: "/support",
        Login: "/(auth)/login",
      };
      const route = map[name];
      if (route) router.push(route as any);
    },
  };
  return <HomeScreen navigation={navigation} />;
}
