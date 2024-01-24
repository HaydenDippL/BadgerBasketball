import { View, Pressable, Text, StyleSheet } from 'react-native'

function PreferenceButton(props) {
    
    return <Pressable onPress={props.onClick}>
        <View style={[
            styles.colorBtn,
            { borderColor: props.color },
            props.active ? { backgroundColor : props.color } : null
        ]}>
            <Text>{props.children}</Text>
        </View>
    </Pressable>
}

export default PreferenceButton

const styles = StyleSheet.create({
    colorBtn: {
        backgroundColor: 'white',
        borderWidth: 6,
        borderRadius: 5,
        color: 'black',
        padding: 10,
        paddingHorizontal: 15,
        marginVertical: 1,
        marginHorizontal: 5,
        fontSize: 18,
        transitionProperty: 'background-color, transform',
        transitionDuration: 250,
        transitionTimingFunction: 'ease-in-out',
        alignItems: 'center',
        justifyContent: 'center'
    }
})