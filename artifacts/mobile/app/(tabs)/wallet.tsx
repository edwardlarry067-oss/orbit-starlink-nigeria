import { useRouter } from "expo-router";
import WalletScreen from "../../src/screens/WalletScreen";

export default function WalletRoute() {
  const router = useRouter();
  const navigation = {
    navigate: (name: string) => {
      const map: Record<string, string> = {
        Profile: "/(auth)/login",
        Support: "/support",
        Plans: "/(tabs)/plans",
      };
      const route = map[name];
      if (route) router.push(route as any);
    },
  };
  return <WalletScreen navigation={navigation} />;
}
