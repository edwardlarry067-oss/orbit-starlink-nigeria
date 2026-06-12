import { useRouter } from "expo-router";
import LoginScreen from "../../src/screens/LoginScreen";

export default function LoginRoute() {
  const router = useRouter();
  const navigation = {
    navigate: (name: string) => {
      if (name === "Register") router.push("/(auth)/register");
    },
  };
  return <LoginScreen navigation={navigation} />;
}
