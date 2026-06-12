import { useRouter } from "expo-router";
import ProfileScreen from "../../src/screens/ProfileScreen";

export default function ProfileRoute() {
  const router = useRouter();
  const navigation = {
    navigate: (name: string) => {
      const map: Record<string, string> = {
        Login: "/(auth)/login",
        Register: "/(auth)/register",
        Support: "/support",
        Notifications: "/notifications",
        Plans: "/(tabs)/plans",
      };
      const route = map[name];
      if (route) router.push(route as any);
    },
    goBack: () => router.back(),
  };
  return <ProfileScreen navigation={navigation} />;
}
