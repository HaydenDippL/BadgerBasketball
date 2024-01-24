import { Button, View, Text, StyleSheet } from 'react-native'

import { num_to_day, pretty_date } from '../helper/date'

import DateButton from './DateButton'

function DateForm(props) {

    // This function sets the date to yesterday
    function yesterday() {
        let yest = new Date(props.date)
        yest.setDate(yest.getDate() - 1)
        props.setDate(yest)
    }

    // This function sets the date to tomorrow
    function tomorrow() {
        let tomor = new Date(props.date)
        tomor.setDate(tomor.getDate() + 1)
        props.setDate(tomor)
    }

    // return <View style={styles.hbox}>
    //     <Button
    //         onPress={yesterday}
    //         title={String(num_to_day[(props.date.getDay() + 6) % 7])}
    //     />
    //     <Text style={styles.text}>{pretty_date(props.date)}</Text>
    //     <Button
    //         onPress={tomorrow}
    //         title={String(num_to_day[(props.date.getDay() + 1) % 7])}
    //     />
    // </View>

    return <View style={styles.hbox}>
        <DateButton onClick={yesterday} day={String(num_to_day[(props.date.getDay() + 6) % 7])}/>
        <Text style={styles.text}>{pretty_date(props.date)}</Text>
        <DateButton onClick={tomorrow} day={String(num_to_day[(props.date.getDay() + 1) % 7])}/>
    </View>
}

export default DateForm

const styles = StyleSheet.create({
    hbox: {
        flexDirection: 'row',
        // alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
        justifyContent: 'center'
    },

    text: {
        fontSize: 15,
        width: 150,
        textAlign: 'center',
        marginHorizontal: 5
    }
})