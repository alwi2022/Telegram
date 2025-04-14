import { Text, View, Button, Alert, StyleSheet } from "react-native";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function ProfileScreen() {
  const auth = useContext(AuthContext);

  if (!auth) {
    return (
      <View style={styles.centered}>
        <Text>Something went wrong (AuthContext is null)</Text>
      </View>
    );
  }

  const { logout } = auth;

  const handleLogout = async () => {
    try {
      await logout(); // 👈 Panggil langsung dari context
    } catch (error) {
      Alert.alert("Logout gagal", "Terjadi kesalahan saat logout.");
      console.error("Logout error:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text>Profile Screen</Text>
      <Button title="Logout" onPress={handleLogout} color="#FF3B30" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
