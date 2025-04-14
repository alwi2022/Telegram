import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { RouteProp } from "@react-navigation/native";
import HomeScreen from "../screens/HomeScreen";
import ChatScreen from "../screens/ChatScreen";
import ProfileScreen from "../screens/ProfileScreen";
import UserListScreen from "../screens/UserListScreen";

type TabParamList = {
  Home: undefined;
  Chat: undefined;
    Users: undefined; // ✅ ini benar
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({
        route,
      }: {
        route: RouteProp<TabParamList, keyof TabParamList>
      }) => ({
        headerShown: true,
        tabBarActiveTintColor: "#00C300",
        tabBarInactiveTintColor: "gray",
        tabBarIcon: ({
          color,
          size,
        }: {
          color: string;
          size: number;
        }) => {
          let iconName: string = "";

          if (route.name === "Home") {
            iconName = "home-outline";
          } else if (route.name === "Chat") {
            iconName = "chatbubble-ellipses-outline";
          } else if (route.name === "Profile") {
            iconName = "person-outline";
          }
            else if (route.name === "Users") {
                iconName = "people-outline"; // ✅ ini benar
            }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Users" component={UserListScreen} /> 
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      
    </Tab.Navigator>
  );
}
