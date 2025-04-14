// src/screens/ChatScreen.tsx
import { useContext, useEffect, useState } from "react";
import { Channel, MessageList, MessageInput } from "stream-chat-expo";
import { streamClient } from "../../lib/stream/StreamClient";
import { useRoute } from "@react-navigation/native";
import { View, Text, StyleSheet } from "react-native";
import { AuthContext } from "../context/AuthContext";
import api from "../../lib/api";

export default function ChatScreen() {
  const route = useRoute();
  const auth = useContext(AuthContext);
  const params = route.params as { channelId?: string } | undefined;
  const channelId = params?.channelId;
  if (!auth) {
    return (
      <View style={styles.centered}>
        <Text>Something went wrong (AuthContext is null)</Text>
      </View>
    );
  }

 

  const [channel, setChannel] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      if (!streamClient.userID) {
        console.warn("⏳ Waiting for connectUser...");
        return;
      }

      if (!channelId) {
        console.warn("⚠️ channelId is missing!");
        return;
      }

      try {
        const _channel = streamClient.channel("messaging", channelId, {
          members: [streamClient.userID],
        });
        await _channel.watch();
        _channel.on("message.new", async (event) => {
          if (!event.message) return;
          const message = event.message;
          

          const senderId = message.user?.id;
          const members = _channel.state.members;
          const memberIds = Object.keys(members);
          const receiverId = memberIds.find((id) => id !== senderId);

          // Kirim notifikasi jika kita yang ngirim
          if (senderId === streamClient.userID && receiverId) {
            try {
              await api.post("/send-notification", {
                userId: receiverId,
                title: message.user?.name || "New Message",
                body: message.text || "You have a new message!",
              });
            } catch (error) {
              console.log("❌ Gagal kirim notifikasi:",error);
            }
          }
        });

        setChannel(_channel);
      } catch (err) {
        console.log("❌ Error starting chat:", err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [channelId, streamClient.userID]);

  if (loading || !channel) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading chat...</Text>
      </View>
    );
  }

  return (
    <Channel channel={channel}>
      <MessageList />
      <MessageInput />
    </Channel>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
