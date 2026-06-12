import { useRouter } from "expo-router";
import RegisterScreen from "../../src/screens/RegisterScreen";

export default function RegisterRoute() {
  const router = useRouter();
  const navigation = {
    navigate: (name: string) => {
      if (name === "Login") router.push("/(auth)/login");
    },
    goBack: () => router.back(),
  };
  return <RegisterScreen navigation={navigation} />;
}
