import { NavigationContainer } from "@react-navigation/native";
import { StyleSheet } from "react-native";
import RootStack from "./src/navigation/RootStack";
import { AuthProvider } from "./src/context/AuthContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ChatWrapper from "./src/components/ChatProvider";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});


export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <ChatWrapper>
          <NavigationContainer>
            <RootStack />
          </NavigationContainer>
        </ChatWrapper>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
