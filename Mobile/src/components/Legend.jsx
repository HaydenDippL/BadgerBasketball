import PreferenceButton from "./PreferenceButton"
import { colors } from '../helper/colors'
import { StyleSheet, View } from "react-native"

function Legend(props) {

    // Sets or unsets the pressed preference
    function handleClick(preference, style) {
        props.setPreferences(p => {
            return {
                ...p,
                [preference]: !p[preference]
            }
        })
    }

    return <View style={styles.vbox}>
        {
            Object.entries(props.preferences).map(([preference, active]) => {
                return <PreferenceButton key={preference}
                    active={active}
                    color={colors[preference]}
                    onClick={() => {handleClick(preference)}}>
                    {preference}
                </PreferenceButton>
            })
        }
    </View>
}

export default Legend

const styles = StyleSheet.create({
    vbox: {
        flexDirection: 'column',
    }
})