import { Tabs } from "expo-router";
import { Colors } from "react-native/Libraries/NewAppScreen";
import {FontAwesome5} from '@expo/vector-icons'


export default function TabsNavigator(){
    return(
       <>
        <Tabs>
            <Tabs.Screen name="index"
            options={{title:'Chats',
                tabBarIcon:({size,color})=>(
                <FontAwesome5 name="facebook-messenger" size={size} color={color} />
                ),
            }}/>
            <Tabs.Screen name="profile"
            options={{title:'profile',
                tabBarIcon:({size,color})=>(
                <FontAwesome5 name="user-alt" size={size} color={color} />
                ),
            }}/>
        </Tabs>
       </>
    )
}