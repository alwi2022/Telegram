import { Redirect } from "expo-router";
import { StatusBar, Text, View } from "react-native";
import { StyleSheet  } from "react-native";

export default function HomeScreen(){
    return(
    <Redirect href={'/(home)/(tabs)'} />
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
});