// src/components/ChatWrapper.tsx
import { OverlayProvider, Chat } from "stream-chat-expo";
import { ReactNode, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { View, Text, ActivityIndicator } from "react-native";

interface Props {
  children: ReactNode;
}

export default function ChatWrapper({ children }: Props) {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    return null;
  }

  const { streamClient, isLogin } = authContext;

  // Saat logout → render langsung children untuk ke rootStack login screen
  if (!isLogin) {
    return <>{children}</>;
  }

  // Saat user belum terset, tampilkan loading
  if (!streamClient.userID) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text>Connecting to chat...</Text>
      </View>
    );
  }

  // Saat login dan client siap
  return (
    <OverlayProvider>
      <Chat client={streamClient}>
        {children}
      </Chat>
    </OverlayProvider>
  );
}
