import { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import api from "../../lib/api";

export default function RegisterScreen() {
  const navigation = useNavigation();
  const auth = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  if (!auth) {
    return (
      <View style={styles.centered}>
        <Text>Something went wrong (AuthContext is null)</Text>
      </View>
    );
  }

  const { setLogin,streamClient,login } = auth;

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRegister = async () => {
    const { name, email, password } = formData;

    if (!name || !email || !password) {
      Alert.alert("Error", "Semua kolom wajib diisi!");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post("/register", formData);
      const { token, user } = response.data;
      await login(token, user); 
      setLogin(true);
      Alert.alert("Berhasil", "Akun berhasil dibuat!.");
    } catch (error: any) {
      console.error("Register error:", error);
      Alert.alert(
        "Gagal Daftar",
        error?.response?.data?.message || "Terjadi kesalahan"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daftar Akun</Text>

      <TextInput
        placeholder="Nama"
        value={formData.name}
        onChangeText={(text) => handleChange("name", text)}
        style={styles.input}
      />

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
        onPress={handleRegister}
        style={styles.button}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Mendaftar..." : "Daftar"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login" as never)}>
        <Text style={styles.link}>Sudah punya akun? Login</Text>
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
