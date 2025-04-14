// UserListScreen.tsx
import { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { streamClient } from "../../lib/stream/StreamClient";
import * as SecureStore from "expo-secure-store";

import api from "../../lib/api";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/RootStack";
interface User {
  _id: string;
  name: string;
  email: string;
}

export default function UserListScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  type NavigationProp = StackNavigationProp<RootStackParamList>;

  const navigation = useNavigation<NavigationProp>();


  useEffect(() => {
    // Ambil user dari localStorage atau API-mu
    const getUser = async () => {
      try {
        const token = await SecureStore.getItemAsync("token")
        console.log("User ID:", token); // ✅ cek apakah token muncul

        if (!token) {
          console.error("User ID not found in SecureStore");
          return;
        }

        const res = await api.get("/me", {
          headers: {
            Authorization: `Bearer ${token}`, // kirim user ID sebagai Bearer token
          },
        });

        console.log("Current User:", res.data); // ✅ cek apakah currentUser muncul
        if (!res.data) {    
            console.error("Current user not found in response");
            return;
            }

        setCurrentUser(res.data);
      } catch (err) {
        console.error("Error fetching current user:", err);
      }
    };

    getUser();
  }, []);

  useEffect(() => {
    if (currentUser?._id) {
      fetchUsers();
    }
  }, [currentUser]);

  const fetchUsers = async () => {
    try {
        const token = await SecureStore.getItemAsync("token");
        if (!token) {
            console.error("Token not found in SecureStore");
            return;
          }
      
          const res = await api.get("/users", {
            headers: {
              Authorization: `Bearer ${token}`, // ✅ token dari login
            },
          });
          
    setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const startChat = async (targetUser: any) => {
    const members = [currentUser._id, targetUser._id];

    const uniqueChannelId = members.sort().join("-");

try {
    const channel = streamClient.channel("messaging", uniqueChannelId, {
        members,
      });
  
      await channel.watch();
      if (!channel.id) {
        console.log("Channel ID is null or undefined");
        return;
      }
      console.log("✅ Navigating to chat:", channel.id);
  
      navigation.navigate("Chat", { channelId: channel.id });
} catch (error) {
    console.log("Error starting chat:", error);

}

  
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity onPress={() => startChat(item)} style={styles.item}>
      <Text style={styles.text}>{item.name}</Text>
      <Text style={styles.sub}>{item.email}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  item: { padding: 16, borderBottomWidth: 1, borderColor: "#eee" },
  text: { fontSize: 18, fontWeight: "bold" },
  sub: { color: "#888" },
});
