import { createStackNavigator } from "@react-navigation/stack";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import * as SecureStore from "expo-secure-store";
import { Text, View } from "react-native";
import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import ChatScreen from "../screens/ChatScreen";
import TabNavigator from "./TabNavigator";
import UserListScreen from "../screens/UserListScreen";

export type RootStackParamList = {
  Main: undefined;
  Home: undefined;
  Profile: undefined;
  Chat: { channelId: string }; // ini penting!
  Users: undefined;
  Login: undefined;
  VideoHome: undefined;
  CallScreen: undefined;
  Register: undefined;
};

export default function RootStack() {
  const Stack = createStackNavigator<RootStackParamList>();

  const auth = useContext(AuthContext);

  if (!auth) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Something went wrong (AuthContext is null)</Text>
      </View>
    );
  }

  const { isLogin, setLogin } = auth;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      const token = await SecureStore.getItemAsync("token");
      console.log("✅ TOKEN:", token);
      console.log("✅ isLogin:", isLogin);

      if (token) {
        setLogin(true);
      } else {
        setLogin(false);
      }
      setLoading(false);
    };

    checkLogin();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#00C300" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "bold" },
        headerShown: false,
      }}
    >
      {isLogin ? (
        <>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Users" component={UserListScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
