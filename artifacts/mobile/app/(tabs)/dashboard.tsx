import { useRouter } from "expo-router";
import DashboardScreen from "../../src/screens/DashboardScreen";

export default function DashboardRoute() {
  const router = useRouter();
  const navigation = {
    navigate: (name: string) => {
      const map: Record<string, string> = {
        Profile: "/(auth)/login",
        Plans: "/(tabs)/plans",
        Wallet: "/(tabs)/wallet",
        Support: "/support",
        Notifications: "/notifications",
      };
      const route = map[name];
      if (route) router.push(route as any);
    },
  };
  return <DashboardScreen navigation={navigation} />;
}
