import { useRouter, useLocalSearchParams } from "expo-router";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CheckoutScreen from "../src/screens/CheckoutScreen";
import { Colors } from "../src/theme";

export default function CheckoutRoute() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ planId: string; planName: string; price: string }>();
  return (
    <View style={s.container}>
      <View style={[s.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Text style={s.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={s.headerTitle}>Checkout</Text>
        <View style={{ width: 60 }} />
      </View>
      <CheckoutScreen
        planId={params.planId}
        planName={params.planName}
        price={params.price}
        navigation={{ goBack: () => router.back() }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: { paddingVertical: 8, width: 60 },
  backText: { color: Colors.primary, fontSize: 14, fontWeight: "700" },
  headerTitle: { color: "#fff", fontSize: 15, fontWeight: "800", textTransform: "uppercase", letterSpacing: 1 },
});
