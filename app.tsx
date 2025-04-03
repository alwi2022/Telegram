import { StatusBar, Text, View } from "react-native";
import { StyleSheet  } from "react-native";

export default function App(){
    return(
        <View style={styles.container}>
            <Text>
                Hello World! This is my first React Native app.
            </Text>
        </View>
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