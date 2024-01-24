import { View, Text, Pressable, StyleSheet } from 'react-native'

function DateButton(props) {
    return <Pressable onPress={props.onClick}>
        <View style={styles.button}>
            <Text style={styles.text}>{props.day}</Text>
        </View>
    </Pressable>
}

export default DateButton

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#198DE4',
        padding: 10,
        width: 110,
        alignItems: 'center',
        borderRadius: 5,
    },

    text: {
        fontSize: 17,
        color: 'white'
    }
})