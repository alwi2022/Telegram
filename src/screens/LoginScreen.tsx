import { useContext, useState } from "react";
import {
  Text,
  TextInput,
  View,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { AuthContext } from "../context/AuthContext";
import api from "../../lib/api";
import { registerForPushNotificationsAsync } from "../../lib/notifications/registerForPushNotifications";
import { useNavigation } from "@react-navigation/native";

export default function LoginScreen() {
  const auth = useContext(AuthContext);

  const navigation = useNavigation();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  if (!auth) {
    return (
      <View style={styles.centered}>
        <Text>Something went wrong (AuthContext is null)</Text>
      </View>
    );
  }

  const { setLogin, streamClient, login } = auth;

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert("Error", "Email dan password wajib diisi!");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("/login", formData);
      const { token, user ,videoToken } = response.data;
      

      await SecureStore.setItemAsync("token", token);
      await SecureStore.setItemAsync("userId", response.data.user.id); // <-- karena kamu pakai `id`, bukan `_id`
      await SecureStore.setItemAsync("user", JSON.stringify(user));
      await login(token, user,videoToken); // pakai fungsi login dari AuthContext

      const expoPushToken = await registerForPushNotificationsAsync();
      if (expoPushToken) {
        await api.post("/save-push-token", {
          userId: user.id,
          token: expoPushToken,
        });
      }

      setLogin(true);
    } catch (error: any) {
      console.log("Login error:", error);
      Alert.alert(
        "Login gagal",
        error?.response?.data?.message || "Terjadi kesalahan"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        placeholder="Email"
        value={formData.email}
        onChangeText={(text) => handleChange("email", text)}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Password"
        value={formData.password}
        onChangeText={(text) => handleChange("password", text)}
        style={styles.input}
        secureTextEntry
      />

      <TouchableOpacity
        onPress={handleLogin}
        style={styles.button}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Logging in..." : "Login"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate("Register" as never)}
      >
        <Text style={styles.link}>Belum punya akun? Daftar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    marginBottom: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  button: {
    backgroundColor: "#00C300",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  link: {
    color: "#007AFF",
    textAlign: "center",
    marginTop: 16,
  },
});
