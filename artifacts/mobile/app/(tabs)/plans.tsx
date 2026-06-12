import { useRouter } from "expo-router";
import PlansScreen from "../../src/screens/PlansScreen";

export default function PlansRoute() {
  const router = useRouter();
  const navigation = {
    navigate: (name: string) => {
      const map: Record<string, string> = {
        Profile: "/(auth)/login",
        Support: "/support",
        Notifications: "/notifications",
        Checkout: "/checkout",
      };
      const route = map[name];
      if (route) router.push(route as any);
    },
  };
  return <PlansScreen navigation={navigation} />;
}
